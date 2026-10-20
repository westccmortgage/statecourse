import type { VoiceCredentialResolver, VoiceServiceCredential } from '../../supabase/functions/_shared/core-v2/voice-auth.ts';
import type { RuntimeConfig, ProviderConfiguration, ModelPrice } from '../core-v2-runtime/runtime-config.ts';
import { configurationProblems, networkAuthorizationProblems } from '../core-v2-runtime/runtime-config.ts';
import type { HttpTransport } from '../core-v2-runtime/transport/transport.ts';
import { GroundedToolRegistry } from './grounded-tools.ts';
import { VoiceOrchestrator } from './orchestrator.ts';
import { AnthropicVoiceWireAdapter } from './anthropic-wire-adapter.ts';
import { ConfiguredVoiceProvider, type VoiceWireAdapter } from './provider-text-adapter.ts';
import { PostgresVoiceRepository, type VoiceQueryable } from './postgres-store.ts';
import { type VoiceBudgetPolicy } from './budget.ts';

export type EnvironmentReader = (name: string) => string | undefined;

export type VoiceAdmissionPolicy = Readonly<{
  protocol: 'core-v2.voice-admission-policy.1';
  suiteId: string;
  ownerIdentityDigest: string;
  expiresAt: string;
  maximumCalls: number;
  maximumVoiceWebhooks: number;
  maximumCallSeconds: number;
  maximumTurns: number;
  maximumBrainRequests: number;
  maximumTtsCharacters: number;
}>;

const requiredText = (value: string | undefined, code: string): string => {
  const text = value?.trim() ?? '';
  if (!text) throw new Error(code);
  return text;
};

const finite = (value: unknown, code: string, integer = false): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
    throw new Error(code);
  }
  return value;
};

function objectFromJson(value: string | undefined, code: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(requiredText(value, code));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(code);
    return parsed as Record<string, unknown>;
  } catch { throw new Error(code); }
}

export function loadVoiceBudgetPolicy(env: EnvironmentReader): VoiceBudgetPolicy {
  const raw = objectFromJson(env('CORE_V2_VOICE_BUDGET_POLICY'), 'voice_budget_policy_invalid');
  if (raw.currency !== 'USD') throw new Error('voice_budget_policy_invalid');
  const policy: VoiceBudgetPolicy = {
    currency: 'USD',
    authorizedMaximumUsd: finite(raw.authorizedMaximumUsd, 'voice_budget_policy_invalid'),
    maximumPerTurnUsd: finite(raw.maximumPerTurnUsd, 'voice_budget_policy_invalid'),
    maximumProviderCallsPerTurn: finite(raw.maximumProviderCallsPerTurn, 'voice_budget_policy_invalid', true),
    maximumProviderCallsPerCall: finite(raw.maximumProviderCallsPerCall, 'voice_budget_policy_invalid', true),
    maximumTurnsPerCall: finite(raw.maximumTurnsPerCall, 'voice_budget_policy_invalid', true),
    maximumInputTokensPerTurn: finite(raw.maximumInputTokensPerTurn, 'voice_budget_policy_invalid', true),
    maximumOutputTokensPerTurn: finite(raw.maximumOutputTokensPerTurn, 'voice_budget_policy_invalid', true),
    maximumInputTokensPerCall: finite(raw.maximumInputTokensPerCall, 'voice_budget_policy_invalid', true),
    maximumOutputTokensPerCall: finite(raw.maximumOutputTokensPerCall, 'voice_budget_policy_invalid', true),
    maximumReasoningTokensPerCall: finite(raw.maximumReasoningTokensPerCall, 'voice_budget_policy_invalid', true),
    wallClockDeadlineMs: finite(raw.wallClockDeadlineMs, 'voice_budget_policy_invalid', true),
  };
  if (policy.maximumProviderCallsPerTurn < 1 || policy.maximumProviderCallsPerTurn > 8
    || policy.maximumProviderCallsPerCall < 1 || policy.maximumProviderCallsPerCall > 8_000
    || policy.maximumProviderCallsPerCall > policy.maximumProviderCallsPerTurn * policy.maximumTurnsPerCall
    || policy.maximumTurnsPerCall < 1 || policy.maximumTurnsPerCall > 1000
    || policy.wallClockDeadlineMs < 1 || policy.wallClockDeadlineMs > 86_400_000
    || policy.maximumPerTurnUsd > policy.authorizedMaximumUsd) {
    throw new Error('voice_budget_policy_invalid');
  }
  return Object.freeze(policy);
}

export function loadVoiceAdmissionPolicy(env: EnvironmentReader): VoiceAdmissionPolicy {
  const raw = objectFromJson(env('CORE_V2_VOICE_ADMISSION_POLICY'), 'voice_admission_policy_invalid');
  const policy: VoiceAdmissionPolicy = Object.freeze({
    protocol: raw.protocol as VoiceAdmissionPolicy['protocol'],
    suiteId: String(raw.suiteId ?? ''),
    ownerIdentityDigest: String(raw.ownerIdentityDigest ?? ''),
    expiresAt: String(raw.expiresAt ?? ''),
    maximumCalls: finite(raw.maximumCalls, 'voice_admission_policy_invalid', true),
    maximumVoiceWebhooks: finite(raw.maximumVoiceWebhooks, 'voice_admission_policy_invalid', true),
    maximumCallSeconds: finite(raw.maximumCallSeconds, 'voice_admission_policy_invalid', true),
    maximumTurns: finite(raw.maximumTurns, 'voice_admission_policy_invalid', true),
    maximumBrainRequests: finite(raw.maximumBrainRequests, 'voice_admission_policy_invalid', true),
    maximumTtsCharacters: finite(raw.maximumTtsCharacters, 'voice_admission_policy_invalid', true),
  });
  const expiry = Date.parse(policy.expiresAt);
  if (policy.protocol !== 'core-v2.voice-admission-policy.1'
    || !/^[A-Za-z0-9_.:-]{1,80}$/.test(policy.suiteId)
    || !/^[a-f0-9]{64}$/.test(policy.ownerIdentityDigest)
    || !Number.isFinite(expiry)
    || new Date(expiry).toISOString() !== policy.expiresAt
    || policy.maximumCalls < 1 || policy.maximumCalls > 10
    || policy.maximumVoiceWebhooks < policy.maximumCalls || policy.maximumVoiceWebhooks > 100
    || policy.maximumCallSeconds < 30 || policy.maximumCallSeconds > 1800
    || policy.maximumTurns < 1 || policy.maximumTurns > 60
    || policy.maximumBrainRequests < 1 || policy.maximumBrainRequests > 100
    || policy.maximumTtsCharacters < 500 || policy.maximumTtsCharacters > 100000) {
    throw new Error('voice_admission_policy_invalid');
  }
  return policy;
}

export function loadVoiceCredential(env: EnvironmentReader): VoiceServiceCredential {
  const credential = {
    keyId: requiredText(env('CORE_V2_VOICE_KEY_ID'), 'voice_credential_not_configured'),
    secret: requiredText(env('CORE_V2_VOICE_HMAC_SECRET'), 'voice_credential_not_configured'),
    callerApp: requiredText(env('CORE_V2_VOICE_CALLER_APP'), 'voice_credential_not_configured'),
    tenantId: requiredText(env('CORE_V2_VOICE_TENANT_ID'), 'voice_credential_not_configured'),
  };
  if (!/^[A-Za-z0-9_.:-]{1,80}$/.test(credential.keyId) || credential.secret.length < 32
    || credential.callerApp.length > 128 || credential.tenantId.length > 128) {
    throw new Error('voice_credential_not_configured');
  }
  return credential;
}

export function environmentCredentialResolver(env: EnvironmentReader): VoiceCredentialResolver {
  const credential = loadVoiceCredential(env);
  return async (keyId: string) => keyId === credential.keyId ? credential : null;
}

export function loadVoiceRuntimeConfig(env: EnvironmentReader, policy: VoiceBudgetPolicy): {
  runtime: RuntimeConfig;
  configuration: ProviderConfiguration;
  adapter: VoiceWireAdapter;
} {
  const declaration = objectFromJson(env('CORE_V2_VOICE_PROVIDER_REGISTRY'), 'voice_provider_registry_invalid');
  if (!Array.isArray(declaration.providers) || !Array.isArray(declaration.pricing)) {
    throw new Error('voice_provider_registry_invalid');
  }
  const providerId = requiredText(env('CORE_V2_VOICE_PROVIDER_ID'), 'voice_provider_not_selected');
  const providers = declaration.providers as ProviderConfiguration[];
  const pricing = declaration.pricing as ModelPrice[];
  const configuration = providers.find((candidate) => candidate?.providerId === providerId);
  if (!configuration) throw new Error('voice_provider_not_selected');
  const runtime: RuntimeConfig = {
    providers: [configuration],
    pricing: pricing.filter((price) => price?.providerId === providerId),
    dispatcherName: 'core-v2-voice-turn',
    authorization: {
      providerNetworkFlag: env('CORE_V2_VOICE_ALLOW_PROVIDER_NETWORK') === 'true',
      environmentGate: env('CORE_V2_ALLOW_PAID_CALLS') === 'true',
      maximumAuthorizedCost: policy.authorizedMaximumUsd,
      currency: policy.currency,
      providerAllowlist: [providerId],
      modelAllowlist: [configuration.defaultModel],
    },
  };
  const problems = [...configurationProblems(runtime), ...networkAuthorizationProblems(runtime)];
  if (problems.length) throw new Error(`voice_provider_not_authorized:${problems.join('; ')}`);
  const adapter = providerId === 'anthropic' ? new AnthropicVoiceWireAdapter() : null;
  if (!adapter) throw new Error('voice_provider_protocol_not_supported');
  return { runtime, configuration, adapter };
}

export function assembleVoiceRuntime(options: {
  db: VoiceQueryable;
  env: EnvironmentReader;
  transport: HttpTransport | ((runtime: RuntimeConfig) => HttpTransport);
}): {
  resolveCredential: VoiceCredentialResolver;
  repository: PostgresVoiceRepository;
  orchestrator: VoiceOrchestrator;
  admissionPolicy: VoiceAdmissionPolicy;
} {
  const policy = loadVoiceBudgetPolicy(options.env);
  const admissionPolicy = loadVoiceAdmissionPolicy(options.env);
  const configured = loadVoiceRuntimeConfig(options.env, policy);
  if (configured.configuration.maximumInputTokens > policy.maximumInputTokensPerTurn
    || configured.configuration.maximumOutputTokens > policy.maximumOutputTokensPerTurn
    || configured.configuration.maximumInputTokens > policy.maximumInputTokensPerCall
    || configured.configuration.maximumOutputTokens > policy.maximumOutputTokensPerCall
    || (configured.configuration.capabilities[configured.configuration.defaultModel]?.thinking !== 'none'
      && configured.configuration.maximumOutputTokens > policy.maximumReasoningTokensPerCall)) {
    throw new Error('voice_provider_token_ceiling_exceeds_budget');
  }
  const repository = new PostgresVoiceRepository(options.db, policy);
  const transport = typeof options.transport === 'function'
    ? options.transport(configured.runtime)
    : options.transport;
  const provider = new ConfiguredVoiceProvider({
    configuration: configured.configuration,
    runtime: configured.runtime,
    adapter: configured.adapter,
    transport,
    environment: options.env,
  });
  if (!Number.isFinite(provider.maximumCostUsd)
    || provider.maximumCostUsd * policy.maximumProviderCallsPerTurn > policy.maximumPerTurnUsd) {
    throw new Error('voice_provider_ceiling_exceeds_budget');
  }
  return {
    resolveCredential: environmentCredentialResolver(options.env),
    repository,
    admissionPolicy,
    orchestrator: new VoiceOrchestrator({
      store: repository,
      budget: repository,
      provider,
      tools: new GroundedToolRegistry(),
    }),
  };
}
