'use client';

/*
 * Smart Family Event Creator Component
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Intelligent family event creation with conflict detection and smart scheduling
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * Features:
 * 1. Smart conflict detection as user types
 * 2. Family member availability integration
 * 3. Intelligent time suggestions
 * 4. Travel time calculations
 * 5. One-click optimal scheduling
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import FamilyConflictDetection, { type ConflictData, type ResolutionSuggestion } from './FamilyConflictDetection';

// ============================================================================
// SCHEMAS & VALIDATION
// ============================================================================

const smartEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().max(200).optional(),
  attendeeIds: z.array(z.number()).min(1, 'At least one family member must be selected'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().max(100).optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.string().optional(),
  reminderMinutes: z.number().min(0).max(10080),
  allowConflicts: z.boolean(),
  requireAllAttendees: z.boolean()
});

type SmartEventFormData = z.infer<typeof smartEventSchema>;

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface SmartSuggestion {
  id: string;
  type: 'optimal_time' | 'better_location' | 'duration_adjustment' | 'attendee_optimization';
  title: string;
  description: string;
  confidence: number;
  benefit: string;
  suggestedData: {
    startTime?: Date;
    endTime?: Date;
    location?: string;
    attendeeIds?: number[];
  };
  reasoning: string[];
}

export interface FamilyMemberOption {
  id: number;
  name: string;
  role: string;
  availabilityScore: number;
  conflictCount: number;
  isOptional: boolean;
}

export interface CreatedEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendeeIds: number[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  reminderMinutes: number;
  allowConflicts: boolean;
  requireAllAttendees: boolean;
  familyId: number;
  createdAt: Date;
  createdBy: number;
  status: 'active' | 'cancelled' | 'completed';
}

export interface SmartFamilyEventCreatorProps {
  familyId: number;
  familyMembers: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  onEventCreated?: (event: CreatedEvent) => void;
  onSuggestionApplied?: (suggestion: SmartSuggestion) => void;
  initialData?: Partial<SmartEventFormData>;
  showAdvancedFeatures?: boolean;
  className?: string;
}

// ============================================================================
// MOCK SMART SCHEDULING SERVICE
// ============================================================================

const mockSmartSchedulingService = {
  async generateSmartSuggestions(
    familyId: number,
    eventData: Partial<SmartEventFormData>,
    conflictData?: ConflictData
  ): Promise<SmartSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestions: SmartSuggestion[] = [];

    // Time optimization suggestions
    if (eventData.startTime && eventData.endTime) {
      suggestions.push({
        id: 'time-opt-1',
        type: 'optimal_time',
        title: 'Optimal Family Time Detected',
        description: 'Move to 10:00 AM for 95% family availability',
        confidence: 95,
        benefit: 'All family members available, no conflicts',
        suggestedData: {
          startTime: new Date(2025, 1, 22, 10, 0),
          endTime: new Date(2025, 1, 22, 11, 0)
        },
        reasoning: [
          'All selected family members are available',
          'Optimal productivity time for family activities',
          'No travel conflicts detected',
          'High energy time for all participants'
        ]
      });
    }

    // Location optimization
    if (eventData.location) {
      suggestions.push({
        id: 'location-opt-1',
        type: 'better_location',
        title: 'Suggest Better Location',
        description: 'Central location reduces travel time by 20 minutes',
        confidence: 80,
        benefit: 'Reduced travel time for all attendees',
        suggestedData: {
          location: 'Family Living Room'
        },
        reasoning: [
          'Central location for all family members',
          'No travel time required',
          'Comfortable familiar environment',
          'Available resources and amenities'
        ]
      });
    }

    // Duration suggestions based on activity type
    if (eventData.title) {
      const title = eventData.title.toLowerCase();
      if (title.includes('meeting') || title.includes('discussion')) {
        suggestions.push({
          id: 'duration-opt-1',
          type: 'duration_adjustment',
          title: 'Optimize Meeting Duration',
          description: 'Family meetings are most effective at 45 minutes',
          confidence: 85,
          benefit: 'Improved engagement and decision-making',
          suggestedData: {
            endTime: new Date(2025, 1, 22, 10, 45)
          },
          reasoning: [
            'Research shows optimal family meeting length',
            'Maintains attention and engagement',
            'Allows time for all voices to be heard',
            'Prevents decision fatigue'
          ]
        });
      }
    }

    // Attendee optimization
    if (conflictData?.familyAvailability) {
      const highAvailabilityMembers = conflictData.familyAvailability
        .filter(member => member.availabilityScore > 80)
        .map(member => member.userId);

      if (highAvailabilityMembers.length > 0 && eventData.attendeeIds) {
        suggestions.push({
          id: 'attendee-opt-1',
          type: 'attendee_optimization',
          title: 'Optimize Attendee List',
          description: 'Focus on highly available family members',
          confidence: 70,
          benefit: 'Higher attendance probability',
          suggestedData: {
            attendeeIds: highAvailabilityMembers
          },
          reasoning: [
            'Selected members have highest availability scores',
            'Reduced scheduling conflicts',
            'Better engagement probability',
            'Option to add others as optional'
          ]
        });
      }
    }

    return suggestions;
  },

  async createSmartEvent(
    familyId: number,
    eventData: SmartEventFormData
  ): Promise<CreatedEvent> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate event creation
    const event: CreatedEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      familyId,
      createdAt: new Date(),
      createdBy: 1, // Current user
      status: 'active'
    };

    console.log('✅ Smart family event created:', event);
    return event;
  }
};

// ============================================================================
// SMART FAMILY EVENT CREATOR COMPONENT
// ============================================================================

export default function SmartFamilyEventCreator({
  familyId,
  familyMembers,
  onEventCreated,
  onSuggestionApplied,
  initialData,
  showAdvancedFeatures = true,
  className = ''
}: SmartFamilyEventCreatorProps) {
  
  // State management
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [familyMemberOptions, setFamilyMemberOptions] = useState<FamilyMemberOption[]>([]);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SmartEventFormData>({
    resolver: zodResolver(smartEventSchema),
    defaultValues: {
      priority: 'medium',
      isRecurring: false,
      reminderMinutes: 15,
      allowConflicts: false,
      requireAllAttendees: true,
      attendeeIds: [],
      ...initialData
    }
  });

  // Watch form changes for real-time suggestions
  const watchedValues = watch();

  // Prepare family member options with availability scores
  useEffect(() => {
    const options: FamilyMemberOption[] = familyMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      availabilityScore: Math.floor(Math.random() * 40) + 60, // Mock score 60-100
      conflictCount: Math.floor(Math.random() * 3), // Mock 0-2 conflicts
      isOptional: false
    }));
    
    setFamilyMemberOptions(options);
  }, [familyMembers]);

  // Generate smart suggestions when form data changes
  const generateSmartSuggestions = useCallback(async () => {
    if (!watchedValues.title || !watchedValues.startTime || !watchedValues.endTime) {
      setSmartSuggestions([]);
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      console.log('🧠 Generating smart suggestions...', {
        title: watchedValues.title,
        attendeeCount: watchedValues.attendeeIds?.length || 0
      });

      const suggestions = await mockSmartSchedulingService.generateSmartSuggestions(
        familyId,
        watchedValues,
        conflictData || undefined
      );

      setSmartSuggestions(suggestions);
      console.log('✅ Smart suggestions generated:', suggestions.length);

    } catch (error) {
      console.error('❌ Failed to generate suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [familyId, watchedValues, conflictData]);

  // Debounced suggestion generation
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSmartSuggestions();
    }, 1000);

    return () => clearTimeout(timer);
  }, [generateSmartSuggestions]);

  // Handle conflict detection
  const handleConflictDetected = useCallback((conflicts: ConflictData) => {
    setConflictData(conflicts);
    console.log('⚠️ Conflicts detected:', conflicts);
  }, []);

  // Handle suggestion application
  const handleApplySuggestion = useCallback((suggestion: SmartSuggestion | ResolutionSuggestion) => {
    console.log('📝 Applying suggestion:', suggestion.title);

    if ('suggestedData' in suggestion) {
      // Smart suggestion
      const smartSuggestion = suggestion as SmartSuggestion;
      
      if (smartSuggestion.suggestedData.startTime) {
        const startTime = smartSuggestion.suggestedData.startTime;
        setValue('startTime', startTime.toTimeString().slice(0, 5));
      }
      
      if (smartSuggestion.suggestedData.endTime) {
        const endTime = smartSuggestion.suggestedData.endTime;
        setValue('endTime', endTime.toTimeString().slice(0, 5));
      }
      
      if (smartSuggestion.suggestedData.location) {
        setValue('location', smartSuggestion.suggestedData.location);
      }
      
      if (smartSuggestion.suggestedData.attendeeIds) {
        setValue('attendeeIds', smartSuggestion.suggestedData.attendeeIds);
      }

      if (onSuggestionApplied) {
        onSuggestionApplied(smartSuggestion);
      }
    } else {
      // Resolution suggestion from conflict detection
      const resolutionSuggestion = suggestion as ResolutionSuggestion;
      
      if (resolutionSuggestion.suggestedTime) {
        setValue('startTime', resolutionSuggestion.suggestedTime.start.toTimeString().slice(0, 5));
        setValue('endTime', resolutionSuggestion.suggestedTime.end.toTimeString().slice(0, 5));
      }
    }

    // Regenerate suggestions after applying
    setTimeout(() => {
      generateSmartSuggestions();
    }, 500);
  }, [setValue, onSuggestionApplied, generateSmartSuggestions]);

  // Handle form submission
  const onSubmit = async (data: SmartEventFormData) => {
    try {
      console.log('📅 Creating smart family event...', data);

      const event = await mockSmartSchedulingService.createSmartEvent(familyId, data);

      if (onEventCreated) {
        onEventCreated(event);
      }

      console.log('✅ Event created successfully');

    } catch (error) {
      console.error('❌ Failed to create event:', error);
    }
  };

  // Get current event data for conflict detection
  const currentEventData = useMemo(() => {
    if (!watchedValues.title || !watchedValues.startDate || !watchedValues.startTime || !watchedValues.endTime) {
      return null;
    }

    const [startHour, startMinute] = watchedValues.startTime.split(':').map(Number);
    const [endHour, endMinute] = watchedValues.endTime.split(':').map(Number);
    
    const startDate = new Date(watchedValues.startDate);
    const startTime = new Date(startDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(startDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    return {
      title: watchedValues.title,
      startTime,
      endTime,
      location: watchedValues.location,
      attendeeIds: watchedValues.attendeeIds || []
    };
  }, [watchedValues]);

  // Note: showAdvancedFeatures is available for future expansion but not currently used in UI
  console.debug('Advanced features available:', showAdvancedFeatures);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Smart Family Event Creator
            </div>
            <Badge variant="outline">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="smart">Smart Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Details Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Family Planning Meeting"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the event..."
                    {...register('description')}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...register('startTime')}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...register('endTime')}
                    />
                    {errors.endTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Living Room, Park, Restaurant"
                    {...register('location')}
                  />
                </div>

                <div>
                  <Label>Family Members</Label>
                  <div className="mt-2 space-y-2">
                    {familyMemberOptions.map((member) => (
                      <label key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            value={member.id}
                            {...register('attendeeIds')}
                          />
                          <div>
                            <span className="text-sm font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({member.role})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {member.availabilityScore}% available
                          </Badge>
                          {member.conflictCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {member.conflictCount} conflicts
                            </Badge>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.attendeeIds && (
                    <p className="text-sm text-red-600 mt-1">{errors.attendeeIds.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Features Tab */}
          <TabsContent value="smart" className="space-y-4">
            {/* Conflict Detection */}
            {currentEventData && (
              <FamilyConflictDetection
                familyId={familyId}
                eventData={currentEventData}
                onConflictDetected={handleConflictDetected}
                onSuggestionApplied={handleApplySuggestion}
                enableAutoRefresh={true}
                showDetailedAnalysis={true}
              />
            )}

            {/* Smart Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Smart Suggestions
                  {isGeneratingSuggestions && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {smartSuggestions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Lightbulb className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>AI suggestions will appear as you fill out the form</p>
                    <p className="text-sm">Enter event details to get smart recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {smartSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600" />
                              <p className="font-medium text-blue-900">{suggestion.title}</p>
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                {suggestion.confidence}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            <p className="text-xs text-green-600 font-medium">
                              💡 {suggestion.benefit}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <ul className="list-disc list-inside space-y-1">
                                {suggestion.reasoning.map((reason, index) => (
                                  <li key={index}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApplySuggestion(suggestion)}
                            className="shrink-0"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={watch('priority')} onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high' | 'urgent')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Meeting, Activity, Celebration"
                    {...register('category')}
                  />
                </div>

                <div>
                  <Label htmlFor="reminderMinutes">Reminder (minutes before)</Label>
                  <Select value={watch('reminderMinutes')?.toString()} onValueChange={(value) => setValue('reminderMinutes', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">1 day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {conflictData?.hasConflicts ? (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    {conflictData.conflicts.length} conflicts detected
                  </div>
                ) : currentEventData ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    No conflicts detected
                  </div>
                ) : (
                  'Complete the form to create your smart family event'
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateSmartSuggestions()}
                  disabled={isGeneratingSuggestions}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !currentEventData}
                >
                  {isSubmitting ? 'Creating...' : 'Create Smart Event'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 