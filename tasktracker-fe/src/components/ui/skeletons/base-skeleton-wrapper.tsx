'use client';

import React from 'react';
import { cn } from '@/lib/helpers/utils/utils';

// Import from unified interface location following .cursorrules
import type { SkeletonWrapperProps } from '@/lib/interfaces/ui/ui-components.interface';

// ================================
// SKELETON WRAPPER COMPONENT (.cursorrules compliant)
// ================================

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  children,
  isLoading,
  fallback,
  variant = 'default',
  animation = 'pulse',
  speed = 'normal',
  theme = 'auto',
  className = '',
  delay = 0,
  'aria-label': ariaLabelProp,
  ariaLabel,
  ariaDescription,
  title,
  ...rest
}) => {
  // Use either prop name for accessibility label
  const accessibilityLabel = ariaLabelProp || ariaLabel;

  // Delay loading state if specified
  const [shouldShowSkeleton, setShouldShowSkeleton] = React.useState(delay === 0);
  
  React.useEffect(() => {
    if (delay > 0 && isLoading) {
      const timer = setTimeout(() => {
        setShouldShowSkeleton(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, isLoading]);

  if (!isLoading) {
    return <>{children}</>;
  }

  if (!shouldShowSkeleton) {
    return null;
  }

  // Variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'gamified':
        return 'bg-gradient-to-r from-purple-200/50 to-pink-200/50 dark:from-purple-800/30 dark:to-pink-800/30';
      case 'child':
        return 'bg-gradient-to-r from-pink-200/60 to-yellow-200/60 dark:from-pink-800/40 dark:to-yellow-800/40';
      case 'teen':
        return 'bg-gradient-to-r from-blue-200/60 to-cyan-200/60 dark:from-blue-800/40 dark:to-cyan-800/40';
      case 'adult':
        return 'bg-gradient-to-r from-gray-200/60 to-slate-200/60 dark:from-gray-800/40 dark:to-slate-800/40';
      case 'card':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg';
      case 'text':
        return 'bg-gray-200 dark:bg-gray-700 rounded';
      case 'avatar':
        return 'bg-gray-200 dark:bg-gray-700 rounded-full';
      case 'button':
        return 'bg-gray-200 dark:bg-gray-700 rounded-md';
      case 'pulse':
        return 'bg-gray-200 dark:bg-gray-700';
      case 'wave':
        return 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  // Animation styles
  const getAnimationStyles = () => {
    const speedClass = {
      slow: 'animate-pulse-slow',
      normal: 'animate-pulse',
      fast: 'animate-pulse-fast'
    }[speed];

    switch (animation) {
      case 'wave':
        return `animate-shimmer ${speedClass}`;
      case 'pulse':
        return speedClass;
      case 'none':
        return '';
      default:
        return speedClass;
    }
  };

  const skeletonClasses = cn(
    'animate-pulse rounded',
    getVariantStyles(),
    getAnimationStyles(),
    className
  );

  if (fallback) {
    return (
      <div 
        className={skeletonClasses}
        aria-label={accessibilityLabel}
        aria-description={ariaDescription}
        title={title}
        aria-busy="true"
        {...rest}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div 
      className={skeletonClasses}
      aria-label={accessibilityLabel || 'Loading content'}
      aria-description={ariaDescription}
      title={title}
      aria-busy="true"
      {...rest}
    >
      {children}
    </div>
  );
};

// ✅ REQUIRED: Higher-order component for easy skeleton wrapping
interface WithSkeletonProps {
  isLoading: boolean;
  skeletonProps?: Partial<SkeletonWrapperProps>;
  children: React.ReactNode;
}

const SkeletonHOC = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & WithSkeletonProps> => {
  const WrappedComponent: React.FC<P & WithSkeletonProps> = ({ isLoading, skeletonProps, children, ...props }) => {
    if (isLoading) {
      return (
        <SkeletonWrapper
          isLoading={true}
          {...skeletonProps}
        >
          {children}
        </SkeletonWrapper>
      );
    }

    return <Component {...(props as P)}>{children}</Component>;
  };

  WrappedComponent.displayName = `withSkeleton(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const withSkeleton = SkeletonHOC;

// ✅ REQUIRED: Skeleton container for multiple items
interface SkeletonContainerProps {
  itemCount: number;
  itemHeight?: number;
  itemSpacing?: number;
  children?: React.ReactNode;
  variant?: SkeletonWrapperProps['variant'];
  className?: string;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  itemCount,
  itemHeight = 40,
  itemSpacing = 8,
  variant = 'default',
  className = '',
  children,
}) => {
  return (
    <div className={cn('space-y-2', className)} style={{ gap: `${itemSpacing}px` }}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonWrapper
          key={index}
          isLoading={true}
          variant={variant}
          className={cn('w-full', `h-[${itemHeight}px]`)}
          aria-label={`Loading item ${index + 1} of ${itemCount}`}
        >
          {children}
        </SkeletonWrapper>
      ))}
    </div>
  );
}; 
