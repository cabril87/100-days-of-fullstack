'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  PartyPopper, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Trophy 
} from 'lucide-react';
import { FamilyTaskStats } from '@/lib/types/family-task';
import { triggerHapticFeedback } from '@/lib/helpers/mobile';
import confetti from 'canvas-confetti';

interface OverviewTabProps {
  familyStats: FamilyTaskStats;
  enableHaptic: boolean;
  enableAnimations: boolean;
}

/**
 * Overview Tab Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Two main cards with border sm:border-2
 * - CardHeader with p-3 sm:p-4 md:p-6
 * - CardContent with p-3 sm:p-4 md:p-6 pt-0 max-w-full overflow-hidden
 * - Progress bars and achievement lists
 * - Achievement cards with gap-2 sm:gap-3 md:gap-4
 * 
 * Each achievement item has min-w-0 and truncate classes
 */
export default function OverviewTab({
  familyStats,
  enableHaptic,
  enableAnimations
}: OverviewTabProps) {
  const getFamilyCompletionRate = () => {
    if (familyStats.totalTasks === 0) return 0;
    return Math.round((familyStats.completedTasks / familyStats.totalTasks) * 100);
  };

  const triggerStatsAnimation = (statType: string) => {
    if (!enableAnimations) return;
    
    const colors = {
      achievements: ['#8B5CF6', '#A78BFA']
    };
    
    confetti({
      particleCount: 20,
      spread: 40,
      startVelocity: 15,
      colors: colors[statType as keyof typeof colors] || ['#6366F1'],
      origin: { x: 0.5, y: 0.6 }
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in slide-in-from-right-5 duration-300">
      {/* Family Progress Overview Card */}
      <Card className="gradient-border bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 border sm:border-2 border-purple-200 dark:border-purple-700">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
            <span className="truncate">Family Progress Overview</span>
            <PartyPopper className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 animate-bounce flex-shrink-0" />
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Your family&apos;s epic quest completion rate and legendary performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pt-0 max-w-full overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm md:text-base font-medium">Overall Completion Rate</span>
              <span className="text-sm md:text-base text-gray-500 font-bold">{getFamilyCompletionRate()}%</span>
            </div>
            <Progress 
              value={getFamilyCompletionRate()} 
              className="h-4 md:h-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20" 
            />
            <div className="mt-2 text-xs md:text-sm text-center text-purple-600 dark:text-purple-400">
              {getFamilyCompletionRate() >= 80 ? "🏆 Legendary Performance!" : 
               getFamilyCompletionRate() >= 60 ? "⭐ Great Progress!" : 
               getFamilyCompletionRate() >= 40 ? "💪 Keep Going!" : "🚀 Just Getting Started!"}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 max-w-full overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-green-800 dark:text-green-200 text-xs sm:text-sm md:text-base truncate">Quests Completed</p>
                <p className="text-xs md:text-sm text-green-600 dark:text-green-400 truncate">{familyStats.completedTasks} epic victories this week</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200 text-xs sm:text-sm md:text-base truncate">Pending Adventures</p>
                <p className="text-xs md:text-sm text-amber-600 dark:text-amber-400 truncate">{familyStats.totalTasks - familyStats.completedTasks} awaiting heroes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Family Achievements Card */}
      <Card className="gradient-border bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-cyan-900/10 border sm:border-2 border-blue-200 dark:border-blue-700">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Recent Family Achievements</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">
              {familyStats.recentAchievements.length} unlocked
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Celebrating your family&apos;s recent legendary accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 max-w-full overflow-hidden">
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            {familyStats.recentAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 cursor-pointer group min-w-0"
                onClick={() => {
                  if (enableAnimations) triggerStatsAnimation('achievements');
                  if (enableHaptic) triggerHapticFeedback('medium');
                }}
              >
                <div className="text-xl sm:text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">{achievement.title}</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{achievement.description}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 truncate">
                    Unlocked by {achievement.unlockedBy} • <span className="font-medium">+{achievement.points} Legend Points</span>
                  </p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 min-h-[44px] px-2 sm:px-3 flex-shrink-0">
                  <Trophy className="w-3 h-3 mr-1" />
                  <span className="text-xs">+{achievement.points}</span>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
