import clsx from 'clsx';

/**
 * Art-deco style section divider — a thin hairline with a small rotated
 * diamond at the center. Used on hero/signature surfaces (role select,
 * guest greeting, admin sidebar) to reinforce the "Grand Deco" identity
 * instead of a plain <hr> or blank gap.
 */
export function DecoDivider({ variant = 'dark', className }: { variant?: 'dark' | 'light'; className?: string }) {
  const lineColor = variant === 'dark' ? 'bg-gold-400/25' : 'bg-navy-900/10';
  const diamondColor = variant === 'dark' ? 'bg-gold-400' : 'bg-gold-500';

  return (
    <div className={clsx('flex items-center gap-3', className)} role="presentation">
      <div className={clsx('h-px flex-1', lineColor)} />
      <div className={clsx('h-1.5 w-1.5 rotate-45', diamondColor)} />
      <div className={clsx('h-px flex-1', lineColor)} />
    </div>
  );
}
