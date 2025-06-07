import { FamilyMemberAgeGroup, User } from './auth';

// Admin User Creation Types
export interface AdminUserCreateRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  ageGroup: FamilyMemberAgeGroup;
  familyId?: number;
  familyRoleId?: number;
  dateOfBirth?: string;
}

export interface AdminUserCreateResponse {
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
    role: string;
    ageGroup?: FamilyMemberAgeGroup;
    createdAt: string;
  };
  familyAssignment?: {
    familyId: number;
    familyName: string;
    roleName: string;
    roleId: number;
  };
  message: string;
}

export interface AdminFamilySelection {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
}

export interface FamilyRole {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}



// Admin User Management Types
export interface AdminUserListItem {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  role: string;
  ageGroup?: FamilyMemberAgeGroup;
  createdAt: string;
  isActive: boolean;
}

export interface AdminUserUpdateRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  ageGroup?: FamilyMemberAgeGroup;
  role?: string;
  isActive?: boolean;
}

export interface AdminPasswordChangeRequest {
  userId: number;
  newPassword: string;
  confirmNewPassword: string;
}

// Age Group Helpers
export const getAgeGroupLabel = (ageGroup: FamilyMemberAgeGroup): string => {
  switch (ageGroup) {
    case FamilyMemberAgeGroup.Child:
      return 'Child (0-12)';
    case FamilyMemberAgeGroup.Teen:
      return 'Teen (13-17)';
    case FamilyMemberAgeGroup.Adult:
      return 'Adult (18+)';
    default:
      return 'Unknown';
  }
};

export const getAgeGroupDescription = (ageGroup: FamilyMemberAgeGroup): string => {
  switch (ageGroup) {
    case FamilyMemberAgeGroup.Child:
      return 'Cannot create or manage families, limited permissions';
    case FamilyMemberAgeGroup.Teen:
      return 'Can create families (max 5 members), limited management, cannot transfer ownership';
    case FamilyMemberAgeGroup.Adult:
      return 'Full family management privileges including ownership transfer';
    default:
      return 'Unknown age group';
  }
};

export const canManageFamily = (ageGroup: FamilyMemberAgeGroup): boolean => {
  return ageGroup === FamilyMemberAgeGroup.Teen || ageGroup === FamilyMemberAgeGroup.Adult;
};

export const canTransferOwnership = (ageGroup: FamilyMemberAgeGroup): boolean => {
  return ageGroup === FamilyMemberAgeGroup.Adult;
};

export const canCreateFamily = (ageGroup: FamilyMemberAgeGroup): boolean => {
  return ageGroup === FamilyMemberAgeGroup.Teen || ageGroup === FamilyMemberAgeGroup.Adult;
};

export interface AdminStats {
  totalUsers: number;
  totalFamilies: number;
  activeSessions: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export interface AdminSystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface AdminActivityItem {
  id: string;
  action: string;
  adminName: string;
  timestamp: Date;
  details?: string;
}

export interface AdminDashboardContentProps {
  user: User;
  initialData: {
    stats: AdminStats;
    recentActivity: AdminActivityItem[];
    systemMetrics: AdminSystemMetrics;
  };
} 