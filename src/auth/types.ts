export type AppRole = 'admin' | 'staff';

/**
 * Shape of the current signed-in user, mapped from Supabase Auth's session
 * (`user.user_metadata.role` / `.name`) into something the rest of the app
 * doesn't need to know is backed by Supabase.
 */
export interface AuthSession {
  userId: string;
  name: string;
  roles: AppRole[];
  /** Present when the signed-in user is a staff member (used to scope their task list). */
  staffId?: string;
}
