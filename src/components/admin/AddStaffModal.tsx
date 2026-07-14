import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { FieldLabel, TextInput } from '@/components/common/FormField';
import { DEPARTMENT_LABELS, ROLE_LABELS, type Department, type RoleId } from '@/types';
import type { NewStaffInput } from '@/context/OperationsContext';

const EMPTY: NewStaffInput = { name: '', roleId: 'reception', department: 'reception', role: '', phone: '' };

export function AddStaffModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (input: NewStaffInput) => void }) {
  const [form, setForm] = useState<NewStaffInput>(EMPTY);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Yeni Personel Ekle">
      <div className="space-y-4">
        <div>
          <FieldLabel>Ad Soyad</FieldLabel>
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn. Deniz Kaya" />
        </div>
        <div>
          <FieldLabel>Unvan</FieldLabel>
          <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Örn. Kat Hizmetleri Sorumlusu" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Rol / Yetki</FieldLabel>
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value as RoleId })}
              className="w-full rounded-xl border border-navy-900/10 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-500"
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
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
        </div>
        <div>
          <FieldLabel>Telefon</FieldLabel>
          <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0532 XXX XX XX" />
        </div>
        <Button fullWidth size="lg" onClick={handleSave}>Personeli Ekle</Button>
      </div>
    </Modal>
  );
}
