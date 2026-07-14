import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppData, ACTIVE_STATUSES } from '@/context/AppDataContext';
import { RequestCard } from '@/components/guest/RequestCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Segmented } from '@/components/common/Segmented';
import { useViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

export function ActiveRequests() {
  const { roomNumber = '' } = useParams();
  const { getRequestsForRoom } = useAppData();
  const { isDesktop } = useViewMode();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const all = getRequestsForRoom(roomNumber).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const active = all.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const history = all.filter((r) => !ACTIVE_STATUSES.includes(r.status));
  const list = tab === 'active' ? active : history;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Taleplerim</h1>
        <p className="mt-1 text-sm text-navy-500">Oda {roomNumber} için oluşturduğunuz talepler</p>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'active', label: `Aktif (${active.length})` },
          { value: 'history', label: `Geçmiş (${history.length})` },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? 'Inbox' : 'History'}
          title={tab === 'active' ? 'Aktif talebiniz yok' : 'Geçmiş talebiniz yok'}
          description={tab === 'active' ? 'Bir hizmet kategorisi seçerek yeni talep oluşturabilirsiniz.' : 'Tamamlanan veya iptal edilen talepleriniz burada görünecek.'}
        />
      ) : (
        <div className={clsx(isDesktop ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
          {list.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
