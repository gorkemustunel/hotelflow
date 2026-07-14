import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ServiceCategory } from '@/types';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { Segmented } from '@/components/common/Segmented';
import { FieldLabel, TextArea, Toggle } from '@/components/common/FormField';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

export function RequestForm({ category }: { category: ServiceCategory }) {
  const { roomNumber = '' } = useParams();
  const navigate = useNavigate();
  const { createRequest } = useAppData();
  const { showToast } = useToast();

  const [requestType, setRequestType] = useState(category.requestTypeOptions?.[0] ?? category.name);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [note, setNote] = useState('');
  const [callBefore, setCallBefore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      createRequest({
        roomNumber,
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        icon: category.icon,
        title: requestType,
        description: description || category.description,
        priority,
        department: category.department,
        estimatedMinutes: category.estimatedMinutes,
        guestNote: note || undefined,
        callBeforeArrival: callBefore,
      });
      setSubmitting(false);
      setSubmitted(true);
      showToast('Talebiniz alındı, ilgili departmana iletildi.', 'success');
    }, 700);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-cream-50 px-6 py-12 text-center shadow-card">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Icon name="CheckCircle2" className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="font-display text-xl font-semibold text-navy-900">Talebiniz Alındı</h2>
        <p className="mt-2 max-w-xs text-sm text-navy-500">{category.name} talebiniz ilgili ekibe iletildi. Durumu "Taleplerim" sekmesinden takip edebilirsiniz.</p>
        <div className="mt-6 flex w-full flex-col gap-2.5">
          <Button fullWidth onClick={() => navigate(`/guest/room/${roomNumber}/requests`)} icon={<Icon name="ClipboardList" className="h-4 w-4" />}>
            Taleplerimi Gör
          </Button>
          <Button fullWidth variant="secondary" onClick={() => navigate(`/guest/room/${roomNumber}`)}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {category.requestTypeOptions && (
        <div>
          <FieldLabel>Talep Tipi</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {category.requestTypeOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setRequestType(opt)}
                className={clsx(
                  'rounded-full px-3.5 py-2 text-xs font-semibold transition-all',
                  requestType === opt ? 'bg-navy-900 text-white shadow-soft' : 'bg-cream-50 text-navy-600 ring-1 ring-navy-900/10 hover:bg-cream-100',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <FieldLabel hint="opsiyonel">Açıklama</FieldLabel>
        <TextArea rows={3} placeholder="Talebinizle ilgili detayları yazabilirsiniz…" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <FieldLabel>Öncelik</FieldLabel>
        <Segmented
          value={priority}
          onChange={setPriority}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'urgent', label: 'Acil', activeClass: 'bg-ruby-500 text-white shadow-soft' },
          ]}
        />
      </div>

      <div>
        <FieldLabel hint="opsiyonel">Ek Not</FieldLabel>
        <TextArea rows={2} placeholder="Personel için ek not…" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <Toggle
        checked={callBefore}
        onChange={setCallBefore}
        label="Odaya gelmeden önce aransın mı?"
        description="Personel kapıya gelmeden telefonla haber verir"
      />

      <Button fullWidth size="lg" onClick={handleSubmit} disabled={submitting} icon={submitting ? <Icon name="Loader2" className="h-5 w-5 animate-spin" /> : <Icon name="Send" className="h-5 w-5" />}>
        {submitting ? 'Gönderiliyor…' : 'Talebi Gönder'}
      </Button>
    </div>
  );
}
