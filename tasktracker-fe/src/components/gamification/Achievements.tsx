'use client';

import React, { useState } from 'react';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Lock, 
  Medal, 
  Trophy, 
  Award, 
  Star,
  Clock,
  CheckSquare,
  Calendar,
  Zap,
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressBar } from './ProgressBar';
import { AchievementShowcase } from './AchievementBadge';

interface AchievementsProps {
  limit?: number;
  className?: string;
  showRefresh?: boolean;
  showTabs?: boolean;
}

// A mapping of achievement categories to icons
const achievementIconMap: Record<string, React.ComponentType<any>> = {
  task: CheckSquare,
  streak: Clock,
  login: Calendar,
  complete: CheckCircle2,
  family: Users,
  speed: Zap,
  level: Trophy,
  default: Award
};

export function Achievements({
  limit = 6,
  className,
  showRefresh = true,
  showTabs = true
}: AchievementsProps) {
  const { 
    achievements, 
    refreshAchievements, 
    isLoadingAchievements,
    error 
  } = useGamification();
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter achievements based on tab
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unlocked') return achievement.isCompleted;
    if (activeTab === 'in-progress') return !achievement.isCompleted && achievement.achievement.currentProgress > 0;
    if (activeTab === 'locked') return !achievement.isCompleted && achievement.achievement.currentProgress === 0;
    return true;
  });
  
  // Limit the number of achievements to display
  const displayAchievements = filteredAchievements.slice(0, limit);
  
  // Handle refresh
  const handleRefresh = () => {
    refreshAchievements();
  };
  
  // Get achievement icon
  const getAchievementIcon = (category: string) => {
    const IconComponent = achievementIconMap[category.toLowerCase()] || achievementIconMap.default;
    return <IconComponent className="h-5 w-5" />;
  };

  if (isLoadingAchievements) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`achievement-skeleton-${i}`} className="flex gap-3 p-3 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
            {showRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Achievements</CardTitle>
          {showRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoadingAchievements}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isLoadingAchievements && "animate-spin"
              )} />
            </Button>
          )}
        </div>
        <CardDescription>
          Unlock achievements by completing tasks and challenges
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showTabs ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <AchievementsList achievements={displayAchievements} />
            </TabsContent>
          </Tabs>
        ) : (
          <AchievementsList achievements={displayAchievements} />
        )}
        
        {filteredAchievements.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Achievements ({filteredAchievements.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementsList({ achievements }: { achievements: any[] }) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No achievements found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {achievements.map((achievement) => {
        const isComplete = achievement.isCompleted;
        const inProgress = !isComplete && achievement.achievement.currentProgress > 0;
        
        return (
          <div 
            key={achievement.id} 
            className={cn(
              "flex gap-3 p-3 border rounded-lg transition-colors",
              isComplete ? "bg-emerald-50 border-emerald-200" : 
              inProgress ? "bg-blue-50 border-blue-200" : 
              "bg-gray-50 border-gray-200"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
              isComplete ? "bg-emerald-100 text-emerald-600" : 
              inProgress ? "bg-blue-100 text-blue-600" : 
              "bg-gray-100 text-gray-500"
            )}>
              {isComplete ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Award className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">
                {achievement.achievement.name}
                {isComplete && (
                  <span className="inline-flex items-center ml-1.5 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-0.5" />
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {achievement.achievement.description}
              </p>
              
              {achievement.isCompleted ? (
                <div className="text-xs text-emerald-600 font-medium flex items-center">
                  Completed
                  {achievement.completedAt && (
                    <span className="ml-1 text-gray-500">
                      • {new Date(achievement.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-1 mt-1.5">
                  <ProgressBar 
                    current={achievement.achievement.currentProgress} 
                    max={achievement.achievement.targetValue}
                    height="xs"
                    color={inProgress ? "blue" : "primary"}
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {achievement.achievement.currentProgress} / {achievement.achievement.targetValue}
                    </span>
                    <span className="flex items-center text-amber-600">
                      <Star className="h-3 w-3 mr-0.5" />
                      {achievement.achievement.pointValue} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 