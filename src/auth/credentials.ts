import { staff } from '@/data/staff';
import type { RoleId } from '@/types';

/**
 * Demo-only credential model. There is no backend, so these "passwords"
 * are not a security boundary — they exist purely to make the admin/staff
 * login screens feel like a real product instead of a one-click persona
 * switcher. Every demo account shares the same password; the login screens
 * show the valid username/password pairs directly so the flow stays usable
 * without external docs.
 */
export const DEMO_PASSWORD = '1234';

/** Only these two roles may authenticate into the admin panel. Everyone
 * else (including reception, which used to have admin-panel permissions)
 * logs in through the staff panel instead. */
export const ADMIN_ROLE_IDS: RoleId[] = ['super_admin', 'hotel_manager'];

function usernameFor(fullName: string): string {
  return fullName
    .split(' ')[0]
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

export interface DemoCredential {
  staffId: string;
  username: string;
  name: string;
  roleId: RoleId;
}

export function credentialsFor(staffIds: string[]): DemoCredential[] {
  return staffIds
    .map((id) => staff.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .map((s) => ({ staffId: s.id, username: usernameFor(s.name), name: s.name, roleId: s.roleId }));
}

/** Returns the matching staffId, or null if the username/password pair
 * doesn't match anyone in the given candidate list. */
export function verifyCredential(staffIds: string[], username: string, password: string): string | null {
  if (password !== DEMO_PASSWORD) return null;
  const normalized = username.trim().toLocaleLowerCase('tr-TR');
  const match = credentialsFor(staffIds).find((c) => c.username === normalized);
  return match ? match.staffId : null;
}
