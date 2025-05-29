'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trash2,
  Calendar,
  Edit3,
  Archive,
  Users,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  RefreshCw,
  Settings,
  Filter,
  CheckCircle,
  XCircle,
  Move
} from 'lucide-react';
import { format, parseISO, addDays, addHours } from 'date-fns';
import { apiService } from '@/lib/services/apiService';

// Type definitions for calendar batch operations
interface FamilyCalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  color?: string;
  eventType: string;
  attendees: EventAttendee[];
  familyId: number;
}

interface EventAttendee {
  id: number;
  name: string;
  email?: string;
  role: string;
  rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
}

interface BatchOperationResult {
  operationId: string;
  operationType: string;
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  results: BatchItemResult[];
  detectedConflicts: SchedulingConflict[];
  executedAt: string;
  executionTime: string;
}

interface SchedulingConflict {
  id: number;
  eventId: number;
  conflictType: string;
  severity: 'Minor' | 'Major' | 'Critical';
  affectedMembers: number[];
  description: string;
}

interface BatchItemResult {
  itemId: string;
  success: boolean;
  errorMessage?: string;
  createdEventId?: number;
  updatedEvent?: FamilyCalendarEvent;
}

interface BatchOperation {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  action: (eventIds: number[], params?: Record<string, unknown>) => Promise<void>;
  requiresParams?: boolean;
  destructive?: boolean;
}

interface CalendarBatchOperationsProps {
  familyId: number;
  selectedEvents?: number[];
  availableEvents?: FamilyCalendarEvent[];
  onEventSelectionChange?: (eventIds: number[]) => void;
  onOperationComplete?: () => void;
  compact?: boolean;
}

export default function CalendarBatchOperations({
  familyId,
  selectedEvents = [],
  availableEvents = [],
  onEventSelectionChange,
  onOperationComplete,
  compact = false
}: CalendarBatchOperationsProps) {
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>(selectedEvents);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [operationParams, setOperationParams] = useState<Record<string, any>>({});
  const [operationResults, setOperationResults] = useState<BatchOperationResult | null>(null);

  // Update selected events when prop changes
  useEffect(() => {
    setSelectedEventIds(selectedEvents);
  }, [selectedEvents]);

  // Batch operations definitions
  const batchOperations: BatchOperation[] = [
    {
      id: 'delete',
      name: 'Delete Events',
      icon: <Trash2 className="h-4 w-4" />,
      description: 'Permanently delete selected calendar events',
      destructive: true,
      action: async (eventIds) => {
        await apiService.delete(`/v1/family/${familyId}/smart-scheduling/batch/delete-events?eventIds=${eventIds.join(',')}`);
      }
    },
    {
      id: 'updateType',
      name: 'Update Event Type',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Change event type for selected events',
      requiresParams: true,
      action: async (eventIds, params) => {
        if (!params) throw new Error('Parameters required for event type update');
        const updates = eventIds.map(id => ({
          eventId: id,
          eventType: params.eventType as string
        }));
        await apiService.put(`/v1/family/${familyId}/smart-scheduling/batch/update-events`, updates);
      }
    },
    {
      id: 'updateLocation',
      name: 'Update Location',
      icon: <Edit3 className="h-4 w-4" />,
      description: 'Change location for selected events',
      requiresParams: true,
      action: async (eventIds, params) => {
        if (!params) throw new Error('Parameters required for location update');
        const updates = eventIds.map(id => ({
          eventId: id,
          location: params.location as string
        }));
        await apiService.put(`/v1/family/${familyId}/smart-scheduling/batch/update-events`, updates);
      }
    },
    {
      id: 'updateColor',
      name: 'Update Color',
      icon: <Settings className="h-4 w-4" />,
      description: 'Change color for selected events',
      requiresParams: true,
      action: async (eventIds, params) => {
        if (!params) throw new Error('Parameters required for color update');
        const updates = eventIds.map(id => ({
          eventId: id,
          color: params.color as string
        }));
        await apiService.put(`/v1/family/${familyId}/smart-scheduling/batch/update-events`, updates);
      }
    },
    {
      id: 'reschedule',
      name: 'Reschedule Events',
      icon: <Move className="h-4 w-4" />,
      description: 'Move selected events to different times',
      requiresParams: true,
      action: async (eventIds, params) => {
        if (!params) throw new Error('Parameters required for rescheduling');
        const rescheduleRequest = {
          eventIds,
          timeOffset: params.timeOffset as string,
          newStartDate: params.newStartDate as string,
          newEndDate: params.newEndDate as string,
          preserveRelativeTiming: (params.preserveRelativeTiming as boolean) || true,
          allowConflicts: (params.allowConflicts as boolean) || false,
          findOptimalTimes: (params.findOptimalTimes as boolean) || false
        };
        await apiService.post(`/v1/family/${familyId}/smart-scheduling/batch/reschedule-events`, rescheduleRequest);
      }
    },
    {
      id: 'duplicate',
      name: 'Duplicate Events',
      icon: <Copy className="h-4 w-4" />,
      description: 'Create copies of selected events',
      requiresParams: true,
      action: async (eventIds, params) => {
        if (!params) throw new Error('Parameters required for duplication');
        const eventsToClone = availableEvents.filter(e => eventIds.includes(e.id));
        const newEvents = eventsToClone.map(event => ({
          title: `${event.title} (Copy)`,
          description: event.description,
          startTime: (params.newStartTime as string) || addDays(parseISO(event.startTime), 1).toISOString(),
          endTime: (params.newEndTime as string) || addDays(parseISO(event.endTime), 1).toISOString(),
          isAllDay: event.isAllDay,
          location: event.location,
          color: event.color,
          eventType: event.eventType,
          attendeeIds: event.attendees.map(a => a.id)
        }));
        await apiService.post(`/v1/family/${familyId}/smart-scheduling/batch/create-events`, newEvents);
      }
    },
    {
      id: 'export',
      name: 'Export Events',
      icon: <Download className="h-4 w-4" />,
      description: 'Export selected events to JSON',
      action: async (eventIds) => {
        const selectedEventsData = availableEvents.filter(e => eventIds.includes(e.id));
        const dataStr = JSON.stringify(selectedEventsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `calendar-events-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    }
  ];

  // Handle event selection
  const handleEventSelection = (eventId: number, checked: boolean) => {
    const newSelection = checked
      ? [...selectedEventIds, eventId]
      : selectedEventIds.filter(id => id !== eventId);
    
    setSelectedEventIds(newSelection);
    onEventSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? availableEvents.map(e => e.id) : [];
    setSelectedEventIds(newSelection);
    onEventSelectionChange?.(newSelection);
  };

  const executeBatchOperation = async (operation: BatchOperation) => {
    if (selectedEventIds.length === 0) {
      setError('Please select at least one event');
      return;
    }

    if (operation.requiresParams && Object.keys(operationParams[operation.id] || {}).length === 0) {
      setError('Please fill in the required parameters');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const params = operation.requiresParams ? operationParams[operation.id] : undefined;
      await operation.action(selectedEventIds, params);
      
      setProgress(100);
      setSuccess(`Successfully ${operation.name.toLowerCase()} ${selectedEventIds.length} event(s)`);
      
      // Clear selection and refresh
      setSelectedEventIds([]);
      onOperationComplete?.();
      
    } catch (error: unknown) {
      console.error(`Error executing ${operation.name}:`, error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : `Failed to ${operation.name.toLowerCase()}`;
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateOperationParam = (operationId: string, key: string, value: unknown) => {
    setOperationParams(prev => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        [key]: value
      }
    }));
  };

  const renderOperationParams = (operation: BatchOperation) => {
    if (!operation.requiresParams) return null;

    switch (operation.id) {
      case 'updateType':
        return (
          <Select
            value={operationParams[operation.id]?.eventType || ''}
            onValueChange={(value) => updateOperationParam(operation.id, 'eventType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="family">Family</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'updateLocation':
        return (
          <Input
            placeholder="Enter new location"
            value={operationParams[operation.id]?.location || ''}
            onChange={(e) => updateOperationParam(operation.id, 'location', e.target.value)}
          />
        );

      case 'updateColor':
        return (
          <Select
            value={operationParams[operation.id]?.color || ''}
            onValueChange={(value) => updateOperationParam(operation.id, 'color', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="#ef4444">Red</SelectItem>
              <SelectItem value="#f97316">Orange</SelectItem>
              <SelectItem value="#eab308">Yellow</SelectItem>
              <SelectItem value="#22c55e">Green</SelectItem>
              <SelectItem value="#3b82f6">Blue</SelectItem>
              <SelectItem value="#8b5cf6">Purple</SelectItem>
              <SelectItem value="#ec4899">Pink</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'reschedule':
        return (
          <div className="space-y-2">
            <div>
              <Label>Reschedule Type</Label>
              <Select
                value={operationParams[operation.id]?.rescheduleType || 'offset'}
                onValueChange={(value) => updateOperationParam(operation.id, 'rescheduleType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offset">Time Offset</SelectItem>
                  <SelectItem value="specific">Specific Date/Time</SelectItem>
                  <SelectItem value="optimal">Find Optimal Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operationParams[operation.id]?.rescheduleType === 'offset' && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Days"
                  value={operationParams[operation.id]?.offsetDays || ''}
                  onChange={(e) => updateOperationParam(operation.id, 'offsetDays', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Hours"
                  value={operationParams[operation.id]?.offsetHours || ''}
                  onChange={(e) => updateOperationParam(operation.id, 'offsetHours', e.target.value)}
                />
              </div>
            )}

            {operationParams[operation.id]?.rescheduleType === 'specific' && (
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  value={operationParams[operation.id]?.newStartDate || ''}
                  onChange={(e) => updateOperationParam(operation.id, 'newStartDate', e.target.value)}
                />
                <Input
                  type="datetime-local"
                  value={operationParams[operation.id]?.newEndDate || ''}
                  onChange={(e) => updateOperationParam(operation.id, 'newEndDate', e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowConflicts"
                checked={operationParams[operation.id]?.allowConflicts || false}
                onCheckedChange={(checked) => updateOperationParam(operation.id, 'allowConflicts', checked)}
              />
              <Label htmlFor="allowConflicts" className="text-sm">Allow conflicts</Label>
            </div>
          </div>
        );

      case 'duplicate':
        return (
          <div className="space-y-2">
            <Input
              type="datetime-local"
              placeholder="New start time"
              value={operationParams[operation.id]?.newStartTime || ''}
              onChange={(e) => updateOperationParam(operation.id, 'newStartTime', e.target.value)}
            />
            <Input
              type="datetime-local"
              placeholder="New end time"
              value={operationParams[operation.id]?.newEndTime || ''}
              onChange={(e) => updateOperationParam(operation.id, 'newEndTime', e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Calendar Batch Operations
          </CardTitle>
          <CardDescription>
            Perform bulk operations on selected calendar events
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Event Selection */}
      {!compact && availableEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Events</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedEventIds.length === availableEvents.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Select All ({availableEvents.length})</Label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableEvents.map(event => (
                <div key={event.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                  <Checkbox
                    checked={selectedEventIds.includes(event.id)}
                    onCheckedChange={(checked) => handleEventSelection(event.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{event.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(event.startTime), 'MMM dd, h:mm a')}
                      {event.location && (
                        <>
                          <span>•</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {event.attendees.length}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Events Summary */}
      {selectedEventIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedEventIds.length} event{selectedEventIds.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEventIds([]);
                  onEventSelectionChange?.([]);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Operations</CardTitle>
          <CardDescription>
            Choose an operation to perform on selected events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchOperations.map(operation => (
              <div key={operation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {operation.icon}
                  <span className="font-medium">{operation.name}</span>
                  {operation.destructive && (
                    <Badge variant="destructive" className="text-xs">Destructive</Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">{operation.description}</p>

                {operation.requiresParams && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Configuration</Label>
                    {renderOperationParams(operation)}
                  </div>
                )}

                <Button
                  onClick={() => executeBatchOperation(operation)}
                  disabled={isProcessing || selectedEventIds.length === 0}
                  variant={operation.destructive ? "destructive" : "default"}
                  className="w-full"
                  size="sm"
                >
                  {isProcessing && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  {operation.name}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing operation...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {(error || success) && (
        <Alert variant={error ? "destructive" : "default"}>
          {error ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>
            {error || success}
          </AlertDescription>
        </Alert>
      )}

      {/* Operation Results Details */}
      {operationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Operation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{operationResults.successfulItems}</div>
                  <div className="text-sm text-gray-500">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{operationResults.failedItems}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{operationResults.totalItems}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>

              {operationResults.detectedConflicts.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {operationResults.detectedConflicts.length} scheduling conflict(s) detected during operation
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-gray-500">
                Executed at: {format(parseISO(operationResults.executedAt), 'MMM dd, yyyy h:mm a')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 