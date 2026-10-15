import type { User as AuthenticatedUser } from '@/types';
import { router } from '@inertiajs/react';
import { Bell, CreditCard, LogOut, Menu, Moon, Plus, Search, Settings as SettingsIcon, Shield, ShoppingBag, Sun, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { mockNotifications } from '../../data/dashboard';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Dropdown } from '../ui/Dropdown';
import { Modal } from '../ui/Modal';

export const Navbar: React.FC<{ currentUser: AuthenticatedUser }> = ({ currentUser }) => {
    const { toggleSidebar, setMobileSidebarOpen, isDark, setMode } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(mockNotifications);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const quickLinks = [
        { title: 'Overview Dashboard', href: '/', category: 'Navigation' },
        { title: 'Analytics Dashboard', href: '/dashboard/analytics', category: 'Navigation' },
        { title: 'Product Catalog', href: '/ecommerce/products', category: 'E-Commerce' },
        { title: 'Create Product', href: '/ecommerce/products/create', category: 'E-Commerce' },
        { title: 'Orders Management', href: '/ecommerce/orders', category: 'E-Commerce' },
        { title: 'Customers Directory', href: '/ecommerce/customers', category: 'E-Commerce' },
        { title: 'Invoices', href: '/invoices', category: 'Finance' },
        { title: 'Users & Team', href: '/users', category: 'Management' },
        { title: 'Roles & Permissions', href: '/roles', category: 'Management' },
        { title: 'Settings', href: '/settings', category: 'System' },
        { title: 'UI Component Library', href: '/components', category: 'System' },
    ];

    const filteredQuickLinks = searchQuery.trim()
        ? quickLinks.filter(
              (item) =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : quickLinks;

    return (
        <>
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 transition-colors sm:px-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex w-full max-w-lg items-center gap-6">
                    {/* Left section: Sidebar toggle & Global Search trigger */}
                    <div className="flex items-center gap-3">
                        {/* Desktop toggle */}
                        <button
                            onClick={toggleSidebar}
                            className="hidden cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-slate-600 lg:flex dark:hover:text-slate-200"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Mobile drawer toggle */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="flex items-center justify-center text-slate-400 transition-colors hover:text-slate-600 lg:hidden dark:hover:text-slate-200"
                            aria-label="Open mobile menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Search Trigger bar - Geometric Balance pill */}
                    <div className="group relative flex-1">
                        <button
                            onClick={() => setSearchModalOpen(true)}
                            className="flex w-full items-center rounded-full border-none bg-slate-50 py-2 pr-4 pl-10 text-left text-sm text-slate-500 transition-all outline-none hover:text-slate-700 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <span className="truncate text-xs sm:text-sm">Search dashboard (⌘ + K)</span>
                            <kbd className="ml-auto hidden items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs sm:inline-flex dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                ⌘K
                            </kbd>
                        </button>
                    </div>
                </div>

                {/* Right section: Quick Actions, Notifications, Theme, User Avatar */}
                <div className="flex items-center gap-4 sm:gap-5">
                    {/* Quick Actions Dropdown */}
                    <Dropdown
                        align="right"
                        trigger={
                            <button className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200/60 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 md:flex dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60">
                                <Plus className="h-3.5 w-3.5" />
                                <span>Quick Action</span>
                            </button>
                        }
                        items={[
                            {
                                label: 'Add New Product',
                                icon: <ShoppingBag className="h-4 w-4" />,
                                onClick: () => navigate('/ecommerce/products/create'),
                            },
                            {
                                label: 'Create Invoice',
                                icon: <CreditCard className="h-4 w-4" />,
                                onClick: () => navigate('/invoices'),
                            },
                            {
                                label: 'Manage Users',
                                icon: <User className="h-4 w-4" />,
                                onClick: () => navigate('/users'),
                            },
                        ]}
                    />

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setMode(isDark ? 'light' : 'dark')}
                        className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                    >
                        {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
                    </button>

                    {/* Notifications Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900" />
                            )}
                        </button>

                        {notificationsOpen && (
                            <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xl sm:w-96 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 p-3.5 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                                !n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                                                <span className="text-[10px] whitespace-nowrap text-slate-400">{n.timestamp}</span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
                                    <Link
                                        to="/settings"
                                        onClick={() => setNotificationsOpen(false)}
                                        className="text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                                    >
                                        Notification Preferences
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Geometric Balance Vertical Line Separator */}
                    <div className="hidden h-8 w-[1px] bg-slate-200 sm:block dark:bg-slate-800"></div>

                    {/* User Profile Dropdown */}
                    <Dropdown
                        align="right"
                        trigger={
                            <div className="group flex cursor-pointer items-center gap-3 select-none">
                                <div className="hidden text-right sm:block">
                                    <p className="mb-1 text-sm leading-none font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-200">
                                        {currentUser.name}
                                    </p>
                                    <p className="text-[10px] leading-none font-medium text-slate-400">{currentUser.role ?? currentUser.email}</p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-indigo-100 font-bold text-indigo-700 shadow-xs dark:border-slate-800">
                                    <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                                </div>
                            </div>
                        }
                        items={[
                            {
                                label: 'My Profile',
                                icon: <User className="h-4 w-4" />,
                                onClick: () => navigate('/settings'),
                            },
                            {
                                label: 'Account Settings',
                                icon: <SettingsIcon className="h-4 w-4" />,
                                onClick: () => navigate('/settings'),
                            },
                            {
                                label: 'Roles & Security',
                                icon: <Shield className="h-4 w-4" />,
                                onClick: () => navigate('/roles'),
                            },
                            { divider: true, label: '' },
                            {
                                label: 'Sign Out',
                                icon: <LogOut className="h-4 w-4" />,
                                danger: true,
                                onClick: () => setLogoutConfirmOpen(true),
                            },
                        ]}
                    />
                </div>
            </header>

            {/* Global Command Palette Modal */}
            <Modal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} size="md">
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search dashboards, products, orders, settings..."
                            className="w-full rounded-xl border-none bg-slate-100 py-2.5 pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    <div className="max-h-60 space-y-1 overflow-y-auto">
                        {filteredQuickLinks.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSearchModalOpen(false);
                                    navigate(item.href);
                                }}
                                className="flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <span>{item.title}</span>
                                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {item.category}
                                </span>
                            </button>
                        ))}
                        {filteredQuickLinks.length === 0 && (
                            <div className="py-6 text-center text-xs text-slate-400">No matching pages or modules found.</div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Logout Confirmation Dialog */}
            <ConfirmDialog
                isOpen={logoutConfirmOpen}
                onClose={() => setLogoutConfirmOpen(false)}
                onConfirm={() => {
                    setLogoutConfirmOpen(false);
                    router.post(route('logout'));
                }}
                title="Sign Out"
                message="Are you sure you want to end your current session? You can sign right back in anytime."
                confirmText="Sign Out"
                variant="danger"
            />
        </>
    );
};
