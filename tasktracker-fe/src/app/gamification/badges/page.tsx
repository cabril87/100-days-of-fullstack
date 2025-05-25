'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Star, 
  Crown, 
  ArrowLeft,
  Award,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Pin,
  RefreshCw,
  Filter,
  Grid,
  List
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';
import type { Badge, UserBadge } from '@/lib/types/gamification';

interface BadgeUI extends Badge {
  isEarned?: boolean;
  awardedAt?: string;
  isDisplayed?: boolean;
  isFeatured?: boolean;
  userBadgeId?: number;
}

export default function BadgesPage(): React.ReactElement {
  const [badges, setBadges] = useState<BadgeUI[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'earned' | 'unearned'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { showToast } = useToast();

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user badges and try to get all badges through different endpoints
      const [userBadgeData, allBadgesByRarity] = await Promise.all([
        gamificationService.getUserBadges(),
        gamificationService.getBadgesByRarity('common') // This should return all badges
      ]);

      // For now, we'll combine the user badges we have with some sample badges
      // In a production system, there would be a dedicated getAllBadges endpoint
      const userBadgeMap = new Map(
        (userBadgeData || []).map((ub: UserBadge) => [ub.badgeId, ub])
      );

      // If we got badges from the rarity endpoint, use those, otherwise create sample data
      let allBadgesData = allBadgesByRarity && allBadgesByRarity.length > 0 ? allBadgesByRarity : [];
      
      // If no badges found from API, generate sample data for demo purposes
      if (allBadgesData.length === 0) {
        allBadgesData = [
          {
            id: 1,
            name: "Warrior",
            description: "Complete 25 tasks with high priority",
            category: "Character",
            iconUrl: "/icons/badges/character-warrior.svg",
            criteria: "Complete 25 high priority tasks",
            rarity: "Common",
            tier: "bronze",
            pointValue: 100,
            colorScheme: "red-bronze",
            displayOrder: 1,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: "Mage",
            description: "Complete 20 learning or research tasks",
            category: "Character", 
            iconUrl: "/icons/badges/character-mage.svg",
            criteria: "Complete 20 learning tasks",
            rarity: "Common",
            tier: "bronze",
            pointValue: 100,
            colorScheme: "blue-bronze",
            displayOrder: 2,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 17,
            name: "Fire Starter",
            description: "Maintain a 7-day task completion streak",
            category: "Streak",
            iconUrl: "/icons/badges/streak-fire-starter.svg",
            criteria: "7 day completion streak",
            rarity: "Common",
            tier: "bronze",
            pointValue: 100,
            colorScheme: "orange-bronze",
            displayOrder: 17,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 30,
            name: "Centurion", 
            description: "Complete 100 total tasks",
            category: "Milestone",
            iconUrl: "/icons/badges/milestone-centurion.svg",
            criteria: "Complete 100 total tasks",
            rarity: "Common",
            tier: "bronze",
            pointValue: 200,
            colorScheme: "bronze-bronze",
            displayOrder: 30,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 7,
            name: "Elite Warrior",
            description: "Complete 100 high priority tasks",
            category: "Character",
            iconUrl: "/icons/badges/character-warrior-silver.svg",
            criteria: "Complete 100 high priority tasks",
            rarity: "Rare",
            tier: "silver",
            pointValue: 250,
            colorScheme: "red-silver",
            displayOrder: 7,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 24,
            name: "Speed Demon",
            description: "Complete 50 tasks in under 15 minutes each",
            category: "Speed",
            iconUrl: "/icons/badges/speed-demon.svg",
            criteria: "Complete 50 tasks under 15 minutes each",
            rarity: "Epic",
            tier: "gold",
            pointValue: 400,
            colorScheme: "red-gold",
            displayOrder: 24,
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];
      }

      // Combine all badges with user badge data
      const combinedBadges: BadgeUI[] = allBadgesData.map((badge: Badge) => {
        const userBadge = userBadgeMap.get(badge.id);
        return {
          ...badge,
          isEarned: !!userBadge,
          awardedAt: userBadge?.awardedAt,
          isDisplayed: userBadge?.isDisplayed,
          isFeatured: userBadge?.isFeatured,
          userBadgeId: userBadge?.id
        };
      });

      setBadges(combinedBadges);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      showToast('Failed to load badges', 'error');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleToggleDisplay = async (badgeId: number, userBadgeId: number, currentDisplay: boolean) => {
    try {
      setActionLoading(badgeId);
      await gamificationService.toggleBadgeDisplay({ 
        badgeId: userBadgeId, 
        isDisplayed: !currentDisplay 
      });
      
      showToast(
        !currentDisplay ? 'Badge will now be displayed on your profile' : 'Badge hidden from your profile',
        'success'
      );
      
      await fetchBadges(); // Refresh data
    } catch (error: unknown) {
      console.error('Failed to toggle badge display:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update badge display';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
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

  const getTierIcon = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze': return <Award className="h-5 w-5" />;
      case 'silver': return <Shield className="h-5 w-5" />;
      case 'gold': return <Crown className="h-5 w-5" />;
      case 'platinum': return <Star className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'productivity': return <Trophy className="h-5 w-5" />;
      case 'streaks': return <Star className="h-5 w-5" />;
      case 'social': return <Crown className="h-5 w-5" />;
      case 'milestone': return <Award className="h-5 w-5" />;
      case 'speed': return <Shield className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(badges.map(badge => badge.category).filter(Boolean))];

  // Filter badges
  const filteredBadges = badges.filter(badge => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'earned' && badge.isEarned) ||
      (activeFilter === 'unearned' && !badge.isEarned);
    
    const matchesCategory = categoryFilter === 'all' || badge.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  // Group badges by category for display
  const badgesByCategory = filteredBadges.reduce((acc, badge) => {
    const category = badge.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, BadgeUI[]>);

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
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Badge Collection
              </h1>
              <p className="text-gray-600 mt-1">
                {badges.filter(b => b.isEarned).length} of {badges.length} badges earned
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? <List className="h-5 w-5 text-gray-600" /> : <Grid className="h-5 w-5 text-gray-600" />}
              </button>
              <button
                onClick={fetchBadges}
                disabled={loading}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title="Refresh badges"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{badges.filter(b => b.isEarned).length}</div>
                <div className="text-sm text-gray-600">Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{badges.filter(b => b.isEarned && b.isDisplayed).length}</div>
                <div className="text-sm text-gray-600">Displayed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{badges.filter(b => b.isEarned && b.isFeatured).length}</div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((badges.filter(b => b.isEarned).length / badges.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              {(['all', 'earned', 'unearned'] as const).map(filter => (
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
                    ({filter === 'all' ? badges.length : 
                      filter === 'earned' ? badges.filter(b => b.isEarned).length :
                      badges.filter(b => !b.isEarned).length})
                  </span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Badges Display */}
        {Object.keys(badgesByCategory).length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Badges Found</h3>
            <p className="text-gray-600 mb-4">
              {activeFilter === 'earned' && 'You haven\'t earned any badges yet. Complete tasks and challenges to earn your first badge!'}
              {activeFilter === 'unearned' && 'All badges have been earned! You\'re a badge master!'}
              {activeFilter === 'all' && 'No badges available to display.'}
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                View All Badges
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                    <p className="text-sm text-gray-600">
                      {categoryBadges.filter(b => b.isEarned).length} of {categoryBadges.length} earned
                    </p>
                  </div>
                </div>

                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {categoryBadges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 ${
                        badge.isEarned 
                          ? `${getRarityBorder(badge.rarity)} hover:shadow-md` 
                          : 'border-gray-200 opacity-60'
                      } ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}
                    >
                      {/* Badge Icon */}
                      <div className={`relative ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center ${
                          badge.isEarned ? 'shadow-lg' : 'grayscale'
                        }`}>
                          {getTierIcon(badge.tier)}
                        </div>
                        {!badge.isEarned && (
                          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                            <Lock className="h-6 w-6 text-white" />
                          </div>
                        )}
                        {badge.isEarned && badge.isFeatured && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                            <Pin className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Badge Info */}
                      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                          {badge.rarity && (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              badge.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                              badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {badge.rarity}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-3">{badge.description}</p>

                        {badge.criteria && (
                          <p className="text-xs text-gray-500 mb-3 italic">&ldquo;{badge.criteria}&rdquo;</p>
                        )}

                        {badge.isEarned && badge.awardedAt && (
                          <p className="text-xs text-green-600 mb-3">
                            Earned {new Date(badge.awardedAt).toLocaleDateString()}
                          </p>
                        )}

                        {/* Action Buttons */}
                        {badge.isEarned && badge.userBadgeId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleDisplay(badge.id, badge.userBadgeId!, badge.isDisplayed || false)}
                              disabled={actionLoading === badge.id}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                badge.isDisplayed 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title={badge.isDisplayed ? 'Hide from profile' : 'Show on profile'}
                            >
                              {actionLoading === badge.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : badge.isDisplayed ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                              {badge.isDisplayed ? 'Displayed' : 'Hidden'}
                            </button>
                            
                            {badge.pointValue > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs">
                                <Star className="h-3 w-3" />
                                {badge.pointValue}
                              </div>
                            )}
                          </div>
                        )}

                        {!badge.isEarned && badge.pointValue > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                            <Star className="h-3 w-3" />
                            {badge.pointValue} points
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 