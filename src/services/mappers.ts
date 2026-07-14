import type { GuestRequest } from '@/types';

/** Row shape as stored in the Supabase `guest_requests` table (snake_case,
 * matching SQL convention) — see the schema in the project README / setup
 * instructions for the `create table` statement this mirrors. */
export interface GuestRequestRow {
  id: string;
  room_number: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  icon: string;
  title: string;
  description: string;
  priority: GuestRequest['priority'];
  status: GuestRequest['status'];
  department: GuestRequest['department'];
  created_at: string;
  updated_at: string;
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  estimated_minutes: number | null;
  guest_note: string | null;
  staff_note: string | null;
  call_before_arrival: boolean | null;
  guest_present: boolean | null;
  items: GuestRequest['items'] | null;
  total_price: number | null;
  history: GuestRequest['history'];
  cancel_reason: string | null;
}

export function rowToGuestRequest(row: GuestRequestRow): GuestRequest {
  return {
    id: row.id,
    roomNumber: row.room_number,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    icon: row.icon,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    department: row.department,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedStaffId: row.assigned_staff_id ?? undefined,
    assignedStaffName: row.assigned_staff_name ?? undefined,
    estimatedMinutes: row.estimated_minutes ?? undefined,
    guestNote: row.guest_note ?? undefined,
    staffNote: row.staff_note ?? undefined,
    callBeforeArrival: row.call_before_arrival ?? undefined,
    guestPresent: row.guest_present ?? undefined,
    items: row.items ?? undefined,
    totalPrice: row.total_price ?? undefined,
    history: row.history ?? [],
    cancelReason: row.cancel_reason ?? undefined,
  };
}

/** Inverse of `rowToGuestRequest`, used when writing full rows (insert / upsert). */
export function guestRequestToRow(r: GuestRequest): GuestRequestRow {
  return {
    id: r.id,
    room_number: r.roomNumber,
    category_id: r.categoryId,
    category_slug: r.categorySlug,
    category_name: r.categoryName,
    icon: r.icon,
    title: r.title,
    description: r.description,
    priority: r.priority,
    status: r.status,
    department: r.department,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    assigned_staff_id: r.assignedStaffId ?? null,
    assigned_staff_name: r.assignedStaffName ?? null,
    estimated_minutes: r.estimatedMinutes ?? null,
    guest_note: r.guestNote ?? null,
    staff_note: r.staffNote ?? null,
    call_before_arrival: r.callBeforeArrival ?? null,
    guest_present: r.guestPresent ?? null,
    items: r.items ?? null,
    total_price: r.totalPrice ?? null,
    history: r.history,
    cancel_reason: r.cancelReason ?? null,
  };
}
