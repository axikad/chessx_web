import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className={`w-full rounded-lg text-sm bg-white dark:bg-slate-900 border transition-colors duration-150 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
            : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
        } ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
