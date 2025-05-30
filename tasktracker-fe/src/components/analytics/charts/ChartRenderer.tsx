'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Radar,
  Scatter
} from 'react-chartjs-2';
import type { ChartData, ChartConfiguration } from '@/lib/types/analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface ChartRendererProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'area';
  data: ChartData;
  options?: any;
  width?: number;
  height?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  data,
  options = {},
  width,
  height,
  className = '',
  theme = 'light',
  responsive = true,
  maintainAspectRatio = false
}) => {
  // Apply theme to chart options
  const themedOptions = useMemo(() => {
    const themeColors = getThemeColors(theme);
    
    return {
      responsive,
      maintainAspectRatio,
      plugins: {
        legend: {
          labels: {
            color: themeColors.text,
            font: {
              family: 'Inter, sans-serif',
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: themeColors.background,
          titleColor: themeColors.text,
          bodyColor: themeColors.text,
          borderColor: themeColors.border,
          borderWidth: 1
        }
      },
      scales: type !== 'pie' && type !== 'doughnut' ? {
        x: {
          ticks: {
            color: themeColors.text,
            font: {
              family: 'Inter, sans-serif',
              size: 11
            }
          },
          grid: {
            color: themeColors.grid
          }
        },
        y: {
          ticks: {
            color: themeColors.text,
            font: {
              family: 'Inter, sans-serif',
              size: 11
            }
          },
          grid: {
            color: themeColors.grid
          }
        }
      } : undefined,
      ...options
    };
  }, [theme, options, responsive, maintainAspectRatio, type]);

  // Apply theme to chart data
  const themedData = useMemo(() => {
    const themeColors = getThemeColors(theme);
    
    return {
      ...data,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || getDatasetColors(theme, index, 'background'),
        borderColor: dataset.borderColor || getDatasetColors(theme, index, 'border'),
        borderWidth: dataset.borderWidth || 2,
        tension: type === 'line' || type === 'area' ? 0.4 : undefined,
        fill: type === 'area' ? true : dataset.fill
      }))
    };
  }, [data, theme, type]);

  const chartProps = {
    data: themedData,
    options: themedOptions,
    width,
    height
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line {...chartProps} />;
      case 'area':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      default:
        return <div className="text-red-500">Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className={`chart-container ${className}`}>
      {renderChart()}
    </div>
  );
};

// Helper function to get theme colors
function getThemeColors(theme: string) {
  const themes = {
    light: {
      text: '#374151',
      grid: '#E5E7EB',
      background: '#FFFFFF',
      border: '#D1D5DB'
    },
    dark: {
      text: '#F9FAFB',
      grid: '#374151',
      background: '#1F2937',
      border: '#4B5563'
    },
    blue: {
      text: '#1E3A8A',
      grid: '#DBEAFE',
      background: '#F0F9FF',
      border: '#93C5FD'
    },
    green: {
      text: '#14532D',
      grid: '#D1FAE5',
      background: '#F0FDF4',
      border: '#86EFAC'
    }
  };
  
  return themes[theme as keyof typeof themes] || themes.light;
}

// Helper function to get dataset colors
function getDatasetColors(theme: string, index: number, type: 'background' | 'border') {
  const colorPalettes = {
    light: [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ],
    dark: [
      '#60A5FA', '#F87171', '#34D399', '#FBBF24',
      '#A78BFA', '#F472B6', '#22D3EE', '#A3E635'
    ],
    blue: [
      '#1E40AF', '#1E3A8A', '#1D4ED8', '#2563EB',
      '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'
    ],
    green: [
      '#166534', '#15803D', '#16A34A', '#22C55E',
      '#4ADE80', '#86EFAC', '#BBF7D0', '#D1FAE5'
    ]
  };

  const palette = colorPalettes[theme as keyof typeof colorPalettes] || colorPalettes.light;
  const color = palette[index % palette.length];

  if (type === 'background') {
    // Convert hex to rgba with opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  }

  return color;
}

export default ChartRenderer; 