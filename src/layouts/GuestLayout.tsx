import { useEffect } from 'react';
import { NavLink, Outlet, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { NotificationBell } from '@/components/common/NotificationBell';
import { ViewModeToggle } from '@/components/guest/ViewModeToggle';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ConciergeAssistant } from '@/components/guest/ConciergeAssistant';
import { InvalidQrScreen } from '@/components/guest/InvalidQrScreen';
import { useAppData } from '@/context/AppDataContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useOperations } from '@/context/OperationsContext';
import { useViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

const TABS = [
  { to: '', label: 'Ana Sayfa', icon: 'Home', end: true },
  { to: 'services', label: 'Hizmetler', icon: 'LayoutGrid' },
  { to: 'requests', label: 'Taleplerim', icon: 'ClipboardList' },
  { to: 'info', label: 'Bilgiler', icon: 'Info' },
];

/** True once the QR token in the URL (or a previously-verified token still
 * remembered for this browser tab) matches the room's current valid token.
 * Regenerating a room's QR from the admin panel changes that current token,
 * which immediately invalidates both old printed QR cards and any
 * already-open guest session on next navigation/refresh. */
function useQrAccess(roomNumber: string) {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('t');
  const { qrTokens } = useOperations();
  const currentToken = qrTokens[roomNumber];
  const storageKey = `hf-qr-verified-${roomNumber}`;

  useEffect(() => {
    if (urlToken && currentToken && urlToken === currentToken) {
      window.sessionStorage.setItem(storageKey, urlToken);
    }
  }, [urlToken, currentToken, storageKey]);

  const verifiedToken = window.sessionStorage.getItem(storageKey);
  return !!currentToken && (urlToken === currentToken || verifiedToken === currentToken);
}

export function GuestLayout() {
  const { roomNumber = '' } = useParams();
  const navigate = useNavigate();
  const { getActiveRequestsForRoom } = useAppData();
  const activeCount = getActiveRequestsForRoom(roomNumber).length;
  const { getForGuest, unreadCountForGuest, markRead, markAllRead } = useNotifications();
  const guestNotifications = getForGuest(roomNumber);
  const { isDesktop } = useViewMode();
  const hasAccess = useQrAccess(roomNumber);

  if (!hasAccess) {
    return <InvalidQrScreen />;
  }

  const containerWidth = isDesktop ? 'max-w-5xl' : 'max-w-lg';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-line bg-cream-50 text-navy-900">
        <div className={clsx('mx-auto flex items-center justify-between px-5 py-4', containerWidth)}>
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-400/30">
              <Icon name="Gem" className="h-5 w-5 text-gold-600" />
            </div>
            <div className="text-left">
              <p className="font-display text-sm font-semibold leading-tight tracking-wide">HotelFlow</p>
              <p className="text-[10px] uppercase tracking-widest text-gold-600">Bosphorus Residence</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <ConciergeAssistant roomNumber={roomNumber} />
            <ThemeToggle />
            <ViewModeToggle />
            <NotificationBell
              notifications={guestNotifications}
              unreadCount={unreadCountForGuest(roomNumber)}
              onMarkRead={markRead}
              onMarkAllRead={() => markAllRead('guest', roomNumber)}
              resolveHref={() => `/guest/room/${roomNumber}/requests`}
              variant="light"
            />
            <button
              onClick={() => navigate(`/guest/room/${roomNumber}/emergency`)}
              className="flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1.5 text-xs font-semibold text-navy-900 ring-1 ring-line transition hover:bg-navy-900/10"
            >
              <Icon name="ShieldAlert" className="h-3.5 w-3.5 text-ruby-500" />
              <span className="hidden sm:inline">Acil</span>
            </button>
            <button
              onClick={() => navigate('/')}
              aria-label="Rol seçimine dön"
              className="flex items-center gap-1.5 rounded-full bg-navy-900/5 p-1.5 text-navy-900 ring-1 ring-line transition hover:bg-navy-900/10"
            >
              <Icon name="LogOut" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <nav className="border-t border-line">
          <div className={clsx('mx-auto flex items-stretch px-1 sm:px-5', containerWidth, isDesktop ? 'justify-start gap-6' : 'justify-center')}>
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={`/guest/room/${roomNumber}${tab.to ? `/${tab.to}` : ''}`}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    'relative flex items-center justify-center gap-1 border-b-2 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:gap-1.5 sm:text-xs',
                    isDesktop ? 'flex-none px-1' : 'flex-1',
                    isActive ? 'border-gold-500 text-navy-900' : 'border-transparent text-navy-400 hover:text-navy-700',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={tab.icon} className={clsx('hidden h-3.5 w-3.5 sm:block', isActive ? 'text-gold-600' : 'text-navy-400')} />
                    {tab.label}
                    {tab.label === 'Taleplerim' && activeCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ruby-500 px-1 text-[9px] font-bold text-white">
                        {activeCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className={clsx('mx-auto w-full flex-1 px-4 pb-16 pt-5', containerWidth)}>
        <Outlet />
      </main>
    </div>
  );
}
