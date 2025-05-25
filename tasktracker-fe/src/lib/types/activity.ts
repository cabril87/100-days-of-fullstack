/**
 * Family activity and tracking related types
 */

export interface FamilyActivityDTO {
  id: number;
  familyId: number;
  actorId: number;
  actorName: string;
  actorDisplayName: string;
  actorAvatarUrl?: string;
  targetId?: number;
  targetName?: string;
  targetDisplayName?: string;
  actionType: string;
  description?: string;
  timestamp: string;
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, any>;
}

export interface FamilyActivityFilterDTO {
  actorId?: number;
  targetId?: number;
  actionType?: string;
  entityType?: string;
  entityId?: number;
  startDate?: string;
  endDate?: string;
  pageNumber: number;
  pageSize: number;
}

export interface FamilyActivityPagedResultDTO {
  activities: FamilyActivityDTO[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
} 