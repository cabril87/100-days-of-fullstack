// Template-related type definitions

export interface TaskTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isAutomated: boolean;
  templateData?: string;
  workflowSteps?: string;
  conditionalLogic?: string;
  workflowVersion: number;
  rating: number;
  downloadCount: number;
  usageCount: number;
  successRate: number;
  averageCompletionTimeMinutes: number;
  lastUsedDate?: string;
  publishedDate?: string;
  createdAt: string;
  updatedAt?: string;
  userId?: number;
  createdByUserId?: number;
}

export interface CreateTaskTemplateDTO {
  name: string;
  description?: string;
  category: string;
  tags: string[];
  isPublic?: boolean;
  isAutomated?: boolean;
  templateData?: string;
  workflowSteps?: string;
  conditionalLogic?: string;
}

export interface UpdateTaskTemplateDTO {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  isAutomated?: boolean;
  templateData?: string;
  workflowSteps?: string;
  conditionalLogic?: string;
}

export interface TemplateCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutomationRule {
  id: number;
  templateId: number;
  name: string;
  description?: string;
  triggerType: string;
  conditions: string;
  actions: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAutomationRuleDTO {
  templateId: number;
  name: string;
  description?: string;
  triggerType: string;
  conditions: string;
  actions: string;
  priority?: number;
}

export interface UpdateAutomationRuleDTO {
  name?: string;
  description?: string;
  conditions?: string;
  actions?: string;
  isActive?: boolean;
  priority?: number;
}

export interface TemplateAnalytics {
  id: number;
  templateId: number;
  userId: number;
  usedDate: string;
  completionTimeMinutes: number;
  success: boolean;
  notes?: string;
  tasksCreated: number;
  tasksCompleted: number;
  efficiencyScore: number;
  feedback?: string;
  completedAt?: string;
  usageCount: number;
  successRate: number;
  averageCompletionTime: number;
  rating: number;
  ratingDistribution: Record<number, number>;
  topReviews: TemplateReview[];
}

export interface TemplateUsageAnalyticsDTO {
  id: number;
  templateId: number;
  userId: number;
  usedDate: string;
  completionTimeMinutes: number;
  success: boolean;
  notes?: string;
  tasksCreated: number;
  tasksCompleted: number;
  efficiencyScore: number;
  feedback?: string;
  completedAt?: string;
}

export interface TemplateAnalyticsSummaryDTO {
  templateId: number;
  templateName: string;
  totalUsages: number;
  successRate: number;
  averageCompletionTimeMinutes: number;
  averageEfficiencyScore: number;
  lastUsedDate?: string;
  uniqueUsers: number;
  rating: number;
  downloadCount: number;
}

export interface WorkflowStep {
  id: number;
  templateId: number;
  stepOrder: number;
  stepType: string;
  name: string;
  description?: string;
  configuration: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkflowStepDTO {
  id: number;
  templateId: number;
  stepOrder: number;
  stepType: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWorkflowStepDTO {
  templateId: number;
  stepOrder: number;
  stepType: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface TemplateMarketplace {
  id: number;
  templateId: number;
  publishedBy: number;
  publishedDate: string;
  featured: boolean;
  downloadCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  category: string;
  isVerified: boolean;
}

export interface TemplateMarketplaceDTO {
  id: number;
  templateId: number;
  publishedBy: number;
  publishedDate: string;
  featured: boolean;
  downloadCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  category: string;
  isVerified: boolean;
  template?: TaskTemplate;
}

export interface MarketplaceTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  categoryId?: number;
  tags: string[];
  rating: number;
  downloadCount: number;
  usageCount: number;
  successRate: number;
  averageCompletionTime: number;
  featured: boolean;
  isVerified: boolean;
  publishedDate: string;
  publishedBy: number;
  reviewCount: number;
  templateData?: string;
  workflowSteps?: string;
  isPublic: boolean;
  isAutomated: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Automation-related types
export interface AutomationExecutionResultDTO {
  success: boolean;
  message: string;
  executedAt: string;
  executionTimeMs: number;
  actionsExecuted: string[];
  results: Record<string, any>;
  errors: string[];
}

export interface WorkflowExecutionResultDTO {
  success: boolean;
  message: string;
  executedAt: string;
  totalExecutionTimeMs: number;
  totalSteps: number;
  stepsCompleted: number;
  stepsExecuted: WorkflowStepExecutionDTO[];
  errors: string[];
}

export interface WorkflowStepExecutionDTO {
  stepId: number;
  stepName: string;
  success: boolean;
  executedAt: string;
  executionTimeMs: number;
  results: Record<string, any>;
  errorMessage?: string;
}

export interface AutomationSuggestionDTO {
  suggestionType: string;
  title: string;
  description: string;
  confidence: number;
  configuration: Record<string, any>;
  benefits: string[];
  estimatedTimeSavingsMinutes: number;
}

export interface AutomationInsightDTO {
  insightType: string;
  title: string;
  description: string;
  data: Record<string, any>;
  generatedAt: string;
  recommendation: string;
}

export interface PatternAnalysisDTO {
  patternType: string;
  description: string;
  confidence: number;
  patternData: Record<string, any>;
  suggestedActions: string[];
}

export interface WorkflowValidationResultDTO {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  totalSteps: number;
  validSteps: number;
}

// Enums
export enum WorkflowStepType {
  CreateTask = 'CreateTask',
  SendNotification = 'SendNotification',
  UpdateStatus = 'UpdateStatus',
  AssignUser = 'AssignUser',
  SetPriority = 'SetPriority',
  AddTag = 'AddTag',
  ScheduleReminder = 'ScheduleReminder',
  WaitForCondition = 'WaitForCondition',
  ExecuteScript = 'ExecuteScript',
  IntegrateExternal = 'IntegrateExternal'
}

export enum AutomationTriggerType {
  TimeSchedule = 'TimeSchedule',
  TaskCompletion = 'TaskCompletion',
  PatternDetection = 'PatternDetection',
  UserBehavior = 'UserBehavior',
  DateSchedule = 'DateSchedule',
  TaskCreation = 'TaskCreation',
  SystemEvent = 'SystemEvent',
  ManualTrigger = 'ManualTrigger'
}

export enum TemplateStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived',
  Featured = 'Featured',
  Verified = 'Verified'
}

// Template Builder types
export interface TemplateBuilderState {
  template: Partial<TaskTemplate>;
  workflowSteps: WorkflowStepDTO[];
  automationRules: AutomationRule[];
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateBuilderAction {
  type: 'UPDATE_TEMPLATE' | 'ADD_WORKFLOW_STEP' | 'UPDATE_WORKFLOW_STEP' | 'REMOVE_WORKFLOW_STEP' | 
        'ADD_AUTOMATION_RULE' | 'UPDATE_AUTOMATION_RULE' | 'REMOVE_AUTOMATION_RULE' | 
        'VALIDATE' | 'RESET';
  payload?: any;
}

// Drag and drop types for visual builder
export interface DraggedItem {
  id: string;
  type: 'workflow-step' | 'automation-rule' | 'condition' | 'action';
  data: any;
}

export interface DropZone {
  id: string;
  type: 'workflow' | 'automation' | 'condition' | 'action';
  accepts: string[];
}

// Template marketplace filters
export interface TemplateFilters {
  category?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  verified?: boolean;
  sortBy?: 'popularity' | 'rating' | 'newest' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Template sharing and collaboration
export interface TemplateShare {
  id: number;
  templateId: number;
  sharedBy: number;
  sharedWith?: number;
  shareType: 'public' | 'private' | 'organization';
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
}

export interface TemplatePermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canPublish: boolean;
  canUseAutomation: boolean;
}

// Template Rating System Types
export interface TemplateRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: number;
  templateName: string;
  currentRating?: number;
  totalRatings?: number;
  analytics?: TemplateAnalytics;
}

export interface TemplateReview {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  helpful: boolean;
  helpfulCount: number;
}

export interface TemplateRatingSubmission {
  rating: number;
  review?: string;
  wouldRecommend: boolean;
  completionTime?: number;
  helpfulTips?: string;
}

export default {}; 