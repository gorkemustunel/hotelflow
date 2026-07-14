import type { Reservation, ReservationStatus } from '@/types';

// All date-only arithmetic below is deliberately anchored to UTC internally
// (via Date.UTC / getUTC*) so it never drifts a day depending on the
// visitor's timezone offset — a real risk for Turkey (UTC+3) if we round-tripped
// through `new Date(iso).toISOString()` using local-time parsing instead.
function toIsoDateUTC(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

/** Today's date (YYYY-MM-DD) in the browser's local calendar. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDateUTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDateUTC(y, m - 1, d + n);
}

/** Reservation status is never stored — it's always derived from today's
 * date vs. the stay's check-in/check-out, so it can't drift out of sync. */
export function getReservationStatus(reservation: Reservation, now: Date = new Date()): ReservationStatus {
  if (reservation.cancelled) return 'cancelled';
  const today = todayIso(now);
  if (today < reservation.checkIn) return 'upcoming';
  if (today >= reservation.checkOut) return 'completed';
  return 'active';
}

/** Inclusive list of ISO date strings (YYYY-MM-DD) a reservation occupies —
 * check-out day itself is excluded since the room turns over that morning. */
export function reservationDateRange(reservation: Reservation): string[] {
  const dates: string[] = [];
  let cursor = reservation.checkIn;
  while (cursor < reservation.checkOut) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const [y1, m1, d1] = checkIn.split('-').map(Number);
  const [y2, m2, d2] = checkOut.split('-').map(Number);
  const ms = Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1);
  return Math.max(1, Math.round(ms / 86400000));
}
