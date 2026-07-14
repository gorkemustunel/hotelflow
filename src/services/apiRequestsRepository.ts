import type { GuestRequest, RequestStatus } from '@/types';
import { supabase } from './supabaseClient';
import { rowToGuestRequest, guestRequestToRow, type GuestRequestRow } from './mappers';
import { createRequestEntity, applyAssignStaff, applyUpdateStatus, applyAddNote, applyCancel, applySetGuestPresent } from './localRequestsRepository';
import type { NewRequestInput, RequestsRepository } from './requestsRepository';

const TABLE = 'guest_requests';

function notFound(id: string): never {
  throw new Error(`GuestRequest not found: ${id}`);
}

/**
 * Supabase-backed implementation of `RequestsRepository`. Reuses the exact
 * same pure transform functions as `LocalRequestsRepository` (see
 * `localRequestsRepository.ts`) — only the persistence layer differs, so the
 * two repositories are guaranteed to produce identical `GuestRequest`
 * shapes for the rest of the app.
 *
 * Keeps an in-memory cache (`this.requests`) populated by `list()` and kept
 * fresh by `subscribe()`'s Realtime channel, so mutations don't need a
 * read-then-write round trip before applying a transform.
 */
export class ApiRequestsRepository implements RequestsRepository {
  private requests: GuestRequest[] = [];
  private loaded = false;

  private client() {
    if (!supabase) throw new Error('Supabase is not configured — check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env');
    return supabase;
  }

  private async ensureLoaded() {
    if (!this.loaded) await this.list();
  }

  async list(): Promise<GuestRequest[]> {
    const { data, error } = await this.client().from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    this.requests = (data as GuestRequestRow[]).map(rowToGuestRequest);
    this.loaded = true;
    return this.requests;
  }

  async create(input: NewRequestInput): Promise<GuestRequest> {
    const created = createRequestEntity(input);
    const { error } = await this.client().from(TABLE).insert(guestRequestToRow(created));
    if (error) throw error;
    this.requests = [created, ...this.requests];
    return created;
  }

  async assignStaff(id: string, staffId: string, staffName: string): Promise<GuestRequest> {
    return this.mutate(id, (r) => applyAssignStaff(r, staffId, staffName));
  }

  async updateStatus(id: string, status: RequestStatus, note?: string, actor?: string): Promise<GuestRequest> {
    return this.mutate(id, (r) => applyUpdateStatus(r, status, note, actor));
  }

  async addNote(id: string, note: string, actor: string): Promise<GuestRequest> {
    return this.mutate(id, (r) => applyAddNote(r, note, actor));
  }

  async cancel(id: string, reason: string, actor: string): Promise<GuestRequest> {
    return this.mutate(id, (r) => applyCancel(r, reason, actor));
  }

  async setGuestPresent(id: string, present: boolean): Promise<GuestRequest> {
    return this.mutate(id, (r) => applySetGuestPresent(r, present));
  }

  async reset(): Promise<GuestRequest[]> {
    // There is no "seed data" to reset back to on a real backend — this
    // just re-fetches the current server state instead of destroying data.
    return this.list();
  }

  /** Subscribes to Postgres changes on the table and re-fetches on any change. */
  subscribe(onChange: (requests: GuestRequest[]) => void): () => void {
    const channel = this.client()
      .channel('guest_requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
        this.list().then(onChange).catch(() => {});
      })
      .subscribe();

    return () => {
      this.client().removeChannel(channel);
    };
  }

  private async mutate(id: string, transform: (r: GuestRequest) => GuestRequest): Promise<GuestRequest> {
    await this.ensureLoaded();
    const existing = this.requests.find((r) => r.id === id);
    if (!existing) notFound(id);
    const updated = transform(existing);
    const { error } = await this.client().from(TABLE).update(guestRequestToRow(updated)).eq('id', id);
    if (error) throw error;
    this.requests = this.requests.map((r) => (r.id === id ? updated : r));
    return updated;
  }
}
