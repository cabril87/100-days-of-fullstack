'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Zap, 
  Star, 
  Calendar,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { focusService } from '@/lib/services/focusService';
import { FocusStreakData } from '@/lib/types/focus';

interface FocusStreakCounterProps {
  className?: string;
  compact?: boolean;
}

export function FocusStreakCounter({ className, compact = false }: FocusStreakCounterProps) {
  const [streakData, setStreakData] = useState<FocusStreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await focusService.getProductivityInsights();
      
      if (response.data && response.data.streakData) {
        setStreakData(response.data.streakData);
      } else {
        setError('No streak data available. Complete some focus sessions first.');
        setStreakData(null);
      }
    } catch (err) {
      console.error('Error loading streak data:', err);
      setError('Failed to load streak data. Please try again.');
      setStreakData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (streak >= 14) return <Flame className="h-5 w-5 text-orange-500" />;
    if (streak >= 7) return <Zap className="h-5 w-5 text-blue-500" />;
    if (streak >= 3) return <Star className="h-5 w-5 text-purple-500" />;
    return <Calendar className="h-5 w-5 text-gray-500" />;
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary focus master! 🏆";
    if (streak >= 14) return "You're on fire! 🔥";
    if (streak >= 7) return "Great momentum! ⚡";
    if (streak >= 3) return "Building a habit! ⭐";
    if (streak >= 1) return "Good start! 📅";
    return "Start your streak today!";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-yellow-600";
    if (streak >= 14) return "text-orange-600";
    if (streak >= 7) return "text-blue-600";
    if (streak >= 3) return "text-purple-600";
    return "text-gray-600";
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return { target: 3, label: "Habit Builder" };
    if (streak < 7) return { target: 7, label: "Week Warrior" };
    if (streak < 14) return { target: 14, label: "Flame Keeper" };
    if (streak < 30) return { target: 30, label: "Focus Master" };
    if (streak < 60) return { target: 60, label: "Dedication Legend" };
    return { target: 100, label: "Ultimate Focus" };
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-xl"></div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-600 opacity-[0.05] rounded-full blur-xl"></div>
        
        <div className="relative z-10 p-6">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-200 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-medium text-red-800 mb-2">Streak Data Unavailable</h3>
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={loadStreakData}
              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-xl"></div>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gray-600 opacity-[0.05] rounded-full blur-xl"></div>
        
        <div className="relative z-10 p-6">
          <div className="text-center text-gray-500">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium">Complete focus sessions to start your streak!</p>
          </div>
        </div>
      </div>
    );
  }

  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const progressToNext = (streakData.currentStreak / nextMilestone.target) * 100;

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`p-2 rounded-lg shadow-md ${
          streakData.currentStreak >= 30 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
          streakData.currentStreak >= 14 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
          streakData.currentStreak >= 7 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
          streakData.currentStreak >= 3 ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
          'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
        }`}>
        {getStreakIcon(streakData.currentStreak)}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-lg ${getStreakColor(streakData.currentStreak)}`}>
              {streakData.currentStreak}
            </span>
            <Badge variant="outline" className="text-xs bg-white border-gray-300">
              {streakData.currentStreak === 1 ? 'day' : 'days'}
            </Badge>
          </div>
          <p className="text-xs text-gray-600">
            {getStreakMessage(streakData.currentStreak)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Decorative background elements */}
      <div className={`absolute -top-10 -right-10 w-20 h-20 opacity-[0.05] rounded-full blur-xl ${
        streakData.currentStreak >= 30 ? 'bg-yellow-600' :
        streakData.currentStreak >= 14 ? 'bg-orange-600' :
        streakData.currentStreak >= 7 ? 'bg-blue-600' :
        streakData.currentStreak >= 3 ? 'bg-purple-600' :
        'bg-gray-600'
      }`}></div>
      
      {/* Dynamic gradient accent based on streak level */}
      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-xl ${
        streakData.currentStreak >= 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
        streakData.currentStreak >= 14 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
        streakData.currentStreak >= 7 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        streakData.currentStreak >= 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
        'bg-gradient-to-r from-gray-400 to-gray-500'
      }`}></div>
      
      <div className="relative z-10 p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-3">
          <h3 className="text-sm font-medium text-gray-600">Focus Streak</h3>
          <div className={`p-2 rounded-lg shadow-md ${
            streakData.currentStreak >= 30 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
            streakData.currentStreak >= 14 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
            streakData.currentStreak >= 7 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
            streakData.currentStreak >= 3 ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
            'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
          }`}>
        {getStreakIcon(streakData.currentStreak)}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Current Streak */}
          <div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                streakData.currentStreak >= 30 ? 'from-yellow-600 to-yellow-700' :
                streakData.currentStreak >= 14 ? 'from-orange-600 to-orange-700' :
                streakData.currentStreak >= 7 ? 'from-blue-600 to-blue-700' :
                streakData.currentStreak >= 3 ? 'from-purple-600 to-purple-700' :
                'from-gray-600 to-gray-700'
              }`}>
                {streakData.currentStreak}
              </span>
              <span className="text-sm text-gray-600">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {getStreakMessage(streakData.currentStreak)}
            </p>
          </div>

          {/* Progress to Next Milestone */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span className="font-medium">Next: {nextMilestone.label}</span>
              <span className="font-semibold">{streakData.currentStreak}/{nextMilestone.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  streakData.currentStreak >= 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  streakData.currentStreak >= 14 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  streakData.currentStreak >= 7 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  streakData.currentStreak >= 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-sm font-medium text-blue-900">Longest</div>
              <div className="text-lg font-bold text-blue-700">
                {streakData.longestStreak}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="text-sm font-medium text-yellow-900">Quality</div>
              <div className="text-lg font-bold text-yellow-700">
                {streakData.qualityStreak}
              </div>
            </div>
          </div>

          {/* Impact */}
          {streakData.streakImpactOnProductivity !== 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                <span className="text-sm">
                    <span className="font-semibold text-green-700">
                    {streakData.streakImpactOnProductivity > 0 ? '+' : ''}
                    {streakData.streakImpactOnProductivity.toFixed(1)}%
                    </span>
                    <span className="text-gray-600 ml-1">productivity impact</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 