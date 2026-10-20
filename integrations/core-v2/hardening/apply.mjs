import {readFile} from 'node:fs/promises';
export const migration=new URL('../storage/supabase/migrations/20261020034702_statecourse_backend_rpc_hardening.sql',import.meta.url);
export async function applyLocalHardening(db){await db.query(await readFile(migration,'utf8'));}
