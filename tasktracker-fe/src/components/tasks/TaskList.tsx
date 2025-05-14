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
  const [animateIn, setAnimateIn] = useState(false);
  
  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
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

  // Get stats
  const todoCount = sortedTasks.filter(task => normalizeStatus(task.status) === 'todo').length;
  const inProgressCount = sortedTasks.filter(task => normalizeStatus(task.status) === 'in-progress').length;
  const doneCount = sortedTasks.filter(task => normalizeStatus(task.status) === 'done').length;
  
  return (
    <div 
      className={`space-y-8 transition-opacity duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 card-section pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Tasks</h2>
          <div className="flex gap-3 items-center">
            <div className="flex items-center">
              <span className={`inline-block h-2.5 w-2.5 rounded-full bg-brand-navy mr-1.5`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{todoCount} To Do</span>
            </div>
            <div className="flex items-center">
              <span className={`inline-block h-2.5 w-2.5 rounded-full bg-brand-beige mr-1.5`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{inProgressCount} In Progress</span>
            </div>
            <div className="flex items-center">
              <span className={`inline-block h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{doneCount} Done</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-2 text-sm bg-white/80 backdrop-blur-sm focus:ring-brand-navy focus:border-brand-navy dark:border-gray-700 dark:bg-white/10 shadow-sm"
            aria-label="Filter by status"
            style={{ transition: 'all 0.2s ease' }}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-2 text-sm bg-white/80 backdrop-blur-sm focus:ring-brand-navy focus:border-brand-navy dark:border-gray-700 dark:bg-white/10 shadow-sm"
            aria-label="Filter by priority"
            style={{ transition: 'all 0.2s ease' }}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
        <TaskSorter onSort={handleSort} />
      </div>
      
      {sortedTasks.length === 0 ? (
        <div 
          className="p-10 text-center text-gray-500 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:bg-white/5 dark:border-gray-700/50 shadow-sm"
          style={{ 
            animation: 'fadeIn 0.5s ease-in-out',
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-white/50 dark:to-black/20 rounded-full"></div>
          </div>
          <p className="text-xl font-medium mb-3 text-brand-navy-dark dark:text-brand-cream">No tasks found</p>
          <p className="mb-6 max-w-md mx-auto text-gray-600 dark:text-gray-400">No tasks match your current filters.</p>
          <button 
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="text-brand-navy hover:text-brand-navy/80 font-medium dark:text-brand-beige dark:hover:text-brand-beige/80 px-4 py-2 bg-brand-navy/5 dark:bg-brand-beige/10 rounded-full hover:bg-brand-navy/10 dark:hover:bg-brand-beige/20 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTasks && sortedTasks.map((task, index) => (
            <div 
              key={task.id}
              style={{ 
                animation: `fadeSlideIn 0.4s ease-out forwards`,
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                transform: 'translateY(10px)'
              }}
            >
              <Task
                task={task}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}
      
      {sortedTasks.length > 0 && (
        <div 
          className="text-sm text-gray-600 dark:text-gray-400 mt-8 text-center bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm py-2 px-4 rounded-full border border-gray-200/50 dark:border-gray-700/30 inline-block mx-auto"
          style={{ 
            animation: 'fadeIn 0.5s ease-in-out',
            boxShadow: '0 2px 10px -5px rgba(0, 0, 0, 0.03)'
          }}
        >
          Showing {sortedTasks.length} of {tasks.length} tasks
        </div>
      )}
      
      {/* Styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeSlideIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 