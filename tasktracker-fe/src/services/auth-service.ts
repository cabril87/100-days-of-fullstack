/**
 * Authentication Service
 * 
 * Handles user authentication, registration, and session management.
 * Uses secure practices including proper token handling and CSRF protection.
 */

import { apiService, ApiResponse } from './api';

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  role: string;
  createdAt: string;
}

interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Authentication service for managing user auth state
 */
class AuthService {
  private currentUser: User | null = null;
  
  /**
   * Initialize auth service and try to restore session
   */
  constructor() {
    // Check for stored user data on client side
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (e) {
          console.error('Failed to parse stored user data');
          localStorage.removeItem('user');
        }
      }
    }
  }
  
  /**
   * Log in a user with credentials
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    const response = await apiService.post<AuthResponse>('/v1/auth/login', credentials, false);
    
    if (response.data) {
      this.setCurrentUser(response.data.user);
      return {
        data: response.data.user,
        status: response.status
      };
    }
    
    return {
      error: response.error,
      status: response.status
    };
  }
  
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiService.post<AuthResponse>('/v1/auth/register', userData, false);
    
    if (response.data) {
      this.setCurrentUser(response.data.user);
      return {
        data: response.data.user,
        status: response.status
      };
    }
    
    return {
      error: response.error,
      status: response.status
    };
  }
  
  /**
   * Log out the current user
   */
  async logout(): Promise<boolean> {
    const response = await apiService.post<void>('/v1/auth/logout', {});
    
    // Clear user data regardless of API response
    this.clearCurrentUser();
    
    return response.status === 200 || response.status === 204;
  }
  
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    // If we already have the user data and we're in a browser, return it
    if (this.currentUser && typeof window !== 'undefined') {
      return {
        data: this.currentUser,
        status: 200
      };
    }
    
    // Otherwise fetch from API
    const response = await apiService.get<User>('/v1/auth/me');
    
    if (response.data) {
      this.setCurrentUser(response.data);
    } else if (response.status === 401) {
      // Clear invalid user data
      this.clearCurrentUser();
    }
    
    return response;
  }
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
  
  /**
   * Get user's role for authorization
   */
  getUserRole(): string | null {
    return this.currentUser?.role || null;
  }
  
  /**
   * Store user data
   */
  private setCurrentUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  /**
   * Clear user data
   */
  private clearCurrentUser(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }
}

// Export a singleton instance
export const authService = new AuthService(); 