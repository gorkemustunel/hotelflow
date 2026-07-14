import type { ReactNode } from 'react';
import { Icon } from './Icon';
import clsx from 'clsx';

export function MetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  icon: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  tone?: 'default' | 'urgent' | 'success' | 'gold';
}) {
  const toneStyles: Record<string, string> = {
    default: 'bg-navy-900/5 text-navy-700',
    urgent: 'bg-ruby-500/10 text-ruby-600',
    success: 'bg-emerald-500/10 text-emerald-600',
    gold: 'bg-gold-500/15 text-gold-600',
  };
  return (
    <div className="rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</span>
        <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', toneStyles[tone])}>
          <Icon name={icon} className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">{value}</span>
        {trendLabel && (
          <span
            className={clsx(
              'flex items-center gap-0.5 text-xs font-semibold',
              trend === 'up' && 'text-emerald-600',
              trend === 'down' && 'text-ruby-600',
              trend === 'flat' && 'text-navy-400',
            )}
          >
            {trend === 'up' && <Icon name="ArrowUp" className="h-3 w-3" />}
            {trend === 'down' && <Icon name="ArrowDown" className="h-3 w-3" />}
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
