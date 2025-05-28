import { apiClient } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';
import { Task } from '@/lib/types/task';
import { 
  FocusSession, 
  FocusStatistics, 
  Distraction, 
  DistractionCreate, 
  FocusRequest,
  FocusSessionCompleteRequest,
  TaskProgressUpdate,
  TaskTimeTracking,
  ProductivityInsights
} from '@/lib/types/focus';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class FocusService {
  async getCurrentFocusSession(): Promise<ApiResponse<FocusSession>> {
    return apiClient.get<FocusSession>('/v1/focus/current');
  }

  async startFocusSession(request: FocusRequest): Promise<ApiResponse<FocusSession>> {
    return apiClient.post<FocusSession>('/v1/focus/start', request);
  }

  async switchFocusSession(request: FocusRequest): Promise<ApiResponse<FocusSession>> {
    return apiClient.post<FocusSession>('/v1/focus/switch', request);
  }

  async endFocusSession(sessionId?: number): Promise<ApiResponse<FocusSession>> {
    const endpoint = sessionId 
      ? `/v1/focus/${sessionId}/end` 
      : '/v1/focus/current/end';
    
    return apiClient.post<FocusSession>(endpoint, {});
  }

  async completeSessionWithDetails(sessionId: number, completion: {
    sessionQualityRating?: number;
    completionNotes?: string;
    taskProgressAfter?: number;
    taskCompletedDuringSession?: boolean;
  }): Promise<ApiResponse<FocusSession>> {
    return apiClient.put<FocusSession>(`/v1/focus/${sessionId}/complete`, completion);
  }

  async pauseFocusSession(sessionId?: number): Promise<ApiResponse<FocusSession>> {
    const endpoint = sessionId 
      ? `/v1/focus/${sessionId}/pause` 
      : '/v1/focus/current/pause';
    
    return apiClient.post<FocusSession>(endpoint, {});
  }

  async resumeFocusSession(sessionId: number): Promise<ApiResponse<FocusSession>> {
    return apiClient.post<FocusSession>(`/v1/focus/${sessionId}/resume`, {});
  }

  async getFocusSuggestions(count: number = 5): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`/v1/focus/suggestions?count=${count}`);
  }

  async recordDistraction(distraction: DistractionCreate): Promise<ApiResponse<Distraction>> {
    return apiClient.post<Distraction>('/v1/focus/distraction', distraction);
  }

  async getFocusStatistics(startDate?: string, endDate?: string): Promise<ApiResponse<FocusStatistics>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<FocusStatistics>(`/v1/focus/statistics${query}`);
  }

  async getFocusHistory(): Promise<ApiResponse<FocusSession[]>> {
    return apiClient.get<FocusSession[]>('/v1/focus/history');
  }

  async getSessionDistractions(sessionId: number): Promise<ApiResponse<Distraction[]>> {
    return apiClient.get<Distraction[]>(`/v1/focus/${sessionId}/distractions`);
  }

  // Task-related methods
  async updateTaskProgress(taskId: number, progress: TaskProgressUpdate): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`/v1/tasks/${taskId}/progress`, progress);
  }

  async completeTask(taskId: number): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/v1/tasks/${taskId}/complete`, {});
  }

  async getTaskTimeTracking(taskId: number): Promise<ApiResponse<TaskTimeTracking>> {
    return apiClient.get<TaskTimeTracking>(`/v1/tasks/${taskId}/time-tracking`);
  }

  async getProductivityInsights(startDate?: string, endDate?: string): Promise<ApiResponse<ProductivityInsights>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/v1/focus/insights?${queryString}` : '/v1/focus/insights';
    
    return apiClient.get<ProductivityInsights>(url);
  }
}

export const focusService = new FocusService(); 