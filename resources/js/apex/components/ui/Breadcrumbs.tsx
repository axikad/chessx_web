import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BreadcrumbItem } from '../../types';

export const Breadcrumbs: React.FC<{ items?: BreadcrumbItem[] }> = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 space-x-1.5 mb-2">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {item.href && !isLast ? (
              <Link to={item.href} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-slate-800 dark:text-slate-200 font-semibold' : ''}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
