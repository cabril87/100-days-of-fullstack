'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';

interface TaskFiltersProps {
  isBatchMode: boolean;
  searchQuery: string;
  statusFilter: string;
  memberFilter: string;
  priorityFilter: string;
  familyMembers: FamilyMemberDTO[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: 'all' | 'assigned' | 'completed' | 'overdue' | 'pending') => void;
  onMemberFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
}

/**
 * Task Filters Component - OVERFLOW SAFE
 * 
 * OVERFLOW FIXES APPLIED:
 * - Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
 * - Reduced padding: p-4 sm:p-6
 * - Input width: w-full with proper min-w-0
 * - Select truncation: truncate on trigger text
 * - Mobile-first approach: simplified in batch mode
 * 
 * Mobile layout: Single column, full width inputs
 */
export default function TaskFilters({
  isBatchMode,
  searchQuery,
  statusFilter,
  memberFilter,
  priorityFilter,
  familyMembers,
  onSearchChange,
  onStatusFilterChange,
  onMemberFilterChange,
  onPriorityFilterChange
}: TaskFiltersProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <span className="truncate">
            {isBatchMode ? 'Quick Search' : 'Filters & Search'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 max-w-full overflow-hidden">
        {isBatchMode ? (
          /* Batch Mode: Simplified Search Only */
          <div className="relative max-w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Search tasks for selection..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>
        ) : (
          /* Normal Mode: Full Filter Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full overflow-hidden">
            {/* Search */}
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full min-w-0"
              />
            </div>

            {/* Status Filter */}
            <div className="min-w-0">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Status" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Member Filter */}
            <div className="min-w-0">
              <Select value={memberFilter} onValueChange={onMemberFilterChange}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Member" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.user?.firstName || member.user?.username || `Member ${member.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="min-w-0">
              <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Priority" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 