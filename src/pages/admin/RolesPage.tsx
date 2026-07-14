import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useOperations } from '@/context/OperationsContext';
import { ALL_PERMISSION_IDS } from '@/data/roles';
import { PERMISSION_LABELS, type RoleId } from '@/types';
import clsx from 'clsx';

export function RolesPage() {
  const { roles, toggleRolePermission, staffMembers } = useOperations();
  const [editingRoleId, setEditingRoleId] = useState<RoleId | null>(null);

  const roleList = Object.values(roles);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Rol ve Yetki Yönetimi</h1>
        <p className="mt-1 text-sm text-navy-500">{roleList.length} rol tanımlı · her rolün izinlerini burada düzenleyebilirsiniz</p>
      </div>

      <div className="space-y-3">
        {roleList.map((role) => {
          const editing = editingRoleId === role.id;
          const memberCount = staffMembers.filter((s) => s.roleId === role.id).length;
          return (
            <div key={role.id} className="rounded-2xl bg-cream-50 p-4 shadow-card ring-1 ring-navy-900/5 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-200">
                      <Icon name="ShieldCheck" className="h-4.5 w-4.5 text-gold-600" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{role.name}</p>
                      <p className="text-[11px] text-navy-400">{memberCount} personel · {role.permissions.length} izin</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-navy-500">{role.description}</p>
                </div>
                <button
                  onClick={() => setEditingRoleId(editing ? null : role.id)}
                  className={clsx('shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition', editing ? 'bg-navy-900 text-white' : 'bg-cream-100 text-navy-700 hover:bg-cream-200')}
                >
                  {editing ? 'Kapat' : 'Düzenle'}
                </button>
              </div>

              {editing && (
                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 border-t border-navy-900/5 pt-4 sm:grid-cols-2">
                  {ALL_PERMISSION_IDS.map((permission) => {
                    const checked = role.permissions.includes(permission);
                    return (
                      <label key={permission} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-cream-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRolePermission(role.id, permission)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-900/20 text-gold-600 focus:ring-gold-500"
                        />
                        <span className="text-xs text-navy-700">{PERMISSION_LABELS[permission]}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {!editing && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 6).map((p) => (
                    <span key={p} className="rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-medium text-navy-500">{PERMISSION_LABELS[p]}</span>
                  ))}
                  {role.permissions.length > 6 && (
                    <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-medium text-navy-400">+{role.permissions.length - 6} daha</span>
                  )}
                  {role.permissions.length === 0 && (
                    <span className="text-[11px] text-navy-400">Bu role henüz izin atanmadı.</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
