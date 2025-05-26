'use client';

import { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  ReactNode, 
  useCallback,
  useMemo
} from 'react';
import { useRouter } from 'next/navigation';
import { AuthState, AuthContextType, TokenPayload, AuthResponse, AuthActionPayload, RefreshTokenRequest } from '@/lib/types/auth';
import { User } from '@/lib/types/user';
import { ApiResponse } from '@/lib/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Action types
const AUTH_ACTIONS = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_REQUEST: 'REFRESH_TOKEN_REQUEST',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  isLoading: true,
  error: null,
  lastAuthenticated: null,
  fingerprint: null,
  lastActivity: Date.now(),
};

// Reducer function
function authReducer(state: AuthState, action: AuthActionPayload): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_REQUEST:
    case AUTH_ACTIONS.REFRESH_TOKEN_REQUEST:
    case AUTH_ACTIONS.REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: (action.payload as any)?.user || null,
        accessToken: (action.payload as any)?.accessToken || null,
        refreshToken: (action.payload as any)?.refreshToken || null,
        tokenExpiry: (action.payload as any)?.expiration ? new Date((action.payload as any).expiration) : null,
        isLoading: false,
        error: null,
        lastAuthenticated: Date.now(),
        lastActivity: Date.now(),
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: typeof action.payload === 'string' ? action.payload : (action.payload as any)?.message || 'An error occurred',
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: (action.payload as any) || null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_ACTIVITY:
      return {
        ...state,
        lastActivity: Date.now(),
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  
  // Track request queue for handling 401s during token refresh
  const requestQueue: Function[] = [];
  let isRefreshingToken = false;
  
  // Helper functions for token management
  const parseJwt = useCallback((token: string): TokenPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  }, []);
  
  const processQueue = useCallback(() => {
    requestQueue.forEach(callback => callback());
    requestQueue.length = 0;
  }, [requestQueue]);
  
  const getBrowserFingerprint = useCallback(async (): Promise<string> => {
    // Simple fingerprint based on browser info and screen parameters
    // In production, consider using a proper fingerprinting library
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const browserInfo = navigator.userAgent;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const fingerprint = btoa(`${screenInfo}|${browserInfo}|${timeZone}`);
    return fingerprint;
  }, []);
  
  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthFromStorage = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          const storedUser = localStorage.getItem('user');
          const storedFingerprint = localStorage.getItem('fingerprint') || await getBrowserFingerprint();
          
          if (storedToken && storedUser) {
            const user = JSON.parse(storedUser) as User;
            const tokenPayload = parseJwt(storedToken);
            
            if (tokenPayload) {
              const tokenExpiry = new Date(tokenPayload.exp * 1000);
              
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user,
                  accessToken: storedToken,
                  refreshToken: storedRefreshToken,
                  expiration: tokenExpiry,
                  fingerprint: storedFingerprint,
                }
              });
              
              // If token is expired or will expire soon, refresh it
              if (isTokenExpired()) {
                refreshToken();
              }
            } else {
              // Invalid token, clear storage
              clearAuthStorage();
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } else {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        clearAuthStorage();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        dispatch({ type: AUTH_ACTIONS.UPDATE_ACTIVITY });
      }
    };
    
    loadAuthFromStorage();
  }, []);
  
  // Create stable updateUserActivity function
  const updateUserActivity = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_ACTIVITY });
  }, []);

  // Set up activity tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && state.isAuthenticated) {
      const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'mousemove'];
      
      const activityHandler = () => {
        updateUserActivity();
      };
      
      events.forEach(event => {
        window.addEventListener(event, activityHandler);
      });
      
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, activityHandler);
        });
      };
    }
  }, [state.isAuthenticated, updateUserActivity]);
  
  // Automatic token refresh
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokenExpiry) return;
    
    // Check if user has been inactive for too long (30 minutes)
    const checkUserActivity = () => {
      const now = Date.now();
      const inactiveTime = now - state.lastActivity;
      const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
      
      if (inactiveTime > maxInactiveTime) {
        console.log('User inactive for too long, logging out');
        logout();
        return;
      }
      
      // Check if token is expiring soon (5 minutes or less)
      if (state.tokenExpiry && state.tokenExpiry instanceof Date) {
        const tokenExpiresIn = state.tokenExpiry.getTime() - now;
        const refreshThreshold = 5 * 60 * 1000; // 5 minutes
        
        if (tokenExpiresIn < refreshThreshold) {
          console.log('Token expiring soon, refreshing...');
          refreshToken();
        }
      }
    };
    
    const activityInterval = setInterval(checkUserActivity, 60000); // Check every minute
    
    return () => {
      clearInterval(activityInterval);
    };
  }, [state.isAuthenticated, state.tokenExpiry]);
  
  // Fetch CSRF token
  const fetchCsrfToken = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
      });
      
      // Try to get the token from cookies
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
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return '';
    }
  };
  
  // Core authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_REQUEST });
    
    try {
      const csrfToken = await fetchCsrfToken();
      const fingerprint = await getBrowserFingerprint();
      
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          emailOrUsername: email,
          password,
          fingerprint,
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json() as AuthResponse;
        
        // Ensure expiration is a Date object
        const expiration = new Date(data.expiration);
        
        // Store in localStorage
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('fingerprint', fingerprint);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiration: expiration,
            fingerprint,
          },
        });
        
        return true;
      } else {
        const errorData = await response.json();
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorData.message || 'Login failed',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { message: 'An unexpected error occurred' },
      });
      return false;
    }
  };
  
  const register = async (userData: any): Promise<boolean> => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_REQUEST });
    
    try {
      const csrfToken = await fetchCsrfToken();
      const fingerprint = await getBrowserFingerprint();
      
      const registerData = {
        ...userData,
        confirmPassword: userData.password,
        csrfToken,
        fingerprint,
      };
      
      const response = await fetch(`${API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(registerData),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json() as AuthResponse;
        
        // Store in localStorage
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('fingerprint', fingerprint);
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: {
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiration: data.expiration,
            fingerprint,
          },
        });
        
        return true;
      } else {
        const errorData = await response.json();
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: errorData.message || 'Registration failed',
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { message: 'An unexpected error occurred' },
      });
      return false;
    }
  };
  
  const refreshToken = async (): Promise<boolean> => {
    // Skip if already refreshing or on auth pages
    if (
      isRefreshingToken || 
      (typeof window !== 'undefined' && 
        (window.location.pathname.includes('/auth/login') || 
         window.location.pathname.includes('/auth/register')))
    ) {
      return new Promise((resolve) => {
        requestQueue.push(() => resolve(true));
      });
    }
    
    const currentRefreshToken = state.refreshToken || localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      clearAuthStorage();
      dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE, payload: { message: 'No refresh token available' } });
      return false;
    }
    
    isRefreshingToken = true;
    dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_REQUEST });
    
    try {
      const csrfToken = await fetchCsrfToken();
      const fingerprint = state.fingerprint || await getBrowserFingerprint();
      
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: currentRefreshToken,
        fingerprint,
      };
      
      const response = await fetch(`${API_URL}/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(refreshRequest),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json() as AuthResponse;
        
        // Ensure expiration is a Date object
        const expiration = new Date(data.expiration);
        
        // Store in localStorage
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        localStorage.setItem('fingerprint', fingerprint);
        
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
          payload: {
            user: data.user || state.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiration: expiration,
            fingerprint,
          },
        });
        
        // Process any queued requests
        processQueue();
        isRefreshingToken = false;
        return true;
      } else {
        const errorData = await response.json();
        clearAuthStorage();
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
          payload: errorData.message || 'Token refresh failed',
        });
        
        if (response.status === 401) {
          // Only redirect to login if explicitly unauthorized and not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            router.push('/auth/login?expired=true');
          }
        }
        
        isRefreshingToken = false;
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthStorage();
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
        payload: { message: 'An unexpected error occurred during token refresh' },
      });
      
      isRefreshingToken = false;
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      const csrfToken = await fetchCsrfToken();
      const refreshToken = state.refreshToken || localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Try to call logout API but don't wait for response
        fetch(`${API_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.accessToken}`,
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        }).catch(error => {
          console.warn('Logout API call failed, but continuing with local logout:', error);
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage and state
      clearAuthStorage();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      router.push('/auth/login');
    }
  };
  
  // Utility functions
  const clearAuthStorage = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    localStorage.removeItem('fingerprint');
  };

  // Add this new function for complete storage clearing
  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
  };
  
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };
  
  const getAccessToken = (): string | null => {
    return state.accessToken;
  };
  
  const getTokenExpiry = (): Date | null => {
    return state.tokenExpiry;
  };
  
  const isTokenExpired = (): boolean => {
    if (!state.tokenExpiry || !(state.tokenExpiry instanceof Date)) return true;
    
    const now = new Date();
    const expiryWithBuffer = new Date(state.tokenExpiry);
    expiryWithBuffer.setMinutes(expiryWithBuffer.getMinutes() - 5); // 5 minute buffer
    
    return now >= expiryWithBuffer;
  };
  
  // Create context value
  const contextValue = useMemo<AuthContextType>(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    getAccessToken,
    getTokenExpiry,
    updateUserActivity,
    isTokenExpired,
    clearAllStorage,
  }), [state]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 