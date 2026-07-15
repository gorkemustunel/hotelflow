import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { DecoDivider } from '@/components/common/DecoDivider';
import { DecoCorner } from '@/components/common/DecoCorner';
import { useOperations } from '@/context/OperationsContext';

// This is deliberately guest-only. In a real deployment `/` is never visited
// directly — guests land here exclusively via a room's QR code, and
// admin/staff reach their own panels via URLs they already know
// (`/admin-select`, `/staff`) rather than a shared "pick your role" screen.
// The three panels intentionally do not link to one another anywhere in the
// app (see AdminSelectPage/StaffSelectPage headers), matching how a real
// property would separate a public guest surface from internal staff tools.
export function RoleSelectPage() {
  const navigate = useNavigate();
  const { qrTokens, rooms, hotelInfo } = useOperations();

  return (
    <div className="min-h-screen bg-cream-100 bg-deco-pattern">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 sm:py-16">
        <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/15 ring-1 ring-gold-400/30">
            <Icon name="Gem" className="h-7 w-7 text-gold-600" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">{hotelInfo.hotelName}</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide text-navy-900 sm:text-5xl">HotelFlow</h1>
          <p className="mt-3 max-w-md text-sm text-navy-500 sm:text-base">
            Odanızdaki QR kodu okutarak misafir deneyimine ulaşırsınız. Bu demo ortamında gerçek bir QR taramasını simüle etmek için aşağıdan bir oda seçebilirsiniz.
          </p>
          <DecoDivider variant="light" className="mt-8 w-40 sm:w-56" />
        </div>

        <div className="relative overflow-hidden rounded-sm bg-cream-50 p-6 ring-1 ring-line sm:p-8">
          <DecoCorner className="absolute left-3 top-3 h-5 w-5 text-gold-500/50" />
          <DecoCorner className="absolute bottom-3 right-3 h-5 w-5 -scale-x-100 -scale-y-100 text-gold-500/50" />
          <h2 className="mb-1 font-display text-lg font-semibold text-navy-900">Bir Oda Seçin</h2>
          <p className="mb-5 text-sm text-navy-500">Seçtiğiniz odanın misafir ekranı, o odaya ait geçerli QR token'ıyla açılır.</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/guest/room/${room.number}?t=${qrTokens[room.number]}`)}
                className="flex flex-col items-center gap-1 rounded-xl bg-cream-100 py-3.5 ring-1 ring-navy-900/10 transition hover:bg-gold-500/10 hover:ring-gold-500/30"
              >
                <span className="font-display text-base font-bold text-navy-900">{room.number}</span>
                <span className="text-[10px] text-navy-400">{room.floor}. Kat</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-1 pt-16 text-center text-xs text-navy-400">
          <p>HotelFlow v1.0 — Demo Ortamı</p>
          <p>Gerçek veri değildir. Tüm oda, misafir ve talep bilgileri örnek amaçlıdır.</p>
        </div>
      </div>
    </div>
  );
}
