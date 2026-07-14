import type { RequestsRepository } from './requestsRepository';
import { LocalRequestsRepository } from './localRequestsRepository';
import { ApiRequestsRepository } from './apiRequestsRepository';
import { isSupabaseConfigured } from './supabaseClient';

export type { RequestsRepository, NewRequestInput } from './requestsRepository';

// Single source of truth for how the app talks to its "backend". When
// `.env` has real Supabase credentials (`VITE_SUPABASE_URL` /
// `VITE_SUPABASE_ANON_KEY`), the app talks to Supabase — including
// realtime cross-device sync via `subscribe()`. Otherwise it falls back to
// the localStorage-backed demo repository, so the app keeps working
// out-of-the-box with no backend configured. No component or context
// outside this file knows or cares which one is active.
export const requestsRepository: RequestsRepository = isSupabaseConfigured ? new ApiRequestsRepository() : new LocalRequestsRepository();

export { isSupabaseConfigured } from './supabaseClient';
