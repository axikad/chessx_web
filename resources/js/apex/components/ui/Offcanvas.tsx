import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type OffcanvasProps = { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; side?: 'left' | 'right'; width?: 'sm' | 'md' | 'lg'; footer?: ReactNode };
const widths = { sm: 'w-80', md: 'w-[28rem]', lg: 'w-[36rem]' };

export function Offcanvas({ open, onClose, title, children, side = 'right', width = 'md', footer }: OffcanvasProps) {
  useEffect(() => { const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; if (open) window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Side panel'}><button type="button" aria-label="Close panel" onClick={onClose} className="absolute inset-0 w-full bg-slate-950/45 backdrop-blur-sm" /><aside className={`absolute inset-y-0 flex ${widths[width]} max-w-[92vw] flex-col bg-white shadow-2xl dark:bg-slate-900 ${side === 'right' ? 'right-0' : 'left-0'}`}><header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Close panel"><X className="h-5 w-5" /></button></header><div className="flex-1 overflow-y-auto p-5">{children}</div>{footer && <footer className="border-t border-slate-200 p-4 dark:border-slate-800">{footer}</footer>}</aside></div>;
}
