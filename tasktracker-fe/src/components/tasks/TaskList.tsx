'use client';

import { Task as TaskType } from '@/lib/types/task';
import { Task } from './Task';
import { useState, useMemo } from 'react';
import { TaskSorter, SortOption, SortDirection } from './TaskSorter';

interface TaskListProps {
  tasks: TaskType[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskType) => void;
}

export function TaskList({ tasks, onStatusChange, onDelete, onEdit }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Apply filters first
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [tasks, statusFilter, priorityFilter]);

  // Then apply sorting
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Handle case when the property might be undefined
      const aValue = a[sortField as keyof TaskType];
      const bValue = b[sortField as keyof TaskType];
      
      // If either value is undefined, move it to the end
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Special handling for dates
      if (sortField === 'dueDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
        const dateA = aValue ? new Date(aValue as string).getTime() : 0;
        const dateB = bValue ? new Date(bValue as string).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // For regular string/number comparisons
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, sortField, sortDirection]);

  // Handle sort changes
  const handleSort = (field: SortOption, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex flex-wrap gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <TaskSorter onSort={handleSort} />
      
      {sortedTasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500 border rounded-lg">
          No tasks found matching the selected filters.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTasks && sortedTasks.map(task => (
            <Task
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-4">
        Showing {sortedTasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
} 