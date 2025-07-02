// ============================================================================
// USER CONTEXT TYPES
// According to .cursorrules: All types must be in lib/types/ subdirectories
// ============================================================================

import type { User } from './auth';
import type { FamilyDTO as Family } from '@/lib/types/family/family-invitation';

// ================================
// USER CONTEXT CONFIGURATION
// ================================

export interface UserContextValue {
  user: User | null;
  family: Family | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  hasFamily: boolean;
  userRole: string | null;
  permissions: string[];
  refreshUser: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  logout: () => Promise<void>;
}

// ================================
// USER HOOK OPTIONS
// ================================

export interface UseUserOptions {
  includeFamily?: boolean;
  includePermissions?: boolean;
  refreshOnMount?: boolean;
  refreshInterval?: number;
  requireAuth?: boolean;
  requireFamily?: boolean;
  onAuthStateChange?: (user: User | null) => void;
  onFamilyChange?: (family: Family | null) => void;
  onError?: (error: string) => void;
}

// ================================
// USER STATE MANAGEMENT
// ================================

export interface UserState {
  user: User | null;
  family: Family | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UserAction {
  type: 'SET_USER' | 'SET_FAMILY' | 'SET_LOADING' | 'SET_ERROR' | 'SET_INITIALIZED' | 'CLEAR_USER' | 'CLEAR_FAMILY';
  payload?: User | Family | boolean | string | null;
}

// ================================
// USER PREFERENCES
// ================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'family' | 'private';
    activityTracking: boolean;
    dataSharing: boolean;
  };
  gamification: {
    enableCelebrations: boolean;
    enableSounds: boolean;
    enableHaptics: boolean;
    showLeaderboard: boolean;
  };
} 