'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Award, 
  Star, 
  Target, 
  Flame, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { FamilyTaskStats } from '@/lib/types/family-task';
import { FamilyMemberDTO } from '@/lib/types/family';

interface LeaderboardTabProps {
  familyStats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
}

interface GoalsTabProps {
  familyStats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
}

interface AchievementsTabProps {
  familyStats: FamilyTaskStats;
}

/**
 * Leaderboard Tab Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Single card with border sm:border-2
 * - Member rankings with flex layout and min-w-0
 * - Each member item has truncate classes
 * - Achievement categories grid (2 sm:3 cols)
 */
export function LeaderboardTab({ familyStats }: LeaderboardTabProps) {
  const getMemberRankings = () => {
    return [...familyStats.memberStats].sort((a, b) => b.points - a.points);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in slide-in-from-right-5 duration-300">
      <Card className="gradient-border bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-amber-900/10 dark:to-orange-900/10 border sm:border-2 border-amber-200 dark:border-amber-700">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
            <span className="truncate">Family Champions</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs flex-shrink-0">
              Top Performers
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            See who&apos;s leading the family quest leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 max-w-full overflow-hidden">
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            {getMemberRankings().map((member, index) => (
              <div 
                key={member.memberId} 
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border min-w-0 ${
                  index === 0 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700" :
                  index === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-700" :
                  index === 2 ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-700" :
                  "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-700"
                }`}
              >
                <div className="flex-shrink-0">
                  {index === 0 ? <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" /> :
                   index === 1 ? <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" /> :
                   index === 2 ? <Award className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" /> :
                   <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {member.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {member.tasksCompleted} tasks completed
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-sm sm:text-base text-purple-600 dark:text-purple-400">
                    {member.points}
                  </p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Goals Tab Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Single card with three goal sections
 * - Progress bars and flexible layouts
 * - Badge wrapping with max-w-[80px] truncation
 */
export function GoalsTab({ familyStats, familyMembers }: GoalsTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in slide-in-from-right-5 duration-300">
      <Card className="gradient-border bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-cyan-900/10 border sm:border-2 border-blue-200 dark:border-blue-700">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Family Quests</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">
              {familyStats.totalTasks - familyStats.completedTasks} Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Track your family&apos;s ongoing adventures and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 max-w-full overflow-hidden">
          <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
            {/* Weekly Goal Progress */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">Weekly Goal</h4>
                <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold">
                  {familyStats.weeklyProgress}%
                </span>
              </div>
              <Progress 
                value={familyStats.weeklyProgress} 
                className="h-3 sm:h-4 bg-green-100 dark:bg-green-900/20"
              />
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Complete {Math.ceil((100 - familyStats.weeklyProgress) / 10)} more tasks this week!
              </p>
            </div>

            {/* Monthly Challenge */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 text-sm sm:text-base">Monthly Challenge</h4>
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                Complete 50 family tasks together
              </p>
              <div className="mt-2">
                <Progress 
                  value={(familyStats.completedTasks / 50) * 100} 
                  className="h-3 sm:h-4 bg-purple-100 dark:bg-purple-900/20"
                />
                <p className="text-xs text-purple-500 mt-1">
                  {familyStats.completedTasks}/50 tasks completed
                </p>
              </div>
            </div>

            {/* Team Building Goal */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Team Building</h4>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                Every family member completes at least 3 tasks
              </p>
              <div className="mt-2 flex flex-wrap gap-1 max-w-full overflow-hidden">
                {familyMembers.slice(0, 4).map((member, index) => (
                  <Badge 
                    key={member.id} 
                    variant="outline" 
                    className="text-xs border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 max-w-[80px] truncate"
                  >
                    {member.user?.firstName || `M${index + 1}`} ✓
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Achievements Tab Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Achievement categories grid (2 sm:3 cols)
 * - Achievement list with flex layouts
 * - Next achievement preview section
 */
export function AchievementsTab({ familyStats }: AchievementsTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in slide-in-from-right-5 duration-300">
      <Card className="gradient-border bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 border sm:border-2 border-green-200 dark:border-green-700">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            <span className="truncate">Family Trophies</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs flex-shrink-0">
              {familyStats.recentAchievements.length} Unlocked
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Celebrate your family&apos;s amazing accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 max-w-full overflow-hidden">
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            {/* Achievement Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 max-w-full overflow-hidden">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 text-center">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200">Task Master</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">3 earned</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 text-center">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">Team Player</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">2 earned</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700 text-center col-span-2 sm:col-span-1">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Streak Hero</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">1 earned</p>
              </div>
            </div>

            {/* Recent Achievements List */}
            {familyStats.recentAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-lg border border-gray-200 dark:border-gray-700 min-w-0"
              >
                <div className="text-lg sm:text-xl flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {achievement.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                    +{achievement.points}
                  </Badge>
                </div>
              </div>
            ))}

            {/* Next Achievement Preview */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                <h4 className="font-medium text-indigo-800 dark:text-indigo-200 text-sm sm:text-base">Next Achievement</h4>
              </div>
                             <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                 &quot;Family Harmony&quot; - Complete 10 tasks together in one day
               </p>
              <Progress value={60} className="h-2 sm:h-3 bg-indigo-100 dark:bg-indigo-900/20" />
              <p className="text-xs text-indigo-500 mt-1">6/10 tasks completed today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

