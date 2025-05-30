/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useCallback, useMemo } from 'react';
import { ChartData, ChartOptions, ChartType, ChartConfiguration } from '@/lib/types/analytics';
import { dataVisualizationService } from '@/lib/services/analytics';

interface UseDataVisualizationProps {
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: string[];
  responsive?: boolean;
  animationsEnabled?: boolean;
}

interface UseDataVisualizationReturn {
  // Chart generation
  generateChartData: (
    data: any[],
    chartType: ChartType,
    options?: Partial<ChartOptions>
  ) => ChartData;
  
  // Chart configuration
  getChartConfig: (chartType: ChartType) => ChartConfiguration;
  updateChartConfig: (chartType: ChartType, config: Partial<ChartConfiguration>) => void;
  
  // Theme management
  theme: string;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  getThemeColors: () => string[];
  
  // Data processing
  processTimeSeriesData: (data: any[], dateField: string, valueField: string) => ChartData;
  processCategoryData: (data: any[], categoryField: string, valueField: string) => ChartData;
  processComparisonData: (data: any[], groupField: string, valueField: string) => ChartData;
  
  // Chart utilities
  formatTooltip: (value: any, label: string, context: any) => string;
  exportChart: (chartRef: any, format: 'png' | 'pdf') => Promise<void>;
  
  // State
  isProcessing: boolean;
  error: string | null;
}

export function useDataVisualization({
  theme = 'auto',
  colorScheme = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  responsive = true,
  animationsEnabled = true
}: UseDataVisualizationProps = {}): UseDataVisualizationReturn {
  
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartConfigs, setChartConfigs] = useState<Record<ChartType, ChartConfiguration>>({} as any);

  // Get theme colors based on current theme
  const getThemeColors = useCallback(() => {
    const darkColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
    const lightColors = colorScheme;
    
    if (currentTheme === 'dark') return darkColors;
    if (currentTheme === 'light') return lightColors;
    
    // Auto theme - check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? darkColors : lightColors;
  }, [currentTheme, colorScheme]);

  // Generate chart data
  const generateChartData = useCallback((
    data: any[],
    chartType: ChartType,
    options: Partial<ChartOptions> = {}
  ): ChartData => {
    setIsProcessing(true);
    setError(null);

    try {
      const colors = getThemeColors();
      
      const baseOptions: ChartOptions = {
        responsive,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            mode: 'index'
          }
        },
        ...options
      };

      // Process data based on chart type
      let chartData: ChartData;

      switch (chartType) {
        case 'line':
        case 'area':
          chartData = {
            labels: data.map(item => item.label || item.date || item.x),
            datasets: [{
              label: 'Data',
              data: data.map(item => item.value || item.y),
              borderColor: colors[0],
              backgroundColor: chartType === 'area' ? `${colors[0]}20` : 'transparent',
              fill: chartType === 'area'
            }],
            type: chartType,
            options: baseOptions
          };
          break;

        case 'bar':
          chartData = {
            labels: data.map(item => item.label || item.category),
            datasets: [{
              label: 'Values',
              data: data.map(item => item.value || item.count),
              backgroundColor: colors.slice(0, data.length),
              borderColor: colors.slice(0, data.length),
              borderWidth: 1
            }],
            type: chartType,
            options: baseOptions
          };
          break;

        case 'pie':
        case 'doughnut':
          chartData = {
            labels: data.map(item => item.label || item.category),
            datasets: [{
              label: 'Dataset',
              data: data.map(item => item.value || item.count),
              backgroundColor: colors.slice(0, data.length),
              borderColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
              borderWidth: 2
            }],
            type: chartType,
            options: baseOptions
          };
          break;

        case 'radar':
          chartData = {
            labels: data.map(item => item.label || item.metric),
            datasets: [{
              label: 'Score',
              data: data.map(item => item.value || item.score),
              backgroundColor: `${colors[0]}20`,
              borderColor: colors[0],
              borderWidth: 2
            }],
            type: chartType,
            options: {
              ...baseOptions,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100
                }
              } as any
            }
          };
          break;

        default:
          chartData = {
            labels: [],
            datasets: [],
            type: chartType,
            options: baseOptions
          };
      }

      return chartData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart data';
      setError(errorMessage);
      console.error('Chart data generation error:', err);
      
      // Return empty chart data on error
      return {
        labels: [],
        datasets: [],
        type: chartType,
        options: { responsive: true, maintainAspectRatio: false }
      };
    } finally {
      setIsProcessing(false);
    }
  }, [responsive, animationsEnabled, currentTheme, getThemeColors]);

  // Process time series data
  const processTimeSeriesData = useCallback((
    data: any[],
    dateField: string,
    valueField: string
  ): ChartData => {
    const processedData = data.map(item => ({
      label: new Date(item[dateField]).toLocaleDateString(),
      value: item[valueField]
    }));
    
    return generateChartData(processedData, 'line');
  }, [generateChartData]);

  // Process category data
  const processCategoryData = useCallback((
    data: any[],
    categoryField: string,
    valueField: string
  ): ChartData => {
    const processedData = data.map(item => ({
      label: item[categoryField],
      value: item[valueField]
    }));
    
    return generateChartData(processedData, 'bar');
  }, [generateChartData]);

  // Process comparison data
  const processComparisonData = useCallback((
    data: any[],
    groupField: string,
    valueField: string
  ): ChartData => {
    const groupedData = data.reduce((acc, item) => {
      const group = item[groupField];
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item[valueField]);
      return acc;
    }, {} as Record<string, number[]>);

    const processedData = Object.entries(groupedData).map(([group, values]) => ({
      label: group,
      value: (values as number[]).reduce((sum: number, val: number) => sum + val, 0) / (values as number[]).length
    }));
    
    return generateChartData(processedData, 'bar');
  }, [generateChartData]);

  // Get chart configuration
  const getChartConfig = useCallback((chartType: ChartType): ChartConfiguration => {
    return chartConfigs[chartType] || {
      type: chartType,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  }, [chartConfigs]);

  // Update chart configuration
  const updateChartConfig = useCallback((
    chartType: ChartType,
    config: Partial<ChartConfiguration>
  ) => {
    setChartConfigs(prev => ({
      ...prev,
      [chartType]: {
        ...prev[chartType],
        ...config
      }
    }));
  }, []);

  // Format tooltip
  const formatTooltip = useCallback((value: any, label: string, context: any): string => {
    if (typeof value === 'number') {
      return `${label}: ${value.toLocaleString()}`;
    }
    return `${label}: ${value}`;
  }, []);

  // Export chart
  const exportChart = useCallback(async (chartRef: any, format: 'png' | 'pdf'): Promise<void> => {
    try {
      setIsProcessing(true);
      
      if (format === 'png') {
        const url = chartRef.current?.toBase64Image();
        if (url) {
          const link = document.createElement('a');
          link.download = `chart-${Date.now()}.png`;
          link.href = url;
          link.click();
        }
      } else if (format === 'pdf') {
        // PDF export would require additional library like jsPDF
        console.log('PDF export not implemented yet');
      }
    } catch (err) {
      setError('Failed to export chart');
      console.error('Chart export error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    generateChartData,
    getChartConfig,
    updateChartConfig,
    theme: currentTheme,
    setTheme: setCurrentTheme,
    getThemeColors,
    processTimeSeriesData,
    processCategoryData,
    processComparisonData,
    formatTooltip,
    exportChart,
    isProcessing,
    error
  };
} 