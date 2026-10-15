import type { LucideIcon } from 'lucide-react';
import { ChevronRight, KeyRound, LayoutDashboard, Palette, ShieldCheck, UsersRound } from 'lucide-react';

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
                children: [{ id: 'dashboard-overview', title: 'Overview', href: '/' }],
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
                permission: 'users.read',
                href: '/users',
            },
            {
                id: 'roles',
                title: 'Roles',
                icon: ShieldCheck,
                permission: 'roles.read',
                href: '/roles',
            },
            {
                id: 'permissions',
                title: 'Permissions',
                icon: KeyRound,
                permission: 'permissions.read',
                href: '/permissions',
            },
            {
                id: 'branding',
                title: 'Site Branding',
                icon: Palette,
                permission: 'branding.read',
                href: '/branding',
            },
        ],
    },
];

export const navigationDefaults = {
    fallbackIcon: ChevronRight,
};
