export interface Family {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
  userRole?: {
    id: number;
    name: string;
    permissions: string[];
  };
  currentUserPermissions?: string[];
}

export interface FamilyMember {
  id: string | number;
  userId: string | number;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  username?: string;
  name?: string;
  email?: string | null;
  avatarUrl?: string | null;
  joinedAt: string;
  role?: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    isDefault: boolean;
    createdAt: string;
  };
  relationship?: string;
  familyId?: string | number;
  familyName?: string | null;
  permissions?: any | null;
  completedTasks?: number;
  pendingTasks?: number;
  lastActivityDate?: string;
  streak?: number;
  isActive?: boolean;
}

export interface FamilyCalendarEvent {
  id: number;
  familyId: number;
  title: string;
  description: string;
  location: string;
  eventType: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  priority: string;
  isPrivate: boolean;
  createdById: number;
  createdByName: string;
  createdAt: string;
  lastModified: string;
  attendees: {
    id: number;
    eventId: number;
    familyMemberId: number;
    memberName: string;
    response: string;
    responseDate?: string;
    notes?: string;
    familyMember?: FamilyMember;
  }[];
  reminders: {
    id: number;
    eventId: number;
    reminderTime: string;
    reminderType: string;
    message: string;
    isActive: boolean;
  }[];
}

export interface CreateFamilyInput {
  name: string;
}

export interface UpdateFamilyInput {
  name?: string;
  description?: string;
}

// Family DTO for API responses
export interface FamilyDTO {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    id: number;
    username: string;
    email: string;
  } | null;
  members: Array<{
    id: number;
    familyId: number;
    name: string;
    email: string | null;
    avatarUrl: string | null;
    relationship: string;
    user: {
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      displayName: string;
      avatarUrl: string | null;
      createdAt: string;
    };
    role: {
      id: number;
      name: string;
      description: string;
      permissions: string[];
      isDefault: boolean;
      createdAt: string;
    };
    joinedAt: string;
  }>;
} 