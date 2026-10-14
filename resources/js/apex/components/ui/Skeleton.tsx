import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}> = ({ className = '', variant = 'rectangular' }) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 ${variantStyles[variant]} ${className}`}
    />
  );
};
