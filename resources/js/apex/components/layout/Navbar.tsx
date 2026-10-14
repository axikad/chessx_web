import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  LogOut,
  User,
  Settings as SettingsIcon,
  Shield,
  Check,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { mockNotifications } from '../../data/dashboard';
import { Dropdown } from '../ui/Dropdown';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const Navbar: React.FC = () => {
  const { toggleSidebar, setMobileSidebarOpen, isDark, setMode } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
    ? quickLinks.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickLinks;

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8 transition-colors">
        <div className="flex items-center gap-6 w-full max-w-lg">
          {/* Left section: Sidebar toggle & Global Search trigger */}
          <div className="flex items-center gap-3">
            {/* Desktop toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile drawer toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Search Trigger bar - Geometric Balance pill */}
          <div className="relative flex-1 group">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center bg-slate-50 dark:bg-slate-800/80 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 outline-none text-left"
            >
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <span className="truncate text-xs sm:text-sm">Search dashboard (⌘ + K)</span>
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-auto shadow-2xs">
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
              <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/50 transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Action</span>
              </button>
            }
            items={[
              {
                label: 'Add New Product',
                icon: <ShoppingBag className="w-4 h-4" />,
                onClick: () => navigate('/ecommerce/products/create'),
              },
              {
                label: 'Create Invoice',
                icon: <CreditCard className="w-4 h-4" />,
                onClick: () => navigate('/invoices'),
              },
              {
                label: 'Invite Team User',
                icon: <User className="w-4 h-4" />,
                onClick: () => navigate('/users/create'),
              },
            ]}
          />

          {/* Theme Toggle */}
          <button
            onClick={() => setMode(isDark ? 'light' : 'dark')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-0 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/settings"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Notification Preferences
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Geometric Balance Vertical Line Separator */}
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                    Sarah Jenkins
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none">Senior Manager</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-800 shadow-xs flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Sarah Jenkins"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            }
              items={[
                {
                  label: 'My Profile',
                  icon: <User className="w-4 h-4" />,
                  onClick: () => navigate('/settings'),
                },
                {
                  label: 'Account Settings',
                  icon: <SettingsIcon className="w-4 h-4" />,
                  onClick: () => navigate('/settings'),
                },
                {
                  label: 'Roles & Security',
                  icon: <Shield className="w-4 h-4" />,
                  onClick: () => navigate('/roles'),
                },
                { divider: true, label: '' },
                {
                  label: 'Sign Out',
                  icon: <LogOut className="w-4 h-4" />,
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dashboards, products, orders, settings..."
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredQuickLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchModalOpen(false);
                  navigate(item.href);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-slate-200"
              >
                <span>{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {item.category}
                </span>
              </button>
            ))}
            {filteredQuickLinks.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                No matching pages or modules found.
              </div>
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
