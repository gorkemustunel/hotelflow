import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { Avatar } from '@/components/common/Avatar';
import { NotificationBell } from '@/components/common/NotificationBell';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAppData } from '@/context/AppDataContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useOperations } from '@/context/OperationsContext';
import { clearAdminAuthed } from '@/auth/useSession';
import { ROLE_LABELS, type PermissionId } from '@/types';
import clsx from 'clsx';

const NAV: { to: string; label: string; icon: string; end?: boolean; permission: PermissionId }[] = [
  { to: '', label: 'Panel', icon: 'LayoutDashboard', end: true, permission: 'view_dashboard' },
  { to: 'requests', label: 'Talepler', icon: 'ClipboardList', permission: 'manage_requests' },
  { to: 'rooms', label: 'Odalar & QR', icon: 'DoorOpen', permission: 'update_room_status' },
  { to: 'reservations', label: 'Rezervasyonlar', icon: 'CalendarRange', permission: 'manage_reservations' },
  { to: 'staff', label: 'Personel', icon: 'Users', permission: 'manage_staff' },
  { to: 'services', label: 'Hizmet & Menü', icon: 'UtensilsCrossed', permission: 'manage_menu' },
  { to: 'breakfast', label: 'Kahvaltı', icon: 'Coffee', permission: 'manage_breakfast_menu' },
  { to: 'reports', label: 'Raporlar', icon: 'BarChart3', permission: 'view_reports' },
  { to: 'roles', label: 'Rol & Yetki', icon: 'ShieldCheck', permission: 'manage_roles' },
  { to: 'settings', label: 'Ayarlar', icon: 'Settings', permission: 'manage_hotel_settings' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { requests } = useAppData();
  const { currentUser, has } = useOperations();
  const urgentOpen = requests.filter((r) => r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status)).length;
  const { getForAdmin, unreadCountForAdmin, markRead, markAllRead } = useNotifications();
  const adminNotifications = getForAdmin();
  const visibleNav = NAV.filter((item) => has(item.permission));

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream-100">
      <header className="sticky top-0 z-20 border-b border-line bg-cream-50/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-400/30">
              <Icon name="Gem" className="h-5 w-5 text-gold-600" />
            </div>
            <div className="text-left">
              <p className="font-display text-sm font-semibold leading-tight text-navy-900">HotelFlow</p>
              <p className="text-[10px] uppercase tracking-widest text-gold-600">Yönetici Paneli</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell
              notifications={adminNotifications}
              unreadCount={unreadCountForAdmin()}
              onMarkRead={markRead}
              onMarkAllRead={() => markAllRead('admin')}
              resolveHref={() => '/admin/requests'}
              variant="light"
            />
            {/* Read-only identity — who's logged in is decided once, at
                sign-in, on AdminSelectPage (password-gated, mirrors the
                staff flow). This bar intentionally does not offer a live
                "switch user" control: that used to sit here as a dropdown
                and read like a real account menu, which was confusing in a
                demo with no login. */}
            <span className="hidden items-center gap-2 rounded-full bg-cream-100 py-1 pl-1 pr-3 ring-1 ring-line sm:flex">
              <Avatar initials={currentUser.initials} color={currentUser.color} size="sm" />
              <span className="text-left">
                <span className="block text-sm font-semibold leading-tight text-navy-800">{currentUser.name}</span>
                <span className="block text-[10px] leading-tight text-navy-400">{ROLE_LABELS[currentUser.roleId]}</span>
              </span>
            </span>
            <button
              onClick={() => {
                clearAdminAuthed();
                navigate('/admin-select');
              }}
              aria-label="Çıkış yap"
              title="Çıkış yap"
              className="rounded-lg p-2 text-navy-700 hover:bg-navy-900/5"
            >
              <Icon name="LogOut" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {visibleNav.length > 0 && (
          <nav className="border-t border-line">
            <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:gap-2 sm:px-6">
              {visibleNav.map((item) => (
                <NavLink
                  key={item.label}
                  to={`/admin${item.to ? `/${item.to}` : ''}`}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'relative flex shrink-0 items-center gap-1.5 border-b-2 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-[13px]',
                      isActive ? 'border-gold-500 text-navy-900' : 'border-transparent text-navy-400 hover:text-navy-700',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon name={item.icon} className={clsx('h-3.5 w-3.5', isActive ? 'text-gold-600' : 'text-navy-400')} />
                      {item.label}
                      {item.label === 'Talepler' && urgentOpen > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ruby-500 px-1 text-[9px] font-bold text-white">
                          {urgentOpen}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-6">
        {visibleNav.length === 0 ? (
          <p className="rounded-sm bg-navy-900/5 px-3.5 py-3 text-xs leading-relaxed text-navy-500">
            {ROLE_LABELS[currentUser.roleId]} rolü için yönetici panelinde görüntülenecek bir ekran yok. Bu rol personel panelini kullanır.
          </p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
