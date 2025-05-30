/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { apiRequest } from '../apiClient';
import type {
  ChartData,
  ChartConfiguration,
  VisualizationTemplate,
  InteractiveVisualization,
  ChartType
} from '../../types/analytics';

/**
 * Service for data visualization operations
 */
export class DataVisualizationService {
  private readonly baseUrl = '/api/v1/data-visualization';

  /**
   * Get chart configuration for a specific chart type
   */
  async getChartConfiguration(chartType: string): Promise<ChartConfiguration> {
    const response = await apiRequest<ChartConfiguration>(
      `${this.baseUrl}/chart-config?chartType=${encodeURIComponent(chartType)}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Generate chart data for visualization
   */
  async generateChartData(request: GenerateChartRequest): Promise<ChartData> {
    const response = await apiRequest<ChartData>(
      `${this.baseUrl}/generate-chart`,
      'POST',
      request,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get dashboard data for visualization
   */
  async getDashboardData(dateRange?: string): Promise<any> {
    const params = dateRange ? `?dateRange=${encodeURIComponent(dateRange)}` : '';
    
    const response = await apiRequest(
      `${this.baseUrl}/dashboard-data${params}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Get supported chart types
   */
  async getSupportedChartTypes(): Promise<ChartType[]> {
    const response = await apiRequest<ChartType[]>(
      `${this.baseUrl}/chart-types`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get visualization templates
   */
  async getVisualizationTemplates(): Promise<VisualizationTemplate[]> {
    const response = await apiRequest<VisualizationTemplate[]>(
      `${this.baseUrl}/templates`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Create interactive visualization
   */
  async createInteractiveVisualization(request: InteractiveVisualizationRequest): Promise<InteractiveVisualization> {
    const response = await apiRequest<InteractiveVisualization>(
      `${this.baseUrl}/interactive`,
      'POST',
      request,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Generate custom chart with custom definition
   */
  async generateCustomChart(request: CustomChartRequest): Promise<ChartData> {
    const response = await apiRequest<ChartData>(
      `${this.baseUrl}/custom-chart`,
      'POST',
      request,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Process metrics for visualization
   */
  async processMetrics(data: any, chartType: string): Promise<ChartData> {
    // Client-side processing of metrics into chart-ready format
    switch (chartType.toLowerCase()) {
      case 'line':
        return this.processLineChartData(data);
      case 'bar':
        return this.processBarChartData(data);
      case 'pie':
        return this.processPieChartData(data);
      case 'doughnut':
        return this.processDoughnutChartData(data);
      case 'area':
        return this.processAreaChartData(data);
      case 'scatter':
        return this.processScatterChartData(data);
      case 'radar':
        return this.processRadarChartData(data);
      case 'heatmap':
        return this.processHeatmapChartData(data);
      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }
  }

  /**
   * Get visualization configuration with theme support
   */
  async getVisualizationConfig(
    chartType: string, 
    theme: 'light' | 'dark' | 'blue' | 'green' = 'light'
  ): Promise<ChartConfiguration> {
    const config = await this.getChartConfiguration(chartType);
    
    // Apply theme customizations
    return this.applyThemeToConfig(config, theme);
  }

  /**
   * Apply theme to chart configuration
   */
  private applyThemeToConfig(config: ChartConfiguration, theme: string): ChartConfiguration {
    const themeColors = this.getThemeColors(theme);
    
    return {
      ...config,
      options: {
        ...config.options,
        plugins: {
          ...config.options?.plugins,
          legend: {
            ...config.options?.plugins?.legend,
            labels: {
              ...config.options?.plugins?.legend?.labels,
              color: themeColors.text
            }
          }
        },
        scales: {
          ...config.options?.scales,
          x: {
            ...config.options?.scales?.x,
            ticks: {
              ...config.options?.scales?.x?.ticks,
              color: themeColors.text
            },
            grid: {
              ...config.options?.scales?.x?.grid,
              color: themeColors.grid
            }
          },
          y: {
            ...config.options?.scales?.y,
            ticks: {
              ...config.options?.scales?.y?.ticks,
              color: themeColors.text
            },
            grid: {
              ...config.options?.scales?.y?.grid,
              color: themeColors.grid
            }
          }
        }
      }
    };
  }

  /**
   * Get theme colors
   */
  private getThemeColors(theme: string) {
    const themes = {
      light: {
        text: '#374151',
        grid: '#E5E7EB',
        background: '#FFFFFF'
      },
      dark: {
        text: '#F9FAFB',
        grid: '#374151',
        background: '#1F2937'
      },
      blue: {
        text: '#1E3A8A',
        grid: '#DBEAFE',
        background: '#F0F9FF'
      },
      green: {
        text: '#14532D',
        grid: '#D1FAE5',
        background: '#F0FDF4'
      }
    };
    
    return themes[theme as keyof typeof themes] || themes.light;
  }

  // Chart data processing methods
  private processLineChartData(data: any): ChartData {
    return {
      labels: data.map((item: any) => item.label || item.date || item.name),
      datasets: [{
        label: 'Data',
        data: data.map((item: any) => item.value || item.count || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };
  }

  private processBarChartData(data: any): ChartData {
    return {
      labels: data.map((item: any) => item.label || item.category || item.name),
      datasets: [{
        label: 'Count',
        data: data.map((item: any) => item.value || item.count || 0),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
          '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ]
      }]
    };
  }

  private processPieChartData(data: any): ChartData {
    return {
      labels: data.map((item: any) => item.label || item.category || item.name),
      datasets: [{
        data: data.map((item: any) => item.value || item.count || 0),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
          '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ]
      }]
    };
  }

  private processDoughnutChartData(data: any): ChartData {
    return this.processPieChartData(data); // Same structure as pie
  }

  private processAreaChartData(data: any): ChartData {
    return {
      labels: data.map((item: any) => item.label || item.date || item.name),
      datasets: [{
        label: 'Data',
        data: data.map((item: any) => item.value || item.count || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  private processScatterChartData(data: any): ChartData {
    return {
      datasets: [{
        label: 'Data Points',
        data: data.map((item: any) => ({
          x: item.x || item.value1 || 0,
          y: item.y || item.value2 || 0
        })),
        backgroundColor: '#3B82F6'
      }]
    };
  }

  private processRadarChartData(data: any): ChartData {
    return {
      labels: data.map((item: any) => item.label || item.category || item.name),
      datasets: [{
        label: 'Metrics',
        data: data.map((item: any) => item.value || item.score || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointBackgroundColor: '#3B82F6'
      }]
    };
  }

  private processHeatmapChartData(data: any): ChartData {
    // For heatmap, data should be in matrix format
    return {
      datasets: [{
        label: 'Heatmap',
        data: data.flat ? data.flat() : data,
        backgroundColor: (context: any) => {
          const value = context.parsed.v;
          const alpha = Math.min(value / 100, 1); // Normalize to 0-1
          return `rgba(59, 130, 246, ${alpha})`;
        }
      }]
    };
  }
}

// Request types
export interface GenerateChartRequest {
  chartType: string;
  dataType?: string;
  startDate?: string;
  endDate?: string;
  theme?: string;
  responsive?: boolean;
  responsiveOptions?: any;
}

export interface InteractiveVisualizationRequest {
  visualizationType: string;
  dataType?: string;
  startDate?: string;
  endDate?: string;
  options?: any;
}

export interface CustomChartRequest {
  chartDefinition: any;
  dataType?: string;
  startDate?: string;
  endDate?: string;
}

// Create and export singleton instance
export const dataVisualizationService = new DataVisualizationService(); 