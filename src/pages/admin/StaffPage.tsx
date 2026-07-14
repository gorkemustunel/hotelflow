import { useMemo, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { useOperations } from '@/context/OperationsContext';
import { Icon } from '@/components/common/Icon';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { AddStaffModal } from '@/components/admin/AddStaffModal';
import { computeStaffPerformance } from '@/utils/analytics';
import { formatDateTime } from '@/utils/time';
import { DEPARTMENT_LABELS, ROLE_LABELS, type Department, type RoleId } from '@/types';
import clsx from 'clsx';

const DEPARTMENTS: (Department | 'all')[] = ['all', 'housekeeping', 'technical', 'room_service', 'reception', 'spa', 'kitchen', 'management'];

export function StaffPage() {
  const { requests } = useAppData();
  const { staffMembers, addStaffMember, updateStaffRole, toggleStaffActive, has } = useOperations();
  const [dept, setDept] = useState<Department | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const canManage = has('manage_staff');
  const performance = useMemo(() => computeStaffPerformance(requests, staffMembers), [requests, staffMembers]);
  const filtered = dept === 'all' ? performance : performance.filter((p) => p.staff.department === dept);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Personel Yönetimi</h1>
          <p className="mt-1 text-sm text-navy-500">{staffMembers.length} personel · departman bazlı görev dağılımı</p>
        </div>
        {canManage && (
          <Button icon={<Icon name="UserPlus" className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
            Personel Ekle
          </Button>
        )}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {DEPARTMENTS.map((d) => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={clsx(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              dept === d ? 'bg-navy-900 text-white' : 'bg-cream-50 text-navy-600 ring-1 ring-navy-900/10 hover:bg-cream-100',
            )}
          >
            {d === 'all' ? 'Tümü' : DEPARTMENT_LABELS[d]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(({ staff: s, completedCount, activeCount }) => {
          const editing = editingId === s.id;
          return (
            <div key={s.id} className={clsx('rounded-2xl bg-cream-50 p-5 shadow-card ring-1 ring-navy-900/5', !s.active && 'opacity-60')}>
              <div className="flex items-center gap-3.5">
                <Avatar initials={s.initials} color={s.color} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-navy-900">{s.name}</p>
                    <span className={clsx('h-2 w-2 shrink-0 rounded-full', s.active ? 'bg-emerald-500' : 'bg-navy-300')} />
                  </div>
                  <p className="text-xs text-navy-500">{s.role}</p>
                  <p className="text-[11px] text-navy-400">{DEPARTMENT_LABELS[s.department]} · {ROLE_LABELS[s.roleId]}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-cream-50 py-2.5">
                  <p className="font-display text-base font-bold text-navy-900">{activeCount}</p>
                  <p className="text-[10px] text-navy-400">Aktif</p>
                </div>
                <div className="rounded-xl bg-cream-50 py-2.5">
                  <p className="font-display text-base font-bold text-navy-900">{completedCount}</p>
                  <p className="text-[10px] text-navy-400">Tamamlanan</p>
                </div>
                <div className="rounded-xl bg-cream-50 py-2.5">
                  <p className="flex items-center justify-center gap-0.5 font-display text-base font-bold text-navy-900">
                    <Icon name="Star" className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                    {s.rating}
                  </p>
                  <p className="text-[10px] text-navy-400">Puan</p>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-navy-900/5 pt-3.5 text-xs text-navy-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="Timer" className="h-3.5 w-3.5" />
                  Ort. {s.avgResolutionMinutes} dk
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="Phone" className="h-3.5 w-3.5" />
                  {s.phone}
                </span>
              </div>

              <p className="mt-2.5 text-[11px] text-navy-400">
                Son işlem: {s.lastActionAt ? formatDateTime(s.lastActionAt) : '—'}
              </p>

              {canManage && (
                <div className="mt-3 border-t border-navy-900/5 pt-3">
                  {!editing ? (
                    <button
                      onClick={() => setEditingId(s.id)}
                      className="w-full rounded-lg bg-cream-100 px-3 py-1.5 text-[11px] font-semibold text-navy-700 hover:bg-cream-200"
                    >
                      Düzenle
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-navy-600">Rol Değiştir</label>
                        <select
                          value={s.roleId}
                          onChange={(e) => updateStaffRole(s.id, e.target.value as RoleId)}
                          className="w-full rounded-lg border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs outline-none focus:border-gold-500"
                        >
                          {Object.entries(ROLE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStaffActive(s.id)}
                          className={clsx('flex-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold', s.active ? 'bg-ruby-500/10 text-ruby-600' : 'bg-emerald-500/10 text-emerald-700')}
                        >
                          {s.active ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-lg bg-navy-900 px-3 py-1.5 text-[11px] font-semibold text-white"
                        >
                          Kapat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} onSave={addStaffMember} />
    </div>
  );
}
