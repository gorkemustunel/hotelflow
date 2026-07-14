import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { EmergencyContent } from '@/components/guest/EmergencyContent';
import { useViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

export function EmergencyPage() {
  const navigate = useNavigate();
  const { isDesktop } = useViewMode();
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 shadow-soft ring-1 ring-navy-900/5">
          <Icon name="ChevronLeft" className="h-5 w-5 text-navy-700" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Acil Durum</h1>
          <p className="mt-0.5 text-sm text-navy-500">Hızlı yardım hattına ulaşın</p>
        </div>
      </div>
      <div className={clsx(isDesktop && 'mx-auto w-full max-w-xl')}>
        <EmergencyContent />
      </div>
    </div>
  );
}
