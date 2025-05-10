
import { apiService } from '@/lib/services/apiService';
import { ApiResponse } from '@/lib/types/api';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskQueryParams 
} from '@/lib/types/task';
import { TaskFormData } from '../types/task';
import DOMPurify from 'dompurify';
import { mockTasks } from './mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const USE_MOCK_DATA = true;

let mockTasksData = [...mockTasks];

const sanitizeData = (data: any) => {
  const sanitized = { ...data };
  
  if (typeof sanitized.title === 'string') {
    sanitized.title = DOMPurify.sanitize(sanitized.title);
  }
  
  if (typeof sanitized.description === 'string') {
    sanitized.description = DOMPurify.sanitize(sanitized.description);
  }
  
  return sanitized;
};

class TaskService {

  async getTasks(params?: TaskQueryParams): Promise<ApiResponse<Task[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredTasks = [...mockTasksData];
      
      if (params) {
        if (params.status) {
          filteredTasks = filteredTasks.filter(task => task.status === params.status);
        }
        
        if (params.priority) {
          filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
        }
        
        if (params.search) {
          const searchLower = String(params.search).toLowerCase();
          filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchLower) || 
            task.description.toLowerCase().includes(searchLower)
          );
        }
      }
      
      return {
        data: filteredTasks,
        status: 200
      };
    }
    

    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`${key}[]`, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      queryString = searchParams.toString();
    }
    
    return apiService.get<Task[]>(`/v1/taskitems${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id: number): Promise<ApiResponse<Task>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const task = mockTasksData.find(t => t.id === id);
      
      if (task) {
        return {
          data: { ...task },
          status: 200
        };
      } else {
        return {
          error: 'Task not found',
          status: 404
        };
      }
    }
    
    return apiService.get<Task>(`/v1/taskitems/${id}`);
  }
  

  async createTask(taskData: TaskFormData): Promise<ApiResponse<Task>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date().toISOString();
      const newTask: Task = {
        id: Math.max(...mockTasksData.map(t => t.id)) + 1,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        createdAt: now,
        updatedAt: now,
        userId: '1' 
      };
      
      mockTasksData.push(newTask);
      
      return {
        data: { ...newTask },
        status: 201
      };
    }
    
    const data: CreateTaskRequest = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status === 'todo' ? TaskStatus.Todo :
              taskData.status === 'in-progress' ? TaskStatus.InProgress :
              TaskStatus.Done,
      priority: taskData.priority === 'low' ? TaskPriority.Low :
                taskData.priority === 'medium' ? TaskPriority.Medium :
                TaskPriority.High,
      dueDate: taskData.dueDate
    };
    
    const sanitizedData = sanitizeData(data);
    return apiService.post<Task>('/v1/taskitems', sanitizedData);
  }

  async updateTask(id: number, taskData: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockTasksData.findIndex(t => t.id === id);
      
      if (index === -1) {
        return {
          error: 'Task not found',
          status: 404
        };
      }
      
      const updatedTask: Task = {
        ...mockTasksData[index],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      mockTasksData[index] = updatedTask;
      
      return {
        data: { ...updatedTask },
        status: 200
      };
    }
    
    const data: UpdateTaskRequest = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status === 'todo' ? TaskStatus.Todo :
              taskData.status === 'in-progress' ? TaskStatus.InProgress :
              taskData.status === 'done' ? TaskStatus.Done :
              undefined,
      priority: taskData.priority === 'low' ? TaskPriority.Low :
                taskData.priority === 'medium' ? TaskPriority.Medium :
                taskData.priority === 'high' ? TaskPriority.High :
                undefined,
      dueDate: taskData.dueDate
    };
    
    const sanitizedData = sanitizeData(data);
    return apiService.put<Task>(`/v1/taskitems/${id}`, sanitizedData);
  }
  

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockTasksData.findIndex(t => t.id === id);
      
      if (index === -1) {
        return {
          error: 'Task not found',
          status: 404
        };
      }
      
      mockTasksData = mockTasksData.filter(t => t.id !== id);
      
      return {
        status: 204
      };
    }
    
    return apiService.delete<void>(`/v1/taskitems/${id}`);
  }

  async completeTask(id: number): Promise<ApiResponse<Task>> {
    if (USE_MOCK_DATA) {
      return this.updateTask(id, { status: 'done' });
    }
    
    return apiService.patch<Task>(`/v1/taskitems/${id}/complete`, {});
  }

  async getDueTasks(): Promise<ApiResponse<Task[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const today = new Date().toISOString().split('T')[0];
      
      const dueTasks = mockTasksData.filter(task => task.dueDate === today);
      
      return {
        data: dueTasks,
        status: 200
      };
    }
    
    return apiService.get<Task[]>('/v1/taskitems?due=today');
  }

  async getTaskStatistics(): Promise<ApiResponse<any>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const totalTasks = mockTasksData.length;
      const completedTasks = mockTasksData.filter(t => t.status === 'done').length;
      const pendingTasks = totalTasks - completedTasks;
      const highPriorityTasks = mockTasksData.filter(t => t.priority === 'high').length;
      
      return {
        data: {
          totalTasks,
          completedTasks,
          pendingTasks,
          highPriorityTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        },
        status: 200
      };
    }
    
    return apiService.get<any>('/v1/taskstatistics/summary');
  }
}

export const taskService = new TaskService(); 