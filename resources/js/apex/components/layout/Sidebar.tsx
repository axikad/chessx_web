import { useState, type FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Sparkles, X } from 'lucide-react';
import { navigation, navigationDefaults, type NavigationItem } from '../../config/navigation';
import { useTheme } from '../../context/ThemeContext';
import { useNavigationAccess } from '../../context/NavigationAccessContext';

type MenuNodeProps = {
  item: NavigationItem;
  level: number;
  collapsed: boolean;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  onNavigate: () => void;
};

const hasActiveChild = (item: NavigationItem, pathname: string): boolean =>
  Boolean(item.href && (pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`)))) ||
  Boolean(item.children?.some((child) => hasActiveChild(child, pathname)));

const MenuNode: FC<MenuNodeProps> = ({ item, level, collapsed, expanded, toggle, onNavigate }) => {
  const location = useLocation();
  const { can, hasFeature } = useNavigationAccess();
  const isVisible = (candidate: NavigationItem) => can(candidate.permission) && hasFeature(candidate.feature);
  const children = item.children?.filter(isVisible) ?? [];
  const hasChildren = children.length > 0;
  const isActive = hasActiveChild(item, location.pathname);
  const isExpanded = expanded[item.id] ?? isActive;
  const Icon = item.icon ?? navigationDefaults.fallbackIcon;
  const indent = level === 0 ? '' : level === 1 ? 'pl-7' : 'pl-11';

  if (!hasChildren && item.href) {
    return (
      <li>
        <NavLink
          to={item.href}
          title={collapsed ? item.title : undefined}
          onClick={onNavigate}
          className={({ isActive: exact }) => `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${indent} ${exact || isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-950/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'}`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}`} />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </span>
          {!collapsed && item.badge && <span className="rounded-md bg-indigo-500/25 px-1.5 py-0.5 text-[10px] font-bold text-indigo-100">{item.badge}</span>}
        </NavLink>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={() => toggle(item.id)} title={collapsed ? item.title : undefined} className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'}`}>
        <span className={`flex min-w-0 items-center gap-3 ${indent}`}>
          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}`} />
          {!collapsed && <span className="truncate">{item.title}</span>}
        </span>
        {!collapsed && <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
      </button>
      {!collapsed && isExpanded && hasChildren && <ul className="mt-1 space-y-1">
        {children.map((child) => <MenuNode key={child.id} item={child} level={level + 1} collapsed={collapsed} expanded={expanded} toggle={toggle} onNavigate={onNavigate} />)}
      </ul>}
    </li>
  );
};

export function Sidebar() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useTheme();
  const location = useLocation();
  const { can, hasFeature } = useNavigationAccess();
  const isVisible = (item: NavigationItem) => can(item.permission) && hasFeature(item.feature);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => ({ dashboards: true, 'e-commerce': location.pathname.startsWith('/ecommerce'), users: location.pathname.startsWith('/users') }));
  const toggleMenu = (id: string) => setExpandedMenus((current) => ({ ...current, [id]: !current[id] }));
  const closeMobileMenu = () => setMobileSidebarOpen(false);

  const content = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <NavLink to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-950/30"><span className="h-3.5 w-3.5 rotate-45 rounded-sm bg-white" /></span>
          {!sidebarCollapsed && <span className="flex flex-col"><span className="text-lg font-bold leading-none tracking-tight text-slate-950 dark:text-white">Apex UI</span><span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">React + Laravel</span></span>}
        </NavLink>
        <button type="button" onClick={closeMobileMenu} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((section) => {
          const items = section.items.filter(isVisible);
          if (!items.length) return null;
          return <section key={section.id} className="mb-5">
            {!sidebarCollapsed && <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{section.label}</h2>}
            <ul className="space-y-1">{items.map((item) => <MenuNode key={item.id} item={item} level={0} collapsed={sidebarCollapsed} expanded={expandedMenus} toggle={toggleMenu} onNavigate={closeMobileMenu} />)}</ul>
          </section>;
        })}
      </nav>
      {!sidebarCollapsed && <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/70"><div className="mb-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100"><Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> Template ready</div><p className="mb-3 leading-relaxed text-slate-500 dark:text-slate-400">Navigation, permissions, and modules can be configured for each project.</p><NavLink to="/settings" className="block rounded-lg bg-indigo-600 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">Open settings</NavLink></div>}
    </div>
  );

  return <>
    <aside className={`fixed inset-y-0 left-0 z-30 hidden transition-all duration-300 lg:block ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>{content}</aside>
    {mobileSidebarOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close menu" onClick={closeMobileMenu} className="fixed inset-0 w-full cursor-default bg-slate-950/60 backdrop-blur-sm" /><aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] animate-in slide-in-from-left duration-200">{content}</aside></div>}
  </>;
}
