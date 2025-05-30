/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  FamilyAnalytics, 
  MemberComparison, 
  ComparativeAnalytics,
  AnalyticsSnapshot,
  FilterCriteria 
} from '@/lib/types/analytics';
import { advancedAnalyticsService } from '@/lib/services/analytics';

interface UseComparativeAnalyticsProps {
  familyId?: number;
  selectedMembers?: number[];
  comparisonPeriod?: 'week' | 'month' | 'quarter' | 'year';
  baselinePeriod?: 'previous' | 'yearAgo' | 'custom';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseComparativeAnalyticsReturn {
  // Family analytics
  familyAnalytics: FamilyAnalytics | null;
  memberComparisons: MemberComparison[];
  
  // Comparative data
  comparativeAnalytics: ComparativeAnalytics | null;
  
  // Top performers
  topPerformer: MemberComparison | null;
  mostImproved: MemberComparison | null;
  mostConsistent: MemberComparison | null;
  
  // Team metrics
  teamProductivityScore: number;
  collaborationScore: number;
  teamEfficiency: number;
  
  // Period comparison
  setComparisonPeriod: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  setBaselinePeriod: (period: 'previous' | 'yearAgo' | 'custom') => void;
  setCustomDateRange: (startDate: Date, endDate: Date) => void;
  
  // Member selection
  selectedMembers: number[];
  setSelectedMembers: (memberIds: number[]) => void;
  toggleMember: (memberId: number) => void;
  selectAllMembers: () => void;
  clearSelection: () => void;
  
  // Actions
  refresh: () => Promise<void>;
  compareWithPrevious: () => Promise<void>;
  generateReport: () => Promise<string>;
  
  // Filters
  applyFilters: (filters: FilterCriteria) => void;
  clearFilters: () => void;
  
  // State
  isLoading: boolean;
  isComparing: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useComparativeAnalytics({
  familyId,
  selectedMembers = [],
  comparisonPeriod = 'month',
  baselinePeriod = 'previous',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseComparativeAnalyticsProps = {}): UseComparativeAnalyticsReturn {
  
  // State
  const [familyAnalytics, setFamilyAnalytics] = useState<FamilyAnalytics | null>(null);
  const [memberComparisons, setMemberComparisons] = useState<MemberComparison[]>([]);
  const [comparativeAnalytics, setComparativeAnalytics] = useState<ComparativeAnalytics | null>(null);
  const [currentSelectedMembers, setCurrentSelectedMembers] = useState<number[]>(selectedMembers);
  const [currentComparisonPeriod, setCurrentComparisonPeriod] = useState(comparisonPeriod);
  const [currentBaselinePeriod, setCurrentBaselinePeriod] = useState(baselinePeriod);
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Computed values
  const topPerformer = memberComparisons.length > 0 
    ? memberComparisons.reduce((top, member) => 
        member.productivityScore > top.productivityScore ? member : top
      )
    : null;

  const mostImproved = memberComparisons.length > 0
    ? memberComparisons.reduce((improved, member) => {
        // This would compare with previous period data
        const improvementScore = member.completionRate * member.productivityScore;
        const currentImprovement = improved.completionRate * improved.productivityScore;
        return improvementScore > currentImprovement ? member : improved;
      })
    : null;

  const mostConsistent = memberComparisons.length > 0
    ? memberComparisons.reduce((consistent, member) => 
        member.completionRate > consistent.completionRate ? member : consistent
      )
    : null;

  const teamProductivityScore = memberComparisons.length > 0
    ? memberComparisons.reduce((sum, member) => sum + member.productivityScore, 0) / memberComparisons.length
    : 0;

  const collaborationScore = familyAnalytics?.collaborationMetrics.teamEfficiencyScore || 0;

  const teamEfficiency = memberComparisons.length > 0
    ? memberComparisons.reduce((sum, member) => sum + member.completionRate, 0) / memberComparisons.length
    : 0;

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate date ranges based on comparison period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (currentComparisonPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch family analytics
      const familyData = await advancedAnalyticsService.getFamilyAnalytics(startDate, endDate);
      setFamilyAnalytics(familyData);
      setMemberComparisons(familyData.memberComparisons);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comparative analytics';
      setError(errorMessage);
      console.error('Comparative analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentComparisonPeriod]);

  // Compare with baseline
  const compareWithPrevious = useCallback(async () => {
    setIsComparing(true);
    setError(null);

    try {
      // This would fetch comparative data from the API
      const mockComparative: ComparativeAnalytics = {
        baseline: {
          period: 'Previous Month',
          totalTasks: 150,
          completedTasks: 120,
          completionRate: 0.8,
          averageCompletionTime: 2.5,
          productivityScore: 75
        },
        comparison: {
          period: 'Current Month',
          totalTasks: 180,
          completedTasks: 150,
          completionRate: 0.83,
          averageCompletionTime: 2.2,
          productivityScore: 82
        },
        differences: [
          {
            metric: 'Total Tasks',
            baselineValue: 150,
            comparisonValue: 180,
            difference: 30,
            percentageChange: 20,
            trend: 'positive'
          },
          {
            metric: 'Completion Rate',
            baselineValue: 0.8,
            comparisonValue: 0.83,
            difference: 0.03,
            percentageChange: 3.75,
            trend: 'positive'
          }
        ],
        insights: [
          'Team productivity has improved by 20% this month',
          'Average completion time has decreased by 12%',
          'Overall team efficiency is trending upward'
        ]
      };

      setComparativeAnalytics(mockComparative);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compare analytics';
      setError(errorMessage);
      console.error('Comparative analysis error:', err);
    } finally {
      setIsComparing(false);
    }
  }, [currentBaselinePeriod]);

  // Generate report
  const generateReport = useCallback(async (): Promise<string> => {
    const report = {
      generatedAt: new Date().toISOString(),
      period: currentComparisonPeriod,
      familyAnalytics,
      memberComparisons,
      comparativeAnalytics,
      summary: {
        topPerformer: topPerformer?.memberName,
        teamProductivityScore,
        collaborationScore,
        teamEfficiency,
        totalMembers: memberComparisons.length,
        selectedMembers: currentSelectedMembers.length
      }
    };

    return JSON.stringify(report, null, 2);
  }, [
    currentComparisonPeriod,
    familyAnalytics,
    memberComparisons,
    comparativeAnalytics,
    topPerformer,
    teamProductivityScore,
    collaborationScore,
    teamEfficiency,
    currentSelectedMembers
  ]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Member selection functions
  const toggleMember = useCallback((memberId: number) => {
    setCurrentSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  const selectAllMembers = useCallback(() => {
    setCurrentSelectedMembers(memberComparisons.map(member => member.memberId));
  }, [memberComparisons]);

  const clearSelection = useCallback(() => {
    setCurrentSelectedMembers([]);
  }, []);

  // Filter functions
  const applyFilters = useCallback((newFilters: FilterCriteria) => {
    setFilters(newFilters);
    fetchAnalytics(); // Re-fetch with new filters
  }, [fetchAnalytics]);

  const clearFilters = useCallback(() => {
    setFilters({});
    fetchAnalytics(); // Re-fetch without filters
  }, [fetchAnalytics]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    familyAnalytics,
    memberComparisons,
    comparativeAnalytics,
    topPerformer,
    mostImproved,
    mostConsistent,
    teamProductivityScore,
    collaborationScore,
    teamEfficiency,
    setComparisonPeriod: setCurrentComparisonPeriod,
    setBaselinePeriod: setCurrentBaselinePeriod,
    setCustomDateRange: (startDate: Date, endDate: Date) => setCustomDateRange({ startDate, endDate }),
    selectedMembers: currentSelectedMembers,
    setSelectedMembers: setCurrentSelectedMembers,
    toggleMember,
    selectAllMembers,
    clearSelection,
    refresh,
    compareWithPrevious,
    generateReport,
    applyFilters,
    clearFilters,
    isLoading,
    isComparing,
    error,
    lastUpdated
  };
} 