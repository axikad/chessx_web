import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export type PaginationProps = { page: number; totalPages: number; onChange: (page: number) => void; siblingCount?: number; className?: string };

const pagesFor = (page: number, total: number, siblings: number) => {
  if (total <= 7 + siblings * 2) return Array.from({ length: total }, (_, index) => index + 1);
  const visible = new Set([1, total]);
  for (let value = Math.max(2, page - siblings); value <= Math.min(total - 1, page + siblings); value += 1) visible.add(value);
  const ordered = [...visible].sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  ordered.forEach((value, index) => { if (index && value - ordered[index - 1] > 1) result.push('ellipsis'); result.push(value); });
  return result;
};

export function Pagination({ page, totalPages, onChange, siblingCount = 1, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = pagesFor(page, totalPages, siblingCount);
  const buttonClass = 'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition-colors';
  return <nav aria-label="Pagination" className={`flex items-center gap-1 ${className}`}>
    <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)} className={`${buttonClass} text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800`}><ChevronLeft className="h-4 w-4" /></button>
    {items.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className={`${buttonClass} text-slate-400`}><MoreHorizontal className="h-4 w-4" /></span> : <button type="button" key={item} aria-current={item === page ? 'page' : undefined} onClick={() => onChange(item)} className={`${buttonClass} ${item === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{item}</button>)}
    <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => onChange(page + 1)} className={`${buttonClass} text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800`}><ChevronRight className="h-4 w-4" /></button>
  </nav>;
}
