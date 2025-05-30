'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { savedFiltersService } from '@/lib/services/analytics';
import type { FilterCriteria } from '@/lib/types/analytics';
import type { CreateSavedFilterRequest } from '@/lib/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FilterIcon, 
  PlusIcon, 
  XIcon, 
  CalendarIcon, 
  SaveIcon,
  TrashIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
}

interface AdvancedFilterBuilderProps {
  className?: string;
  onFilterApply?: (criteria: FilterCriteria) => void;
  onFilterSave?: (filter: CreateSavedFilterRequest) => void;
  initialCriteria?: FilterCriteria;
}

export const AdvancedFilterBuilder: React.FC<AdvancedFilterBuilderProps> = ({
  className = '',
  onFilterApply,
  onFilterSave,
  initialCriteria
}) => {
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [filterName, setFilterName] = useState('');
  const [dateRange, setDateRange] = useState<{start?: Date; end?: Date}>({});
  const [saving, setSaving] = useState(false);

  // Available filter fields
  const filterFields = [
    { value: 'status', label: 'Status', type: 'select' as const },
    { value: 'priority', label: 'Priority', type: 'select' as const },
    { value: 'category', label: 'Category', type: 'select' as const },
    { value: 'assignedTo', label: 'Assigned To', type: 'select' as const },
    { value: 'tags', label: 'Tags', type: 'multiselect' as const },
    { value: 'title', label: 'Title', type: 'text' as const },
    { value: 'description', label: 'Description', type: 'text' as const },
    { value: 'createdAt', label: 'Created Date', type: 'date' as const },
    { value: 'dueDate', label: 'Due Date', type: 'date' as const },
    { value: 'completedAt', label: 'Completed Date', type: 'date' as const }
  ];

  // Available operators by field type
  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'startsWith', label: 'Starts with' },
      { value: 'endsWith', label: 'Ends with' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'lessThan', label: 'Less than' },
      { value: 'between', label: 'Between' }
    ],
    date: [
      { value: 'on', label: 'On' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'between', label: 'Between' }
    ],
    select: [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not equals' },
      { value: 'in', label: 'In' }
    ],
    multiselect: [
      { value: 'contains', label: 'Contains' },
      { value: 'containsAll', label: 'Contains all' },
      { value: 'containsAny', label: 'Contains any' }
    ]
  };

  // Options for select fields
  const selectOptions = {
    status: ['Todo', 'InProgress', 'Completed', 'Cancelled'],
    priority: ['Low', 'Medium', 'High', 'Critical'],
    category: ['Work', 'Personal', 'Family', 'Health', 'Finance', 'Education'],
    assignedTo: ['User 1', 'User 2', 'User 3'] // This would come from API
  };

  // Add a new filter rule
  const addRule = () => {
    const newRule: FilterRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: '',
      value: '',
      type: 'text'
    };
    setRules([...rules, newRule]);
  };

  // Remove a filter rule
  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // Update a rule
  const updateRule = (id: string, updates: Partial<FilterRule>) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  // Get field type and update rule when field changes
  const handleFieldChange = (ruleId: string, fieldValue: string) => {
    const field = filterFields.find(f => f.value === fieldValue);
    if (field) {
      updateRule(ruleId, {
        field: fieldValue,
        type: field.type,
        operator: '', // Reset operator when field changes
        value: field.type === 'multiselect' ? [] : ''
      });
    }
  };

  // Build filter criteria from current state
  const buildFilterCriteria = (): FilterCriteria => {
    const criteria: FilterCriteria = {};

    // Add date range if set
    if (dateRange.start && dateRange.end) {
      criteria.dateRange = {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      };
    }

    // Process rules
    rules.forEach(rule => {
      if (rule.field && rule.operator && rule.value) {
        switch (rule.field) {
          case 'status':
            if (!criteria.status) criteria.status = [];
            if (Array.isArray(rule.value)) {
              criteria.status.push(...rule.value);
            } else {
              criteria.status.push(rule.value);
            }
            break;
          case 'priority':
            if (!criteria.priority) criteria.priority = [];
            if (Array.isArray(rule.value)) {
              criteria.priority.push(...rule.value.map(Number));
            } else {
              criteria.priority.push(Number(rule.value));
            }
            break;
          case 'category':
            if (!criteria.categories) criteria.categories = [];
            if (Array.isArray(rule.value)) {
              criteria.categories.push(...rule.value);
            } else {
              criteria.categories.push(rule.value);
            }
            break;
          case 'tags':
            if (!criteria.tags) criteria.tags = [];
            if (Array.isArray(rule.value)) {
              criteria.tags.push(...rule.value);
            } else {
              criteria.tags.push(rule.value);
            }
            break;
        }
      }
    });

    return criteria;
  };

  // Apply filter
  const handleApplyFilter = () => {
    const criteria = buildFilterCriteria();
    if (onFilterApply) {
      onFilterApply(criteria);
    }
  };

  // Save filter
  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    try {
      setSaving(true);
      const criteria = buildFilterCriteria();
      const filterRequest: CreateSavedFilterRequest = {
        name: filterName,
        filterCriteria: criteria,
        queryType: 'task',
        isPublic: false
      };

      await savedFiltersService.saveFilter(filterRequest);
      
      if (onFilterSave) {
        onFilterSave(filterRequest);
      }

      // Reset form
      setFilterName('');
      setRules([]);
      setDateRange({});
    } catch (error) {
      console.error('Failed to save filter:', error);
      alert('Failed to save filter');
    } finally {
      setSaving(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setRules([]);
    setDateRange({});
    setFilterName('');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          Advanced Filter Builder
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date" className="text-xs text-gray-500">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start ? format(dateRange.start, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="end-date" className="text-xs text-gray-500">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end ? format(dateRange.end, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Separator />

        {/* Filter Rules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Filter Rules</Label>
            <Button onClick={addRule} variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FilterIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No filter rules added yet</p>
              <p className="text-sm">Click "Add Rule" to start building your filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <Card key={rule.id} className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Field selector */}
                    <div className="col-span-3">
                      <Select
                        value={rule.field}
                        onValueChange={(value) => handleFieldChange(rule.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterFields.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator selector */}
                    <div className="col-span-3">
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateRule(rule.id, { operator: value })}
                        disabled={!rule.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {rule.field && operators[rule.type]?.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value input */}
                    <div className="col-span-5">
                      {rule.type === 'select' && (
                        <Select
                          value={rule.value}
                          onValueChange={(value) => updateRule(rule.id, { value })}
                          disabled={!rule.operator}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {rule.field && selectOptions[rule.field as keyof typeof selectOptions]?.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {rule.type === 'text' && (
                        <Input
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          placeholder="Enter value"
                          disabled={!rule.operator}
                        />
                      )}

                      {rule.type === 'multiselect' && (
                        <div className="space-y-2">
                          {rule.field && selectOptions[rule.field as keyof typeof selectOptions]?.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${rule.id}-${option}`}
                                checked={Array.isArray(rule.value) && rule.value.includes(option)}
                                onCheckedChange={(checked) => {
                                  const currentValues = Array.isArray(rule.value) ? rule.value : [];
                                  const newValues = checked
                                    ? [...currentValues, option]
                                    : currentValues.filter(v => v !== option);
                                  updateRule(rule.id, { value: newValues });
                                }}
                              />
                              <Label htmlFor={`${rule.id}-${option}`} className="text-sm">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <div className="col-span-1">
                      <Button
                        onClick={() => removeRule(rule.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-4">
          {/* Save filter */}
          <div className="space-y-2">
            <Label htmlFor="filter-name">Save Filter (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name"
                className="flex-1"
              />
              <Button
                onClick={handleSaveFilter}
                disabled={!filterName.trim() || saving}
                variant="outline"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <SaveIcon className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>

          {/* Apply/Clear buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilter}
              className="flex-1"
              disabled={rules.length === 0 && !dateRange.start && !dateRange.end}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              disabled={rules.length === 0 && !dateRange.start && !dateRange.end}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilterBuilder; 