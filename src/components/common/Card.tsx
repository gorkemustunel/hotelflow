import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('rounded-xl bg-cream-50 ring-1 ring-line', className)} {...rest}>
      {children}
    </div>
  );
}
