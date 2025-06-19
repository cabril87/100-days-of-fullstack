/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { User } from '@/lib/types/auth';

export interface AuthHealthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  isReady: boolean;
  user?: User | null;
}

export type HealthStatusLevel = 'healthy' | 'warning' | 'error' | 'initializing'; 