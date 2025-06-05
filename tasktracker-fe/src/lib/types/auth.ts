// Enums matching backend exactly
export enum FamilyMemberAgeGroup {
  Child = 0,
  Teen = 1,
  Adult = 2
}

// User Types - matching backend User model exactly
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  ageGroup: FamilyMemberAgeGroup;
  createdAt: string;
  isActive: boolean;
  points: number;
  isFamilyAdmin?: boolean; // Whether user is admin of any family
}

// Authentication DTOs - matching backend AuthDTOs exactly
export interface UserLoginDTO {
  emailOrUsername: string;
  password: string;
}

export interface UserCreateDTO {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string | null;
  lastName: string | null;
  ageGroup: FamilyMemberAgeGroup;
  dateOfBirth: string | null;
}

export interface TokensResponseDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
  expiration: string;
  user: User;
}

export interface UserProfileUpdateDTO {
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferences: string | null;
}

export interface PasswordChangeDTO {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequestDTO {
  email: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface LogoutRequestDTO {
  refreshToken: string;
}

export interface AdminPasswordChangeDTO {
  userId: number;
  newPassword: string;
  confirmNewPassword: string;
}

// Form Types for React Hook Form
export interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  ageGroup: FamilyMemberAgeGroup;
}

export interface ProfileUpdateFormData {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: UserLoginDTO) => Promise<void>;
  register: (userData: UserCreateDTO) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfileUpdateDTO) => Promise<void>;
  changePassword: (data: PasswordChangeDTO) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

// MFA Types - matching backend MFA DTOs exactly
export interface MFASetupInitiateDTO {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export interface MFASetupCompleteDTO {
  code: string;
}

export interface MFAVerificationDTO {
  code: string;
}

export interface MFADisableDTO {
  password: string;
  code?: string;
}

export interface MFABackupCodesDTO {
  backupCodes: string[];
  generatedAt: string;
}

export interface MFAStatusDTO {
  isEnabled: boolean;
  setupDate: string | null;
  backupCodesRemaining: number;
}

export interface MFABackupCodeDTO {
  backupCode: string;
}

// MFA Form Types for React Hook Form
export interface MFASetupFormData {
  code: string;
}

export interface MFAVerificationFormData {
  code: string;
}

export interface MFADisableFormData {
  password: string;
  code?: string;
}

export interface MFABackupCodeFormData {
  backupCode: string;
}

// API Response Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
} 