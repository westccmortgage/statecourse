import { DatabaseUnreachable, EdgeDatabase } from '../_shared/core-v2/deno-postgres.ts';
import { DenoFetchTransport } from '../_shared/core-v2/deno-transport.ts';
import { assembleVoiceRuntime, type EnvironmentReader } from '../../../workers/core-v2-voice/runtime-assembly.ts';
import { createVoiceTurnHandler, json } from './handler.ts';
import { VoiceContractError } from '../../../workers/core-v2-voice/contracts.ts';

export { createVoiceTurnHandler } from './handler.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response> | Response): void;
};

export function createAssembledVoiceTurnHandler(options: {
  env: EnvironmentReader;
  connect?: typeof EdgeDatabase.connect;
}) {
  return async (request: Request): Promise<Response> => {
    if (options.env('CORE_V2_VOICE_ENABLED') !== 'true') {
      return json(503, { error: 'voice_endpoint_disabled' });
    }
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
    const databaseUrl = options.env('CORE_V2_VOICE_DB_URL');
    if (!databaseUrl) return json(503, { error: 'voice_persistence_not_configured' });
    try {
      const parsed = new URL(databaseUrl);
      if (!parsed.password || !parsed.username) return json(503, { error: 'voice_persistence_not_configured' });
    } catch { return json(503, { error: 'voice_persistence_not_configured' }); }
    let db: EdgeDatabase | null = null;
    try {
      db = await (options.connect ?? EdgeDatabase.connect)(databaseUrl, 'core-v2-voice-turn');
      const role = await db.query(`select coalesce((select rolcanlogin and not rolsuper and not rolcreatedb
        and not rolcreaterole and not rolreplication and not rolbypassrls
        and pg_has_role(current_user, 'core_v2_voice_runtime', 'member')
        and (select count(*) = 1 and bool_and(granted.rolname = 'core_v2_voice_runtime')
          from pg_auth_members membership join pg_roles granted on granted.oid = membership.roleid
          where membership.member = login.oid)
        from pg_roles login where login.rolname = current_user), false) as authorized`);
      if (role.rows[0]?.authorized !== true && role.rows[0]?.authorized !== 'true') {
        return json(503, { error: 'voice_persistence_role_not_authorized' });
      }
      const runtime = assembleVoiceRuntime({
        db,
        env: options.env,
        transport: (config) => new DenoFetchTransport({ config }),
      });
      return await createVoiceTurnHandler({
        resolveCredential: runtime.resolveCredential,
        replayStore: runtime.repository.replayStore,
        orchestrator: runtime.orchestrator,
        admit: async (authority, callIdentity, ownerIdentityDigest) => {
          if (ownerIdentityDigest !== runtime.admissionPolicy.ownerIdentityDigest) {
            throw new VoiceContractError('admission_owner_mismatch', 'caller is not the bound suite owner');
          }
          return runtime.repository.claimAdmission(
            authority, callIdentity, ownerIdentityDigest, runtime.admissionPolicy,
          );
        },
        claimStream: async (authority, callIdentity, suiteId) => {
          if (suiteId !== runtime.admissionPolicy.suiteId) {
            throw new VoiceContractError('admission_policy_changed', 'suite is not active');
          }
          return runtime.repository.claimAdmissionStream(authority, callIdentity, suiteId);
        },
      })(request);
    } catch (error) {
      if (error instanceof DatabaseUnreachable) return json(503, { error: 'voice_persistence_unavailable' });
      return json(503, { error: 'voice_service_not_configured' });
    } finally {
      if (db) try { await db.end(); } catch { /* request result is already decided */ }
    }
  };
}

if (typeof Deno !== 'undefined') {
  Deno.serve(createAssembledVoiceTurnHandler({ env: (name) => Deno.env.get(name) }));
}
