import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useTheme } from '../../context/ThemeContext';
import { Footer } from '../ui/Footer';
import { TemplateCustomizer } from './TemplateCustomizer';

export const AppShell: React.FC = () => {
  const { sidebarCollapsed, compactMode } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Fixed/Collapsible Sidebar */}
      <Sidebar />
      <TemplateCustomizer />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full ${
            compactMode ? 'max-w-6xl mx-auto' : 'max-w-none'
          }`}
        >
          <Outlet />
        </main>

        <Footer brand="Apex UI Template" links={[{ label: 'v1.2.0', href: '#version' }]} />
      </div>
    </div>
  );
};
