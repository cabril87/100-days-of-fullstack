'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, TaskFormData, TaskQueryParams } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import { useAuth } from './AuthContext';

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

  // Helper function to normalize task data
  const normalizeTaskData = (task: Task): Task => {
    // Normalize status values
    let normalizedStatus = task.status;
    if (task.status === 'NotStarted' as any) normalizedStatus = 'todo';
    else if (task.status === 'InProgress' as any) normalizedStatus = 'in-progress';
    else if (task.status === 'Completed' as any) normalizedStatus = 'done';
    
    // Normalize priority values
    let normalizedPriority = task.priority;
    if (typeof task.priority === 'number') {
      normalizedPriority = task.priority === 0 ? 'low' : 
                          task.priority === 1 ? 'medium' : 
                          task.priority === 2 ? 'high' : 'medium';
    }
    
    return {
      ...task,
      status: normalizedStatus as any,
      priority: normalizedPriority as any
    };
  };

  // Update an existing task
  const updateTask = useCallback(async (id: string, task: Partial<TaskFormData>): Promise<Task | null> => {
    console.log('TaskProvider: --------- UPDATE TASK START ---------');
    console.log('TaskProvider: Updating task with ID:', id);
    console.log('TaskProvider: Update data received:', JSON.stringify(task, null, 2));
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the existing task from our state to make sure we have complete data
      const existingTask = tasks.find(t => String(t.id) === id);
      if (!existingTask) {
        console.warn('TaskProvider: Task to update not found in current state:', id);
      } else {
        console.log('TaskProvider: Existing task in state:', JSON.stringify(existingTask, null, 2));
      }
      
      // Check that we have a valid auth token
      const hasToken = !!localStorage.getItem('token');
      if (!hasToken) {
        console.error('TaskProvider: No authentication token found!');
        setError('Authentication required - please log in again');
        setLoading(false);
        return null;
      }
      
      // Only log once we're about to make the API call
      console.log('TaskProvider: Sending update to API...');
      const response = await taskService.updateTask(Number(id), task as any);
      
      // Log results after receiving the response
      console.log('TaskProvider: Update task response status:', response.status);
      if (response.data) {
        console.log('TaskProvider: Update successful, received data:', JSON.stringify(response.data, null, 2));
      }
      if (response.error) {
        console.log('TaskProvider: Update failed with error:', response.error);
        if (response.details) {
          console.log('TaskProvider: Error details:', response.details);
        }
        
        // Handle version conflict errors (optimistic concurrency)
        if (response.status === 409 || response.status === 412) {
          if (response.details?.type === 'VersionConflict') {
            setError(`Version conflict: ${response.details.message}. The task has been refreshed with the latest data.`);
            
            // If we got refreshed data back, update our local state
            if (response.data) {
              // Update the task in the tasks list
              setTasks(prev => 
                prev.map(t => t.id === Number(id) ? response.data! : t)
              );
            } else {
              // Re-fetch all tasks to get the latest state
              await fetchTasks();
            }
            
            setLoading(false);
            return null;
          }
        }
      }
      
      if (response.data) {
        // Update was successful, update local state
        const updatedTask = response.data;
        
        // Update the tasks list with the updated task
        setTasks(prev => 
          prev.map(t => t.id === Number(id) ? updatedTask : t)
        );
        
        setLoading(false);
        return updatedTask;
      } else if (response.status === 200 || response.status === 204) {
        // Success but no data returned, refresh the task
        console.log('TaskProvider: Success response with no data, refreshing task');
        
        // Optimistic update: merge changes into the existing task 
        if (existingTask) {
          const optimisticUpdate: Task = {
            ...existingTask,
            ...(task.title !== undefined && { title: task.title }),
            ...(task.description !== undefined && { 
              description: task.description === null ? '' : task.description 
            }),
            ...(task.status !== undefined && { status: task.status }),
            ...(task.priority !== undefined && { priority: task.priority }),
            ...(task.dueDate !== undefined && { 
              dueDate: task.dueDate === null ? undefined : task.dueDate 
            }),
            updatedAt: new Date().toISOString()
          };
          
          // Update the tasks list with our optimistic update
          setTasks(prev => 
            prev.map(t => t.id === Number(id) ? optimisticUpdate : t)
          );
          
          // Also refresh the task list
          fetchTasks().catch(err => console.error('Error refreshing tasks after update:', err));
          
          setLoading(false);
          return optimisticUpdate;
        }
        
        // If we didn't have the existing task, refresh the entire list
        await fetchTasks();
        const refreshedTask = tasks.find(t => String(t.id) === id) || null;
        setLoading(false);
        return refreshedTask;
      }
      
      // Handle error cases
      const errorMessage = response.error || 'Failed to update task';
      console.error('TaskProvider: Update failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error updating task';
      console.error('TaskProvider: Error in updateTask:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [tasks, setTasks, fetchTasks]);

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
        
        // Update state immediately to reflect the deletion
        setTasks(prev => prev.filter(t => String(t.id) !== id));
        
        // Clear task verification caches
        try {
          // Add task ID to the failed tasks cache (known non-existent tasks)
          const failedTaskIdsStr = localStorage.getItem('failedTaskIds');
          const failedTaskIds = failedTaskIdsStr ? JSON.parse(failedTaskIdsStr) : [];
          
          if (!failedTaskIds.includes(id)) {
            failedTaskIds.push(id);
            localStorage.setItem('failedTaskIds', JSON.stringify(failedTaskIds));
          }
          
          // Remove from verified tasks if present
          const verifiedTaskIdsStr = localStorage.getItem('verifiedTaskIds');
          if (verifiedTaskIdsStr) {
            const verifiedTaskIds = JSON.parse(verifiedTaskIdsStr);
            const updatedVerifiedIds = verifiedTaskIds.filter((taskId: string) => taskId !== id);
            localStorage.setItem('verifiedTaskIds', JSON.stringify(updatedVerifiedIds));
          }
          
          console.log('TaskProvider: Updated task verification caches after deletion');
        } catch (err) {
          console.error('TaskProvider: Error updating task verification caches:', err);
        }
        
        return true;
      } 
      
      // Handle specific error cases
      if (response.status === 401) {
        console.error('TaskProvider: Authentication error during deletion');
        setError('Authentication error - please refresh the page and try again');
        return false;
      }
      
      // If we get here, the deletion might have failed
      if (response.error) {
        console.error('TaskProvider: Error deleting task:', response.error);
        setError(response.error);
      } else {
        console.error('TaskProvider: Unknown error deleting task. Status:', response.status);
        setError('Failed to delete task. Please try again.');
      }
      
      // Try to refresh the task list to ensure state consistency
      console.log('TaskProvider: Refreshing tasks list after failed deletion');
      setTimeout(() => {
        fetchTasks().catch(err => 
          console.error('TaskProvider: Error refreshing tasks after deletion failure:', err)
        );
      }, 500);
      
      return false;
    } catch (e) {
      console.error('TaskProvider: Exception deleting task:', e);
      setError(e instanceof Error ? e.message : 'Failed to delete task');
      
      // Try to refresh the task list to ensure state consistency
      console.log('TaskProvider: Refreshing tasks list after deletion exception');
      setTimeout(() => {
        fetchTasks().catch(err => 
          console.error('TaskProvider: Error refreshing tasks after deletion exception:', err)
        );
      }, 500);
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshToken, fetchTasks]);

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