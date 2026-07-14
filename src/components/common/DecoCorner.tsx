import clsx from 'clsx';

/**
 * Small art-deco corner bracket ornament — two nested L-shapes. Positioned
 * absolutely inside a `relative` card/hero container (e.g.
 * `<DecoCorner className="absolute left-3 top-3 h-6 w-6 text-gold-400" />`).
 * Mirror horizontally/vertically with `-scale-x-100` / `-scale-y-100` for
 * the other three corners.
 */
export function DecoCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={clsx('pointer-events-none', className)}>
      <path d="M1 17V1H17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 17V7H17" stroke="currentColor" strokeWidth="1" opacity="0.55" />
    </svg>
  );
}
