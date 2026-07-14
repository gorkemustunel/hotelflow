import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-navy-900 text-cream-50 tracking-wide hover:bg-navy-700 active:bg-navy-950',
  secondary: 'bg-cream-50 text-navy-900 tracking-wide hover:bg-cream-200 ring-1 ring-inset ring-line',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-900/5',
  danger: 'bg-ruby-500 text-white hover:bg-ruby-600',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600',
  gold: 'bg-gold-500 text-navy-950 hover:bg-gold-600 font-bold',
};

const SIZES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-sm gap-2',
  lg: 'px-6 py-3.5 text-base rounded-sm gap-2.5',
};

export function Button({ variant = 'primary', size = 'md', icon, fullWidth, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
