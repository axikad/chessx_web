import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode; disabled?: boolean };
export type AccordionProps = { items: AccordionItem[]; defaultOpen?: string[]; multiple?: boolean; className?: string };

export function Accordion({ items, defaultOpen = [], multiple = false, className = '' }: AccordionProps) {
  const [openItems, setOpenItems] = useState(defaultOpen);
  const instanceId = useId();
  const toggle = (id: string) => setOpenItems((current) => current.includes(id) ? current.filter((value) => value !== id) : multiple ? [...current, id] : [id]);

  return <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
    {items.map((item, index) => {
      const isOpen = openItems.includes(item.id);
      const panelId = `${instanceId}-${item.id}`;
      return <div key={item.id} className={index ? 'border-t border-slate-200 dark:border-slate-800' : ''}>
        <button type="button" disabled={item.disabled} onClick={() => toggle(item.id)} aria-expanded={isOpen} aria-controls={panelId} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:hover:bg-slate-800/60">
          {item.title}<ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div id={panelId} role="region" className="px-4 pb-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.content}</div>}
      </div>;
    })}
  </div>;
}
