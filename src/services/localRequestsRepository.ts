import type { GuestRequest, RequestStatus } from '@/types';
import { initialRequests } from '@/data/requests';
import { generateId } from '@/utils/id';
import type { NewRequestInput, RequestsRepository } from './requestsRepository';

const STORAGE_KEY = 'hotelflow_requests_v1';

// ---------------------------------------------------------------------------
// Pure transforms. Kept free of any storage/React concerns so they can be
// unit-tested in isolation, and reused as-is if the app ever moves this
// logic server-side.
// ---------------------------------------------------------------------------

export function createRequestEntity(input: NewRequestInput): GuestRequest {
  const now = new Date().toISOString();
  return {
    id: generateId('req'),
    roomNumber: input.roomNumber,
    categoryId: input.categoryId,
    categorySlug: input.categorySlug,
    categoryName: input.categoryName,
    icon: input.icon,
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: 'received',
    department: input.department,
    createdAt: now,
    updatedAt: now,
    estimatedMinutes: input.estimatedMinutes,
    guestNote: input.guestNote,
    callBeforeArrival: input.callBeforeArrival,
    items: input.items,
    totalPrice: input.totalPrice,
    history: [{ status: 'received', timestamp: now, actor: 'Misafir' }],
  };
}

export function applyAssignStaff(request: GuestRequest, staffId: string, staffName: string): GuestRequest {
  const now = new Date().toISOString();
  const status = request.status === 'received' ? 'assigned' : request.status;
  return {
    ...request,
    assignedStaffId: staffId,
    assignedStaffName: staffName,
    status,
    updatedAt: now,
    history: [...request.history, { status, timestamp: now, actor: staffName, note: `${staffName} atandı` }],
  };
}

export function applyUpdateStatus(request: GuestRequest, status: RequestStatus, note?: string, actor?: string): GuestRequest {
  const now = new Date().toISOString();
  return {
    ...request,
    status,
    updatedAt: now,
    staffNote: note ?? request.staffNote,
    history: [...request.history, { status, timestamp: now, actor, note }],
  };
}

export function applyAddNote(request: GuestRequest, note: string, actor: string): GuestRequest {
  const now = new Date().toISOString();
  return {
    ...request,
    staffNote: note,
    updatedAt: now,
    history: [...request.history, { status: request.status, timestamp: now, actor, note }],
  };
}

export function applyCancel(request: GuestRequest, reason: string, actor: string): GuestRequest {
  const now = new Date().toISOString();
  return {
    ...request,
    status: 'cancelled',
    cancelReason: reason,
    updatedAt: now,
    history: [...request.history, { status: 'cancelled', timestamp: now, actor, note: reason }],
  };
}

export function applySetGuestPresent(request: GuestRequest, present: boolean): GuestRequest {
  return { ...request, guestPresent: present };
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

export function loadRequestsFromStorage(): GuestRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialRequests;
    const parsed = JSON.parse(raw) as GuestRequest[];
    if (!Array.isArray(parsed) || parsed.length === 0) return initialRequests;
    return parsed;
  } catch {
    return initialRequests;
  }
}

function persist(requests: GuestRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function notFound(id: string): never {
  throw new Error(`GuestRequest not found: ${id}`);
}

/**
 * `localStorage`-backed implementation of `RequestsRepository`. Used as the
 * app's data source today. Every method is `async` purely to match the
 * interface contract — there is no real I/O latency here — which means a
 * future `ApiRequestsRepository` (real `fetch` calls) can drop in without
 * touching `AppDataContext` or any component.
 *
 * TODO(backend): implement `ApiRequestsRepository implements RequestsRepository`
 * against the real hotel API and swap the export in `src/services/index.ts`.
 */
export class LocalRequestsRepository implements RequestsRepository {
  private requests: GuestRequest[] = loadRequestsFromStorage();

  async list(): Promise<GuestRequest[]> {
    return this.requests;
  }

  async create(input: NewRequestInput): Promise<GuestRequest> {
    const created = createRequestEntity(input);
    this.requests = [created, ...this.requests];
    persist(this.requests);
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
    localStorage.removeItem(STORAGE_KEY);
    this.requests = initialRequests;
    return this.requests;
  }

  private async mutate(id: string, transform: (request: GuestRequest) => GuestRequest): Promise<GuestRequest> {
    const existing = this.requests.find((r) => r.id === id);
    if (!existing) notFound(id);
    const updated = transform(existing);
    this.requests = this.requests.map((r) => (r.id === id ? updated : r));
    persist(this.requests);
    return updated;
  }
}
