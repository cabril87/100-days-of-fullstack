'use client';

import { Task as TaskType } from '@/lib/types/task';
import { Task } from './Task';
import { useState, useMemo, useEffect } from 'react';
import { TaskSorter, SortOption, SortDirection } from './TaskSorter';
import { taskService } from '@/lib/services/taskService';

// Add this utility function to clear verification caches
export function clearTaskVerificationCache(): void {
  try {
    localStorage.removeItem('verifiedTaskIds');
    localStorage.removeItem('failedTaskIds');
    console.log('Task verification cache cleared');
  } catch (err) {
    console.error('Error clearing task verification cache:', err);
  }
}

// Helper function to normalize status for filtering
function normalizeStatus(status: string): string {
  if (status === 'NotStarted') return 'todo';
  if (status === 'InProgress') return 'in-progress'; 
  if (status === 'Completed') return 'done';
  return status;
}

// Helper function to normalize priority for filtering
function normalizePriority(priority: any): string {
  if (typeof priority === 'number') {
    return priority === 0 ? 'low' : priority === 1 ? 'medium' : priority === 2 ? 'high' : 'medium';
  }
  return priority;
}

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
  const [verifiedTasks, setVerifiedTasks] = useState<TaskType[]>(tasks);
  
  // Verify tasks exist on server
  useEffect(() => {
    const verifyTasksExist = async () => {
      // Skip verification if no tasks
      if (!tasks.length) return;
      
      // Start with all tasks
      let newVerifiedTasks = [...tasks];
      
      // Get verified task IDs from local storage
      const verifiedTaskIdsStr = localStorage.getItem('verifiedTaskIds');
      const verifiedTaskIds = verifiedTaskIdsStr ? JSON.parse(verifiedTaskIdsStr) : [];
      
      // Get failed task IDs from local storage (tasks we know don't exist)
      const failedTaskIdsStr = localStorage.getItem('failedTaskIds');
      const failedTaskIds = failedTaskIdsStr ? JSON.parse(failedTaskIdsStr) : [];
      
      // Filter out tasks that are known to not exist
      newVerifiedTasks = newVerifiedTasks.filter(task => 
        !failedTaskIds.includes(String(task.id))
      );
      
      // Only verify a small batch of tasks (10 most recent) that haven't been verified
      const tasksToVerify = newVerifiedTasks
        .filter(task => 
          // Only verify regular tasks (not mock) that haven't been verified yet
          Number(task.id) < 10000 && 
          !verifiedTaskIds.includes(String(task.id))
        )
        .sort((a, b) => {
          // Sort by created date (newest first)
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10); // Only verify 10 at a time
      
      if (tasksToVerify.length > 0) {
        console.log(`Verifying ${tasksToVerify.length} tasks exist on server...`);
        
        const newVerifiedIds = [...verifiedTaskIds];
        const newFailedIds = [...failedTaskIds];
        
        // Verify each task with a small delay to avoid overwhelming the server
        for (const task of tasksToVerify) {
          try {
            const response = await taskService.getTask(Number(task.id));
            
            if (response.status === 200 && response.data) {
              newVerifiedIds.push(String(task.id));
            } else {
              console.warn(`Task ${task.id} not found on server, removing from UI`);
              newFailedIds.push(String(task.id));
              // Remove this task from our local list
              newVerifiedTasks = newVerifiedTasks.filter(t => String(t.id) !== String(task.id));
            }
            
            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            console.error(`Error verifying task ${task.id}:`, err);
          }
        }
        
        // Update local storage with our verified and failed task IDs
        localStorage.setItem('verifiedTaskIds', JSON.stringify(newVerifiedIds));
        localStorage.setItem('failedTaskIds', JSON.stringify(newFailedIds));
      }
      
      setVerifiedTasks(newVerifiedTasks);
    };
    
    verifyTasksExist();
  }, [tasks]);
  
  // Apply filters first with normalization
  const filteredTasks = useMemo(() => {
    return verifiedTasks.filter(task => {
      const normalizedStatus = normalizeStatus(task.status);
      const normalizedPriority = normalizePriority(task.priority);
      
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || normalizedPriority === priorityFilter;
      
      return matchesStatus && matchesPriority;
    });
  }, [verifiedTasks, statusFilter, priorityFilter]);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Your Tasks</h2>
        <div className="flex flex-wrap gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-1.5 text-sm bg-white/80 backdrop-blur-sm focus:ring-brand-teal focus:border-brand-teal"
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
            className="border border-gray-200 rounded-full px-4 py-1.5 text-sm bg-white/80 backdrop-blur-sm focus:ring-brand-teal focus:border-brand-teal"
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
        <div className="p-8 text-center text-gray-500 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium mb-2">No tasks found</p>
          <p className="mb-4">No tasks match your current filters.</p>
          <button 
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="text-brand-teal hover:text-brand-teal/80 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
      
      <div className="text-sm text-gray-600 mt-6 text-center">
        Showing {sortedTasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
} 