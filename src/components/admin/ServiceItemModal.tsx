import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { FieldLabel, TextArea, TextInput, Toggle } from '@/components/common/FormField';
import type { ServiceItemWithGroup } from '@/data/serviceItems';
import type { Department } from '@/types';
import { DEPARTMENT_LABELS } from '@/types';

const EMPTY: Omit<ServiceItemWithGroup, 'id'> = {
  categoryId: 'cat-restaurant', group: '', name: '', description: '', price: 0, currency: 'TRY',
  image: '🍽️', available: true, stock: 'in_stock', prepTimeMinutes: 15, department: 'room_service',
};

export function ServiceItemModal({
  open,
  item,
  canEditPrice = true,
  onClose,
  onSave,
}: {
  open: boolean;
  item: ServiceItemWithGroup | null;
  canEditPrice?: boolean;
  onClose: () => void;
  onSave: (item: ServiceItemWithGroup, oldPrice: number) => void;
}) {
  const [form, setForm] = useState<Omit<ServiceItemWithGroup, 'id'>>(EMPTY);

  useEffect(() => {
    setForm(item ? { ...item } : EMPTY);
  }, [item, open]);

  const handleSave = () => {
    onSave({ ...form, id: item?.id ?? `svc-${Date.now()}` }, item?.price ?? form.price);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Ürün / Hizmeti Düzenle' : 'Yeni Ürün / Hizmet Ekle'}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-20">
            <FieldLabel>Görsel</FieldLabel>
            <TextInput value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} maxLength={2} className="text-center text-xl" />
          </div>
          <div className="flex-1">
            <FieldLabel>Ürün / Hizmet Adı</FieldLabel>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn. Izgara Somon" />
          </div>
        </div>

        <div>
          <FieldLabel>Kategori / Grup</FieldLabel>
          <TextInput value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="Örn. Ana Yemekler" />
        </div>

        <div>
          <FieldLabel>Açıklama</FieldLabel>
          <TextArea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel hint={!canEditPrice ? 'Kilitli' : undefined}>Fiyat (₺)</FieldLabel>
            <TextInput
              type="number"
              value={form.price}
              disabled={!canEditPrice}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={!canEditPrice ? 'cursor-not-allowed opacity-60' : undefined}
            />
            {!canEditPrice && <p className="mt-1 text-[11px] text-ruby-600">Fiyat değiştirmek için yönetici onayı gerekiyor.</p>}
            {item && item.price !== form.price && canEditPrice && (
              <p className="mt-1 text-[11px] text-navy-500">Eski fiyat: {item.price}₺ → Yeni: {form.price}₺</p>
            )}
          </div>
          <div>
            <FieldLabel>Hazırlanma Süresi (dk)</FieldLabel>
            <TextInput type="number" value={form.prepTimeMinutes} onChange={(e) => setForm({ ...form, prepTimeMinutes: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <FieldLabel>Departman</FieldLabel>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
            className="w-full rounded-xl border border-navy-900/10 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-500"
          >
            {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <Toggle checked={form.available} onChange={(v) => setForm({ ...form, available: v, stock: v ? 'in_stock' : 'out_of_stock' })} label="Aktif" description="Pasif ürünler misafir ekranında görünmez" />
        <Toggle checked={form.stock === 'in_stock'} onChange={(v) => setForm({ ...form, stock: v ? 'in_stock' : 'out_of_stock' })} label="Stokta Var" description="Stok tükendiğinde otomatik gizlenir" />

        <Button fullWidth size="lg" onClick={handleSave}>{item ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}</Button>
      </div>
    </Modal>
  );
}
