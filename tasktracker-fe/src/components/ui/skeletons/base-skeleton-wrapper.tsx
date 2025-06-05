'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/utils';
import { BaseSkeletonProps, AccessibleSkeletonProps, ThemedSkeletonProps } from '@/lib/types/skeleton';

// ✅ REQUIRED: Base skeleton wrapper with explicit typing
interface SkeletonWrapperProps extends BaseSkeletonProps, Partial<AccessibleSkeletonProps>, Partial<ThemedSkeletonProps> {
  children: React.ReactNode;
  isLoading: boolean;
}

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  children,
  isLoading,
  className = '',
  variant = 'default',
  isAnimated = true,
  accentColor = 'hsl(var(--primary))',
  animationDuration = 1500,
  borderRadius = 4,
  'aria-label': ariaLabel = 'Loading content...',
  'aria-busy': ariaBusy = true,
  'aria-live': ariaLive = 'polite',
  role = 'status',
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  const skeletonVariants = {
    default: 'bg-muted',
    gamified: 'bg-gradient-to-r from-primary/20 to-secondary/20',
    'child-friendly': 'bg-gradient-to-r from-pink-200/50 to-purple-200/50 rounded-lg',
  };

  const animationClasses = isAnimated ? 'animate-pulse' : '';

  return (
    <Skeleton
      className={cn(
        skeletonVariants[variant],
        animationClasses,
        className
      )}
      style={{
        animationDuration: `${animationDuration}ms`,
        borderRadius: `${borderRadius}px`,
        accentColor,
      }}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      aria-live={ariaLive}
      role={role}
    />
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
interface SkeletonContainerProps extends BaseSkeletonProps {
  itemCount: number;
  itemHeight?: number;
  itemSpacing?: number;
  children?: React.ReactNode;
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