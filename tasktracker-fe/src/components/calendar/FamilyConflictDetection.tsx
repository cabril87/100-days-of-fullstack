'use client';

/*
 * Family Conflict Detection Component
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Real-time family scheduling conflict detection with resolution suggestions
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * Features:
 * 1. Real-time conflict detection as user types
 * 2. Visual conflict indicators with severity levels
 * 3. Intelligent resolution suggestions
 * 4. Family member availability checking
 * 5. Travel time and buffer time calculations
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ConflictData {
  hasConflicts: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conflicts: ConflictItem[];
  suggestions: ResolutionSuggestion[];
  familyAvailability: FamilyMemberAvailability[];
}

export interface ConflictItem {
  id: string;
  type: 'time_overlap' | 'travel_time' | 'family_busy' | 'resource_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedMembers: string[];
  conflictingEvent?: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ResolutionSuggestion {
  id: string;
  type: 'reschedule' | 'adjust_duration' | 'change_location' | 'split_attendees';
  title: string;
  description: string;
  confidence: number; // 0-100
  suggestedTime?: {
    start: Date;
    end: Date;
  };
  impact: 'minimal' | 'moderate' | 'significant';
  autoApplicable: boolean;
  reasoning: string[];
}

export interface FamilyMemberAvailability {
  userId: number;
  userName: string;
  isAvailable: boolean;
  availabilityScore: number; // 0-100
  busyPeriods: Array<{
    start: Date;
    end: Date;
    reason: string;
  }>;
  preferredTimes: Array<{
    start: Date;
    end: Date;
    preference: 'preferred' | 'acceptable' | 'avoid';
  }>;
}

export interface FamilyConflictDetectionProps {
  familyId: number;
  eventData: {
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    attendeeIds: number[];
  };
  onConflictDetected?: (conflicts: ConflictData) => void;
  onSuggestionApplied?: (suggestion: ResolutionSuggestion) => void;
  enableAutoRefresh?: boolean;
  showDetailedAnalysis?: boolean;
  className?: string;
}

// ============================================================================
// MOCK DATA SERVICE (to be replaced with real API calls)
// ============================================================================

const mockConflictService = {
  async checkConflicts(
    familyId: number,
    eventData: FamilyConflictDetectionProps['eventData']
  ): Promise<ConflictData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock conflict detection logic
    const hasOverlap = Math.random() > 0.7; // 30% chance of conflicts
    const hasTravel = eventData.location && Math.random() > 0.5;
    const hasFamilyBusy = Math.random() > 0.6;

    const conflicts: ConflictItem[] = [];
    const suggestions: ResolutionSuggestion[] = [];

    if (hasOverlap) {
      conflicts.push({
        id: 'conflict-1',
        type: 'time_overlap',
        severity: 'high',
        title: 'Scheduling Conflict Detected',
        description: 'This event overlaps with "Family Dinner" from 6:30-7:30 PM',
        affectedMembers: ['John', 'Sarah'],
        conflictingEvent: {
          id: 'event-123',
          title: 'Family Dinner',
          startTime: new Date(eventData.startTime.getTime() + 30 * 60000),
          endTime: new Date(eventData.endTime.getTime() + 30 * 60000),
          location: 'Kitchen'
        },
        timeRange: {
          start: eventData.startTime,
          end: eventData.endTime
        }
      });

      suggestions.push({
        id: 'suggestion-1',
        type: 'reschedule',
        title: 'Move to Earlier Time',
        description: 'Schedule 1 hour earlier to avoid family dinner conflict',
        confidence: 85,
        suggestedTime: {
          start: new Date(eventData.startTime.getTime() - 60 * 60000),
          end: new Date(eventData.endTime.getTime() - 60 * 60000)
        },
        impact: 'minimal',
        autoApplicable: true,
        reasoning: ['Family members have indicated a preference for earlier dinner time']
      });
    }

    if (hasTravel) {
      conflicts.push({
        id: 'conflict-2',
        type: 'travel_time',
        severity: 'medium',
        title: 'Insufficient Travel Time',
        description: 'Previous event ends at 5:00 PM, need 30 minutes travel time',
        affectedMembers: ['John'],
        timeRange: {
          start: new Date(eventData.startTime.getTime() - 30 * 60000),
          end: eventData.startTime
        }
      });

      suggestions.push({
        id: 'suggestion-2',
        type: 'adjust_duration',
        title: 'Add Buffer Time',
        description: 'Start 30 minutes later to allow for travel',
        confidence: 90,
        suggestedTime: {
          start: new Date(eventData.startTime.getTime() + 30 * 60000),
          end: new Date(eventData.endTime.getTime() + 30 * 60000)
        },
        impact: 'minimal',
        autoApplicable: true,
        reasoning: ['Travel time is a significant factor for this event']
      });
    }

    if (hasFamilyBusy) {
      conflicts.push({
        id: 'conflict-3',
        type: 'family_busy',
        severity: 'low',
        title: 'Family Member Partially Busy',
        description: 'Sarah has marked this time as "Prefer to Avoid"',
        affectedMembers: ['Sarah'],
        timeRange: {
          start: eventData.startTime,
          end: eventData.endTime
        }
      });

      suggestions.push({
        id: 'suggestion-3',
        type: 'reschedule',
        title: 'Find Optimal Time',
        description: 'Schedule when all family members are most available',
        confidence: 75,
        suggestedTime: {
          start: new Date(eventData.startTime.getTime() + 2 * 60 * 60000),
          end: new Date(eventData.endTime.getTime() + 2 * 60 * 60000)
        },
        impact: 'moderate',
        autoApplicable: false,
        reasoning: ['Sarah has indicated a preference for avoiding this time']
      });
    }

    const severity = conflicts.length === 0 ? 'low' :
                    conflicts.some(c => c.severity === 'critical') ? 'critical' :
                    conflicts.some(c => c.severity === 'high') ? 'high' :
                    conflicts.some(c => c.severity === 'medium') ? 'medium' : 'low';

    const familyAvailability: FamilyMemberAvailability[] = [
      {
        userId: 1,
        userName: 'John',
        isAvailable: !hasOverlap,
        availabilityScore: hasOverlap ? 30 : 85,
        busyPeriods: hasOverlap ? [{
          start: new Date(eventData.startTime.getTime() + 30 * 60000),
          end: new Date(eventData.endTime.getTime() + 30 * 60000),
          reason: 'Family Dinner'
        }] : [],
        preferredTimes: [{
          start: new Date(eventData.startTime.getTime() - 60 * 60000),
          end: new Date(eventData.startTime.getTime() + 60 * 60000),
          preference: 'preferred'
        }]
      },
      {
        userId: 2,
        userName: 'Sarah',
        isAvailable: !hasFamilyBusy,
        availabilityScore: hasFamilyBusy ? 40 : 90,
        busyPeriods: [],
        preferredTimes: [{
          start: new Date(eventData.startTime.getTime() + 2 * 60 * 60000),
          end: new Date(eventData.startTime.getTime() + 4 * 60 * 60000),
          preference: 'preferred'
        }]
      }
    ];

    return {
      hasConflicts: conflicts.length > 0,
      severity,
      conflicts,
      suggestions,
      familyAvailability
    };
  }
};

// ============================================================================
// FAMILY CONFLICT DETECTION COMPONENT
// ============================================================================

export default function FamilyConflictDetection({
  familyId,
  eventData,
  onConflictDetected,
  onSuggestionApplied,
  enableAutoRefresh = true,
  showDetailedAnalysis = true,
  className = ''
}: FamilyConflictDetectionProps) {
  
  // State management
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(enableAutoRefresh);

  // Track event data changes for optimized re-rendering - used for performance monitoring
  const eventDataKey = useMemo(() => {
    if (!eventData.title || !eventData.startTime || !eventData.endTime) {
      return '';
    }
    return `${eventData.title}-${eventData.startTime.getTime()}-${eventData.endTime.getTime()}`;
  }, [eventData]);

  // Performance monitoring utility for future use
  useEffect(() => {
    if (eventDataKey) {
      console.debug('Event data changed:', eventDataKey);
    }
  }, [eventDataKey]);

  // Check for conflicts
  const checkConflicts = useCallback(async () => {
    if (!eventData.title) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 Checking conflicts for event:', eventData.title);
      
      const conflicts = await mockConflictService.checkConflicts(familyId, eventData);
      setConflictData(conflicts);
      setLastChecked(new Date());

      if (onConflictDetected) {
        onConflictDetected(conflicts);
      }

      console.log('✅ Conflict check complete:', {
        hasConflicts: conflicts.hasConflicts,
        conflictCount: conflicts.conflicts.length,
        suggestionCount: conflicts.suggestions.length
      });

    } catch (error) {
      console.error('❌ Failed to check conflicts:', error);
      setConflictData(null);
    } finally {
      setIsLoading(false);
    }
  }, [familyId, eventData, onConflictDetected]);

  // Auto-refresh conflicts when event data changes
  useEffect(() => {
    if (autoRefreshEnabled) {
      checkConflicts();
    }
  }, [checkConflicts, autoRefreshEnabled]);

  // Handle suggestion application
  const handleApplySuggestion = useCallback((suggestion: ResolutionSuggestion) => {
    console.log('📝 Applying suggestion:', suggestion.title);
    
    if (onSuggestionApplied) {
      onSuggestionApplied(suggestion);
    }

    // Re-check conflicts after applying suggestion
    setTimeout(() => {
      checkConflicts();
    }, 500);
  }, [onSuggestionApplied, checkConflicts]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get conflict icon
  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'time_overlap': return <Calendar className="h-4 w-4" />;
      case 'travel_time': return <MapPin className="h-4 w-4" />;
      case 'family_busy': return <Users className="h-4 w-4" />;
      case 'resource_conflict': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className={cn("border-blue-200 bg-blue-50/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Checking for conflicts...</p>
              <p className="text-xs text-blue-600">Analyzing family schedules and availability</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render no conflicts state
  if (conflictData && !conflictData.hasConflicts) {
    return (
      <Card className={cn("border-green-200 bg-green-50/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">No conflicts detected</p>
              <p className="text-xs text-green-600">
                All family members are available
                {lastChecked && ` • Last checked ${lastChecked.toLocaleTimeString()}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkConflicts}
              className="text-green-600 hover:text-green-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render conflicts state
  if (!conflictData) {
    return (
      <Card className={cn("border-gray-200 bg-gray-50/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Conflict detection ready</p>
              <p className="text-xs text-gray-600">Click to check for scheduling conflicts</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkConflicts}
              className="text-gray-600 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(`border-2 ${getSeverityColor(conflictData.severity)}`, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Scheduling Conflicts Detected
            <Badge variant="outline" className={getSeverityColor(conflictData.severity)}>
              {conflictData.severity.toUpperCase()}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConflicts}
            className="opacity-70 hover:opacity-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {lastChecked && (
          <p className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Conflicts List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts ({conflictData.conflicts.length})
          </h4>
          
          {conflictData.conflicts.map((conflict) => (
            <div key={conflict.id} className="p-3 rounded-lg border bg-white/50">
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded ${getSeverityColor(conflict.severity)}`}>
                  {getConflictIcon(conflict.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{conflict.title}</p>
                  <p className="text-xs text-muted-foreground">{conflict.description}</p>
                  {conflict.affectedMembers.length > 0 && (
                    <div className="flex gap-1">
                      <span className="text-xs text-muted-foreground">Affects:</span>
                      {conflict.affectedMembers.map((member) => (
                        <Badge key={member} variant="secondary" className="text-xs px-1 py-0">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resolution Suggestions */}
        {conflictData.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggested Solutions
            </h4>
            
            {conflictData.suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 rounded-lg border bg-white/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.confidence}% confidence
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    {suggestion.suggestedTime && (
                      <p className="text-xs font-mono text-blue-600">
                        {suggestion.suggestedTime.start.toLocaleTimeString()} - {suggestion.suggestedTime.end.toLocaleTimeString()}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1">
                        {suggestion.reasoning.map((reason, reasonIndex) => (
                          <li key={reasonIndex}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={suggestion.autoApplicable ? "default" : "outline"}
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="text-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Family Availability Summary */}
        {showDetailedAnalysis && conflictData.familyAvailability.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Family Availability
            </h4>
            
            {conflictData.familyAvailability.map((member) => (
              <div key={member.userId} className="p-3 rounded-lg border bg-white/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{member.userName}</span>
                    <Badge 
                      variant={member.isAvailable ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {member.isAvailable ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member.availabilityScore}% available
                  </span>
                </div>
                <Progress value={member.availabilityScore} className="h-2" />
                {member.busyPeriods.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Busy: {member.busyPeriods[0].reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auto-refresh toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {conflictData.conflicts.length} conflicts • {conflictData.suggestions.length} suggestions
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className="text-xs"
          >
            Auto-refresh: {autoRefreshEnabled ? 'On' : 'Off'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 