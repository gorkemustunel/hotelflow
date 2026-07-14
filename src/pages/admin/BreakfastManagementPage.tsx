import { useMemo, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { TextArea } from '@/components/common/FormField';
import { BreakfastItemModal } from '@/components/admin/BreakfastItemModal';
import { useOperations, type NewBreakfastItemInput } from '@/context/OperationsContext';
import { useToast } from '@/context/ToastContext';
import { BREAKFAST_CATEGORY_LABELS, PREP_STATUS_LABELS, type BreakfastItem, type PrepStatus } from '@/types';
import { formatDateTime } from '@/utils/time';
import clsx from 'clsx';

const PREP_ORDER: PrepStatus[] = ['preparing', 'ready', 'finished'];

const PREP_STYLES: Record<PrepStatus, string> = {
  preparing: 'bg-amber-500/10 text-amber-700',
  ready: 'bg-emerald-500/10 text-emerald-700',
  finished: 'bg-navy-900/10 text-navy-500',
};

function PriceCell({ item }: { item: BreakfastItem }) {
  const { has, changeBreakfastPrice } = useOperations();
  const { showToast } = useToast();
  const canEditPrice = has('edit_prices');
  const [value, setValue] = useState(item.price ?? 0);
  const [editing, setEditing] = useState(false);

  if (item.price === undefined && !editing) {
    return <span className="text-xs text-navy-400">Dahil</span>;
  }

  if (!editing) {
    return (
      <button onClick={() => { setValue(item.price ?? 0); setEditing(true); }} className="text-sm font-bold text-navy-900 underline decoration-dotted underline-offset-2">
        {item.price}₺
      </button>
    );
  }

  const submit = () => {
    setEditing(false);
    if (value === item.price) return;
    const result = changeBreakfastPrice(item.id, value);
    if (result === 'applied') showToast(`"${item.name}" fiyatı ${value}₺ olarak güncellendi.`, 'success');
    else showToast('Fiyat doğrudan değiştirilemedi — yönetici onayına gönderildi.', 'info');
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        autoFocus
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={submit}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        disabled={!canEditPrice}
        className="w-16 rounded-lg border border-navy-900/10 bg-cream-50 px-2 py-1 text-sm outline-none focus:border-gold-500"
      />
      <span className="text-xs text-navy-400">₺</span>
    </div>
  );
}

export function BreakfastManagementPage() {
  const { breakfastItems, addBreakfastItem, toggleBreakfastAvailability, setBreakfastStock, setBreakfastPrepStatus, breakfastNote, setBreakfastNote, has, currentUser } = useOperations();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | BreakfastItem['category']>('all');
  const [noteDraft, setNoteDraft] = useState(breakfastNote);

  const canAdd = has('add_breakfast_item');
  const canToggle = has('toggle_item_availability');
  const canEditPrice = has('edit_prices');

  const filtered = useMemo(
    () => (categoryFilter === 'all' ? breakfastItems : breakfastItems.filter((i) => i.category === categoryFilter)),
    [breakfastItems, categoryFilter],
  );

  const handleAdd = (input: NewBreakfastItemInput) => {
    addBreakfastItem(input);
    showToast(`"${input.name}" kahvaltı menüsüne eklendi.`, 'success');
  };

  const guardToggle = (id: string) => {
    if (!canToggle) {
      showToast('Bu işlem için yetkiniz yok.', 'error');
      return;
    }
    toggleBreakfastAvailability(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Kahvaltı Yönetimi</h1>
          <p className="mt-1 text-sm text-navy-500">{breakfastItems.length} kahvaltı ürünü · {currentUser.name} olarak görüntüleniyor{!canEditPrice && ' (fiyat kilitli)'}</p>
        </div>
        {canAdd && (
          <Button icon={<Icon name="Plus" className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Ürün Ekle
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="StickyNote" className="h-4 w-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-navy-900">Günlük Kahvaltı Notu</h3>
        </div>
        <TextArea
          rows={2}
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => setBreakfastNote(noteDraft)}
          placeholder="Örn. Bugün simit tedarikçi gecikmesi nedeniyle 09:00'da servise girecek."
        />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={clsx('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition', categoryFilter === 'all' ? 'bg-navy-900 text-white' : 'bg-cream-50 text-navy-600 ring-1 ring-navy-900/10')}
        >
          Tümü
        </button>
        {Object.entries(BREAKFAST_CATEGORY_LABELS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setCategoryFilter(k as BreakfastItem['category'])}
            className={clsx('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition', categoryFilter === k ? 'bg-navy-900 text-white' : 'bg-cream-50 text-navy-600 ring-1 ring-navy-900/10')}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <div key={item.id} className={clsx('flex flex-col gap-2.5 rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5', !item.available && 'opacity-60')}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{item.name}</p>
                <p className="text-[11px] text-navy-400">{BREAKFAST_CATEGORY_LABELS[item.category]}</p>
              </div>
              <PriceCell item={item} />
            </div>
            <p className="line-clamp-2 text-xs text-navy-500">{item.description}</p>
            {item.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((a) => (
                  <span key={a} className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-medium text-navy-500">{a}</span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 border-t border-navy-900/5 pt-2.5">
              <button
                onClick={() => guardToggle(item.id)}
                className={clsx('rounded-lg px-2.5 py-1 text-[11px] font-semibold', item.available ? 'bg-emerald-500/10 text-emerald-700' : 'bg-navy-900/10 text-navy-500')}
              >
                {item.available ? 'Aktif' : 'Pasif'}
              </button>
              <button
                onClick={() => setBreakfastStock(item.id, item.stock === 'in_stock' ? 'out_of_stock' : 'in_stock')}
                className={clsx('rounded-lg px-2.5 py-1 text-[11px] font-semibold', item.stock === 'in_stock' ? 'bg-cream-100 text-navy-600' : 'bg-ruby-500/10 text-ruby-600')}
              >
                {item.stock === 'in_stock' ? 'Stokta' : 'Tükendi'}
              </button>
              <select
                value={item.prepStatus}
                onChange={(e) => setBreakfastPrepStatus(item.id, e.target.value as PrepStatus)}
                className={clsx('rounded-lg border-0 px-2 py-1 text-[11px] font-semibold outline-none', PREP_STYLES[item.prepStatus])}
              >
                {PREP_ORDER.map((s) => (
                  <option key={s} value={s}>{PREP_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-navy-400">Ekleyen: {item.addedBy} · {formatDateTime(item.updatedAt)}</p>
          </div>
        ))}
      </div>

      <BreakfastItemModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
    </div>
  );
}
