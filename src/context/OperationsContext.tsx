import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  ApprovalRequest,
  BreakfastCategory,
  BreakfastItem,
  CleaningStatus,
  Department,
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
import { rooms as seedRooms } from '@/data/rooms';
import { staff as seedStaff, getDemoSwitchUsers } from '@/data/staff';
import { INITIAL_ROLES } from '@/data/roles';
import { initialBreakfastItems } from '@/data/breakfastItems';
import { reservations as seedReservations } from '@/data/reservations';
import { generateId } from '@/utils/id';
import { hasPermission, hasAnyPermission } from '@/utils/permissions';

export interface ActivityLogEntry {
  id: string;
  actorName: string;
  actorRole: RoleId;
  description: string;
  timestamp: string;
}

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

function initialsFromName(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface OperationsContextValue {
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
  const demoUsers = useMemo(() => getDemoSwitchUsers(), []);
  const [staffMembers, setStaffMembers] = useState<Staff[]>(seedStaff);
  const [currentUserId, setCurrentUserId] = useState<string>(demoUsers[0]?.id ?? seedStaff[0].id);
  const currentUser = staffMembers.find((s) => s.id === currentUserId) ?? staffMembers[0];

  const [roles, setRoles] = useState<Record<RoleId, Role>>(INITIAL_ROLES);
  const permissions = roles[currentUser.roleId]?.permissions ?? [];
  const has = useCallback((p: PermissionId) => hasPermission(permissions, p), [permissions]);
  const hasAny = useCallback((ps: PermissionId[]) => hasAnyPermission(permissions, ps), [permissions]);

  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [roomStatusLogs, setRoomStatusLogs] = useState<RoomStatusLog[]>([]);
  const [qrTokens, setQrTokens] = useState<Record<string, string>>(() =>
    Object.fromEntries(seedRooms.map((r) => [r.number, generateId('qr')])),
  );
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);
  const [priceChangeLogs, setPriceChangeLogs] = useState<PriceChangeLog[]>([]);
  const [breakfastItems, setBreakfastItems] = useState<BreakfastItem[]>(initialBreakfastItems);
  const [breakfastNote, setBreakfastNote] = useState('');
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const logActivity = useCallback(
    (description: string) => {
      setActivityLog((prev) => [
        { id: generateId('log'), actorName: currentUser.name, actorRole: currentUser.roleId, description, timestamp: new Date().toISOString() },
        ...prev,
      ].slice(0, 200));
    },
    [currentUser],
  );

  const switchUser = useCallback((staffId: string) => setCurrentUserId(staffId), []);

  const toggleRolePermission = useCallback((roleId: RoleId, permission: PermissionId) => {
    setRoles((prev) => {
      const role = prev[roleId];
      const already = role.permissions.includes(permission);
      const nextPermissions = already ? role.permissions.filter((p) => p !== permission) : [...role.permissions, permission];
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
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, occupancy: value, status: value === 'occupied' ? 'occupied' : r.status === 'maintenance' ? r.status : 'vacant' }
            : r,
        ),
      );
      setRoomStatusLogs((logs) => [
        { id: generateId('rlog'), roomNumber: room.number, actorName: currentUser.name, actorRole: currentUser.roleId, field: 'occupancy', fromLabel, toLabel: OCCUPANCY_LABELS[value], timestamp: new Date().toISOString() },
        ...logs,
      ]);
      logActivity(`Oda ${room.number} "${OCCUPANCY_LABELS[value]}" olarak işaretlendi`);
    },
    [rooms, currentUser, logActivity],
  );

  const setRoomCleaning = useCallback(
    (roomId: string, value: CleaningStatus) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;
      const fromLabel = room.cleaningStatus ? CLEANING_STATUS_LABELS[room.cleaningStatus] : '—';
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId ? { ...r, cleaningStatus: value, lastCleanedAt: value === 'clean' ? new Date().toISOString() : r.lastCleanedAt } : r,
        ),
      );
      setRoomStatusLogs((logs) => [
        { id: generateId('rlog'), roomNumber: room.number, actorName: currentUser.name, actorRole: currentUser.roleId, field: 'cleaning', fromLabel, toLabel: CLEANING_STATUS_LABELS[value], timestamp: new Date().toISOString() },
        ...logs,
      ]);
      logActivity(`Oda ${room.number} temizlik durumu "${CLEANING_STATUS_LABELS[value]}" yapıldı`);
    },
    [rooms, currentUser, logActivity],
  );

  const setRoomTechnical = useCallback(
    (roomId: string, value: TechnicalStatus) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;
      const fromLabel = room.technicalStatus ? TECHNICAL_STATUS_LABELS[room.technicalStatus] : '—';
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, technicalStatus: value, status: value === 'maintenance' ? 'maintenance' : r.status === 'maintenance' ? 'vacant' : r.status }
            : r,
        ),
      );
      setRoomStatusLogs((logs) => [
        { id: generateId('rlog'), roomNumber: room.number, actorName: currentUser.name, actorRole: currentUser.roleId, field: 'technical', fromLabel, toLabel: TECHNICAL_STATUS_LABELS[value], timestamp: new Date().toISOString() },
        ...logs,
      ]);
      logActivity(`Oda ${room.number} teknik durumu "${TECHNICAL_STATUS_LABELS[value]}" yapıldı`);
    },
    [rooms, currentUser, logActivity],
  );

  // ---- QR codes ----------------------------------------------------------
  const regenerateRoomQr = useCallback(
    (roomNumber: string) => {
      setQrTokens((prev) => ({ ...prev, [roomNumber]: generateId('qr') }));
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
      logActivity(`Oda ${input.roomNumber} için ${input.guestName} adına rezervasyon oluşturuldu (${input.checkIn} → ${input.checkOut})`);
    },
    [currentUser, logActivity],
  );

  const cancelReservation = useCallback(
    (id: string) => {
      const reservation = reservations.find((r) => r.id === id);
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, cancelled: true } : r)));
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
      logActivity(`${newStaff.name} personel olarak eklendi (${ROLE_LABELS[newStaff.roleId]})`);
    },
    [staffMembers.length, logActivity],
  );

  const updateStaffRole = useCallback(
    (staffId: string, roleId: RoleId) => {
      setStaffMembers((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, roleId, lastActionAt: new Date().toISOString() } : s)),
      );
      const target = staffMembers.find((s) => s.id === staffId);
      if (target) logActivity(`${target.name} için rol "${ROLE_LABELS[roleId]}" olarak değiştirildi`);
    },
    [staffMembers, logActivity],
  );

  const toggleStaffActive = useCallback(
    (staffId: string) => {
      setStaffMembers((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, active: !s.active, lastActionAt: new Date().toISOString() } : s)),
      );
      const target = staffMembers.find((s) => s.id === staffId);
      if (target) logActivity(`${target.name} ${target.active ? 'pasif' : 'aktif'} yapıldı`);
    },
    [staffMembers, logActivity],
  );

  // ---- menu price changes --------------------------------------------
  const applyPriceChange = useCallback(
    (itemId: string, itemName: string, oldPrice: number, newPrice: number) => {
      setPriceChangeLogs((prev) => [
        { id: generateId('plog'), itemId, itemName, actorName: currentUser.name, actorRole: currentUser.roleId, oldPrice, newPrice, timestamp: new Date().toISOString() },
        ...prev,
      ]);
      logActivity(`"${itemName}" fiyatı ${oldPrice}₺'den ${newPrice}₺'ye değiştirildi`);
    },
    [currentUser, logActivity],
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
      logActivity(`Kahvaltıya "${item.name}" eklendi`);
    },
    [currentUser, logActivity],
  );

  const toggleBreakfastAvailability = useCallback(
    (id: string) => {
      setBreakfastItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, available: !i.available, updatedAt: new Date().toISOString() } : i)),
      );
      const item = breakfastItems.find((i) => i.id === id);
      if (item) logActivity(`"${item.name}" ${item.available ? 'pasif' : 'aktif'} yapıldı`);
    },
    [breakfastItems, logActivity],
  );

  const setBreakfastStock = useCallback(
    (id: string, stock: StockStatus) => {
      setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, stock, updatedAt: new Date().toISOString() } : i)));
      const item = breakfastItems.find((i) => i.id === id);
      if (item) logActivity(`"${item.name}" ${stock === 'in_stock' ? 'stokta var' : 'stokta yok'} işaretlendi`);
    },
    [breakfastItems, logActivity],
  );

  const setBreakfastPrepStatus = useCallback(
    (id: string, status: PrepStatus) => {
      setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, prepStatus: status, updatedAt: new Date().toISOString() } : i)));
    },
    [],
  );

  const changeBreakfastPrice = useCallback(
    (id: string, newPrice: number): 'applied' | 'pending_approval' => {
      const item = breakfastItems.find((i) => i.id === id);
      if (!item) return 'applied';
      const oldPrice = item.price ?? 0;
      if (has('edit_prices')) {
        setBreakfastItems((prev) => prev.map((i) => (i.id === id ? { ...i, price: newPrice, updatedAt: new Date().toISOString() } : i)));
        applyPriceChange(id, item.name, oldPrice, newPrice);
        return 'applied';
      }
      setApprovalRequests((prev) => [
        {
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
        },
        ...prev,
      ]);
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
      setApprovalRequests((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved', resolvedAt: new Date().toISOString(), resolvedByName: currentUser.name } : a)));
      if (req.type === 'price_change') {
        const newPrice = Number(req.newValue);
        setBreakfastItems((prev) => prev.map((i) => (i.id === req.itemId ? { ...i, price: newPrice, updatedAt: new Date().toISOString() } : i)));
        setPriceChangeLogs((prev) => [
          { id: generateId('plog'), itemId: req.itemId, itemName: req.itemName, actorName: currentUser.name, actorRole: currentUser.roleId, oldPrice: Number(req.oldValue), newPrice, timestamp: new Date().toISOString() },
          ...prev,
        ]);
      }
      logActivity(`${currentUser.name}, "${req.itemName}" için fiyat değişikliğini onayladı`);
    },
    [approvalRequests, currentUser, logActivity],
  );

  const rejectRequest = useCallback(
    (id: string) => {
      const req = approvalRequests.find((a) => a.id === id);
      setApprovalRequests((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected', resolvedAt: new Date().toISOString(), resolvedByName: currentUser.name } : a)));
      if (req) logActivity(`${currentUser.name}, "${req.itemName}" için talebi reddetti`);
    },
    [approvalRequests, currentUser, logActivity],
  );

  const value = useMemo<OperationsContextValue>(
    () => ({
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
