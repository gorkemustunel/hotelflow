import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <label className="text-sm font-semibold text-navy-800">{children}</label>
      {hint && <span className="text-xs text-navy-400">{hint}</span>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-xl border border-navy-900/10 bg-cream-50 px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition focus:border-gold-500 focus:bg-cream-50 focus:ring-2 focus:ring-gold-500/20',
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        'w-full resize-none rounded-xl border border-navy-900/10 bg-cream-50 px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition focus:border-gold-500 focus:bg-cream-50 focus:ring-2 focus:ring-gold-500/20',
        props.className,
      )}
    />
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-cream-50 px-4 py-3 text-left ring-1 ring-navy-900/10 transition hover:bg-cream-100"
    >
      <span>
        <span className="block text-sm font-semibold text-navy-800">{label}</span>
        {description && <span className="block text-xs text-navy-400">{description}</span>}
      </span>
      <span
        className={clsx('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-navy-900' : 'bg-navy-900/15')}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-cream-50 shadow-soft transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}
