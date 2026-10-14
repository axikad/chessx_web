import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NavigationAccessProvider, type NavigationAccess } from './context/NavigationAccessContext';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';

const page = <T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((module) => ({ default: module[name] as ComponentType })));

const OverviewDashboard = page(() => import('./pages/dashboard/OverviewDashboard'), 'OverviewDashboard');
const UserListPage = page(() => import('./pages/users/UserListPage'), 'UserListPage');
const UserCreatePage = page(() => import('./pages/users/UserCreatePage'), 'UserCreatePage');
const RolesPermissionsPage = page(() => import('./pages/users/RolesPermissionsPage'), 'RolesPermissionsPage');

const RouteLoader = () => <div className="grid min-h-[50vh] place-items-center"><Spinner size="lg" label="Loading page" /></div>;

export default function App({ navigationAccess }: { navigationAccess?: NavigationAccess }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NavigationAccessProvider {...navigationAccess}>
          <BrowserRouter>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
            {/* Main Application Layout with Sidebar & Header */}
            <Route path="/" element={<AppShell />}>
              {/* Dashboards */}
              <Route index element={<OverviewDashboard />} />

              {/* User Management */}
              <Route path="users" element={<UserListPage />} />
              <Route path="users/create" element={<UserCreatePage />} />
              <Route path="roles" element={<RolesPermissionsPage />} />
            </Route>

            {/* Redirect removed template pages to the dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NavigationAccessProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
