import { apiService } from '@/lib/services/apiService';
import { apiClient } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskQueryParams,
  ApiTaskStatus,
  ApiTaskPriority,
  TaskAssignmentDTO,
  TaskApprovalDTO
} from '@/lib/types/task';
import { TaskFormData } from '../types/task';
import { mockTasks } from './mockData';
import { fetchClient } from './fetchClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const USE_MOCK_DATA = false;
const DISABLE_ALL_MOCK_DATA = true; // Force disable all mock data fallbacks

let mockTasksData = [...mockTasks];


// Debug helper function to track network activity
const logNetworkActivity = (method: string, url: string, requestData?: unknown, responseStatus?: number, responseData?: unknown) => {
  console.log(`%cNETWORK ${method} to ${url}`, 'color: blue; font-weight: bold');
  
  if (requestData) {
    console.log('%cRequest data:', 'color: blue', requestData);
  }
  
  if (responseStatus !== undefined) {
    console.log(
      `%cResponse status: ${responseStatus}`, 
      responseStatus >= 200 && responseStatus < 300 ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold'
    );
  }
  
  if (responseData) {
    console.log('%cResponse data:', 'color: blue', responseData);
  }
  
  // Add horizontal line for easier reading in console
  console.log('%c----------------------------------------', 'color: gray');
};

// Function to diagnose API issues
async function diagnoseApiIssues(): Promise<void> {
  console.log("=== API DIAGNOSTIC START ===");
  
  // Check authentication status
  let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  console.log("Auth token available:", !!token);
  
  if (token) {
    try {
      // Parse JWT to check expiration
      const parts = token.replace('Bearer ', '').split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);
        
        const expiry = payload.exp ? new Date(payload.exp * 1000) : null;
        const now = new Date();
        
        if (expiry) {
          console.log("Token expires:", expiry.toISOString());
          console.log("Token expired:", expiry < now);
          
          // If token is expired, clear it from storage
          if (expiry < now) {
            console.log("Clearing expired token");
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
          }
        }
      }
    } catch (e) {
      console.error("Error parsing JWT:", e);
    }
  }
  
  // Check for CSRF token
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('XSRF-TOKEN='));
  console.log("CSRF token in cookies:", !!csrfCookie);
  
  // Test CSRF endpoint
  try {
    const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/v1/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    console.log("CSRF endpoint status:", csrfResponse.status);
  } catch (e) {
    console.error("CSRF endpoint error:", e);
  }
  
  console.log("=== API DIAGNOSTIC END ===");
}


// Function to create a task in the format the API expects
function createSanitizedTask(task: TaskFormData): Record<string, unknown> {
  // Remove all non-alphanumeric characters except spaces
  const safeTitle = task.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 30);
  const safeDesc = task.description ? 
                  task.description.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 100) : 
                  '';
  
  // Map string status and priority to numeric values for C# backend
  // API enum: NotStarted=0, InProgress=1, OnHold=2, Pending=3, Completed=4, Cancelled=5
  let statusValue = 0; // Default is NotStarted
  if (task.status === 'in-progress') statusValue = 1; // InProgress
  if (task.status === 'done') statusValue = 4; // Completed
  
  // Low = 0, Medium = 1, High = 2
  let priorityValue = 1; // Default is Medium
  if (task.priority === 0) priorityValue = 0; // Low
  if (task.priority === 2) priorityValue = 2; // High
  
  // Create a result object with ONLY fields that exist in the database schema
  // Include only the basic fields known to exist in the C# Task model
  const result: Record<string, unknown> = {
    Title: safeTitle,
    Description: safeDesc,
    Status: statusValue,
    Priority: priorityValue
  };
  
  // Add due date if provided - format as expected by C# backend (yyyy-MM-dd)
  if (task.dueDate) {
    // Check if the date has time component and strip it if needed
    const dateOnly = task.dueDate.includes('T') 
      ? task.dueDate.split('T')[0] 
      : task.dueDate;
    
    result['DueDate'] = dateOnly;
  }
  
  // IMPORTANT: Only include fields that are KNOWN to exist in the database
  // Remove any fields that might be causing the 'Invalid column name' error
  
  // Known fields for assignment (use with caution)
  if ('assigneeId' in task && task.assigneeId) {
    result['AssignedToId'] = Number(task.assigneeId); // Use AssignedToId, not AssigneeId
  }
  
  if ('familyId' in task && task.familyId) {
    result['FamilyId'] = Number(task.familyId);
  }
  
  // Only include if userId is known from the database schema
  if ('createdBy' in task && task.createdBy) {
    result['UserId'] = Number(task.createdBy); // Use UserId instead of CreatedBy
  }
  
  // EXPLICITLY EXCLUDE the AssignedToName field that's causing database errors
  // DO NOT include anything related to AssignedToName
  
  console.log("Formatted task for API:", result);
  return result;
}


class TaskService {
  // Runs the diagnostic before any task operations
  private async runDiagnostic(): Promise<void> {
    await diagnoseApiIssues();
  }

  // Helper to map string status to Frontend enum
  private mapStatusToEnum(status?: string): TaskStatus {
    if (!status) return TaskStatus.Todo;
    
    switch (status) {
      case 'todo': return TaskStatus.Todo;
      case 'in-progress': return TaskStatus.InProgress;
      case 'done': return TaskStatus.Done;
      default: return TaskStatus.Todo;
    }
  }

  // Helper to map string priority to Frontend enum
  private mapPriorityToEnum(priority?: string): TaskPriority {
    if (!priority) return TaskPriority.Medium;
    
    switch (priority) {
      case 'low': return TaskPriority.Low;
      case 'medium': return TaskPriority.Medium;
      case 'high': return TaskPriority.High;
      default: return TaskPriority.Medium;
    }
  }
  
  // Helper to map string status to API enum numeric value
  private mapStatusToApiEnum(status?: string): ApiTaskStatus {
    if (!status) return ApiTaskStatus.NotStarted;
    
    switch (status) {
      case 'todo': return ApiTaskStatus.NotStarted;
      case 'in-progress': return ApiTaskStatus.InProgress;
      case 'done': return ApiTaskStatus.Completed;
      default: return ApiTaskStatus.NotStarted;
    }
  }

  // Helper to map string priority to API enum numeric value
  private mapPriorityToApiEnum(priority?: string): ApiTaskPriority {
    if (!priority) return ApiTaskPriority.Medium;
    
    switch (priority) {
      case 'low': return ApiTaskPriority.Low;
      case 'medium': return ApiTaskPriority.Medium;
      case 'high': return ApiTaskPriority.High;
      default: return ApiTaskPriority.Medium;
    }
  }

  // Helper to convert API task response to frontend format
  private normalizeApiTask(apiTask: any): Task {
    return {
      ...apiTask,
      // Convert C# enum status to frontend string format
      status: this.mapApiStatusToFrontend(apiTask.status),
      // Convert numeric priority to frontend string format
      priority: this.mapApiPriorityToFrontend(apiTask.priority),
      // Ensure description is a string (not null)
      description: apiTask.description || '',
      // Ensure dates are properly formatted
      createdAt: apiTask.createdAt || new Date().toISOString(),
      updatedAt: apiTask.updatedAt || new Date().toISOString(),
      // Convert createdBy to string if it's a number
      createdBy: apiTask.createdBy ? String(apiTask.createdBy) : '1'
    };
  }

  // Map API status enum to frontend status
  private mapApiStatusToFrontend(apiStatus: string | number): string {
    if (typeof apiStatus === 'string') {
      switch (apiStatus) {
        case 'NotStarted': return 'todo';
        case 'InProgress': return 'in-progress';
        case 'Completed': return 'done';
        case 'OnHold': return 'todo'; // Map OnHold to todo for now
        case 'Pending': return 'todo'; // Map Pending to todo for now
        case 'Cancelled': return 'todo'; // Map Cancelled to todo for now
        default: return 'todo';
      }
    } else if (typeof apiStatus === 'number') {
      switch (apiStatus) {
        case 0: return 'todo'; // NotStarted
        case 1: return 'in-progress'; // InProgress
        case 2: return 'todo'; // OnHold - map to todo for now
        case 3: return 'todo'; // Pending - map to todo for now
        case 4: return 'done'; // Completed
        case 5: return 'todo'; // Cancelled - map to todo for now
        default: return 'todo';
      }
    }
    return 'todo';
  }

  // Map API priority enum to frontend priority
  private mapApiPriorityToFrontend(apiPriority: string | number): string {
    if (typeof apiPriority === 'number') {
      switch (apiPriority) {
        case 0: return 'low';
        case 1: return 'medium';
        case 2: return 'high';
        default: return 'medium';
      }
    } else if (typeof apiPriority === 'string') {
      switch (apiPriority.toLowerCase()) {
        case 'low': return 'low';
        case 'medium': return 'medium';
        case 'high': return 'high';
        default: return 'medium';
      }
    }
    return 'medium';
  }

  async getTasks(params?: TaskQueryParams): Promise<ApiResponse<Task[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredTasks = [...mockTasksData];
      
      if (params) {
        if (params.status) {
          filteredTasks = filteredTasks.filter(task => task.status === params.status);
        }
        
        if (params.priority) {
          const priorityString = String(params.priority);
          filteredTasks = filteredTasks.filter(task => task.priority === priorityString);
        }
        
        if (params.search) {
          const searchLower = String(params.search).toLowerCase();
          filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchLower) || 
            (task.description?.toLowerCase() || '').includes(searchLower)
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
    
    // Get tasks from API
    console.log('TaskService: Calling API for tasks...');
    const apiResponse = await apiService.get<Task[]>(`/v1/taskitems${queryString ? `?${queryString}` : ''}`);
    console.log('TaskService: Raw API response:', apiResponse);
    
    // Normalize the API response to match frontend expectations
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      const normalizedTasks = apiResponse.data.map(task => this.normalizeApiTask(task));
      console.log('TaskService: Normalized tasks:', normalizedTasks);
      
      return {
        ...apiResponse,
        data: normalizedTasks
      };
    }
    
    console.log('TaskService: No data to normalize, returning API response as is');
    return apiResponse;
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
    
    // Check if this is a mock task from localStorage (has a high ID)
    const isMockTaskId = id >= 10000;
    
    if (isMockTaskId) {
      try {
        const mockTasksJson = localStorage.getItem('mockTasks');
        if (mockTasksJson) {
          const mockTasks = JSON.parse(mockTasksJson) as Task[];
          const task = mockTasks.find(t => t.id === id);
          
          if (task) {
            return {
              data: { ...task },
              status: 200
            };
          }
        }
        return { error: 'Mock task not found', status: 404 };
      } catch (e) {
        console.error("Error getting mock task:", e);
        return { error: 'Error getting mock task', status: 500 };
      }
    }
    
    // Get task from API if it's not a mock task
    return apiService.get<Task>(`/v1/taskitems/${id}`);
  }
  
  /**
   * Force refresh a task by clearing any cache and fetching latest data
   */
  async refreshTask(id: number): Promise<ApiResponse<Task>> {
    console.log('TaskService: Force refreshing task with ID:', id);
    
    try {
      // Make a direct API call to get the latest data
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            
            const headers: Record<string, string> = {
              'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      };
      
      // Add auth token if available
      const authToken = localStorage.getItem('token');
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }
      
      // Add CSRF token
      const csrfToken = this.getCsrfTokenFromCookies();
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      // Random query parameter to bypass cache
      const cacheBuster = Date.now();
      logNetworkActivity('GET', `${API_URL}/v1/taskitems/${id}?_=${cacheBuster}`, null);
      
      try {
        const response = await fetch(`${API_URL}/v1/taskitems/${id}?_=${cacheBuster}`, {
          method: 'GET',
          headers,
              credentials: 'include'
            });
        
        logNetworkActivity('RESPONSE', `${API_URL}/v1/taskitems/${id}?_=${cacheBuster}`, null, response.status);
            
            if (response.ok) {
          try {
              const data = await response.json();
            console.log('TaskService: Task refresh successful:', data);
            return {
              data,
              status: response.status
            };
          } catch (jsonError) {
            console.error('TaskService: Error parsing JSON in refreshTask:', jsonError);
            return {
              error: 'Error parsing server response',
              status: response.status
            };
          }
            } else {
          console.error('TaskService: Error refreshing task, status:', response.status);
          return {
            error: `Error refreshing task: ${response.status} ${response.statusText}`,
            status: response.status
          };
        }
      } catch (fetchError) {
        console.error('TaskService: Network error in refreshTask:', fetchError);
        throw new Error('Network error refreshing task');
      }
    } catch (error) {
      console.error('TaskService: Error in refreshTask:', error);
      return this.getTask(id); // Fall back to regular getTask
    }
  }

  async createTask(task: TaskFormData): Promise<ApiResponse<Task>> {
    try {
      await this.runDiagnostic();
      
      // Create a sanitized task with proper casing and numeric enum values
      const apiTaskData = createSanitizedTask(task);
      console.log("TaskService: Creating task with sanitized data:", apiTaskData);
      
      // Send the properly formatted task data to the API
      const response = await apiService.post('/v1/taskitems', apiTaskData);
      console.log("TaskService: Create task API response:", response);
      
      if (response.status === 201 || response.status === 200) {
        console.log("TaskService: Task created successfully via API");
        const normalizedTask = this.normalizeApiTask(response.data);
        console.log("TaskService: Normalized created task:", normalizedTask);
        return {
          data: normalizedTask,
          status: response.status
        };
      } else {
        console.error("TaskService: Error creating task:", response.data && typeof response.data === 'object' ? 
          (response.data as any).message || "Unknown error" : "Unknown error");
        
        // Return error response - NO MOCK FALLBACK
        return {
          error: response.data && typeof response.data === 'object' ? 
            (response.data as any).message || "Failed to create task" : "Failed to create task",
          status: response.status
        };
      }
    } catch (error) {
      console.error("TaskService: Error in createTask:", error);
      return { 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        status: 500
      };
    }
  }
  

  async updateTask(id: number, taskData: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
    console.log('TaskService: --------- UPDATE TASK START ---------');
    console.log('TaskService: Updating task with ID:', id);
    console.log('TaskService: Update data:', taskData);
    
    // If this is mock data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockTasksData.findIndex(t => t.id === id);
      
      if (index === -1) {
        return {
          error: 'Task not found',
          status: 404
        };
      }
      
      // Update the mock task
      mockTasksData[index] = {
        ...mockTasksData[index],
        ...taskData,
        // Convert null values to undefined to match Task interface
        description: taskData.description === null ? undefined : taskData.description,
        dueDate: taskData.dueDate === null ? undefined : taskData.dueDate,
        // Ensure priority is a string to match Task interface
        priority: taskData.priority !== undefined ? this.mapApiPriorityToFrontend(taskData.priority) : mockTasksData[index].priority,
        updatedAt: new Date().toISOString()
      };
      
      return {
        data: mockTasksData[index],
        status: 200
      };
    }
    
    // Check if this is a mock task from localStorage (has a high ID)
    const isMockTaskId = id >= 10000;
    
    if (isMockTaskId) {
      try {
        const mockTasksJson = localStorage.getItem('mockTasks');
        if (mockTasksJson) {
          const mockTasks = JSON.parse(mockTasksJson) as Task[];
          const index = mockTasks.findIndex(t => t.id === id);
          
          if (index !== -1) {
            mockTasks[index] = {
              ...mockTasks[index],
              ...taskData,
              // Convert null values to undefined to match Task interface
              description: taskData.description === null ? undefined : taskData.description,
              dueDate: taskData.dueDate === null ? undefined : taskData.dueDate,
              // Ensure priority is a string to match Task interface
              priority: taskData.priority !== undefined ? this.mapApiPriorityToFrontend(taskData.priority) : mockTasks[index].priority,
              updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
            
            return {
              data: mockTasks[index],
              status: 200
            };
          }
        }
        return { error: 'Mock task not found', status: 404 };
      } catch (e) {
        console.error("Error updating mock task:", e);
        return { error: 'Error updating mock task', status: 500 };
      }
    }
    
    try {
      // Diagnostic check before continuing
      await this.runDiagnostic();
      
      // Get current task to ensure we have the right version number
      const currentTaskResponse = await this.getTask(id);
      if (!currentTaskResponse.data) {
        console.error(`TaskService: Failed to get current task for update: ${currentTaskResponse.error}`);
        return currentTaskResponse;
      }
      
      const currentTask = currentTaskResponse.data;
      console.log('TaskService: Current task data:', currentTask);
      
      // Prepare the update data in the format expected by the API
      // Use proper casing since our API expects PascalCase
      const directUpdateData: Record<string, any> = {
        // Include the current version for optimistic concurrency control
        Version: currentTask.version || 0,
        // Always include Title as API requires it for validation
        Title: taskData.title !== undefined ? taskData.title : currentTask.title
      };
      
      // Only include fields that have been provided in the update
      if (taskData.description !== undefined) directUpdateData.Description = taskData.description || '';
      
      // Convert the enum string values to numeric values for the API
      if (taskData.status !== undefined) {
        switch(taskData.status) {
          case 'todo': directUpdateData.Status = 0; break; // NotStarted
          case 'in-progress': directUpdateData.Status = 1; break; // InProgress
          case 'done': directUpdateData.Status = 4; break; // Completed (not 2!)
        }
      } else if (!directUpdateData.Status && currentTask.status) {
          // Convert status string to numeric value
          switch(currentTask.status) {
            case 'todo': directUpdateData.Status = 0; break; // NotStarted
            case 'in-progress': directUpdateData.Status = 1; break; // InProgress
            case 'done': directUpdateData.Status = 4; break; // Completed
          }
        }
      if (taskData.priority !== undefined) {
        switch(taskData.priority) {
          case 0: directUpdateData.Priority = 0; break; // Low
          case 1: directUpdateData.Priority = 1; break; // Medium  
          case 2: directUpdateData.Priority = 2; break; // High
        }
      } else if (!directUpdateData.Priority && currentTask.priority) {
          // Convert priority string to numeric value
          switch(currentTask.priority) {
            case 'low': directUpdateData.Priority = 0; break;
            case 'medium': directUpdateData.Priority = 1; break;
            case 'high': directUpdateData.Priority = 2; break;
          }
        }
      
      // Handle due date format
      if (taskData.dueDate !== undefined) {
        directUpdateData.DueDate = taskData.dueDate;
      }
        
        console.log('TaskService: DIRECT UPDATE - Using data:', directUpdateData);
        
        // Get fresh token
        const token = localStorage.getItem('token');
      
      // Get CSRF token from cookies
      const csrfToken = this.getCsrfTokenFromCookies();
      console.log('TaskService: Using CSRF token:', csrfToken ? 'Available' : 'Not available');
      
      const url = `${API_URL}/v1/taskitems/${id}`;
      console.log('TaskService: DIRECT UPDATE - URL:', url);
        
        // Try PUT first
        const directResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CSRF-TOKEN': csrfToken || '', // Add CSRF token to headers
          'X-XSRF-TOKEN': csrfToken || ''  // Add alternative CSRF header format
          },
          body: JSON.stringify(directUpdateData),
          credentials: 'include'
        });
        
        console.log('TaskService: DIRECT UPDATE PUT - Response status:', directResponse.status);
        
      // Handle version conflict (412 Precondition Failed or 409 Conflict)
      if (directResponse.status === 412 || directResponse.status === 409) {
        console.warn('TaskService: Version conflict detected, refreshing task data');
        
        try {
          // Get the latest version of the task
          const refreshedTaskResponse = await this.refreshTask(id);
          if (!refreshedTaskResponse.data) {
            return {
              error: 'Version conflict - please refresh and try again',
              status: directResponse.status,
              details: {
                type: 'VersionConflict',
                message: 'The task was modified by another user while you were editing it.'
              }
            };
          }
          
          // Return the conflict info
          return {
            error: 'Version conflict - please refresh and try again',
            status: directResponse.status,
            data: refreshedTaskResponse.data, // Include the refreshed data
            details: {
              type: 'VersionConflict', 
              message: 'The task was modified by another user while you were editing it.',
              currentVersion: refreshedTaskResponse.data.version
            }
          };
        } catch (refreshError) {
          console.error('TaskService: Error refreshing after conflict:', refreshError);
          return {
            error: 'Version conflict - please refresh and try again',
            status: directResponse.status
          };
          }
        }
        
        if (directResponse.ok) {
        try {
          // Try to parse JSON response
          const taskData = await directResponse.json();
          console.log('TaskService: Update successful, received data:', taskData);
        return {
            data: taskData,
            status: directResponse.status
        };
        } catch (jsonError) {
          console.log('TaskService: Response is not JSON, assuming success and refreshing');
      
          // If we can't parse JSON but request was successful, refresh the task
          const refreshedTask = await this.refreshTask(id);
          return refreshedTask;
        }
      } else {
        try {
          // Try to get error details from response
          const errorData = await directResponse.json();
      return {
            error: errorData.message || `Error: ${directResponse.status} ${directResponse.statusText}`,
            details: errorData,
            status: directResponse.status
      };
    } catch (e) {
      return { 
            error: `Error: ${directResponse.status} ${directResponse.statusText}`,
            status: directResponse.status
          };
        }
      }
    } catch (error: any) {
      console.error('TaskService: Error updating task:', error);
      return {
        error: error.message || 'Unknown error updating task',
        status: 500
      };
    }
  }
  
  // Helper method to get CSRF token from cookies
  private getCsrfTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    
    if (csrfCookie) {
      const encodedToken = csrfCookie.split('=')[1];
      try {
        return decodeURIComponent(encodedToken);
      } catch (e) {
        console.error('Error decoding CSRF token:', e);
        return encodedToken;
      }
    }
    
    return null;
  }

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    console.log('TaskService: Deleting task with ID:', id);
    
    // If using mock data from the app's initial state
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
    
    // Check if this is a mock task from localStorage (has a high ID)
    const isMockTaskId = id >= 10000;
    
    if (isMockTaskId) {
      try {
        console.log('TaskService: Deleting mock task from localStorage');
        const mockTasksJson = localStorage.getItem('mockTasks');
        if (mockTasksJson) {
          const mockTasks = JSON.parse(mockTasksJson) as Task[];
          const updatedMockTasks = mockTasks.filter(t => t.id !== id);
          localStorage.setItem('mockTasks', JSON.stringify(updatedMockTasks));
        }
        return { status: 204 };
      } catch (e) {
        console.error("Error deleting mock task:", e);
        return { error: 'Error deleting mock task', status: 500 };
      }
    }
    
    // If it's a real task, try to delete it from the API
    try {
      console.log('TaskService: Sending delete request to API for task ID:', id);
      
      // Try direct fetch with CSRF token first
      try {
        // Get fresh token
        const token = localStorage.getItem('token');
        
        // Get CSRF token from cookies
        const csrfToken = this.getCsrfTokenFromCookies();
        console.log('TaskService: Using CSRF token for delete:', csrfToken ? 'Available' : 'Not available');
        
        const url = `${API_URL}/v1/taskitems/${id}`;
        console.log('TaskService: DELETE - URL:', url);
        
        // Make DELETE request
        const directResponse = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-CSRF-TOKEN': csrfToken || '', 
            'X-XSRF-TOKEN': csrfToken || ''
          },
          credentials: 'include'
        });
        
        console.log('TaskService: DELETE - Response status:', directResponse.status);
        
        if (directResponse.ok) {
          return { status: directResponse.status };
        }
      } catch (directError) {
        console.error('TaskService: Direct delete failed, falling back to apiService:', directError);
      }
      
      // Fall back to apiService method
      const response = await apiService.delete<void>(`/v1/taskitems/${id}`);
      console.log('TaskService: Delete response:', response);
      return response;
    } catch (e) {
      console.error('TaskService: Error in delete request:', e);
      return { error: 'Network error deleting task', status: 500 };
    }
  }

  async completeTask(id: number): Promise<ApiResponse<Task>> {
    if (USE_MOCK_DATA) {
      return this.updateTask(id, { status: 'done' });
    }
    
    // Check if this is a mock task from localStorage (has a high ID)
    const isMockTaskId = id >= 10000;
    
    if (isMockTaskId) {
      // Use our existing updateTask method which already handles mock tasks
      return this.updateTask(id, { status: 'done' });
    }
    
    // If it's a real task, use the API
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

  async getTaskStatistics(): Promise<ApiResponse<Record<string, unknown>>> {
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

  /**
   * Helper method to handle a successful update response
   * @param id The task ID
   * @param taskData The update data
   * @param currentTask The current task before update
   * @param status The HTTP status code
   * @returns API response with updated task
   */
  private async handleSuccessfulUpdate(
    id: number, 
    taskData: Partial<TaskFormData>, 
    currentTask: Task, 
    status: number
  ): Promise<ApiResponse<Task>> {
    // Force refresh the task data
    const refreshResponse = await this.refreshTask(id);
    if (refreshResponse.data) {
      return refreshResponse;
    }
    
    // If refresh fails, return success with updated local task
    const updatedTask: Task = { 
      ...currentTask,
      ...(taskData.title !== undefined && { title: taskData.title }),
      ...(taskData.description !== undefined && { 
        description: taskData.description === null ? '' : taskData.description 
      }),
      ...(taskData.status !== undefined && { status: taskData.status }),
      ...(taskData.priority !== undefined && { priority: this.mapApiPriorityToFrontend(taskData.priority) }),
      ...(taskData.dueDate !== undefined && { 
        dueDate: taskData.dueDate === null ? undefined : taskData.dueDate 
      }),
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: updatedTask,
      status
    };
  }

  // Family task management methods
  
  async getFamilyTasks(familyId: string): Promise<ApiResponse<Task[]>> {
    try {
      console.log(`[taskService] Getting tasks for family ${familyId}`);
      
      // Check if user is authenticated first
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const isAuthenticated = !!authToken;
      
      if (!isAuthenticated) {
        console.log(`[taskService] User not authenticated, using mock data for family tasks`);
        return this.generateMockFamilyTasks(familyId);
      }
      
      // First try: Get tasks from the API with standard authentication
      const response = await apiClient.get<Task[]>(`/v1/family/${familyId}/tasks`);
      
      // If the response is successful, return it
      if (response.data) {
        console.log(`[taskService] Successfully fetched ${response.data.length} family tasks`);
        return response;
      }
      
      // If we get a 401 error, try refreshing the token and then retry
      if (response.status === 401) {
        console.log('[taskService] Authentication failed (401), attempting to refresh token');
        
        try {
          // Try to refresh authentication token
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/v1/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          if (refreshResponse.ok) {
            console.log('[taskService] Token refreshed successfully, retrying tasks fetch');
            
            // Try to get the new token from the response
            const refreshData = await refreshResponse.json();
            if (refreshData?.token) {
              localStorage.setItem('token', refreshData.token);
            }
            
            // Retry with the refreshed token
            const retryResponse = await apiClient.get<Task[]>(`/v1/family/${familyId}/tasks`, {
              suppressAuthError: true // Don't show errors for this retry attempt
            });
            
            if (retryResponse.data) {
              console.log(`[taskService] Retry successful, fetched ${retryResponse.data.length} family tasks`);
              return retryResponse;
            }
          } else {
            console.error('[taskService] Token refresh failed:', refreshResponse.status);
          }
        } catch (refreshError) {
          console.error('[taskService] Error during token refresh:', refreshError);
        }
      }
      
      console.log('[taskService] Returning empty array due to API error:', response.error);
      
      // If we get here, both attempts failed, but we'll show tasks as empty instead of an error
      return {
        data: [],
        status: 200,
        error: response.error // Include the error for debugging but don't break the UI
      };
    } catch (error) {
      console.error(`[taskService] Error getting family tasks for family ${familyId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to get tasks for family ${familyId}`,
        status: 500,
        data: [] // Still include an empty data array to prevent UI errors
      };
    }
  }
  
  // Helper method to generate mock family tasks
  private generateMockFamilyTasks(familyId: string): ApiResponse<Task[]> {
    console.log(`[taskService] Using mock data for family tasks`);
    
    // Create better mock data that clearly indicates it's demo data
    const mockTaskTitles = [
      "Demo: Complete household chores",
      "Demo: Homework assignment",
      "Demo: Take out the trash",
      "Demo: Walk the dog",
      "Demo: Prepare dinner" 
    ];
    
    const mockTaskDescriptions = [
      "This is a demo task. Sign in to see real tasks.",
      "Example family task - not real data.",
      "Demo content - log in to create and manage real family tasks.",
      "",
      "Sample task for demonstration purposes."
    ];
    
    // Valid priority values as strings
    const priorities = ['low', 'medium', 'high'];
    const statuses = ['todo', 'in-progress', 'done'];
    
    // Generate 3-5 mock tasks
    const count = Math.floor(Math.random() * 3) + 3;
    const mockFamilyTasks: Task[] = [];
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * mockTaskTitles.length);
      const title = mockTaskTitles[index];
      const description = mockTaskDescriptions[index];
      
      // Create random due date between now and 7 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      mockFamilyTasks.push({
        id: Math.floor(Math.random() * 10000) + 10000, // High IDs for mock tasks
        title,
        description: description, 
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate: dueDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedToName: ['Demo User', 'Family Member', 'Child', 'Parent'][Math.floor(Math.random() * 4)],
        requiresApproval: Math.random() > 0.5,
        approvedBy: undefined // Using undefined instead of null to match Task interface
        // Family ID is stored in the component state, not needed in the task object
      });
    }
    
    return {
      data: mockFamilyTasks,
      status: 200
    };
  }
  
  async assignTaskToFamilyMember(
    familyId: string, 
    assignmentData: TaskAssignmentDTO
  ): Promise<ApiResponse<Task>> {
    try {
      console.log(`[taskService] Assigning task to family member in family ${familyId}:`, assignmentData);
      
      // Verify authentication 
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) {
        console.error('[taskService] Authentication token not found');
        return {
          error: 'You must be logged in to assign tasks',
          status: 401
        };
      }
      
      // Make sure userId is properly formatted as a string
      const safeAssignmentData = {
        ...assignmentData,
        assignToUserId: assignmentData.assignToUserId ? assignmentData.assignToUserId.toString() : ''
      };
      
      console.log(`[taskService] Sending assignment data:`, safeAssignmentData);
      
      // First try: Use standard API client
      const response = await apiClient.post<Task>(
        `/v1/family/${familyId}/tasks/assign`, 
        safeAssignmentData
      );
      
      // Log the response for debugging
      console.log(`[taskService] Assignment response:`, response);
      
      // If successful, return it
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        return response;
      }
      
      // If we get a 401 error, try refreshing the token and retry
      if (response.status === 401) {
        console.log('[taskService] Authentication failed (401), attempting to refresh token');
        
        try {
          // Try to refresh authentication token
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const refreshResponse = await fetch(`${apiUrl}/v1/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          if (refreshResponse.ok) {
            console.log('[taskService] Token refreshed successfully, retrying task assignment');
            
            // Try to get the new token from the response
            const refreshData = await refreshResponse.json();
            if (refreshData?.token) {
              localStorage.setItem('token', refreshData.token);
              
              // Get CSRF token from cookies
              const csrfToken = this.getCsrfTokenFromCookies();
              
              // Try direct fetch with the new token
              const directResponse = await fetch(`${apiUrl}/v1/family/${familyId}/tasks/assign`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${refreshData.token}`,
                  'X-CSRF-TOKEN': csrfToken || '',
                  'X-XSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify(safeAssignmentData)
              });
              
              console.log('[taskService] Direct assignment response status:', directResponse.status);
              
              if (directResponse.ok) {
                try {
                  const data = await directResponse.json();
                  return { data, status: directResponse.status };
                } catch {
                  // If we can't parse the response but it's successful, return generic success
                  return { status: directResponse.status };
                }
              }
              
              // Try an alternative endpoint as last resort
              const altResponse = await fetch(`${apiUrl}/v1/family-tasks/assign?familyId=${familyId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${refreshData.token}`,
                  'X-CSRF-TOKEN': csrfToken || '',
                  'X-XSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify(safeAssignmentData)
              });
              
              if (altResponse.ok) {
                try {
                  const data = await altResponse.json();
                  return { data, status: altResponse.status };
                } catch {
                  // If we can't parse the response but it's successful, return generic success
                  return { status: altResponse.status };
                }
              }
            }
          }
        } catch (refreshError) {
          console.error('[taskService] Error during token refresh:', refreshError);
        }
      }
      
      // If we got this far, all attempts failed
      return response;
    } catch (error) {
      console.error(`[taskService] Error assigning task in family ${familyId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to assign task in family ${familyId}`,
        status: 500
      };
    }
  }
  
  async unassignTask(familyId: string, taskId: number): Promise<ApiResponse<void>> {
    try {
      console.log(`[taskService] Unassigning task ${taskId} in family ${familyId}`);
      const response = await apiClient.delete(`/v1/family/${familyId}/tasks/${taskId}/unassign`);
      return response;
    } catch (error) {
      console.error(`[taskService] Error unassigning task ${taskId} in family ${familyId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to unassign task ${taskId}`,
        status: 500
      };
    }
  }
  
  async deleteFamilyTask(familyId: string, taskId: number): Promise<ApiResponse<void>> {
    try {
      console.log(`[taskService] Deleting task ${taskId} in family ${familyId}`);
      const response = await apiClient.delete(`/v1/family/${familyId}/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error(`[taskService] Error deleting task ${taskId} in family ${familyId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to delete task ${taskId}`,
        status: 500
      };
    }
  }
  
  async unassignAllTasksFromMember(familyId: string, familyMemberId: number): Promise<ApiResponse<number>> {
    try {
      console.log(`[taskService] Unassigning all tasks from family member ${familyMemberId} in family ${familyId}`);
      const response = await apiClient.delete<number>(`/v1/family/${familyId}/member/${familyMemberId}/unassign-all`);
      return response;
    } catch (error) {
      console.error(`[taskService] Error unassigning tasks from family member ${familyMemberId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to unassign tasks from family member ${familyMemberId}`,
        status: 500
      };
    }
  }
  
  async approveTask(
    familyId: string, 
    taskId: number, 
    approvalData: TaskApprovalDTO
  ): Promise<ApiResponse<void>> {
    try {
      console.log(`[taskService] Approving task ${taskId} in family ${familyId}:`, approvalData);
      const response = await apiClient.post<void>(
        `/v1/family/${familyId}/tasks/${taskId}/approve`, 
        approvalData
      );
      return response;
    } catch (error) {
      console.error(`[taskService] Error approving task ${taskId} in family ${familyId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to approve task ${taskId}`,
        status: 500
      };
    }
  }
  
  async getMemberTasks(familyId: string, familyMemberId: string): Promise<ApiResponse<Task[]>> {
    try {
      console.log(`[taskService] Getting tasks for member ${familyMemberId} in family ${familyId}`);
      const response = await apiClient.get<Task[]>(`/v1/family/${familyId}/tasks/member/${familyMemberId}`);
      return response;
    } catch (error) {
      console.error(`[taskService] Error getting tasks for member ${familyMemberId}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to get tasks for member ${familyMemberId}`,
        status: 500
      };
    }
  }

  /**
   * Batch update tasks - useful for column operations
   */
  async batchUpdateTasks(updates: Array<{ id: number; data: Partial<TaskFormData> }>): Promise<ApiResponse<Task[]>> {
    console.log('TaskService: --------- BATCH UPDATE TASKS START ---------');
    console.log('TaskService: Updating', updates.length, 'tasks');
    
    const results: Task[] = [];
    const errors: string[] = [];
    
    try {
      // Process updates sequentially to avoid overwhelming the API
      for (const update of updates) {
        console.log(`TaskService: Updating task ${update.id}`, update.data);
        const response = await this.updateTask(update.id, update.data);
        
        if (response.data) {
          results.push(response.data);
        } else {
          errors.push(`Failed to update task ${update.id}: ${response.error}`);
        }
        
        // Small delay to prevent API rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (errors.length > 0) {
        console.warn('TaskService: Some batch updates failed:', errors);
        return {
          data: results,
          status: 207, // Multi-Status
          error: `${errors.length} out of ${updates.length} updates failed`
        };
      }
      
      console.log('TaskService: Batch update completed successfully');
      return {
        data: results,
        status: 200
      };
    } catch (error: any) {
      console.error('TaskService: Error in batch update:', error);
      return {
        error: error.message || 'Batch update failed',
        status: 500
      };
    }
  }

  /**
   * Batch delete tasks - useful for column operations
   */
  async batchDeleteTasks(taskIds: number[]): Promise<ApiResponse<{ deleted: number[]; failed: number[] }>> {
    console.log('TaskService: --------- BATCH DELETE TASKS START ---------');
    console.log('TaskService: Deleting', taskIds.length, 'tasks');
    
    const deleted: number[] = [];
    const failed: number[] = [];
    
    try {
      // Process deletions sequentially to avoid overwhelming the API
      for (const taskId of taskIds) {
        console.log(`TaskService: Deleting task ${taskId}`);
        const response = await this.deleteTask(taskId);
        
        if (response.status === 200 || response.status === 204) {
          deleted.push(taskId);
        } else {
          failed.push(taskId);
          console.warn(`TaskService: Failed to delete task ${taskId}:`, response.error);
        }
        
        // Small delay to prevent API rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('TaskService: Batch delete completed');
      console.log(`TaskService: Successfully deleted ${deleted.length}, failed ${failed.length}`);
      
      return {
        data: { deleted, failed },
        status: deleted.length > 0 ? 200 : 400
      };
    } catch (error: any) {
      console.error('TaskService: Error in batch delete:', error);
      return {
        error: error.message || 'Batch delete failed',
        status: 500
      };
    }
  }

  /**
   * Move tasks between columns by updating their status
   */
  async moveTasksToColumn(taskIds: number[], targetStatus: string): Promise<ApiResponse<Task[]>> {
    console.log('TaskService: --------- MOVE TASKS TO COLUMN START ---------');
    console.log('TaskService: Moving', taskIds.length, 'tasks to status:', targetStatus);
    
    // Prepare batch updates
    const updates = taskIds.map(id => ({
      id,
      data: {
        status: targetStatus as ('todo' | 'in-progress' | 'done')
      } as Partial<TaskFormData>
    }));
    
    return this.batchUpdateTasks(updates);
  }

  /**
   * Get tasks by status - useful for column operations
   */
  async getTasksByStatus(status: string): Promise<ApiResponse<Task[]>> {
    console.log('TaskService: --------- GET TASKS BY STATUS START ---------');
    console.log('TaskService: Getting tasks with status:', status);
    
    try {
      const allTasksResponse = await this.getTasks();
      
      if (!allTasksResponse.data) {
        return {
          error: allTasksResponse.error || 'Failed to get tasks',
          status: allTasksResponse.status || 500
        };
      }
      
      const filteredTasks = allTasksResponse.data.filter(task => task.status === status);
      
      console.log(`TaskService: Found ${filteredTasks.length} tasks with status ${status}`);
      
      return {
        data: filteredTasks,
        status: 200
      };
    } catch (error: any) {
      console.error('TaskService: Error getting tasks by status:', error);
      return {
        error: error.message || 'Failed to get tasks by status',
        status: 500
      };
    }
  }
}

export const taskService = new TaskService(); 