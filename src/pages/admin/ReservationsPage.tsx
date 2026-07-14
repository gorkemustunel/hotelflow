import { useMemo, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { FieldLabel, TextInput, TextArea } from '@/components/common/FormField';
import { EmptyState } from '@/components/common/EmptyState';
import { useOperations } from '@/context/OperationsContext';
import { RESERVATION_STATUS_LABELS, type Reservation } from '@/types';
import { getReservationStatus, nightsBetween, addDays, todayIso } from '@/utils/reservations';
import { formatDate } from '@/utils/time';
import clsx from 'clsx';

const DAYS_VISIBLE = 14;

const STATUS_BAR_STYLE: Record<string, string> = {
  upcoming: 'bg-gold-500/85 text-navy-950',
  active: 'bg-navy-900 text-white',
  completed: 'bg-navy-900/15 text-navy-500',
};

function dayLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return {
    weekday: d.toLocaleDateString('tr-TR', { weekday: 'short', timeZone: 'UTC' }),
    day: d.getUTCDate(),
    month: d.toLocaleDateString('tr-TR', { month: 'short', timeZone: 'UTC' }),
  };
}

interface ReservationFormState {
  roomNumber: string;
  guestName: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  notes: string;
}

export function ReservationsPage() {
  const { rooms, reservations, addReservation, cancelReservation, has } = useOperations();
  const canManage = has('manage_reservations');
  const today = todayIso();
  const [rangeStart, setRangeStart] = useState(today);
  const [newOpen, setNewOpen] = useState(false);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [form, setForm] = useState<ReservationFormState>({
    roomNumber: rooms[0]?.number ?? '',
    guestName: '',
    guestCount: 1,
    checkIn: today,
    checkOut: addDays(today, 1),
    notes: '',
  });

  const days = useMemo(() => Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(rangeStart, i)), [rangeStart]);
  const windowEndExclusive = addDays(days[days.length - 1], 1);

  const visibleReservations = useMemo(
    () => reservations.filter((r) => !r.cancelled && r.checkOut > days[0] && r.checkIn < windowEndExclusive),
    [reservations, days, windowEndExclusive],
  );

  const openNewFor = (roomNumber: string, dateIso: string) => {
    setForm({ roomNumber, guestName: '', guestCount: 1, checkIn: dateIso, checkOut: addDays(dateIso, 1), notes: '' });
    setNewOpen(true);
  };

  const submitReservation = () => {
    if (!form.guestName.trim() || form.checkOut <= form.checkIn) return;
    addReservation(form);
    setNewOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Rezervasyonlar</h1>
          <p className="mt-1 text-sm text-navy-500">Oda bazlı {DAYS_VISIBLE} günlük rezervasyon takvimi</p>
        </div>
        {canManage && (
          <Button size="sm" icon={<Icon name="Plus" className="h-4 w-4" />} onClick={() => openNewFor(rooms[0]?.number ?? '', today)}>
            Yeni Rezervasyon
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-cream-50 p-1.5 shadow-card ring-1 ring-navy-900/5">
        <button onClick={() => setRangeStart((prev) => addDays(prev, -7))} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-navy-600 transition hover:bg-cream-100">
          <Icon name="ChevronLeft" className="h-4 w-4" /> Önceki Hafta
        </button>
        <button onClick={() => setRangeStart(today)} className="rounded-lg px-3 py-2 text-xs font-semibold text-gold-600 transition hover:bg-cream-100">
          Bugün
        </button>
        <button onClick={() => setRangeStart((prev) => addDays(prev, 7))} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-navy-600 transition hover:bg-cream-100">
          Sonraki Hafta <Icon name="ChevronRight" className="h-4 w-4" />
        </button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon="CalendarX" title="Oda bulunamadı" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ring-navy-900/5">
          <p className="flex items-center gap-1.5 border-b border-navy-900/5 px-4 py-2 text-[11px] text-navy-400 lg:hidden">
            <Icon name="MoveHorizontal" className="h-3.5 w-3.5" />
            Takvimi görmek için yatay kaydırın
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="flex border-b border-navy-900/5">
                <div className="w-28 shrink-0 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-navy-400">Oda</div>
                <div className="flex flex-1">
                  {days.map((d) => {
                    const l = dayLabel(d);
                    const isToday = d === today;
                    return (
                      <div key={d} className={clsx('flex-1 border-l border-navy-900/5 px-1 py-2 text-center', isToday && 'bg-gold-500/10')}>
                        <p className={clsx('text-[10px] font-semibold uppercase', isToday ? 'text-gold-600' : 'text-navy-400')}>{l.weekday}</p>
                        <p className={clsx('text-xs font-bold', isToday ? 'text-gold-700' : 'text-navy-700')}>
                          {l.day} {l.month}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {rooms.map((room) => {
                const roomReservations = visibleReservations.filter((r) => r.roomNumber === room.number);
                return (
                  <div key={room.id} className="flex border-b border-navy-900/5 last:border-0">
                    <div className="flex w-28 shrink-0 flex-col justify-center px-3 py-3">
                      <p className="font-display text-sm font-bold text-navy-900">{room.number}</p>
                      <p className="text-[10px] text-navy-400">{room.floor}. Kat</p>
                    </div>
                    <div className="relative flex flex-1">
                      {days.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => canManage && openNewFor(room.number, d)}
                          className={clsx(
                            'h-14 flex-1 border-l border-navy-900/5 transition',
                            d === today && 'bg-gold-500/5',
                            canManage && 'hover:bg-cream-100',
                          )}
                        />
                      ))}
                      {roomReservations.map((res) => {
                        const clippedStart = res.checkIn < days[0] ? days[0] : res.checkIn;
                        const clippedEndExclusive = res.checkOut > windowEndExclusive ? windowEndExclusive : res.checkOut;
                        const startIdx = days.indexOf(clippedStart);
                        const spanDays = nightsBetween(clippedStart, clippedEndExclusive);
                        const leftPct = (startIdx / days.length) * 100;
                        const widthPct = (spanDays / days.length) * 100;
                        const status = getReservationStatus(res);
                        return (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => setDetail(res)}
                            style={{ left: `${leftPct}%`, width: `calc(${widthPct}% - 4px)` }}
                            className={clsx(
                              'absolute top-2 flex h-10 items-center truncate rounded-lg px-2.5 text-left text-[11px] font-semibold shadow-soft transition hover:brightness-95',
                              STATUS_BAR_STYLE[status],
                            )}
                          >
                            {res.guestName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-navy-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gold-500" /> Yaklaşan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy-900" /> Konaklıyor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy-900/15" /> Tamamlandı
        </span>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Yeni Rezervasyon">
        <div className="space-y-4">
          <div>
            <FieldLabel>Oda</FieldLabel>
            <select
              value={form.roomNumber}
              onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
              className="w-full rounded-xl border border-navy-900/10 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:bg-cream-50 focus:ring-2 focus:ring-gold-500/20"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.number}>
                  Oda {r.number} · {r.floor}. Kat
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Misafir Adı</FieldLabel>
            <TextInput value={form.guestName} onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))} placeholder="Örn. Ahmet Yılmaz" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Giriş Tarihi</FieldLabel>
              <TextInput
                type="date"
                value={form.checkIn}
                onChange={(e) => {
                  const nextCheckIn = e.target.value;
                  setForm((f) => ({ ...f, checkIn: nextCheckIn, checkOut: nextCheckIn >= f.checkOut ? addDays(nextCheckIn, 1) : f.checkOut }));
                }}
              />
            </div>
            <div>
              <FieldLabel>Çıkış Tarihi</FieldLabel>
              <TextInput type="date" value={form.checkOut} min={addDays(form.checkIn, 1)} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} />
            </div>
          </div>
          <div>
            <FieldLabel>Misafir Sayısı</FieldLabel>
            <TextInput type="number" min={1} max={8} value={form.guestCount} onChange={(e) => setForm((f) => ({ ...f, guestCount: Number(e.target.value) || 1 }))} />
          </div>
          <div>
            <FieldLabel hint="opsiyonel">Not</FieldLabel>
            <TextArea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Özel istekler, geliş saati vb." />
          </div>
          <Button fullWidth onClick={submitReservation} disabled={!form.guestName.trim() || form.checkOut <= form.checkIn}>
            Rezervasyonu Oluştur
          </Button>
        </div>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Oda ${detail.roomNumber} Rezervasyonu` : undefined}>
        {detail && (
          <div className="space-y-3">
            <div>
              <p className="text-lg font-bold text-navy-900">{detail.guestName}</p>
              <p className="text-sm text-navy-500">
                {detail.guestCount} misafir · {nightsBetween(detail.checkIn, detail.checkOut)} gece
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3 text-sm">
              <span className="text-navy-500">Giriş</span>
              <span className="font-semibold text-navy-900">{formatDate(detail.checkIn)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3 text-sm">
              <span className="text-navy-500">Çıkış</span>
              <span className="font-semibold text-navy-900">{formatDate(detail.checkOut)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3 text-sm">
              <span className="text-navy-500">Durum</span>
              <span className="font-semibold text-navy-900">{RESERVATION_STATUS_LABELS[getReservationStatus(detail)]}</span>
            </div>
            {detail.notes && <p className="text-xs leading-relaxed text-navy-500">{detail.notes}</p>}
            <p className="text-[11px] text-navy-400">Oluşturan: {detail.createdByName}</p>
            {canManage && getReservationStatus(detail) !== 'completed' && (
              <Button
                fullWidth
                variant="danger"
                icon={<Icon name="XCircle" className="h-4 w-4" />}
                onClick={() => {
                  cancelReservation(detail.id);
                  setDetail(null);
                }}
              >
                Rezervasyonu İptal Et
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
