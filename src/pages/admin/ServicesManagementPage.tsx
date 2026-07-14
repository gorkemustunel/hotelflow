import { useMemo, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { ServiceItemModal } from '@/components/admin/ServiceItemModal';
import { allServiceItems, type ServiceItemWithGroup } from '@/data/serviceItems';
import { serviceCategories } from '@/data/serviceCategories';
import { formatCurrency } from '@/utils/format';
import { formatDateTime } from '@/utils/time';
import { useToast } from '@/context/ToastContext';
import { useOperations } from '@/context/OperationsContext';
import clsx from 'clsx';

const CATEGORY_FILTERS = serviceCategories.filter((c) => c.type === 'order' || c.slug === 'spa-masaj');

export function ServicesManagementPage() {
  const [items, setItems] = useState<ServiceItemWithGroup[]>(allServiceItems);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalItem, setModalItem] = useState<ServiceItemWithGroup | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();
  const { has, currentUser, applyPriceChange } = useOperations();
  const canEditPrice = has('edit_prices');
  const canToggle = has('toggle_item_availability');

  const filtered = useMemo(() => (categoryFilter === 'all' ? items : items.filter((i) => i.categoryId === categoryFilter)), [items, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ServiceItemWithGroup[]>();
    filtered.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const handleSave = (item: ServiceItemWithGroup, oldPrice: number) => {
    const stamped: ServiceItemWithGroup = { ...item, updatedBy: currentUser.name, updatedAt: new Date().toISOString() };
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? stamped : i)) : [stamped, ...prev];
    });
    if (canEditPrice && oldPrice !== item.price) {
      applyPriceChange(item.id, item.name, oldPrice, item.price);
    }
    showToast(`"${item.name}" kaydedildi.`, 'success');
  };

  const toggleActive = (id: string) => {
    if (!canToggle) {
      showToast('Bu işlem için yetkiniz yok.', 'error');
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: !i.available, stock: !i.available ? 'in_stock' : 'out_of_stock', updatedBy: currentUser.name, updatedAt: new Date().toISOString() } : i)));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Hizmet & Menü Yönetimi</h1>
          <p className="mt-1 text-sm text-navy-500">{items.length} ürün / hizmet tanımlı</p>
        </div>
        <Button icon={<Icon name="Plus" className="h-4 w-4" />} onClick={() => { setModalItem(null); setModalOpen(true); }}>
          Yeni Ekle
        </Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={clsx('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition', categoryFilter === 'all' ? 'bg-navy-900 text-white' : 'bg-cream-50 text-navy-600 ring-1 ring-navy-900/10')}
        >
          Tümü
        </button>
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={clsx('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition', categoryFilter === c.id ? 'bg-navy-900 text-white' : 'bg-cream-50 text-navy-600 ring-1 ring-navy-900/10')}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {grouped.map(([group, groupItems]) => (
          <div key={group}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-navy-400">{group}</h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groupItems.map((item) => (
                <div key={item.id} className={clsx('flex items-start gap-3 rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5', !item.available && 'opacity-60')}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-2xl">{item.image}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-navy-900">{item.name}</p>
                      <p className="shrink-0 text-sm font-bold text-navy-900">{formatCurrency(item.price)}</p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-navy-400">{item.description}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button onClick={() => { setModalItem(item); setModalOpen(true); }} className="rounded-lg bg-cream-100 px-2.5 py-1 text-[11px] font-semibold text-navy-700 hover:bg-cream-200">
                        Düzenle
                      </button>
                      <button
                        onClick={() => toggleActive(item.id)}
                        className={clsx('rounded-lg px-2.5 py-1 text-[11px] font-semibold', item.available ? 'bg-emerald-500/10 text-emerald-700' : 'bg-navy-900/10 text-navy-500')}
                      >
                        {item.available ? 'Aktif' : 'Pasif'}
                      </button>
                      <span className={clsx('rounded-lg px-2.5 py-1 text-[11px] font-semibold', item.stock === 'in_stock' ? 'bg-cream-100 text-navy-600' : 'bg-ruby-500/10 text-ruby-600')}>
                        {item.stock === 'in_stock' ? 'Stokta' : 'Tükendi'}
                      </span>
                    </div>
                    {item.updatedBy && (
                      <p className="mt-2 text-[10px] text-navy-400">Son güncelleyen: {item.updatedBy} · {formatDateTime(item.updatedAt!)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ServiceItemModal open={modalOpen} item={modalItem} canEditPrice={canEditPrice} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
