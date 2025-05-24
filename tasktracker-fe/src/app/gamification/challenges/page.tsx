'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  Flame,
  Award,
  Zap,
  Timer,
  BarChart3,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';
import type { Challenge, UserActiveChallenge } from '@/lib/types/gamification';

export default function ChallengesPage(): React.ReactElement {
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<UserActiveChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchChallenges();
    fetchDebugInfo();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      console.log('Fetching challenges...');
      
      // Fetch both available and active challenges
      const [available, active] = await Promise.all([
        gamificationService.getActiveChallenges(),
        gamificationService.getUserActiveChallenges()
      ]);
      
      console.log('Available challenges:', available);
      console.log('Active challenges:', active);
      
      setAvailableChallenges(available || []);
      setActiveChallenges(active || []);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      
      // Show specific error message
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          showToast('Please log in to view challenges', 'error');
        } else {
          showToast(`Error: ${error.message}`, 'error');
        }
      } else {
      showToast('Failed to load challenges', 'error');
      }
      setAvailableChallenges([]);
      setActiveChallenges([]);
    } finally {
      setLoading(false);
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

  const testApi = async () => {
    try {
      console.log('Testing Challenges API endpoints...');
      
      // Test challenges endpoint directly
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Test available challenges
      const availableResponse = await fetch('http://localhost:5000/api/v1/gamification/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Available challenges API response status:', availableResponse.status);
      
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        console.log('Available challenges data:', availableData);
        showToast(`Found ${availableData.length || 0} available challenges!`, 'success');
      } else {
        const errorText = await availableResponse.text();
        console.error('Available challenges API error:', errorText);
        showToast(`Available Challenges Error: ${availableResponse.status} - ${errorText}`, 'error');
      }

      // Test user challenges
      const userResponse = await fetch('http://localhost:5000/api/v1/gamification/user-challenges', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User challenges API response status:', userResponse.status);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User challenges data:', userData);
        showToast(`Found ${userData.length || 0} user challenges!`, 'info');
      } else {
        const errorText = await userResponse.text();
        console.error('User challenges API error:', errorText);
        showToast(`User Challenges Error: ${userResponse.status} - ${errorText}`, 'error');
      }
    } catch (error) {
      console.error('Test Challenges API error:', error);
      showToast(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    if (activeChallenges.length >= 2) {
      showToast('You can only join 2 challenges at a time', 'error');
      return;
    }

    try {
      setActionLoading(challengeId);
      console.log(`Attempting to join challenge ${challengeId}...`);

      const result = await gamificationService.enrollInChallenge(challengeId);
      console.log('Join challenge result:', result);
      
      showToast('Successfully joined challenge!', 'success');
      await fetchChallenges(); // Refresh data
    } catch (error: any) {
      console.error('Failed to join challenge:', error);
      
      // Show specific error message
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          showToast('Please log in to join challenges', 'error');
        } else if (error.message.includes('already enrolled')) {
          showToast('You are already enrolled in this challenge', 'info');
        } else if (error.message.includes('limit')) {
          showToast('Challenge enrollment limit reached', 'error');
        } else {
          showToast(`Error: ${error.message}`, 'error');
        }
      } else {
        showToast('Failed to join challenge', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveChallenge = async (challengeId: number) => {
    try {
      setActionLoading(challengeId);
      await gamificationService.leaveChallenge(challengeId);
      showToast('Successfully left challenge', 'success');
      await fetchChallenges(); // Refresh data
    } catch (error: any) {
      console.error('Failed to leave challenge:', error);
      showToast(error.message || 'Failed to leave challenge', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getDifficultyLabel = (difficulty: number): string => {
      switch (difficulty) {
        case 1: return 'Very Easy';
        case 2: return 'Easy';
        case 3: return 'Medium';
        case 4: return 'Hard';
        case 5: return 'Very Hard';
        default: return 'Medium';
      }
  };

  const getDifficultyColor = (difficulty: number) => {
      switch (difficulty) {
      case 1:
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 4:
      case 5:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category?: string) => {
    const cat = (category || 'general').toLowerCase();
    switch (cat) {
      case 'tasks': return <CheckCircle className="h-5 w-5" />;
      case 'daily': return <Calendar className="h-5 w-5" />;
      case 'family': return <Users className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const formatEndDate = (endDate?: string) => {
    if (!endDate) return 'No deadline';
    const date = new Date(endDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    return `${diffDays} days left`;
  };

  // Filter challenges based on active tab
  const getFilteredContent = () => {
    switch (activeFilter) {
      case 'active':
        return activeChallenges.filter(challenge => challenge.progressPercentage < 100);
      case 'completed':
        return activeChallenges.filter(challenge => challenge.progressPercentage >= 100);
      case 'all':
      default:
        return availableChallenges;
    }
  };

  const filteredContent = getFilteredContent();

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
                Challenges
              </h1>
              <p className="text-gray-600 mt-1">Complete challenges to earn points and unlock achievements</p>
            </div>
            <button
              onClick={fetchChallenges}
              disabled={loading}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              title="Refresh challenges"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Challenge Stats */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{activeChallenges.length}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeChallenges.filter(c => c.progressPercentage >= 100).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{availableChallenges.length}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Challenge Slots</div>
                <div className="text-lg font-semibold">
                  <span className={activeChallenges.length >= 2 ? 'text-red-600' : 'text-green-600'}>
                    {activeChallenges.length}/2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map(filter => (
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
                {filter === 'active' && ` (${activeChallenges.filter(c => c.progressPercentage < 100).length})`}
                {filter === 'completed' && ` (${activeChallenges.filter(c => c.progressPercentage >= 100).length})`}
                {filter === 'all' && ` (${availableChallenges.length})`}
              </button>
            ))}
          </div>

          {/* Debug Info (development only) */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Debug Information</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>Auth Token: {debugInfo.hasToken ? '✅ Present' : '❌ Missing'}</p>
                <p>User: {debugInfo.user?.username || 'Not logged in'}</p>
                <p>Available Challenges: {availableChallenges.length}</p>
                <p>Active Challenges: {activeChallenges.length}</p>
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
                  onClick={fetchChallenges}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  Reload Challenges
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

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeFilter === 'active' && 'No Active Challenges'}
                {activeFilter === 'completed' && 'No Completed Challenges'}
                {activeFilter === 'all' && 'No Available Challenges'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeFilter === 'active' && 'Join some challenges to start earning extra points!'}
                {activeFilter === 'completed' && 'Complete some challenges to see them here.'}
                {activeFilter === 'all' && 'Check back later for new challenges.'}
              </p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Browse Available Challenges
                </button>
              )}
            </div>
          ) : (
            filteredContent.map((item: any) => {
              // Determine if this is an active challenge or available challenge
              const isActiveChallenge = 'challengeId' in item;
              const challenge = isActiveChallenge ? item : item;
              const challengeId = isActiveChallenge ? item.challengeId : item.id;
              const isEnrolled = activeChallenges.some(ac => ac.challengeId === challengeId);
              const isCompleted = isActiveChallenge && item.progressPercentage >= 100;

              return (
                <div key={challengeId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Challenge Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {getCategoryIcon(isActiveChallenge ? (item.activityType || 'general') : (item.category || 'general'))}
                  </div>
                  <div>
                        <h3 className="font-semibold text-gray-900">
                          {isActiveChallenge ? item.challengeName : item.name}
                        </h3>
                        {(item.difficulty || isActiveChallenge) && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty || 3)}`}>
                            {getDifficultyLabel(item.difficulty || 3)}
                          </span>
                        )}
                  </div>
                </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold">{item.pointReward || item.pointValue || 0}</span>
                      </div>
              </div>
                  </div>

                  {/* Challenge Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {isActiveChallenge ? item.challengeDescription : item.description}
                  </p>

                  {/* Progress Bar (for active challenges) */}
                  {isActiveChallenge && (
                <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                        <span>{item.currentProgress}/{item.targetProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(item.progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.progressPercentage}% complete
                      </div>
                </div>
              )}

                  {/* Challenge Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatEndDate(item.endDate)}</span>
                  </div>
                    {!isActiveChallenge && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{item.targetValue || item.targetCount || 1} {item.activityType || item.category || 'activities'}</span>
                    </div>
                  )}
                </div>

                  {/* Action Button */}
                  <div className="flex gap-2">
                    {isActiveChallenge ? (
                      <>
                        {isCompleted ? (
                          <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center font-medium">
                            <CheckCircle className="h-4 w-4 inline mr-2" />
                    Completed
                  </div>
                        ) : (
                          <button
                            onClick={() => handleLeaveChallenge(challengeId)}
                            disabled={actionLoading === challengeId}
                            className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {actionLoading === challengeId ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                            Leave Challenge
                          </button>
                        )}
                      </>
                ) : (
                  <button
                        onClick={() => handleJoinChallenge(challengeId)}
                        disabled={actionLoading === challengeId || isEnrolled || activeChallenges.length >= 2}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                          isEnrolled 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : activeChallenges.length >= 2
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {actionLoading === challengeId ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : isEnrolled ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Already Joined
                          </>
                        ) : activeChallenges.length >= 2 ? (
                          <>
                            <Target className="h-4 w-4" />
                            Slots Full
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Join Challenge
                          </>
                        )}
                  </button>
                )}
              </div>
            </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 