import { useMemo, useState } from 'react';
import { useAppData, ACTIVE_STATUSES } from '@/context/AppDataContext';
import { useOperations } from '@/context/OperationsContext';
import { useToast } from '@/context/ToastContext';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QRCardPreview } from '@/components/admin/QRCardPreview';
import {
  CLEANING_STATUS_LABELS,
  OCCUPANCY_LABELS,
  ROOM_TYPE_LABELS,
  TECHNICAL_STATUS_LABELS,
  type CleaningStatus,
  type OccupancyStatus,
  type Room,
} from '@/types';
import { formatDateTime } from '@/utils/time';
import clsx from 'clsx';

const OCCUPANCY_STYLES: Record<OccupancyStatus, string> = {
  occupied: 'bg-navy-900/10 text-navy-800',
  vacant: 'bg-emerald-500/10 text-emerald-700',
  reserved: 'bg-gold-500/15 text-gold-700',
};

const CLEANING_STYLES: Record<CleaningStatus, string> = {
  clean: 'bg-emerald-500/10 text-emerald-700',
  dirty: 'bg-ruby-500/10 text-ruby-700',
  preparing: 'bg-amber-500/10 text-amber-700',
  inspection_pending: 'bg-navy-900/10 text-navy-700',
};

function RoomCard({
  room,
  activeCount,
  onOpenQr,
  onOpenHistory,
}: {
  room: Room;
  activeCount: number;
  onOpenQr: () => void;
  onOpenHistory: () => void;
}) {
  const { setRoomOccupancy, setRoomCleaning, setRoomTechnical, has } = useOperations();
  const { showToast } = useToast();

  const canOccupancy = has('update_room_status');
  const canCleaning = has('manage_room_cleaning_status');
  const canMaintenance = has('manage_rooms');
  const canQr = has('manage_qr_codes');

  const guard = (allowed: boolean, action: () => void) => {
    if (!allowed) {
      showToast('Bu işlem için yetkiniz yok.', 'error');
      return;
    }
    action();
  };

  const occupancy = room.occupancy ?? 'vacant';
  const cleaning = room.cleaningStatus ?? 'clean';
  const technical = room.technicalStatus ?? 'ok';

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-xl font-bold text-navy-900">Oda {room.number}</p>
          <p className="text-xs text-navy-400">{room.floor}. Kat · {ROOM_TYPE_LABELS[room.type]}</p>
        </div>
        {technical !== 'ok' && (
          <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-semibold', technical === 'maintenance' ? 'bg-ruby-500/10 text-ruby-700' : 'bg-amber-500/10 text-amber-700')}>
            {TECHNICAL_STATUS_LABELS[technical]}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-semibold', OCCUPANCY_STYLES[occupancy])}>{OCCUPANCY_LABELS[occupancy]}</span>
        <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-semibold', CLEANING_STYLES[cleaning])}>{CLEANING_STATUS_LABELS[cleaning]}</span>
      </div>

      {room.guestName ? (
        <div className="flex items-center gap-2 text-xs text-navy-500">
          <Icon name="UserRound" className="h-3.5 w-3.5" />
          {room.guestName} · {room.guestCount} misafir
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <Icon name="UserX" className="h-3.5 w-3.5" />
          Misafir yok
        </div>
      )}

      {(room.checkIn || room.checkOut) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-navy-400">
          {room.checkIn && <span>Giriş: {room.checkIn}</span>}
          {room.checkOut && <span>Çıkış: {room.checkOut}</span>}
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-gold-500/10 px-2.5 py-1.5 text-xs font-semibold text-gold-700">
          <Icon name="Bell" className="h-3.5 w-3.5" />
          {activeCount} aktif talep
        </div>
      )}

      <div className="space-y-2 border-t border-navy-900/5 pt-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-[10px] font-semibold uppercase tracking-wide text-navy-400">Doluluk</span>
          {(['occupied', 'vacant', 'reserved'] as OccupancyStatus[]).map((v) => (
            <button
              key={v}
              disabled={occupancy === v}
              onClick={() => guard(canOccupancy, () => setRoomOccupancy(room.id, v))}
              className={clsx(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
                canOccupancy ? 'bg-cream-100 text-navy-700 hover:bg-cream-200' : 'bg-cream-100 text-navy-300',
              )}
            >
              {v === 'occupied' ? 'Dolu Yap' : v === 'vacant' ? 'Boş Yap' : 'Rezerve Yap'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-[10px] font-semibold uppercase tracking-wide text-navy-400">Temizlik</span>
          {(['clean', 'dirty'] as CleaningStatus[]).map((v) => (
            <button
              key={v}
              disabled={cleaning === v}
              onClick={() => guard(canCleaning, () => setRoomCleaning(room.id, v))}
              className={clsx(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
                canCleaning ? 'bg-cream-100 text-navy-700 hover:bg-cream-200' : 'bg-cream-100 text-navy-300',
              )}
            >
              {v === 'clean' ? 'Temiz İşaretle' : 'Kirli İşaretle'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-[10px] font-semibold uppercase tracking-wide text-navy-400">Teknik</span>
          <button
            onClick={() => guard(canMaintenance, () => setRoomTechnical(room.id, technical === 'maintenance' ? 'ok' : 'maintenance'))}
            className={clsx(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
              canMaintenance ? 'bg-cream-100 text-navy-700 hover:bg-cream-200' : 'bg-cream-100 text-navy-300',
            )}
          >
            {technical === 'maintenance' ? 'Bakımdan Çıkar' : 'Bakıma Al'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-navy-900/5 pt-3">
        <button
          onClick={() => guard(canQr, onOpenQr)}
          className={clsx('flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition', canQr ? 'bg-navy-900 text-white hover:bg-navy-800' : 'bg-navy-900/40 text-white')}
        >
          <Icon name="QrCode" className="h-3.5 w-3.5" />
          QR Kod
        </button>
        <button onClick={onOpenHistory} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cream-100 py-2 text-xs font-semibold text-navy-700 transition hover:bg-cream-200">
          <Icon name="History" className="h-3.5 w-3.5" />
          Geçmiş
        </button>
      </div>
    </div>
  );
}

export function RoomsPage() {
  const { requests } = useAppData();
  const { rooms } = useOperations();
  const [search, setSearch] = useState('');
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | OccupancyStatus>('all');
  const [qrRoom, setQrRoom] = useState<Room | null>(null);
  const [historyRoom, setHistoryRoom] = useState<Room | null>(null);

  const filtered = useMemo(
    () =>
      rooms.filter((r) => {
        if (occupancyFilter !== 'all' && (r.occupancy ?? 'vacant') !== occupancyFilter) return false;
        if (search && !r.number.includes(search) && !(r.guestName ?? '').toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [rooms, search, occupancyFilter],
  );

  const activeCountFor = (roomNumber: string) => requests.filter((r) => r.roomNumber === roomNumber && ACTIVE_STATUSES.includes(r.status)).length;
  const historyFor = (roomNumber: string) => requests.filter((r) => r.roomNumber === roomNumber).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Oda Durumu Yönetimi</h1>
        <p className="mt-1 text-sm text-navy-500">{rooms.length} oda · doluluk, temizlik ve teknik durum tek ekranda</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <Icon name="Search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Oda no veya misafir ara…"
            className="rounded-xl border border-navy-900/10 bg-cream-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
        <select
          value={occupancyFilter}
          onChange={(e) => setOccupancyFilter(e.target.value as 'all' | OccupancyStatus)}
          className="rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2.5 text-xs font-medium text-navy-700 outline-none focus:border-gold-500"
        >
          <option value="all">Tüm Doluluk Durumları</option>
          {Object.entries(OCCUPANCY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            activeCount={activeCountFor(room.number)}
            onOpenQr={() => setQrRoom(room)}
            onOpenHistory={() => setHistoryRoom(room)}
          />
        ))}
      </div>

      <Modal open={!!qrRoom} onClose={() => setQrRoom(null)} title={qrRoom ? `Oda ${qrRoom.number} QR Kartı` : ''}>
        {qrRoom && <QRCardPreview room={qrRoom} />}
      </Modal>

      <Modal open={!!historyRoom} onClose={() => setHistoryRoom(null)} title={historyRoom ? `Oda ${historyRoom.number} · Talep Geçmişi` : ''}>
        {historyRoom && (
          <div className="space-y-3">
            {historyFor(historyRoom.number).length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-400">Bu oda için henüz talep bulunmuyor.</p>
            ) : (
              historyFor(historyRoom.number).map((r) => (
                <div key={r.id} className="rounded-xl bg-cream-50 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy-900">{r.categoryName}</p>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="mt-1 text-xs text-navy-500">{r.description}</p>
                  <p className="mt-1.5 text-[11px] text-navy-400">{formatDateTime(r.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
