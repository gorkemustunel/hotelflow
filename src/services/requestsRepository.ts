import type { Department, GuestRequest, OrderItem, Priority, RequestStatus } from '@/types';

/**
 * Payload for creating a new guest request. Deliberately backend/API shaped
 * (plain data, no client-only fields like `id`/`history` — those are the
 * repository's responsibility to generate) so it can be posted to a real
 * endpoint unchanged.
 */
export interface NewRequestInput {
  roomNumber: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  icon: string;
  title: string;
  description: string;
  priority: Priority;
  department: Department;
  estimatedMinutes?: number;
  guestNote?: string;
  callBeforeArrival?: boolean;
  items?: OrderItem[];
  totalPrice?: number;
}

/**
 * Contract for anything that can persist and mutate guest requests.
 *
 * Every method is async and returns the same shape a REST/GraphQL backend
 * would (either the full collection, or the single mutated entity). This is
 * intentional: `AppDataContext` is written against this interface only, so
 * swapping `localRequestsRepository` for a real `ApiRequestsRepository`
 * (fetch/axios calls to a backend) later is a one-line change — see
 * `src/services/index.ts`.
 */
export interface RequestsRepository {
  list(): Promise<GuestRequest[]>;
  create(input: NewRequestInput): Promise<GuestRequest>;
  assignStaff(id: string, staffId: string, staffName: string): Promise<GuestRequest>;
  updateStatus(id: string, status: RequestStatus, note?: string, actor?: string): Promise<GuestRequest>;
  addNote(id: string, note: string, actor: string): Promise<GuestRequest>;
  cancel(id: string, reason: string, actor: string): Promise<GuestRequest>;
  setGuestPresent(id: string, present: boolean): Promise<GuestRequest>;
  reset(): Promise<GuestRequest[]>;
  /**
   * Optional live-update hook. When a repository is backed by something that
   * can push changes (e.g. Supabase Realtime), it calls `onChange` with the
   * fresh list whenever the underlying data changes anywhere — including
   * from other browsers/devices — and `AppDataContext` re-renders from it.
   * Returns an unsubscribe function. The local/demo repository does not
   * implement this (single browser tab, no external changes to listen for).
   */
  subscribe?(onChange: (requests: GuestRequest[]) => void): () => void;
}
