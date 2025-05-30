/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

// Export chart components
export { ChartRenderer } from './charts/ChartRenderer';
export { TaskTrendChart } from './charts/TaskTrendChart';
export { ProductivityHeatmap } from './charts/ProductivityHeatmap';
export { FamilyComparisonChart } from './charts/FamilyComparisonChart';
export { CategoryPieChart } from './charts/CategoryPieChart';
export { TimelineChart } from './charts/TimelineChart';
export { RadarChart } from './charts/RadarChart';

// Export dashboard components
export { AnalyticsDashboard } from './dashboard/AnalyticsDashboard';

// Export filter components
export { AdvancedFilterBuilder } from './filters/AdvancedFilterBuilder';
export { SavedFilters } from './filters/SavedFilters';
export { QueryBuilder } from './filters/QueryBuilder';
export { FilterPresets } from './filters/FilterPresets';

// Export export components
export { DataExportDialog } from './export/DataExportDialog';
export { ExportHistory } from './export/ExportHistory';

// Export types (re-export from services)
export type {
  GenerateChartRequest,
  InteractiveVisualizationRequest,
  CustomChartRequest,
  CreateSavedFilterRequest,
  UpdateSavedFilterRequest,
  CreateExportRequest,
  ScheduleExportRequest,
  ExportProgress
} from '@/lib/services/analytics'; 