import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from '@/context/AppDataContext';
import { ToastProvider } from '@/context/ToastContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { OperationsProvider } from '@/context/OperationsContext';
import { ViewModeProvider } from '@/context/ViewModeContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { FullPageLoader } from '@/components/common/Spinner';
import { RequireAuth } from '@/auth/RequireAuth';
import { PermissionGate } from '@/components/admin/PermissionGate';

import { RoleSelectPage } from '@/pages/RoleSelectPage';

// Every route below is loaded on demand. This keeps the initial bundle to
// just the role-select screen; the guest, admin and staff experiences (and
// admin-only dependencies like Recharts, pulled in exclusively by
// Dashboard.tsx) are fetched only when the visitor actually navigates there.
const GuestLayout = lazy(() => import('@/layouts/GuestLayout').then((m) => ({ default: m.GuestLayout })));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const StaffLayout = lazy(() => import('@/layouts/StaffLayout').then((m) => ({ default: m.StaffLayout })));

const GuestHome = lazy(() => import('@/pages/guest/GuestHome').then((m) => ({ default: m.GuestHome })));
const ServicesList = lazy(() => import('@/pages/guest/ServicesList').then((m) => ({ default: m.ServicesList })));
const CategoryDetail = lazy(() => import('@/pages/guest/CategoryDetail').then((m) => ({ default: m.CategoryDetail })));
const ActiveRequests = lazy(() => import('@/pages/guest/ActiveRequests').then((m) => ({ default: m.ActiveRequests })));
const HotelInfoPage = lazy(() => import('@/pages/guest/HotelInfoPage').then((m) => ({ default: m.HotelInfoPage })));
const EmergencyPage = lazy(() => import('@/pages/guest/EmergencyPage').then((m) => ({ default: m.EmergencyPage })));

const Dashboard = lazy(() => import('@/pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })));
const RequestsPage = lazy(() => import('@/pages/admin/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const RoomsPage = lazy(() => import('@/pages/admin/RoomsPage').then((m) => ({ default: m.RoomsPage })));
const ReservationsPage = lazy(() => import('@/pages/admin/ReservationsPage').then((m) => ({ default: m.ReservationsPage })));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const StaffPage = lazy(() => import('@/pages/admin/StaffPage').then((m) => ({ default: m.StaffPage })));
const ServicesManagementPage = lazy(() => import('@/pages/admin/ServicesManagementPage').then((m) => ({ default: m.ServicesManagementPage })));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const BreakfastManagementPage = lazy(() => import('@/pages/admin/BreakfastManagementPage').then((m) => ({ default: m.BreakfastManagementPage })));
const RolesPage = lazy(() => import('@/pages/admin/RolesPage').then((m) => ({ default: m.RolesPage })));

const StaffSelectPage = lazy(() => import('@/pages/staff/StaffSelectPage').then((m) => ({ default: m.StaffSelectPage })));
const StaffDashboard = lazy(() => import('@/pages/staff/StaffDashboard').then((m) => ({ default: m.StaffDashboard })));

const AdminSelectPage = lazy(() => import('@/pages/AdminSelectPage').then((m) => ({ default: m.AdminSelectPage })));

export default function App() {
  return (
    <ThemeProvider>
    <NotificationsProvider>
      <AppDataProvider>
      <OperationsProvider>
      <ViewModeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<FullPageLoader label="HotelFlow yükleniyor…" />}>
            <Routes>
              <Route path="/" element={<RoleSelectPage />} />

              <Route path="/guest/room/:roomNumber" element={<GuestLayout />}>
                <Route index element={<GuestHome />} />
                <Route path="services" element={<ServicesList />} />
                <Route path="category/:slug" element={<CategoryDetail />} />
                <Route path="requests" element={<ActiveRequests />} />
                <Route path="info" element={<HotelInfoPage />} />
                <Route path="emergency" element={<EmergencyPage />} />
              </Route>

              {/*
                AdminSelectPage/StaffSelectPage (below) are the login
                screens — mock, password-gated (see src/auth/credentials.ts)
                but reachable by anyone, since logging in is exactly how
                `RequireAuth` gets satisfied. Only the panels behind them
                require an authenticated session; swapping this for real
                auth later only touches `src/auth/*`. Within the admin
                area, each page is further wrapped in `PermissionGate` so a
                lower-permission admin account still sees a friendly "no
                access" state instead of a broken/empty screen for pages it
                shouldn't see.
              */}
              <Route path="/admin-select" element={<AdminSelectPage />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth role="admin">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<PermissionGate permission="view_dashboard"><Dashboard /></PermissionGate>} />
                <Route path="requests" element={<PermissionGate permission="manage_requests"><RequestsPage /></PermissionGate>} />
                <Route path="rooms" element={<PermissionGate permission="update_room_status"><RoomsPage /></PermissionGate>} />
                <Route path="reservations" element={<PermissionGate permission="manage_reservations"><ReservationsPage /></PermissionGate>} />
                <Route path="reports" element={<PermissionGate permission="view_reports"><ReportsPage /></PermissionGate>} />
                <Route path="staff" element={<PermissionGate permission="manage_staff"><StaffPage /></PermissionGate>} />
                <Route path="services" element={<PermissionGate permission="manage_menu"><ServicesManagementPage /></PermissionGate>} />
                <Route path="breakfast" element={<PermissionGate permission="manage_breakfast_menu"><BreakfastManagementPage /></PermissionGate>} />
                <Route path="roles" element={<PermissionGate permission="manage_roles"><RolesPage /></PermissionGate>} />
                <Route path="settings" element={<PermissionGate permission="manage_hotel_settings"><SettingsPage /></PermissionGate>} />
              </Route>

              <Route path="/staff" element={<StaffSelectPage />} />
              <Route
                path="/staff/:staffId"
                element={
                  <RequireAuth role="staff">
                    <StaffLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<StaffDashboard />} />
                <Route path="breakfast" element={<PermissionGate permission="manage_breakfast_menu"><BreakfastManagementPage /></PermissionGate>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
      </ViewModeProvider>
      </OperationsProvider>
      </AppDataProvider>
    </NotificationsProvider>
    </ThemeProvider>
  );
}
