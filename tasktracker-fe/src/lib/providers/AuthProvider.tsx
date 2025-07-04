'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { shouldSkipInitialAuth } from '@/lib/helpers/utils/authUtils';

// Enhanced Auth Reducer Types for Enterprise State Management
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean };

// Enhanced AuthState with proper initialization tracking
interface EnhancedAuthState extends AuthState {
  isInitializing: boolean;
  isInitialized: boolean;
}

const authReducer = (state: EnhancedAuthState, action: AuthAction): EnhancedAuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload, isInitializing: false };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        isInitialized: true,
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
        isInitializing: false,
        isInitialized: true, // Important: still initialized, just not authenticated
      };
    default:
      return state;
  }
};

const initialState: EnhancedAuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
  isInitializing: true,
  isInitialized: false,
};

// Enhanced AuthContextType with initialization status
interface EnhancedAuthContextType extends Omit<AuthContextType, 'isLoading'> {
  isLoading: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  isReady: boolean; // Helper for components to know when auth is fully ready
}

const AuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();
  const initializationAttempted = useRef(false);
  const mountedRef = useRef(true);

  // Helper to determine if auth is ready for other systems (like SignalR)
  const isReady = state.isInitialized && !state.isInitializing;

  // Legacy token cleanup helper (for transitioning from localStorage to cookies)
  const clearTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Authentication methods - Using HTTP-only cookies for server component compatibility
  const login = async (credentials: UserLoginDTO): Promise<void> => {
    console.log('🏗️ AuthProvider.login() - Starting login process');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('📡 AuthProvider.login() - Calling authService.loginWithCookie()');
      // Use cookie-based login for server component compatibility
      const response = await authService.loginWithCookie(credentials);
      console.log('✅ AuthProvider.login() - Login API successful, response:', response);
      
      // Check if user is family admin
      console.log('👨‍👩‍👧‍👦 AuthProvider.login() - Checking family admin status');
      const isFamilyAdmin = await familyInvitationService.isUserFamilyAdmin().catch(() => false);
      const userWithFamilyStatus = {
        ...response.user,
        isFamilyAdmin
      };
      console.log('👤 AuthProvider.login() - User with family status:', userWithFamilyStatus);
      
      console.log('🔄 AuthProvider.login() - Dispatching SET_USER action');
      dispatch({
        type: 'SET_USER',
        payload: {
          user: userWithFamilyStatus,
          accessToken: 'cookie-based', // Placeholder since token is in HTTP-only cookie
          refreshToken: 'cookie-based', // Placeholder since token is in HTTP-only cookie
        },
      });
      console.log('✅ AuthProvider.login() - Login process completed successfully');
    } catch (error) {
      console.error('❌ AuthProvider.login() - Error occurred:', error);
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
      // Use cookie-based logout for server component compatibility
      await authService.logoutWithCookie();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server call fails
    } finally {
      clearTokens(); // Clear any remaining localStorage tokens (legacy cleanup)
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
    try {
      // Use cookie-based token refresh
      const response = await authService.refreshTokenWithCookie();
      
      // Update user state with refreshed data
      const isFamilyAdmin = await familyInvitationService.isUserFamilyAdmin().catch(() => false);
      const userWithFamilyStatus = {
        ...response.user,
        isFamilyAdmin
      };
      
      dispatch({
        type: 'SET_USER',
        payload: {
          user: userWithFamilyStatus,
          accessToken: 'cookie-based', // Placeholder
          refreshToken: 'cookie-based', // Placeholder
        },
      });
      
      return true;
    } catch (err) {
      console.error('Cookie-based token refresh failed:', err);
      // Refresh failed, clear auth state
      clearTokens(); // Clean up any legacy localStorage tokens
      dispatch({ type: 'CLEAR_AUTH' });
      return false;
    }
  }, []);

  // Enterprise-grade auth initialization with proper state management
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (initializationAttempted.current || !mountedRef.current) {
      return;
    }

    initializationAttempted.current = true;
    dispatch({ type: 'SET_INITIALIZING', payload: true });

    try {
      console.log(`🔐 Initializing auth for page: ${pathname}`);
      
      // Try to get current user from HTTP-only cookie session
      const user = await authService.getCurrentUser();
      
      if (!mountedRef.current) return; // Component unmounted during async operation
      
      // Check if user is family admin
      const isFamilyAdmin = await familyInvitationService.isUserFamilyAdmin().catch(() => false);
      
      if (!mountedRef.current) return; // Component unmounted during async operation
      
      const userWithFamilyStatus = {
        ...user,
        isFamilyAdmin
      };
      
      console.log('✅ Auth initialization successful:', userWithFamilyStatus.email);
      dispatch({
        type: 'SET_USER',
        payload: { 
          user: userWithFamilyStatus, 
          accessToken: 'cookie-based', // Placeholder
          refreshToken: 'cookie-based' // Placeholder
        },
      });
      
    } catch (err) {
      if (!mountedRef.current) return; // Component unmounted during async operation
      
      // Check if it's a 401 error (no valid session) - this is expected when not logged in
      if (err instanceof AuthServiceError && err.status === 401) {
        console.log('🔐 No authentication session found - user not logged in');
      } else {
        console.error('❌ Cookie-based auth initialization failed:', err);
      }
      
      // No valid cookie session, mark as initialized but not authenticated
      dispatch({ type: 'CLEAR_AUTH' });
      
      // Clean up any legacy localStorage tokens
      clearTokens();
    } finally {
      if (mountedRef.current) {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    }
  }, [pathname]);

  // Initialize auth state on mount - Using cookie-based authentication
  useEffect(() => {
    mountedRef.current = true;

    // Skip auth initialization on first load of pure public pages
    if (shouldSkipInitialAuth(pathname)) {
      console.log(`🔓 Skipping initial auth for public page: ${pathname}`);
      dispatch({ type: 'CLEAR_AUTH' });
      return;
    }

    // Only initialize if not already attempted
    if (!initializationAttempted.current) {
      initializeAuth();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [pathname, initializeAuth]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isReady,
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

export const useAuth = (): EnhancedAuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 