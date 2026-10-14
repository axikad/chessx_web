import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4 text-slate-500">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
