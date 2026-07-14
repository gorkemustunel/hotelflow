import { REQUEST_STATUS_LABELS, type RequestStatus } from '@/types';
import { Icon } from './Icon';
import clsx from 'clsx';

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; dot: string; icon: string }> = {
  received: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', icon: 'Inbox' },
  assigned: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: 'UserCheck' },
  preparing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: 'Loader2' },
  on_the_way: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', icon: 'Truck' },
  arrived: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500', icon: 'DoorOpen' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: 'CheckCircle2' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-400', icon: 'XCircle' },
};

export function StatusBadge({ status, size = 'md' }: { status: RequestStatus; size?: 'sm' | 'md' }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        s.bg,
        s.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', s.dot, status === 'preparing' && 'animate-pulse')} />
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'md' }: { priority: 'normal' | 'urgent'; size?: 'sm' | 'md' }) {
  if (priority === 'normal') return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-ruby-500/10 font-bold text-ruby-600 ring-1 ring-inset ring-ruby-500/20 whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <Icon name="Zap" className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      ACİL
    </span>
  );
}
