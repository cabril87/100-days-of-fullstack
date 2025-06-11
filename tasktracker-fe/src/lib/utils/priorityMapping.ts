// Priority mapping utilities for backend compatibility
import { CreateTaskDTO, UpdateTaskDTO } from '@/lib/types/task';

export type PriorityString = 'Low' | 'Medium' | 'High' | 'Urgent';
export type PriorityInt = 0 | 1 | 2 | 3;

// Union type for task data that can be converted for backend
export type TaskDataForBackend = CreateTaskDTO | UpdateTaskDTO | Partial<CreateTaskDTO> | Partial<UpdateTaskDTO>;

/**
 * Maps priority strings to backend integers
 * Note: Frontend uses 'Urgent' but backend enum uses 'Critical' for value 3
 */
export const priorityStringToInt = (priority: PriorityString): PriorityInt => {
  const mapping: Record<PriorityString, PriorityInt> = {
    'Low': 0,
    'Medium': 1,
    'High': 2,
    'Urgent': 3  // Maps to TaskPriority.Critical (3) in backend
  };
  return mapping[priority];
};

/**
 * Maps backend integers to priority strings
 */
export const priorityIntToString = (priority: number): PriorityString => {
  const mapping: Record<number, PriorityString> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Urgent'
  };
  return mapping[priority] || 'Medium';
};

/**
 * Maps TaskPriority enum values to strings (for database storage)
 */
export const priorityIntToEnumString = (priority: number): string => {
  const mapping: Record<number, string> = {
    0: 'Low',
    1: 'Medium', 
    2: 'High',
    3: 'Critical'  // Note: Backend uses 'Critical' instead of 'Urgent'
  };
  return mapping[priority] || 'Medium';
};

/**
 * Converts task data for backend submission
 * Maps frontend camelCase to backend PascalCase and handles data transformations
 */
export const convertTaskDataForBackend = async (data: TaskDataForBackend, tagIds?: number[]): Promise<Record<string, unknown>> => {
  const converted: Record<string, unknown> = {};
  
  // Map frontend property names to backend property names (camelCase -> PascalCase)
  const propertyMapping: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    priority: 'Priority',
    dueDate: 'DueDate',
    categoryId: 'CategoryId',
    estimatedTimeMinutes: 'EstimatedTimeMinutes',
    pointsValue: 'PointsValue',
    assignedToUserId: 'AssignedToUserId',
    familyId: 'FamilyId',
    version: 'Version'
  };
  
  // Convert properties with correct naming
  Object.keys(data).forEach(key => {
    if (data[key as keyof TaskDataForBackend] !== undefined && propertyMapping[key]) {
      converted[propertyMapping[key]] = data[key as keyof TaskDataForBackend];
    }
  });
  
  // Convert priority from string to integer (TaskItemDTO expects int Priority)
  if (converted.Priority && typeof converted.Priority === 'string') {
    converted.Priority = priorityStringToInt(converted.Priority as PriorityString);
  }
  
  // Add required fields that might be missing
  if (!converted.Status) {
    converted.Status = 0; // TaskItemStatus.NotStarted
  }
  // Don't set a default Version - let it come from the actual task data
  
  // Include tag IDs if provided (enterprise solution)
  if (tagIds && tagIds.length > 0) {
    converted.TagIds = tagIds;
  }
  
  return converted;
}; 