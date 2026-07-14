import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { FieldLabel, TextArea, TextInput } from '@/components/common/FormField';
import { BREAKFAST_CATEGORY_LABELS, type BreakfastCategory } from '@/types';
import type { NewBreakfastItemInput } from '@/context/OperationsContext';

const EMPTY: NewBreakfastItemInput = { name: '', description: '', category: 'hot', allergens: [], price: undefined };

export function BreakfastItemModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (input: NewBreakfastItemInput) => void }) {
  const [form, setForm] = useState<NewBreakfastItemInput>(EMPTY);
  const [allergenText, setAllergenText] = useState('');

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setAllergenText('');
    }
  }, [open]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, allergens: allergenText.split(',').map((a) => a.trim()).filter(Boolean) });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Kahvaltıya Yeni Ürün Ekle">
      <div className="space-y-4">
        <div>
          <FieldLabel>Ürün Adı</FieldLabel>
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn. Menemen" />
        </div>
        <div>
          <FieldLabel>Açıklama</FieldLabel>
          <TextArea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Kategori</FieldLabel>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as BreakfastCategory })}
              className="w-full rounded-xl border border-navy-900/10 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-500"
            >
              {Object.entries(BREAKFAST_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel hint="opsiyonel">Fiyat (₺)</FieldLabel>
            <TextInput
              type="number"
              value={form.price ?? ''}
              onChange={(e) => setForm({ ...form, price: e.target.value === '' ? undefined : Number(e.target.value) })}
              placeholder="Dahil (ücretsiz) ise boş bırakın"
            />
          </div>
        </div>
        <div>
          <FieldLabel hint="virgülle ayırın">Alerjen Bilgisi</FieldLabel>
          <TextInput value={allergenText} onChange={(e) => setAllergenText(e.target.value)} placeholder="Örn. Gluten, Süt, Yumurta" />
        </div>
        <Button fullWidth size="lg" onClick={handleSave}>Ürünü Ekle</Button>
      </div>
    </Modal>
  );
}
