'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { FilterCriteria } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FilterIcon, 
  StarIcon, 
  ClockIcon, 
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'time' | 'status' | 'priority' | 'performance';
  criteria: FilterCriteria;
  color: string;
}

interface FilterPresetsProps {
  className?: string;
  onPresetApply?: (criteria: FilterCriteria, presetName: string) => void;
}

export const FilterPresets: React.FC<FilterPresetsProps> = ({
  className = '',
  onPresetApply
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Define preset filters
  const presets: FilterPreset[] = [
    // Time-based presets
    {
      id: 'today',
      name: 'Today',
      description: 'Tasks for today',
      icon: <CalendarIcon className="h-4 w-4" />,
      category: 'time',
      criteria: {
        dateRange: {
          startDate: startOfDay(new Date()).toISOString(),
          endDate: endOfDay(new Date()).toISOString()
        }
      },
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'this-week',
      name: 'This Week',
      description: 'Tasks from the past 7 days',
      icon: <CalendarIcon className="h-4 w-4" />,
      category: 'time',
      criteria: {
        dateRange: {
          startDate: subDays(new Date(), 7).toISOString(),
          endDate: new Date().toISOString()
        }
      },
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'last-month',
      name: 'Last Month',
      description: 'Tasks from the past 30 days',
      icon: <CalendarIcon className="h-4 w-4" />,
      category: 'time',
      criteria: {
        dateRange: {
          startDate: subMonths(new Date(), 1).toISOString(),
          endDate: new Date().toISOString()
        }
      },
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },

    // Status-based presets
    {
      id: 'completed',
      name: 'Completed',
      description: 'All completed tasks',
      icon: <CheckCircleIcon className="h-4 w-4" />,
      category: 'status',
      criteria: {
        status: ['Completed']
      },
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      description: 'Currently active tasks',
      icon: <PlayIcon className="h-4 w-4" />,
      category: 'status',
      criteria: {
        status: ['InProgress']
      },
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      id: 'pending',
      name: 'Pending',
      description: 'Tasks not yet started',
      icon: <PauseIcon className="h-4 w-4" />,
      category: 'status',
      criteria: {
        status: ['Todo']
      },
      color: 'bg-gray-50 text-gray-700 border-gray-200'
    },

    // Priority-based presets
    {
      id: 'high-priority',
      name: 'High Priority',
      description: 'Critical and high priority tasks',
      icon: <AlertTriangleIcon className="h-4 w-4" />,
      category: 'priority',
      criteria: {
        priority: [3, 4] // High and Critical
      },
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      id: 'low-priority',
      name: 'Low Priority',
      description: 'Low priority tasks',
      icon: <TrendingUpIcon className="h-4 w-4" />,
      category: 'priority',
      criteria: {
        priority: [1] // Low priority
      },
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },

    // Category-based presets
    {
      id: 'work-tasks',
      name: 'Work',
      description: 'Work-related tasks',
      icon: <UsersIcon className="h-4 w-4" />,
      category: 'performance',
      criteria: {
        categories: ['Work']
      },
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'personal-tasks',
      name: 'Personal',
      description: 'Personal tasks',
      icon: <StarIcon className="h-4 w-4" />,
      category: 'performance',
      criteria: {
        categories: ['Personal']
      },
      color: 'bg-pink-50 text-pink-700 border-pink-200'
    },

    // Complex presets
    {
      id: 'overdue-high-priority',
      name: 'Overdue & High Priority',
      description: 'High priority tasks that are overdue',
      icon: <AlertTriangleIcon className="h-4 w-4" />,
      category: 'priority',
      criteria: {
        priority: [3, 4],
        status: ['Todo', 'InProgress']
      },
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      id: 'recent-completed',
      name: 'Recently Completed',
      description: 'Tasks completed in the last week',
      icon: <CheckCircleIcon className="h-4 w-4" />,
      category: 'time',
      criteria: {
        status: ['Completed'],
        dateRange: {
          startDate: subWeeks(new Date(), 1).toISOString(),
          endDate: new Date().toISOString()
        }
      },
      color: 'bg-green-50 text-green-700 border-green-200'
    }
  ];

  // Group presets by category
  const groupedPresets = presets.reduce((groups, preset) => {
    if (!groups[preset.category]) {
      groups[preset.category] = [];
    }
    groups[preset.category].push(preset);
    return groups;
  }, {} as Record<string, FilterPreset[]>);

  // Apply preset filter
  const applyPreset = (preset: FilterPreset) => {
    setActivePreset(preset.id);
    
    if (onPresetApply) {
      onPresetApply(preset.criteria, preset.name);
    }
  };

  // Clear active preset
  const clearPresets = () => {
    setActivePreset(null);
    
    if (onPresetApply) {
      onPresetApply({}, 'None');
    }
  };

  // Get category display names
  const getCategoryDisplayName = (category: string) => {
    const names = {
      time: 'Time Filters',
      status: 'Status Filters',
      priority: 'Priority Filters',
      performance: 'Category Filters'
    };
    return names[category as keyof typeof names] || category;
  };

  // Get category icons
  const getCategoryIcon = (category: string) => {
    const icons = {
      time: <ClockIcon className="h-4 w-4" />,
      status: <PlayIcon className="h-4 w-4" />,
      priority: <AlertTriangleIcon className="h-4 w-4" />,
      performance: <TrendingUpIcon className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <FilterIcon className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Quick Filters
          </CardTitle>
          
          {activePreset && (
            <Button onClick={clearPresets} variant="outline" size="sm">
              Clear Filter
            </Button>
          )}
        </div>

        {/* Active preset indicator */}
        {activePreset && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Active: {presets.find(p => p.id === activePreset)?.name}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(groupedPresets).map(([category, categoryPresets]) => (
          <div key={category} className="space-y-3">
            {/* Category header */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              {getCategoryIcon(category)}
              {getCategoryDisplayName(category)}
            </div>

            {/* Preset buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryPresets.map((preset) => (
                <Button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  variant={activePreset === preset.id ? 'default' : 'outline'}
                  className={`h-auto p-4 flex flex-col items-start gap-2 text-left ${
                    activePreset === preset.id ? '' : preset.color
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    {preset.icon}
                    <span className="font-medium text-sm">{preset.name}</span>
                  </div>
                  <p className="text-xs opacity-80 line-clamp-2">
                    {preset.description}
                  </p>
                </Button>
              ))}
            </div>
          </div>
        ))}

        {/* Preset statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {presets.length}
            </div>
            <div className="text-sm text-gray-600">Total Presets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(groupedPresets).length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {activePreset ? 1 : 0}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {presets.filter(p => p.criteria.status || p.criteria.priority).length}
            </div>
            <div className="text-sm text-gray-600">Smart Filters</div>
          </div>
        </div>

        {/* Custom filter hint */}
        <div className="text-center text-sm text-gray-500 p-4 bg-blue-50 rounded-lg">
          💡 <strong>Pro Tip:</strong> Use the Advanced Filter Builder for custom filters, 
          or save your own presets for quick access.
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPresets; 