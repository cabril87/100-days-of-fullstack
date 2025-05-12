/**
 * Authentication related types
 */

import { User } from './user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  isLoading: boolean;
  error: string | null;
  lastAuthenticated: number | null;
  fingerprint: string | null;
  lastActivity: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiration: Date;
}

export interface TokenPayload {
  nameid: string; // user id
  unique_name: string; // username
  email: string;
  role: string;
  jti: string; // token id
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
  nbf: number; // not valid before timestamp
}

export interface RefreshTokenRequest {
  refreshToken: string;
  fingerprint?: string;
}

export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  
  // Token Management
  getAccessToken: () => string | null;
  getTokenExpiry: () => Date | null;
  updateUserActivity: () => void;
  isTokenExpired: () => boolean;
}

export interface AuthActionPayload {
  type: string;
  payload?: any;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface TokenInfo {
  userId: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
} 