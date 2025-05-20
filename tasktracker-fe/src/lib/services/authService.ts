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
      
      // Store refresh token
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
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
    try {
      // Get CSRF token from cookies
      const getCsrfToken = (): string => {
        try {
          const rawCsrfToken = document.cookie
            .split(';')
            .find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
          
          // Properly decode the token from URL encoding
          return rawCsrfToken ? decodeURIComponent(rawCsrfToken) : '';
        } catch (error) {
          console.error('[authService] Error extracting CSRF token:', error);
          return '';
        }
      };

      const csrfToken = getCsrfToken();
      console.log('[authService] Attempting to refresh token with CSRF token:', csrfToken ? 'Found' : 'Not found');
      
      // Get refresh token from storage
      const refreshToken = localStorage.getItem('refreshToken') || '';
      if (!refreshToken) {
        console.warn('[authService] No refresh token available');
        return {
          error: 'No refresh token available',
          status: 401
        };
      }
      
      // Make direct fetch to ensure correct headers
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-XSRF-TOKEN': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken, csrfToken })
      });

      console.log('[authService] Refresh token response status:', response.status);
      
      if (!response.ok) {
        return {
          error: `Token refresh failed: ${response.status}`,
          status: response.status
        };
      }

      const data = await response.json();
      console.log('[authService] Token refresh successful');
      
        // Store the new tokens
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
        
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
        }
        
      return {
        data: data,
        status: response.status
      };
    } catch (error) {
      console.error('[authService] Error in refreshToken:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to refresh token',
        status: 500
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      this.currentUser = null;
    }
  }
}

export const authService = new AuthService(); 