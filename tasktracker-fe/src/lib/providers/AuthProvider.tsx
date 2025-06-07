'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthServiceError } from '../services/authService';
import { familyInvitationService } from '../services/familyInvitationService';
import { 
  AuthState, 
  AuthContextType, 
  User, 
  UserLoginDTO, 
  UserCreateDTO, 
  UserProfileUpdateDTO, 
  PasswordChangeDTO
} from '../types/auth';

// Auth Reducer Types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ERROR'; payload: string | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_TOKENS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case 'CLEAR_AUTH':
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Token storage helpers
  const storeTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const clearTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Authentication methods
  const login = async (credentials: UserLoginDTO): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(credentials);
      
      // Store tokens FIRST so they're available for subsequent API calls
      storeTokens(response.accessToken, response.refreshToken);
      
      // NOW check if user is family admin (with tokens available)
      const isFamilyAdmin = await familyInvitationService.isUserFamilyAdmin().catch(() => false);
      const userWithFamilyStatus = {
        ...response.user,
        isFamilyAdmin
      };
      
      dispatch({
        type: 'SET_USER',
        payload: {
          user: userWithFamilyStatus,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      
      if (error instanceof AuthServiceError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const register = async (userData: UserCreateDTO): Promise<void> => {
    try {
      await authService.register(userData);
      // After successful registration, automatically log them in
      await login({ 
        emailOrUsername: userData.email, 
        password: userData.password 
      });
    } catch (err) {
      console.error('Registration failed:', err);
      const message = err instanceof AuthServiceError ? err.message : 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (state.refreshToken) {
        await authService.logout(state.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server call fails
    } finally {
      clearTokens();
      dispatch({ type: 'CLEAR_AUTH' });
      
      // Redirect to homepage after logout (standard convention)
      router.push('/');
    }
  };

  const updateProfile = async (data: UserProfileUpdateDTO): Promise<void> => {
    await authService.updateProfile(data);
    
    // Refresh user profile
    const updatedUser = await authService.getProfile();
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  };

  const changePassword = async (data: PasswordChangeDTO): Promise<void> => {
    await authService.changePassword(data);
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    await authService.requestPasswordReset(email);
  };

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await authService.refreshToken(refreshToken);
      
      storeTokens(response.accessToken, response.refreshToken);
      
      dispatch({
        type: 'UPDATE_TOKENS',
        payload: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
      
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      // Refresh failed, clear auth state
      clearTokens();
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Try to get current user profile
        const user = await authService.getProfile();
        
        // Check if user is family admin
        const isFamilyAdmin = await familyInvitationService.isUserFamilyAdmin().catch(() => false);
        const userWithFamilyStatus = {
          ...user,
          isFamilyAdmin
        };
        
        dispatch({
          type: 'SET_USER',
          payload: { user: userWithFamilyStatus, accessToken, refreshToken },
        });
      } catch (err) {
        console.error('Profile initialization failed:', err);
        // Access token might be expired, try refresh
        const refreshSuccess = await refreshAccessToken();
        if (!refreshSuccess) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeAuth();
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 