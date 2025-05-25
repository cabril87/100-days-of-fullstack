'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Crown, 
  Users, 
  Trophy,
  Medal,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Star,
  Filter,
  Globe,
  Home,
  Zap,
  Target,
  Award
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';
import { LeaderboardEntry as BaseLeaderboardEntry } from '@/lib/types/gamification';

interface LeaderboardEntry extends BaseLeaderboardEntry {
  isCurrentUser?: boolean;
  familyName?: string;
  level?: number;
  streak?: number;
  tasksCompleted?: number;
  achievementsUnlocked?: number;
  change?: number; // Change in rank from previous period
}

type LeaderboardType = 'global' | 'family' | 'friends';
type MetricType = 'points' | 'level' | 'tasks' | 'streak' | 'achievements';
type TimeFrame = 'all-time' | 'monthly' | 'weekly' | 'daily';

export default function LeaderboardPage(): React.ReactElement {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeType, setActiveType] = useState<LeaderboardType>('global');
  const [activeMetric, setActiveMetric] = useState<MetricType>('points');
  const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>('all-time');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();

  const fetchLeaderboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let data: BaseLeaderboardEntry[] = [];
      
      // Fetch appropriate leaderboard data based on type
      switch (activeType) {
        case 'global':
          data = await gamificationService.getLeaderboard(activeMetric, 50);
          break;
        case 'family':
          data = await gamificationService.getFamilyMembersLeaderboard(activeMetric, 50);
          break;
        case 'friends':
          // For now, use global leaderboard as friends placeholder
          data = await gamificationService.getLeaderboard(activeMetric, 20);
          break;
      }

      // Transform data to include additional info and simulate rank changes
      const transformedData: LeaderboardEntry[] = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        level: Math.floor((entry.value || 0) / 100) + 1, // Simulate level calculation
        streak: Math.floor(Math.random() * 30) + 1, // Simulate streak data
        tasksCompleted: Math.floor((entry.value || 0) / 10), // Simulate tasks
        achievementsUnlocked: Math.floor((entry.value || 0) / 50), // Simulate achievements
        change: Math.floor(Math.random() * 10) - 5, // Simulate rank change
        familyName: activeType === 'family' ? 'Family Member' : undefined
      }));

      setLeaderboardData(transformedData);
      
      // Find current user's rank
      const currentUserEntry = transformedData.find(entry => entry.isCurrentUser);
      setCurrentUserRank(currentUserEntry?.rank || null);

    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      showToast('Failed to load leaderboard', 'error');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeType, activeMetric, showToast]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const handleRefresh = () => {
    fetchLeaderboardData(true);
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'points': return <Star className="h-4 w-4" />;
      case 'level': return <Trophy className="h-4 w-4" />;
      case 'tasks': return <Target className="h-4 w-4" />;
      case 'streak': return <Zap className="h-4 w-4" />;
      case 'achievements': return <Award className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: LeaderboardType) => {
    switch (type) {
      case 'global': return <Globe className="h-4 w-4" />;
      case 'family': return <Home className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-orange-500" />;
      default: return <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatValue = (value: number, metric: MetricType) => {
    switch (metric) {
      case 'points': return value.toLocaleString();
      case 'level': return `Level ${Math.floor(value / 100) + 1}`;
      case 'tasks': return `${Math.floor(value / 10)} tasks`;
      case 'streak': return `${Math.floor(Math.random() * 30) + 1} days`;
      case 'achievements': return `${Math.floor(value / 50)} badges`;
      default: return value.toString();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/gamification"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">
                Compete with others and see where you rank
                {currentUserRank && ` • You're #${currentUserRank}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                }`}
                title="Toggle filters"
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title="Refresh leaderboard"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Current User Rank Highlight */}
          {currentUserRank && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">#{currentUserRank}</div>
                  <div>
                    <div className="text-lg font-semibold">Your Current Rank</div>
                    <div className="text-blue-100">
                      {formatValue(leaderboardData.find(e => e.isCurrentUser)?.value || 0, activeMetric)}
                    </div>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Leaderboard Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leaderboard Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(['global', 'family', 'friends'] as LeaderboardType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setActiveType(type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getTypeIcon(type)}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metric */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
                  <div className="flex flex-wrap gap-2">
                    {(['points', 'level', 'tasks', 'streak', 'achievements'] as MetricType[]).map(metric => (
                      <button
                        key={metric}
                        onClick={() => setActiveMetric(metric)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeMetric === metric
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getMetricIcon(metric)}
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Frame */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
                  <select
                    value={activeTimeFrame}
                    onChange={(e) => setActiveTimeFrame(e.target.value as TimeFrame)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all-time">All Time</option>
                    <option value="monthly">This Month</option>
                    <option value="weekly">This Week</option>
                    <option value="daily">Today</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex gap-2">
              {(['global', 'family'] as LeaderboardType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {getTypeIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leaderboard Data</h3>
              <p className="text-gray-600 mb-4">
                Complete tasks and earn points to appear on the leaderboard!
              </p>
              <Link
                href="/gamification"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                Start Earning Points
              </Link>
            </div>
          ) : (
            leaderboardData.map((entry) => (
              <div 
                key={`${entry.userId}-${entry.rank}`}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 hover:shadow-md ${
                  entry.isCurrentUser 
                    ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${entry.rank <= 3 ? 'ring-2 ring-opacity-20 ' + (
                  entry.rank === 1 ? 'ring-yellow-400' :
                  entry.rank === 2 ? 'ring-gray-400' : 'ring-orange-400'
                ) : ''}`}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Rank, Avatar, User Info */}
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      {entry.rank <= 3 && (
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(entry.rank)}`}>
                          {entry.rank === 1 ? '1ST' : entry.rank === 2 ? '2ND' : '3RD'}
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {entry.avatarUrl ? (
                        <Image 
                          src={entry.avatarUrl} 
                          alt={entry.username} 
                          width={48}
                          height={48}
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        getInitials(entry.username)
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{entry.username}</h3>
                        {entry.isCurrentUser && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">You</span>
                        )}
                        {entry.familyName && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{entry.familyName}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Level {entry.level || 1}</span>
                        {entry.change !== undefined && (
                          <span className={`flex items-center gap-1 ${
                            entry.change > 0 ? 'text-green-600' : 
                            entry.change < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {entry.change > 0 ? '↗' : entry.change < 0 ? '↘' : '→'}
                            {entry.change === 0 ? 'No change' : `${Math.abs(entry.change)} ${entry.change > 0 ? 'up' : 'down'}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatValue(entry.value, activeMetric)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activeMetric === 'points' && `${entry.tasksCompleted} tasks`}
                      {activeMetric === 'level' && `${entry.value.toLocaleString()} points`}
                      {activeMetric === 'tasks' && `Level ${entry.level}`}
                      {activeMetric === 'streak' && `${entry.achievementsUnlocked} badges`}
                      {activeMetric === 'achievements' && `${entry.value.toLocaleString()} points`}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {leaderboardData.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{leaderboardData.length}</div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatValue(leaderboardData[0]?.value || 0, activeMetric)}
                </div>
                <div className="text-sm text-gray-600">Top Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatValue(Math.round(leaderboardData.reduce((sum, entry) => sum + entry.value, 0) / leaderboardData.length), activeMetric)}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 