import type { User as AuthenticatedUser } from '@/types';
import type { SiteBranding } from './types/site';
import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { NavigationAccessProvider, type NavigationAccess } from './context/NavigationAccessContext';
import { SiteBrandingProvider } from './context/SiteBrandingContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

const page = <T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) =>
    lazy(() => loader().then((module) => ({ default: module[name] as ComponentType })));

const OverviewDashboard = page(() => import('./pages/dashboard/OverviewDashboard'), 'OverviewDashboard');
const UserListPage = page(() => import('./pages/users/UserListPage'), 'UserListPage');
const RoleListPage = page(() => import('./pages/users/RoleListPage'), 'RoleListPage');
const RolePermissionPage = page(() => import('./pages/users/RolePermissionPage'), 'RolePermissionPage');
const PermissionListPage = page(() => import('./pages/users/PermissionListPage'), 'PermissionListPage');
const BrandingPage = page(() => import('./pages/settings/BrandingPage'), 'BrandingPage');
const SettingsPage = page(() => import('./pages/settings/SettingsPage'), 'SettingsPage');
const CompetitionManagementPage = page(() => import('./pages/competition/CompetitionManagementPage'), 'CompetitionManagementPage');

const RouteLoader = () => (
    <div className="grid min-h-[50vh] place-items-center">
        <Spinner size="lg" label="Loading page" />
    </div>
);

export default function App({ navigationAccess, currentUser, initialSite }: { navigationAccess?: NavigationAccess; currentUser: AuthenticatedUser; initialSite: SiteBranding }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                <NavigationAccessProvider {...navigationAccess}>
                  <SiteBrandingProvider initialSite={initialSite}>
                    <BrowserRouter>
                        <Suspense fallback={<RouteLoader />}>
                            <Routes>
                                {/* Main Application Layout with Sidebar & Header */}
                                <Route path="/" element={<AppShell currentUser={currentUser} />}>
                                    {/* Dashboards */}
                                    <Route index element={<OverviewDashboard />} />

                                    {/* User Management */}
                                    <Route path="users" element={<UserListPage />} />
                                    <Route path="roles" element={<RoleListPage />} />
                                    <Route path="role-permissions" element={<RolePermissionPage />} />
                                    <Route path="permissions" element={<PermissionListPage />} />
                                    <Route path="branding" element={<BrandingPage />} />
                                    <Route path="settings" element={<SettingsPage />} />
                                    <Route path="competition-management/*" element={<CompetitionManagementPage />} />
                                </Route>

                                {/* Redirect removed template pages to the dashboard */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                  </SiteBrandingProvider>
                </NavigationAccessProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
