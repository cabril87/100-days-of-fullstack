export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  username: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CreateFamilyInput {
  name: string;
}

export interface UpdateFamilyInput {
  name?: string;
} 