// Analytics Types for Advanced Data Visualization & Analytics

export interface AdvancedAnalytics {
  taskTrends: TaskTrend[];
  productivityMetrics: ProductivityMetrics;
  timeAnalysis: TimeAnalysis;
  categoryBreakdown: CategoryBreakdown[];
}

export interface TaskTrend {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  tasksOverdue: number;
  completionRate: number;
}

export interface ProductivityMetrics {
  dailyAverage: number;
  weeklyTrends: WeeklyTrend[];
  peakHours: number[];
  efficiencyScore: number;
}

export interface WeeklyTrend {
  week: string;
  tasksCompleted: number;
  averageCompletionTime: number;
  productivityScore: number;
}

export interface TimeAnalysis {
  averageCompletionTime: number;
  mostProductiveHour: number;
  mostProductiveDay: string;
  totalTimeSpent: number;
  timeDistribution: TimeDistribution[];
}

export interface TimeDistribution {
  hour: number;
  taskCount: number;
  completionRate: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  completionRate: number;
  averageTime: number;
}

export interface FamilyAnalytics {
  familyProductivity: FamilyProductivity;
  memberComparisons: MemberComparison[];
  collaborationMetrics: CollaborationMetrics;
}

export interface FamilyProductivity {
  totalTasks: number;
  completedTasks: number;
  familyCompletionRate: number;
  averageTasksPerMember: number;
}

export interface MemberComparison {
  memberId: number;
  memberName: string;
  tasksCompleted: number;
  completionRate: number;
  productivityScore: number;
  averageCompletionTime: number;
}

export interface CollaborationMetrics {
  sharedTasks: number;
  collaborativeCompletionRate: number;
  mostActiveCollaborators: string[];
  teamEfficiencyScore: number;
}

export interface SavedFilter {
  id: number;
  name: string;
  filterCriteria: FilterCriteria;
  queryType: string;
  isPublic: boolean;
  createdAt: string;
}

export interface FilterCriteria {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  status?: string[];
  priority?: number[];
  categories?: string[];
  assignedTo?: number[];
  tags?: string[];
}

export interface QueryBuilder {
  availableFields: QueryField[];
  filterTypes: FilterType[];
  operatorTypes: OperatorType[];
  defaultValues: Record<string, any>;
}

export interface QueryField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  options?: string[];
}

export interface FilterType {
  name: string;
  label: string;
  component: string;
}

export interface OperatorType {
  name: string;
  label: string;
  applicableTypes: string[];
}

export interface DashboardConfig {
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  preferences: DashboardPreferences;
  sharedSettings: SharedSettings;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  isActive: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfiguration {
  title: string;
  dataSource: string;
  chartType?: ChartType;
  filters?: FilterCriteria;
  refreshInterval?: number;
  showLegend?: boolean;
  colorScheme?: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  configuration: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

export interface DashboardPreferences {
  theme: 'light' | 'dark' | 'auto';
  autoRefresh: boolean;
  refreshInterval: number;
  showTooltips: boolean;
  animationsEnabled: boolean;
}

export interface SharedSettings {
  isPublic: boolean;
  allowedUsers: number[];
  permissions: DashboardPermission[];
}

export interface DashboardPermission {
  userId: number;
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
}

export interface DataExportOptions {
  exportFormats: ExportFormat[];
  dateRanges: DateRange[];
  filterOptions: FilterOption[];
  customFields: CustomField[];
}

export interface ExportFormat {
  name: string;
  label: string;
  extension: string;
  mimeType: string;
  maxSize?: number;
}

export interface DateRange {
  name: string;
  label: string;
  startDate: string;
  endDate: string;
}

export interface FilterOption {
  name: string;
  label: string;
  type: string;
  values: any[];
}

export interface CustomField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  type: ChartType;
  options: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
      mode?: string;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
}

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'doughnut' 
  | 'radar' 
  | 'polarArea' 
  | 'scatter' 
  | 'bubble'
  | 'area'
  | 'heatmap';

export type WidgetType = 
  | 'task-trends'
  | 'productivity-metrics'
  | 'category-breakdown'
  | 'family-comparison'
  | 'time-analysis'
  | 'completion-rate'
  | 'performance-score'
  | 'recent-activity'
  | 'upcoming-deadlines'
  | 'achievement-progress';

// Export request and history types
export interface DataExportRequest {
  id: number;
  exportType: string;
  dateRange: DateRange;
  filters: FilterCriteria;
  status: ExportStatus;
  filePath?: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Analytics query types
export interface AnalyticsQuery {
  id: number;
  queryName: string;
  queryType: string;
  parameters: Record<string, any>;
  executionTime: number;
  createdAt: string;
}

// Insight and recommendation types
export interface ProductivityInsight {
  type: InsightType;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  data: any;
}

export type InsightType = 
  | 'productivity-trend'
  | 'time-optimization'
  | 'category-efficiency'
  | 'collaboration-opportunity'
  | 'goal-achievement'
  | 'workload-balance';

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  confidence: number;
  prediction: number[];
  factors: TrendFactor[];
}

export interface TrendFactor {
  name: string;
  impact: number;
  description: string;
}

export interface PerformanceScore {
  overall: number;
  categories: {
    completion: number;
    efficiency: number;
    consistency: number;
    collaboration: number;
  };
  benchmarks: {
    personal: number;
    family: number;
    global: number;
  };
}

export interface ComparativeAnalytics {
  baseline: AnalyticsSnapshot;
  comparison: AnalyticsSnapshot;
  differences: AnalyticsDifference[];
  insights: string[];
}

export interface AnalyticsSnapshot {
  period: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
}

export interface AnalyticsDifference {
  metric: string;
  baselineValue: number;
  comparisonValue: number;
  difference: number;
  percentageChange: number;
  trend: 'positive' | 'negative' | 'neutral';
}

export interface ChartConfiguration {
  type: ChartType;
  options: ChartOptions;
  defaultData?: ChartData;
  styling?: ChartStyling;
}

export interface ChartStyling {
  colorScheme: string[];
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
}

export interface VisualizationTemplate {
  id: string;
  name: string;
  description: string;
  type: ChartType;
  configuration: ChartConfiguration;
  previewImage?: string;
  category: 'productivity' | 'analytics' | 'reporting' | 'comparison';
}

export interface InteractiveVisualization {
  id: string;
  type: string;
  configuration: any;
  data: any;
  interactionMethods: InteractionMethod[];
}

export interface InteractionMethod {
  type: 'click' | 'hover' | 'zoom' | 'pan' | 'filter';
  enabled: boolean;
  handler?: string;
} 