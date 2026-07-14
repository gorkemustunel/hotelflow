import type { Room, RoomType, RoomTypeSpec } from '@/types';

export const ROOM_TYPE_SPECS: Record<RoomType, RoomTypeSpec> = {
  standard: { sizeM2: 28, bedType: 'Queen Yatak', bathroomCount: 1, maxGuests: 2, view: 'Şehir Manzarası' },
  deluxe: { sizeM2: 38, bedType: 'King Yatak', bathroomCount: 1, maxGuests: 3, view: 'Boğaz Manzarası' },
  suite: { sizeM2: 65, bedType: 'King Yatak + Oturma Odası', bathroomCount: 2, maxGuests: 3, view: 'Boğaz Manzarası' },
  family: { sizeM2: 52, bedType: '2 Yatak Odası', bathroomCount: 2, maxGuests: 4, view: 'Bahçe Manzarası' },
};

// occupancy / cleaningStatus / technicalStatus are the new granular fields
// used by Oda Durumu Yönetimi; `status` is kept in sync for older screens
// that still just read the coarse four-value status.
export const rooms: Room[] = [
  { id: 'r101', number: '101', floor: 1, type: 'standard', status: 'occupied', guestName: 'Kerem Öztürk', guestCount: 2, checkIn: '2026-06-30', checkOut: '2026-07-04', lastCleanedAt: '2026-07-02T09:10:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r102', number: '102', floor: 1, type: 'standard', status: 'occupied', guestName: 'Naz Aksoy', guestCount: 1, checkIn: '2026-06-29', checkOut: '2026-07-03', lastCleanedAt: '2026-07-02T08:40:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r103', number: '103', floor: 1, type: 'standard', status: 'occupied', guestName: 'Orkun Bilgin', guestCount: 2, checkIn: '2026-07-01', checkOut: '2026-07-05', lastCleanedAt: '2026-07-01T10:00:00', occupancy: 'occupied', cleaningStatus: 'dirty', technicalStatus: 'ok' },
  { id: 'r104', number: '104', floor: 1, type: 'standard', status: 'vacant', lastCleanedAt: '2026-07-02T07:30:00', occupancy: 'vacant', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r201', number: '201', floor: 2, type: 'deluxe', status: 'occupied', guestName: 'Sibel Korkmaz', guestCount: 2, checkIn: '2026-06-28', checkOut: '2026-07-03', lastCleanedAt: '2026-07-02T09:00:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r202', number: '202', floor: 2, type: 'deluxe', status: 'occupied', guestName: 'Tarık Ersoy', guestCount: 3, checkIn: '2026-07-01', checkOut: '2026-07-06', lastCleanedAt: '2026-07-02T08:15:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'issue' },
  { id: 'r203', number: '203', floor: 2, type: 'deluxe', status: 'cleaning', lastCleanedAt: '2026-07-02T11:20:00', occupancy: 'vacant', cleaningStatus: 'preparing', technicalStatus: 'ok' },
  { id: 'r305', number: '305', floor: 3, type: 'deluxe', status: 'occupied', guestName: 'Görkem Ünal', guestCount: 2, checkIn: '2026-06-30', checkOut: '2026-07-05', lastCleanedAt: '2026-07-02T09:45:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r306', number: '306', floor: 3, type: 'standard', status: 'vacant', lastCleanedAt: '2026-07-01T16:00:00', occupancy: 'reserved', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r401', number: '401', floor: 4, type: 'suite', status: 'occupied', guestName: 'Pelin Yıldız', guestCount: 2, checkIn: '2026-06-27', checkOut: '2026-07-04', lastCleanedAt: '2026-07-02T08:55:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r402', number: '402', floor: 4, type: 'suite', status: 'maintenance', notes: 'Banyo armatürü değişimi bekleniyor', lastCleanedAt: '2026-06-30T12:00:00', occupancy: 'vacant', cleaningStatus: 'inspection_pending', technicalStatus: 'maintenance' },
  { id: 'r502', number: '502', floor: 5, type: 'family', status: 'occupied', guestName: 'Aylin & Burak Çetin', guestCount: 4, checkIn: '2026-06-29', checkOut: '2026-07-06', lastCleanedAt: '2026-07-02T09:30:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r503', number: '503', floor: 5, type: 'deluxe', status: 'vacant', lastCleanedAt: '2026-07-02T07:50:00', occupancy: 'vacant', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r601', number: '601', floor: 6, type: 'suite', status: 'occupied', guestName: 'Emre Karaca', guestCount: 1, checkIn: '2026-07-01', checkOut: '2026-07-08', lastCleanedAt: '2026-07-02T08:20:00', occupancy: 'occupied', cleaningStatus: 'clean', technicalStatus: 'ok' },
  { id: 'r712', number: '712', floor: 7, type: 'suite', status: 'occupied', guestName: 'Léa Fontaine', guestCount: 2, checkIn: '2026-06-30', checkOut: '2026-07-03', lastCleanedAt: '2026-07-02T09:05:00', occupancy: 'occupied', cleaningStatus: 'dirty', technicalStatus: 'ok' },
];

export const getRoomByNumber = (number: string) => rooms.find((r) => r.number === number);
