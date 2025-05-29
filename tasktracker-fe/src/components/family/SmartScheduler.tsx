'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar,
  Clock,
  Users,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Settings,
  Filter,
  Zap
} from 'lucide-react';
import { format, parseISO, addDays, startOfDay } from 'date-fns';
import { apiService } from '@/lib/services/apiService';

// Type definitions for smart scheduling
interface TimeRange {
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
}

interface SchedulingPreferences {
  duration: string; // ISO 8601 duration format (PT1H30M for 1.5 hours)
  requiredAttendeeIds: number[];
  optionalAttendeeIds?: number[];
  preferredStartDate?: string;
  preferredEndDate?: string;
  preferredTimeRanges?: TimeRange[];
  maxSuggestions: number;
  minConfidenceThreshold: number;
  allowConflicts: boolean;
}

interface OptimalTimeSlot {
  startTime: string;
  endTime: string;
  confidenceScore: number;
  availabilityQuality: 'Optimal' | 'Good' | 'Fair' | 'Poor';
  conflictCount: number;
  availableMembers: AvailableMember[];
  reasoning: string;
}

interface AvailableMember {
  memberId: number;
  memberName: string;
  availabilityStatus: 'Available' | 'Busy' | 'Tentative';
}

interface SmartSchedulingSuggestion {
  timeSlot: OptimalTimeSlot;
  confidence: number;
  potentialConflicts: SchedulingConflict[];
  attendees: AvailableMember[];
  reasoning: string;
  requiresRescheduling: boolean;
}

interface SchedulingConflict {
  id: number;
  eventId: number;
  conflictType: string;
  severity: 'Minor' | 'Major' | 'Critical';
  affectedMembers: number[];
  description: string;
}

interface SmartSchedulerProps {
  familyId: number;
  onTimeSlotSelect?: (timeSlot: OptimalTimeSlot) => void;
  onSuggestionSelect?: (suggestion: SmartSchedulingSuggestion) => void;
  preselectedDuration?: number; // in minutes
  preselectedAttendees?: number[];
}

export default function SmartScheduler({
  familyId,
  onTimeSlotSelect,
  onSuggestionSelect,
  preselectedDuration = 60,
  preselectedAttendees = []
}: SmartSchedulerProps) {
  const [suggestions, setSuggestions] = useState<SmartSchedulingSuggestion[]>([]);
  const [optimalSlots, setOptimalSlots] = useState<OptimalTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  
  // Form state
  const [duration, setDuration] = useState(preselectedDuration);
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>(preselectedAttendees);
  const [preferredStartDate, setPreferredStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [preferredEndDate, setPreferredEndDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [maxSuggestions, setMaxSuggestions] = useState(5);
  const [minConfidence, setMinConfidence] = useState(0.7);
  const [allowConflicts, setAllowConflicts] = useState(false);

  // Load family members on component mount
  useEffect(() => {
    loadFamilyMembers();
  }, [familyId]);

  const loadFamilyMembers = async () => {
    try {
      const response = await apiService.get(`/v1/family/${familyId}/members`);
      setFamilyMembers((response.data as any[]) || []);
    } catch (error) {
      console.error('Error loading family members:', error);
      setError('Failed to load family members');
    }
  };

  const getOptimalTimeSlots = async () => {
    if (selectedAttendees.length === 0) {
      setError('Please select at least one attendee');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        durationMinutes: duration.toString(),
        requiredAttendeeIds: selectedAttendees.join(','),
        preferredStartDate,
        preferredEndDate
      });

      const response = await apiService.get(`/v1/family/${familyId}/smart-scheduling/optimal-times?${params}`);
      setOptimalSlots((response.data as OptimalTimeSlot[]) || []);
    } catch (error: unknown) {
      console.error('Error getting optimal time slots:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'Failed to get optimal time slots';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSmartSuggestions = async () => {
    if (selectedAttendees.length === 0) {
      setError('Please select at least one attendee');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const preferences: SchedulingPreferences = {
        duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
        requiredAttendeeIds: selectedAttendees,
        preferredStartDate,
        preferredEndDate,
        maxSuggestions,
        minConfidenceThreshold: minConfidence,
        allowConflicts
      };

      const response = await apiService.post(`/v1/family/${familyId}/smart-scheduling/suggestions`, preferences);
      setSuggestions((response.data as SmartSchedulingSuggestion[]) || []);
    } catch (error: unknown) {
      console.error('Error getting smart suggestions:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'Failed to get smart suggestions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendeeToggle = (memberId: number) => {
    setSelectedAttendees(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Optimal': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'Optimal': return <CheckCircle className="h-4 w-4" />;
      case 'Good': return <TrendingUp className="h-4 w-4" />;
      case 'Fair': return <Clock className="h-4 w-4" />;
      case 'Poor': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Smart Scheduling Configuration
          </CardTitle>
          <CardDescription>
            Configure your scheduling preferences to get AI-powered meeting time suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Meeting Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={15}
                max={480}
                step={15}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxSuggestions">Max Suggestions</Label>
              <Input
                id="maxSuggestions"
                type="number"
                value={maxSuggestions}
                onChange={(e) => setMaxSuggestions(Number(e.target.value))}
                min={1}
                max={10}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Search Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={preferredStartDate}
                onChange={(e) => setPreferredStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Search End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={preferredEndDate}
                onChange={(e) => setPreferredEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Attendee Selection */}
          <div className="space-y-2">
            <Label>Required Attendees</Label>
            <div className="flex flex-wrap gap-2">
              {familyMembers.map(member => (
                <Badge
                  key={member.id}
                  variant={selectedAttendees.includes(member.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleAttendeeToggle(member.id)}
                >
                  <Users className="h-3 w-3 mr-1" />
                  {member.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={getOptimalTimeSlots}
              disabled={isLoading || selectedAttendees.length === 0}
              className="flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              <Clock className="h-4 w-4" />
              Find Optimal Times
            </Button>
            
            <Button
              onClick={getSmartSuggestions}
              disabled={isLoading || selectedAttendees.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              <Lightbulb className="h-4 w-4" />
              Get Smart Suggestions
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Optimal Time Slots Results */}
      {optimalSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Optimal Time Slots
            </CardTitle>
            <CardDescription>
              AI-analyzed optimal meeting times based on family availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimalSlots.map((slot, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotSelect?.(slot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getQualityColor(slot.availabilityQuality)}>
                        {getQualityIcon(slot.availabilityQuality)}
                        {slot.availabilityQuality}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round(slot.confidenceScore)}% confidence
                      </span>
                    </div>
                    {slot.conflictCount > 0 && (
                      <Badge variant="destructive">
                        {slot.conflictCount} conflict(s)
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(parseISO(slot.startTime), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {format(parseISO(slot.startTime), 'h:mm a')} - {format(parseISO(slot.endTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{slot.reasoning}</p>

                  <div className="flex flex-wrap gap-1">
                    {slot.availableMembers.map(member => (
                      <Badge
                        key={member.memberId}
                        variant={member.availabilityStatus === 'Available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.memberName} ({member.availabilityStatus})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions Results */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Smart Scheduling Suggestions
            </CardTitle>
            <CardDescription>
              Intelligent recommendations with conflict analysis and optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSuggestionSelect?.(suggestion)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getQualityColor(suggestion.timeSlot.availabilityQuality)}>
                        {getQualityIcon(suggestion.timeSlot.availabilityQuality)}
                        {suggestion.timeSlot.availabilityQuality}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    {suggestion.requiresRescheduling && (
                      <Badge variant="outline">
                        Requires Rescheduling
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(parseISO(suggestion.timeSlot.startTime), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {format(parseISO(suggestion.timeSlot.startTime), 'h:mm a')} - {format(parseISO(suggestion.timeSlot.endTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>

                  {suggestion.potentialConflicts.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-red-600">
                        {suggestion.potentialConflicts.length} potential conflict(s)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {suggestion.attendees.map(attendee => (
                      <Badge
                        key={attendee.memberId}
                        variant={attendee.availabilityStatus === 'Available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {attendee.memberName} ({attendee.availabilityStatus})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {!isLoading && optimalSlots.length === 0 && suggestions.length === 0 && selectedAttendees.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500">
              Try adjusting your date range, duration, or attendee selection to find available time slots.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 