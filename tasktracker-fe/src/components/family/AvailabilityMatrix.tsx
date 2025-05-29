'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar,
  Clock,
  Users,
  Grid3X3,
  Download,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, addDays, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, startOfDay, addMinutes } from 'date-fns';
import { apiService } from '@/lib/services/apiService';

// Type definitions for availability matrix
interface TimeSlotAvailability {
  startTime: string;
  endTime: string;
  memberStatuses: MemberAvailabilityStatus[];
  hasConflicts: boolean;
  conflictCount: number;
  overallAvailability: 'Available' | 'Partial' | 'Busy';
}

interface MemberAvailabilityStatus {
  memberId: number;
  status: 'Available' | 'Busy' | 'Tentative' | 'OutOfOffice';
  conflictingEventIds: number[];
}

interface FamilyMemberSummary {
  memberId: number;
  name: string;
  username: string;
  role: string;
  availabilityScore: number;
}

interface MatrixMetadata {
  totalTimeSlots: number;
  conflictFreeSlots: number;
  conflictRate: number;
  generatedAt: string;
  totalMembers: number;
}

interface OptimalTimeSlot {
  startTime: string;
  endTime: string;
  confidenceScore: number;
  availabilityQuality: 'Optimal' | 'Good' | 'Fair' | 'Poor';
  conflictCount: number;
  availableMembers: MemberAvailabilityStatus[];
  reasoning: string;
}

interface AvailabilityMatrix {
  startDate: string;
  endDate: string;
  granularity: string;
  members: FamilyMemberSummary[];
  timeSlots: TimeSlotAvailability[];
  optimalSlots: OptimalTimeSlot[];
  metadata: MatrixMetadata;
}

interface AvailabilityMatrixProps {
  familyId: number;
  onTimeSlotSelect?: (slot: TimeSlotAvailability) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialGranularity?: number; // in minutes
}

export default function AvailabilityMatrix({
  familyId,
  onTimeSlotSelect,
  initialStartDate = new Date(),
  initialEndDate = addDays(new Date(), 7),
  initialGranularity = 60
}: AvailabilityMatrixProps) {
  const [matrix, setMatrix] = useState<AvailabilityMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration state
  const [startDate, setStartDate] = useState(format(initialStartDate, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(initialEndDate, 'yyyy-MM-dd'));
  const [granularity, setGranularity] = useState(initialGranularity);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'custom'>('week');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotAvailability | null>(null);

  // Load matrix data on component mount and when parameters change
  useEffect(() => {
    loadAvailabilityMatrix();
  }, [familyId, startDate, endDate, granularity]);

  const loadAvailabilityMatrix = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        granularityMinutes: granularity.toString()
      });

      const response = await apiService.get(`/v1/family/${familyId}/smart-scheduling/availability-matrix?${params}`);
      setMatrix(response.data as AvailabilityMatrix);
    } catch (error: unknown) {
      console.error('Error loading availability matrix:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'Failed to load availability matrix';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewModeChange = (mode: 'day' | 'week' | 'custom') => {
    setViewMode(mode);
    const today = new Date();
    
    switch (mode) {
      case 'day':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'week':
        setStartDate(format(startOfWeek(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(today), 'yyyy-MM-dd'));
        break;
      // 'custom' doesn't change dates
    }
  };

  const navigateTimeframe = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : 7;
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    
    if (direction === 'prev') {
      setStartDate(format(addDays(currentStart, -days), 'yyyy-MM-dd'));
      setEndDate(format(addDays(currentEnd, -days), 'yyyy-MM-dd'));
    } else {
      setStartDate(format(addDays(currentStart, days), 'yyyy-MM-dd'));
      setEndDate(format(addDays(currentEnd, days), 'yyyy-MM-dd'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'Tentative': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OutOfOffice': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Partial': return 'bg-yellow-500';
      case 'Busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle className="h-3 w-3" />;
      case 'Busy': return <XCircle className="h-3 w-3" />;
      case 'Tentative': return <AlertTriangle className="h-3 w-3" />;
      case 'OutOfOffice': return <Info className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const handleSlotClick = (slot: TimeSlotAvailability) => {
    setSelectedSlot(slot);
    onTimeSlotSelect?.(slot);
  };

  const exportMatrix = () => {
    if (!matrix) return;

    const exportData = {
      matrix,
      exportedAt: new Date().toISOString(),
      familyId
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `availability-matrix-${familyId}-${startDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  // Group time slots by day for better display
  const groupSlotsByDay = (slots: TimeSlotAvailability[]) => {
    const grouped: { [date: string]: TimeSlotAvailability[] } = {};
    
    slots.forEach(slot => {
      const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    
    return grouped;
  };

  const groupedSlots = matrix ? groupSlotsByDay(matrix.timeSlots) : {};

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-500" />
            Family Availability Matrix
          </CardTitle>
          <CardDescription>
            Visual overview of family member availability across time slots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Mode Selection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('custom')}
              >
                Custom
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTimeframe('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTimeframe('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Date Range and Granularity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={viewMode !== 'custom'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={viewMode !== 'custom'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="granularity">Time Granularity</Label>
              <Select value={granularity.toString()} onValueChange={(value) => setGranularity(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={loadAvailabilityMatrix}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              <RefreshCw className="h-4 w-4" />
              Refresh Matrix
            </Button>
            
            <Button
              onClick={exportMatrix}
              disabled={!matrix}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
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

      {/* Matrix Display */}
      {matrix && (
        <>
          {/* Metadata Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{matrix.metadata.totalMembers}</div>
                  <div className="text-sm text-gray-500">Family Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{matrix.metadata.conflictFreeSlots}</div>
                  <div className="text-sm text-gray-500">Conflict-Free Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{matrix.metadata.totalTimeSlots}</div>
                  <div className="text-sm text-gray-500">Total Time Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{Math.round(matrix.metadata.conflictRate)}%</div>
                  <div className="text-sm text-gray-500">Conflict Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span className="text-sm">Busy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span className="text-sm">Tentative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                  <span className="text-sm">Out of Office</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matrix Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Grid</CardTitle>
              <CardDescription>
                Click on any time slot to see detailed availability information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
                  </h3>
                  
                  {/* Member Headers */}
                  <div className="grid gap-2 mb-2" style={{gridTemplateColumns: `120px repeat(${matrix.members.length}, minmax(0, 1fr))`}}>
                    <div className="font-medium text-sm">Time</div>
                    {matrix.members.map(member => (
                      <TooltipProvider key={member.memberId}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center text-sm font-medium truncate p-2 bg-gray-50 rounded">
                              {member.name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div>{member.name} ({member.role})</div>
                              <div>Availability Score: {Math.round(member.availabilityScore)}%</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>

                  {/* Time Slot Rows */}
                  <div className="space-y-1">
                    {slots.map((slot, slotIndex) => (
                      <div 
                        key={slotIndex}
                        className="grid gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        style={{gridTemplateColumns: `120px repeat(${matrix.members.length}, minmax(0, 1fr))`}}
                        onClick={() => handleSlotClick(slot)}
                      >
                        {/* Time Column */}
                        <div className="text-sm flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getOverallStatusColor(slot.overallAvailability)}`}></div>
                          {format(parseISO(slot.startTime), 'h:mm a')}
                        </div>

                        {/* Member Status Columns */}
                        {matrix.members.map(member => {
                          const memberStatus = slot.memberStatuses.find(status => status.memberId === member.memberId);
                          const status = memberStatus?.status || 'Available';
                          
                          return (
                            <TooltipProvider key={member.memberId}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`p-2 rounded text-center text-xs border ${getStatusColor(status)}`}>
                                    <div className="flex items-center justify-center">
                                      {getStatusIcon(status)}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <div>{member.name}: {status}</div>
                                    {memberStatus?.conflictingEventIds.length ? (
                                      <div className="text-red-600">
                                        {memberStatus.conflictingEventIds.length} conflict(s)
                                      </div>
                                    ) : null}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimal Time Slots */}
          {matrix.optimalSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Optimal Time Slots
                </CardTitle>
                <CardDescription>
                  Best time slots with maximum availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matrix.optimalSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 bg-green-50 border-green-200 cursor-pointer hover:bg-green-100"
                      onClick={() => {
                        // Convert OptimalTimeSlot to TimeSlotAvailability for compatibility
                        const timeSlot: TimeSlotAvailability = {
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                          memberStatuses: slot.availableMembers,
                          hasConflicts: slot.conflictCount > 0,
                          conflictCount: slot.conflictCount,
                          overallAvailability: slot.availabilityQuality === 'Optimal' ? 'Available' : 
                                              slot.availabilityQuality === 'Good' ? 'Partial' : 'Busy'
                        };
                        onTimeSlotSelect?.(timeSlot);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Optimal</span>
                      </div>
                      <div className="text-sm">
                        <div>{format(parseISO(slot.startTime), 'MMM dd, h:mm a')}</div>
                        <div>{format(parseISO(slot.endTime), 'h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Availability Matrix</h3>
            <p className="text-gray-500">
              Analyzing family member schedules and generating availability data...
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!isLoading && !matrix && !error && (
        <Card>
          <CardContent className="text-center py-8">
            <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No availability data found for the selected time range.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Slot Details */}
      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Time Slot Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Range</Label>
                  <div className="text-sm">
                    {format(parseISO(selectedSlot.startTime), 'MMM dd, yyyy h:mm a')} - {format(parseISO(selectedSlot.endTime), 'h:mm a')}
                  </div>
                </div>
                <div>
                  <Label>Overall Status</Label>
                  <Badge className={getOverallStatusColor(selectedSlot.overallAvailability)}>
                    {selectedSlot.overallAvailability}
                  </Badge>
                </div>
              </div>

              {selectedSlot.hasConflicts && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This time slot has {selectedSlot.conflictCount} conflict(s)
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label>Member Availability</Label>
                <div className="mt-2 space-y-2">
                  {selectedSlot.memberStatuses.map(status => {
                    const member = matrix?.members.find(m => m.memberId === status.memberId);
                    return (
                      <div key={status.memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{member?.name}</span>
                        <Badge className={getStatusColor(status.status)}>
                          {getStatusIcon(status.status)}
                          {status.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 