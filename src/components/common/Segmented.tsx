import clsx from 'clsx';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: string; activeClass?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream-50 p-1.5 ring-1 ring-navy-900/10">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
            value === opt.value ? (opt.activeClass ?? 'bg-navy-900 text-white shadow-soft') : 'text-navy-500 hover:bg-cream-50/60',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
