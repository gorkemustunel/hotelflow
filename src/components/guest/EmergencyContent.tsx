import { Icon } from '@/components/common/Icon';
import { useOperations } from '@/context/OperationsContext';

export function EmergencyContent() {
  const { hotelInfo } = useOperations();
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-ruby-500/10 p-4 text-center ring-1 ring-ruby-500/20">
        <p className="text-sm font-medium leading-relaxed text-ruby-700">
          Hayati tehlike durumunda doğrudan <span className="font-bold">112</span>'yi arayın. Aşağıdaki numaralar otel içi hızlı yönlendirme içindir.
        </p>
      </div>

      <div className="space-y-2.5">
        {hotelInfo.emergencyNumbers.map((e) => (
          <a
            key={e.label}
            href={`tel:${e.number}`}
            className="flex items-center justify-between rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5 transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ruby-500/10 text-ruby-600">
                <Icon name="Phone" className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-navy-900">{e.label}</span>
                <span className="block text-xs text-navy-400">Aramak için dokunun</span>
              </span>
            </span>
            <span className="font-display text-base font-bold text-navy-900">{e.number}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
