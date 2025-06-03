'use client';

/**
 * Task Filter and Search Component
 * Provides filtering and search functionality for the Kanban board
 */

import React, { useState, useCallback } from 'react';

// Types
import { KanbanFilter, KanbanSort } from '@/lib/types/kanban';
import { TaskStatusType } from '@/lib/types/task';

// Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Icons
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc,
  Calendar,
  User,
  Flag,
  Tag
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

interface TaskFilterSearchProps {
  filter: KanbanFilter;
  sort: KanbanSort;
  onFilterChange: (filter: KanbanFilter) => void;
  onSortChange: (sort: KanbanSort) => void;
  onClearFilters: () => void;
  className?: string;
}

export function TaskFilterSearch({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onClearFilters,
  className = ''
}: TaskFilterSearchProps) {
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery || '');

  // Handle search input with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onFilterChange({ ...filter, searchQuery: value || undefined });
  }, [filter, onFilterChange]);

  // Handle status filter
  const handleStatusChange = useCallback((status: TaskStatusType, checked: boolean) => {
    const currentStatuses = filter.status || [];
    const newStatuses = checked 
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onFilterChange({ 
      ...filter, 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  }, [filter, onFilterChange]);

  // Handle priority filter
  const handlePriorityChange = useCallback((priority: string, checked: boolean) => {
    const currentPriorities = filter.priority || [];
    const newPriorities = checked 
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    onFilterChange({ 
      ...filter, 
      priority: newPriorities.length > 0 ? newPriorities : undefined 
    });
  }, [filter, onFilterChange]);

  // Handle assignee filter
  const handleAssigneeChange = useCallback((assignee: string, checked: boolean) => {
    const currentAssignees = filter.assignee || [];
    const newAssignees = checked 
      ? [...currentAssignees, assignee]
      : currentAssignees.filter(a => a !== assignee);
    
    onFilterChange({ 
      ...filter, 
      assignee: newAssignees.length > 0 ? newAssignees : undefined 
    });
  }, [filter, onFilterChange]);

  // Handle due date filter
  const handleDueDateChange = useCallback((field: 'from' | 'to', value: string) => {
    const currentDueDate = filter.dueDate || {};
    const newDueDate = { ...currentDueDate, [field]: value || undefined };
    
    // Remove empty dueDate object
    if (!newDueDate.from && !newDueDate.to) {
      onFilterChange({ ...filter, dueDate: undefined });
    } else {
      onFilterChange({ ...filter, dueDate: newDueDate });
    }
  }, [filter, onFilterChange]);

  // Handle sort change
  const handleSortChange = useCallback((field: string) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ 
      field: field as KanbanSort['field'], 
      direction: newDirection 
    });
  }, [sort, onSortChange]);

  // Count active filters
  const activeFilterCount = [
    filter.status?.length,
    filter.priority?.length, 
    filter.assignee?.length,
    filter.tags?.length,
    filter.dueDate?.from || filter.dueDate?.to ? 1 : 0,
    filter.searchQuery ? 1 : 0
  ].filter(Boolean).reduce((sum, count) => sum + (count || 0), 0);

  const statusOptions: { value: TaskStatusType; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: Calendar },
    { value: 'priority', label: 'Priority', icon: Flag },
    { value: 'createdAt', label: 'Created', icon: Calendar },
    { value: 'title', label: 'Title', icon: Tag }
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border", className)}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear all
              </Button>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filter.status?.includes(status.value) || false}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`status-${status.value}`} className="text-sm">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <div className="space-y-2">
                {priorityOptions.map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={filter.priority?.includes(priority.value) || false}
                      onCheckedChange={(checked) => 
                        handlePriorityChange(priority.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`priority-${priority.value}`} className="text-sm">
                      <Badge variant="secondary" className={cn("text-xs", priority.color)}>
                        {priority.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Due Date Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Due Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filter.dueDate?.from || ''}
                    onChange={(e) => handleDueDateChange('from', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filter.dueDate?.to || ''}
                    onChange={(e) => handleDueDateChange('to', e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Dropdown */}
      <Select
        value={sort.field}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-auto">
          <div className="flex items-center gap-2">
            {sort.direction === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            <SelectValue placeholder="Sort by..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filter.searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filter.searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto w-auto p-0"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filter.status?.map(status => (
            <Badge key={status} variant="secondary" className="text-xs">
              {statusOptions.find(s => s.value === status)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto w-auto p-0"
                onClick={() => handleStatusChange(status, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filter.priority?.map(priority => (
            <Badge key={priority} variant="secondary" className="text-xs">
              {priorityOptions.find(p => p.value === priority)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto w-auto p-0"
                onClick={() => handlePriorityChange(priority, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 