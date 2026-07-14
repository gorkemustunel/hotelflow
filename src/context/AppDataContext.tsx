import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { GuestRequest, RequestStatus } from '@/types';
import { REQUEST_STATUS_LABELS } from '@/types';
import { rooms as seedRooms } from '@/data/rooms';
import { staff as seedStaff } from '@/data/staff';
import { requestsRepository, isSupabaseConfigured } from '@/services';
import type { NewRequestInput } from '@/services';
import { loadRequestsFromStorage } from '@/services/localRequestsRepository';
import { useNotifications } from './NotificationsContext';

export type { NewRequestInput };

interface AppDataContextValue {
  requests: GuestRequest[];
  rooms: typeof seedRooms;
  staff: typeof seedStaff;
  createRequest: (input: NewRequestInput) => void;
  assignStaff: (id: string, staffId: string, staffName: string) => void;
  updateStatus: (id: string, status: RequestStatus, note?: string, actor?: string) => void;
  addNote: (id: string, note: string, actor: string) => void;
  cancelRequest: (id: string, reason: string, actor?: string) => void;
  setGuestPresent: (id: string, present: boolean) => void;
  resetDemo: () => void;
  getRequestsForRoom: (roomNumber: string) => GuestRequest[];
  getActiveRequestsForRoom: (roomNumber: string) => GuestRequest[];
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const ACTIVE_STATUSES: RequestStatus[] = ['received', 'assigned', 'preparing', 'on_the_way', 'arrived'];

/**
 * All request state flows through `requestsRepository` (see `src/services`)
 * instead of being managed inline here. This component's only job is to
 * hold the current snapshot in React state and re-render when the
 * repository reports a change — it has no idea whether that repository is
 * backed by localStorage (today) or a real API (later).
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  // Seeded synchronously so the first paint already has data (no loading
  // flash for the local/demo repository). TODO(backend): once
  // `requestsRepository` performs real network I/O, start this as `[]`,
  // add a `loading` flag, and rely solely on the fetch-on-mount effect
  // below to populate it.
  // With Supabase active, don't flash localStorage demo data before the
  // real fetch resolves — start empty and let the effect below populate it.
  const [requests, setRequests] = useState<GuestRequest[]>(() => (isSupabaseConfigured ? [] : loadRequestsFromStorage()));
  const { notify } = useNotifications();

  useEffect(() => {
    requestsRepository.list().then(setRequests);
    // When the active repository supports live updates (e.g. Supabase
    // Realtime), stay subscribed so changes made from other devices/tabs —
    // a guest ordering from their phone, another staff member updating a
    // status — show up here without a manual refresh.
    const unsubscribe = requestsRepository.subscribe?.(setRequests);
    return () => unsubscribe?.();
  }, []);

  const createRequest = useCallback(
    (input: NewRequestInput) => {
      requestsRepository.create(input).then((created) => {
        setRequests((prev) => [created, ...prev]);
        notify({
          audience: 'admin',
          title: `Oda ${created.roomNumber} · Yeni talep`,
          body: created.title,
          icon: created.icon,
          requestId: created.id,
        });
      });
    },
    [notify],
  );

  const assignStaff = useCallback(
    (id: string, staffId: string, staffName: string) => {
      requestsRepository.assignStaff(id, staffId, staffName).then((updated) => {
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        notify({
          audience: 'guest',
          roomNumber: updated.roomNumber,
          title: `${updated.categoryName} talebiniz üstlenildi`,
          body: `${staffName} talebinizle ilgileniyor.`,
          icon: updated.icon,
          requestId: updated.id,
        });
      });
    },
    [notify],
  );

  const updateStatus = useCallback(
    (id: string, status: RequestStatus, note?: string, actor?: string) => {
      requestsRepository.updateStatus(id, status, note, actor).then((updated) => {
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        if (status !== 'received') {
          notify({
            audience: 'guest',
            roomNumber: updated.roomNumber,
            title: `${updated.categoryName} · ${REQUEST_STATUS_LABELS[status]}`,
            body: note || `Talebinizin durumu "${REQUEST_STATUS_LABELS[status]}" olarak güncellendi.`,
            icon: updated.icon,
            requestId: updated.id,
          });
        }
      });
    },
    [notify],
  );

  const addNote = useCallback((id: string, note: string, actor: string) => {
    requestsRepository.addNote(id, note, actor).then((updated) => setRequests((prev) => prev.map((r) => (r.id === id ? updated : r))));
  }, []);

  const cancelRequest = useCallback(
    (id: string, reason: string, actor = 'Misafir') => {
      requestsRepository.cancel(id, reason, actor).then((updated) => {
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        if (actor === 'Misafir') {
          notify({
            audience: 'admin',
            title: `Oda ${updated.roomNumber} · Talep iptal edildi`,
            body: `${updated.categoryName}: ${reason}`,
            icon: 'XCircle',
            requestId: updated.id,
          });
        } else {
          notify({
            audience: 'guest',
            roomNumber: updated.roomNumber,
            title: `${updated.categoryName} talebiniz iptal edildi`,
            body: reason,
            icon: 'XCircle',
            requestId: updated.id,
          });
        }
      });
    },
    [notify],
  );

  const setGuestPresent = useCallback((id: string, present: boolean) => {
    requestsRepository.setGuestPresent(id, present).then((updated) => setRequests((prev) => prev.map((r) => (r.id === id ? updated : r))));
  }, []);

  const resetDemo = useCallback(() => {
    requestsRepository.reset().then(setRequests);
  }, []);

  const getRequestsForRoom = useCallback((roomNumber: string) => requests.filter((r) => r.roomNumber === roomNumber), [requests]);
  const getActiveRequestsForRoom = useCallback(
    (roomNumber: string) => requests.filter((r) => r.roomNumber === roomNumber && ACTIVE_STATUSES.includes(r.status)),
    [requests],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      requests,
      rooms: seedRooms,
      staff: seedStaff,
      createRequest,
      assignStaff,
      updateStatus,
      addNote,
      cancelRequest,
      setGuestPresent,
      resetDemo,
      getRequestsForRoom,
      getActiveRequestsForRoom,
    }),
    [requests, createRequest, assignStaff, updateStatus, addNote, cancelRequest, setGuestPresent, resetDemo, getRequestsForRoom, getActiveRequestsForRoom],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

export { ACTIVE_STATUSES };
