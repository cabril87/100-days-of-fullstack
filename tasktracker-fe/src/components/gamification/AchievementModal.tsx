'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  getAchievementIcon, 
  achievementTiers, 
  type AchievementIconInfo 
} from '@/lib/constants/achievementIcons';
import { cn } from '@/lib/utils';
import { 
  Star, 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle,
  Lock,
  Users,
  Zap
} from 'lucide-react';

interface AchievementModalProps {
  achievementKey: string | null;
  isOpen: boolean;
  onClose: () => void;
  userProgress?: {
    currentProgress: number;
    isCompleted: boolean;
    completedAt?: string;
  };
}

export function AchievementModal({
  achievementKey,
  isOpen,
  onClose,
  userProgress
}: AchievementModalProps) {
  if (!achievementKey) return null;

  const achievement = getAchievementIcon(achievementKey);
  if (!achievement) return null;

  const tier = achievementTiers[achievement.tier];
  const IconComponent = achievement.icon;
  
  const isCompleted = userProgress?.isCompleted || false;
  const currentProgress = userProgress?.currentProgress || 0;
  
  // Calculate progress percentage based on first requirement
  const getProgressPercentage = () => {
    if (isCompleted) return 100;
    if (!achievement.requirements.length) return 0;
    
    // Simple progress calculation - this would be enhanced with real data
    const targetValue = extractNumberFromRequirement(achievement.requirements[0]);
    if (!targetValue) return 0;
    
    return Math.min((currentProgress / targetValue) * 100, 100);
  };

  const extractNumberFromRequirement = (requirement: string): number => {
    const match = requirement.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const getRewardTypeIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'points':
        return <Star className="h-4 w-4" />;
      case 'badge':
        return <Trophy className="h-4 w-4" />;
      case 'character':
        return <Users className="h-4 w-4" />;
      case 'special':
        return <Zap className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getRewardTypeColor = (rewardType: string) => {
    switch (rewardType) {
      case 'points':
        return 'text-yellow-600 bg-yellow-100';
      case 'badge':
        return 'text-blue-600 bg-blue-100';
      case 'character':
        return 'text-green-600 bg-green-100';
      case 'special':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center",
              isCompleted ? [achievement.color, achievement.bgColor] : ['text-gray-400', 'bg-gray-100'],
              !isCompleted && 'grayscale opacity-75'
            )}>
              {!isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <IconComponent className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", tier.color, tier.bgColor)}
                >
                  {tier.name} {achievement.level}
                </Badge>
                {isCompleted && (
                  <Badge className="text-xs bg-emerald-100 text-emerald-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-lg leading-tight">
                {achievement.category}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription asChild>
          <div className="space-y-6">
            {/* Description */}
            <div>
              <p className="text-gray-700 text-base leading-relaxed">
                {achievement.description}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">Progress</span>
                <span className="text-gray-600">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <Progress 
                value={getProgressPercentage()} 
                className="h-2"
              />
              {isCompleted && userProgress?.completedAt && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed on {new Date(userProgress.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                How to Earn
              </h4>
              <ul className="space-y-2">
                {achievement.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                      isCompleted ? "bg-emerald-500" : "bg-gray-400"
                    )} />
                    <span className={cn(
                      isCompleted ? "text-emerald-700" : "text-gray-600"
                    )}>
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewards */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Rewards
              </h4>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                  getRewardTypeColor(achievement.rewardType)
                )}>
                  {getRewardTypeIcon(achievement.rewardType)}
                  <span>
                    {achievement.rewardValue} {achievement.rewardType === 'points' ? 'Points' : 
                     achievement.rewardType === 'badge' ? 'Badge' :
                     achievement.rewardType === 'character' ? 'Character Unlock' : 'Special Reward'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tier Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-6 h-6 rounded flex items-center justify-center", tier.color, tier.bgColor)}>
                  <tier.icon className="h-3 w-3" />
                </div>
                <span className="font-medium text-gray-900">{tier.name} Tier</span>
              </div>
              <p className="text-xs text-gray-600">
                Requires {tier.pointsRequired.toLocaleString()} total points to unlock this tier
              </p>
            </div>

            {/* Action Button */}
            <div className="flex gap-2">
              {!isCompleted && (
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={onClose}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Start Working
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onClose}
                className={isCompleted ? "flex-1" : ""}
              >
                {isCompleted ? "Awesome!" : "Close"}
              </Button>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
} 