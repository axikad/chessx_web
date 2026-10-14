import type { ReactNode } from 'react';

export type ContentNavItem = { id: string; label: string; onClick?: () => void; active?: boolean };
export type ContentNavbarProps = { items: ContentNavItem[]; brand?: ReactNode; actions?: ReactNode; variant?: 'standard' | 'compact' | 'contextual'; className?: string };

export function ContentNavbar({ items, brand, actions, variant = 'standard', className = '' }: ContentNavbarProps) {
  const spacing = variant === 'compact' ? 'px-3 py-2' : 'px-4 py-3';
  const base = variant === 'contextual' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800';
  return <nav aria-label="Content navigation" className={`flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border ${base} ${spacing} ${className}`}>
    {brand && <span className="mr-auto text-sm font-bold">{brand}</span>}
    <div className="flex flex-wrap items-center gap-1">{items.map((item) => <button type="button" key={item.id} onClick={item.onClick} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${variant === 'contextual' ? item.active ? 'bg-white/20 text-white' : 'text-indigo-100 hover:bg-white/10' : item.active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{item.label}</button>)}</div>
    {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
  </nav>;
}
