import type { User as AuthenticatedUser } from '@/types';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSiteBranding } from '../../context/SiteBrandingContext';
import { Footer } from '../ui/Footer';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TemplateCustomizer } from './TemplateCustomizer';

export const AppShell: React.FC<{ currentUser: AuthenticatedUser }> = ({ currentUser }) => {
    const { sidebarCollapsed, compactMode } = useTheme();
    const { site } = useSiteBranding();

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
            {/* Fixed/Collapsible Sidebar */}
            <Sidebar />
            <TemplateCustomizer />

            {/* Main Column */}
            <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                {/* Sticky Top Navbar */}
                <Navbar currentUser={currentUser} />

                {/* Dynamic Page Content */}
                <main className={`w-full flex-1 p-4 sm:p-6 lg:p-8 ${compactMode ? 'mx-auto max-w-6xl' : 'max-w-none'}`}>
                    <Outlet />
                </main>

                <Footer brand={site.name} links={[{ label: 'v1.0.0', href: '#version' }]} />
            </div>
        </div>
    );
};
