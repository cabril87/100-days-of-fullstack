import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '../types/task';
import { taskService } from '../services/taskService';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const mapStringToTaskStatus = (status: string): TaskStatus => {
    switch(status) {
      case 'todo': return TaskStatus.NotStarted;
      case 'in-progress': return TaskStatus.InProgress;
      case 'done': return TaskStatus.Completed;
      default: return TaskStatus.NotStarted;
    }
  };

  const mapStringToTaskPriority = (priority?: string): TaskPriority | undefined => {
    if (!priority) return undefined;
    
    switch(priority) {
      case 'low': return TaskPriority.Low;
      case 'medium': return TaskPriority.Medium;
      case 'high': return TaskPriority.High;
      default: return TaskPriority.Medium;
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasks();
      if (response.data) {
        setTasks(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to fetch tasks. Please try again later.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: TaskFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const createRequest = {
        title: taskData.title,
        description: taskData.description || '',
        status: typeof taskData.status === 'string' ? mapStringToTaskStatus(taskData.status) : taskData.status,
        priority: taskData.priority ? mapStringToTaskPriority(taskData.priority) : undefined,
        dueDate: taskData.dueDate
      };
      
      const response = await taskService.createTask(createRequest);
      if (response.data) {
        setTasks(prevTasks => [...prevTasks, response.data!]);
        return response.data;
      } else if (response.error) {
        throw new Error(response.error);
      }
      return null;
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: number, taskData: Partial<TaskFormData>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updateRequest = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status ? mapStringToTaskStatus(taskData.status) : undefined,
        priority: taskData.priority ? mapStringToTaskPriority(taskData.priority) : undefined,
        dueDate: taskData.dueDate
      };
      
      const response = await taskService.updateTask(id, updateRequest);
      if (response.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === id ? response.data! : task
          )
        );
        setSelectedTask(null);
        return response.data;
      } else if (response.error) {
        throw new Error(response.error);
      }
      return null;
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.deleteTask(id);
      if (response.status === 204 || response.status === 200) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        if (selectedTask?.id === id) {
          setSelectedTask(null);
        }
        return true;
      } else if (response.error) {
        throw new Error(response.error);
      }
      return false;
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (id: number, status: string) => {
    try {
      setError(null);
      const taskStatus = mapStringToTaskStatus(status);
      const response = await taskService.updateTask(id, { status: taskStatus });
      
      if (response.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === id ? response.data! : task
          )
        );
        return response.data;
      } else if (response.error) {
        throw new Error(response.error);
      }
      return null;
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const selectTaskForEdit = (task: Task) => {
    setSelectedTask(task);
  };

  const clearSelectedTask = () => {
    setSelectedTask(null);
  };

  return {
    tasks,
    loading,
    error,
    selectedTask,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    selectTaskForEdit,
    clearSelectedTask
  };
} 