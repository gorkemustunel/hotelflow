import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Card } from '@/components/common/Card';
import { HotelStorySection } from '@/components/guest/HotelStorySection';
import { hotelInfo } from '@/data/hotelInfo';
import { useViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2.5 text-sm text-navy-600">
        <Icon name={icon} className="h-4 w-4 text-navy-400" />
        {label}
      </span>
      <span className="text-sm font-semibold text-navy-900">{value}</span>
    </div>
  );
}

export function HotelInfoContent() {
  const [showPassword, setShowPassword] = useState(false);
  const { isDesktop } = useViewMode();

  return (
    <div className="space-y-5">
      <HotelStorySection />

      <div className={clsx('gap-5 space-y-5', isDesktop && 'grid grid-cols-2 space-y-0')}>

      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="Wifi" className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-base font-semibold text-navy-900">Wi-Fi Bilgileri</h3>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-cream-50 px-3.5 py-3">
            <p className="text-[11px] font-medium text-navy-400">Ağ Adı</p>
            <p className="mt-0.5 text-sm font-bold text-navy-900">{hotelInfo.wifiName}</p>
          </div>
          <button onClick={() => setShowPassword((v) => !v)} className="rounded-xl bg-cream-50 px-3.5 py-3 text-left">
            <p className="text-[11px] font-medium text-navy-400">Şifre</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-navy-900">
              {showPassword ? hotelInfo.wifiPassword : '••••••••••'}
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="h-3.5 w-3.5 text-navy-400" />
            </p>
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="Clock" className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-base font-semibold text-navy-900">Saatler</h3>
        </div>
        <div className="divide-y divide-navy-900/5">
          <InfoRow icon="Coffee" label="Kahvaltı" value={hotelInfo.breakfastHours} />
          <InfoRow icon="Waves" label="Havuz" value={hotelInfo.poolHours} />
          <InfoRow icon="Flower2" label="Spa" value={hotelInfo.spaHours} />
          <InfoRow icon="UtensilsCrossed" label="Restoran" value={hotelInfo.restaurantHours} />
          <InfoRow icon="LogIn" label="Check-in" value={hotelInfo.checkInTime} />
          <InfoRow icon="LogOut" label="Check-out" value={hotelInfo.checkOutTime} />
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="ParkingSquare" className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-base font-semibold text-navy-900">Otopark</h3>
        </div>
        <p className="text-sm leading-relaxed text-navy-600">{hotelInfo.parkingInfo}</p>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="ScrollText" className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-base font-semibold text-navy-900">Otel Kuralları</h3>
        </div>
        <ul className="space-y-2">
          {hotelInfo.hotelRules.map((rule) => (
            <li key={rule} className="flex items-start gap-2 text-sm leading-relaxed text-navy-600">
              <Icon name="Dot" className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              {rule}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="MapPin" className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-base font-semibold text-navy-900">Kat Planı & Yönlendirme</h3>
        </div>
        <p className="text-sm leading-relaxed text-navy-600">{hotelInfo.floorPlanNote}</p>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="Phone" className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-base font-semibold text-navy-900">Acil Durum Numaraları</h3>
        </div>
        <div className="space-y-1">
          {hotelInfo.emergencyNumbers.map((e) => (
            <a key={e.label} href={`tel:${e.number}`} className="flex items-center justify-between rounded-xl px-2 py-2 text-sm transition hover:bg-cream-50">
              <span className="text-navy-600">{e.label}</span>
              <span className="font-semibold text-navy-900">{e.number}</span>
            </a>
          ))}
        </div>
      </Card>
      </div>
    </div>
  );
}
