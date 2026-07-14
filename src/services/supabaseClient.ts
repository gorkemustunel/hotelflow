import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when `.env` has real Supabase credentials — used to decide whether
 * `src/services/index.ts` wires up `ApiRequestsRepository` or falls back to
 * the local/demo repository. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null;
