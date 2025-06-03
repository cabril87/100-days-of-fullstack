'use client';

/**
 * Kanban Gamification Header Component
 * Displays user progress, achievements, and gamification metrics
 */

import React from 'react';

// Types
import { KanbanGamificationProps } from '@/lib/types/kanban';

// Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import {
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Award,
  Crown,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Users
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

export function KanbanGamificationHeader({
  userProgress,
  recentAchievements,
  stats,
  className = ''
}: KanbanGamificationProps) {
  // Calculate level progress percentage
  const getLevelProgress = (): number => {
    if (!userProgress.pointsToNextLevel) return 100;
    const currentLevelPoints = userProgress.totalPoints - (userProgress.pointsToNextLevel || 0);
    const levelPointsRange = userProgress.pointsToNextLevel;
    return Math.min((currentLevelPoints / levelPointsRange) * 100, 100);
  };

  // Get level tier info
  const getLevelTier = (level: number): { name: string; color: string; icon: React.ReactNode } => {
    if (level >= 50) return { name: 'Master', color: 'text-purple-600', icon: <Crown className="h-4 w-4" /> };
    if (level >= 30) return { name: 'Expert', color: 'text-gold-600', icon: <Trophy className="h-4 w-4" /> };
    if (level >= 15) return { name: 'Advanced', color: 'text-blue-600', icon: <Star className="h-4 w-4" /> };
    if (level >= 5) return { name: 'Intermediate', color: 'text-green-600', icon: <Target className="h-4 w-4" /> };
    return { name: 'Beginner', color: 'text-gray-600', icon: <Zap className="h-4 w-4" /> };
  };

  const levelTier = getLevelTier(userProgress.currentLevel);

  // Format streak display
  const getStreakDisplay = () => {
    if (userProgress.currentStreak === 0) return 'No streak';
    if (userProgress.currentStreak === 1) return '1 day streak';
    return `${userProgress.currentStreak} days streak`;
  };

  // Get streak color based on length
  const getStreakColor = () => {
    if (userProgress.currentStreak >= 30) return 'text-purple-600';
    if (userProgress.currentStreak >= 14) return 'text-orange-600';
    if (userProgress.currentStreak >= 7) return 'text-blue-600';
    if (userProgress.currentStreak >= 3) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <TooltipProvider>
      <Card className={cn("bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Side - User Progress */}
            <div className="flex items-center gap-4">
              {/* Level Badge */}
              <div className="flex items-center gap-2">
                <div className={cn("flex items-center gap-1", levelTier.color)}>
                  {levelTier.icon}
                  <span className="font-bold text-lg">Level {userProgress.currentLevel}</span>
                </div>
                <Badge variant="secondary" className={cn("text-xs", levelTier.color)}>
                  {levelTier.name}
                </Badge>
              </div>

              {/* Points and Progress */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold">{userProgress.totalPoints.toLocaleString()} points</span>
                  {userProgress.pointsToNextLevel > 0 && (
                    <span className="text-muted-foreground">
                      ({userProgress.pointsToNextLevel} to next level)
                    </span>
                  )}
                </div>
                {userProgress.pointsToNextLevel > 0 && (
                  <div className="w-48">
                    <Progress value={getLevelProgress()} className="h-2" />
                  </div>
                )}
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2">
                <Flame className={cn("h-4 w-4", getStreakColor())} />
                <span className={cn("text-sm font-medium", getStreakColor())}>
                  {getStreakDisplay()}
                </span>
                {userProgress.currentStreak > userProgress.highestStreak / 2 && (
                  <Badge variant="outline" className="text-xs">
                    🔥 Hot streak!
                  </Badge>
                )}
              </div>
            </div>

            {/* Center - Quick Stats */}
            <div className="flex items-center gap-6">
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {userProgress.tasksCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Tasks completed</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Award className="h-4 w-4 text-blue-600" />
                      {userProgress.badgesEarned}
                    </div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Badges earned</TooltipContent>
              </Tooltip>

              {stats && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        {Math.round(stats.consistencyScore)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Consistency</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Consistency score</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Right Side - Recent Achievements */}
            <div className="flex items-center gap-3">
              {recentAchievements.length > 0 && (
                <>
                  <div className="text-sm font-medium text-muted-foreground">Recent:</div>
                  <div className="flex items-center gap-2">
                    {recentAchievements.slice(0, 3).map((achievement) => (
                      <Tooltip key={achievement.id}>
                        <TooltipTrigger>
                          <div className="relative">
                            <Avatar className="h-8 w-8 border-2 border-yellow-400">
                              <AvatarImage src={achievement.iconUrl} alt={achievement.name} />
                              <AvatarFallback className="bg-yellow-100 text-yellow-800 text-xs">
                                <Trophy className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            {achievement.isUnlocked && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-white" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <div className="font-semibold">{achievement.name}</div>
                            <div className="text-xs text-muted-foreground">{achievement.description}</div>
                            <div className="text-xs text-yellow-600 font-medium">
                              +{achievement.pointValue} points
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    
                    {recentAchievements.length > 3 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 text-xs">
                            +{recentAchievements.length - 3}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {recentAchievements.length - 3} more achievements
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </>
              )}

              {/* Quick Action Button */}
              <Button variant="outline" size="sm" className="gap-2">
                <Trophy className="h-4 w-4" />
                View Achievements
              </Button>
            </div>
          </div>

          {/* Additional Stats Row */}
          {stats && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last active: {userProgress.lastActivityDate ? new Date(userProgress.lastActivityDate).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Best streak: {userProgress.highestStreak} days</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>Completed today: {stats.completedTasks}</div>
                  <div>Achievements unlocked: {stats.achievementsUnlocked}</div>
                  <div>Rewards redeemed: {stats.rewardsRedeemed}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 