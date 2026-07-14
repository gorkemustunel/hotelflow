import type { GuestRequest } from '@/types';
import { elapsedMinutes } from './time';

const ACTIVE: GuestRequest['status'][] = ['received', 'assigned', 'preparing', 'on_the_way', 'arrived'];

const DEFAULT_SLA_MINUTES = 30;

/** A request is "overdue" once it has been open longer than its own
 * estimated prep/response time (falling back to a 30-minute default for
 * categories that don't specify one). Completed/cancelled requests are
 * never overdue — the clock only matters while something is still open. */
export function isOverdue(request: GuestRequest, now: Date = new Date()): boolean {
  if (!ACTIVE.includes(request.status)) return false;
  const threshold = request.estimatedMinutes ?? DEFAULT_SLA_MINUTES;
  return elapsedMinutes(request.createdAt, now) > threshold;
}

export function overdueByMinutes(request: GuestRequest, now: Date = new Date()): number {
  if (!isOverdue(request, now)) return 0;
  const threshold = request.estimatedMinutes ?? DEFAULT_SLA_MINUTES;
  return elapsedMinutes(request.createdAt, now) - threshold;
}
