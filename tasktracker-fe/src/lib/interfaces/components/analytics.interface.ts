/*
 * Analytics Component Interfaces
 * Centralized interface definitions for analytics-related components
 * Extracted from components/analytics/ for .cursorrules compliance
 */

// ================================
// MAIN ANALYTICS INTERFACES
// ================================

export interface AnalyticsPageProps {
  user: {
    id: number;
    username: string;
    email: string;
  };
  initialData?: {
    dashboardData?: AnalyticsDashboardData;
    timeRange?: TimeRange;
  };
  className?: string;
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview;
  charts: AnalyticsChart[];
  insights: AnalyticsInsight[];
  predictions: AnalyticsPrediction[];
  lastUpdated: Date;
}

// ================================
// ANALYTICS OVERVIEW INTERFACES
// ================================

export interface AnalyticsOverview {
  tasksCompleted: MetricValue;
  productivityScore: MetricValue;
  focusTime: MetricValue;
  streakDays: MetricValue;
  pointsEarned: MetricValue;
  familyCollaboration: MetricValue;
  averageTaskTime: MetricValue;
  completionRate: MetricValue;
}

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  format?: 'number' | 'percentage' | 'time' | 'currency';
}

export interface AnalyticsOverviewProps {
  overview: AnalyticsOverview;
  timeRange: TimeRange;
  onMetricClick?: (metric: string) => void;
  showComparisons?: boolean;
  showTrends?: boolean;
  layout?: 'grid' | 'cards' | 'compact';
  className?: string;
}

// ================================
// ANALYTICS CHART INTERFACES
// ================================

export interface AnalyticsChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'heatmap';
  title: string;
  description?: string;
  data: ChartData;
  config?: ChartConfig;
  insights?: string[];
  timeRange: TimeRange;
  lastUpdated: Date;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointBackgroundColor?: string;
}

export interface ChartConfig {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
      mode: 'index' | 'dataset' | 'point' | 'nearest';
    };
  };
  scales?: {
    x?: ScaleConfig;
    y?: ScaleConfig;
  };
  animation?: {
    duration: number;
    easing: string;
  };
}

export interface ScaleConfig {
  display?: boolean;
  title?: {
    display: boolean;
    text: string;
  };
  min?: number;
  max?: number;
  beginAtZero?: boolean;
  ticks?: {
    stepSize?: number;
    callback?: (value: unknown) => string;
  };
}

export interface AnalyticsChartProps {
  chart: AnalyticsChart;
  onInteraction?: (event: string, data: unknown) => void;
  showInsights?: boolean;
  showControls?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

// ================================
// TIME RANGE INTERFACES
// ================================

export interface TimeRange {
  label: string;
  value: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: Date;
  endDate: Date;
  isCustom?: boolean;
}

export interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  availableRanges?: TimeRange[];
  allowCustom?: boolean;
  compact?: boolean;
  className?: string;
}

// ================================
// ANALYTICS INSIGHTS INTERFACES
// ================================

export interface AnalyticsInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning' | 'suggestion';
  title: string;
  description: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  confidence: number; // 0-100
  actionable: boolean;
  actions?: InsightAction[];
  relatedMetrics?: string[];
  timestamp: Date;
}

export interface InsightAction {
  id: string;
  label: string;
  description?: string;
  type: 'navigate' | 'modal' | 'external' | 'function';
  target?: string;
  onClick?: () => void;
  primary?: boolean;
}

export interface AnalyticsInsightsProps {
  insights: AnalyticsInsight[];
  onInsightAction?: (insightId: string, actionId: string) => void;
  onInsightDismiss?: (insightId: string) => void;
  maxVisible?: number;
  showActions?: boolean;
  groupByType?: boolean;
  className?: string;
}

// ================================
// ANALYTICS PREDICTIONS INTERFACES
// ================================

export interface AnalyticsPrediction {
  id: string;
  type: 'goal_completion' | 'productivity_trend' | 'task_completion' | 'streak_maintenance';
  title: string;
  description: string;
  prediction: string;
  confidence: number; // 0-100
  timeHorizon: 'day' | 'week' | 'month' | 'quarter';
  factors: PredictionFactor[];
  recommendedActions?: string[];
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'low' | 'medium' | 'high';
}

export interface PredictionFactor {
  name: string;
  weight: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export interface AnalyticsPredictionsProps {
  predictions: AnalyticsPrediction[];
  onPredictionSelect?: (prediction: AnalyticsPrediction) => void;
  showFactors?: boolean;
  showRecommendations?: boolean;
  groupByType?: boolean;
  className?: string;
}

// ================================
// ANALYTICS FILTERS INTERFACES
// ================================

export interface AnalyticsFilter {
  id: string;
  type: 'category' | 'priority' | 'family' | 'tag' | 'status' | 'user';
  label: string;
  value: string | number | string[];
  operator: 'equals' | 'contains' | 'in' | 'between';
  isActive: boolean;
}

export interface AnalyticsFiltersProps {
  filters: AnalyticsFilter[];
  onFilterChange: (filters: AnalyticsFilter[]) => void;
  onClearAll?: () => void;
  availableFilters?: Array<{
    type: AnalyticsFilter['type'];
    label: string;
    options?: Array<{ label: string; value: string | number }>;
  }>;
  showPresets?: boolean;
  className?: string;
}

// ================================
// PRODUCTIVITY ANALYTICS INTERFACES
// ================================

export interface ProductivityAnalyticsProps {
  data: ProductivityData;
  timeRange: TimeRange;
  onDrillDown?: (metric: string, filters: AnalyticsFilter[]) => void;
  showPredictions?: boolean;
  showInsights?: boolean;
  className?: string;
}

export interface ProductivityData {
  score: number; // 0-100
  trends: Array<{
    date: Date;
    score: number;
    tasksCompleted: number;
    focusTime: number;
  }>;
  breakdown: {
    taskCompletion: number;
    timeManagement: number;
    focusQuality: number;
    consistency: number;
  };
  patterns: {
    mostProductiveHour: number;
    mostProductiveDay: string;
    averageSessionLength: number;
    distractionRate: number;
  };
  improvements: Array<{
    area: string;
    current: number;
    potential: number;
    recommendations: string[];
  }>;
}

// ================================
// FAMILY ANALYTICS INTERFACES
// ================================

export interface FamilyAnalyticsProps {
  familyId: number;
  data: FamilyAnalyticsData;
  timeRange: TimeRange;
  onMemberSelect?: (memberId: number) => void;
  showComparisons?: boolean;
  showLeaderboard?: boolean;
  className?: string;
}

export interface FamilyAnalyticsData {
  overview: {
    totalMembers: number;
    activeTasks: number;
    completedTasks: number;
    totalPoints: number;
    collaborationScore: number;
  };
  memberPerformance: Array<{
    memberId: number;
    name: string;
    tasksCompleted: number;
    pointsEarned: number;
    contributionPercentage: number;
    streakDays: number;
    rank: number;
  }>;
  collaboration: {
    sharedTasks: number;
    taskHandoffs: number;
    communicationScore: number;
    conflictResolutionTime: number;
  };
  trends: Array<{
    date: Date;
    familyScore: number;
    memberActivity: Array<{
      memberId: number;
      activity: number;
    }>;
  }>;
} 