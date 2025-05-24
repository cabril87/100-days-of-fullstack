'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Flame, 
  Star, 
  Crown, 
  ArrowLeft,
  Trophy,
  CheckCircle,
  Gift,
  Clock,
  TrendingUp,
  Award,
  Target,
  Zap,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';

interface DailyLoginStatus {
  hasClaimedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  todayReward: number;
  totalLogins: number;
  lastLoginDate?: string;
  streakMultiplier: number;
}

interface CheckinCalendarDay {
  date: Date;
  isCheckedIn: boolean;
  reward?: number;
  isToday: boolean;
  isThisMonth: boolean;
}

interface StreakMilestone {
  streak: number;
  reward: number;
  title: string;
  description: string;
  achieved: boolean;
}

export default function DailyCheckinPage(): React.ReactElement {
  const [dailyStatus, setDailyStatus] = useState<DailyLoginStatus | null>(null);
  const [calendarDays, setCalendarDays] = useState<CheckinCalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDailyStatus();
    generateCalendar();
  }, [currentMonth]);

  const fetchDailyStatus = async () => {
    try {
      setLoading(true);
      const status = await gamificationService.getDailyLoginStatus();
      setDailyStatus(status);
    } catch (error) {
      console.error('Failed to fetch daily status:', error);
      showToast('Failed to load daily check-in status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days: CheckinCalendarDay[] = [];
    
    // Add empty days for previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - (firstDayOfWeek - i));
      days.push({
        date,
        isCheckedIn: false,
        isToday: false,
        isThisMonth: false
      });
    }
    
    // Add days for current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isCheckedIn = simulateCheckinStatus(date);
      
      days.push({
        date,
        isCheckedIn,
        reward: isCheckedIn ? getRewardForDate(date) : undefined,
        isToday,
        isThisMonth: true
      });
    }
    
    // Add remaining days to fill the calendar
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCheckedIn: false,
        isToday: false,
        isThisMonth: false
      });
    }
    
    setCalendarDays(days);
  };

  const simulateCheckinStatus = (date: Date) => {
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simulate check-in pattern (some random pattern for demo)
    if (daysDiff < 0) return false; // Future dates
    if (daysDiff === 0) return dailyStatus?.hasClaimedToday || false; // Today
    if (daysDiff <= (dailyStatus?.currentStreak || 0)) return true; // Recent streak
    
    // Random pattern for older dates
    return Math.random() > 0.3;
  };

  const getRewardForDate = (date: Date) => {
    const day = date.getDate();
    const baseReward = 12;
    const bonusReward = day % 7 === 0 ? 5 : 0; // Bonus for weekly check-ins
    return baseReward + bonusReward;
  };

  const handleClaimReward = async () => {
    if (dailyStatus?.hasClaimedToday) {
      showToast('Daily reward already claimed today!', 'info');
      return;
    }

    try {
      setClaiming(true);
      setShowAnimation(true);
      
      const result = await gamificationService.claimDailyLoginReward();
      const pointsEarned = result?.points || dailyStatus?.todayReward || 12;
      
      showToast(`Daily check-in successful! +${pointsEarned} points`, 'success');
      
      // Update status
      setDailyStatus(prev => prev ? {
        ...prev,
        hasClaimedToday: true,
        currentStreak: prev.currentStreak + 1,
        totalLogins: prev.totalLogins + 1,
        lastLoginDate: new Date().toISOString()
      } : null);
      
      // Refresh calendar
      generateCalendar();
      
      setTimeout(() => setShowAnimation(false), 2000);
    } catch (error: any) {
      console.error('Failed to claim daily reward:', error);
      showToast(error.message || 'Failed to claim daily reward', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const getStreakMilestones = (): StreakMilestone[] => {
    const currentStreak = dailyStatus?.currentStreak || 0;
    
    return [
      { streak: 3, reward: 50, title: 'Getting Started', description: '3 days in a row', achieved: currentStreak >= 3 },
      { streak: 7, reward: 100, title: 'Weekly Warrior', description: '1 week streak', achieved: currentStreak >= 7 },
      { streak: 14, reward: 200, title: 'Fortnight Fighter', description: '2 weeks streak', achieved: currentStreak >= 14 },
      { streak: 30, reward: 500, title: 'Monthly Master', description: '1 month streak', achieved: currentStreak >= 30 },
      { streak: 60, reward: 1000, title: 'Dedication Champion', description: '2 months streak', achieved: currentStreak >= 60 },
      { streak: 100, reward: 2000, title: 'Century Achiever', description: '100 days streak', achieved: currentStreak >= 100 },
    ];
  };

  const getNextMilestone = () => {
    const milestones = getStreakMilestones();
    return milestones.find(m => !m.achieved);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '💎';
    if (streak >= 60) return '🔥';
    if (streak >= 30) return '⚡';
    if (streak >= 14) return '🌟';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '🎯';
    return '🌱';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
            <div className="h-48 bg-gray-300 rounded-xl"></div>
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
                Daily Check-in
              </h1>
              <p className="text-gray-600 mt-1">
                Keep your streak alive and earn daily rewards
              </p>
            </div>
            <button
              onClick={fetchDailyStatus}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              title="Refresh status"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Today's Check-in Section */}
        <div className="mb-6">
          <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
            dailyStatus?.hasClaimedToday 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          } text-white`}>
            {/* Animation overlay */}
            {showAnimation && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-80 animate-pulse"></div>
            )}
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {getStreakEmoji(dailyStatus?.currentStreak || 0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {dailyStatus?.hasClaimedToday ? 'Check-in Complete!' : 'Daily Check-in'}
                    </h2>
                    <p className="text-blue-100">
                      {dailyStatus?.hasClaimedToday 
                        ? `You've maintained your ${dailyStatus.currentStreak}-day streak!`
                        : `Claim your ${dailyStatus?.todayReward || 12} points for today`
                      }
                    </p>
                  </div>
                </div>
                
                {!dailyStatus?.hasClaimedToday ? (
                  <button
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {claiming ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Gift className="h-5 w-5" />
                        Check In
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>Claimed!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dailyStatus?.currentStreak || 0}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dailyStatus?.longestStreak || 0}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dailyStatus?.totalLogins || 0}</div>
                <div className="text-sm text-gray-600">Total Check-ins</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dailyStatus?.todayReward || 12}</div>
                <div className="text-sm text-gray-600">Today's Reward</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Check-in Calendar</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-40 text-center">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square p-1 text-center text-sm transition-all duration-200 ${
                      !day.isThisMonth 
                        ? 'text-gray-300' 
                        : day.isToday
                          ? 'bg-blue-600 text-white rounded-lg font-bold'
                          : day.isCheckedIn
                            ? 'bg-green-100 text-green-800 rounded-lg font-semibold hover:bg-green-200'
                            : 'text-gray-700 hover:bg-gray-100 rounded-lg'
                    }`}
                    title={day.isCheckedIn ? `Checked in (+${day.reward} points)` : ''}
                  >
                    <div className="flex items-center justify-center h-full relative">
                      {day.date.getDate()}
                      {day.isCheckedIn && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Checked in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Milestones */}
          <div className="space-y-6">
            {/* Next Milestone */}
            {getNextMilestone() && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Next Milestone
                </h3>
                <div className="text-center">
                  <div className="text-3xl mb-2">{getStreakEmoji(getNextMilestone()!.streak)}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{getNextMilestone()!.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{getNextMilestone()!.description}</p>
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((dailyStatus?.currentStreak || 0) / getNextMilestone()!.streak) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(getNextMilestone()!.streak - (dailyStatus?.currentStreak || 0))} days to go
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-amber-600">
                    <Star className="h-4 w-4" />
                    <span className="font-semibold">{getNextMilestone()!.reward} points</span>
                  </div>
                </div>
              </div>
            )}

            {/* All Milestones */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Streak Milestones
              </h3>
              <div className="space-y-3">
                {getStreakMilestones().map((milestone) => (
                  <div 
                    key={milestone.streak}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      milestone.achieved 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{getStreakEmoji(milestone.streak)}</div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{milestone.title}</div>
                          <div className="text-xs text-gray-600">{milestone.streak} days</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star className="h-3 w-3" />
                          <span className="text-xs font-semibold">{milestone.reward}</span>
                        </div>
                        {milestone.achieved && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 