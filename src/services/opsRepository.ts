// ---------------------------------------------------------------------------
// Operations repository — direct Supabase access for every domain besides
// guest_requests (rooms, staff, roles, reservations, breakfast, QR tokens,
// notifications, room status logs). Unlike `requestsRepository`, there is no
// local/demo fallback here: the app now requires a configured Supabase
// project to run (see `App.tsx`'s setup-required screen when
// `isSupabaseConfigured` is false). Every function throws a clear error if
// called without Supabase configured, which should never happen in practice
// since the app gates rendering on `isSupabaseConfigured` first.
// ---------------------------------------------------------------------------
import type { ActivityLogEntry, ApprovalRequest, BreakfastItem, HotelInfo, PriceChangeLog, Reservation, Role, RoleId, Room, RoomStatusLog, Staff } from '@/types';
import type { ServiceItemWithGroup } from '@/data/serviceItems';
import { supabase } from './supabaseClient';
import {
  rowToRoom,
  roomToRowPatch,
  type RoomRow,
  rowToStaff,
  staffToRowPatch,
  type StaffRow,
  rowToRole,
  type RoleRow,
  rowToReservation,
  reservationToRow,
  type ReservationRow,
  rowToBreakfastItem,
  breakfastItemToRow,
  type BreakfastItemRow,
  rowToRoomStatusLog,
  roomStatusLogToRow,
  type RoomStatusLogRow,
  rowToServiceItem,
  serviceItemToRow,
  serviceItemToRowPatch,
  type ServiceItemRow,
  rowToHotelInfo,
  hotelInfoToRowPatch,
  type HotelInfoRow,
  rowToPriceChangeLog,
  priceChangeLogToRow,
  type PriceChangeLogRow,
  rowToApprovalRequest,
  approvalRequestToRow,
  approvalRequestToRowPatch,
  type ApprovalRequestRow,
  rowToActivityLog,
  activityLogToRow,
  type ActivityLogRow,
} from './domainMappers';

function client() {
  if (!supabase) throw new Error('Supabase yapılandırılmamış — .env dosyasında VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY eksik.');
  return supabase;
}

// ---- rooms ----------------------------------------------------------------
export async function listRooms(): Promise<Room[]> {
  const { data, error } = await client().from('rooms').select('*').order('number');
  if (error) throw error;
  return (data as RoomRow[]).map(rowToRoom);
}

export async function updateRoom(id: string, patch: Partial<Room>): Promise<void> {
  const { error } = await client().from('rooms').update(roomToRowPatch(patch)).eq('id', id);
  if (error) throw error;
}

export function subscribeRooms(onChange: () => void) {
  const channel = client()
    .channel('rooms-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, onChange)
    .subscribe();
  return () => client().removeChannel(channel);
}

// ---- staff ------------------------------------------------------------
export async function listStaff(): Promise<Staff[]> {
  const { data, error } = await client().from('staff').select('*').order('name');
  if (error) throw error;
  return (data as StaffRow[]).map(rowToStaff);
}

export async function insertStaff(row: StaffRow): Promise<void> {
  const { error } = await client().from('staff').insert(row);
  if (error) throw error;
}

export async function updateStaff(id: string, patch: Partial<Staff>): Promise<void> {
  const { error } = await client().from('staff').update(staffToRowPatch(patch)).eq('id', id);
  if (error) throw error;
}

// ---- roles ------------------------------------------------------------
export async function listRoles(): Promise<Record<RoleId, Role>> {
  const { data, error } = await client().from('roles').select('*');
  if (error) throw error;
  const roles = (data as RoleRow[]).map(rowToRole);
  return roles.reduce((acc, r) => ({ ...acc, [r.id]: r }), {} as Record<RoleId, Role>);
}

export async function updateRolePermissions(roleId: RoleId, permissions: Role['permissions']): Promise<void> {
  const { error } = await client().from('roles').update({ permissions }).eq('id', roleId);
  if (error) throw error;
}

// ---- reservations -------------------------------------------------------
export async function listReservations(): Promise<Reservation[]> {
  const { data, error } = await client().from('reservations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ReservationRow[]).map(rowToReservation);
}

export async function insertReservation(reservation: Reservation): Promise<void> {
  const { error } = await client().from('reservations').insert(reservationToRow(reservation));
  if (error) throw error;
}

export async function cancelReservationRow(id: string): Promise<void> {
  const { error } = await client().from('reservations').update({ cancelled: true }).eq('id', id);
  if (error) throw error;
}

export function subscribeReservations(onChange: () => void) {
  const channel = client()
    .channel('reservations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, onChange)
    .subscribe();
  return () => client().removeChannel(channel);
}

// ---- breakfast items ----------------------------------------------------
export async function listBreakfastItems(): Promise<BreakfastItem[]> {
  const { data, error } = await client().from('breakfast_items').select('*').order('name');
  if (error) throw error;
  return (data as BreakfastItemRow[]).map(rowToBreakfastItem);
}

export async function insertBreakfastItem(item: BreakfastItem): Promise<void> {
  const { error } = await client().from('breakfast_items').insert(breakfastItemToRow(item));
  if (error) throw error;
}

export async function updateBreakfastItem(id: string, patch: Partial<BreakfastItem>): Promise<void> {
  const row: Record<string, unknown> = {};
  if ('available' in patch) row.available = patch.available;
  if ('stock' in patch) row.stock = patch.stock;
  if ('prepStatus' in patch) row.prep_status = patch.prepStatus;
  if ('price' in patch) row.price = patch.price ?? null;
  if ('updatedAt' in patch) row.updated_at = patch.updatedAt;
  const { error } = await client().from('breakfast_items').update(row).eq('id', id);
  if (error) throw error;
}

export function subscribeBreakfastItems(onChange: () => void) {
  const channel = client()
    .channel('breakfast-items-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'breakfast_items' }, onChange)
    .subscribe();
  return () => client().removeChannel(channel);
}

// ---- QR tokens ----------------------------------------------------------
export async function listQrTokens(): Promise<Record<string, string>> {
  const { data, error } = await client().from('qr_tokens').select('room_number, token');
  if (error) throw error;
  return Object.fromEntries((data as { room_number: string; token: string }[]).map((r) => [r.room_number, r.token]));
}

export async function upsertQrToken(roomNumber: string, token: string): Promise<void> {
  const { error } = await client().from('qr_tokens').upsert({ room_number: roomNumber, token, generated_at: new Date().toISOString() });
  if (error) throw error;
}

export function subscribeQrTokens(onChange: () => void) {
  const channel = client()
    .channel('qr-tokens-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'qr_tokens' }, onChange)
    .subscribe();
  return () => client().removeChannel(channel);
}

// ---- room status logs -----------------------------------------------------
export async function listRoomStatusLogs(): Promise<RoomStatusLog[]> {
  const { data, error } = await client().from('room_status_logs').select('*').order('timestamp', { ascending: false }).limit(200);
  if (error) throw error;
  return (data as RoomStatusLogRow[]).map(rowToRoomStatusLog);
}

export async function insertRoomStatusLog(log: RoomStatusLog): Promise<void> {
  const { error } = await client().from('room_status_logs').insert(roomStatusLogToRow(log));
  if (error) throw error;
}

// ---- service items (menü / hizmet kataloğu) --------------------------------
export async function listServiceItems(): Promise<ServiceItemWithGroup[]> {
  const { data, error } = await client().from('service_items').select('*').order('name');
  if (error) throw error;
  return (data as ServiceItemRow[]).map(rowToServiceItem);
}

export async function insertServiceItem(item: ServiceItemWithGroup): Promise<void> {
  const { error } = await client().from('service_items').insert(serviceItemToRow(item));
  if (error) throw error;
}

export async function updateServiceItem(id: string, patch: Partial<ServiceItemWithGroup>): Promise<void> {
  const { error } = await client().from('service_items').update(serviceItemToRowPatch(patch)).eq('id', id);
  if (error) throw error;
}

export function subscribeServiceItems(onChange: () => void) {
  const channel = client()
    .channel('service-items-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_items' }, onChange)
    .subscribe();
  return () => client().removeChannel(channel);
}

// ---- hotel info (tekil satır) ---------------------------------------------
export async function getHotelInfo(): Promise<HotelInfo> {
  const { data, error } = await client().from('hotel_info').select('*').eq('id', 1).single();
  if (error) throw error;
  return rowToHotelInfo(data as HotelInfoRow);
}

export async function updateHotelInfo(patch: Partial<HotelInfo>): Promise<void> {
  const { error } = await client().from('hotel_info').update(hotelInfoToRowPatch(patch)).eq('id', 1);
  if (error) throw error;
}

// ---- price change logs -----------------------------------------------------
export async function listPriceChangeLogs(): Promise<PriceChangeLog[]> {
  const { data, error } = await client().from('price_change_logs').select('*').order('timestamp', { ascending: false }).limit(200);
  if (error) throw error;
  return (data as PriceChangeLogRow[]).map(rowToPriceChangeLog);
}

export async function insertPriceChangeLog(log: PriceChangeLog): Promise<void> {
  const { error } = await client().from('price_change_logs').insert(priceChangeLogToRow(log));
  if (error) throw error;
}

// ---- approval requests ------------------------------------------------------
export async function listApprovalRequests(): Promise<ApprovalRequest[]> {
  const { data, error } = await client().from('approval_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ApprovalRequestRow[]).map(rowToApprovalRequest);
}

export async function insertApprovalRequest(req: ApprovalRequest): Promise<void> {
  const { error } = await client().from('approval_requests').insert(approvalRequestToRow(req));
  if (error) throw error;
}

export async function updateApprovalRequest(id: string, patch: Partial<ApprovalRequest>): Promise<void> {
  const { error } = await client().from('approval_requests').update(approvalRequestToRowPatch(patch)).eq('id', id);
  if (error) throw error;
}

// ---- activity log (birleşik işlem geçmişi) ----------------------------------
export async function listActivityLog(): Promise<ActivityLogEntry[]> {
  const { data, error } = await client().from('activity_log').select('*').order('timestamp', { ascending: false }).limit(200);
  if (error) throw error;
  return (data as ActivityLogRow[]).map(rowToActivityLog);
}

export async function insertActivityLog(entry: ActivityLogEntry): Promise<void> {
  const { error } = await client().from('activity_log').insert(activityLogToRow(entry));
  if (error) throw error;
}
