import { apiService } from './apiService';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/lib/types/user';
import { ApiResponse } from '@/lib/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getCsrfToken = (): string => {
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
  
  return '';
};

// Add profile update type
interface ProfileUpdateRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

// Add password change type
interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      // Make sure we have both user data and token
      if (userData && token) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (_e) {
          console.error('Failed to parse stored user data');
          this.clearCurrentUser();
        }
      } else if (!token) {
        // If we have user data but no token, clear everything
        this.clearCurrentUser();
      }
    }
  }
  

  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    const csrfToken = await this.fetchCsrfToken();
    
    const loginData = {
      emailOrUsername: credentials.email, 
      password: credentials.password,
      csrfToken 
    };

    const response = await apiService.post<AuthResponse>('/v1/auth/login', loginData, false);
    
    if (response.data) {
      localStorage.setItem('token', response.data.accessToken || '');
      
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
  

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const csrfToken = await this.fetchCsrfToken();
    
    const registerData = {
      ...userData,
      confirmPassword: userData.password,
      csrfToken 
    };

    const response = await apiService.post<AuthResponse>('/v1/auth/register', registerData, false);
    
    if (response.data) {
      localStorage.setItem('token', response.data.accessToken || '');
      
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
   * Updates user profile information
   */
  async updateProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<void>> {
    try {
      // Ensure we have a CSRF token
      const csrfToken = await this.fetchCsrfToken();
      
      const response = await apiService.put<void>(
        '/v1/auth/profile',
        { ...profileData, csrfToken }
      );

      // If successful, update the local user data
      if (response.status === 204) {
        // We'll need to get the updated user profile
        const userResponse = await this.getCurrentUser();
        if (userResponse.data) {
          this.setCurrentUser(userResponse.data);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        error: 'Failed to update profile',
        status: 0
      };
    }
  }

  /**
   * Changes user password
   */
  async changePassword(passwordData: PasswordChangeRequest): Promise<ApiResponse<void>> {
    try {
      // Ensure we have a CSRF token
      const csrfToken = await this.fetchCsrfToken();
      
      return await apiService.post<void>(
        '/v1/auth/change-password',
        { ...passwordData, csrfToken }
      );
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        error: 'Failed to change password',
        status: 0
      };
    }
  }

  private async fetchCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/v1/auth/csrf`, {
        method: 'GET',
        credentials: 'include', 
      });
      
      const data = await response.json();
      let token = '';
      
      if (data && data.csrfToken) {
        token = data.csrfToken;
      } else {
        token = getCsrfToken();
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return token;
    } catch (_error) {
      console.error('Error fetching CSRF token:', _error);
      return getCsrfToken();
    }
  }
  

  async logout(): Promise<boolean> {
    const response = await apiService.post<void>('/v1/auth/logout', {});
    
    this.clearCurrentUser();
    
    return response.status === 200 || response.status === 204;
  }
  
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    console.log('AuthService: Refreshing token');
    try {
      // First try to get a fresh CSRF token
      const csrfToken = await this.fetchCsrfToken();
      
      // Call the refresh token endpoint
      const response = await apiService.post<AuthResponse>('/v1/auth/refresh', { csrfToken }, false);
      
      if (response.data && response.data.accessToken) {
        console.log('AuthService: Token refresh successful');
        // Store the new token
        localStorage.setItem('token', response.data.accessToken);
        
        // Update user data if available
        if (response.data.user) {
          this.setCurrentUser(response.data.user);
        }
        
        return response;
      } else {
        console.error('AuthService: Token refresh failed', response.error);
        return response;
      }
    } catch (error) {
      console.error('AuthService: Error refreshing token', error);
      return {
        error: 'Failed to refresh authentication token',
        status: 0
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // If we have user data stored locally and a token, use that first
    if (this.currentUser && localStorage.getItem('token') && typeof window !== 'undefined') {
      return {
        data: this.currentUser,
        status: 200
      };
    }
    
    // Otherwise fetch from server
    const response = await apiService.get<User>('/v1/auth/profile');
    
    if (response.data) {
      this.setCurrentUser(response.data);
    } else if (response.status === 401) {
      // If unauthorized, clear any locally stored auth data
      this.clearCurrentUser();
    }
    
    return response;
  }
  
  
  isAuthenticated(): boolean {
    return !!this.currentUser && !!localStorage.getItem('token');
  }
  
 
  getUserRole(): string | null {
    return this.currentUser?.role || null;
  }
  
 
  private setCurrentUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
 
  private clearCurrentUser(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
}

export const authService = new AuthService(); 