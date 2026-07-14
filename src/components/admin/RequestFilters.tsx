import { Icon } from '@/components/common/Icon';
import { serviceCategories } from '@/data/serviceCategories';
import { staff } from '@/data/staff';
import { REQUEST_STATUS_LABELS, type RequestStatus, type Priority } from '@/types';

export interface Filters {
  search: string;
  category: string;
  status: RequestStatus | 'all';
  priority: Priority | 'all';
  staffId: string;
  scope: 'open' | 'completed' | 'all';
}

export const DEFAULT_FILTERS: Filters = { search: '', category: 'all', status: 'all', priority: 'all', staffId: 'all', scope: 'open' };

export function RequestFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Icon name="Search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Oda numarası veya açıklama ara…"
          className="w-full rounded-xl border border-navy-900/10 bg-cream-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={filters.scope} onChange={(e) => set('scope', e.target.value as Filters['scope'])} className="rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs font-medium text-navy-700 outline-none focus:border-gold-500">
          <option value="open">Açık Talepler</option>
          <option value="completed">Tamamlanan</option>
          <option value="all">Tümü</option>
        </select>
        <select value={filters.category} onChange={(e) => set('category', e.target.value)} className="rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs font-medium text-navy-700 outline-none focus:border-gold-500">
          <option value="all">Tüm Kategoriler</option>
          {serviceCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => set('status', e.target.value as Filters['status'])} className="rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs font-medium text-navy-700 outline-none focus:border-gold-500">
          <option value="all">Tüm Durumlar</option>
          {Object.entries(REQUEST_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filters.priority} onChange={(e) => set('priority', e.target.value as Filters['priority'])} className="rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs font-medium text-navy-700 outline-none focus:border-gold-500">
          <option value="all">Tüm Öncelikler</option>
          <option value="urgent">Acil</option>
          <option value="normal">Normal</option>
        </select>
        <select value={filters.staffId} onChange={(e) => set('staffId', e.target.value)} className="rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs font-medium text-navy-700 outline-none focus:border-gold-500">
          <option value="all">Tüm Personel</option>
          <option value="unassigned">Atanmamış</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {(filters.category !== 'all' || filters.status !== 'all' || filters.priority !== 'all' || filters.staffId !== 'all' || filters.search) && (
          <button onClick={() => onChange(DEFAULT_FILTERS)} className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-navy-400 hover:text-ruby-500">
            <Icon name="X" className="h-3.5 w-3.5" />
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
