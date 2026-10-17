import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: string[];
}

export interface SiteBranding {
    name: string;
    slogan: string | null;
    logo_url: string | null;
    favicon_url: string | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    site: SiteBranding;
    flash?: {
        success?: string | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    username: string;
    username_can_be_changed: boolean;
    username_change_available_at: string | null;
    profile: {
        display_name: string | null;
        language: string;
        timezone: string | null;
        date_of_birth: string | null;
        profile_visibility: 'public' | 'private';
    };
    email: string;
    avatar?: string;
    role?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
