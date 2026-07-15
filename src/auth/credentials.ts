import { staff } from '@/data/staff';
import type { RoleId } from '@/types';

/** Shared password for every seeded demo account — intentionally not a real
 * secret (it's displayed on-screen on the login forms). Used only when
 * creating the accounts via `scripts/seed-auth-users.mjs`; sign-in itself
 * goes through real Supabase Auth (`supabase.auth.signInWithPassword`) —
 * see `pages/AdminSelectPage.tsx` / `pages/staff/StaffSelectPage.tsx`. */
export const DEMO_PASSWORD = '1234';

/** Supabase Auth needs an email, and demo personas don't have real ones —
 * every seeded account uses `<username>@hotelflow.demo`. */
export const DEMO_EMAIL_DOMAIN = 'hotelflow.demo';

/** Only these two roles may authenticate into the admin panel. Everyone
 * else (including reception, which used to have admin-panel permissions)
 * logs in through the staff panel instead. */
export const ADMIN_ROLE_IDS: RoleId[] = ['super_admin', 'hotel_manager'];

export function usernameFor(fullName: string): string {
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

export function emailFor(username: string): string {
  return `${username}@${DEMO_EMAIL_DOMAIN}`;
}

export interface DemoCredential {
  staffId: string;
  username: string;
  email: string;
  name: string;
  roleId: RoleId;
}

export function credentialsFor(staffIds: string[]): DemoCredential[] {
  return staffIds
    .map((id) => staff.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .map((s) => {
      const username = usernameFor(s.name);
      return { staffId: s.id, username, email: emailFor(username), name: s.name, roleId: s.roleId };
    });
}
