'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, RegisterRequest, LoginRequest } from '@/lib/types/user';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshToken: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user data on initial mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getCurrentUser();
        if (response.data) {
          console.log('User data loaded from auth service:', response.data);
          setUser(response.data);
        } else {
          console.log('No user data found or unauthorized');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Login attempt with email:', email);
      const loginData: LoginRequest = { email, password };
      const response = await authService.login(loginData);
      
      if (response.data) {
        console.log('Login successful, user data:', response.data);
        setUser(response.data);
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      
      if (response.data) {
        setUser(response.data);
        return true;
      } else {
        console.error('Registration failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh auth token');
      const response = await authService.refreshToken();
      
      if (response.data) {
        console.log('Token refresh successful');
        // Update user data if available in response
        if (response.data.user) {
          setUser(response.data.user);
        }
        return true;
      } else {
        console.error('Token refresh failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 