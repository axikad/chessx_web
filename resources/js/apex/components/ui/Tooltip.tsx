import { useState, type ReactNode } from 'react';
export type TooltipProps = { content: ReactNode; children: ReactNode; position?: 'top' | 'bottom'; className?: string };
export function Tooltip({ content, children, position = 'top', className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return <span className={`relative inline-flex ${className}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>{children}{open && <span role="tooltip" className={`absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>{content}</span>}</span>;
}
