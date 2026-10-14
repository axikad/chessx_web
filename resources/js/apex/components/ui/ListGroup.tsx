import type { ReactNode } from 'react';

export type ListGroupItem = { id: string; title: ReactNode; description?: ReactNode; leading?: ReactNode; trailing?: ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean };
export type ListGroupProps = { items: ListGroupItem[]; className?: string };

export function ListGroup({ items, className = '' }: ListGroupProps) {
  return <ul className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
    {items.map((item, index) => <li key={item.id} className={index ? 'border-t border-slate-200 dark:border-slate-800' : ''}>
      <button type="button" disabled={item.disabled} onClick={item.onClick} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${item.active ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/35 dark:text-indigo-100' : 'bg-white text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60'}`}>
        {item.leading && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.leading}</span>}
        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span>{item.description && <span className="mt-0.5 block truncate text-sm font-normal text-slate-500 dark:text-slate-400">{item.description}</span>}</span>
        {item.trailing && <span className="shrink-0">{item.trailing}</span>}
      </button>
    </li>)}
  </ul>;
}
