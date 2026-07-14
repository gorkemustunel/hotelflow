import type { GuestRequest } from '@/types';
import { Icon } from './Icon';
import { isOverdue, overdueByMinutes } from '@/utils/sla';
import clsx from 'clsx';

export function OverdueBadge({ request, size = 'md' }: { request: GuestRequest; size?: 'sm' | 'md' }) {
  if (!isOverdue(request)) return null;
  const minutes = overdueByMinutes(request);
  return (
    <span
      className={clsx(
        'inline-flex animate-pulse-ring items-center gap-1 rounded-full bg-ruby-500 font-bold text-white whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <Icon name="AlarmClockOff" className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {minutes} dk gecikti
    </span>
  );
}
