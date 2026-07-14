import { useState } from 'react';
import type { GuestRequest, RequestStatus } from '@/types';
import { REQUEST_STATUS_LABELS, DEPARTMENT_LABELS } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import { TextArea } from '@/components/common/FormField';
import { formatCurrency } from '@/utils/format';
import { formatDateTime, formatElapsed } from '@/utils/time';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { useOperations } from '@/context/OperationsContext';
import { getStaffByDepartment } from '@/data/staff';
import clsx from 'clsx';

const STATUS_FLOW: RequestStatus[] = ['received', 'assigned', 'preparing', 'on_the_way', 'arrived', 'completed'];

export function RequestDetailModal({ request, onClose }: { request: GuestRequest | null; onClose: () => void }) {
  const { assignStaff, updateStatus, addNote, cancelRequest } = useAppData();
  const { showToast } = useToast();
  const { currentUser } = useOperations();
  const CURRENT_ACTOR = currentUser.name;
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelMode, setCancelMode] = useState(false);

  if (!request) return null;
  const departmentStaff = getStaffByDepartment(request.department);
  const currentIdx = STATUS_FLOW.indexOf(request.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const handleAssign = (staffId: string, staffName: string) => {
    assignStaff(request.id, staffId, staffName);
    showToast(`Talep ${staffName} adlı personele atandı.`, 'success');
  };

  const handleAdvance = () => {
    if (!nextStatus) return;
    updateStatus(request.id, nextStatus, undefined, CURRENT_ACTOR);
    showToast(`Durum "${REQUEST_STATUS_LABELS[nextStatus]}" olarak güncellendi.`, 'success');
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote(request.id, note.trim(), CURRENT_ACTOR);
    showToast('Not eklendi.', 'success');
    setNote('');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    showToast(`Misafire mesaj gönderildi: "${message.trim()}"`, 'success');
    setMessage('');
  };

  const handleCancel = () => {
    cancelRequest(request.id, cancelReason || 'Yönetici tarafından iptal edildi', CURRENT_ACTOR);
    showToast('Talep iptal edildi.', 'info');
    setCancelMode(false);
    onClose();
  };

  const isClosed = request.status === 'completed' || request.status === 'cancelled';

  return (
    <Modal open={!!request} onClose={onClose} title={`Oda ${request.roomNumber} · ${request.categoryName}`} maxWidth="max-w-lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
          <span className="text-xs text-navy-400">{DEPARTMENT_LABELS[request.department]}</span>
        </div>

        <div>
          <p className="text-sm font-semibold text-navy-900">{request.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-navy-600">{request.description}</p>
          {request.guestNote && (
            <p className="mt-2 rounded-xl bg-cream-50 px-3 py-2 text-xs text-navy-500"><span className="font-semibold">Misafir notu:</span> {request.guestNote}</p>
          )}
          {request.callBeforeArrival && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gold-600">
              <Icon name="PhoneCall" className="h-3.5 w-3.5" /> Odaya gelmeden önce misafir aranmalı
            </p>
          )}
        </div>

        {request.items && request.items.length > 0 && (
          <div className="rounded-xl bg-cream-50 p-3">
            {request.items.map((item) => (
              <div key={item.serviceItemId} className="flex justify-between py-0.5 text-xs text-navy-600">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            {request.totalPrice !== undefined && (
              <div className="mt-1 flex justify-between border-t border-navy-900/10 pt-1 text-xs font-bold text-navy-900">
                <span>Toplam</span>
                <span>{formatCurrency(request.totalPrice)}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-navy-500">
          <div className="rounded-xl bg-cream-50 p-3">
            <p className="text-navy-400">Oluşturulma</p>
            <p className="mt-0.5 font-semibold text-navy-800">{formatDateTime(request.createdAt)}</p>
          </div>
          <div className="rounded-xl bg-cream-50 p-3">
            <p className="text-navy-400">Geçen Süre</p>
            <p className="mt-0.5 font-semibold text-navy-800">{formatElapsed(request.createdAt)}</p>
          </div>
        </div>

        {!isClosed && (
          <div>
            <p className="mb-2 text-sm font-semibold text-navy-800">Personele Ata</p>
            <div className="flex flex-wrap gap-2">
              {departmentStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAssign(s.id, s.name)}
                  className={clsx(
                    'flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-semibold transition',
                    request.assignedStaffId === s.id ? 'bg-navy-900 text-white' : 'bg-cream-50 text-navy-700 ring-1 ring-navy-900/10 hover:bg-cream-100',
                  )}
                >
                  <Avatar initials={s.initials} color={s.color} size="sm" />
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isClosed && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {nextStatus && (
              <Button size="sm" variant="success" className="w-full justify-center sm:w-auto" icon={<Icon name="ArrowRightCircle" className="h-4 w-4" />} onClick={handleAdvance}>
                {REQUEST_STATUS_LABELS[nextStatus]} olarak işaretle
              </Button>
            )}
            {request.status !== 'completed' && (
              <Button size="sm" variant="secondary" className="w-full justify-center sm:w-auto" icon={<Icon name="CheckCheck" className="h-4 w-4" />} onClick={() => { updateStatus(request.id, 'completed', undefined, CURRENT_ACTOR); showToast('Talep tamamlandı olarak kapatıldı.', 'success'); }}>
                Talebi Kapat
              </Button>
            )}
            <Button size="sm" variant="danger" className="w-full justify-center sm:w-auto" icon={<Icon name="XCircle" className="h-4 w-4" />} onClick={() => setCancelMode((v) => !v)}>
              Talebi İptal Et
            </Button>
          </div>
        )}

        {cancelMode && (
          <div className="rounded-xl bg-ruby-500/5 p-3 ring-1 ring-ruby-500/20">
            <TextArea rows={2} placeholder="İptal nedeni" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Button size="sm" variant="danger" className="w-full justify-center sm:w-auto" onClick={handleCancel}>Onayla</Button>
              <Button size="sm" variant="ghost" className="w-full justify-center sm:w-auto" onClick={() => setCancelMode(false)}>Vazgeç</Button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-800">Not Ekle</p>
          <div className="flex gap-2">
            <TextArea rows={1} placeholder="Dahili not…" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1" />
            <Button size="sm" onClick={handleAddNote}>Ekle</Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-800">Misafire Mesaj Gönder</p>
          <div className="flex gap-2">
            <TextArea rows={1} placeholder="Örn. Talebiniz 10 dk içinde hazır olacak…" value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
            <Button size="sm" variant="secondary" onClick={handleSendMessage}>Gönder</Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-800">Talep Geçmişi</p>
          <div className="space-y-3 border-l-2 border-navy-900/10 pl-4">
            {request.history.map((h, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold-500" />
                <p className="text-xs font-semibold text-navy-800">{REQUEST_STATUS_LABELS[h.status]}{h.actor ? ` · ${h.actor}` : ''}</p>
                <p className="text-[11px] text-navy-400">{formatDateTime(h.timestamp)}</p>
                {h.note && <p className="mt-0.5 text-xs text-navy-500">{h.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
