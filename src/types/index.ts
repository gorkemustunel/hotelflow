// ---------------------------------------------------------------------------
// HotelFlow — Core domain types
// Designed to map cleanly onto a future REST/GraphQL backend.
// ---------------------------------------------------------------------------

export type Department =
  | 'housekeeping'
  | 'technical'
  | 'room_service'
  | 'reception'
  | 'spa'
  | 'management'
  | 'kitchen';

export const DEPARTMENT_LABELS: Record<Department, string> = {
  housekeeping: 'Kat Hizmetleri',
  technical: 'Teknik Servis',
  room_service: 'Oda Servisi / Restoran',
  reception: 'Resepsiyon',
  spa: 'Spa & Wellness',
  management: 'Yönetim',
  kitchen: 'Mutfak / Kahvaltı',
};

// ---------------------------------------------------------------------------
// Roles & permissions
// ---------------------------------------------------------------------------

export type RoleId =
  | 'super_admin'
  | 'hotel_manager'
  | 'reception'
  | 'housekeeping'
  | 'technical'
  | 'room_service'
  | 'chef'
  | 'spa';

export const ROLE_LABELS: Record<RoleId, string> = {
  super_admin: 'Super Admin / Otel Sahibi',
  hotel_manager: 'Otel Yöneticisi',
  reception: 'Resepsiyon',
  housekeeping: 'Housekeeping / Temizlik',
  technical: 'Teknik Servis',
  room_service: 'Room Service',
  chef: 'Aşçı / Mutfak Personeli',
  spa: 'Spa Personeli',
};

export type PermissionId =
  | 'view_dashboard'
  | 'manage_rooms'
  | 'update_room_status'
  | 'manage_room_cleaning_status'
  | 'manage_requests'
  | 'assign_requests'
  | 'update_request_status'
  | 'manage_menu'
  | 'edit_prices'
  | 'manage_breakfast_menu'
  | 'add_breakfast_item'
  | 'toggle_item_availability'
  | 'manage_staff'
  | 'manage_roles'
  | 'view_reports'
  | 'manage_qr_codes'
  | 'manage_hotel_settings'
  | 'manage_reservations';

export const PERMISSION_LABELS: Record<PermissionId, string> = {
  view_dashboard: 'Dashboard ve raporları görüntüleme',
  manage_rooms: 'Oda bilgilerini yönetme',
  update_room_status: 'Oda doluluk durumunu değiştirme',
  manage_room_cleaning_status: 'Oda temizlik durumunu değiştirme',
  manage_requests: 'Misafir taleplerini görüntüleme/yönetme',
  assign_requests: 'Talepleri personele atama/yönlendirme',
  update_request_status: 'Talep/sipariş durumunu güncelleme',
  manage_menu: 'Menü ve hizmetleri yönetme',
  edit_prices: 'Ürün/hizmet fiyatlarını değiştirme',
  manage_breakfast_menu: 'Kahvaltı menüsünü yönetme',
  add_breakfast_item: 'Kahvaltıya yeni ürün ekleme',
  toggle_item_availability: 'Ürünleri aktif/pasif yapma',
  manage_staff: 'Personel ekleme/çıkarma/düzenleme',
  manage_roles: 'Rol ve yetkileri yönetme',
  view_reports: 'Raporları görüntüleme',
  manage_qr_codes: 'QR kodlarını yönetme',
  manage_hotel_settings: 'Otel ayarlarını değiştirme',
  manage_reservations: 'Rezervasyonları oluşturma/iptal etme',
};

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  permissions: PermissionId[];
}

// ---------------------------------------------------------------------------
// Room operational status (occupancy / cleaning / technical are tracked
// independently — a room can be occupied AND need cleaning AND have an open
// technical issue at the same time).
// ---------------------------------------------------------------------------

export type OccupancyStatus = 'vacant' | 'occupied' | 'reserved';

export const OCCUPANCY_LABELS: Record<OccupancyStatus, string> = {
  vacant: 'Boş',
  occupied: 'Dolu',
  reserved: 'Rezerve',
};

export type CleaningStatus = 'clean' | 'dirty' | 'preparing' | 'inspection_pending';

export const CLEANING_STATUS_LABELS: Record<CleaningStatus, string> = {
  clean: 'Temiz',
  dirty: 'Kirli',
  preparing: 'Hazırlanıyor',
  inspection_pending: 'Kontrol Bekliyor',
};

export type TechnicalStatus = 'ok' | 'issue' | 'maintenance';

export const TECHNICAL_STATUS_LABELS: Record<TechnicalStatus, string> = {
  ok: 'Sorunsuz',
  issue: 'Arıza Var',
  maintenance: 'Bakımda',
};

export interface RoomStatusLog {
  id: string;
  roomNumber: string;
  actorName: string;
  actorRole: RoleId;
  field: 'occupancy' | 'cleaning' | 'technical';
  fromLabel: string;
  toLabel: string;
  timestamp: string;
}

export interface PriceChangeLog {
  id: string;
  itemId: string;
  itemName: string;
  actorName: string;
  actorRole: RoleId;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
}

export interface ActivityLogEntry {
  id: string;
  actorName: string;
  actorRole: RoleId;
  description: string;
  timestamp: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  type: 'price_change';
  requestedByName: string;
  requestedByRole: RoleId;
  itemId: string;
  itemName: string;
  oldValue: string;
  newValue: string;
  description?: string;
  status: ApprovalStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByName?: string;
}

export type BreakfastCategory = 'hot' | 'cold' | 'drink' | 'bakery' | 'fruit' | 'extra';

export const BREAKFAST_CATEGORY_LABELS: Record<BreakfastCategory, string> = {
  hot: 'Sıcak',
  cold: 'Soğuk',
  drink: 'İçecek',
  bakery: 'Ekmek & Hamur İşi',
  fruit: 'Meyve',
  extra: 'Ekstra',
};

export type PrepStatus = 'preparing' | 'ready' | 'finished';

export const PREP_STATUS_LABELS: Record<PrepStatus, string> = {
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  finished: 'Bitti',
};

export interface BreakfastItem {
  id: string;
  name: string;
  description: string;
  allergens: string[];
  category: BreakfastCategory;
  stock: StockStatus;
  available: boolean;
  prepStatus: PrepStatus;
  price?: number;
  addedBy: string;
  updatedAt: string;
}

export type RequestStatus =
  | 'received'
  | 'assigned'
  | 'preparing'
  | 'on_the_way'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  received: 'Alındı',
  assigned: 'Atandı',
  preparing: 'Hazırlanıyor',
  on_the_way: 'Yolda',
  arrived: 'Odaya Gelindi',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export type Priority = 'normal' | 'urgent';

export type RoomStatus = 'occupied' | 'vacant' | 'cleaning' | 'maintenance';

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  occupied: 'Dolu',
  vacant: 'Boş',
  cleaning: 'Temizleniyor',
  maintenance: 'Bakımda',
};

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family';

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  standard: 'Standart Oda',
  deluxe: 'Deluxe Oda',
  suite: 'Suit',
  family: 'Aile Odası',
};

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  guestName?: string;
  guestCount?: number;
  checkIn?: string; // ISO date
  checkOut?: string; // ISO date
  lastCleanedAt?: string; // ISO datetime
  notes?: string;
  // Granular operational status (new permission-aware room management).
  // Optional so existing `status`-only consumers keep working unchanged.
  occupancy?: OccupancyStatus;
  cleaningStatus?: CleaningStatus;
  technicalStatus?: TechnicalStatus;
}

export interface Staff {
  id: string;
  /** Which of the 8 permission roles this staff member logs in as. */
  roleId: RoleId;
  /** Account enabled/disabled — distinct from `onDuty` (current shift status). */
  active: boolean;
  /** ISO datetime of the last status/edit action this person performed. */
  lastActionAt?: string;
  name: string;
  department: Department;
  role: string;
  initials: string;
  color: string; // tailwind-safe hex for avatar
  phone: string;
  rating: number; // 0-5
  completedToday: number;
  activeTasks: number;
  avgResolutionMinutes: number;
  onDuty: boolean;
}

export type ServiceCategoryType = 'form' | 'order' | 'info' | 'emergency';

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string; // lucide-react icon name
  type: ServiceCategoryType;
  department: Department;
  color: string; // accent hex
  requestTypeOptions?: string[]; // for form-type categories
  estimatedMinutes?: number;
}

export type StockStatus = 'in_stock' | 'out_of_stock';

export interface ServiceItem {
  id: string;
  categoryId: string; // ServiceCategory.id (menu group)
  name: string;
  description: string;
  price: number;
  currency: 'TRY';
  image: string; // emoji used as lightweight placeholder art
  available: boolean;
  stock: StockStatus;
  prepTimeMinutes: number;
  department: Department;
  tags?: string[];
  updatedBy?: string;
  updatedAt?: string;
}

export interface OrderItem {
  serviceItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface RequestHistoryEntry {
  status: RequestStatus;
  timestamp: string; // ISO datetime
  note?: string;
  actor?: string; // staff name or 'Misafir' / 'Sistem'
}

export interface GuestRequest {
  id: string;
  roomNumber: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  icon: string;
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  department: Department;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  assignedStaffId?: string;
  assignedStaffName?: string;
  estimatedMinutes?: number;
  guestNote?: string;
  staffNote?: string;
  callBeforeArrival?: boolean;
  guestPresent?: boolean;
  items?: OrderItem[];
  totalPrice?: number;
  history: RequestHistoryEntry[];
  cancelReason?: string;
}

export interface QRCodeRecord {
  roomNumber: string;
  url: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Reservations — separate from a room's "current" occupancy snapshot so the
// front office can plan future stays and see a room's full booking timeline,
// not just what's happening in it right now. `status` is intentionally not
// stored: it's always derived from the dates (see utils/reservations.ts) so
// it can never drift out of sync with "today".
// ---------------------------------------------------------------------------

export type ReservationStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  upcoming: 'Yaklaşan',
  active: 'Konaklıyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export interface Reservation {
  id: string;
  roomNumber: string;
  guestName: string;
  guestCount: number;
  checkIn: string; // ISO date (YYYY-MM-DD)
  checkOut: string; // ISO date (YYYY-MM-DD)
  notes?: string;
  cancelled?: boolean;
  createdByName: string;
  createdAt: string; // ISO datetime
}

export interface HotelInfo {
  hotelName: string;
  tagline: string;
  wifiName: string;
  wifiPassword: string;
  breakfastHours: string;
  poolHours: string;
  spaHours: string;
  restaurantHours: string;
  checkInTime: string;
  checkOutTime: string;
  parkingInfo: string;
  emergencyNumbers: { label: string; number: string }[];
  hotelRules: string[];
  floorPlanNote: string;
  address: string;
  heritageTitle: string;
  heritageParagraphs: string[];
}

export interface RoomTypeSpec {
  sizeM2: number;
  bedType: string;
  bathroomCount: number;
  maxGuests: number;
  view: string;
}

export type NotificationAudience = 'guest' | 'admin';

export interface AppNotification {
  id: string;
  audience: NotificationAudience;
  /** Required when audience === 'guest' — scopes the notification to one room's guest screen. */
  roomNumber?: string;
  title: string;
  body: string;
  icon: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
}
