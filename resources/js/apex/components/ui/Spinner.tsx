export type SpinnerProps = { size?: 'sm' | 'md' | 'lg' | 'xl'; color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'; label?: string; className?: string };
const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]', xl: 'h-12 w-12 border-4' };
const colors = { primary: 'border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400', success: 'border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400', warning: 'border-amber-200 border-t-amber-500 dark:border-amber-950 dark:border-t-amber-400', danger: 'border-rose-200 border-t-rose-600 dark:border-rose-950 dark:border-t-rose-400', neutral: 'border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-200' };
export function Spinner({ size = 'md', color = 'primary', label, className = '' }: SpinnerProps) {
  return <span className={`inline-flex items-center gap-2 ${className}`} role="status"><span className={`inline-block animate-spin rounded-full ${sizes[size]} ${colors[color]}`} /><span className={label ? 'text-sm text-slate-500 dark:text-slate-400' : 'sr-only'}>{label ?? 'Loading'}</span></span>;
}
