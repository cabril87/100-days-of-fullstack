import { apiClient } from './apiClient';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderTime: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'triggered' | 'completed' | 'dismissed' | 'snoozed';
  isRepeating: boolean;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  taskId?: string;
  taskTitle?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  snoozeUntil?: string;
}

export interface ReminderStats {
  total: number;
  pending: number;
  overdue: number;
  completed: number;
  today: number;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminderTime: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRepeating: boolean;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  taskId?: string;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  reminderTime?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isRepeating?: boolean;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  taskId?: string;
  status?: 'pending' | 'triggered' | 'completed' | 'dismissed' | 'snoozed';
  snoozeUntil?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export const reminderService = {
  async getAllReminders(): Promise<ApiResponse<Reminder[]>> {
    console.log('[reminderService] Getting all reminders');
    try {
      const response = await apiClient.get<Reminder[]>('/v1/reminders');
      
      // Ensure we always return an array
      const reminders = Array.isArray(response.data) ? response.data : [];
      
      return { 
        data: reminders,
        status: response.status
      };
    } catch (error) {
      console.error('[reminderService] Error getting reminders:', error);
      
      // Return empty array instead of error to prevent UI crashes
      return {
        data: [],
        status: 200,
        error: error instanceof Error ? error.message : 'Failed to get reminders'
      };
    }
  },

  async getReminderById(reminderId: string): Promise<ApiResponse<Reminder>> {
    console.log(`[reminderService] Getting reminder ${reminderId}`);
    try {
      const response = await apiClient.get<Reminder>(`/v1/reminders/${reminderId}`);
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`[reminderService] Error getting reminder ${reminderId}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get reminder',
        status: 500
      };
    }
  },

  async createReminder(reminderData: CreateReminderData): Promise<ApiResponse<Reminder>> {
    console.log('[reminderService] Creating reminder:', reminderData);
    try {
      const response = await apiClient.post<Reminder>('/v1/reminders', reminderData);
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('[reminderService] Error creating reminder:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create reminder',
        status: 500
      };
    }
  },

  async updateReminder(reminderId: string, reminderData: UpdateReminderData): Promise<ApiResponse<Reminder>> {
    console.log(`[reminderService] Updating reminder ${reminderId}:`, reminderData);
    try {
      const response = await apiClient.put<Reminder>(`/v1/reminders/${reminderId}`, reminderData);
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`[reminderService] Error updating reminder ${reminderId}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update reminder',
        status: 500
      };
    }
  },

  async deleteReminder(reminderId: string): Promise<ApiResponse<void>> {
    console.log(`[reminderService] Deleting reminder ${reminderId}`);
    try {
      const response = await apiClient.delete(`/v1/reminders/${reminderId}`);
      
      return { 
        status: response.status
      };
    } catch (error) {
      console.error(`[reminderService] Error deleting reminder ${reminderId}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to delete reminder',
        status: 500
      };
    }
  },

  async getUpcomingReminders(days: number = 7): Promise<ApiResponse<Reminder[]>> {
    console.log(`[reminderService] Getting upcoming reminders for ${days} days`);
    try {
      const response = await apiClient.get<Reminder[]>(`/v1/reminders/upcoming/${days}`);
      
      const reminders = Array.isArray(response.data) ? response.data : [];
      
      return { 
        data: reminders,
        status: response.status
      };
    } catch (error) {
      console.error('[reminderService] Error getting upcoming reminders:', error);
      return {
        data: [],
        status: 200,
        error: error instanceof Error ? error.message : 'Failed to get upcoming reminders'
      };
    }
  },

  async getOverdueReminders(): Promise<ApiResponse<Reminder[]>> {
    console.log('[reminderService] Getting overdue reminders');
    try {
      const response = await apiClient.get<Reminder[]>('/v1/reminders/overdue');
      
      const reminders = Array.isArray(response.data) ? response.data : [];
      
      return { 
        data: reminders,
        status: response.status
      };
    } catch (error) {
      console.error('[reminderService] Error getting overdue reminders:', error);
      return {
        data: [],
        status: 200,
        error: error instanceof Error ? error.message : 'Failed to get overdue reminders'
      };
    }
  },

  async getDueTodayReminders(): Promise<ApiResponse<Reminder[]>> {
    console.log('[reminderService] Getting due today reminders');
    try {
      const response = await apiClient.get<Reminder[]>('/v1/reminders/duetoday');
      
      const reminders = Array.isArray(response.data) ? response.data : [];
      
      return { 
        data: reminders,
        status: response.status
      };
    } catch (error) {
      console.error('[reminderService] Error getting due today reminders:', error);
      return {
        data: [],
        status: 200,
        error: error instanceof Error ? error.message : 'Failed to get due today reminders'
      };
    }
  },

  async getRemindersByStatus(status: 'pending' | 'triggered' | 'completed' | 'dismissed' | 'snoozed'): Promise<ApiResponse<Reminder[]>> {
    console.log(`[reminderService] Getting reminders by status: ${status}`);
    try {
      const response = await apiClient.get<Reminder[]>(`/v1/reminders/status/${status}`);
      
      const reminders = Array.isArray(response.data) ? response.data : [];
      
      return { 
        data: reminders,
        status: response.status
      };
    } catch (error) {
      console.error(`[reminderService] Error getting reminders by status ${status}:`, error);
      return {
        data: [],
        status: 200,
        error: error instanceof Error ? error.message : `Failed to get ${status} reminders`
      };
    }
  },

  async snoozeReminder(reminderId: string, snoozeUntil: Date): Promise<ApiResponse<Reminder>> {
    console.log(`[reminderService] Snoozing reminder ${reminderId} until ${snoozeUntil.toISOString()}`);
    try {
      const response = await apiClient.put<Reminder>(`/v1/reminders/${reminderId}`, {
        status: 'snoozed',
        snoozeUntil: snoozeUntil.toISOString()
      });
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`[reminderService] Error snoozing reminder ${reminderId}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to snooze reminder',
        status: 500
      };
    }
  },

  async markAsCompleted(reminderId: string): Promise<ApiResponse<Reminder>> {
    console.log(`[reminderService] Marking reminder ${reminderId} as completed`);
    try {
      const response = await apiClient.put<Reminder>(`/v1/reminders/${reminderId}`, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`[reminderService] Error marking reminder ${reminderId} as completed:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to mark reminder as completed',
        status: 500
      };
    }
  },

  async getReminderStatistics(): Promise<ApiResponse<ReminderStats>> {
    console.log('[reminderService] Getting reminder statistics');
    try {
      const response = await apiClient.get<ReminderStats>('/v1/reminders/statistics');
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('[reminderService] Error getting reminder statistics:', error);
      
      // Return default stats if API fails
      const defaultStats: ReminderStats = {
        total: 0,
        pending: 0,
        overdue: 0,
        completed: 0,
        today: 0
      };
      
      return {
        data: defaultStats,
        status: 200,
        error: error instanceof Error ? error.message : 'Failed to get reminder statistics'
      };
    }
  }
}; 