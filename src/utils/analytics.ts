import type { GuestRequest, Staff } from '@/types';
import { staff as staffList } from '@/data/staff';

const ACTIVE: GuestRequest['status'][] = ['received', 'assigned', 'preparing', 'on_the_way', 'arrived'];

function isToday(iso: string, now: Date) {
  const d = new Date(iso);
  return d.toDateString() === now.toDateString();
}

/** Shortens a category name for tight chart axes without ever truncating mid-word oddly. */
export function shortenLabel(label: string, maxLength = 10): string {
  if (label.length <= maxLength) return label;
  const truncated = label.slice(0, maxLength).trimEnd();
  return `${truncated}…`;
}

export function computeDashboardMetrics(requests: GuestRequest[], now: Date = new Date()) {
  const todayRequests = requests.filter((r) => isToday(r.createdAt, now));
  const open = requests.filter((r) => ACTIVE.includes(r.status));
  const urgentOpen = open.filter((r) => r.priority === 'urgent');
  const completedToday = todayRequests.filter((r) => r.status === 'completed');

  const resolutionTimes = requests
    .filter((r) => r.status === 'completed')
    .map((r) => (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / 60000);
  const avgResolution = resolutionTimes.length ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) : 0;

  const categoryCounts = new Map<string, number>();
  requests.forEach((r) => categoryCounts.set(r.categoryName, (categoryCounts.get(r.categoryName) ?? 0) + 1));
  const topCategories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ fullName: name, shortName: shortenLabel(name), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const roomCounts = new Map<string, number>();
  requests.forEach((r) => roomCounts.set(r.roomNumber, (roomCounts.get(r.roomNumber) ?? 0) + 1));
  const busiestRoom = Array.from(roomCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  const revenue = requests
    .filter((r) => r.totalPrice && r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.totalPrice ?? 0), 0);

  return {
    totalToday: todayRequests.length,
    open: open.length,
    urgent: urgentOpen.length,
    completedToday: completedToday.length,
    avgResolution,
    topCategories,
    busiestRoom: busiestRoom ? { room: busiestRoom[0], count: busiestRoom[1] } : null,
    revenue,
    recent: [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
  };
}

export function computeStaffPerformance(requests: GuestRequest[], list: Staff[] = staffList) {
  return list.map((s) => {
    const assigned = requests.filter((r) => r.assignedStaffId === s.id);
    const completed = assigned.filter((r) => r.status === 'completed');
    const active = assigned.filter((r) => ACTIVE.includes(r.status));
    return { staff: s, completedCount: completed.length, activeCount: active.length };
  });
}
