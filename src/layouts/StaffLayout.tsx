import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { Avatar } from '@/components/common/Avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { getStaffById } from '@/data/staff';
import { useOperations } from '@/context/OperationsContext';
import { clearStaffAuthed } from '@/auth/useSession';
import { DEPARTMENT_LABELS } from '@/types';
import clsx from 'clsx';

export function StaffLayout() {
  const { staffId = '' } = useParams();
  const navigate = useNavigate();
  const staffMember = getStaffById(staffId);
  const { switchUser } = useOperations();

  // Keep the shared "current user" (used for permission checks everywhere,
  // e.g. the breakfast screen's price-lock) in sync with whichever staff
  // member is logged in via this route.
  useEffect(() => {
    if (staffId) switchUser(staffId);
  }, [staffId, switchUser]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-line bg-cream-50 text-navy-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Avatar initials={staffMember?.initials ?? '?'} color={staffMember?.color ?? '#0f1f38'} />
            <div>
              <p className="text-sm font-semibold leading-tight">{staffMember?.name ?? 'Personel'}</p>
              <p className="text-[11px] text-gold-600">{staffMember ? DEPARTMENT_LABELS[staffMember.department] : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => {
                clearStaffAuthed();
                navigate('/staff');
              }}
              className="flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1.5 text-xs font-semibold text-navy-900 ring-1 ring-line transition hover:bg-navy-900/10"
            >
              <Icon name="LogOut" className="h-3.5 w-3.5" />
              Çıkış
            </button>
          </div>
        </div>
        {staffMember?.roleId === 'chef' && (
          <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-2 sm:px-6">
            <NavLink
              end
              to={`/staff/${staffId}`}
              className={({ isActive }) =>
                clsx('rounded-full px-3 py-1.5 text-xs font-semibold transition', isActive ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-900/5')
              }
            >
              Görevlerim
            </NavLink>
            <NavLink
              to={`/staff/${staffId}/breakfast`}
              className={({ isActive }) =>
                clsx('rounded-full px-3 py-1.5 text-xs font-semibold transition', isActive ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-900/5')
              }
            >
              Kahvaltı Yönetimi
            </NavLink>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
