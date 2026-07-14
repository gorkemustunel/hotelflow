import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { DecoDivider } from '@/components/common/DecoDivider';
import { DecoCorner } from '@/components/common/DecoCorner';
import { rooms } from '@/data/rooms';
import { hotelInfo } from '@/data/hotelInfo';
import { useOperations } from '@/context/OperationsContext';

const ROLE_CARDS = [
  {
    key: 'guest',
    title: 'Misafir Demo',
    subtitle: 'Odanızdaki QR kodu taradığınızda açılan deneyimi keşfedin',
    icon: 'Smartphone',
    accent: 'from-gold-500/[0.08] to-transparent',
    iconBg: 'bg-gold-500/15 text-gold-500',
  },
  {
    key: 'admin',
    title: 'Yönetici Paneli',
    subtitle: 'Talepleri, personeli, odaları ve raporları yönetin',
    icon: 'LayoutDashboard',
    accent: 'from-navy-900/[0.04] to-transparent',
    iconBg: 'bg-navy-900/10 text-navy-700',
  },
  {
    key: 'staff',
    title: 'Personel Paneli',
    subtitle: 'Departmanınıza atanan görevleri görün ve yönetin',
    icon: 'Users',
    accent: 'from-emerald-500/[0.08] to-transparent',
    iconBg: 'bg-emerald-500/15 text-emerald-600',
  },
];

export function RoleSelectPage() {
  const navigate = useNavigate();
  const { qrTokens } = useOperations();
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);

  const handleSelect = (key: string) => {
    if (key === 'guest') setRoomPickerOpen(true);
    else if (key === 'admin') navigate('/admin-select');
    else if (key === 'staff') navigate('/staff');
  };

  return (
    <div className="min-h-screen bg-cream-100 bg-deco-pattern">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12 sm:py-16">
        <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/15 ring-1 ring-gold-400/30">
            <Icon name="Gem" className="h-7 w-7 text-gold-600" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">{hotelInfo.hotelName}</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide text-navy-900 sm:text-5xl">HotelFlow</h1>
          <p className="mt-3 max-w-md text-sm text-navy-500 sm:text-base">
            QR kod tabanlı dijital resepsiyon ve otel içi talep yönetim sistemi. Demo sunumu için bir rol seçin.
          </p>
          <DecoDivider variant="light" className="mt-8 w-40 sm:w-56" />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {ROLE_CARDS.map((card) => (
            <button
              key={card.key}
              onClick={() => handleSelect(card.key)}
              className={`group relative overflow-hidden rounded-sm bg-cream-50 bg-gradient-to-b ${card.accent} p-6 text-left ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-gold-400/50 sm:p-7`}
            >
              <DecoCorner className="absolute left-3 top-3 h-5 w-5 text-gold-500/50" />
              <DecoCorner className="absolute bottom-3 right-3 h-5 w-5 -scale-x-100 -scale-y-100 text-gold-500/50" />
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
                <Icon name={card.icon} className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{card.subtitle}</p>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                Başla
                <Icon name="ArrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-1 pt-16 text-center text-xs text-navy-400">
          <p>HotelFlow v1.0 — Demo Ortamı</p>
          <p>Gerçek veri değildir. Tüm oda, misafir ve talep bilgileri örnek amaçlıdır.</p>
        </div>
      </div>

      <Modal open={roomPickerOpen} onClose={() => setRoomPickerOpen(false)} title="Bir Oda Seçin">
        <p className="mb-4 text-sm text-navy-500">Gerçek deneyimde misafir odasındaki QR kodu tarar. Demo için bir oda seçerek o odanın misafir ekranını görüntüleyin.</p>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/guest/room/${room.number}?t=${qrTokens[room.number]}`)}
              className="flex flex-col items-center gap-1 rounded-xl bg-cream-50 py-3.5 ring-1 ring-navy-900/10 transition hover:bg-gold-500/10 hover:ring-gold-500/30"
            >
              <span className="font-display text-base font-bold text-navy-900">{room.number}</span>
              <span className="text-[10px] text-navy-400">{room.floor}. Kat</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
