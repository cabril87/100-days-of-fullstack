export interface Family {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  userId: string;
  username: string;
  role: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    isDefault: boolean;
    createdAt: string;
  };
  email?: string;
  joinedAt: string;
  completedTasks?: number;
  pendingTasks?: number;
  isActive?: boolean;
}

export interface CreateFamilyInput {
  name: string;
}

export interface UpdateFamilyInput {
  name?: string;
  description?: string;
} 