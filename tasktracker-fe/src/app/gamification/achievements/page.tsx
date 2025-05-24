'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Crown, 
  ArrowLeft,
  Award,
  CheckCircle,
  Lock,
  Calendar,
  Target,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';

interface AchievementUI {
  id: number;
  name: string;
  description: string;
  pointValue: number;
  category: string;
  iconUrl?: string;
  tier?: string;
  rarity?: string;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export default function AchievementsPage(): React.ReactElement {
  const [achievements, setAchievements] = useState<AchievementUI[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Fetch both available achievements and user achievements
      const [availableAchievements, userAchievementData] = await Promise.all([
        gamificationService.getAvailableAchievements(),
        gamificationService.getUserAchievements()
      ]);

      // Create a map of user achievements for quick lookup
      const userAchievementMap = new Map(
        (userAchievementData || []).map((ua: any) => [ua.achievementId || ua.id, ua])
      );

      // Convert and merge achievements
      const uiAchievements: AchievementUI[] = (availableAchievements || []).map((achievement: any) => {
        const userAchievement = userAchievementMap.get(achievement.id);
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          pointValue: achievement.pointValue || achievement.points || 0,
          category: achievement.category || 'General',
          iconUrl: achievement.iconUrl,
          tier: achievement.tier,
          rarity: achievement.rarity,
          isUnlocked: !!userAchievement,
          unlockedAt: userAchievement?.unlockedAt,
          progress: userAchievement?.progress,
          maxProgress: achievement.targetValue || achievement.maxProgress
        };
      });

      setAchievements(uiAchievements);
      setUserAchievements(userAchievementData || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      showToast('Failed to load achievements', 'error');
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getRarityBorder = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'speed': return <Trophy className="h-5 w-5" />;
      case 'streaks': return <Sparkles className="h-5 w-5" />;
      case 'collaboration': return <Crown className="h-5 w-5" />;
      case 'quality': return <Star className="h-5 w-5" />;
      case 'creativity': return <Award className="h-5 w-5" />;
      case 'milestones': return <Target className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    switch (activeFilter) {
      case 'unlocked': return achievement.isUnlocked;
      case 'locked': return !achievement.isUnlocked;
      default: return true;
    }
  });

  // Group achievements by category
  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, AchievementUI[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/gamification"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Achievements
              </h1>
              <p className="text-gray-600 mt-1">
                {achievements.filter(a => a.isUnlocked).length} of {achievements.length} achievements unlocked
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                <span className="ml-1 text-sm">
                  ({filter === 'all' ? achievements.length : 
                    filter === 'unlocked' ? achievements.filter(a => a.isUnlocked).length :
                    achievements.filter(a => !a.isUnlocked).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements by Category */}
        <div className="space-y-8">
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
            <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
                <span className="text-sm font-normal text-gray-500">
                  ({categoryAchievements.length} achievement{categoryAchievements.length !== 1 ? 's' : ''})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      achievement.isUnlocked 
                        ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-white to-gray-50 shadow-sm` 
                        : 'border-gray-200 bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.isUnlocked 
                            ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-md`
                            : 'bg-gray-300 text-gray-500'
                        }`}>
                          {achievement.isUnlocked ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Lock className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${achievement.isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                            {achievement.name}
                          </h3>
                          {achievement.rarity && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              achievement.isUnlocked 
                                ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {achievement.rarity.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className={`text-sm mb-3 ${achievement.isUnlocked ? 'text-gray-600' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>

                    {/* Progress bar for locked achievements */}
                    {!achievement.isUnlocked && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${achievement.isUnlocked ? 'text-amber-500' : 'text-gray-400'}`} />
                        <span className={`font-semibold ${achievement.isUnlocked ? 'text-amber-600' : 'text-gray-500'}`}>
                          {achievement.pointValue}
                        </span>
                        <span className="text-xs text-gray-500">pts</span>
                      </div>

                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Found</h3>
            <p className="text-gray-600">
              {activeFilter === 'unlocked' 
                ? "You haven't unlocked any achievements yet. Keep working to earn your first achievement!" 
                : activeFilter === 'locked'
                ? "All achievements have been unlocked! Congratulations!"
                : "No achievements available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 