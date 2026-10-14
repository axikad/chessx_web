import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  dot = false,
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    primary: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
      dot: 'bg-indigo-500',
    },
    secondary: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
      dot: 'bg-rose-500',
    },
    info: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
      dot: 'bg-sky-500',
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap leading-none ${sizeStyles[size]} ${style.bg} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      {children}
    </span>
  );
};
