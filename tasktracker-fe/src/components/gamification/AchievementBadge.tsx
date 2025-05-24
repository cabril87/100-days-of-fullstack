'use client';

import React, { useState } from 'react';
import { getAchievementIcon, type AchievementIconInfo } from '@/lib/constants/achievementIcons';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { AchievementModal } from './AchievementModal';

interface AchievementBadgeProps {
  achievementKey: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDescription?: boolean;
  locked?: boolean;
  className?: string;
  userProgress?: {
    currentProgress: number;
    isCompleted: boolean;
    completedAt?: string;
  };
}

export function AchievementBadge({
  achievementKey,
  size = 'md',
  showLabel = false,
  showDescription = false,
  locked = false,
  className,
  userProgress
}: AchievementBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const achievement = getAchievementIcon(achievementKey);

  if (!achievement) {
    return null;
  }

  const IconComponent = achievement.icon;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        className={cn(
          "flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-105",
          className
        )}
        onClick={handleClick}
      >
        <div className={cn(
          "rounded-xl flex items-center justify-center relative",
          sizeClasses[size],
          locked ? 'bg-gray-100 text-gray-400' : [achievement.color, achievement.bgColor],
          locked && 'grayscale opacity-50'
        )}>
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className={cn(
                locked ? 'text-gray-500' : 'text-white',
                size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
              )} />
            </div>
          )}
          <IconComponent className={iconSizeClasses[size]} />
        </div>
        
        {showLabel && (
          <div className="text-center">
            <div className={cn(
              "font-medium",
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            )}>
              {achievement.category}
            </div>
            {showDescription && (
              <div className={cn(
                "text-gray-600",
                size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'
              )}>
                {achievement.description}
              </div>
            )}
          </div>
        )}
      </div>

      <AchievementModal
        achievementKey={achievementKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userProgress={userProgress}
      />
    </>
  );
}

// Showcase component to display multiple achievements
interface AchievementShowcaseProps {
  achievements: string[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

export function AchievementShowcase({
  achievements,
  size = 'md',
  showLabels = true,
  showDescriptions = false,
  className
}: AchievementShowcaseProps) {
  return (
    <div className={cn(
      'grid gap-4',
      {
        'grid-cols-8': size === 'sm',
        'grid-cols-6': size === 'md',
        'grid-cols-4': size === 'lg',
      },
      className
    )}>
      {achievements.map((achievementKey) => (
        <AchievementBadge
          key={achievementKey}
          achievementKey={achievementKey}
          size={size}
          showLabel={showLabels}
          showDescription={showDescriptions}
          locked={false} // You can make this dynamic based on user data
        />
      ))}
    </div>
  );
}

// Achievement category showcase
interface AchievementCategoryProps {
  category: string;
  achievements: string[];
  className?: string;
}

export function AchievementCategory({
  category,
  achievements,
  className
}: AchievementCategoryProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
      <AchievementShowcase
        achievements={achievements}
        size="md"
        showLabels={false}
        showDescriptions={false}
      />
    </div>
  );
}

export default AchievementBadge; 