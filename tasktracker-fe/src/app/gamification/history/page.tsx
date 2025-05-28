'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Star, 
  Trophy, 
  Target, 
  Gift, 
  Crown, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Award,
  Zap,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { activityService, ActivityItem, ActivityStats } from '@/lib/services/activityService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';



export default function RecentActivityPage(): React.ReactElement {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    totalPoints: 0,
    activitiesToday: 0,
    pointsToday: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch activities and stats in parallel
      const [activitiesResult, statsResult] = await Promise.all([
        activityService.getRecentActivity({
          type: typeFilter !== 'all' ? typeFilter : undefined,
          dateRange: dateFilter !== 'all' ? dateFilter as any : 'all',
          search: searchQuery || undefined,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        }),
        activityService.getActivityStats()
      ]);

      setActivities(activitiesResult.activities);
      setStats(statsResult);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      showToast('Failed to load recent activity', 'error');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [showToast, typeFilter, dateFilter, searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completion': return <CheckCircle className="h-5 w-5" />;
      case 'achievement': return <Trophy className="h-5 w-5" />;
      case 'level_up': return <Crown className="h-5 w-5" />;
      case 'badge': return <Award className="h-5 w-5" />;
      case 'reward': return <Gift className="h-5 w-5" />;
      case 'challenge': return <Target className="h-5 w-5" />;
      case 'login': return <Activity className="h-5 w-5" />;
      case 'streak': return <Zap className="h-5 w-5" />;
      case 'family': return <Users className="h-5 w-5" />;
      case 'points': return <Star className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completion': return 'from-green-500 to-emerald-500';
      case 'achievement': return 'from-yellow-500 to-orange-500';
      case 'level_up': return 'from-purple-500 to-indigo-500';
      case 'badge': return 'from-blue-500 to-cyan-500';
      case 'reward': return 'from-pink-500 to-rose-500';
      case 'challenge': return 'from-red-500 to-orange-500';
      case 'login': return 'from-gray-500 to-slate-500';
      case 'streak': return 'from-amber-500 to-yellow-500';
      case 'family': return 'from-orange-500 to-red-500';
      case 'points': return 'from-blue-500 to-purple-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getFilteredActivities = () => {
    let filtered = [...activities];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= filterDate
      );
    }

    // Sort by timestamp
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredActivities = getFilteredActivities();
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleExpanded = (activityId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedItems(newExpanded);
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const groups: { [key: string]: ActivityItem[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(paginatedActivities);

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
                Recent Activity
              </h1>
              <p className="text-gray-600 mt-1">
                Track your progress and achievements over time
              </p>
            </div>
            <Button onClick={fetchActivities} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalActivities}</div>
              <div className="text-blue-100 text-sm">Total Activities</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Star className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalPoints}</div>
              <div className="text-purple-100 text-sm">Total Points</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.activitiesToday}</div>
              <div className="text-green-100 text-sm">Today</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.pointsToday}</div>
              <div className="text-orange-100 text-sm">Points Today</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.currentStreak}</div>
              <div className="text-yellow-100 text-sm">Current Streak</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.longestStreak}</div>
              <div className="text-red-100 text-sm">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="pt-6 relative z-10">
            {/* Filters */}
            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="task_completion">Tasks</SelectItem>
                      <SelectItem value="achievement">Achievements</SelectItem>
                      <SelectItem value="level_up">Level Ups</SelectItem>
                      <SelectItem value="badge">Badges</SelectItem>
                      <SelectItem value="reward">Rewards</SelectItem>
                      <SelectItem value="challenge">Challenges</SelectItem>
                      <SelectItem value="streak">Streaks</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  >
                    {sortOrder === 'desc' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20"></div>
                  ))}
                </div>
              ) : Object.keys(groupedActivities).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedActivities).map(([date, activities]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                        <span className="text-sm text-gray-500">{activities.length} activities</span>
                      </div>
                      
                      <div className="space-y-3">
                        {activities.map((activity) => (
                          <div 
                            key={activity.id}
                            className="group bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`p-3 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type)} text-white flex-shrink-0`}>
                                  {getActivityIcon(activity.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                      <p className="text-gray-600 text-sm">{activity.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      {activity.points && activity.points > 0 && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                                          {activity.points > 0 ? (
                                            <Plus className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Minus className="h-3 w-3 text-red-600" />
                                          )}
                                          <span className={`text-xs font-medium ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.abs(activity.points)} pts
                                          </span>
                                        </div>
                                      )}
                                      <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                                      {activity.data && (
                                        <button
                                          onClick={() => toggleExpanded(activity.id)}
                                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        >
                                          {expandedItems.has(activity.id) ? (
                                            <ChevronUp className="h-4 w-4 text-gray-400" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Expanded details */}
                                  {expandedItems.has(activity.id) && activity.data && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {activity.data.taskTitle && (
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-gray-600">Task: {activity.data.taskTitle}</span>
                                          </div>
                                        )}
                                        {activity.data.achievementName && (
                                          <div className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-yellow-500" />
                                            <span className="text-gray-600">Achievement: {activity.data.achievementName}</span>
                                          </div>
                                        )}
                                        {activity.data.newLevel && (
                                          <div className="flex items-center gap-2">
                                            <Crown className="h-4 w-4 text-purple-500" />
                                            <span className="text-gray-600">Level: {activity.data.oldLevel} → {activity.data.newLevel}</span>
                                          </div>
                                        )}
                                        {activity.data.streakLength && (
                                          <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span className="text-gray-600">Streak: {activity.data.streakLength} days</span>
                                          </div>
                                        )}
                                        {activity.data.familyName && (
                                          <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-orange-500" />
                                            <span className="text-gray-600">Family: {activity.data.familyName}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters to see more activities.'
                      : 'Start completing tasks and earning achievements to see your activity here!'}
                  </p>
                  {(searchQuery || typeFilter !== 'all' || dateFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                        setDateFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 