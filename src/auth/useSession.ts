import type { AppRole, AuthSession } from './types';

const ADMIN_KEY = 'hf-auth-admin-staff-id';
const STAFF_KEY = 'hf-auth-staff-staff-id';

export function setAdminAuthed(staffId: string) {
  window.sessionStorage.setItem(ADMIN_KEY, staffId);
}
export function clearAdminAuthed() {
  window.sessionStorage.removeItem(ADMIN_KEY);
}
export function setStaffAuthed(staffId: string) {
  window.sessionStorage.setItem(STAFF_KEY, staffId);
}
export function clearStaffAuthed() {
  window.sessionStorage.removeItem(STAFF_KEY);
}

/**
 * Demo session hook, backed by `sessionStorage` (per browser tab, cleared
 * on logout or when the tab closes). There is no real backend behind this:
 * `AdminSelectPage` / `StaffSelectPage` validate a mock username/password
 * pair (see `./credentials`) and, on success, mark the relevant surface as
 * authenticated here. `RequireAuth` only reads this hook's shape (`session`
 * + `isLoading`), so swapping in a real auth provider later only means
 * rewriting this file.
 */
export function useSession(): { session: AuthSession | null; isLoading: boolean } {
  const roles: AppRole[] = [];
  if (window.sessionStorage.getItem(ADMIN_KEY)) roles.push('admin');
  if (window.sessionStorage.getItem(STAFF_KEY)) roles.push('staff');

  if (roles.length === 0) {
    return { session: null, isLoading: false };
  }
  return {
    session: { userId: 'demo-user', name: 'Demo Kullanıcı', roles },
    isLoading: false,
  };
}
