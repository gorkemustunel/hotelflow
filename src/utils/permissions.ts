import type { PermissionId } from '@/types';

/** Does this permission set include the given permission? */
export function hasPermission(permissions: PermissionId[] | undefined, permission: PermissionId): boolean {
  return !!permissions?.includes(permission);
}

/** Does this permission set include at least one of the given permissions? */
export function hasAnyPermission(permissions: PermissionId[] | undefined, required: PermissionId[]): boolean {
  return required.some((p) => hasPermission(permissions, p));
}

export function canEditPrice(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'edit_prices');
}

export function canManageBreakfast(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'manage_breakfast_menu');
}

export function canUpdateRoomStatus(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'update_room_status');
}

export function canManageRoomCleaning(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'manage_room_cleaning_status');
}

export function canManageMenu(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'manage_menu');
}

export function canManageStaff(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'manage_staff');
}

export function canManageRoles(permissions: PermissionId[] | undefined): boolean {
  return hasPermission(permissions, 'manage_roles');
}
