import { useMemo, useState } from 'react';
import { useAppData, ACTIVE_STATUSES } from '@/context/AppDataContext';
import { Icon } from '@/components/common/Icon';
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import { OverdueBadge } from '@/components/common/OverdueBadge';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { RequestFilters, DEFAULT_FILTERS, type Filters } from '@/components/admin/RequestFilters';
import { RequestDetailModal } from '@/components/admin/RequestDetailModal';
import { getStaffById } from '@/data/staff';
import { formatClock, formatElapsed } from '@/utils/time';
import type { GuestRequest } from '@/types';
import clsx from 'clsx';

export function RequestsPage() {
  const { requests } = useAppData();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<'card' | 'table'>('card');
  const [selected, setSelected] = useState<GuestRequest | null>(null);

  const filtered = useMemo(() => {
    return requests
      .filter((r) => {
        if (filters.scope === 'open' && !ACTIVE_STATUSES.includes(r.status)) return false;
        if (filters.scope === 'completed' && r.status !== 'completed') return false;
        if (filters.category !== 'all' && r.categoryId !== filters.category) return false;
        if (filters.status !== 'all' && r.status !== filters.status) return false;
        if (filters.priority !== 'all' && r.priority !== filters.priority) return false;
        if (filters.staffId === 'unassigned' && r.assignedStaffId) return false;
        if (filters.staffId !== 'all' && filters.staffId !== 'unassigned' && r.assignedStaffId !== filters.staffId) return false;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          if (!r.roomNumber.includes(s) && !r.description.toLowerCase().includes(s) && !r.categoryName.toLowerCase().includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, filters]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Talepler</h1>
          <p className="mt-1 text-sm text-navy-500">{filtered.length} talep listeleniyor</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-cream-50 p-1 ring-1 ring-navy-900/10">
          <button onClick={() => setView('card')} className={clsx('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold', view === 'card' ? 'bg-navy-900 text-white' : 'text-navy-500')}>
            <Icon name="LayoutGrid" className="h-3.5 w-3.5" /> Kart
          </button>
          <button onClick={() => setView('table')} className={clsx('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold', view === 'table' ? 'bg-navy-900 text-white' : 'text-navy-500')}>
            <Icon name="List" className="h-3.5 w-3.5" /> Tablo
          </button>
        </div>
      </div>

      <RequestFilters filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <EmptyState icon="SearchX" title="Talep bulunamadı" description="Filtrelerinizi değiştirerek tekrar deneyin." />
      ) : view === 'card' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const staffMember = r.assignedStaffId ? getStaffById(r.assignedStaffId) : undefined;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={clsx(
                  'flex flex-col gap-3 rounded-2xl bg-cream-50 p-4 text-left shadow-card ring-1 transition hover:-translate-y-0.5 hover:shadow-lifted',
                  r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status) ? 'ring-ruby-500/30' : 'ring-navy-900/5',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-200 text-navy-700">
                      <Icon name={r.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy-900">Oda {r.roomNumber}</p>
                      <p className="text-xs text-navy-500">{r.categoryName}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={r.priority} size="sm" />
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-navy-500">{r.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={r.status} size="sm" />
                    <OverdueBadge request={r} size="sm" />
                  </div>
                  <span className="text-[11px] text-navy-400">{formatElapsed(r.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-navy-900/5 pt-2.5">
                  {staffMember ? (
                    <span className="flex items-center gap-1.5 text-xs text-navy-500">
                      <Avatar initials={staffMember.initials} color={staffMember.color} size="sm" />
                      {staffMember.name}
                    </span>
                  ) : (
                    <span className="text-xs text-navy-400">Atanmadı</span>
                  )}
                  <span className="text-[11px] font-medium text-gold-600">{formatClock(r.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-cream-50 shadow-card ring-1 ring-navy-900/5">
          <p className="flex items-center gap-1.5 border-b border-navy-900/5 px-4 py-2 text-[11px] text-navy-400 sm:hidden">
            <Icon name="MoveHorizontal" className="h-3.5 w-3.5" />
            Tüm sütunları görmek için yatay kaydırın
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-900/5 text-xs uppercase tracking-wide text-navy-400">
                <th className="px-4 py-3 font-semibold">Oda</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Açıklama</th>
                <th className="px-4 py-3 font-semibold">Öncelik</th>
                <th className="px-4 py-3 font-semibold">Oluşturulma</th>
                <th className="px-4 py-3 font-semibold">Geçen Süre</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Personel</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const staffMember = r.assignedStaffId ? getStaffById(r.assignedStaffId) : undefined;
                return (
                  <tr key={r.id} onClick={() => setSelected(r)} className="cursor-pointer border-b border-navy-900/5 transition last:border-0 hover:bg-cream-50">
                    <td className="px-4 py-3 font-bold text-navy-900">{r.roomNumber}</td>
                    <td className="px-4 py-3 text-navy-600">{r.categoryName}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-navy-500">{r.description}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={r.priority} size="sm" /></td>
                    <td className="px-4 py-3 text-navy-500">{formatClock(r.createdAt)}</td>
                    <td className="px-4 py-3 text-navy-500">{formatElapsed(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={r.status} size="sm" />
                        <OverdueBadge request={r} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy-500">{staffMember?.name ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <RequestDetailModal request={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
