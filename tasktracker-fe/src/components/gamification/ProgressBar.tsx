'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useGamification } from '@/lib/providers/GamificationProvider';

interface ProgressBarProps {
  current: number;
  max: number;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'blue';
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  current,
  max,
  height = 'md',
  color = 'primary',
  className,
  showLabel = false,
  animated = false
}: ProgressBarProps) {
  const { getProgressPercentage } = useGamification();
  
  const percentage = getProgressPercentage(current, max);
  
  // Height classes
  const heightClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'bg-gray-200 rounded-full overflow-hidden',
        heightClasses[height]
      )}>
        <div
          className={cn(
            'rounded-full transition-all duration-300 ease-out',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{current}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

export function LevelProgressBar({ className }: { className?: string }) {
  const { userProgress } = useGamification();
  
  if (!userProgress) {
    return (
      <div className={cn('w-full', className)}>
        <div className="h-3 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }
  
  const currentLevelPoints = userProgress.totalPoints % userProgress.pointsToNextLevel;
  const nextLevelThreshold = userProgress.pointsToNextLevel;
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Level {userProgress.currentLevel}</span>
        <span>Level {userProgress.currentLevel + 1}</span>
      </div>
      <ProgressBar
        current={currentLevelPoints}
        max={nextLevelThreshold}
        color="primary"
        height="md"
        animated
      />
      <div className="text-xs text-gray-500 mt-1 text-center">
        {nextLevelThreshold - currentLevelPoints} points to next level
      </div>
    </div>
  );
} 