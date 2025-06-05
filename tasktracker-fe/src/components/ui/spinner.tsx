'use client';

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface SpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export function Spinner({ className, size = 'md', color = 'primary' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-gray-400',
    white: 'text-white',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-solid border-current border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 