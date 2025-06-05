'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  AchievementBadgeSkeletonProps,
  ProgressBarSkeletonProps,
  GameStatsCardSkeletonProps,
  NotificationBadgeSkeletonProps,
  BaseSkeletonProps,
} from '@/lib/types/skeleton';

// ✅ REQUIRED: Achievement Badge Skeleton
export const AchievementBadgeSkeleton: React.FC<AchievementBadgeSkeletonProps> = ({
  badgeSize,
  showProgress,
  showLevel,
  shimmerEffect,
  variant = 'gamified',
  className = '',
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const shimmerClass = shimmerEffect ? 'animate-pulse bg-gradient-to-r from-yellow-200/50 via-yellow-300/50 to-yellow-200/50' : '';

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      {/* Badge icon */}
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className={cn(
          sizeClasses[badgeSize],
          'rounded-full',
          shimmerClass
        )}
        aria-label={`Loading ${badgeSize} achievement badge`}
      >
        <div />
      </SkeletonWrapper>

      {/* Badge title */}
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className="h-3 w-16"
        aria-label="Loading badge title"
      >
        <div />
      </SkeletonWrapper>

      {showLevel && (
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-4 w-8 rounded-full"
          aria-label="Loading badge level"
        >
          <div />
        </SkeletonWrapper>
      )}

      {showProgress && (
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-2 w-20 rounded-full"
          aria-label="Loading badge progress"
        >
          <div />
        </SkeletonWrapper>
      )}
    </div>
  );
};

// ✅ REQUIRED: Progress Bar Skeleton
export const ProgressBarSkeleton: React.FC<ProgressBarSkeletonProps> = ({
  showPercentage,
  showLabel,
  progressType,
  theme,
  variant = 'gamified',
  className = '',
}) => {
  const themeClasses = {
    child: 'bg-gradient-to-r from-pink-200/50 to-purple-200/50',
    teen: 'bg-gradient-to-r from-blue-200/50 to-cyan-200/50',
    adult: 'bg-gradient-to-r from-gray-200/50 to-slate-200/50',
  };

  if (progressType === 'circular') {
    return (
      <div className={cn('flex flex-col items-center space-y-2', className)}>
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className={cn('h-16 w-16 rounded-full', themeClasses[theme])}
          aria-label="Loading circular progress"
        >
          <div />
        </SkeletonWrapper>
        
        {showPercentage && (
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-8"
            aria-label="Loading progress percentage"
          >
            <div />
          </SkeletonWrapper>
        )}
        
        {showLabel && (
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-3 w-16"
            aria-label="Loading progress label"
          >
            <div />
          </SkeletonWrapper>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-4 w-24"
          aria-label="Loading progress label"
        >
          <div />
        </SkeletonWrapper>
      )}
      
      <div className="flex items-center space-x-2">
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className={cn('h-4 flex-1 rounded-full', themeClasses[theme])}
          aria-label="Loading linear progress bar"
        >
          <div />
        </SkeletonWrapper>
        
        {showPercentage && (
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-8"
            aria-label="Loading progress percentage"
          >
            <div />
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
};

// ✅ REQUIRED: Game Stats Card Skeleton
export const GameStatsCardSkeleton: React.FC<GameStatsCardSkeletonProps> = ({
  showIcon,
  showTrend,
  showValue,
  statType,
  variant = 'gamified',
  className = '',
}) => {
  const statTypeColors = {
    points: 'from-yellow-200/50 to-amber-200/50',
    achievements: 'from-purple-200/50 to-violet-200/50',
    level: 'from-blue-200/50 to-indigo-200/50',
    streak: 'from-green-200/50 to-emerald-200/50',
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className={cn('h-6 w-6 rounded', `bg-gradient-to-r ${statTypeColors[statType]}`)}
                aria-label={`Loading ${statType} icon`}
              >
                <div />
              </SkeletonWrapper>
            )}
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-16"
              aria-label={`Loading ${statType} title`}
            >
              <div />
            </SkeletonWrapper>
          </div>
          
          {showTrend && (
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-8"
              aria-label={`Loading ${statType} trend`}
            >
              <div />
            </SkeletonWrapper>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {showValue && (
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className={cn('h-8 w-20 mb-2', `bg-gradient-to-r ${statTypeColors[statType]}`)}
            aria-label={`Loading ${statType} value`}
          >
            <div />
          </SkeletonWrapper>
        )}
        
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-3 w-24"
          aria-label={`Loading ${statType} description`}
        >
          <div />
        </SkeletonWrapper>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Notification Badge Skeleton
export const NotificationBadgeSkeleton: React.FC<NotificationBadgeSkeletonProps> = ({
  position,
  showCount,
  pulseAnimation,
  variant = 'gamified',
  className = '',
}) => {
  const positionClasses = {
    'top-right': 'absolute -top-1 -right-1',
    'top-left': 'absolute -top-1 -left-1',
    'bottom-right': 'absolute -bottom-1 -right-1',
    'bottom-left': 'absolute -bottom-1 -left-1',
  };

  const pulseClass = pulseAnimation ? 'animate-pulse bg-gradient-to-r from-red-200/50 to-pink-200/50' : '';

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Main content placeholder */}
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className="h-8 w-8 rounded-full"
        aria-label="Loading notification target"
      >
        <div />
      </SkeletonWrapper>
      
      {/* Notification badge */}
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className={cn(
          'h-5 w-5 rounded-full',
          positionClasses[position],
          pulseClass
        )}
        aria-label="Loading notification badge"
      >
        <div />
      </SkeletonWrapper>
      
      {showCount && (
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className={cn(
            'h-3 w-3 rounded-full',
            positionClasses[position],
            'transform translate-x-1 translate-y-1'
          )}
          aria-label="Loading notification count"
        >
          <div />
        </SkeletonWrapper>
      )}
    </div>
  );
};

// ✅ REQUIRED: Game Stats Grid Skeleton
interface GameStatsGridSkeletonProps extends BaseSkeletonProps {
  statCount: number;
}

export const GameStatsGridSkeleton: React.FC<GameStatsGridSkeletonProps> = ({
  statCount,
  variant = 'gamified',
  className = '',
}) => {
  const statTypes: Array<'points' | 'achievements' | 'level' | 'streak'> = ['points', 'achievements', 'level', 'streak'];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: statCount }).map((_, index) => (
        <GameStatsCardSkeleton
          key={index}
          showIcon={true}
          showTrend={true}
          showValue={true}
          statType={statTypes[index % statTypes.length]}
          variant={variant}
        />
      ))}
    </div>
  );
};

// ✅ REQUIRED: Achievement Grid Skeleton
interface AchievementGridSkeletonProps extends BaseSkeletonProps {
  achievementCount: number;
  badgeSize?: 'small' | 'medium' | 'large';
}

export const AchievementGridSkeleton: React.FC<AchievementGridSkeletonProps> = ({
  achievementCount,
  badgeSize = 'medium',
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4', className)}>
      {Array.from({ length: achievementCount }).map((_, index) => (
        <AchievementBadgeSkeleton
          key={index}
          badgeSize={badgeSize}
          showProgress={true}
          showLevel={true}
          shimmerEffect={true}
          variant={variant}
        />
      ))}
    </div>
  );
}; 