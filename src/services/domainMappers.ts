// ---------------------------------------------------------------------------
// Row <-> domain-type mappers for every table besides `guest_requests`
// (which has its own `mappers.ts`, kept separate since it's older/richer).
// Table shapes mirror `supabase/schema.sql` — snake_case columns, camelCase
// domain types. Kept in one file since each mapper is a handful of lines.
// ---------------------------------------------------------------------------
import type {
  ActivityLogEntry,
  ApprovalRequest,
  ApprovalStatus,
  AppNotification,
  BreakfastItem,
  HotelInfo,
  PriceChangeLog,
  Reservation,
  Role,
  RoleId,
  Room,
  RoomStatusLog,
  Staff,
} from '@/types';
import type { ServiceItemWithGroup } from '@/data/serviceItems';

// ---- rooms ------------------------------------------------------------
export interface RoomRow {
  id: string;
  number: string;
  floor: number;
  type: Room['type'];
  status: Room['status'];
  guest_name: string | null;
  guest_count: number | null;
  check_in: string | null;
  check_out: string | null;
  last_cleaned_at: string | null;
  notes: string | null;
  occupancy: Room['occupancy'] | null;
  cleaning_status: Room['cleaningStatus'] | null;
  technical_status: Room['technicalStatus'] | null;
}

export function rowToRoom(row: RoomRow): Room {
  return {
    id: row.id,
    number: row.number,
    floor: row.floor,
    type: row.type,
    status: row.status,
    guestName: row.guest_name ?? undefined,
    guestCount: row.guest_count ?? undefined,
    checkIn: row.check_in ?? undefined,
    checkOut: row.check_out ?? undefined,
    lastCleanedAt: row.last_cleaned_at ?? undefined,
    notes: row.notes ?? undefined,
    occupancy: row.occupancy ?? undefined,
    cleaningStatus: row.cleaning_status ?? undefined,
    technicalStatus: row.technical_status ?? undefined,
  };
}

export function roomToRowPatch(patch: Partial<Room>): Partial<RoomRow> {
  const out: Partial<RoomRow> = {};
  if ('status' in patch) out.status = patch.status;
  if ('guestName' in patch) out.guest_name = patch.guestName ?? null;
  if ('guestCount' in patch) out.guest_count = patch.guestCount ?? null;
  if ('checkIn' in patch) out.check_in = patch.checkIn ?? null;
  if ('checkOut' in patch) out.check_out = patch.checkOut ?? null;
  if ('lastCleanedAt' in patch) out.last_cleaned_at = patch.lastCleanedAt ?? null;
  if ('notes' in patch) out.notes = patch.notes ?? null;
  if ('occupancy' in patch) out.occupancy = patch.occupancy ?? null;
  if ('cleaningStatus' in patch) out.cleaning_status = patch.cleaningStatus ?? null;
  if ('technicalStatus' in patch) out.technical_status = patch.technicalStatus ?? null;
  return out;
}

// ---- staff --------------------------------------------------------------
export interface StaffRow {
  id: string;
  role_id: RoleId;
  active: boolean;
  last_action_at: string | null;
  name: string;
  department: Staff['department'];
  role: string;
  initials: string;
  color: string;
  phone: string;
  rating: number;
  completed_today: number;
  active_tasks: number;
  avg_resolution_minutes: number;
  on_duty: boolean;
  is_demo_switch_user: boolean;
}

export function rowToStaff(row: StaffRow): Staff {
  return {
    id: row.id,
    roleId: row.role_id,
    active: row.active,
    lastActionAt: row.last_action_at ?? undefined,
    name: row.name,
    department: row.department,
    role: row.role,
    initials: row.initials,
    color: row.color,
    phone: row.phone,
    rating: row.rating,
    completedToday: row.completed_today,
    activeTasks: row.active_tasks,
    avgResolutionMinutes: row.avg_resolution_minutes,
    onDuty: row.on_duty,
  };
}

export function staffToRowPatch(patch: Partial<Staff>): Partial<StaffRow> {
  const out: Partial<StaffRow> = {};
  if ('roleId' in patch) out.role_id = patch.roleId;
  if ('active' in patch) out.active = patch.active;
  if ('lastActionAt' in patch) out.last_action_at = patch.lastActionAt ?? null;
  if ('name' in patch) out.name = patch.name;
  if ('department' in patch) out.department = patch.department;
  if ('role' in patch) out.role = patch.role;
  if ('initials' in patch) out.initials = patch.initials;
  if ('color' in patch) out.color = patch.color;
  if ('phone' in patch) out.phone = patch.phone;
  if ('onDuty' in patch) out.on_duty = patch.onDuty;
  return out;
}

// ---- roles ----------------------------------------------------------------
export interface RoleRow {
  id: RoleId;
  name: string;
  description: string;
  permissions: Role['permissions'];
}

export function rowToRole(row: RoleRow): Role {
  return { id: row.id, name: row.name, description: row.description, permissions: row.permissions };
}

// ---- reservations -----------------------------------------------------
export interface ReservationRow {
  id: string;
  room_number: string;
  guest_name: string;
  guest_count: number;
  check_in: string;
  check_out: string;
  notes: string | null;
  cancelled: boolean;
  created_by_name: string;
  created_at: string;
}

export function rowToReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    roomNumber: row.room_number,
    guestName: row.guest_name,
    guestCount: row.guest_count,
    checkIn: row.check_in,
    checkOut: row.check_out,
    notes: row.notes ?? undefined,
    cancelled: row.cancelled || undefined,
    createdByName: row.created_by_name,
    createdAt: row.created_at,
  };
}

export function reservationToRow(r: Reservation): ReservationRow {
  return {
    id: r.id,
    room_number: r.roomNumber,
    guest_name: r.guestName,
    guest_count: r.guestCount,
    check_in: r.checkIn,
    check_out: r.checkOut,
    notes: r.notes ?? null,
    cancelled: r.cancelled ?? false,
    created_by_name: r.createdByName,
    created_at: r.createdAt,
  };
}

// ---- breakfast items --------------------------------------------------
export interface BreakfastItemRow {
  id: string;
  name: string;
  description: string;
  allergens: string[];
  category: BreakfastItem['category'];
  stock: BreakfastItem['stock'];
  available: boolean;
  prep_status: BreakfastItem['prepStatus'];
  price: number | null;
  added_by: string;
  updated_at: string;
}

export function rowToBreakfastItem(row: BreakfastItemRow): BreakfastItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    allergens: row.allergens,
    category: row.category,
    stock: row.stock,
    available: row.available,
    prepStatus: row.prep_status,
    price: row.price ?? undefined,
    addedBy: row.added_by,
    updatedAt: row.updated_at,
  };
}

export function breakfastItemToRow(b: BreakfastItem): BreakfastItemRow {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    allergens: b.allergens,
    category: b.category,
    stock: b.stock,
    available: b.available,
    prep_status: b.prepStatus,
    price: b.price ?? null,
    added_by: b.addedBy,
    updated_at: b.updatedAt,
  };
}

// ---- notifications ------------------------------------------------------
export interface NotificationRow {
  id: string;
  audience: AppNotification['audience'];
  room_number: string | null;
  title: string;
  body: string;
  icon: string;
  timestamp: string;
  read: boolean;
  request_id: string | null;
}

export function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    audience: row.audience,
    roomNumber: row.room_number ?? undefined,
    title: row.title,
    body: row.body,
    icon: row.icon,
    timestamp: row.timestamp,
    read: row.read,
    requestId: row.request_id ?? undefined,
  };
}

export function notificationToRow(n: AppNotification): NotificationRow {
  return {
    id: n.id,
    audience: n.audience,
    room_number: n.roomNumber ?? null,
    title: n.title,
    body: n.body,
    icon: n.icon,
    timestamp: n.timestamp,
    read: n.read,
    request_id: n.requestId ?? null,
  };
}

// ---- room status logs -------------------------------------------------
export interface RoomStatusLogRow {
  id: string;
  room_number: string;
  actor_name: string;
  actor_role: RoleId;
  field: RoomStatusLog['field'];
  from_label: string;
  to_label: string;
  timestamp: string;
}

export function rowToRoomStatusLog(row: RoomStatusLogRow): RoomStatusLog {
  return {
    id: row.id,
    roomNumber: row.room_number,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    field: row.field,
    fromLabel: row.from_label,
    toLabel: row.to_label,
    timestamp: row.timestamp,
  };
}

export function roomStatusLogToRow(l: RoomStatusLog): RoomStatusLogRow {
  return {
    id: l.id,
    room_number: l.roomNumber,
    actor_name: l.actorName,
    actor_role: l.actorRole,
    field: l.field,
    from_label: l.fromLabel,
    to_label: l.toLabel,
    timestamp: l.timestamp,
  };
}

// ---- service items (menu/hizmet kataloğu) --------------------------------
export interface ServiceItemRow {
  id: string;
  category_id: string;
  group_name: string;
  name: string;
  description: string;
  price: number;
  currency: ServiceItemWithGroup['currency'];
  image: string;
  available: boolean;
  stock: ServiceItemWithGroup['stock'];
  prep_time_minutes: number;
  department: ServiceItemWithGroup['department'];
  tags: string[] | null;
  updated_by: string | null;
  updated_at: string | null;
}

export function rowToServiceItem(row: ServiceItemRow): ServiceItemWithGroup {
  return {
    id: row.id,
    categoryId: row.category_id,
    group: row.group_name,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    image: row.image,
    available: row.available,
    stock: row.stock,
    prepTimeMinutes: row.prep_time_minutes,
    department: row.department,
    tags: row.tags ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function serviceItemToRow(item: ServiceItemWithGroup): ServiceItemRow {
  return {
    id: item.id,
    category_id: item.categoryId,
    group_name: item.group,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: item.currency,
    image: item.image,
    available: item.available,
    stock: item.stock,
    prep_time_minutes: item.prepTimeMinutes,
    department: item.department,
    tags: item.tags ?? null,
    updated_by: item.updatedBy ?? null,
    updated_at: item.updatedAt ?? null,
  };
}

export function serviceItemToRowPatch(patch: Partial<ServiceItemWithGroup>): Partial<ServiceItemRow> {
  const out: Partial<ServiceItemRow> = {};
  if ('categoryId' in patch) out.category_id = patch.categoryId;
  if ('group' in patch) out.group_name = patch.group;
  if ('name' in patch) out.name = patch.name;
  if ('description' in patch) out.description = patch.description;
  if ('price' in patch) out.price = patch.price;
  if ('currency' in patch) out.currency = patch.currency;
  if ('image' in patch) out.image = patch.image;
  if ('available' in patch) out.available = patch.available;
  if ('stock' in patch) out.stock = patch.stock;
  if ('prepTimeMinutes' in patch) out.prep_time_minutes = patch.prepTimeMinutes;
  if ('department' in patch) out.department = patch.department;
  if ('tags' in patch) out.tags = patch.tags ?? null;
  if ('updatedBy' in patch) out.updated_by = patch.updatedBy ?? null;
  if ('updatedAt' in patch) out.updated_at = patch.updatedAt ?? null;
  return out;
}

// ---- hotel info (tekil satır, id=1) --------------------------------------
export interface HotelInfoRow {
  id: number;
  hotel_name: string;
  tagline: string;
  wifi_name: string;
  wifi_password: string;
  breakfast_hours: string;
  pool_hours: string;
  spa_hours: string;
  restaurant_hours: string;
  check_in_time: string;
  check_out_time: string;
  parking_info: string;
  emergency_numbers: { label: string; number: string }[];
  hotel_rules: string[];
  floor_plan_note: string;
  address: string;
  heritage_title: string;
  heritage_paragraphs: string[];
}

export function rowToHotelInfo(row: HotelInfoRow): HotelInfo {
  return {
    hotelName: row.hotel_name,
    tagline: row.tagline,
    wifiName: row.wifi_name,
    wifiPassword: row.wifi_password,
    breakfastHours: row.breakfast_hours,
    poolHours: row.pool_hours,
    spaHours: row.spa_hours,
    restaurantHours: row.restaurant_hours,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    parkingInfo: row.parking_info,
    emergencyNumbers: row.emergency_numbers,
    hotelRules: row.hotel_rules,
    floorPlanNote: row.floor_plan_note,
    address: row.address,
    heritageTitle: row.heritage_title,
    heritageParagraphs: row.heritage_paragraphs,
  };
}

export function hotelInfoToRowPatch(patch: Partial<HotelInfo>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if ('hotelName' in patch) out.hotel_name = patch.hotelName;
  if ('tagline' in patch) out.tagline = patch.tagline;
  if ('wifiName' in patch) out.wifi_name = patch.wifiName;
  if ('wifiPassword' in patch) out.wifi_password = patch.wifiPassword;
  if ('breakfastHours' in patch) out.breakfast_hours = patch.breakfastHours;
  if ('poolHours' in patch) out.pool_hours = patch.poolHours;
  if ('spaHours' in patch) out.spa_hours = patch.spaHours;
  if ('restaurantHours' in patch) out.restaurant_hours = patch.restaurantHours;
  if ('checkInTime' in patch) out.check_in_time = patch.checkInTime;
  if ('checkOutTime' in patch) out.check_out_time = patch.checkOutTime;
  if ('parkingInfo' in patch) out.parking_info = patch.parkingInfo;
  if ('emergencyNumbers' in patch) out.emergency_numbers = patch.emergencyNumbers;
  if ('hotelRules' in patch) out.hotel_rules = patch.hotelRules;
  if ('floorPlanNote' in patch) out.floor_plan_note = patch.floorPlanNote;
  if ('address' in patch) out.address = patch.address;
  if ('heritageTitle' in patch) out.heritage_title = patch.heritageTitle;
  if ('heritageParagraphs' in patch) out.heritage_paragraphs = patch.heritageParagraphs;
  return out;
}

// ---- price change logs ---------------------------------------------------
export interface PriceChangeLogRow {
  id: string;
  item_id: string;
  item_name: string;
  actor_name: string;
  actor_role: RoleId;
  old_price: number;
  new_price: number;
  timestamp: string;
}

export function rowToPriceChangeLog(row: PriceChangeLogRow): PriceChangeLog {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    oldPrice: row.old_price,
    newPrice: row.new_price,
    timestamp: row.timestamp,
  };
}

export function priceChangeLogToRow(l: PriceChangeLog): PriceChangeLogRow {
  return {
    id: l.id,
    item_id: l.itemId,
    item_name: l.itemName,
    actor_name: l.actorName,
    actor_role: l.actorRole,
    old_price: l.oldPrice,
    new_price: l.newPrice,
    timestamp: l.timestamp,
  };
}

// ---- approval requests ----------------------------------------------------
export interface ApprovalRequestRow {
  id: string;
  type: ApprovalRequest['type'];
  requested_by_name: string;
  requested_by_role: RoleId;
  item_id: string;
  item_name: string;
  old_value: string;
  new_value: string;
  description: string | null;
  status: ApprovalStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by_name: string | null;
}

export function rowToApprovalRequest(row: ApprovalRequestRow): ApprovalRequest {
  return {
    id: row.id,
    type: row.type,
    requestedByName: row.requested_by_name,
    requestedByRole: row.requested_by_role,
    itemId: row.item_id,
    itemName: row.item_name,
    oldValue: row.old_value,
    newValue: row.new_value,
    description: row.description ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
    resolvedByName: row.resolved_by_name ?? undefined,
  };
}

export function approvalRequestToRow(r: ApprovalRequest): ApprovalRequestRow {
  return {
    id: r.id,
    type: r.type,
    requested_by_name: r.requestedByName,
    requested_by_role: r.requestedByRole,
    item_id: r.itemId,
    item_name: r.itemName,
    old_value: r.oldValue,
    new_value: r.newValue,
    description: r.description ?? null,
    status: r.status,
    created_at: r.createdAt,
    resolved_at: r.resolvedAt ?? null,
    resolved_by_name: r.resolvedByName ?? null,
  };
}

export function approvalRequestToRowPatch(patch: Partial<ApprovalRequest>): Partial<ApprovalRequestRow> {
  const out: Partial<ApprovalRequestRow> = {};
  if ('status' in patch) out.status = patch.status;
  if ('resolvedAt' in patch) out.resolved_at = patch.resolvedAt ?? null;
  if ('resolvedByName' in patch) out.resolved_by_name = patch.resolvedByName ?? null;
  return out;
}

// ---- activity log (birleşik işlem geçmişi) -------------------------------
export interface ActivityLogRow {
  id: string;
  actor_name: string;
  actor_role: RoleId;
  description: string;
  timestamp: string;
}

export function rowToActivityLog(row: ActivityLogRow): ActivityLogEntry {
  return {
    id: row.id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    description: row.description,
    timestamp: row.timestamp,
  };
}

export function activityLogToRow(e: ActivityLogEntry): ActivityLogRow {
  return {
    id: e.id,
    actor_name: e.actorName,
    actor_role: e.actorRole,
    description: e.description,
    timestamp: e.timestamp,
  };
}
