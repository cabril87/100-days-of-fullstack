'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, TaskFormData, TaskQueryParams } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import { useAuth } from './AuthProvider';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (params?: TaskQueryParams) => Promise<void>;
  getTask: (id: string) => Promise<Task | null>;
  createTask: (task: TaskFormData) => Promise<Task | null>;
  updateTask: (id: string, task: Partial<TaskFormData>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskStatus: (id: string, status: string) => Promise<Task | null>;
  filterTasks: (filter: TaskQueryParams) => Promise<void>;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async () => {},
  getTask: async () => null,
  createTask: async () => null,
  updateTask: async () => null,
  deleteTask: async () => false,
  updateTaskStatus: async () => null,
  filterTasks: async () => {},
});

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshToken } = useAuth();

  // Fetch tasks on initial load - removed to prevent auth errors on first load
  // Fetching will happen after login via the tasks page

  // Make fetchTasks stable with useCallback
  const fetchTasks = useCallback(async (params?: TaskQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskService.getTasks(params);
      
      // Handle unauthorized errors gracefully
      if (response.status === 401) {
        setTasks([]);
        console.log("User not authenticated or session expired");
        setError(null); // Don't show error for auth issues
        setLoading(false);
        return;
      }
      
      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data);
      } else if (response.error) {
        setError(response.error);
        setTasks([]);
      } else {
        // If response.data exists but isn't an array
        setTasks([]);
        console.error('Expected tasks array but received:', response.data);
      }
    } catch (e) {
      console.error('Error fetching tasks:', e);
      setError('Failed to load tasks. Please try again later.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single task by ID
  const getTask = useCallback(async (id: string): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskService.getTask(Number(id));
      if (response.data) {
        return response.data;
      } else if (response.error) {
        setError(response.error);
      }
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch task');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new task
  const createTask = useCallback(async (task: TaskFormData): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('TaskProvider: Creating task with data:', task);
      const response = await taskService.createTask(task);
      
      // Response is directly a Task object
      if (response && typeof response === 'object' && 'id' in response) {
        console.log('TaskProvider: Task created successfully:', response);
        setTasks(prev => [...prev, response as Task]);
        return response as Task;
      }
      
      // Response is a standard API response
      if ('status' in response) {
        if (response.status === 401) {
          console.log("User not authenticated or session expired");
          setError('Authentication error: Please log in again');
          return null;
        }
        
        if (response.data) {
          console.log('TaskProvider: Task created successfully:', response.data);
          // Add the new task to the tasks array
          setTasks(prev => [...prev, response.data!]);
          return response.data;
        } else if (response.error) {
          console.error('TaskProvider: Error creating task:', response.error, response.details);
          // Provide more detailed error information
          let errorMsg = response.error;
          if (response.details) {
            try {
              // Try to format validation errors
              if (typeof response.details === 'object') {
                errorMsg += ': ' + Object.entries(response.details)
                  .map(([field, msgs]) => `${field} - ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                  .join('; ');
              } else if (typeof response.details === 'string') {
                errorMsg += ': ' + response.details;
              }
            } catch (e) {
              console.error('Error formatting validation details:', e);
            }
          }
          setError(errorMsg);
        }
      }
      
      // Unhandled response type
      console.error('TaskProvider: Unknown response format:', response);
      setError('Unknown error occurred while creating task');
      return null;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create task';
      console.error('TaskProvider: Exception creating task:', e);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id: string, task: Partial<TaskFormData>): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskService.updateTask(Number(id), task as any);
      if (response.data) {
        setTasks(prev => prev.map(t => String(t.id) === id ? response.data! : t));
        return response.data;
      } else if (response.error) {
        setError(response.error);
      }
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update task');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('TaskProvider: Attempting to delete task id:', id);
      
      // Try to refresh the auth token first
      console.log('TaskProvider: Refreshing auth token before deletion');
      await refreshToken();
      
      const response = await taskService.deleteTask(Number(id));
      console.log('TaskProvider: Delete task response:', response);
      
      // Success cases - 200 OK or 204 No Content
      if (response.status === 200 || response.status === 204) {
        console.log('TaskProvider: Task deleted successfully');
        
        // Remove the task from local state first for immediate UI update
        setTasks(prev => prev.filter(t => String(t.id) !== id));
        
        // Force a refresh from the API to ensure our data is in sync
        setTimeout(() => {
          console.log('TaskProvider: Refreshing task list after deletion');
          taskService.getTasks().then(response => {
            if (response.data && Array.isArray(response.data)) {
              setTasks(response.data);
            }
          });
        }, 300);
        
        return true;
      } 
      
      // Handle specific error cases
      if (response.status === 401) {
        console.error('TaskProvider: Authentication error during deletion');
        setError('Authentication error - please refresh the page and try again');
        return false;
      }
      
      // Other error handling
      if (response.error) {
        console.error('TaskProvider: Error deleting task:', response.error);
        setError(response.error);
      } else {
        console.error('TaskProvider: Unknown error deleting task. Status:', response.status);
        setError('Failed to delete task. Please try again.');
      }
      return false;
    } catch (e) {
      console.error('TaskProvider: Exception deleting task:', e);
      setError(e instanceof Error ? e.message : 'Failed to delete task');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  // Update task status
  const updateTaskStatus = useCallback(async (id: string, status: string): Promise<Task | null> => {
    // Call updateTask with just the status change
    return updateTask(id, { status: status as any });
  }, [updateTask]);

  // Filter tasks based on criteria
  const filterTasks = useCallback(async (filter: TaskQueryParams): Promise<void> => {
    return fetchTasks(filter);
  }, [fetchTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        getTask,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        filterTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}