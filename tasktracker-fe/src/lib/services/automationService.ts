import { apiClient } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';

// Automation rule interfaces
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

export interface CreateAutomationRule {
  templateId: number;
  name: string;
  description?: string;
  triggerType: string;
  conditions: string;
  actions: string;
  priority?: number;
}

export interface UpdateAutomationRule {
  name?: string;
  description?: string;
  conditions?: string;
  actions?: string;
  isActive?: boolean;
  priority?: number;
}

export interface AutomationExecutionResult {
  success: boolean;
  message: string;
  executedAt: string;
  executionTimeMs: number;
  actionsExecuted: string[];
  results: Record<string, any>;
  errors: string[];
}

export interface WorkflowExecutionResult {
  success: boolean;
  message: string;
  executedAt: string;
  totalExecutionTimeMs: number;
  totalSteps: number;
  stepsCompleted: number;
  stepsExecuted: WorkflowStepExecution[];
  errors: string[];
}

export interface WorkflowStepExecution {
  stepId: number;
  stepName: string;
  success: boolean;
  executedAt: string;
  executionTimeMs: number;
  results: Record<string, any>;
  errorMessage?: string;
}

export interface AutomationSuggestion {
  suggestionType: string;
  title: string;
  description: string;
  confidence: number;
  configuration: Record<string, any>;
  benefits: string[];
  estimatedTimeSavingsMinutes: number;
}

export interface AutomationInsight {
  insightType: string;
  title: string;
  description: string;
  data: Record<string, any>;
  generatedAt: string;
  recommendation: string;
}

export interface AutomationHealth {
  status: string;
  timestamp: string;
  activeRulesCount: number;
  triggersProcessedToday: number;
  systemLoad: string;
}

export interface BulkEvaluationRequest {
  triggerTypes: string[];
}

export interface BulkEvaluationResult {
  processedRules: number;
  triggeredRules: number;
  errors: string[];
  startTime: string;
  endTime?: string;
  success: boolean;
}

class AutomationService {
  private baseUrl = '/api/v1/templateautomation';

  // Automation Rule Management
  async getAutomationRules(templateId: number): Promise<ApiResponse<AutomationRule[]>> {
    try {
      console.log(`[automationService] Getting automation rules for template ${templateId}`);
      const response = await apiClient.get<AutomationRule[]>(`${this.baseUrl}/templates/${templateId}/rules`);
      return response;
    } catch (error) {
      console.error('[automationService] Error getting automation rules:', error);
      throw error;
    }
  }

  async getAutomationRule(ruleId: number): Promise<ApiResponse<AutomationRule>> {
    try {
      console.log(`[automationService] Getting automation rule ${ruleId}`);
      const response = await apiClient.get<AutomationRule>(`${this.baseUrl}/rules/${ruleId}`);
      return response;
    } catch (error) {
      console.error('[automationService] Error getting automation rule:', error);
      throw error;
    }
  }

  async createAutomationRule(rule: CreateAutomationRule): Promise<ApiResponse<AutomationRule>> {
    try {
      console.log('[automationService] Creating automation rule:', rule);
      const response = await apiClient.post<AutomationRule>(`${this.baseUrl}/templates/${rule.templateId}/rules`, rule);
      return response;
    } catch (error) {
      console.error('[automationService] Error creating automation rule:', error);
      throw error;
    }
  }

  async updateAutomationRule(ruleId: number, rule: UpdateAutomationRule): Promise<ApiResponse<AutomationRule>> {
    try {
      console.log(`[automationService] Updating automation rule ${ruleId}:`, rule);
      const response = await apiClient.put<AutomationRule>(`${this.baseUrl}/rules/${ruleId}`, rule);
      return response;
    } catch (error) {
      console.error('[automationService] Error updating automation rule:', error);
      throw error;
    }
  }

  async deleteAutomationRule(ruleId: number): Promise<ApiResponse<void>> {
    try {
      console.log(`[automationService] Deleting automation rule ${ruleId}`);
      const response = await apiClient.delete<void>(`${this.baseUrl}/rules/${ruleId}`);
      return response;
    } catch (error) {
      console.error('[automationService] Error deleting automation rule:', error);
      throw error;
    }
  }

  // Trigger Evaluation and Execution
  async evaluateAutomation(triggerType: string): Promise<ApiResponse<AutomationRule[]>> {
    try {
      console.log(`[automationService] Evaluating automation for trigger type: ${triggerType}`);
      const response = await apiClient.post<AutomationRule[]>(`${this.baseUrl}/evaluate/${triggerType}`, {});
      return response;
    } catch (error) {
      console.error('[automationService] Error evaluating automation:', error);
      throw error;
    }
  }

  async executeAutomation(ruleId: number, context: Record<string, any> = {}): Promise<ApiResponse<AutomationExecutionResult>> {
    try {
      console.log(`[automationService] Executing automation rule ${ruleId} with context:`, context);
      const response = await apiClient.post<AutomationExecutionResult>(`${this.baseUrl}/rules/${ruleId}/execute`, { context });
      return response;
    } catch (error) {
      console.error('[automationService] Error executing automation:', error);
      throw error;
    }
  }

  async scheduleAutomatedTasks(): Promise<ApiResponse<any[]>> {
    try {
      console.log('[automationService] Scheduling automated tasks');
      const response = await apiClient.post<any[]>(`${this.baseUrl}/schedule`, {});
      return response;
    } catch (error) {
      console.error('[automationService] Error scheduling automated tasks:', error);
      throw error;
    }
  }

  async processWorkflow(templateId: number): Promise<ApiResponse<WorkflowExecutionResult>> {
    try {
      console.log(`[automationService] Processing workflow for template ${templateId}`);
      const response = await apiClient.post<WorkflowExecutionResult>(`${this.baseUrl}/templates/${templateId}/workflow/process`, {});
      return response;
    } catch (error) {
      console.error('[automationService] Error processing workflow:', error);
      throw error;
    }
  }

  // Pattern Recognition and Smart Automation
  async analyzeUserPatterns(): Promise<ApiResponse<AutomationSuggestion[]>> {
    try {
      console.log('[automationService] Analyzing user patterns');
      const response = await apiClient.get<AutomationSuggestion[]>(`${this.baseUrl}/patterns/analyze`);
      return response;
    } catch (error) {
      console.error('[automationService] Error analyzing user patterns:', error);
      throw error;
    }
  }

  async createSmartAutomationRule(pattern: any): Promise<ApiResponse<AutomationRule>> {
    try {
      console.log('[automationService] Creating smart automation rule from pattern:', pattern);
      const response = await apiClient.post<AutomationRule>(`${this.baseUrl}/patterns/create-rule`, pattern);
      return response;
    } catch (error) {
      console.error('[automationService] Error creating smart automation rule:', error);
      throw error;
    }
  }

  async getAutomationInsights(): Promise<ApiResponse<AutomationInsight[]>> {
    try {
      console.log('[automationService] Getting automation insights');
      const response = await apiClient.get<AutomationInsight[]>(`${this.baseUrl}/insights`);
      return response;
    } catch (error) {
      console.error('[automationService] Error getting automation insights:', error);
      throw error;
    }
  }

  // Workflow Management
  async getWorkflowSteps(templateId: number): Promise<ApiResponse<any[]>> {
    try {
      console.log(`[automationService] Getting workflow steps for template ${templateId}`);
      const response = await apiClient.get<any[]>(`${this.baseUrl}/templates/${templateId}/workflow/steps`);
      return response;
    } catch (error) {
      console.error('[automationService] Error getting workflow steps:', error);
      throw error;
    }
  }

  async createWorkflowStep(templateId: number, step: any): Promise<ApiResponse<any>> {
    try {
      console.log(`[automationService] Creating workflow step for template ${templateId}:`, step);
      const response = await apiClient.post<any>(`${this.baseUrl}/templates/${templateId}/workflow/steps`, step);
      return response;
    } catch (error) {
      console.error('[automationService] Error creating workflow step:', error);
      throw error;
    }
  }

  async validateWorkflow(templateId: number): Promise<ApiResponse<any>> {
    try {
      console.log(`[automationService] Validating workflow for template ${templateId}`);
      const response = await apiClient.post<any>(`${this.baseUrl}/templates/${templateId}/workflow/validate`, {});
      return response;
    } catch (error) {
      console.error('[automationService] Error validating workflow:', error);
      throw error;
    }
  }

  // System Health and Monitoring
  async getAutomationHealth(): Promise<ApiResponse<AutomationHealth>> {
    try {
      console.log('[automationService] Getting automation health status');
      const response = await apiClient.get<AutomationHealth>(`${this.baseUrl}/health`);
      return response;
    } catch (error) {
      console.error('[automationService] Error getting automation health:', error);
      throw error;
    }
  }

  async bulkEvaluateAutomation(request: BulkEvaluationRequest): Promise<ApiResponse<BulkEvaluationResult>> {
    try {
      console.log('[automationService] Performing bulk automation evaluation:', request);
      const response = await apiClient.post<BulkEvaluationResult>(`${this.baseUrl}/bulk-evaluate`, request);
      return response;
    } catch (error) {
      console.error('[automationService] Error performing bulk evaluation:', error);
      throw error;
    }
  }

  // Utility methods
  getTriggerTypes(): string[] {
    return [
      'TimeSchedule',
      'TaskCompletion',
      'PatternDetection',
      'UserBehavior',
      'DateSchedule',
      'TaskCreation',
      'SystemEvent'
    ];
  }

  getActionTypes(): string[] {
    return [
      'CreateTask',
      'SendNotification',
      'UpdateStatus',
      'AssignUser',
      'SetPriority',
      'AddTag',
      'ScheduleReminder'
    ];
  }

  // Mock data for development
  async getMockAutomationRules(): Promise<AutomationRule[]> {
    return [
      {
        id: 1,
        templateId: 1,
        name: 'Daily Standup Reminder',
        description: 'Automatically create daily standup tasks',
        triggerType: 'TimeSchedule',
        conditions: '{"time": "09:00", "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}',
        actions: '{"createTask": {"title": "Daily Standup", "priority": "high"}}',
        isActive: true,
        priority: 1,
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        templateId: 2,
        name: 'Weekly Review Automation',
        description: 'Create weekly review tasks on Fridays',
        triggerType: 'TimeSchedule',
        conditions: '{"time": "17:00", "day": "Friday"}',
        actions: '{"createTask": {"title": "Weekly Review", "priority": "medium"}}',
        isActive: true,
        priority: 2,
        createdAt: '2025-01-01T00:00:00Z'
      }
    ];
  }
}

export const automationService = new AutomationService();
export default automationService; 