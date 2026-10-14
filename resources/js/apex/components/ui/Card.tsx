import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, description, action, className = '', children }) => {
  return (
    <div className={`p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 ${className}`}>
      {children || (
        <>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{title}</h3>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </>
      )}
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
};
