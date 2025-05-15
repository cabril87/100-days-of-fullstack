import { apiClient } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';
import { Task } from '@/lib/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FocusSession {
  id: number;
  taskId: number;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  isCompleted: boolean;
  notes?: string;
  status: 'InProgress' | 'Completed' | 'Interrupted' | 'Paused';
  task?: Task;
}

export interface FocusStatistics {
  totalMinutesFocused: number;
  sessionCount: number;
  distractionCount: number;
  distractionsByCategory: Record<string, number>;
  averageSessionLength: number;
  dailyFocusMinutes: Record<string, number>;
}

export interface Distraction {
  id: number;
  sessionId: number;
  timestamp: string;
  description: string;
  category: string;
}

export interface DistractionCreate {
  sessionId: number;
  description: string;
  category: string;
}

export interface FocusRequest {
  taskId: number;
  notes?: string;
}

class FocusService {
  async getCurrentFocusSession(): Promise<ApiResponse<FocusSession>> {
    return apiClient.get<FocusSession>('/v1/focus/current');
  }

  async startFocusSession(request: FocusRequest): Promise<ApiResponse<FocusSession>> {
    return apiClient.post<FocusSession>('/v1/focus/start', request);
  }

  async endFocusSession(sessionId?: number): Promise<ApiResponse<FocusSession>> {
    const endpoint = sessionId 
      ? `/v1/focus/${sessionId}/end` 
      : '/v1/focus/current/end';
    
    return apiClient.post<FocusSession>(endpoint, {});
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

  async getFocusStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<FocusStatistics>> {
    let endpoint = '/v1/focus/statistics';
    
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return apiClient.get<FocusStatistics>(endpoint);
  }

  async getFocusHistory(): Promise<ApiResponse<FocusSession[]>> {
    return apiClient.get<FocusSession[]>('/v1/focus/history');
  }

  async getSessionDistractions(sessionId: number): Promise<ApiResponse<Distraction[]>> {
    return apiClient.get<Distraction[]>(`/v1/focus/${sessionId}/distractions`);
  }
}

export const focusService = new FocusService(); 