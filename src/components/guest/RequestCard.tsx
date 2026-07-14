import { useState } from 'react';
import type { GuestRequest } from '@/types';
import { Icon } from '@/components/common/Icon';
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextArea } from '@/components/common/FormField';
import { formatClock, formatElapsed } from '@/utils/time';
import { formatCurrency } from '@/utils/format';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';

const STEP_ORDER = ['received', 'assigned', 'preparing', 'on_the_way', 'arrived', 'completed'] as const;

export function RequestCard({ request }: { request: GuestRequest }) {
  const { cancelRequest } = useAppData();
  const { showToast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');

  const isCancelled = request.status === 'cancelled';
  const isCompleted = request.status === 'completed';
  const currentStep = STEP_ORDER.indexOf(request.status as (typeof STEP_ORDER)[number]);
  const canCancel = !isCancelled && !isCompleted;

  const handleCancel = () => {
    cancelRequest(request.id, reason || 'Misafir talebi iptal etti', 'Misafir');
    showToast('Talebiniz iptal edildi.', 'info');
    setCancelOpen(false);
    setReason('');
  };

  return (
    <div className="rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-navy-700">
            <Icon name={request.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy-900">{request.title}</p>
            <p className="mt-0.5 text-xs text-navy-400">
              {formatClock(request.createdAt)} · {formatElapsed(request.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={request.status} size="sm" />
          <PriorityBadge priority={request.priority} size="sm" />
        </div>
      </div>

      {request.description && <p className="mt-3 rounded-xl bg-cream-50 px-3 py-2.5 text-xs leading-relaxed text-navy-600">{request.description}</p>}

      {request.items && request.items.length > 0 && (
        <div className="mt-3 space-y-1 rounded-xl bg-cream-50 px-3 py-2.5">
          {request.items.map((item) => (
            <div key={item.serviceItemId} className="flex justify-between text-xs text-navy-600">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-semibold text-navy-800">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          {request.totalPrice !== undefined && (
            <div className="flex justify-between border-t border-navy-900/10 pt-1.5 text-xs font-bold text-navy-900">
              <span>Toplam</span>
              <span>{formatCurrency(request.totalPrice)}</span>
            </div>
          )}
        </div>
      )}

      {!isCancelled && (
        <div className="mt-4 flex items-center gap-1">
          {STEP_ORDER.map((step, idx) => (
            <div key={step} className="flex flex-1 items-center gap-1 last:flex-none last:w-auto">
              <span
                className={`h-1.5 flex-1 rounded-full ${idx <= currentStep ? 'bg-gold-500' : 'bg-navy-900/10'} ${idx === STEP_ORDER.length - 1 ? 'flex-none w-1.5' : ''}`}
              />
            </div>
          ))}
        </div>
      )}

      {isCancelled && request.cancelReason && (
        <p className="mt-3 rounded-xl bg-ruby-500/10 px-3 py-2.5 text-xs text-ruby-600">
          <span className="font-semibold">İptal nedeni: </span>
          {request.cancelReason}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-navy-400">
        {request.estimatedMinutes && !isCompleted && !isCancelled && (
          <span className="flex items-center gap-1">
            <Icon name="Timer" className="h-3.5 w-3.5" />
            Tahmini süre: ~{request.estimatedMinutes} dk
          </span>
        )}
        {request.assignedStaffName && (
          <span className="flex items-center gap-1">
            <Icon name="UserRound" className="h-3.5 w-3.5" />
            {request.assignedStaffName}
          </span>
        )}
      </div>

      {request.staffNote && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-navy-900/5 px-3 py-2.5">
          <Icon name="MessageCircle" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />
          <p className="text-xs leading-relaxed text-navy-600"><span className="font-semibold">Personel notu: </span>{request.staffNote}</p>
        </div>
      )}

      {canCancel && (
        <div className="mt-4 border-t border-navy-900/5 pt-3">
          <Button variant="ghost" size="sm" onClick={() => setCancelOpen(true)} icon={<Icon name="X" className="h-3.5 w-3.5" />}>
            Talebi İptal Et
          </Button>
        </div>
      )}

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Talebi İptal Et">
        <p className="mb-3 text-sm text-navy-500">"{request.title}" talebini iptal etmek istediğinize emin misiniz?</p>
        <TextArea rows={3} placeholder="İptal nedeni (opsiyonel)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2.5">
          <Button variant="secondary" fullWidth onClick={() => setCancelOpen(false)}>Vazgeç</Button>
          <Button variant="danger" fullWidth onClick={handleCancel}>İptal Et</Button>
        </div>
      </Modal>
    </div>
  );
}
