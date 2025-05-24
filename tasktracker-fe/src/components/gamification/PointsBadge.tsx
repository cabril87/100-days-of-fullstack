'use client';

import React from 'react';
import { Star, Award, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamification } from '@/lib/providers/GamificationProvider';

interface PointsBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
  showIcon?: boolean;
  value?: number;
}

export function PointsBadge({ 
  size = 'md', 
  variant = 'primary',
  className,
  showIcon = true,
  value
}: PointsBadgeProps) {
  const { userProgress, formatPoints } = useGamification();
  
  // Determine points to display
  const points = value !== undefined ? value : userProgress?.totalPoints || 0;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div 
      className={cn(
        'rounded-full border inline-flex items-center font-medium gap-1',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && (
        <Star className={cn(
          'text-amber-500',
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
      )}
      <span>{formatPoints(points)} pts</span>
    </div>
  );
}

export function LevelBadge({ 
  size = 'md', 
  variant = 'secondary',
  className,
  showIcon = true,
  value
}: PointsBadgeProps) {
  const { userProgress } = useGamification();
  
  // Determine level to display
  const level = value !== undefined ? value : userProgress?.currentLevel || 1;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-amber-50 text-amber-700 border-amber-200',
    secondary: 'bg-purple-50 text-purple-700 border-purple-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div 
      className={cn(
        'rounded-full border inline-flex items-center font-medium gap-1',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && (
        <Award className={cn(
          'text-purple-500',
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
      )}
      <span>Level {level}</span>
    </div>
  );
}

export function StreakBadge({ 
  size = 'md', 
  variant = 'warning',
  className,
  showIcon = true,
  value
}: PointsBadgeProps) {
  const { userProgress } = useGamification();
  
  // Determine streak to display
  const streak = value !== undefined ? value : userProgress?.currentStreak || 0;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div 
      className={cn(
        'rounded-full border inline-flex items-center font-medium gap-1',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && (
        <Flame className={cn(
          'text-orange-500',
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
      )}
      <span>{streak} day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
} 