'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, TaskFormData, TaskQueryParams } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';

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

  // Fetch tasks on initial load
  useEffect(() => {
    fetchTasks();
  }, []);

  // Make fetchTasks stable with useCallback
  const fetchTasks = useCallback(async (params?: TaskQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskService.getTasks(params);
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
      setError(e instanceof Error ? e.message : 'Failed to fetch tasks');
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
      const response = await taskService.createTask(task as any);
      if (response.data) {
        setTasks(prev => [...prev, response.data!]);
        return response.data;
      } else if (response.error) {
        setError(response.error);
      }
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task');
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
      const response = await taskService.deleteTask(Number(id));
      if (response.status === 200 || response.status === 204) {
        setTasks(prev => prev.filter(t => String(t.id) !== id));
        return true;
      } else if (response.error) {
        setError(response.error);
      }
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete task');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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