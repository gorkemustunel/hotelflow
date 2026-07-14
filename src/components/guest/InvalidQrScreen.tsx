import { Icon } from '@/components/common/Icon';

/**
 * Rendered instead of the entire guest experience when the QR token in the
 * URL doesn't match the room's current valid token — e.g. a guest scanning
 * a printed QR card after the front desk has renewed it for the next
 * reservation. Deliberately shows no room number, guest name, or any other
 * data: an invalidated link should reveal nothing about the room.
 */
export function InvalidQrScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-100 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ruby-500/10">
        <Icon name="QrCode" className="h-8 w-8 text-ruby-500" />
      </div>
      <h1 className="mt-5 font-display text-xl font-semibold text-navy-900">Bu QR Kodu Artık Geçerli Değil</h1>
      <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-navy-500">
        Bu bağlantı yenilenmiş. Lütfen odanızdaki veya resepsiyondaki güncel QR kodu okutun.
      </p>
    </div>
  );
}
