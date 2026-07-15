import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '@/components/common/Spinner';
import { useSession } from './useSession';
import type { AppRole } from './types';

/**
 * Route guard for the admin and staff areas, backed by real Supabase Auth
 * (see `useSession`). Redirects to `/` if there's no session, or if the
 * signed-in account's `role` doesn't match the surface being requested
 * (an admin account can't fall through into `/staff/:staffId` and vice
 * versa).
 */
export function RequireAuth({ role, children }: { role: AppRole; children: ReactNode }) {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <FullPageLoader label="Oturum doğrulanıyor…" />;
  }

  if (!session || !session.roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
