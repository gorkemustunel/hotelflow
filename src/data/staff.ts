import type { Staff } from '@/types';

export const staff: Staff[] = [
  { id: 's0', roleId: 'super_admin', active: true, lastActionAt: '2026-07-06T08:10:00', name: 'Ahmet Demir', department: 'management', role: 'Super Admin / Otel Sahibi', initials: 'AD', color: '#0a1628', phone: '0532 111 22 00', rating: 5.0, completedToday: 0, activeTasks: 0, avgResolutionMinutes: 0, onDuty: true },
  { id: 's9', roleId: 'hotel_manager', active: true, lastActionAt: '2026-07-06T09:05:00', name: 'Zeynep Yıldız', department: 'management', role: 'Otel Yöneticisi', initials: 'ZY', color: '#17805a', phone: '0532 111 22 09', rating: 4.9, completedToday: 0, activeTasks: 0, avgResolutionMinutes: 0, onDuty: true },
  { id: 's1', roleId: 'housekeeping', active: true, lastActionAt: '2026-07-06T08:40:00', name: 'Ayşe Yılmaz', department: 'housekeeping', role: 'Kat Hizmetleri Sorumlusu', initials: 'AY', color: '#c39a4e', phone: '0532 111 22 01', rating: 4.9, completedToday: 8, activeTasks: 2, avgResolutionMinutes: 18, onDuty: true },
  { id: 's2', roleId: 'housekeeping', active: true, lastActionAt: '2026-07-05T17:20:00', name: 'Zeynep Arı', department: 'housekeeping', role: 'Kat Görevlisi', initials: 'ZA', color: '#a67f3a', phone: '0532 111 22 02', rating: 4.7, completedToday: 6, activeTasks: 1, avgResolutionMinutes: 21, onDuty: true },
  { id: 's3', roleId: 'technical', active: true, lastActionAt: '2026-07-06T07:55:00', name: 'Mehmet Kaya', department: 'technical', role: 'Teknik Servis Uzmanı', initials: 'MK', color: '#26456f', phone: '0532 111 22 03', rating: 4.8, completedToday: 5, activeTasks: 1, avgResolutionMinutes: 34, onDuty: true },
  { id: 's4', roleId: 'technical', active: true, lastActionAt: '2026-07-04T14:10:00', name: 'Burak Şahin', department: 'technical', role: 'Teknik Servis', initials: 'BŞ', color: '#335686', phone: '0532 111 22 04', rating: 4.6, completedToday: 3, activeTasks: 0, avgResolutionMinutes: 29, onDuty: false },
  { id: 's5', roleId: 'reception', active: true, lastActionAt: '2026-07-06T09:30:00', name: 'Elif Demir', department: 'reception', role: 'Ön Büro Sorumlusu', initials: 'ED', color: '#0f1f38', phone: '0532 111 22 05', rating: 4.9, completedToday: 12, activeTasks: 3, avgResolutionMinutes: 9, onDuty: true },
  { id: 's6', roleId: 'room_service', active: true, lastActionAt: '2026-07-06T08:50:00', name: 'Can Arslan', department: 'room_service', role: 'Oda Servisi / Restoran', initials: 'CA', color: '#17805a', phone: '0532 111 22 06', rating: 4.8, completedToday: 10, activeTasks: 2, avgResolutionMinutes: 24, onDuty: true },
  { id: 's7', roleId: 'spa', active: true, lastActionAt: '2026-07-06T08:15:00', name: 'Selin Koç', department: 'spa', role: 'Spa & Wellness Uzmanı', initials: 'SK', color: '#d4af6a', phone: '0532 111 22 07', rating: 5.0, completedToday: 4, activeTasks: 1, avgResolutionMinutes: 15, onDuty: true },
  { id: 's10', roleId: 'chef', active: true, lastActionAt: '2026-07-06T06:45:00', name: 'Murat Usta', department: 'kitchen', role: 'Aşçı / Mutfak Şefi', initials: 'MU', color: '#a8823f', phone: '0532 111 22 10', rating: 4.9, completedToday: 6, activeTasks: 1, avgResolutionMinutes: 12, onDuty: true },
];

/** The 8 named personas from the demo-user switcher — a subset of `staff`
 * (the remaining entries are extra personnel shown only in Staff Management,
 * for a more realistic-looking roster). */
export const DEMO_SWITCH_USER_IDS = ['s0', 's9', 's5', 's1', 's3', 's6', 's10', 's7'];

export const getStaffById = (id: string) => staff.find((s) => s.id === id);
export const getStaffByDepartment = (department: string) => staff.filter((s) => s.department === department);
export const getDemoSwitchUsers = () => DEMO_SWITCH_USER_IDS.map((id) => staff.find((s) => s.id === id)!).filter(Boolean);
