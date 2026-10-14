export type ProgressProps = { value: number; max?: number; label?: string; showValue?: boolean; color?: 'primary' | 'success' | 'warning' | 'danger'; size?: 'sm' | 'md' | 'lg'; className?: string };
const colors = { primary: 'bg-indigo-600', success: 'bg-emerald-600', warning: 'bg-amber-500', danger: 'bg-rose-600' };
const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
export function Progress({ value, max = 100, label, showValue = true, color = 'primary', size = 'md', className = '' }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className={className}>{(label || showValue) && <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>{showValue && <span className="text-slate-500 dark:text-slate-400">{Math.round(percentage)}%</span>}</div>}<div className={`overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${heights[size]}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}><div className={`h-full rounded-full transition-all duration-300 ${colors[color]}`} style={{ width: `${percentage}%` }} /></div></div>;
}
