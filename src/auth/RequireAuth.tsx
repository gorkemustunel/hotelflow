import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '@/components/common/Spinner';
import { useSession } from './useSession';
import type { AppRole } from './types';

/**
 * Route guard placeholder for the admin and staff areas.
 *
 * There is no login system, so `useSession` always returns an authenticated
 * session and every request to render `children` succeeds — admin and
 * staff routes stay open on purpose so the app can be demoed role-by-role
 * without a sign-in step.
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
