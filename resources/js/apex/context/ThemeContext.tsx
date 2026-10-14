import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  rtlMode: boolean;
  setRtlMode: (rtl: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('app_theme');
    return savedMode === 'light' || savedMode === 'dark' || savedMode === 'system'
      ? savedMode
      : 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('app_sidebar_collapsed') === 'true';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [compactMode, setCompactMode] = useState<boolean>(() => {
    return localStorage.getItem('app_content_compact') === 'true';
  });
  const [rtlMode, setRtlMode] = useState<boolean>(false);

  const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);
    setSystemIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_theme', mode);
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [mode, isDark]);

  useEffect(() => {
    localStorage.setItem('app_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('app_content_compact', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    document.documentElement.dir = rtlMode ? 'rtl' : 'ltr';
  }, [rtlMode]);

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        isDark,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        compactMode,
        setCompactMode,
        rtlMode,
        setRtlMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
