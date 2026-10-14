import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
    icon: 'h-9 w-9 p-0 items-center justify-center',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none focus:ring-indigo-500 border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 focus:ring-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs',
    outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400 bg-white dark:bg-slate-900 shadow-2xs',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-none focus:ring-emerald-500 border border-transparent',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-none focus:ring-amber-400 border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 dark:shadow-none focus:ring-rose-500 border border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400 border border-transparent',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
