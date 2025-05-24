'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  Target,
  Flame,
  Calendar,
  CheckCircle,
  ArrowUp,
  Crown,
  BarChart3,
  Activity,
  Settings,
  ChevronRight,
  PlayCircle,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Shield,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthDebug from '@/components/debug/AuthDebug';

// Import your existing types and service
import type { 
  UserProgress, 
  GamificationSuggestion,
  GamificationStats,
  LeaderboardEntry as LeaderboardEntryType,
  UserAchievement,
  DailyLoginStatus,
  PointTransaction,
  UserActiveChallenge,
  Reward,
  Challenge
} from '@/lib/types/gamification';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';

// Component-specific interfaces
interface LevelProgressProps {
  currentLevel: number;
  progress: number;
  pointsToNext: number;
  isLoading?: boolean;
}

interface AchievementBadgeProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    earned: boolean;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

interface LeaderboardEntryProps {
  entry: {
    userId: number;
    username: string;
    rank: number;
    value: number;
    avatarUrl?: string;
    isCurrentUser?: boolean;
    familyName?: string;
  };
}

interface SuggestionCardProps {
  suggestion: GamificationSuggestion;
}

interface ActivityItemProps {
  type: 'task' | 'achievement' | 'streak' | 'login' | 'challenge';
  title: string;
  description: string;
  timeAgo: string;
  points?: number;
}

interface QuickActionProps {
  title: string;
  description: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  onClick: () => void;
  disabled?: boolean;
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  trend?: number;
  isLoading?: boolean;
}

interface DashboardData {
  userProgress: UserProgress | null;
  stats: GamificationStats | null;
  suggestions: GamificationSuggestion[];
  achievements: UserAchievement[];
  leaderboard: LeaderboardEntryType[];
  familyMembersLeaderboard: LeaderboardEntryType[];
  dailyLoginStatus: DailyLoginStatus | null;
  recentActivity: PointTransaction[];
  activeChallenges: UserActiveChallenge[];
  availableRewards: Reward[];
  availableChallenges: Challenge[];
}

interface ActiveChallengeCardProps {
  challenge: UserActiveChallenge;
  onLeave: (challengeId: number) => void;
}

interface RewardCardProps {
  reward: Reward;
  onRedeem: (rewardId: number) => void;
  userPoints: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: number) => void;
  activeChallengeCount: number;
}

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, bgColor, trend, isLoading = false }) => (
  <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg ${bgColor} group cursor-pointer`}>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-white/30 rounded-lg mb-3"></div>
        <div className="h-6 w-16 bg-white/30 rounded mb-2"></div>
        <div className="h-4 w-12 bg-white/30 rounded"></div>
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-white/20">
            {icon}
          </div>
          {trend && (
            <div className="flex items-center text-white/90 text-xs font-medium">
              <ArrowUp className="h-3 w-3 mr-1" />
              +{trend}%
            </div>
          )}
        </div>
        <div className="text-white">
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-white/80 text-sm">{title}</div>
        </div>
      </>
    )}
  </div>
);

// Level Progress Component
const LevelProgress: React.FC<LevelProgressProps> = ({ currentLevel, progress, pointsToNext, isLoading = false }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Trophy className="h-5 w-5 text-purple-600" />
      Level Progress
    </h3>
    {isLoading ? (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 rounded h-4 w-full"></div>
        <div className="animate-pulse bg-gray-200 rounded h-2 w-full"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/2"></div>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-purple-600">Level {currentLevel}</span>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Tier</div>
            <div className="text-sm font-semibold text-indigo-600">
              {currentLevel <= 5 ? 'Bronze' : 
               currentLevel <= 10 ? 'Silver' : 
               currentLevel <= 20 ? 'Gold' : 
               currentLevel <= 35 ? 'Platinum' : 'Diamond'}
          </div>
          </div>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3">
            <div 
            className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{pointsToNext > 0 ? `${pointsToNext} points to next level` : 'Max level reached!'}</span>
          <span>{progress}%</span>
        </div>
      </div>
    )}
  </div>
);

// Achievement Badge Component
const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-blue-400 to-blue-600", 
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-orange-500"
  };

  return (
    <div className={`relative p-4 rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} ${achievement.earned ? 'opacity-100' : 'opacity-50 grayscale'} hover:scale-105 transition-all duration-300 cursor-pointer group`}>
      <div className="text-center">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <h4 className="font-semibold text-white text-sm mb-1">{achievement.name}</h4>
        <p className="text-white/80 text-xs leading-tight">{achievement.description}</p>
      </div>
      {achievement.earned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

// Leaderboard Entry Component
const LeaderboardEntryComponent: React.FC<LeaderboardEntryProps> = ({ entry }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-102 ${
      entry.isCurrentUser 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200' 
        : 'bg-white hover:bg-gray-50 border border-gray-200'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 ${
        entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
        entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
        entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {entry.rank}
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm mr-4">
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt={entry.username} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(entry.username)
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-gray-900">{entry.username}</div>
          {entry.isCurrentUser && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">You</span>
          )}
          {entry.familyName && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{entry.familyName}</span>
          )}
        </div>
        <div className="text-sm text-gray-500">User #{entry.userId}</div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">{entry.value.toLocaleString()}</div>
        <div className="text-sm text-gray-500">points</div>
      </div>
    </div>
  );
};

// Suggestion Card Component
const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => (
  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-all duration-300 group cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-green-900 mb-1">{suggestion.title}</h4>
        <p className="text-green-700 text-sm leading-relaxed">{suggestion.description}</p>
      </div>
      <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg">
        <Star className="h-3 w-3 text-amber-600" />
        <span className="text-xs font-semibold text-amber-800">{suggestion.pointValue}</span>
      </div>
    </div>
    <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group-hover:scale-105">
      <PlayCircle className="h-4 w-4" />
      Take Action
    </button>
  </div>
);

// Activity Item Component
const ActivityItem: React.FC<ActivityItemProps> = ({ type, title, description, timeAgo, points }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'task':
        return { icon: <CheckCircle className="h-4 w-4 text-green-600" />, bgColor: 'bg-green-50', textColor: 'text-green-900' };
      case 'achievement':
        return { icon: <Trophy className="h-4 w-4 text-blue-600" />, bgColor: 'bg-blue-50', textColor: 'text-blue-900' };
      case 'streak':
        return { icon: <Flame className="h-4 w-4 text-purple-600" />, bgColor: 'bg-purple-50', textColor: 'text-purple-900' };
      case 'login':
        return { icon: <Calendar className="h-4 w-4 text-amber-600" />, bgColor: 'bg-amber-50', textColor: 'text-amber-900' };
      case 'challenge':
        return { icon: <Target className="h-4 w-4 text-red-600" />, bgColor: 'bg-red-50', textColor: 'text-red-900' };
      default:
        return { icon: <Star className="h-4 w-4 text-gray-600" />, bgColor: 'bg-gray-50', textColor: 'text-gray-900' };
    }
  };

  const { icon, bgColor, textColor } = getIconAndColor();

  return (
    <div className={`flex items-center gap-3 p-3 ${bgColor} rounded-lg`}>
      <div className={`w-8 h-8 ${bgColor.replace('50', '100')} rounded-full flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${textColor}`}>{title}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className={textColor.replace('900', '700')}>{description}</span>
          {points && (
            <span className="text-amber-600 font-medium">+{points} pts</span>
          )}
          <span className="text-gray-500">• {timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

// Quick Action Component
const QuickAction: React.FC<QuickActionProps> = ({ title, description, bgColor, hoverColor, textColor, onClick, disabled }) => (
  <button 
    onClick={disabled ? undefined : onClick}
    className={`w-full text-left p-3 rounded-lg ${bgColor} ${disabled ? 'opacity-50 cursor-not-allowed' : hoverColor} transition-colors duration-200 group`}
    disabled={disabled}
  >
    <div className="flex items-center justify-between">
      <span className={`font-medium ${textColor}`}>{title}</span>
      <ChevronRight className={`h-4 w-4 ${textColor.replace('900', '600')} ${disabled ? '' : 'group-hover:translate-x-1'} transition-transform`} />
    </div>
    <span className={`text-sm ${textColor.replace('900', '700')}`}>{description}</span>
  </button>
);

const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({ challenge, onLeave }) => {
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-orange-600 bg-orange-100';
      case 5: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      case 4: return 'Expert';
      case 5: return 'Legendary';
      default: return 'Unknown';
    }
  };

  const formatTimeRemaining = (endDate?: string) => {
    if (!endDate) return 'Ongoing';
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{challenge.challengeName}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{challenge.challengeDescription}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
            {getDifficultyLabel(challenge.difficulty)}
          </span>
          <button
            onClick={() => onLeave(challenge.challengeId)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Leave challenge"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {challenge.currentProgress}/{challenge.targetProgress}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(challenge.progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{challenge.progressPercentage}% complete</span>
          <span>{formatTimeRemaining(challenge.endDate)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-600">
          <Star className="h-4 w-4" />
          <span className="font-semibold">{challenge.pointReward}</span>
          <span className="text-sm text-gray-500">points</span>
        </div>
        <span className="text-xs text-gray-500 capitalize">
          {challenge.activityType.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>
    </div>
  );
};

const RewardCard: React.FC<RewardCardProps> = ({ reward, onRedeem, userPoints }) => {
  const canAfford = userPoints >= reward.pointCost;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{reward.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-gray-900">{reward.pointCost}</span>
          <span className="text-sm text-gray-500">points</span>
        </div>
        
        <button
          onClick={() => onRedeem(reward.id)}
          disabled={!canAfford}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            canAfford 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canAfford ? 'Redeem' : 'Need more points'}
        </button>
      </div>
    </div>
  );
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin, activeChallengeCount }) => {
  const canJoin = activeChallengeCount < 2;
  
  const formatEndDate = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{challenge.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
          {challenge.category}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Target</span>
          <span className="text-sm font-medium text-gray-900">{challenge.targetValue}</span>
        </div>
        {challenge.endDate && (
          <div className="text-xs text-gray-500">{formatEndDate(challenge.endDate)}</div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-600">
          <Star className="h-4 w-4" />
          <span className="font-semibold">{challenge.pointReward}</span>
          <span className="text-sm text-gray-500">points</span>
        </div>
        
        <button
          onClick={() => onJoin(challenge.id)}
          disabled={!canJoin}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            canJoin 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canJoin ? 'Join' : 'Slots full'}
        </button>
      </div>
    </div>
  );
};

export default function GamificationDashboard(): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Admin detection state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userProgress: null,
    stats: null,
    suggestions: [],
    achievements: [],
    leaderboard: [],
    familyMembersLeaderboard: [],
    dailyLoginStatus: null,
    recentActivity: [],
    activeChallenges: [],
    availableRewards: [],
    availableChallenges: []
  });

  // Fetch all dashboard data
  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [
        userProgress,
        stats,
        suggestions,
        leaderboard,
        achievements,
        familyMembersLeaderboard,
        dailyLoginStatus,
        activeChallenges,
        availableRewards,
        availableChallenges
      ] = await Promise.all([
        gamificationService.getUserProgress(),
        gamificationService.getGamificationStats(),
        gamificationService.getSuggestions(),
        gamificationService.getLeaderboard('points', 20),
        gamificationService.getUserAchievements(),
        gamificationService.getFamilyMembersLeaderboard('points', 20), // Get family members only
        gamificationService.getDailyLoginStatus(),
        gamificationService.getUserActiveChallenges(),
        gamificationService.getAvailableRewards(),
        gamificationService.getActiveChallenges()
      ]);

      console.log('Debug: Active challenges received:', activeChallenges);
      console.log('Debug: Active challenges count:', activeChallenges?.length || 0);

      // TODO: Add recent activity endpoint when available
      // For now we'll create some activity based on recent achievements
      const recentActivity: PointTransaction[] = [];

      setDashboardData({
        userProgress,
        stats,
        suggestions,
        achievements,
        leaderboard,
        familyMembersLeaderboard,
        dailyLoginStatus,
        recentActivity,
        activeChallenges,
        availableRewards,
        availableChallenges
      });

      console.log('Dashboard data updated, active challenges count:', activeChallenges.length); // Debug log
      console.log('Dashboard data updated, active challenges:', activeChallenges); // Debug log
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initialization
  useEffect(() => {
    fetchDashboardData();
    checkAdminStatus();
  }, []);

  // Add a page visibility change listener to refresh data when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh data
        fetchDashboardData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when window regains focus
    const handleFocus = () => {
      fetchDashboardData(true);
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Check if current user is admin
  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setCheckingAdmin(false);
        return;
      }

      // Use the backend API URL instead of relative frontend URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/admin/gamification/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setIsAdmin(response.ok);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Handle settings click
  const handleSettings = () => {
    // For now, just show a toast with upcoming features
    showToast('Settings panel coming soon! Customize your gamification experience.', 'info');
  };

  // Handle admin debug click
  const handleAdminDebug = () => {
    router.push('/debug/admin');
  };

  // Handle quick actions
  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'daily-checkin':
          // Check if already claimed
          if (dashboardData.dailyLoginStatus?.hasClaimedToday) {
            showToast('Daily reward already claimed today!', 'info');
            return;
          }
          
          // Attempt to claim if not already claimed
          try {
            const result = await gamificationService.claimDailyLoginReward();
            const pointsEarned = result?.points || dashboardData.dailyLoginStatus?.todayReward || 12;
            showToast(`Daily login reward claimed! +${pointsEarned} points`, 'success');
            fetchDashboardData(true);
          } catch (error: any) {
            // Log differently based on error type for better debugging
            if (error.message && error.message.toLowerCase().includes('already claimed')) {
              console.log('Daily check-in: Already claimed today');
            } else {
              console.error('Daily check-in error:', error);
            }
            
            // Handle different error response structures
            let errorMessage = 'Unable to claim daily reward';
            
            // Check if error has response data with message (from API)
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
            // Check if error has message property directly
            else if (error.message) {
              errorMessage = error.message;
            }
            // Check if error is a string
            else if (typeof error === 'string') {
              errorMessage = error;
            }
            
            // Show appropriate toast based on error message
            if (errorMessage.toLowerCase().includes('already claimed')) {
              showToast(errorMessage, 'info');
            } else {
              showToast(errorMessage, 'error');
            }
          }
          break;
          
        case 'view-challenges':
          // Navigate to challenges page
          router.push('/gamification/challenges');
          break;
          
        case 'redeem-rewards':
          // Navigate to rewards page  
          router.push('/gamification/rewards');
          break;

        case 'view-achievements':
          // Navigate to achievements page
          router.push('/gamification/achievements');
          break;

        case 'view-badges':
          // Navigate to badges page
          router.push('/gamification/badges');
          break;

        case 'view-history':
          // Navigate to point history page
          router.push('/gamification/history');
          break;

        case 'view-leaderboard':
          // Navigate to leaderboard page
          router.push('/gamification/leaderboard');
          break;

        case 'daily-checkin-page':
          // Navigate to daily check-in page
          router.push('/gamification/daily-checkin');
          break;

        case 'view-notifications':
          // Navigate to notifications page
          router.push('/gamification/notifications');
          break;

        case 'view-analytics':
          // Navigate to analytics page
          router.push('/gamification/analytics');
          break;

        case 'view-social':
          // Navigate to social page
          router.push('/gamification/social');
          break;
      }
    } catch (err: any) {
      console.error('Quick action failed:', err);
      
      // Handle different error response structures
      let errorMessage = 'Action failed. Please try again.';
      
      // Check if error has response data with message (from API)
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      // Check if error has message property directly
      else if (err.message) {
        errorMessage = err.message;
      }
      // Check if error is a string
      else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Show appropriate toast based on error message
      if (errorMessage.toLowerCase().includes('already claimed')) {
        showToast(errorMessage, 'info');
      } else {
        showToast(errorMessage, 'error');
      }
    }
  };

  // Calculate level progress percentage
  const getLevelProgress = () => {
    if (!dashboardData.userProgress) return 0;
    
    const { pointsToNextLevel } = dashboardData.userProgress;
    
    // The backend stores CurrentPoints (points in current level) and NextLevelThreshold (points needed for current level)
    // pointsToNextLevel = NextLevelThreshold - CurrentPoints (from AutoMapper)
    // So CurrentPoints = NextLevelThreshold - pointsToNextLevel
    
    // For Level 1: NextLevelThreshold = 100
    // For Level 2: NextLevelThreshold = 100 * 2^1.5 ≈ 283
    // For Level 3: NextLevelThreshold = 100 * 3^1.5 ≈ 520
    
    const currentLevel = dashboardData.userProgress.currentLevel;
    const nextLevelThreshold = Math.round(100 * Math.pow(currentLevel, 1.5));
    const currentPoints = nextLevelThreshold - pointsToNextLevel;
    
    // Calculate progress percentage within current level
    const progressPercentage = Math.round((currentPoints / nextLevelThreshold) * 100);
    
    // Ensure progress is between 0 and 100
    return Math.max(0, Math.min(100, progressPercentage));
  };

  // Transform achievements for display
  const getDisplayAchievements = () => {
    return dashboardData.achievements.slice(0, 4).map(userAch => ({
      id: userAch.achievement.id,
      name: userAch.achievement.name,
      description: userAch.achievement.description,
      earned: userAch.isCompleted,
      rarity: userAch.achievement.difficulty.toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary'
    }));
  };

  // Transform family members leaderboard data (backend already includes all members)
  const getDisplayLeaderboard = () => {
    // Frontend safety deduplication (keep highest scoring entry for each user)
    const userMap = new Map<number, any>();
    dashboardData.familyMembersLeaderboard.forEach((entry) => {
      const existingEntry = userMap.get(entry.userId);
      if (!existingEntry || entry.value > (existingEntry.value || 0)) {
        userMap.set(entry.userId, entry);
      }
    });
    
    // Backend now includes ALL family members from user's families, just transform and sort
    const result = Array.from(userMap.values())
      .map((entry) => ({
        ...entry,
        familyName: 'Family Member',
        isCurrentUser: entry.userId === dashboardData.userProgress?.userId
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
    return result;
  };

  // Get recent activity from various sources
  const getRecentActivity = () => {
    const activities: ActivityItemProps[] = [];

    // Add recent achievements (if any completed)
    const recentAchievements = dashboardData.achievements
      .filter(ua => ua.isCompleted && ua.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 2);

    recentAchievements.forEach(achievement => {
      activities.push({
        type: 'achievement',
        title: 'Achievement unlocked',
        description: `"${achievement.achievement.name}"`,
        timeAgo: new Date(achievement.completedAt!).toLocaleDateString(),
        points: achievement.achievement.pointValue
      });
    });

    // Add daily login if claimed today
    if (dashboardData.dailyLoginStatus?.hasClaimedToday) {
      activities.push({
        type: 'login',
        title: 'Daily check-in completed',
        description: 'Maintained your streak',
        timeAgo: 'Today',
        points: dashboardData.dailyLoginStatus.todayReward
      });
    }

    // Add streak milestone if significant
    if (dashboardData.userProgress?.currentStreak && dashboardData.userProgress.currentStreak > 0) {
      activities.push({
        type: 'streak',
        title: 'Streak milestone',
        description: `${dashboardData.userProgress.currentStreak}-day streak achieved`,
        timeAgo: 'Ongoing'
      });
    }

    // If no real activities, add some placeholder
    if (activities.length === 0) {
      activities.push({
        type: 'task',
        title: 'Start your journey',
        description: 'Complete tasks to see your activity here',
        timeAgo: 'Get started',
        points: 0
      });
    }

    return activities.slice(0, 3); // Limit to 3 items
  };

  const claimDailyReward = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await gamificationService.claimDailyLoginReward();
      showToast('Daily reward claimed successfully!', 'success');
      await fetchDashboardData(true); // Refresh all data
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      showToast(error instanceof Error ? error.message : 'Failed to claim daily reward', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveChallenge = async (challengeId: number): Promise<void> => {
    try {
      setIsLoading(true);
      const success = await gamificationService.leaveChallenge(challengeId);
      if (success) {
        showToast('Successfully left the challenge', 'success');
        await fetchDashboardData(true); // Refresh all data
      } else {
        showToast('Failed to leave challenge', 'error');
      }
    } catch (error) {
      console.error('Error leaving challenge:', error);
      showToast(error instanceof Error ? error.message : 'Failed to leave challenge', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId: number): Promise<void> => {
    try {
      setIsLoading(true);
      const redeemedReward = await gamificationService.redeemReward(rewardId);
      showToast(`Successfully redeemed "${redeemedReward.name}"!`, 'success');
      await fetchDashboardData(true); // Refresh all data
    } catch (error) {
      console.error('Error redeeming reward:', error);
      showToast(error instanceof Error ? error.message : 'Failed to redeem reward', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallenge = async (challengeId: number): Promise<void> => {
    try {
      setIsLoading(true);
      const userChallenge = await gamificationService.enrollInChallenge(challengeId);
      showToast(`Successfully joined "${userChallenge.challenge.name}"!`, 'success');
      await fetchDashboardData(true); // Refresh all data
    } catch (error) {
      console.error('Error joining challenge:', error);
      showToast(error instanceof Error ? error.message : 'Failed to join challenge', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Error state
  if (error && !dashboardData.userProgress ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Gamification Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track your progress, earn rewards, and compete with others</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              {isAdmin && !checkingAdmin && (
                <button 
                  onClick={handleAdminDebug}
                  className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm hover:shadow-md transition-all group"
                  title="Admin Debug Panel"
                >
                  <Shield className="h-4 w-4 text-red-600 group-hover:text-red-700" />
                </button>
              )}
              <button 
                onClick={handleSettings}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title="Settings"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Live</span>
              </div>
            </div>
          </div>
          
          {/* Temporary Auth Debug Panel */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4">
              <AuthDebug />
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Points"
            value={dashboardData.userProgress?.totalPoints.toLocaleString() || '0'}
            icon={<Star className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-yellow-400 to-orange-500"
            trend={12}
            isLoading={isLoading}
          />
          <StatsCard
            title="Day Streak"
            value={dashboardData.userProgress?.currentStreak.toString() || '0'}
            icon={<Flame className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-orange-400 to-red-500"
            trend={8}
            isLoading={isLoading}
          />
          <StatsCard
            title="Current Level"
            value={`Level ${dashboardData.userProgress?.currentLevel || 1}`}
            icon={<Award className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-purple-400 to-indigo-500"
            isLoading={isLoading}
          />
          <StatsCard
            title="Tasks Done"
            value={dashboardData.userProgress?.tasksCompleted.toString() || '0'}
            icon={<CheckCircle className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-green-400 to-emerald-500"
            trend={5}
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Level Progress */}
            <LevelProgress 
              currentLevel={dashboardData.userProgress?.currentLevel || 1}
              progress={getLevelProgress()}
              pointsToNext={dashboardData.userProgress?.pointsToNextLevel || 0}
              isLoading={isLoading}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickAction
                  title="Daily Check-in"
                  description={dashboardData.dailyLoginStatus?.hasClaimedToday ? "✓ Claimed today!" : `Earn ${dashboardData.dailyLoginStatus?.todayReward || 12} points`}
                  bgColor={dashboardData.dailyLoginStatus?.hasClaimedToday ? "bg-gray-50" : "bg-blue-50"}
                  hoverColor={dashboardData.dailyLoginStatus?.hasClaimedToday ? "hover:bg-gray-100" : "hover:bg-blue-100"}
                  textColor={dashboardData.dailyLoginStatus?.hasClaimedToday ? "text-gray-500" : "text-blue-900"}
                  onClick={() => handleQuickAction('daily-checkin')}
                  disabled={dashboardData.dailyLoginStatus?.hasClaimedToday}
                />
                <QuickAction
                  title="View Challenges"
                  description="Epic challenges await!"
                  bgColor="bg-purple-50"
                  hoverColor="hover:bg-purple-100"
                  textColor="text-purple-900"
                  onClick={() => handleQuickAction('view-challenges')}
                />
                <QuickAction
                  title="Redeem Rewards"
                  description="Amazing rewards available!"
                  bgColor="bg-green-50"
                  hoverColor="hover:bg-green-100"
                  textColor="text-green-900"
                  onClick={() => handleQuickAction('redeem-rewards')}
                />
                <QuickAction
                  title="View All Achievements"
                  description="See your progress & badges"
                  bgColor="bg-amber-50"
                  hoverColor="hover:bg-amber-100"
                  textColor="text-amber-900"
                  onClick={() => handleQuickAction('view-achievements')}
                />
                <QuickAction
                  title="View Badge Collection"
                  description="Manage your earned badges"
                  bgColor="bg-indigo-50"
                  hoverColor="hover:bg-indigo-100"
                  textColor="text-indigo-900"
                  onClick={() => handleQuickAction('view-badges')}
                />
                <QuickAction
                  title="Point History"
                  description="Track your point transactions"
                  bgColor="bg-slate-50"
                  hoverColor="hover:bg-slate-100"
                  textColor="text-slate-900"
                  onClick={() => handleQuickAction('view-history')}
                />
                <QuickAction
                  title="View Leaderboard"
                  description="See global & family rankings"
                  bgColor="bg-yellow-50"
                  hoverColor="hover:bg-yellow-100"
                  textColor="text-yellow-900"
                  onClick={() => handleQuickAction('view-leaderboard')}
                />
                <QuickAction
                  title="Daily Check-in Hub"
                  description="Calendar & streak tracking"
                  bgColor="bg-orange-50"
                  hoverColor="hover:bg-orange-100"
                  textColor="text-orange-900"
                  onClick={() => handleQuickAction('daily-checkin-page')}
                />
                <QuickAction
                  title="View Notifications"
                  description="Manage your notifications"
                  bgColor="bg-pink-50"
                  hoverColor="hover:bg-pink-100"
                  textColor="text-pink-900"
                  onClick={() => handleQuickAction('view-notifications')}
                />
                <QuickAction
                  title="Analytics Dashboard"
                  description="Deep insights & performance"
                  bgColor="bg-cyan-50"
                  hoverColor="hover:bg-cyan-100"
                  textColor="text-cyan-900"
                  onClick={() => handleQuickAction('view-analytics')}
                />
                <QuickAction
                  title="Social Hub"
                  description="Connect & share achievements"
                  bgColor="bg-emerald-50"
                  hoverColor="hover:bg-emerald-100"
                  textColor="text-emerald-900"
                  onClick={() => handleQuickAction('view-social')}
                />
                {isAdmin && !checkingAdmin && (
                  <QuickAction
                    title="Admin Debug Panel"
                    description="Reset & debug gamification"
                    bgColor="bg-red-50"
                    hoverColor="hover:bg-red-100"
                    textColor="text-red-900"
                    onClick={handleAdminDebug}
                  />
                )}
              </div>
            </div>

            {/* Available Rewards */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Available Rewards
                </h3>
                <Link href="/gamification/rewards" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={`reward-${i}`} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
                  ))}
                </div>
              ) : dashboardData.availableRewards.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.availableRewards.slice(0, 3).map((reward) => (
                    <RewardCard 
                      key={reward.id} 
                      reward={reward} 
                      onRedeem={redeemReward} 
                      userPoints={dashboardData.userProgress?.totalPoints || 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No rewards available</p>
                  <Link href="/gamification/rewards" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Check for new rewards
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </h3>
                <Link href="/gamification/achievements" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={`achievement-${i}`} className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
                  ))}
                </div>
              ) : getDisplayAchievements().length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {getDisplayAchievements().map((achievement) => (
                    <AchievementBadge key={`achievement-${achievement.id}`} achievement={achievement} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No achievements yet</p>
                  <Link href="/gamification/achievements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Explore Available Achievements
                  </Link>
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Recent Activity
              </h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={`activity-${i}`} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 w-48 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentActivity().map((activity, index) => (
                    <ActivityItem
                      key={`activity-${index}`}
                      type={activity.type}
                      title={activity.title}
                      description={activity.description}
                      timeAgo={activity.timeAgo}
                      points={activity.points}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Available Challenges */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Join New Challenges
                </h3>
                <Link 
                  href="/gamification/challenges"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={`challenge-${i}`} className="animate-pulse bg-gray-100 rounded-xl h-32"></div>
                  ))}
                </div>
              ) : dashboardData.availableChallenges.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.availableChallenges.slice(0, 3).map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      onJoin={joinChallenge} 
                      activeChallengeCount={dashboardData.activeChallenges.length}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No challenges available</p>
                  <Link 
                    href="/gamification/challenges"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Browse Challenges
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Daily Login Section */}
            {dashboardData.dailyLoginStatus && (
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Daily Check-in</h2>
                    <p className="text-emerald-100 mb-4">
                      Current streak: {dashboardData.dailyLoginStatus.currentStreak} days
                    </p>
                    <p className="text-emerald-100">
                      Today's reward: {dashboardData.dailyLoginStatus.todayReward} points
                    </p>
                  </div>
                  <div className="text-center">
                    {dashboardData.dailyLoginStatus.hasClaimedToday ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-emerald-200 mb-2" />
                        <span className="text-emerald-100">Claimed!</span>
                      </div>
                    ) : (
                      <button
                        onClick={claimDailyReward}
                        disabled={isLoading}
                        className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Claiming...' : 'Claim Reward'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Active Challenges Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Challenges</h2>
                    <p className="text-gray-600 text-sm">
                      {dashboardData.activeChallenges.length}/2 challenge slots used
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-red-500 space-y-1">
                        <p>Debug: {JSON.stringify(dashboardData.activeChallenges.length)} challenges loaded</p>
                        <p>Debug: Data timestamp: {new Date().toLocaleTimeString()}</p>
                        <p>Debug: Loading: {isLoading ? 'true' : 'false'}</p>
                        <p>Debug: Refreshing: {isRefreshing ? 'true' : 'false'}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchDashboardData(true)}
                    disabled={isRefreshing}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh challenges"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <Link 
                    href="/gamification/challenges"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Browse Challenges
                  </Link>
                </div>
              </div>

              {dashboardData.activeChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Challenges</h3>
                  <p className="text-gray-600 mb-4">
                    Join up to 2 challenges to earn extra points and test your skills!
                  </p>
                  <Link 
                    href="/gamification/challenges"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Browse Challenges
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {dashboardData.activeChallenges.map((challenge) => (
                    <ActiveChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onLeave={leaveChallenge}
                    />
                  ))}
                  
                  {/* Add new challenge card if not at limit */}
                  {dashboardData.activeChallenges.length < 2 && (
                    <Link
                      href="/gamification/challenges"
                      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                    >
                      <Plus className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
                      <span className="font-medium text-gray-600 group-hover:text-purple-600">
                        Join Another Challenge
                      </span>
                      <span className="text-sm text-gray-500 group-hover:text-purple-500">
                        {2 - dashboardData.activeChallenges.length} slot{2 - dashboardData.activeChallenges.length !== 1 ? 's' : ''} available
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Combined Leaderboard (Global + Family) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Leaderboard
                  {dashboardData.familyMembersLeaderboard.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Family</span>
                  )}
                </h3>
                <Link 
                  href="/gamification/leaderboard"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View Full
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`leaderboard-${i}`} className="animate-pulse flex items-center p-4 bg-gray-100 rounded-xl">
                      <div className="w-8 h-8 bg-gray-300 rounded-lg mr-4"></div>
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-300 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-16 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-12 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {getDisplayLeaderboard().slice(0, 5).map((entry, index) => (
                    <LeaderboardEntryComponent key={`leaderboard-${entry.userId}-rank-${entry.rank}-${index}`} entry={entry} />
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Earn More Points
              </h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={`suggestion-${i}`} className="animate-pulse p-4 bg-gray-100 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 w-48 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-12 h-6 bg-gray-300 rounded"></div>
                      </div>
                      <div className="w-full h-8 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : dashboardData.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.suggestions.slice(0, 3).map((suggestion) => (
                    <SuggestionCard key={`suggestion-${suggestion.id}`} suggestion={suggestion} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm">Complete more tasks to get personalized suggestions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}