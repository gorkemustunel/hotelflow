import { Icon } from './Icon';

export function QuantityStepper({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-cream-100 p-1 ring-1 ring-navy-900/10">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-50 text-navy-700 shadow-soft transition active:scale-95 disabled:opacity-30"
      >
        <Icon name="Minus" className="h-3.5 w-3.5" />
      </button>
      <span className="w-4 text-center text-sm font-bold text-navy-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-white shadow-soft transition active:scale-95 disabled:opacity-30"
      >
        <Icon name="Plus" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
