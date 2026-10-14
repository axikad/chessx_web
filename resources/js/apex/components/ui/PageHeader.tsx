import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { BreadcrumbItem } from '../../types';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center flex-wrap gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
