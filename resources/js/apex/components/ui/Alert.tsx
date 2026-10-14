import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

export type AlertVariant = 'success' | 'info' | 'warning' | 'danger';
export type AlertProps = { variant?: AlertVariant; title?: string; children: ReactNode; onClose?: () => void; className?: string };

const styles: Record<AlertVariant, { wrap: string; icon: string; Icon: typeof Info }> = {
  success: { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-100', icon: 'text-emerald-600', Icon: CheckCircle2 },
  info: { wrap: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/35 dark:text-blue-100', icon: 'text-blue-600', Icon: Info },
  warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-100', icon: 'text-amber-600', Icon: TriangleAlert },
  danger: { wrap: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/35 dark:text-rose-100', icon: 'text-rose-600', Icon: AlertCircle },
};

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const { wrap, icon, Icon } = styles[variant];
  return <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 ${wrap} ${className}`}><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} /><div className="min-w-0 flex-1 text-sm leading-6">{title && <h3 className="font-semibold">{title}</h3>}<div className={title ? 'mt-0.5 opacity-85' : ''}>{children}</div></div>{onClose && <button type="button" onClick={onClose} className="rounded p-1 opacity-60 hover:bg-black/5 hover:opacity-100" aria-label="Dismiss alert"><X className="h-4 w-4" /></button>}</div>;
}
