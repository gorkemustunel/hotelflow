import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  ActivityLogEntry,
  ApprovalRequest,
  BreakfastCategory,
  BreakfastItem,
  CleaningStatus,
  Department,
  HotelInfo,
  OccupancyStatus,
  PermissionId,
  PrepStatus,
  PriceChangeLog,
  Reservation,
  Role,
  RoleId,
  Room,
  RoomStatusLog,
  Staff,
  StockStatus,
  TechnicalStatus,
} from '@/types';
import { CLEANING_STATUS_LABELS, OCCUPANCY_LABELS, ROLE_LABELS, TECHNICAL_STATUS_LABELS } from '@/types';
import type { ServiceItemWithGroup } from '@/data/serviceItems';
import { getDemoSwitchUsers } from '@/data/staff';
import { generateId } from '@/utils/id';
import { hasPermission, hasAnyPermission } from '@/utils/permissions';
import * as ops from '@/services/opsRepository';

export type { ActivityLogEntry } from '@/types';

export interface NewStaffInput {
  name: string;
  roleId: RoleId;
  department: Department;
  role: string;
  phone: string;
}

export interface NewBreakfastItemInput {
  name: string;
  description: string;
  category: BreakfastCategory;
  allergens: string[];
  price?: number;
}

export interface NewReservationInput {
  roomNumber: string;
  guestName: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  notes?: string;
}

const AVATAR_COLORS = ['#0f1f38', '#17805a', '#c39a4e', '#a67f3a', '#26456f', '#335686', '#d4af6a', '#a8823f', '#932f2b'];

// Placeholder shown only for the brief window before the initial Supabase
// fetch resolves — `AppGate` in App.tsx keeps this from ever being rendered
// by a real consumer (HotelInfoContent/SettingsPage/etc.).
const EMPTY_HOTEL_INFO: HotelInfo = {
  hotelName: '',
  tagline: '',
  wifiName: '',
  wifiPassword: '',
  breakfastHours: '',
  poolHours: '',
  spaHours: '',
  restaurantHours: '',
  checkInTime: '',
  checkOutTime: '',
  parkingInfo: '',
  emergencyNumbers: [],
  hotelRules: [],
  floorPlanNote: '',
  address: '',
  heritageTitle: '',
  heritageParagraphs: [],
};

function initialsFromName(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface OperationsContextValue {
  // true until rooms/staff/roles/reservations/breakfast/QR tokens have all
  // loaded from Supabase at least once — gates rendering in App.tsx so
  // nothing downstream reads an empty `currentUser`/`rooms`/etc. mid-fetch.
  loading: boolean;

  // current demo user / role switching
  currentUser: Staff;
  demoUsers: Staff[];
  switchUser: (staffId: string) => void;

  // roles & permissions
  roles: Record<RoleId, Role>;
  permissions: PermissionId[];
  toggleRolePermission: (roleId: RoleId, permission: PermissionId) => void;
  has: (permission: PermissionId) => boolean;
  hasAny: (perms: PermissionId[]) => boolean;

  // rooms
  rooms: Room[];
  setRoomOccupancy: (roomId: string, value: OccupancyStatus) => void;
  setRoomCleaning: (roomId: string, value: CleaningStatus) => void;
  setRoomTechnical: (roomId: string, value: TechnicalStatus) => void;
  roomStatusLogs: RoomStatusLog[];

  // QR codes — each room has one current valid token. Regenerating a room's
  // QR issues a new token, which immediately invalidates any previously
  // printed/scanned QR (see GuestLayout's access guard).
  qrTokens: Record<string, string>;
  regenerateRoomQr: (roomNumber: string) => void;

  // reservations — the booking timeline, distinct from a room's live status
  reservations: Reservation[];
  addReservation: (input: NewReservationInput) => void;
  cancelReservation: (id: string) => void;

  // staff / personnel management
  staffMembers: Staff[];
  addStaffMember: (input: NewStaffInput) => void;
  updateStaffRole: (staffId: string, roleId: RoleId) => void;
  toggleStaffActive: (staffId: string) => void;

  // menu price changes
  priceChangeLogs: PriceChangeLog[];
  applyPriceChange: (itemId: string, itemName: string, oldPrice: number, newPrice: number) => void;

  // service / menu catalog (restaurant, minibar, spa…)
  serviceItems: ServiceItemWithGroup[];
  saveServiceItem: (item: ServiceItemWithGroup, oldPrice: number) => void;
  toggleServiceItemAvailability: (id: string) => void;

  // hotel settings (misafir uygulamasında görünen genel bilgiler)
  hotelInfo: HotelInfo;
  updateHotelInfo: (patch: Partial<HotelInfo>) => void;

  // breakfast management
  breakfastItems: BreakfastItem[];
  addBreakfastItem: (input: NewBreakfastItemInput) => void;
  toggleBreakfastAvailability: (id: string) => void;
  setBreakfastStock: (id: string, stock: StockStatus) => void;
  setBreakfastPrepStatus: (id: string, status: PrepStatus) => void;
  breakfastNote: string;
  setBreakfastNote: (note: string) => void;
  /** Returns 'applied' if the current user could change the price directly,
   * or 'pending_approval' if an ApprovalRequest was created instead. */
  changeBreakfastPrice: (id: string, newPrice: number) => 'applied' | 'pending_approval';

  // approvals
  approvalRequests: ApprovalRequest[];
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;

  // unified activity feed
  activityLog: ActivityLogEntry[];
}

const OperationsContext = createContext<OperationsContextValue | undefined>(undefined);

export function OperationsProvider({ children }: { children: ReactNode }) {
  // `demoUsers` is only used as a last-resort default for `currentUserId`
  // before the first staff row loads, and to render Personel yönetimi's
  // "known persona" grouping — it's fine that this stays a static read of
  // `data/staff.ts`'s id list rather than the live Supabase rows.
  const demoUsers = useMemo(() => getDemoSwitchUsers(), []);

  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = staffMembers.find((s) => s.id === currentUserId) ?? staffMembers[0] ?? ({} as Staff);

  const [roles, setRoles] = useState<Record<RoleId, Role>>({} as Record<RoleId, Role>);
  const permissions = roles[currentUser.roleId]?.permissions ?? [];
  const has = useCallback((p: PermissionId) => hasPermission(permissions, p), [permissions]);
  const hasAny = useCallback((ps: PermissionId[]) => hasAnyPermission(permissions, ps), [permissions]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomStatusLogs, setRoomStatusLogs] = useState<RoomStatusLog[]>([]);
  const [qrTokens, setQrTokens] = useState<Record<string, string>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [priceChangeLogs, setPriceChangeLogs] = useState<PriceChangeLog[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItemWithGroup[]>([]);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>(EMPTY_HOTEL_INFO);
  const [breakfastItems, setBreakfastItems] = useState<BreakfastItem[]>([]);
  const [breakfastNote, setBreakfastNote] = useState('');
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- initial load + realtime subscriptions ---------------------------
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      ops.listRooms(),
      ops.listStaff(),
      ops.listRoles(),
      ops.listReservations(),
      ops.listBreakfastItems(),
      ops.listQrTokens(),
      ops.listServiceItems(),
      ops.getHotelInfo(),
    ])
      .then(([roomRows, staffRows, roleRows, reservationRows, breakfastRows, qrRows, serviceItemRows, hotelInfoRow]) => {
        if (cancelled) return;
        setRooms(roomRows);
        setStaffMembers(staffRows);
        setRoles(roleRows);
        setReservations(reservationRows);
        setBreakfastItems(breakfastRows);
        setQrTokens(qrRows);
        setServiceItems(serviceItemRows);
        setHotelInfo(hotelInfoRow);
        setCurrentUserId((prev) => prev ?? staffRows.find((s) => demoUsers.some((d) => d.id === s.id))?.id ?? staffRows[0]?.id ?? null);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Operasyon verisi yüklenemedi:', err);
        if (!cancelled) setLoading(false);
      });

    ops.listRoomStatusLogs().then((logs) => {
      if (!cancelled) setRoomStatusLogs(logs);
    });
    ops.listPriceChangeLogs().then((logs) => {
      if (!cancelled) setPriceChangeLogs(logs);
    });
    ops.listApprovalRequests().then((reqs) => {
      if (!cancelled) setApprovalRequests(reqs);
    });
    ops.listActivityLog().then((logs) => {
      if (!cancelled) setActivityLog(logs);
    });

    const unsubRooms = ops.subscribeRooms(() => ops.listRooms().then(setRooms));
    const unsubReservations = ops.subscribeReservations(() => ops.listReservations().then(setReservations));
    const unsubBreakfast = ops.subscribeBreakfastItems(() => ops.listBreakfastItems().then(setBreakfastItems));
    const unsubQr = ops.subscribeQrTokens(() => ops.listQrTokens().then(setQrTokens));
    const unsubServiceItems = ops.subscribeServiceItems(() => ops.listServiceItems().then(setServiceItems));

    return () => {
      cancelled = true;
      unsubRooms();
      unsubReservations();
      unsubBreakfast();
      unsubQr();
      unsubServiceItems();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logActivity = useCallback(
    (description: string) => {
      const entry: ActivityLogEntry = { id: generateId('log'), actorName: currentUser.name, actorRole: currentUser.roleId, description, timestamp: new Date().toISOString() };
      setActivityLog((prev) => [entry, ...prev].slice(0, 200));
      ops.insertActivityLog(entry).catch(() => {});
    },
    [currentUser],
  );

  const switchUser = useCallback((staffId: string) => setCurrentUserId(staffId), []);

  const toggleRolePermission = useCallback((roleId: RoleId, permission: PermissionId) => {
    setRoles((prev) => {
      const role = prev[roleId];
      if (!role) return prev;
      const already = role.permissions.includes(permission);
      const nextPermissions = already ? role.permissions.filter((p) => p !== permission) : [...role.permissions, permission];
      ops.updateRolePermissions(roleId, nextPermissions).catch(() => {});
      return { ...prev, [roleId]: { ...role, permissions: nextPermissions } };
    });
  }, []);

  // ---- rooms -----------------------------------------------------------
  // NOTE: side-effecting calls (other setState/log calls) are deliberately
  // kept OUTSIDE the setRooms(prev => ...) updater body. React 18 StrictMode
  // double-invokes updater functions in dev to catch impure updaters, so
  // anything side-effecting nested inside one would log twice per click.
  const setRoomOccupancy = useCallback(
    (roomId: string, value: OccupancyStatus) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;
      const fromLabel = room.occupancy ? OCCUPANCY_LABELS[room.occupancy] : '—';
      const nextStatus = value === 'occupied' ? 'occupied' : room.status === 'maintenance' ? room.status : 'vacant';
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, occupancy: value, status: nextStatus } : r)));
      ops.updateRoom(roomId, { occupancy: value, status: nextStatus }).catch(() => {});
      const log: RoomStatusLog = { id: generateId('rlog'), roomNumber: room.number, actorName: currentUser.name, actorRole: currentUser.roleId, field: 'occupancy', fromLabel, toLabel: OCCUPANCY_LABELS[value], timestamp: new Date().toISOString() };
      setRoomStatusLogs((logs) => [log, ...logs]);
      ops.insertRoomStatusLog(log).catch(() => {});
      logActivity(`Oda ${room.number} "${OCCUPANCY_LABELS[value]}" olarak işaretlendi`);
    },
    [rooms, currentUser, logActivity],
  );

  const setRoomCleaning = useCallback(
    (roomId: string, value: CleaningStatus) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;
      const fromLabel = room.cleaningStatus ? CLEANING_STATUS_LABELS[room.cleaningStatus] : '—';
      const lastCleanedAt = value === 'clean' ? new Date().toISOString() : room.lastCleanedAt;
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, cleaningStatus: value, lastCleanedAt } : r)));
      ops.updateRoom(roomId, { cleaningStatus: value, lastCleanedAt }).catch(() => {});
      const log: RoomStatusLog = { id: generateId('rlog'), roomNumber: room.number, actorName: currentUser.name, actorRole: currentUser.roleId, field: 'cleaning', fromLabel, toLabel: CLEANING_STATUS_LABELS[value], timestamp: new Date().toISOString() };
      setRoomStatusLogs((logs) => [log, ...logs]);
      ops.insertRoomStatusLog(log).catch(() => {});
      logActivity(`Oda ${room.number} temizlik durumu "${CLEANING_STATUS_LABELS[value]}" yapıldı`);
    },
    [rooms, currentUser, logActivity],
  );

  const setRoomTechnical = useCallback(
    (roomId: string, value: TechnicalStatus) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;
      const fromLabel = room.technicalStatus ? TECHNICAL_STATUS_LABELS[room.technicalStatus] : '—';
      const nextStatus = value === 'maintenance' ? 'maintenance' : room.status === 'maintenance' ? 'vacant' : room.status;
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, technicalStatus: value, status: nextStatus } : r)));
      ops.updateRoom(roomId, { technicalStatus: value, status: nextStatus }).catch(() => {});
      const log: RoomStatusLog = { id: generateId('rlog'), roomNumber: room.number, actorName: currentUser.name, actorRole: currentUser.roleId, field: 'technical', fromLabel, toLabel: TECHNICAL_STATUS_LABELS[value], timestamp: new Date().toISOString() };
      setRoomStatusLogs((logs) => [log, ...logs]);
      ops.insertRoomStatusLog(log).catch(() => {});
      logActivity(`Oda ${room.number} teknik durumu "${TECHNICAL_STATUS_LABELS[value]}" yapıldı`);
    },
    [rooms, currentUser, logActivity],
  );

  // ---- QR codes ----------------------------------------------------------
  const regenerateRoomQr = useCallback(
    (roomNumber: string) => {
      const token = generateId('qr');
      setQrTokens((prev) => ({ ...prev, [roomNumber]: token }));
      ops.upsertQrToken(roomNumber, token).catch(() => {});
      logActivity(`Oda ${roomNumber} için QR kodu yenilendi, eski QR kodu artık geçersiz`);
    },
    [logActivity],
  );

  // ---- reservations ------------------------------------------------------
  const addReservation = useCallback(
    (input: NewReservationInput) => {
      const reservation: Reservation = {
        id: generateId('res'),
        roomNumber: input.roomNumber,
        guestName: input.guestName,
        guestCount: input.guestCount,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        notes: input.notes,
        createdByName: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      setReservations((prev) => [reservation, ...prev]);
      ops.insertReservation(reservation).catch(() => {});
      logActivity(`Oda ${input.roomNumber} için ${input.guestName} adına rezervasyon oluşturuldu (${input.checkIn} → ${input.checkOut})`);
    },
    [currentUser, logActivity],
  );

  const cancelReservation = useCallback(
    (id: string) => {
      const reservation = reservations.find((r) => r.id === id);
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, cancelled: true } : r)));
      ops.cancelReservationRow(id).catch(() => {});
      if (reservation) logActivity(`Oda ${reservation.roomNumber} · ${reservation.guestName} rezervasyonu iptal edildi`);
    },
    [reservations, logActivity],
  );

  // ---- staff -------------------------------------------------------------
  const addStaffMember = useCallback(
    (input: NewStaffInput) => {
      const newStaff: Staff = {
        id: generateId('staff'),
        roleId: input.roleId,
        active: true,
        lastActionAt: new Date().toISOString(),
        name: input.name,
        department: input.department,
        role: input.role,
        initials: initialsFromName(input.name),
        color: AVATAR_COLORS[staffMembers.length % AVATAR_COLORS.length],
        phone: input.phone,
        rating: 5,
        completedToday: 0,
        activeTasks: 0,
        avgResolutionMinutes: 0,
        onDuty: true,
      };
      setStaffMembers((prev) => [newStaff, ...prev]);
      ops
        .insertStaff({
          id: newStaff.id,
          role_id: newStaff.roleId,
          active: newStaff.active,
          last_action_at: newStaff.lastActionAt ?? null,
          name: newStaff.name,
          department: newStaff.department,
          role: newStaff.role,
          initials: newStaff.initials,
          color: newStaff.color,
          phone: newStaff.phone,
          rating: newStaff.rating,
          completed_today: newStaff.completedToday,
          active_tasks: newStaff.activeTasks,
          avg_resolution_minutes: newStaff.avgResolutionMinutes,
          on_duty: newStaff.onDuty,
          is_demo_switch_user: false,
        })
        .catch(() => {});
      logActivity(`${newStaff.name} personel olarak eklendi (${ROLE_LABELS[newStaff.roleId]})`);
    },
    [staffMembers.length, logActivity],
  );

  const updateStaffRole = useCallback(
    (staffId: string, roleId: RoleId) => {
      const lastActionAt = new Date().toISOString();
      setStaffMembers((prev) => prev.map((s) => (s.id === staffId ? { ...s, roleId, lastActionAt } : s)));
      ops.updateStaff(staffId, { roleId, lastActionAt }).catch(() => {});
      const target = staffMembers.find((s) => s.id === staffId);
      if (target) logActivity(`${target.name} için rol "${ROLE_LABELS[roleId]}" olarak değiştirildi`);
    },
    [staffMembers, logActivity],
  );

  const toggleStaffActive = useCallback(
    (staffId: string) => {
      const target = staffMembers.find((s) => s.id === staffId);
      if (!target) return;
      const active = !target.active;
      const lastActionAt = new Date().toISOString();
      setStaffMembers((prev) => prev.map((s) => (s.id === staffId ? { ...s, active, lastActionAt } : s)));
      ops.updateStaff(staffId, { active, lastActionAt }).catch(() => {});
      logActivity(`${target.name} ${active ? 'aktif' : 'pasif'} yapıldı`);
    },
    [staffMembers, logActivity],
  );

  // ---- menu price changes --------------------------------------------
  const applyPriceChange = useCallback(
    (itemId: string, itemName: string, oldPrice: number, newPrice: number) => {
      const log: PriceChangeLog = { id: generateId('plog'), itemId, itemName, actorName: currentUser.name, actorRole: currentUser.roleId, oldPrice, newPrice, timestamp: new Date().toISOString() };
      setPriceChangeLogs((prev) => [log, ...prev]);
      ops.insertPriceChangeLog(log).catch(() => {});
      logActivity(`"${itemName}" fiyatı ${oldPrice}₺'den ${newPrice}₺'ye değiştirildi`);
    },
    [currentUser, logActivity],
  );

  // ---- service / menu catalog -------------------------------------------
  const saveServiceItem = useCallback(
    (item: ServiceItemWithGroup, oldPrice: number) => {
      const stamped: ServiceItemWithGroup = { ...item, updatedBy: currentUser.name, updatedAt: new Date().toISOString() };
      const exists = serviceItems.some((i) => i.id === item.id);
      setServiceItems((prev) => (exists ? prev.map((i) => (i.id === item.id ? stamped : i)) : [stamped, ...prev]));
      if (exists) ops.updateServiceItem(stamped.id, stamped).catch(() => {});
      else ops.insertServiceItem(stamped).catch(() => {});
      if (has('edit_prices') && oldPrice !== item.price) {
        applyPriceChange(item.id, item.name, oldPrice, item.price);
      }
      logActivity(`"${item.name}" ürün/hizmet ${exists ? 'güncellendi' : 'eklendi'}`);
    },
    [serviceItems, currentUser, has, applyPriceChange, logActivity],
  );

  const toggleServiceItemAvailability = useCallback(
    (id: string) => {
      const item = serviceItems.find((i) => i.id === id);
      if (!item) return;
      const available = !item.available;
      const stock: StockStatus = available ? 'in_stock' : 'out_of_stock';
      const updatedAt = new Date().toISOString();
      setServiceItems((prev) => prev.map((i) => (i.id === id ? { ...i, available, stock, updatedBy: currentUser.name, updatedAt } : i)));
      ops.updateServiceItem(id, { available, stock, updatedBy: currentUser.name, updatedAt }).catch(() => {});
      logActivity(`"${item.name}" ${available ? 'aktif' : 'pasif'} yapıldı`);
    },
    [serviceItems, currentUser, logActivity],
  );

  // ---- hotel settings -----------------------------------------------------
  const updateHotelInfo = useCallback(
    (patch: Partial<HotelInfo>) => {
      setHotelInfo((prev) => ({ ...prev, ...patch }));
      ops.updateHotelInfo(patch).catch(() => {});
      logActivity('Otel ayarları güncellendi');
    },
    [logActivity],
  );

  // ---- breakfast -------------------------------------------------------
  const addBreakfastItem = useCallback(
    (input: NewBreakfastItemInput) => {
      const item: BreakfastItem = {
        id: generateId('bf'),
        name: input.name,
        description: input.description,
        allergens: input.allergens,
        category: input.category,
        stock: 'in_stock',
        available: true,
        prepStatus: 'preparing',
        price: input.price,
        addedBy: currentUser.name,
        updatedAt: new Date().toISOString(),
      };
      setBreakfastItems((prev) => [item, ...prev]);
      ops.insertBreakfastItem(item).catch(() => {});
      logActivity(`Kahvaltıya "${item.name}" eklendi`);
    },
    [currentUser, logActivity],
  );

  const toggleBreakfastAvailability = useCallback(
    (id: string) => {
      const item = breakfastItems.find((i) => i.id === id);
      if (!item) return;
      const available = !item.available;
      const updatedAt = new Date().toISOString();
      setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, available, updatedAt } : i)));
      ops.updateBreakfastItem(id, { available, updatedAt }).catch(() => {});
      logActivity(`"${item.name}" ${available ? 'aktif' : 'pasif'} yapıldı`);
    },
    [breakfastItems, logActivity],
  );

  const setBreakfastStock = useCallback(
    (id: string, stock: StockStatus) => {
      const updatedAt = new Date().toISOString();
      setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, stock, updatedAt } : i)));
      ops.updateBreakfastItem(id, { stock, updatedAt }).catch(() => {});
      const item = breakfastItems.find((i) => i.id === id);
      if (item) logActivity(`"${item.name}" ${stock === 'in_stock' ? 'stokta var' : 'stokta yok'} işaretlendi`);
    },
    [breakfastItems, logActivity],
  );

  const setBreakfastPrepStatus = useCallback((id: string, status: PrepStatus) => {
    const updatedAt = new Date().toISOString();
    setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, prepStatus: status, updatedAt } : i)));
    ops.updateBreakfastItem(id, { prepStatus: status, updatedAt }).catch(() => {});
  }, []);

  const changeBreakfastPrice = useCallback(
    (id: string, newPrice: number): 'applied' | 'pending_approval' => {
      const item = breakfastItems.find((i) => i.id === id);
      if (!item) return 'applied';
      const oldPrice = item.price ?? 0;
      if (has('edit_prices')) {
        const updatedAt = new Date().toISOString();
        setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, price: newPrice, updatedAt } : i)));
        ops.updateBreakfastItem(id, { price: newPrice, updatedAt }).catch(() => {});
        applyPriceChange(id, item.name, oldPrice, newPrice);
        return 'applied';
      }
      const req: ApprovalRequest = {
        id: generateId('appr'),
        type: 'price_change',
        requestedByName: currentUser.name,
        requestedByRole: currentUser.roleId,
        itemId: id,
        itemName: item.name,
        oldValue: String(oldPrice),
        newValue: String(newPrice),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setApprovalRequests((prev) => [req, ...prev]);
      ops.insertApprovalRequest(req).catch(() => {});
      logActivity(`"${item.name}" için fiyat değişikliği talebi oluşturdu (${oldPrice}₺ → ${newPrice}₺)`);
      return 'pending_approval';
    },
    [breakfastItems, has, currentUser, applyPriceChange, logActivity],
  );

  // ---- approvals -------------------------------------------------------
  const approveRequest = useCallback(
    (id: string) => {
      const req = approvalRequests.find((a) => a.id === id);
      if (!req) return;
      const resolvedAt = new Date().toISOString();
      setApprovalRequests((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved', resolvedAt, resolvedByName: currentUser.name } : a)));
      ops.updateApprovalRequest(id, { status: 'approved', resolvedAt, resolvedByName: currentUser.name }).catch(() => {});
      if (req.type === 'price_change') {
        const newPrice = Number(req.newValue);
        const updatedAt = new Date().toISOString();
        setBreakfastItems((prev) => prev.map((i) => (i.id === req.itemId ? { ...i, price: newPrice, updatedAt } : i)));
        ops.updateBreakfastItem(req.itemId, { price: newPrice, updatedAt }).catch(() => {});
        const log: PriceChangeLog = { id: generateId('plog'), itemId: req.itemId, itemName: req.itemName, actorName: currentUser.name, actorRole: currentUser.roleId, oldPrice: Number(req.oldValue), newPrice, timestamp: new Date().toISOString() };
        setPriceChangeLogs((prev) => [log, ...prev]);
        ops.insertPriceChangeLog(log).catch(() => {});
      }
      logActivity(`${currentUser.name}, "${req.itemName}" için fiyat değişikliğini onayladı`);
    },
    [approvalRequests, currentUser, logActivity],
  );

  const rejectRequest = useCallback(
    (id: string) => {
      const req = approvalRequests.find((a) => a.id === id);
      const resolvedAt = new Date().toISOString();
      setApprovalRequests((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected', resolvedAt, resolvedByName: currentUser.name } : a)));
      ops.updateApprovalRequest(id, { status: 'rejected', resolvedAt, resolvedByName: currentUser.name }).catch(() => {});
      if (req) logActivity(`${currentUser.name}, "${req.itemName}" için talebi reddetti`);
    },
    [approvalRequests, currentUser, logActivity],
  );

  const value = useMemo<OperationsContextValue>(
    () => ({
      loading,
      currentUser,
      demoUsers,
      switchUser,
      roles,
      permissions,
      toggleRolePermission,
      has,
      hasAny,
      rooms,
      setRoomOccupancy,
      setRoomCleaning,
      setRoomTechnical,
      roomStatusLogs,
      qrTokens,
      regenerateRoomQr,
      reservations,
      addReservation,
      cancelReservation,
      staffMembers,
      addStaffMember,
      updateStaffRole,
      toggleStaffActive,
      priceChangeLogs,
      applyPriceChange,
      serviceItems,
      saveServiceItem,
      toggleServiceItemAvailability,
      hotelInfo,
      updateHotelInfo,
      breakfastItems,
      addBreakfastItem,
      toggleBreakfastAvailability,
      setBreakfastStock,
      setBreakfastPrepStatus,
      breakfastNote,
      setBreakfastNote,
      changeBreakfastPrice,
      approvalRequests,
      approveRequest,
      rejectRequest,
      activityLog,
    }),
    [
      loading,
      currentUser,
      demoUsers,
      switchUser,
      roles,
      permissions,
      toggleRolePermission,
      has,
      hasAny,
      rooms,
      setRoomOccupancy,
      setRoomCleaning,
      setRoomTechnical,
      roomStatusLogs,
      qrTokens,
      regenerateRoomQr,
      reservations,
      addReservation,
      cancelReservation,
      staffMembers,
      addStaffMember,
      updateStaffRole,
      toggleStaffActive,
      priceChangeLogs,
      applyPriceChange,
      serviceItems,
      saveServiceItem,
      toggleServiceItemAvailability,
      hotelInfo,
      updateHotelInfo,
      breakfastItems,
      addBreakfastItem,
      toggleBreakfastAvailability,
      setBreakfastStock,
      setBreakfastPrepStatus,
      breakfastNote,
      changeBreakfastPrice,
      approvalRequests,
      approveRequest,
      rejectRequest,
      activityLog,
    ],
  );

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const ctx = useContext(OperationsContext);
  if (!ctx) throw new Error('useOperations must be used within OperationsProvider');
  return ctx;
}
