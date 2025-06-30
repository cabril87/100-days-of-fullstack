/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

// ============================================================================
// USER ANALYTICS TYPES - Personal productivity metrics
// ============================================================================

export interface UserAnalyticsDashboardDTO {
  userId: number;
  generatedAt: string;
  startDate?: string;
  endDate?: string;
  taskAnalytics: TaskAnalyticsSummaryDTO;
  productivityMetrics: ProductivityMetricsDTO;
  gamificationStats: GamificationAnalyticsDTO;
  boardPerformance: BoardPerformanceDTO[];
  templateUsage: TemplateUsageAnalyticsDTO;
  mlInsights: UserMLInsightsDTO;
}

export interface TaskAnalyticsSummaryDTO {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  completionTrends: Record<string, number>;
  averageCompletionTime: string;
  tasksByPriority: Record<string, number>;
  tasksByCategory: Record<string, number>;
}

export interface ProductivityMetricsDTO {
  productivityScore: number;
  efficiencyRating: number;
  averageFocusTime: string;
  focusSessionsCompleted: number;
  peakProductivityHours: string[];
  productivityTrends: Record<string, number>;
  focusTimeByDay: Record<string, string>;
}

export interface GamificationAnalyticsDTO {
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  achievementsUnlocked: number;
  recentAchievements: RecentAchievementDTO[];
  pointsHistory: Record<string, number>;
  levelProgress: LevelProgressDTO;
}

export interface RecentAchievementDTO {
  name: string;
  earnedAt: string;
  points: number;
  description?: string;
  badgeIcon?: string;
}

export interface LevelProgressDTO {
  currentLevel: number;
  currentPoints: number;
  pointsToNextLevel: number;
  progressPercentage: number;
}

export interface BoardPerformanceDTO {
  boardId: number;
  boardName: string;
  efficiencyScore: number;
  throughputRate: number;
  cycleTime: number;
  wipViolations: number;
  tasksCompleted: number;
  averageTaskAge: string;
}

export interface TemplateUsageAnalyticsDTO {
  templatesUsed: number;
  templatesCreated: number;
  templatesShared: number;
  averageSuccessRate: number;
  mostUsedTemplates: MostUsedTemplateDTO[];
}

export interface MostUsedTemplateDTO {
  templateId: number;
  templateName: string;
  usageCount: number;
  successRate: number;
}

export interface UserMLInsightsDTO {
  productivityTrends: string[];
  recommendations: PersonalizedRecommendationDTO[];
  behavioralPatterns: BehavioralPatternDTO[];
  predictionAccuracy: number;
}

export interface PersonalizedRecommendationDTO {
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface BehavioralPatternDTO {
  patternType: string;
  description: string;
  confidence: number;
  impact: 'positive' | 'neutral' | 'negative';
}

// ============================================================================
// FAMILY ANALYTICS TYPES - Family collaboration metrics
// ============================================================================

export interface FamilyAnalyticsDashboardDTO {
  familyId: number;
  generatedAt: string;
  startDate?: string;
  endDate?: string;
  overview: FamilyOverviewDTO;
  familyOverview: FamilyOverviewDTO;
  memberAnalytics: FamilyMemberAnalyticsDTO[];
  collaborationMetrics: FamilyCollaborationMetricsDTO;
  productivityTrends: FamilyProductivityTrendsDTO;
  productivityInsights: FamilyProductivityInsightsDTO;
}

export interface FamilyOverviewDTO {
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  familyProductivityScore: number;
  collaborationScore: number;
  currentStreak: number;
}

export interface FamilyMemberAnalyticsDTO {
  userId: number;
  username: string;
  tasksCompleted: number;
  productivityScore: number;
  pointsEarned: number;
  contributionPercentage: number;
  averageTaskCompletionTime: string;
}

export interface FamilyCollaborationMetricsDTO {
  sharedBoards: number;
  collaborativeTasks: number;
  collaborationScore: number;
  collaborationMetrics: CollaborationMetric[];
  activityByMember: Record<string, number>;
  collaborationTips: string[];
}

export interface CollaborationMetric {
  metricName: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FamilyProductivityTrendsDTO {
  weeklyTrends: Record<string, number>;
  memberComparisons: Record<string, number>;
  topPerformers: string[];
  improvementAreas: string[];
}

export interface FamilyProductivityInsightsDTO {
  insights: ProductivityInsightDTO[];
  recommendations: FamilyRecommendationDTO[];
  challenges: ProductivityChallengeDTO[];
}

export interface ProductivityInsightDTO {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface FamilyRecommendationDTO {
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
}

export interface ProductivityChallengeDTO {
  challengeName: string;
  description: string;
  reward: string;
  deadline?: string;
}

// ============================================================================
// ADMIN ANALYTICS TYPES - Platform-wide metrics (ADMIN ONLY)
// ============================================================================

export interface AdminAnalyticsDashboardDTO {
  generatedAt: string;
  startDate?: string;
  endDate?: string;
  platformOverview: PlatformOverviewDTO;
  userEngagement: UserEngagementSummaryDTO;
  systemHealth: SystemHealthSummaryDTO;
  revenueAnalytics: RevenueAnalyticsDTO;
  featureUsage: FeatureUsageAnalyticsDTO;
  systemPerformance: SystemPerformanceDTO;
  securityAnalytics: SecurityAnalyticsDTO;
}

export interface PlatformOverviewDTO {
  totalUsers: number;
  activeUsers: number;
  totalFamilies: number;
  totalTasks: number;
  totalBoards: number;
  platformGrowthRate: number;
  userRetentionRate: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface UserEngagementSummaryDTO {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  topFeatures: FeatureUsageDTO[];
  engagementTrends: Record<string, number>;
}

export interface FeatureUsageDTO {
  featureName: string;
  usageCount: number;
  usagePercentage: number;
  adoptionRate: number;
}

export interface SystemHealthSummaryDTO {
  overallHealthScore: number;
  activeBackgroundServices: number;
  failedServices: number;
  databasePerformance: number;
  apiResponseTime: number;
  errorRate: number;
  serviceHealth: ServiceHealthStatus[];
}

export interface ServiceHealthStatus {
  serviceName: string;
  status: string;
  responseTime?: number;
  lastCheck: string;
  errorMessage?: string;
}

export interface RevenueAnalyticsDTO {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  subscriptionTrends: Record<string, number>;
}

export interface FeatureUsageAnalyticsDTO {
  topFeatures: FeatureUsageDTO[];
  featureAdoption: Record<string, number>;
  userFeedback: UserFeedbackSummaryDTO;
  usageTrends: Record<string, number>;
}

export interface UserFeedbackSummaryDTO {
  averageRating: number;
  totalFeedback: number;
  sentimentScore: number;
  topComplaints: string[];
  topPraises: string[];
}

export interface SystemPerformanceDTO {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseConnections: number;
  cacheHitRate: number;
  performanceTrends: Record<string, number>;
}

export interface SecurityAnalyticsDTO {
  totalSecurityEvents: number;
  anomalousActivities: number;
  highRiskEvents: number;
  averageAnomalyScore: number;
  recentSecurityEvents: SecurityEvent[];
  threatsByType: Record<string, number>;
  securityTrends: Record<string, number>;
}

export interface SecurityEvent {
  timestamp: string;
  eventType: string;
  riskLevel: string;
  description: string;
  userId?: string;
  ipAddress?: string;
}

// ============================================================================
// ML & INSIGHTS TYPES
// ============================================================================

export interface MLInsightsDTO {
  predictions: PredictionDTO[];
  insights: MLInsightDTO[];
  recommendations: MLRecommendationDTO[];
  confidence: number;
}

export interface PredictionDTO {
  type: string;
  prediction: string;
  confidence: number;
  timeframe: string;
}

export interface MLInsightDTO {
  category: string;
  insight: string;
  impact: number;
  supporting_data: Record<string, unknown>;
}

export interface MLRecommendationDTO {
  type: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedImpact: string;
  actionRequired: boolean;
}

// ============================================================================
// EXPORT & VISUALIZATION TYPES
// ============================================================================

export interface AnalyticsExportRequestDTO {
  dataTypes: string[];
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  includeCharts: boolean;
  customFilters?: Record<string, unknown>;
}

export interface AnalyticsExportDTO {
  exportId: string;
  downloadUrl: string;
  format: string;
  fileSize: number;
  generatedAt: string;
  expiresAt: string;
}

export interface DataVisualizationDTO {
  visualizationType: string;
  title: string;
  description: string;
  chartConfig: ChartConfigurationDTO;
  data: unknown[];
  metadata: VisualizationMetadataDTO;
}

export interface ChartConfigurationDTO {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'radar';
  xAxis: AxisConfigurationDTO;
  yAxis: AxisConfigurationDTO;
  colors: string[];
  responsive: boolean;
  animations: boolean;
}

export interface AxisConfigurationDTO {
  label: string;
  field: string;
  format?: string;
  scale?: 'linear' | 'logarithmic' | 'time';
}

export interface VisualizationMetadataDTO {
  lastUpdated: string;
  dataPoints: number;
  refreshInterval: number;
  source: string;
}

// ============================================================================
// MISSING DTO TYPES (Referenced in service but not defined)
// ============================================================================

export interface UserProductivityInsightsDTO {
  insights: ProductivityInsightDTO[];
  recommendations: PersonalizedRecommendationDTO[];
  behavioralPatterns: BehavioralPatternDTO[];
  predictionAccuracy: number;
}

export interface UserBoardAnalyticsDTO {
  boardPerformance: BoardPerformanceDTO[];
  overallEfficiency: number;
  recommendations: string[];
}

export interface PersonalizedRecommendationsDTO {
  recommendations: PersonalizedRecommendationDTO[];
  generatedAt: string;
  userId: number;
}

export interface FamilyCollaborationAnalyticsDTO {
  collaborationMetrics: FamilyCollaborationMetricsDTO;
  memberContributions: FamilyMemberAnalyticsDTO[];
  trends: Record<string, number>;
}

export interface PlatformUsageAnalyticsDTO {
  totalRequests: number;
  activeEndpoints: number;
  averageResponseTime: number;
  usageTrends: Record<string, number>;
  topFeatures: FeatureUsageDTO[];
}

export interface SystemHealthAnalyticsDTO {
  overallHealthScore: number;
  activeBackgroundServices: number;
  failedServices: number;
  databasePerformance: number;
  apiResponseTime: number;
  errorRate: number;
  serviceHealth: ServiceHealthStatus[];
  performanceMetrics: SystemPerformanceDTO;
}

export interface BackgroundServiceAnalyticsDTO {
  activeServices: number;
  failedServices: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  serviceStatus: ServiceHealthStatus[];
}

export interface MarketplaceAnalyticsDTO {
  totalListings: number;
  activeListings: number;
  transactions: number;
  revenue: number;
  topCategories: string[];
  trends: Record<string, number>;
}

export interface UserEngagementAnalyticsDTO {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  topFeatures: FeatureUsageDTO[];
  engagementTrends: Record<string, number>;
}

export interface BehavioralAnalysisDTO {
  patterns: BehavioralPatternDTO[];
  insights: MLInsightDTO[];
  anomalies: string[];
  confidence: number;
}

export interface PredictiveAnalyticsDTO {
  predictions: PredictionDTO[];
  trends: Record<string, number>;
  accuracy: number;
  timeframe: string;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface AnalyticsDashboardProps {
  userRole: 'user' | 'admin';
  userId?: number;
  familyId?: number;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface AnalyticsChartProps {
  title: string;
  data: unknown[];
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

// ============================================================================
// ANALYTICS DASHBOARD COMPONENT TYPES
// ============================================================================

export interface AnalyticsDashboardWrapperProps {
  className?: string;
}

export interface UserAnalyticsDashboardProps {
  analytics: UseAnalyticsReturn;
  mode?: 'user' | 'family';
  className?: string;
}

export interface AdminAnalyticsDashboardProps {
  analytics: UseAnalyticsReturn;
  className?: string;
}

// ============================================================================
// ANALYTICS CHART COMPONENT TYPES
// ============================================================================

export interface ProductivityChartProps {
  data: ProductivityMetricsDTO;
  timeRange: string;
  className?: string;
}

export interface TaskCompletionChartProps {
  data: TaskAnalyticsSummaryDTO;
  timeRange: string;
  className?: string;
}

export interface GamificationChartProps {
  data: GamificationAnalyticsDTO;
  timeRange: string;
  className?: string;
}

export interface FamilyCollaborationChartProps {
  familyData: FamilyAnalyticsDashboardDTO;
  timeRange: string;
  className?: string;
}

// ============================================================================
// ANALYTICS HOOK TYPES
// ============================================================================

type TimeRange = '7d' | '30d' | '90d' | '1y';
type DashboardMode = 'user' | 'family' | 'admin';

interface AnalyticsState {
  // Data
  userAnalytics: UserAnalyticsDashboardDTO | null;
  familyAnalytics: FamilyAnalyticsDashboardDTO | null;
  adminAnalytics: AdminAnalyticsDashboardDTO | null;
  systemHealth: SystemHealthAnalyticsDTO | null;
  userEngagement: UserEngagementAnalyticsDTO | null;
  recommendations: PersonalizedRecommendationsDTO | null;
  mlInsights: MLInsightsDTO | null;
  
  // Loading states
  loading: {
    user: boolean;
    family: boolean;
    admin: boolean;
    recommendations: boolean;
    mlInsights: boolean;
  };
  
  // Error states
  errors: {
    user: string | null;
    family: string | null;
    admin: string | null;
    recommendations: string | null;
    mlInsights: string | null;
  };
  
  // Meta
  lastUpdated: Date;
  timeRange: TimeRange;
  dashboardMode: DashboardMode;
}

export interface UseAnalyticsOptions {
  userId?: number;
  familyId?: number;
  isAdmin?: boolean;
  initialTimeRange?: TimeRange;
  initialMode?: DashboardMode;
}

export interface UseAnalyticsReturn extends AnalyticsState {
  // Actions
  setTimeRange: (range: TimeRange) => void;
  setDashboardMode: (mode: DashboardMode) => void;
  refreshData: () => Promise<void>;
  refreshSpecific: (type: keyof AnalyticsState['loading']) => Promise<void>;
  
  // Computed
  isLoading: boolean;
  hasErrors: boolean;
  dateRange: { startDate: Date; endDate: Date };
} 