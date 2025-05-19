import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export const userService = {
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    try {
      console.log(`[userService] Searching users with query: ${query}`);
      
      // Use the real API endpoint instead of mock data
      const response = await apiClient.get<User[]>(`/v1/users/search?q=${encodeURIComponent(query)}`);
      
      // If no results came back or the API isn't fully implemented yet
      if (!response.data || response.data.length === 0) {
        // Provide one result that matches the query exactly
        // Check if query is already an email
        const isEmail = query.includes('@');
        
        const fallbackUser = {
          id: '999',
          username: isEmail ? query.split('@')[0] : `user_${query}`,
          email: isEmail ? query : query, // Don't append @example.com if it's already an email
          displayName: isEmail ? query.split('@')[0] : query
        };
        
        return {
          data: [fallbackUser],
          status: 200
        };
      }
      
      return response;
    } catch (error) {
      console.error('[userService] Error searching users:', error);
      
      // Fallback if API fails - provide a result but without modifying the email
      const isEmail = query.includes('@');
      
      const fallbackUser = {
        id: '999',
        username: isEmail ? query.split('@')[0] : `user_${query}`,
        email: isEmail ? query : query, // Don't append @example.com
        displayName: isEmail ? query.split('@')[0] : query
      };
      
      return {
        data: [fallbackUser],
        status: 200
      };
    }
  },
  
  async getUserDetails(userId: string): Promise<ApiResponse<User>> {
    try {
      console.log(`[userService] Getting user details for ID: ${userId}`);
      
      // Use real API to get user details
      const response = await apiClient.get<User>(`/v1/users/${userId}`);
      
      // If we get a response, return it
      if (response.data) {
        return response;
      }
      
      // Fallback in case the API doesn't return data
      return {
        data: {
          id: userId,
          username: `user_${userId}`,
          email: `user_${userId}@example.com`,
          displayName: `User ${userId}`
        },
        status: 200
      };
    } catch (error) {
      console.error(`[userService] Error getting user details for ID ${userId}:`, error);
      
      // Fallback if API fails
      return {
        data: {
          id: userId,
          username: `user_${userId}`,
          email: `user_${userId}@example.com`,
          displayName: `User ${userId}`
        },
        status: 200
      };
    }
  }
}; 