import type { PermissionId, Role, RoleId } from '@/types';
import { ROLE_LABELS } from '@/types';

const ALL_PERMISSIONS: PermissionId[] = [
  'view_dashboard',
  'manage_rooms',
  'update_room_status',
  'manage_room_cleaning_status',
  'manage_requests',
  'assign_requests',
  'update_request_status',
  'manage_menu',
  'edit_prices',
  'manage_breakfast_menu',
  'add_breakfast_item',
  'toggle_item_availability',
  'manage_staff',
  'manage_roles',
  'view_reports',
  'manage_qr_codes',
  'manage_hotel_settings',
  'manage_reservations',
];

const ROLE_DESCRIPTIONS: Record<RoleId, string> = {
  super_admin: 'Sistemin tamamına erişebilir: odalar, fiyatlar, menüler, personel, roller ve otel ayarları.',
  hotel_manager: 'Günlük operasyonu yönetir: oda doluluğu, fiyatlar, menüler, talep atama ve raporlar.',
  reception: 'Oda durumlarını görür, check-in/check-out yapar, talepleri ilgili departmana yönlendirir.',
  housekeeping: 'Kendisine atanan temizlik görevlerini görür ve oda temizlik durumunu günceller.',
  technical: 'Teknik destek taleplerini görür, üstlenir ve not ekler.',
  room_service: 'Oda servisi siparişlerini görür ve hazırlanıyor/yolda/teslim edildi durumlarını günceller.',
  chef: 'Kahvaltı menüsünü ve stok durumunu yönetir; fiyat değişikliği için yönetici onayı gerekir.',
  spa: 'Spa rezervasyonlarını ve hizmetlerin aktif/pasif durumunu yönetir.',
};

/** Default permission set per role — matches the access matrix agreed for
 * HotelFlow's operations panel. Editable at runtime from the Role & Permission
 * Management screen (see OperationsContext.toggleRolePermission); this object
 * is only the initial seed. */
const ROLE_PERMISSIONS: Record<RoleId, PermissionId[]> = {
  super_admin: ALL_PERMISSIONS,
  hotel_manager: [
    'view_dashboard',
    'manage_rooms',
    'update_room_status',
    'manage_room_cleaning_status',
    'manage_requests',
    'assign_requests',
    'update_request_status',
    'manage_menu',
    'edit_prices',
    'manage_breakfast_menu',
    'add_breakfast_item',
    'toggle_item_availability',
    'view_reports',
    'manage_qr_codes',
    'manage_reservations',
  ],
  reception: ['manage_requests', 'assign_requests', 'update_room_status', 'manage_reservations'],
  housekeeping: ['manage_room_cleaning_status', 'update_request_status'],
  technical: ['update_request_status'],
  room_service: ['update_request_status'],
  chef: ['manage_breakfast_menu', 'add_breakfast_item', 'toggle_item_availability', 'update_request_status'],
  spa: ['toggle_item_availability', 'update_request_status'],
};

export const INITIAL_ROLES: Record<RoleId, Role> = (Object.keys(ROLE_LABELS) as RoleId[]).reduce(
  (acc, id) => {
    acc[id] = { id, name: ROLE_LABELS[id], description: ROLE_DESCRIPTIONS[id], permissions: ROLE_PERMISSIONS[id] };
    return acc;
  },
  {} as Record<RoleId, Role>,
);

export const ALL_PERMISSION_IDS = ALL_PERMISSIONS;
