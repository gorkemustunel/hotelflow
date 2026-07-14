import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { useToast } from '@/context/ToastContext';
import { useOperations } from '@/context/OperationsContext';
import type { Room } from '@/types';

export function buildGuestUrl(roomNumber: string, token: string) {
  return `${window.location.origin}/guest/room/${roomNumber}?t=${token}`;
}

export function QRCardPreview({ room }: { room: Room }) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { qrTokens, regenerateRoomQr, has } = useOperations();
  const token = qrTokens[room.number] ?? '';
  const url = buildGuestUrl(room.number, token);
  const canRegenerate = has('manage_qr_codes');

  const handleRegenerate = () => {
    if (!canRegenerate) {
      showToast('Bu işlem için yetkiniz yok.', 'error');
      return;
    }
    regenerateRoomQr(room.number);
    showToast(`Oda ${room.number} için QR kodu yenilendi. Eski QR kartları artık çalışmayacak.`, 'success');
  };

  const handleDownloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `hotelflow-oda-${room.number}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast(`Oda ${room.number} QR kodu PNG olarak indirildi.`, 'success');
  };

  const handlePrint = () => {
    showToast('Yazdırma / PDF önizlemesi açılıyor…', 'info');
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div id={`qr-print-card-${room.number}`} className="flex w-full max-w-[300px] flex-col items-center rounded-[28px] bg-navy-950 bg-noise p-7 text-center text-white shadow-lifted">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-400/30">
          <Icon name="Gem" className="h-5 w-5 text-gold-400" />
        </div>
        <p className="font-display text-sm font-semibold tracking-wide">HotelFlow</p>
        <p className="text-[10px] uppercase tracking-widest text-gold-400/80">Bosphorus Residence</p>

        <div ref={canvasWrapRef} className="my-6 rounded-2xl bg-white p-4">
          <QRCodeCanvas value={url} size={168} bgColor="#ffffff" fgColor="#0a1628" level="M" />
        </div>

        <p className="font-display text-2xl font-bold">Oda {room.number}</p>
        <p className="mt-3 max-w-[200px] text-xs leading-relaxed text-navy-300">
          Odanızdaki tüm ihtiyaçlar için kamerayla tarayın
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-navy-400">
          <Icon name="Smartphone" className="h-3 w-3" />
          <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>

      <div className="flex w-full gap-2.5">
        <Button fullWidth variant="secondary" icon={<Icon name="Download" className="h-4 w-4" />} onClick={handleDownloadPng}>
          PNG İndir
        </Button>
        <Button fullWidth variant="gold" icon={<Icon name="Printer" className="h-4 w-4" />} onClick={handlePrint}>
          Yazdır / PDF
        </Button>
      </div>

      <button
        onClick={handleRegenerate}
        className={
          canRegenerate
            ? 'flex w-full items-center justify-center gap-1.5 rounded-lg bg-ruby-500/10 py-2.5 text-xs font-semibold text-ruby-600 transition hover:bg-ruby-500/20'
            : 'flex w-full items-center justify-center gap-1.5 rounded-lg bg-navy-900/5 py-2.5 text-xs font-semibold text-navy-300'
        }
      >
        <Icon name="RefreshCw" className="h-3.5 w-3.5" />
        QR Kodu Yenile
      </button>
      <p className="-mt-3 text-center text-[11px] leading-relaxed text-navy-400">
        Yenilendiğinde bu odanın önceki QR kartları/linkleri artık çalışmaz.
      </p>
    </div>
  );
}
