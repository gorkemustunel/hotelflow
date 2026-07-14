import { Icon } from '@/components/common/Icon';
import { useViewMode, type ViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

const OPTIONS: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: 'auto', icon: 'Wand2', label: 'Otomatik' },
  { mode: 'mobile', icon: 'Smartphone', label: 'Mobil görünüm' },
  { mode: 'desktop', icon: 'Monitor', label: 'Masaüstü görünüm' },
];

export function ViewModeToggle() {
  const { mode, setMode } = useViewMode();

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-navy-900/5 p-0.5 ring-1 ring-line" role="group" aria-label="Görünüm seçimi">
      {OPTIONS.map((opt) => (
        <button
          key={opt.mode}
          type="button"
          onClick={() => setMode(opt.mode)}
          aria-label={opt.label}
          aria-pressed={mode === opt.mode}
          title={opt.label}
          className={clsx(
            'flex h-7 w-7 items-center justify-center rounded-full transition',
            mode === opt.mode ? 'bg-navy-900 text-white' : 'text-navy-400 hover:text-navy-700',
          )}
        >
          <Icon name={opt.icon} className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
