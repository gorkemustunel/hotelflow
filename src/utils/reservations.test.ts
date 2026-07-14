import { describe, expect, it } from 'vitest';
import type { Reservation } from '@/types';
import { addDays, getReservationStatus, nightsBetween, reservationDateRange, todayIso } from './reservations';

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 'res-1',
    roomNumber: '101',
    guestName: 'Test Misafir',
    guestCount: 2,
    checkIn: '2026-07-01',
    checkOut: '2026-07-05',
    createdByName: 'Test',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('todayIso / addDays', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const iso = todayIso(new Date(2026, 6, 8)); // 8 Temmuz 2026 (yerel)
    expect(iso).toBe('2026-07-08');
  });

  it('adds days without drifting across month boundaries', () => {
    expect(addDays('2026-07-30', 3)).toBe('2026-08-02');
  });

  it('handles negative day offsets', () => {
    expect(addDays('2026-07-01', -1)).toBe('2026-06-30');
  });
});

describe('getReservationStatus', () => {
  it('is "cancelled" when the reservation was cancelled, regardless of dates', () => {
    const reservation = makeReservation({ cancelled: true, checkIn: '2020-01-01', checkOut: '2020-01-05' });
    expect(getReservationStatus(reservation, new Date(2026, 6, 8))).toBe('cancelled');
  });

  it('is "upcoming" before check-in', () => {
    const reservation = makeReservation({ checkIn: '2026-07-10', checkOut: '2026-07-15' });
    expect(getReservationStatus(reservation, new Date(2026, 6, 8))).toBe('upcoming');
  });

  it('is "active" between check-in (inclusive) and check-out (exclusive)', () => {
    const reservation = makeReservation({ checkIn: '2026-07-01', checkOut: '2026-07-10' });
    expect(getReservationStatus(reservation, new Date(2026, 6, 1))).toBe('active');
    expect(getReservationStatus(reservation, new Date(2026, 6, 8))).toBe('active');
  });

  it('is "completed" on and after check-out day', () => {
    const reservation = makeReservation({ checkIn: '2026-07-01', checkOut: '2026-07-05' });
    expect(getReservationStatus(reservation, new Date(2026, 6, 5))).toBe('completed');
    expect(getReservationStatus(reservation, new Date(2026, 6, 20))).toBe('completed');
  });
});

describe('reservationDateRange', () => {
  it('includes check-in but excludes check-out', () => {
    const reservation = makeReservation({ checkIn: '2026-07-01', checkOut: '2026-07-04' });
    expect(reservationDateRange(reservation)).toEqual(['2026-07-01', '2026-07-02', '2026-07-03']);
  });
});

describe('nightsBetween', () => {
  it('computes whole nights between two dates', () => {
    expect(nightsBetween('2026-07-01', '2026-07-05')).toBe(4);
  });

  it('never returns fewer than 1 night', () => {
    expect(nightsBetween('2026-07-01', '2026-07-01')).toBe(1);
  });
});
