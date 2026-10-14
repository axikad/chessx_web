import type { LucideIcon } from 'lucide-react';
import {
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

export type NavigationItem = {
  id: string;
  title: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  permission?: string;
  feature?: string;
  children?: NavigationItem[];
};

export type NavigationSection = {
  id: string;
  label: string;
  items: NavigationItem[];
};

export const navigation: NavigationSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboards',
        title: 'Dashboards',
        icon: LayoutDashboard,
        children: [
          { id: 'dashboard-overview', title: 'Overview', href: '/' },
        ],
      },
    ],
  },
  {
    id: 'apps-pages',
    label: 'Apps & Pages',
    items: [
      {
        id: 'users',
        title: 'Users',
        icon: UsersRound,
        permission: 'users.view',
        children: [
          { id: 'users-list', title: 'List', href: '/users' },
          { id: 'users-create', title: 'Add new user', href: '/users/create' },
        ],
      },
      {
        id: 'roles-permissions',
        title: 'Roles & Permissions',
        icon: ShieldCheck,
        permission: 'roles.view',
        children: [
          { id: 'roles', title: 'Roles', href: '/roles' },
          { id: 'permissions', title: 'Permission', href: '/roles' },
        ],
      },
    ],
  },
];

export const navigationDefaults = {
  fallbackIcon: ChevronRight,
};
