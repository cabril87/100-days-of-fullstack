'use client';

import React, { useState } from 'react';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  Star,
  RefreshCw,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardProps {
  className?: string;
  showRefresh?: boolean;
  showCategoryFilter?: boolean;
  limit?: number;
}

export function Leaderboard({
  className,
  showRefresh = true,
  showCategoryFilter = true,
  limit = 10
}: LeaderboardProps) {
  const { 
    leaderboard, 
    refreshLeaderboard, 
    isLoadingLeaderboard,
    formatPoints,
    error 
  } = useGamification();
  const [category, setCategory] = useState('all');

  const handleRefresh = () => {
    refreshLeaderboard(category, limit);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    refreshLeaderboard(newCategory, limit);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoadingLeaderboard) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`leaderboard-skeleton-${i}`} className="flex items-center gap-3 p-3 border rounded-lg">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
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
          <CardTitle className="text-lg">Leaderboard</CardTitle>
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
          <CardTitle className="text-lg">Leaderboard</CardTitle>
          {showRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoadingLeaderboard}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isLoadingLeaderboard && "animate-spin"
              )} />
            </Button>
          )}
        </div>
        <CardDescription>
          See how you rank against other users
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showCategoryFilter && (
          <div className="mb-4">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time Points</SelectItem>
                <SelectItem value="points">Total Points</SelectItem>
                <SelectItem value="streak">Current Streak</SelectItem>
                <SelectItem value="tasks">Tasks Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No leaderboard data available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div 
                key={`${entry.userId}-${index}-${category}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  entry.rank <= 3 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200" : "bg-gray-50 border border-gray-200"
                )}
              >
                {/* Rank Badge */}
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                  getRankBadgeColor(entry.rank)
                )}>
                  {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                </div>

                {/* User Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatarUrl} alt={entry.username} />
                  <AvatarFallback className="text-xs">
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    Rank #{entry.rank}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500" />
                    <span className="font-bold text-sm">
                      {formatPoints(entry.value)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {category === 'streak' ? 'days' : 
                     category === 'tasks' ? 'tasks' : 'points'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {leaderboard.length >= limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View Full Leaderboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}