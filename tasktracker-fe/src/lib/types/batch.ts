/**
 * Batch operations and bulk task management types
 */

export interface BatchOperation {
  id: string;
  type: 'complete' | 'update_priority' | 'update_status' | 'update_category' | 'delete' | 'assign';
  taskIds: number[];
  parameters?: Record<string, string | number | boolean>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  progress?: number;
  results?: BatchOperationResult[];
}

export interface BatchOperationResult {
  taskId: number;
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

export interface BatchUpdateRequest {
  taskIds: number[];
  updates: {
    status?: string;
    priority?: string;
    categoryId?: number;
    dueDate?: string;
    assignedTo?: string;
  };
}

export interface BatchCompleteRequest {
  taskIds: number[];
  completionNotes?: string;
}

export interface BatchDeleteRequest {
  taskIds: number[];
  confirmDeletion: boolean;
}

export interface BatchAssignRequest {
  taskIds: number[];
  assignedToUserId: number;
  requiresApproval?: boolean;
}

export interface BatchOperationSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  operationType: string;
  executedAt: string;
  executedBy: string;
  pointsAwarded?: number;
} 