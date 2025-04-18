"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError, UserDTO, TokensResponseDTO, ApiResponse } from '@/lib/api';

// Define user type - use the same UserDTO from the API
export type User = UserDTO;

// Define auth state
type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

// Define auth context value type
type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, confirmPassword?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Helper function to extract user and tokens from either response format
const extractAuthData = (response: TokensResponseDTO | ApiResponse<TokensResponseDTO>) => {
  // Check if it's a wrapped response (ApiResponse format)
  if ('succeeded' in response && 'data' in response && response.data) {
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  }
  // It's a direct response (TokensResponseDTO format)
  return {
    user: (response as TokensResponseDTO).user,
    accessToken: (response as TokensResponseDTO).accessToken,
    refreshToken: (response as TokensResponseDTO).refreshToken,
  };
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Load user from token
  const loadUser = async () => {
    try {
      const response = await api.auth.refreshToken();
      const authData = extractAuthData(response);
      
      if (authData.user && authData.accessToken) {
        setState({
          user: authData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Update token
        localStorage.setItem('token', authData.accessToken);
      } else {
        // Token invalid or expired
        localStorage.removeItem('token');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      // Handle error
      localStorage.removeItem('token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to load user',
      });
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email, password: "***" });
      
      const response = await api.auth.login({ email, password });
      
      // Debug the entire response
      console.log("Raw API response:", response);
      
      const authData = extractAuthData(response);
      
      if (authData.user && authData.accessToken) {
        console.log("Login successful");
        
        setState({
          user: authData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Store tokens
        localStorage.setItem('token', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken || '');
        
        console.log("Login state updated, redirecting user");
        return true;
      } else {
        console.error("Login failed with response:", response);
        setState((prev) => ({
          ...prev,
          error: 'message' in response ? response.message : 'Login failed',
        }));
        return false;
      }
    } catch (error) {
      console.error("Login error details:", error);
      
      const errorMessage = (error as ApiError).message || 'Login failed';
      console.error("Setting error message:", errorMessage);
      
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return false;
    }
  };

  // Register function
  const register = async (email: string, username: string, password: string, confirmPassword?: string) => {
    try {
      const response = await api.auth.register({ 
        email, 
        username, 
        password, 
        confirmPassword: confirmPassword || password // Use confirmPassword if provided, otherwise use password
      });
      
      console.log("Raw register response:", response);
      
      const authData = extractAuthData(response);
      
      if (authData.user && authData.accessToken) {
        console.log("Registration successful");
        
        setState({
          user: authData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Store tokens
        localStorage.setItem('token', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken || '');
        
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: 'message' in response ? response.message : 'Registration failed',
        }));
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      setState((prev) => ({
        ...prev,
        error: (error as ApiError).message || 'Registration failed',
      }));
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove tokens and reset state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 