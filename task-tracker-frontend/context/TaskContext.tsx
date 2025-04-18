"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';

// Define task types
export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Completed = 'Completed'
}

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  categoryId: number | null;
  categoryName?: string;
  createdAt: string;
  updatedAt: string | null;
  completedAt?: string | null;
};

export type CreateTaskDto = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  categoryId?: number | null;
};

export type UpdateTaskDto = Partial<CreateTaskDto>;

// Define task context state
type TaskState = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

// Define task context type
type TaskContextType = TaskState & {
  fetchTasks: () => Promise<void>;
  getTaskById: (id: number) => Task | undefined;
  createTask: (task: CreateTaskDto) => Promise<Task | null>;
  updateTask: (id: number, task: UpdateTaskDto) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  clearError: () => void;
};

// Create the task context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Task provider props
type TaskProviderProps = {
  children: ReactNode;
};

// Task provider component
export function TaskProvider({ children }: TaskProviderProps) {
  const { isAuthenticated } = useAuth();
  
  const [state, setState] = useState<TaskState>({
    tasks: [],
    isLoading: false,
    error: null,
  });

  // Fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  // Fetch all tasks
  const fetchTasks = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.tasks.getAll();
      
      if ((response.success || response.succeeded) && response.data) {
        setState({
          tasks: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to fetch tasks',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to fetch tasks',
      }));
    }
  };

  // Get task by ID
  const getTaskById = (id: number) => {
    return state.tasks.find(task => task.id === id);
  };

  // Create a new task
  const createTask = async (task: CreateTaskDto): Promise<Task | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log("TaskContext.createTask called with:", task);
      const response = await api.tasks.create(task);
      console.log("Raw API response in TaskContext:", response);
      
      // Check for both 'success' and 'succeeded' to handle different API response formats
      if ((response.success || response.succeeded) && response.data) {
        console.log("Task created successfully:", response.data);
        setState((prev) => ({
          ...prev,
          tasks: [...prev.tasks, response.data],
          isLoading: false,
        }));
        return response.data;
      } else {
        console.error("API succeeded but no data returned:", response);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to create task',
        }));
        return null;
      }
    } catch (error) {
      console.error("Error in TaskContext.createTask:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to create task',
      }));
      return null;
    }
  };

  // Update a task
  const updateTask = async (id: number, task: UpdateTaskDto): Promise<Task | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.tasks.update(id, task);
      
      if ((response.success || response.succeeded) && response.data) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === id ? response.data : t),
          isLoading: false,
        }));
        return response.data;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to update task',
        }));
        return null;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to update task',
      }));
      return null;
    }
  };

  // Delete a task
  const deleteTask = async (id: number): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.tasks.delete(id);
      
      if (response.success || response.succeeded) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== id),
          isLoading: false,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to delete task',
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to delete task',
      }));
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Provide task context
  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// Hook to use task context
export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
} 