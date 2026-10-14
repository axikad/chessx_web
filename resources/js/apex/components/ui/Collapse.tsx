import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export type CollapseProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
};

export function Collapse({ title, children, defaultOpen = false, className = '', headerClassName = '' }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  return <div className={`rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}>
    <button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} aria-controls={contentId} className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/60 ${headerClassName}`}>
      {title}<ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && <div id={contentId} className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">{children}</div>}
  </div>;
}
