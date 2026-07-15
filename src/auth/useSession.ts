import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import type { AppRole, AuthSession } from './types';

/** Ends the current Supabase Auth session. There is only ever one signed-in
 * user per browser now (real auth replaced the old dual sessionStorage-flag
 * system), so both the admin and staff exit buttons call the same signOut —
 * two names are kept so neither `AdminLayout` nor `StaffLayout` needed to
 * change their import. */
export async function clearAdminAuthed() {
  await supabase?.auth.signOut();
}
export async function clearStaffAuthed() {
  await supabase?.auth.signOut();
}

function mapUserToSession(user: User | null | undefined): AuthSession | null {
  if (!user) return null;
  const role = user.user_metadata?.role as AppRole | undefined;
  const staffId = user.user_metadata?.staffId as string | undefined;
  if (!role || !staffId) return null;
  return {
    userId: user.id,
    name: (user.user_metadata?.name as string | undefined) ?? user.email ?? 'Kullanıcı',
    roles: [role],
    staffId,
  };
}

/**
 * Real Supabase Auth session, mapped into the shape the rest of the app
 * expects. `user_metadata.role` / `.staffId` / `.name` are set once, at
 * account-creation time, by `scripts/seed-auth-users.mjs` — see that file
 * for the full list of seeded demo accounts.
 */
export function useSession(): { session: AuthSession | null; isLoading: boolean } {
  const [state, setState] = useState<{ session: AuthSession | null; isLoading: boolean }>({ session: null, isLoading: true });

  useEffect(() => {
    if (!supabase) {
      setState({ session: null, isLoading: false });
      return;
    }

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setState({ session: mapUserToSession(data.session?.user), isLoading: false });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session: mapUserToSession(session?.user), isLoading: false });
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
