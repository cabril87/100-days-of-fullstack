/**
 * Automation and workflow related types
 */

import { Task } from './task';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isEnabled: boolean;
  createdAt: string;
  boardId?: number;
}

export interface AutomationTrigger {
  type: 'status_change' | 'due_date_approaching' | 'task_created' | 'task_overdue' | 'task_assigned' | 'column_limit_reached';
  conditions: Record<string, any>;
}

export interface AutomationAction {
  type: 'move_task' | 'send_notification' | 'assign_task' | 'set_priority' | 'add_label' | 'update_due_date' | 'create_subtask';
  parameters: Record<string, any>;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'collaboration' | 'notification' | 'workflow' | 'custom';
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isPopular?: boolean;
  usageCount?: number;
}

export interface AutomationRuleExecution {
  id: string;
  ruleId: string;
  taskId: number;
  executedAt: string;
  success: boolean;
  error?: string;
  actionResults: AutomationActionResult[];
}

export interface AutomationActionResult {
  actionType: AutomationAction['type'];
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  topTriggeredRules: Array<{
    ruleId: string;
    ruleName: string;
    executionCount: number;
  }>;
}

// Automation Rule Creation/Update requests
export interface CreateAutomationRuleRequest {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isEnabled?: boolean;
  boardId?: number;
}

export interface UpdateAutomationRuleRequest extends Partial<CreateAutomationRuleRequest> {
  // id is passed separately in the function call
} 