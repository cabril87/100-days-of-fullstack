'use client';

/**
 * Automation Rules Panel Component
 * Allows users to create and manage automation rules for their boards
 */

import React, { useState, useCallback } from 'react';

// Types
import { 
  AutomationRule, 
  CreateAutomationRuleRequest,
  UpdateAutomationRuleRequest 
} from '@/lib/types/automation';

// Components
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

// Icons
import {
  Plus,
  Zap,
  Clock,
  ArrowRight,
  AlertTriangle,
  Settings,
  Trash2
} from 'lucide-react';

interface AutomationRulesPanelProps {
  rules: AutomationRule[];
  onCreateRule: (rule: CreateAutomationRuleRequest) => Promise<void>;
  onUpdateRule: (ruleId: string, rule: UpdateAutomationRuleRequest) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function AutomationRulesPanel({
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  isOpen,
  onClose,
  className
}: AutomationRulesPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Common automation templates
  const automationTemplates = [
    {
      id: 'overdue-notification',
      name: 'Overdue Task Notifications',
      description: 'Send notifications when tasks become overdue',
      trigger: { type: 'task_overdue' as const, conditions: {} },
      actions: [{ type: 'send_notification' as const, parameters: { message: 'Task is overdue' } }]
    },
    {
      id: 'auto-complete-flow',
      name: 'Auto-Complete Workflow',
      description: 'Automatically move completed tasks to Done column',
      trigger: { type: 'status_change' as const, conditions: { to: 'completed' } },
      actions: [{ type: 'move_task' as const, parameters: { toColumn: 'done' } }]
    },
    {
      id: 'due-date-reminder',
      name: 'Due Date Reminders',
      description: 'Send reminders 24 hours before due date',
      trigger: { type: 'due_date_approaching' as const, conditions: { hours: 24 } },
      actions: [{ type: 'send_notification' as const, parameters: { message: 'Task due tomorrow' } }]
    }
  ];

  // Handle toggle rule enabled/disabled
  const handleToggleRule = useCallback(async (ruleId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await onUpdateRule(ruleId, { isEnabled: enabled });
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onUpdateRule]);

  // Handle create rule from template
  const handleCreateFromTemplate = useCallback(async (template: typeof automationTemplates[0]) => {
    setIsLoading(true);
    try {
      await onCreateRule({
        name: template.name,
        description: template.description,
        trigger: template.trigger,
        actions: template.actions,
        isEnabled: true
      });
    } catch (error) {
      console.error('Failed to create rule:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onCreateRule]);

  // Handle delete rule
  const handleDeleteRule = useCallback(async (ruleId: string) => {
    setIsLoading(true);
    try {
      await onDeleteRule(ruleId);
    } catch (error) {
      console.error('Failed to delete rule:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onDeleteRule]);

  // Get trigger icon
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'status_change':
        return <ArrowRight className="h-4 w-4" />;
      case 'due_date_approaching':
        return <Clock className="h-4 w-4" />;
      case 'task_overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'task_created':
        return <Plus className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  // Get action description
  const getActionDescription = (action: AutomationRule['actions'][0]) => {
    switch (action.type) {
      case 'move_task':
        return `Move to ${action.parameters.toColumn || 'column'}`;
      case 'send_notification':
        return 'Send notification';
      case 'assign_task':
        return `Assign to ${action.parameters.user || 'user'}`;
      case 'set_priority':
        return `Set priority to ${action.parameters.priority || 'priority'}`;
      case 'add_label':
        return `Add label: ${action.parameters.label || 'label'}`;
      default:
        return 'Unknown action';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden ${className || ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </DialogTitle>
          <DialogDescription>
            Create rules to automate common tasks and workflows
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Active Rules */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Active Rules ({rules.filter(r => r.isEnabled).length})</h3>
            {rules.filter(rule => rule.isEnabled).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No active automation rules. Create your first rule below.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rules.filter(rule => rule.isEnabled).map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTriggerIcon(rule.trigger.type)}
                            <h4 className="font-medium">{rule.name}</h4>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <strong>Actions:</strong>
                            {rule.actions.map((action, idx) => (
                              <span key={idx} className="text-muted-foreground">
                                {getActionDescription(action)}
                                {idx < rule.actions.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch 
                          checked={rule.isEnabled} 
                          onCheckedChange={(enabled) => handleToggleRule(rule.id, enabled)}
                          disabled={isLoading}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Inactive Rules */}
          {rules.filter(rule => !rule.isEnabled).length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4">Inactive Rules ({rules.filter(r => !r.isEnabled).length})</h3>
              <div className="space-y-3">
                {rules.filter(rule => !rule.isEnabled).map((rule) => (
                  <Card key={rule.id} className="p-4 opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTriggerIcon(rule.trigger.type)}
                            <h4 className="font-medium">{rule.name}</h4>
                          </div>
                          <Badge variant="secondary">
                            Inactive
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch 
                          checked={rule.isEnabled} 
                          onCheckedChange={(enabled) => handleToggleRule(rule.id, enabled)}
                          disabled={isLoading}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Quick Templates */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automationTemplates.map((template) => (
                <Card key={template.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleCreateFromTemplate(template)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 