import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { CategoryCard } from '@/components/guest/CategoryCard';
import { RequestCard } from '@/components/guest/RequestCard';
import { DecoCorner } from '@/components/common/DecoCorner';
import { RoomSpecsStrip } from '@/components/guest/RoomSpecsStrip';
import { useAppData } from '@/context/AppDataContext';
import { useViewMode } from '@/context/ViewModeContext';
import { serviceCategories, quickActionSlugs } from '@/data/serviceCategories';
import { getRoomByNumber } from '@/data/rooms';
import clsx from 'clsx';

export function GuestHome() {
  const { roomNumber = '' } = useParams();
  const navigate = useNavigate();
  const { getActiveRequestsForRoom } = useAppData();
  const { isDesktop } = useViewMode();
  const room = getRoomByNumber(roomNumber);
  const activeRequests = getActiveRequestsForRoom(roomNumber);
  const quickActions = quickActionSlugs.map((slug) => serviceCategories.find((c) => c.slug === slug)!).filter(Boolean);
  const mainCategories = serviceCategories.filter((c) => c.type !== 'emergency');

  const firstName = room?.guestName?.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-sm bg-cream-50 bg-deco-pattern px-6 py-7 text-navy-900 ring-1 ring-line">
        <DecoCorner className="absolute right-4 top-4 h-6 w-6 -scale-x-100 text-gold-500/45" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">{greeting}{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">Merhaba, Oda {roomNumber}</h1>
        <p className="mt-2 text-sm text-navy-500">Size nasıl yardımcı olabiliriz?</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-navy-600">
          {room?.checkOut && (
            <span className="flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1.5">
              <Icon name="LogOut" className="h-3.5 w-3.5 text-gold-600" />
              Çıkış: {new Date(room.checkOut).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {room?.guestCount && (
            <span className="flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1.5">
              <Icon name="Users" className="h-3.5 w-3.5 text-gold-600" />
              {room.guestCount} misafir
            </span>
          )}
        </div>
      </section>

      {room && <RoomSpecsStrip room={room} />}

      {activeRequests.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-900">Aktif Talepleriniz</h2>
            <button onClick={() => navigate(`/guest/room/${roomNumber}/requests`)} className="text-xs font-semibold text-gold-600">
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-3">
            {activeRequests.slice(0, 2).map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">Hızlı Erişim</h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {quickActions.map((cat) => (
            <CategoryCard key={cat.id} category={cat} compact />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy-900">Otel Hizmetleri</h2>
          <button onClick={() => navigate(`/guest/room/${roomNumber}/services`)} className="text-xs font-semibold text-gold-600">
            Tümü
          </button>
        </div>
        <div className={clsx('grid gap-3', isDesktop ? 'grid-cols-3' : 'grid-cols-2')}>
          {mainCategories.slice(0, isDesktop ? 9 : 6).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  );
}
