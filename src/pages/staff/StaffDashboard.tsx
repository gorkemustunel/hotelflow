import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { getStaffById } from '@/data/staff';
import { StaffTaskCard } from '@/components/staff/StaffTaskCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Segmented } from '@/components/common/Segmented';
import { Icon } from '@/components/common/Icon';

export function StaffDashboard() {
  const { staffId = '' } = useParams();
  const { requests } = useAppData();
  const staffMember = getStaffById(staffId);
  const [tab, setTab] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  const relevant = useMemo(
    () => requests.filter((r) => r.assignedStaffId === staffId || (!r.assignedStaffId && staffMember && r.department === staffMember.department)),
    [requests, staffId, staffMember],
  );

  const pending = relevant.filter((r) => r.status === 'received' || r.status === 'assigned');
  const inProgress = relevant.filter((r) => ['preparing', 'on_the_way', 'arrived'].includes(r.status));
  const completed = relevant.filter((r) => r.status === 'completed');

  const list = tab === 'pending' ? pending : tab === 'in_progress' ? inProgress : completed;

  if (!staffMember) return <EmptyState icon="UserX" title="Personel bulunamadı" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Görevlerim</h1>
        <p className="mt-1 text-sm text-navy-500">Bugün {completed.length} görev tamamladınız, {inProgress.length} görev devam ediyor.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-cream-50 p-3.5 text-center shadow-card ring-1 ring-navy-900/5">
          <p className="font-display text-xl font-bold text-navy-900">{pending.length}</p>
          <p className="text-[11px] text-navy-400">Bekleyen</p>
        </div>
        <div className="rounded-2xl bg-cream-50 p-3.5 text-center shadow-card ring-1 ring-navy-900/5">
          <p className="font-display text-xl font-bold text-navy-900">{inProgress.length}</p>
          <p className="text-[11px] text-navy-400">Devam Eden</p>
        </div>
        <div className="rounded-2xl bg-cream-50 p-3.5 text-center shadow-card ring-1 ring-navy-900/5">
          <p className="font-display text-xl font-bold text-navy-900">{completed.length}</p>
          <p className="text-[11px] text-navy-400">Tamamlanan</p>
        </div>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'pending', label: `Bekleyen (${pending.length})` },
          { value: 'in_progress', label: `Devam Eden (${inProgress.length})` },
          { value: 'completed', label: `Tamamlanan (${completed.length})` },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon="CheckCircle2" title="Bu listede görev yok" description="Yeni görevler geldiğinde burada görünecek." />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <StaffTaskCard key={r.id} request={r} staff={staffMember} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl bg-navy-900/5 px-4 py-3 text-xs text-navy-500">
        <Icon name="Info" className="h-4 w-4 shrink-0" />
        Sadece departmanınıza ({staffMember.department}) ait ve size atanmış görevler listelenir.
      </div>
    </div>
  );
}
