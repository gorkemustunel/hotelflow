import type { ReactNode } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { useOperations } from '@/context/OperationsContext';
import type { PermissionId } from '@/types';

/** Wraps a route/page: shows a friendly "no permission" state instead of a
 * blank or broken screen when the current demo user lacks the required
 * permission, rather than rendering the page and letting it break. */
export function PermissionGate({ permission, children }: { permission: PermissionId; children: ReactNode }) {
  const { has } = useOperations();
  if (!has(permission)) {
    return (
      <EmptyState
        icon="Lock"
        title="Bu işlem için yetkiniz yok"
        description="Bu ekranı görüntülemek için gerekli izniniz bulunmuyor. Üst menüden farklı bir demo kullanıcı seçerek deneyebilirsiniz."
      />
    );
  }
  return <>{children}</>;
}
