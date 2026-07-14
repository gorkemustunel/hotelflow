import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification } from '@/types';
import { Icon } from './Icon';
import { formatElapsed } from '@/utils/time';
import clsx from 'clsx';

interface NotificationBellProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  /** Where a notification should navigate to when clicked. */
  resolveHref: (notification: AppNotification) => string;
  /** Visual variant: `dark` for the navy headers (guest/admin top bar), `light` for white toolbars. */
  variant?: 'dark' | 'light';
}

export function NotificationBell({ notifications, unreadCount, onMarkRead, onMarkAllRead, resolveHref, variant = 'dark' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleClickNotification = (n: AppNotification) => {
    onMarkRead(n.id);
    setOpen(false);
    navigate(resolveHref(n));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'relative flex h-9 w-9 items-center justify-center rounded-full transition',
          variant === 'dark' ? 'bg-white/10 text-white hover:bg-white/15' : 'text-navy-500 hover:bg-navy-900/5',
        )}
        aria-label="Bildirimler"
      >
        <Icon name="Bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ruby-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[22rem] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-lifted ring-1 ring-navy-900/10 animate-in">
          <div className="flex items-center justify-between border-b border-navy-900/5 px-4 py-3">
            <p className="font-display text-sm font-semibold text-navy-900">Bildirimler</p>
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead} className="text-xs font-semibold text-gold-600 hover:text-gold-700">
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Icon name="BellOff" className="h-6 w-6 text-navy-300" />
                <p className="text-xs text-navy-400">Henüz bildirim yok</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={clsx('flex w-full items-start gap-3 border-b border-navy-900/5 px-4 py-3 text-left transition last:border-0 hover:bg-cream-50', !n.read && 'bg-gold-500/5')}
                >
                  <span className={clsx('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', n.read ? 'bg-cream-200 text-navy-500' : 'bg-gold-500/15 text-gold-600')}>
                    <Icon name={n.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={clsx('truncate text-sm', n.read ? 'font-medium text-navy-700' : 'font-semibold text-navy-900')}>{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-navy-500">{n.body}</span>
                    <span className="mt-0.5 block text-[11px] text-navy-400">{formatElapsed(n.timestamp)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
