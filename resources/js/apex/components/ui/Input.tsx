import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none shrink-0 flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full rounded-lg text-sm bg-white dark:bg-slate-900 border transition-colors duration-150 py-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : 'pl-3.5'
          } ${rightIcon ? 'pr-9' : 'pr-3.5'} ${
            error
              ? 'border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
              : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-slate-400 shrink-0 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
