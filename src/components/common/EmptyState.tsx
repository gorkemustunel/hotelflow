import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-900/15 bg-cream-50/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream-200">
        <Icon name={icon} className="h-6 w-6 text-navy-500" />
      </div>
      <p className="font-display text-lg font-semibold text-navy-900">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-navy-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
