import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppNotification, NotificationAudience } from '@/types';
import { generateId } from '@/utils/id';
import {
  insertNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from '@/services/notificationsRepository';

const MAX_NOTIFICATIONS = 100;

export interface NotifyInput {
  audience: NotificationAudience;
  roomNumber?: string;
  title: string;
  body: string;
  icon?: string;
  requestId?: string;
}

interface NotificationsContextValue {
  notify: (input: NotifyInput) => void;
  markRead: (id: string) => void;
  markAllRead: (audience: NotificationAudience, roomNumber?: string) => void;
  getForGuest: (roomNumber: string) => AppNotification[];
  getForAdmin: () => AppNotification[];
  unreadCountForGuest: (roomNumber: string) => number;
  unreadCountForAdmin: () => number;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    listNotifications()
      .then((rows) => {
        if (!cancelled) setNotifications(rows);
      })
      .catch(() => {});
    const unsubscribe = subscribeNotifications(() => {
      listNotifications().then((rows) => {
        if (!cancelled) setNotifications(rows);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const notify = useCallback((input: NotifyInput) => {
    const entry: AppNotification = {
      id: generateId('notif'),
      audience: input.audience,
      roomNumber: input.roomNumber,
      title: input.title,
      body: input.body,
      icon: input.icon ?? 'Bell',
      timestamp: new Date().toISOString(),
      read: false,
      requestId: input.requestId,
    };
    setNotifications((prev) => [entry, ...prev].slice(0, MAX_NOTIFICATIONS));
    insertNotification(entry).catch(() => {});
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback((audience: NotificationAudience, roomNumber?: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.audience === audience && (audience === 'admin' || n.roomNumber === roomNumber) ? { ...n, read: true } : n)),
    );
    markAllNotificationsRead(audience, roomNumber).catch(() => {});
  }, []);

  const getForGuest = useCallback((roomNumber: string) => notifications.filter((n) => n.audience === 'guest' && n.roomNumber === roomNumber), [notifications]);
  const getForAdmin = useCallback(() => notifications.filter((n) => n.audience === 'admin'), [notifications]);
  const unreadCountForGuest = useCallback((roomNumber: string) => getForGuest(roomNumber).filter((n) => !n.read).length, [getForGuest]);
  const unreadCountForAdmin = useCallback(() => getForAdmin().filter((n) => !n.read).length, [getForAdmin]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ notify, markRead, markAllRead, getForGuest, getForAdmin, unreadCountForGuest, unreadCountForAdmin }),
    [notify, markRead, markAllRead, getForGuest, getForAdmin, unreadCountForGuest, unreadCountForAdmin],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
