/**
 * User-related type definitions
 */

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Note: LoginRequest, RegisterRequest, and AuthResponse are defined in auth.ts

export interface ProfileUpdateRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// Additional user-related types that were in services
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
} 