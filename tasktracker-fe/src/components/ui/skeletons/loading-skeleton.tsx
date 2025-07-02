import React from 'react';
import { cn } from '@/lib/helpers/utils/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'input' | 'button' | 'avatar' | 'card';
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  variant = 'text',
  lines = 1 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 bg-gray-200 dark:bg-gray-700 rounded';
      case 'input':
        return 'h-12 bg-gray-200 dark:bg-gray-700 rounded-lg';
      case 'button':
        return 'h-12 bg-gray-200 dark:bg-gray-700 rounded-xl';
      case 'avatar':
        return 'h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full';
      case 'card':
        return 'h-32 bg-gray-200 dark:bg-gray-700 rounded-xl';
      default:
        return 'h-4 bg-gray-200 dark:bg-gray-700 rounded';
    }
  };

  if (lines > 1) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              getVariantClasses(),
              'animate-pulse',
              index === lines - 1 && 'w-3/4' // Last line shorter
            )}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        getVariantClasses(),
        'animate-pulse',
        className
      )}
    />
  );
};

export default LoadingSkeleton; 
