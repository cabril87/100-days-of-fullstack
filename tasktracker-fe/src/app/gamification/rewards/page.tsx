'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Gift, 
  Star, 
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  Lock,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/providers/AuthContext';

interface Reward {
  id: number;
  name: string;
  description: string;
  pointCost: number;
  category: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isAvailable: boolean;
  isPurchased?: boolean;
  iconPath?: string;
  imageUrl?: string;
  minimumLevel?: number;
  userLevel?: number;
  userPoints?: number;
}

export default function RewardsPage(): React.ReactElement {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'purchased'>('all');
  const [debugInfo, setDebugInfo] = useState<{
    hasToken: boolean;
    tokenPreview: string;
    user: { username?: string } | null;
    timestamp: string;
  } | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.email === 'admin@tasktracker.com' || user?.role === 'Admin';

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching rewards...');
      
      const availableRewards = await gamificationService.getAvailableRewards();
      console.log('Raw rewards data:', availableRewards);
      
      // Convert API rewards to UI format
      const uiRewards: Reward[] = (availableRewards || []).map((reward: unknown) => {
        const rewardData = reward as Record<string, unknown>;
        return {
          id: rewardData.id as number,
          name: rewardData.name as string,
          description: rewardData.description as string,
          pointCost: (rewardData.pointCost as number) || (rewardData.cost as number) || 0,
          category: (rewardData.category as string) || 'General',
          rarity: getRewardRarity(rewardData.category as string),
          isAvailable: (rewardData.isAvailable as boolean) ?? true,
          isPurchased: (rewardData.isPurchased as boolean) || false,
          iconPath: rewardData.iconPath as string,
          imageUrl: rewardData.imageUrl as string,
          minimumLevel: (rewardData.minimumLevel as number) || 1,
          userLevel: rewardData.userLevel as number,
          userPoints: rewardData.userPoints as number
        };
      });
      
      console.log('Processed rewards:', uiRewards);
      setRewards(uiRewards);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      
      // Show specific error message
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          showToast('Please log in to view rewards', 'error');
        } else {
          showToast(`Error: ${error.message}`, 'error');
        }
      } else {
        showToast('Failed to load rewards', 'error');
      }
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchUserPoints = async () => {
    try {
      const userProgress = await gamificationService.getUserProgress();
      setUserPoints(userProgress?.totalPoints || 0);
    } catch (error) {
      console.error('Failed to fetch user points:', error);
      setUserPoints(0);
    }
  };

  const fetchDebugInfo = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      setDebugInfo({
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
        user: user ? JSON.parse(user) : null,
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchUserPoints();
    fetchDebugInfo();
  }, [fetchRewards]);

  const handleRedeemReward = async (rewardId: number, pointCost: number) => {
    if (userPoints < pointCost) {
      showToast('Not enough points to redeem this reward', 'error');
      return;
    }

    try {
      await gamificationService.redeemReward(rewardId);
      showToast('Reward redeemed successfully!', 'success');
      setUserPoints(prev => prev - pointCost);
      
      // Update the reward as purchased
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId 
          ? { ...reward, isPurchased: true, isAvailable: false }
          : reward
      ));
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to redeem reward', 'error');
      }
    }
  };

  const getRewardRarity = (category: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    switch (category?.toLowerCase()) {
      case 'customization': return 'common';
      case 'premium': return 'rare';
      case 'audio': return 'rare';
      case 'character': return 'epic';
      case 'boost': return 'epic';
      case 'elite': return 'legendary';
      case 'legendary': return 'legendary';
      case 'mythic': return 'legendary';
      case 'cosmic': return 'legendary';
      case 'transcendent': return 'legendary';
      case 'collectible': return 'legendary';
      default: return 'common';
    }
  };

  const getRewardIcon = (category: string, iconPath?: string) => {
    // If we have an icon path, we could potentially use it, but for now use emoji fallbacks
    switch (category?.toLowerCase()) {
      case 'customization': return '🎨';
      case 'premium': return '✨';
      case 'audio': return '🔊';
      case 'character': return '🦸';
      case 'boost': return '⚡';
      case 'elite': return '💎';
      case 'legendary': return '🌟';
      case 'mythic': return '🔮';
      case 'cosmic': return '🌌';
      case 'transcendent': return '👑';
      case 'collectible': return '🏆';
      default: return '🎁';
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  const filteredRewards = rewards.filter(reward => {
    const isLevelLocked = reward.minimumLevel && reward.userLevel && reward.userLevel < reward.minimumLevel;
    
    switch (activeFilter) {
      case 'available': 
        // Show rewards that are either unlocked and available, or level-locked (to show what they're working towards)
        return !reward.isPurchased && (reward.isAvailable || isLevelLocked);
      case 'purchased': 
        return reward.isPurchased;
      default: 
        return true;
    }
  });

  const testApi = async () => {
    try {
      console.log('Testing API endpoints...');
      
      // Test simple endpoint first
      const healthCheck = await fetch('/api/health');
      console.log('Health check response:', healthCheck.status);
      
      // Test rewards endpoint directly
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/gamification/rewards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Rewards API response status:', response.status);
      console.log('Rewards API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Rewards API data:', data);
        showToast(`Found ${data.length || 0} rewards!`, 'success');
      } else {
        const errorText = await response.text();
        console.error('Rewards API error:', errorText);
        showToast(`API Error: ${response.status} - ${errorText}`, 'error');
      }
    } catch (error) {
      console.error('Test API error:', error);
      showToast(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-8xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-8xl">
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
                Rewards Store
              </h1>
              <p className="text-gray-600 mt-1">Spend your hard-earned points on amazing rewards</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-sm text-gray-500">Your Points</div>
                  <div className="text-xl font-bold text-gray-900">{userPoints.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'available', 'purchased'] as const).map(filter => (
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
              </button>
            ))}
          </div>

          {/* Debug Info (development only - admin only) */}
          {process.env.NODE_ENV === 'development' && isAdmin && debugInfo && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Debug Information</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>Auth Token: {debugInfo.hasToken ? '✅ Present' : '❌ Missing'}</p>
                <p>User: {debugInfo.user?.username || 'Not logged in'}</p>
                <p>Rewards Count: {rewards.length}</p>
                <p>Last Check: {debugInfo.timestamp}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={testApi}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Test API
                </button>
                <button
                  onClick={fetchRewards}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  Reload Rewards
                </button>
                <button
                  onClick={fetchDebugInfo}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                >
                  Refresh Debug
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map(reward => {
            const canAfford = userPoints >= reward.pointCost;
            const isLevelLocked = reward.minimumLevel && reward.userLevel && reward.userLevel < reward.minimumLevel;
            const isDisabled = reward.isPurchased || (!reward.isAvailable && !isLevelLocked) || (!canAfford && !isLevelLocked);
            
            return (
              <div 
                key={reward.id} 
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-md ${getRarityBorder(reward.rarity)} ${
                  isDisabled || isLevelLocked ? 'opacity-60' : 'hover:scale-105'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${getRarityColor(reward.rarity)} text-white shadow-lg flex items-center justify-center relative`}>
                      <span className="text-3xl">{getRewardIcon(reward.category, reward.iconPath)}</span>
                      {isLevelLocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                          <Lock className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                      <span className="text-xs text-gray-500">{reward.category}</span>
                      {isLevelLocked && (
                        <div className="text-xs text-orange-600 font-medium mt-1">
                          Unlock at Level {reward.minimumLevel}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(reward.rarity)} text-white`}>
                      {reward.rarity?.toUpperCase()}
                    </span>
                    {reward.minimumLevel && (
                      <span className="text-xs text-gray-400">
                        Lv.{reward.minimumLevel}+
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{reward.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="h-4 w-4" />
                    <span className="font-bold text-lg">{reward.pointCost.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">pts</span>
                  </div>

                  {reward.isPurchased ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Owned
                    </div>
                  ) : isLevelLocked ? (
                    <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                      <Lock className="h-4 w-4" />
                      Level {reward.minimumLevel}
                    </div>
                  ) : !canAfford ? (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Coins className="h-4 w-4" />
                      Need {(reward.pointCost - userPoints).toLocaleString()} more
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRedeemReward(reward.id, reward.pointCost)}
                      disabled={isDisabled}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Redeem
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rewards Found</h3>
            <p className="text-gray-600">
              {activeFilter === 'purchased' 
                ? "You haven't purchased any rewards yet." 
                : "No rewards available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 