import { Icon } from '@/components/common/Icon';
import { DecoDivider } from '@/components/common/DecoDivider';
import { DecoCorner } from '@/components/common/DecoCorner';
import { useOperations } from '@/context/OperationsContext';

/**
 * Editorial "about the hotel" moment — a two-column story block pairing
 * heritage copy with a brand-mark visual panel (no stock photography, to
 * avoid the generic "AI hotel photo" look; the pattern + gem mark carries
 * the same weight a hero image would on a real property site).
 */
export function HotelStorySection() {
  const { hotelInfo } = useOperations();
  return (
    <div className="overflow-hidden rounded-sm border border-line bg-cream-50">
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">Otelin Hikayesi</p>
          <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-navy-900 sm:text-2xl">
            {hotelInfo.heritageTitle}
          </h2>
          <DecoDivider variant="light" className="mt-4 w-24" />
          <div className="mt-4 space-y-3">
            {hotelInfo.heritageParagraphs.map((p) => (
              <p key={p} className="text-sm leading-relaxed text-navy-600">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="relative flex min-h-[180px] items-center justify-center bg-navy-900 bg-deco-pattern p-7 sm:min-h-full">
          <DecoCorner className="absolute left-4 top-4 h-6 w-6 text-gold-400/40" />
          <DecoCorner className="absolute bottom-4 right-4 h-6 w-6 -scale-x-100 -scale-y-100 text-gold-400/40" />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15 ring-1 ring-gold-400/30">
              <Icon name="Gem" className="h-7 w-7 text-gold-400" />
            </div>
            <p className="font-display text-sm tracking-[0.15em] text-white/90">EST. 1926</p>
            <p className="max-w-[16rem] text-xs leading-relaxed text-navy-300">
              Boğaz kıyısında, zamanın izini taşıyan bir konaklama geleneği
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
