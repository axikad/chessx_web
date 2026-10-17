import type { LucideIcon } from 'lucide-react';
import { ArrowUpCircle, BarChart3, CalendarRange, ChevronRight, ClipboardCheck, KeyRound, LayoutDashboard, ListOrdered, MapPinned, Palette, ShieldCheck, Trophy, UsersRound } from 'lucide-react';

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
            {
                id: 'competition-management',
                title: 'Competitions',
                icon: Trophy,
                children: [
                    { id: 'competition-tiers', title: 'Structure', icon: Trophy, permission: 'competitions.read', href: '/competition-management/competitions' },
                    { id: 'competition-seasons', title: 'Seasons', icon: CalendarRange, permission: 'seasons.read', href: '/competition-management/seasons' },
                    { id: 'competition-ratings', title: 'Player Ratings', icon: BarChart3, permission: 'ratings.read', href: '/competition-management/ratings' },
                    { id: 'competition-leaderboards', title: 'Leaderboards', icon: ListOrdered, permission: 'leaderboards.read', href: '/competition-management/leaderboards' },
                    { id: 'competition-promotions', title: 'Promotions', icon: ArrowUpCircle, permission: 'promotions.read', href: '/promotion-management/rules' },
                ],
            },
            {
                id: 'location-management',
                title: 'Locations',
                icon: MapPinned,
                children: [
                    { id: 'geography-management', title: 'Geography', icon: MapPinned, permission: 'geography.read', href: '/location-management/geography' },
                    { id: 'location-reviews', title: 'Change Requests', icon: ClipboardCheck, permission: 'player_locations.read', href: '/location-management/reviews' },
                ],
            },
        ],
    },
];

export const navigationDefaults = {
    fallbackIcon: ChevronRight,
};
