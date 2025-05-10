
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

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (_e) {
          console.error('Failed to parse stored user data');
          localStorage.removeItem('user');
        }
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
  

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (this.currentUser && typeof window !== 'undefined') {
      return {
        data: this.currentUser,
        status: 200
      };
    }
    
    const response = await apiService.get<User>('/v1/auth/profile');
    
    if (response.data) {
      this.setCurrentUser(response.data);
    } else if (response.status === 401) {
      this.clearCurrentUser();
    }
    
    return response;
  }
  
  
  isAuthenticated(): boolean {
    return !!this.currentUser;
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