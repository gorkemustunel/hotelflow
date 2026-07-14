import { useState } from 'react';
import type { GuestRequest } from '@/types';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { PriorityBadge, StatusBadge } from '@/components/common/StatusBadge';
import { OverdueBadge } from '@/components/common/OverdueBadge';
import { TextArea } from '@/components/common/FormField';
import { formatClock, formatElapsed } from '@/utils/time';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import type { Staff } from '@/types';

export function StaffTaskCard({ request, staff }: { request: GuestRequest; staff: Staff }) {
  const { assignStaff, updateStatus, addNote } = useAppData();
  const { showToast } = useToast();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [guestAway, setGuestAway] = useState(false);

  const isMine = request.assignedStaffId === staff.id;

  const handleStart = () => {
    if (!request.assignedStaffId) assignStaff(request.id, staff.id, staff.name);
    updateStatus(request.id, 'preparing', undefined, staff.name);
    showToast('Göreve başlandı.', 'success');
  };

  const handleComplete = () => {
    updateStatus(request.id, 'completed', undefined, staff.name);
    showToast('Görev tamamlandı olarak işaretlendi.', 'success');
  };

  const handleNote = () => {
    if (!note.trim()) return;
    addNote(request.id, note.trim(), staff.name);
    showToast('Not eklendi.', 'success');
    setNote('');
    setNoteOpen(false);
  };

  const handleGuestAway = () => {
    setGuestAway(true);
    addNote(request.id, 'Misafir odada bulunamadı.', staff.name);
    showToast('Misafirin odada olmadığı not edildi.', 'info');
  };

  return (
    <div className="rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-navy-700">
            <Icon name={request.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-navy-900">Oda {request.roomNumber} · {request.categoryName}</p>
            <p className="mt-0.5 text-xs text-navy-400">{formatClock(request.createdAt)} · {formatElapsed(request.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={request.status} size="sm" />
          <PriorityBadge priority={request.priority} size="sm" />
          <OverdueBadge request={request} size="sm" />
        </div>
      </div>

      <p className="mt-3 rounded-xl bg-cream-50 px-3 py-2.5 text-xs leading-relaxed text-navy-600">{request.description}</p>

      {!isMine && !request.assignedStaffId && (
        <p className="mt-2 text-[11px] font-medium text-gold-600">Departmanına atanmamış talep · üstlenebilirsin</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-navy-400">
        {request.estimatedMinutes && (
          <span className="flex items-center gap-1"><Icon name="Timer" className="h-3.5 w-3.5" />~{request.estimatedMinutes} dk</span>
        )}
        {request.callBeforeArrival && (
          <span className="flex items-center gap-1 text-gold-600"><Icon name="PhoneCall" className="h-3.5 w-3.5" />Önce arayın</span>
        )}
        {guestAway && (
          <span className="flex items-center gap-1 text-ruby-500"><Icon name="UserX" className="h-3.5 w-3.5" />Misafir odada yok</span>
        )}
      </div>

      {request.staffNote && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-navy-900/5 px-3 py-2.5">
          <Icon name="MessageCircle" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />
          <p className="text-xs leading-relaxed text-navy-600">{request.staffNote}</p>
        </div>
      )}

      {request.status !== 'completed' && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-900/5 pt-3.5">
          {(request.status === 'received' || request.status === 'assigned') && (
            <Button size="sm" variant="primary" icon={<Icon name="PlayCircle" className="h-4 w-4" />} onClick={handleStart}>Başla</Button>
          )}
          {(request.status === 'preparing' || request.status === 'on_the_way' || request.status === 'arrived') && (
            <Button size="sm" variant="success" icon={<Icon name="CheckCheck" className="h-4 w-4" />} onClick={handleComplete}>Tamamlandı</Button>
          )}
          <Button size="sm" variant="secondary" icon={<Icon name="MessageSquarePlus" className="h-4 w-4" />} onClick={() => setNoteOpen((v) => !v)}>Not Ekle</Button>
          {!guestAway && (
            <Button size="sm" variant="ghost" icon={<Icon name="UserX" className="h-4 w-4" />} onClick={handleGuestAway}>Misafir Odada Yok</Button>
          )}
        </div>
      )}

      {noteOpen && (
        <div className="mt-3 flex gap-2">
          <TextArea rows={1} placeholder="Not yazın…" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={handleNote}>Ekle</Button>
        </div>
      )}
    </div>
  );
}
