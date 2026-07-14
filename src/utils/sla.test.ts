import { describe, expect, it } from 'vitest';
import type { GuestRequest } from '@/types';
import { isOverdue, overdueByMinutes } from './sla';

function makeRequest(overrides: Partial<GuestRequest> = {}): GuestRequest {
  return {
    id: 'req-1',
    roomNumber: '101',
    categoryId: 'cat-housekeeping',
    categorySlug: 'temizlik',
    categoryName: 'Temizlik',
    icon: 'Sparkles',
    title: 'Oda temizliği',
    description: 'Oda temizliği talebi',
    priority: 'normal',
    status: 'received',
    department: 'housekeeping',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [],
    ...overrides,
  };
}

describe('isOverdue', () => {
  it('is false for a freshly created request', () => {
    const request = makeRequest({ createdAt: new Date().toISOString(), estimatedMinutes: 20 });
    expect(isOverdue(request)).toBe(false);
  });

  it('is true once elapsed time exceeds estimatedMinutes', () => {
    const createdAt = new Date(Date.now() - 25 * 60_000).toISOString();
    const request = makeRequest({ createdAt, estimatedMinutes: 20 });
    expect(isOverdue(request)).toBe(true);
  });

  it('falls back to a 30-minute default when estimatedMinutes is not set', () => {
    const at25 = new Date(Date.now() - 25 * 60_000).toISOString();
    const at35 = new Date(Date.now() - 35 * 60_000).toISOString();
    expect(isOverdue(makeRequest({ createdAt: at25, estimatedMinutes: undefined }))).toBe(false);
    expect(isOverdue(makeRequest({ createdAt: at35, estimatedMinutes: undefined }))).toBe(true);
  });

  it('is never true for completed or cancelled requests, no matter how old', () => {
    const veryOld = new Date(Date.now() - 10_000 * 60_000).toISOString();
    expect(isOverdue(makeRequest({ createdAt: veryOld, status: 'completed' }))).toBe(false);
    expect(isOverdue(makeRequest({ createdAt: veryOld, status: 'cancelled' }))).toBe(false);
  });
});

describe('overdueByMinutes', () => {
  it('returns 0 when not overdue', () => {
    const request = makeRequest({ createdAt: new Date().toISOString(), estimatedMinutes: 30 });
    expect(overdueByMinutes(request)).toBe(0);
  });

  it('returns the number of minutes past the threshold', () => {
    const createdAt = new Date(Date.now() - 50 * 60_000).toISOString();
    const request = makeRequest({ createdAt, estimatedMinutes: 30 });
    expect(overdueByMinutes(request)).toBeGreaterThanOrEqual(19);
    expect(overdueByMinutes(request)).toBeLessThanOrEqual(21);
  });
});
