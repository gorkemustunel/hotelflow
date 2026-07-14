import type { Reservation } from '@/types';

// Seed reservations. Where a room already has a guest checked in (see
// data/rooms.ts), there is a matching "active" reservation here — the two
// files describe the same stay from two different angles (room's live
// status vs. the booking timeline). Additional upcoming/past entries round
// out the calendar so ReservationsPage has something to show on every row.
export const reservations: Reservation[] = [
  // --- current stays (mirrors occupied rooms in data/rooms.ts) ---
  { id: 'res-101a', roomNumber: '101', guestName: 'Kerem Öztürk', guestCount: 2, checkIn: '2026-06-30', checkOut: '2026-07-04', createdByName: 'Elif Demir', createdAt: '2026-06-25T10:00:00' },
  { id: 'res-102a', roomNumber: '102', guestName: 'Naz Aksoy', guestCount: 1, checkIn: '2026-06-29', checkOut: '2026-07-03', createdByName: 'Elif Demir', createdAt: '2026-06-20T11:30:00' },
  { id: 'res-103a', roomNumber: '103', guestName: 'Orkun Bilgin', guestCount: 2, checkIn: '2026-07-01', checkOut: '2026-07-05', createdByName: 'Elif Demir', createdAt: '2026-06-22T09:15:00' },
  { id: 'res-201a', roomNumber: '201', guestName: 'Sibel Korkmaz', guestCount: 2, checkIn: '2026-06-28', checkOut: '2026-07-03', createdByName: 'Elif Demir', createdAt: '2026-06-18T14:00:00' },
  { id: 'res-202a', roomNumber: '202', guestName: 'Tarık Ersoy', guestCount: 3, checkIn: '2026-07-01', checkOut: '2026-07-06', createdByName: 'Elif Demir', createdAt: '2026-06-24T16:45:00' },
  { id: 'res-305a', roomNumber: '305', guestName: 'Görkem Ünal', guestCount: 2, checkIn: '2026-06-30', checkOut: '2026-07-05', createdByName: 'Elif Demir', createdAt: '2026-06-21T08:30:00' },
  { id: 'res-401a', roomNumber: '401', guestName: 'Pelin Yıldız', guestCount: 2, checkIn: '2026-06-27', checkOut: '2026-07-04', createdByName: 'Elif Demir', createdAt: '2026-06-15T12:00:00' },
  { id: 'res-502a', roomNumber: '502', guestName: 'Aylin & Burak Çetin', guestCount: 4, checkIn: '2026-06-29', checkOut: '2026-07-06', createdByName: 'Elif Demir', createdAt: '2026-06-19T10:20:00' },
  { id: 'res-601a', roomNumber: '601', guestName: 'Emre Karaca', guestCount: 1, checkIn: '2026-07-01', checkOut: '2026-07-08', createdByName: 'Elif Demir', createdAt: '2026-06-23T13:10:00' },
  { id: 'res-712a', roomNumber: '712', guestName: 'Léa Fontaine', guestCount: 2, checkIn: '2026-06-30', checkOut: '2026-07-03', createdByName: 'Elif Demir', createdAt: '2026-06-20T15:40:00' },

  // --- upcoming reservations (rooms currently vacant / reserved) ---
  { id: 'res-104u', roomNumber: '104', guestName: 'Deniz Aydın', guestCount: 2, checkIn: '2026-07-10', checkOut: '2026-07-13', createdByName: 'Elif Demir', createdAt: '2026-07-01T09:00:00' },
  { id: 'res-203u', roomNumber: '203', guestName: 'Hakan Öz', guestCount: 1, checkIn: '2026-07-09', checkOut: '2026-07-11', createdByName: 'Elif Demir', createdAt: '2026-07-02T11:20:00' },
  { id: 'res-306u', roomNumber: '306', guestName: 'Ceren Bulut', guestCount: 2, checkIn: '2026-07-09', checkOut: '2026-07-12', createdByName: 'Elif Demir', createdAt: '2026-07-03T14:00:00' },
  { id: 'res-503u', roomNumber: '503', guestName: 'James Whitfield', guestCount: 2, checkIn: '2026-07-11', checkOut: '2026-07-15', createdByName: 'Elif Demir', createdAt: '2026-07-04T10:10:00' },

  // --- next bookings for currently-occupied rooms (shows the pipeline) ---
  { id: 'res-101b', roomNumber: '101', guestName: 'Selim Kurt', guestCount: 1, checkIn: '2026-07-05', checkOut: '2026-07-09', createdByName: 'Elif Demir', createdAt: '2026-06-27T09:40:00' },
  { id: 'res-201b', roomNumber: '201', guestName: 'Ege Yavuz', guestCount: 2, checkIn: '2026-07-04', checkOut: '2026-07-08', createdByName: 'Elif Demir', createdAt: '2026-06-26T17:00:00' },
  { id: 'res-712b', roomNumber: '712', guestName: 'Marco Rossi', guestCount: 2, checkIn: '2026-07-04', checkOut: '2026-07-09', createdByName: 'Elif Demir', createdAt: '2026-06-28T08:20:00' },

  // --- past stay (already completed) ---
  { id: 'res-402p', roomNumber: '402', guestName: 'Yusuf Aktaş', guestCount: 2, checkIn: '2026-06-20', checkOut: '2026-06-25', createdByName: 'Elif Demir', createdAt: '2026-06-10T09:00:00' },

  // --- cancelled reservation ---
  { id: 'res-503c', roomNumber: '503', guestName: 'Nihal Ergin', guestCount: 1, checkIn: '2026-07-07', checkOut: '2026-07-09', createdByName: 'Elif Demir', createdAt: '2026-06-29T12:00:00', cancelled: true, notes: 'Misafir talebiyle iptal edildi.' },
];
