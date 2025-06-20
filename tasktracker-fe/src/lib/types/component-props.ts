/*
 * Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All component prop interfaces following Family Auth Implementation Checklist
 * Centralized component interface definitions for consistent typing
 */

import { User } from './auth';
import { FamilyDTO, FamilyMemberDTO } from './family-invitation';
import { Task } from './task';
import { 
  LoginAttemptResult,
  AccountLockoutStatus,
  SessionDetailView,
  SecurityAlert,
  TrustedDeviceInfo
} from './enhanced-auth';
import { ReactNode } from 'react';
import { DashboardProps } from './widget-props';
import { UserFamilyWithPrimary } from './family-invitation';
import { BoardColumnDTO } from './board';

// Page Content Component Props
export interface FamiliesContentProps {
  user: User | null;
}

export interface GamificationContentProps {
  user: User;
}

export interface FamilySeedingPageContentProps {
  user: User | null;
}

export interface UserCreationPageContentProps {
  user: User | null;
}

// ===== FAMILY COMPONENT PROPS =====
export interface FamilyTaskDashboardProps {
  user: User;
  family?: FamilyDTO;
  familyMembers?: FamilyMemberDTO[];
}

export interface FamilyTaskManagementProps {
  user: User;
  family: FamilyDTO;
  familyMembers: FamilyMemberDTO[];
}

// ===== TASK COMPONENT PROPS =====
export interface TaskCreationModalProps {
  user: User;
  family?: FamilyDTO | null;
  families?: FamilyDTO[];
  onTaskCreated?: (task?: Task) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingTask?: Task | null;
  defaultContext?: 'individual' | 'family' | 'template';
  defaultFamilyId?: number;
  showTemplateOptions?: boolean;
}

export interface TaskEditFormProps {
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export interface TaskDetailsSheetContentProps {
  task: Task;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (task: Task) => void;
  onClose: () => void;
  familyMembers: FamilyMemberDTO[];
}

export interface SmartInvitationWizardProps {
  familyId: number;
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: (invitation: unknown) => void;
  showAdvancedOptions?: boolean;
  allowBulkInvitations?: boolean;
}

export interface FamilySeedingPanelProps {
  user: User;
}

// ===== AUTHENTICATION COMPONENT PROPS =====
export interface MFASetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (result: unknown) => void;
  preferredMethod?: 'email' | 'sms' | 'app' | 'hardware';
  skipBackupCodes?: boolean;
}

export interface MFAStatusCardContainerProps {
  user: User;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireMFA?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

// ===== LAYOUT COMPONENT PROPS =====
export interface NavbarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// ===== UI COMPONENT PROPS =====
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'green';
  gradient?: boolean;
  description?: string;
  trend?: {
    value: number;
    isIncreasing: boolean;
  };
  className?: string;
}

export interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export interface GamificationCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface DecorativeLinesProps {
  variant?: 'horizontal' | 'vertical' | 'diagonal';
  count?: number;
  className?: string;
}

// ===== THEME COMPONENT PROPS =====
export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeSelect?: (themeId: string) => void;
}

export interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    preview: string;
    isPremium: boolean;
    price?: number;
  };
  onSelect: (themeId: string) => void;
  isSelected?: boolean;
}

export interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    preview: string;
    description: string;
    price: number;
    isPremium: boolean;
    tags: string[];
  };
  onPurchase: (themeId: string) => void;
  isPurchased?: boolean;
}

// ===== MODAL COMPONENT PROPS =====
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'success' | 'info' | 'warning';
}

// ===== SKELETON COMPONENT PROPS =====
export interface SkeletonWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}

export interface WithSkeletonProps {
  loading: boolean;
  children: React.ReactNode;
}

export interface SkeletonContainerProps {
  className?: string;
  children: React.ReactNode;
}

export interface InvitationAcceptanceFlowSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
  showDescription?: boolean;
  className?: string;
}

export interface GameStatsGridSkeletonProps {
  itemCount?: number;
  showTrends?: boolean;
  showIcons?: boolean;
  columns?: number;
  className?: string;
}

export interface AchievementGridSkeletonProps {
  itemCount?: number;
  showBadges?: boolean;
  showProgress?: boolean;
  columns?: number;
  className?: string;
}

export interface MFASetupStepsSkeletonProps {
  stepCount?: number;
  showIcons?: boolean;
  showProgress?: boolean;
  className?: string;
}

// ===== FORM COMPONENT TYPE HELPERS =====
export type FormFieldContextValue<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
  TName extends keyof TFieldValues = keyof TFieldValues
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

export type ChartContextProps = {
  config: Record<string, unknown>;
};

export type SetupStep = 'instructions' | 'qr-code' | 'verification' | 'backup-codes' | 'complete';

// ===== PROGRESSIVE FORM PROPS =====
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: React.ReactNode;
  validation?: () => boolean;
}

export interface ProgressiveFormProps {
  steps: FormStep[];
  onComplete: (data: Record<string, unknown>) => void;
  className?: string;
}

export interface FamilyTaskManagementPageProps {
  user: User;
  familyId: number;
}

// === ENHANCED AUTHENTICATION COMPONENT PROPS ===

export interface EnhancedLoginFormProps {
  onLoginSuccess?: (result: LoginAttemptResult) => void;
  onMfaRequired?: (userId: number) => void;
  onAccountLocked?: (lockoutInfo: AccountLockoutStatus) => void;
  showDeviceRecognition?: boolean;
  rememberDevice?: boolean;
}

export interface EnhancedPasswordResetFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  showSecurityQuestions?: boolean;
  allowMfaBypass?: boolean;
}

export interface SecuritySettingsProps {
  userId: number;
  onSecurityUpdate?: (type: string, success: boolean) => void;
  showAdvancedOptions?: boolean;
  allowDeviceManagement?: boolean;
}

export interface DeviceManagementProps {
  userId: number;
  devices: TrustedDeviceInfo[];
  onDeviceRevoked: (deviceId: string) => void;
  onDeviceTrusted: (deviceId: string, trusted: boolean) => void;
  allowBulkOperations?: boolean;
}

export interface SessionManagementProps {
  userId: number;
  sessions: SessionDetailView[];
  onSessionTerminated: (sessionId: string) => void;
  showLocationInfo?: boolean;
  allowBulkTermination?: boolean;
}

export interface SecurityAuditLogProps {
  userId: number;
  logs: unknown[];
  showDetails?: boolean;
  allowExport?: boolean;
  maxEntries?: number;
}

export interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onAlertDismissed: (alertId: string) => void;
  onAlertAction: (alertId: string, action: string) => void;
  maxAlertsToShow?: number;
  autoRefresh?: boolean;
}

// === ENHANCED FAMILY COMPONENT PROPS ===

export interface FamilyInvitationManagerProps {
  familyId: number;
  onInvitationSent: (invitation: unknown) => void;
  onInvitationCancelled: (invitationId: number) => void;
  showPendingInvitations?: boolean;
  allowBulkOperations?: boolean;
}

export interface EnhancedFamilyManagementProps {
  familyId: number;
  isAdmin: boolean;
  onFamilyUpdated: (family: unknown) => void;
  onMemberRoleChanged: (memberId: number, newRole: string) => void;
  showAdvancedSettings?: boolean;
  allowMemberManagement?: boolean;
}

export interface FamilySecurityDashboardProps {
  familyId: number;
  isParent: boolean;
  onSecuritySettingChanged: (setting: string, value: unknown) => void;
  showChildProtectionFeatures?: boolean;
  allowParentalControls?: boolean;
}

export interface FamilyPrivacySettingsProps {
  familyId: number;
  currentSettings: unknown;
  onSettingsUpdated: (settings: unknown) => void;
  showAdvancedPrivacy?: boolean;
  allowDataExport?: boolean;
}

export interface RoleAssignmentWizardProps {
  familyId: number;
  memberId: number;
  currentRole: string;
  onRoleAssigned: (newRole: string) => void;
  showRolePermissions?: boolean;
  allowCustomPermissions?: boolean;
}

// === SHARED COMPONENT PROPS ===

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  preventClickOutside?: boolean;
}

export interface WizardProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canProceed: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export interface ErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetryButton?: boolean;
  errorType?: 'validation' | 'network' | 'permission' | 'unknown';
}

// === FORM COMPONENT PROPS ===

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface FormSelectProps extends FormFieldProps {
  options: Array<{ value: string; label: string; description?: string }>;
  multiple?: boolean;
  searchable?: boolean;
}

export interface FormCheckboxProps extends FormFieldProps {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface FormInputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  showPasswordToggle?: boolean;
}

export interface FormTextareaProps extends FormFieldProps {
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  resizable?: boolean;
}

// === DASHBOARD COMPONENT PROPS ===

export interface DashboardCardProps {
  title: string;
  description?: string;
  value?: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export interface StatisticsWidgetProps {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
  }>;
  chartData?: unknown[];
  chartType?: 'line' | 'bar' | 'pie' | 'donut';
}

export interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
    metadata?: Record<string, unknown>;
  }>;
  maxItems?: number;
  showTimestamp?: boolean;
  allowFiltering?: boolean;
}

// === NOTIFICATION COMPONENT PROPS ===

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{ label: string; onClick: () => void }>;
  onDismiss?: () => void;
}

export interface ToastNotificationProps extends NotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  animationType?: 'slide' | 'fade' | 'bounce';
}

// === TABLE COMPONENT PROPS ===

export interface DataTableProps<T = unknown> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: unknown, row: T) => React.ReactNode;
  }>;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy?: keyof T;
    sortOrder?: 'asc' | 'desc';
    onSort: (key: keyof T, order: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, unknown>;
    onFilterChange: (filters: Record<string, unknown>) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
    bulkActions?: Array<{ label: string; onClick: (selectedRows: string[]) => void }>;
  };
}

// === EXPORT ALL TYPES ===

export * from './family-invitation';

// ================================
// LANDING PAGE PROPS
// ================================

export interface StageLandingPageProps {
  stage: 'development' | 'alpha' | 'beta' | 'staging' | 'production';
}

// ================================
// FAMILY COMPONENT PROPS
// ================================

export interface PrimaryFamilySelectorProps {
  families: UserFamilyWithPrimary[];
  onSelectPrimary: (familyId: number) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  showRoleInfo?: boolean;
}

export interface PrimaryFamilyBadgeProps {
  familyName: string;
  className?: string;
  variant?: 'default' | 'compact';
}

// ================================
// DASHBOARD COMPONENT PROPS
// ================================

export interface SimpleDashboardProps extends DashboardProps {
  onTaskCreated?: () => void;
}

export interface TeenDashboardProps extends DashboardProps {
  onTaskCreated?: () => void;
}

export interface KidDashboardProps extends DashboardProps {
  onTaskCreated?: () => void;
}

export interface PermissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequest: (permission: string, reason: string) => void;
  permissionType: 'notification' | 'camera' | 'microphone' | 'location';
}

// ================================
// BOARD COMPONENT PROPS
// ================================

export interface QuestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestSelect: (questId: number) => void;
  availableQuests: Array<{
    id: number;
    title: string;
    description: string;
    difficulty: string;
    estimatedTime: string;
    rewards: number;
  }>;
}

export interface DuplicateTaskInfo {
  id: number;
  title: string;
  boardName: string;
  columnName: string;
}

export interface EnhancedTemplate {
  name: string;
  description: string;
  category: 'basic' | 'family' | 'education' | 'health' | 'events' | 'financial' | 'seasonal';
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime?: string;
  recommendedFor: string[];
  isPopular?: boolean;
}

export interface ColumnFormData extends BoardColumnDTO {
  tempId?: string;
}

export interface CustomColumn {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface EnhancedTaskCardProps {
  task: {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: number;
    assigneeId?: number;
    tags?: string[];
    isCompleted: boolean;
  };
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  className?: string;
}

export interface EnhancedBoardColumnProps {
  column: {
    id: number;
    name: string;
    color: string;
    order: number;
    boardId: number;
  };
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: number;
    assigneeId?: number;
    columnId: number;
  }>;
  onTaskMove?: (taskId: number, newColumnId: number) => void;
  onTaskCreate?: (columnId: number) => void;
  className?: string;
}

export interface SortableColumnProps extends EnhancedBoardColumnProps {
  isDragging?: boolean;
  dragOverlay?: boolean;
}

export interface EnhancedSortableColumnItemProps {
  column: {
    id: number;
    name: string;
    color: string;
    order: number;
  };
  onEdit: (column: ColumnFormData) => void;
  onDelete: (columnId: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  index: number;
  isEditing: boolean;
  editingColumn: ColumnFormData | null;
  setEditingColumn: (column: ColumnFormData | null) => void;
}

// ================================
// FORM DATA TYPES
// ================================

export type EditBoardFormData = {
  name: string;
  description?: string;
  isPublic: boolean;
  templateId?: number;
};

export type ColumnEditFormData = {
  id?: number;
  name: string;
  color: string;
  order: number;
};

export type CreateTaskFormData = {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: number;
  assigneeId?: number;
  tags?: string[];
  columnId: number;
  boardId: number;
};

export type CreateCustomBoardFormData = {
  name: string;
  description?: string;
  isPublic: boolean;
  columns: CustomColumn[];
}; 