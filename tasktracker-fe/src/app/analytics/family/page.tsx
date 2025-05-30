/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Crown,
  Trophy,
  Target,
  RefreshCw,
  Download,
  TrendingUp,
  Heart,
  Star
} from 'lucide-react';
import { FamilyComparisonChart } from '@/components/analytics/charts/FamilyComparisonChart';
import { RadarChart } from '@/components/analytics/charts/RadarChart';
import { TaskTrendChart } from '@/components/analytics/charts/TaskTrendChart';
import { advancedAnalyticsService } from '@/lib/services/analytics';
import { FamilyAnalytics } from '@/lib/types/analytics';

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  tasksCompleted: number;
  productivity: number;
  achievements: number;
  trend: 'up' | 'down' | 'stable';
  isTopPerformer?: boolean;
}

interface CollaborationMetric {
  label: string;
  value: number;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

export default function FamilyPage() {
  const [familyData, setFamilyData] = useState<FamilyAnalytics | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborationMetric[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyData();
  }, [timeRange]);

  const loadFamilyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange.replace('d', '')));

      const data = await advancedAnalyticsService.getFamilyAnalytics(startDate, endDate);
      setFamilyData(data);

      // Mock family member data (this would come from the API)
      const mockMembers: FamilyMember[] = [
        {
          id: '1',
          name: 'Carlos Abril',
          avatar: '/avatars/carlos.jpg',
          role: 'Father',
          tasksCompleted: 145,
          productivity: 92,
          achievements: 23,
          trend: 'up',
          isTopPerformer: true
        },
        {
          id: '2',
          name: 'Maria Abril',
          avatar: '/avatars/maria.jpg',
          role: 'Mother',
          tasksCompleted: 132,
          productivity: 88,
          achievements: 21,
          trend: 'up'
        },
        {
          id: '3',
          name: 'Sofia Abril',
          avatar: '/avatars/sofia.jpg',
          role: 'Daughter',
          tasksCompleted: 89,
          productivity: 76,
          achievements: 15,
          trend: 'stable'
        },
        {
          id: '4',
          name: 'Diego Abril',
          avatar: '/avatars/diego.jpg',
          role: 'Son',
          tasksCompleted: 67,
          productivity: 82,
          achievements: 12,
          trend: 'up'
        }
      ];

      setMembers(mockMembers);

      // Mock collaboration metrics
      const mockCollaboration: CollaborationMetric[] = [
        {
          label: 'Shared Tasks',
          value: 84,
          description: 'Tasks completed together',
          trend: 'up'
        },
        {
          label: 'Communication',
          value: 91,
          description: 'Family communication score',
          trend: 'up'
        },
        {
          label: 'Goal Alignment',
          value: 78,
          description: 'Family goals completion',
          trend: 'stable'
        },
        {
          label: 'Support Score',
          value: 95,
          description: 'Members helping each other',
          trend: 'up'
        }
      ];

      setCollaboration(mockCollaboration);

    } catch (err) {
      setError('Failed to load family data');
      console.error('Error loading family analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopPerformer = () => {
    return members.find(member => member.isTopPerformer) || members[0];
  };

  const getFamilyScore = () => {
    if (members.length === 0) return 0;
    return Math.round(members.reduce((sum, member) => sum + member.productivity, 0) / members.length);
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-4 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Family Analytics</h1>
            <p className="text-white/70">
              Family-specific analytics and member comparisons
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadFamilyData}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Family Productivity Dashboard</h2>
                <p className="text-white/80">Track your family's collaborative success and individual achievements</p>
              </div>
            </div>
            
            {!isLoading && members.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <div>
                      <div className="text-white/80 text-sm">Family Score</div>
                      <div className="text-white text-xl font-bold">{getFamilyScore()}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-amber-400" />
                    <div>
                      <div className="text-white/80 text-sm">Top Performer</div>
                      <div className="text-white text-lg font-semibold">{getTopPerformer()?.name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-blue-400" />
                    <div>
                      <div className="text-white/80 text-sm">Total Members</div>
                      <div className="text-white text-xl font-bold">{members.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Family Overview */}
        {!isLoading && members.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Family Leaderboard</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    member.isTopPerformer
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-600 to-red-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  } group cursor-pointer`}
                >
                  {member.isTopPerformer && (
                    <div className="absolute top-3 right-3">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-white/30">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-white/20 text-white font-bold">
                        {getMemberInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-semibold">{member.name}</div>
                      <div className="text-white/80 text-sm">{member.role}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tasks</span>
                      <span className="font-bold">{member.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Productivity</span>
                      <span className="font-bold">{member.productivity}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Achievements</span>
                      <span className="font-bold">{member.achievements}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {member.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-300" />}
                      <Progress 
                        value={member.productivity} 
                        className="flex-1 h-2 bg-white/20" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
              <span className="ml-4 text-white">Loading family analytics...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center py-4">
              <p className="text-red-400 mb-4">{error}</p>
              <Button 
                onClick={loadFamilyData}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}