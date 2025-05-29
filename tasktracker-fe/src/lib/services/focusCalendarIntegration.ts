/**
 * Focus Mode Calendar Integration Service
 * 
 * This service provides seamless integration between focus mode and calendar features:
 * - Block availability during focus sessions
 * - Suggest optimal focus times based on calendar
 * - Coordinate family quiet times
 * - Prevent conflicts with focus blocks
 * - Real-time availability updates
 */

import { calendarSignalRService, type FocusSession } from './calendarSignalRService';
import { apiService } from './apiService';
import { useFocus } from '@/lib/providers/FocusContext';

interface OptimalFocusTime {
  startTime: string;
  endTime: string;
  confidenceScore: number;
  reasoning: string;
  qualityLevel: 'Optimal' | 'Good' | 'Fair';
  isQuietTime: boolean;
  conflictCount: number;
}

interface FamilyMember {
  id: number;
  name: string;
  email: string;
  role: string;
  familyId: number;
}

interface FocusAvailabilityBlock {
  id: string;
  memberId: number;
  startTime: string;
  endTime: string;
  taskTitle: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  allowInterruptions: boolean;
}

interface QuietTimeRequest {
  familyId: number;
  startTime: string;
  endTime: string;
  reason: string;
  priority: number;
  requestedBy: number;
  affectedMembers: number[];
  requireConfirmation: boolean;
}

interface QuietTimeResponse {
  memberId: number;
  response: 'accepted' | 'declined' | 'conditional';
  note?: string;
  alternativeTime?: {
    startTime: string;
    endTime: string;
  };
}

class FocusCalendarIntegrationService {
  private activeFocusBlocks: Map<number, FocusAvailabilityBlock> = new Map();
  private pendingQuietTimeRequests: Map<string, QuietTimeRequest> = new Map();
  private familyMembers: Map<number, FamilyMember[]> = new Map();

  constructor() {
    this.initializeSignalRHandlers();
  }

  private initializeSignalRHandlers() {
    // Handle focus session updates
    calendarSignalRService.on('onFocusSessionStarted', this.handleFocusSessionStarted.bind(this));
    calendarSignalRService.on('onFocusSessionEnded', this.handleFocusSessionEnded.bind(this));
    calendarSignalRService.on('onFocusSessionUpdated', this.handleFocusSessionUpdated.bind(this));
    
    // Handle optimal focus time suggestions
    calendarSignalRService.on('onOptimalFocusTimeSuggestions', this.handleOptimalFocusTimeSuggestions.bind(this));
    calendarSignalRService.on('onOptimalFocusTimesReceived', this.handleOptimalFocusTimesReceived.bind(this));
    
    // Handle quiet time requests
    calendarSignalRService.on('onFamilyQuietTimeRequested', this.handleFamilyQuietTimeRequested.bind(this));
    
    // Handle availability updates
    calendarSignalRService.on('onAvailabilityUpdated', this.handleAvailabilityUpdated.bind(this));
  }

  // #region Focus Session Management

  /**
   * Start a focus session and block calendar availability
   */
  public async startFocusSession(
    memberId: number, 
    durationMinutes: number, 
    taskTitle: string,
    options: {
      allowInterruptions?: boolean;
      priority?: 'high' | 'medium' | 'low';
      requestQuietTime?: boolean;
      familyId?: number;
    } = {}
  ): Promise<void> {
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      
      // Create availability block
      const focusBlock: FocusAvailabilityBlock = {
        id: `focus-${Date.now()}-${memberId}`,
        memberId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        taskTitle,
        status: 'active',
        priority: options.priority || 'medium',
        allowInterruptions: options.allowInterruptions || false
      };
      
      this.activeFocusBlocks.set(memberId, focusBlock);
      
      // Block availability in calendar
      await this.blockAvailability(memberId, startTime, endTime, taskTitle);
      
      // Notify via SignalR
      await calendarSignalRService.startFocusSession(memberId, durationMinutes, taskTitle);
      
      // Request family quiet time if needed
      if (options.requestQuietTime && options.familyId) {
        await this.requestFamilyQuietTime(
          options.familyId,
          startTime,
          endTime,
          `Focus session: ${taskTitle}`,
          options.priority === 'high' ? 5 : options.priority === 'medium' ? 3 : 1,
          memberId
        );
      }
      
      console.log('Focus session started and availability blocked', focusBlock);
    } catch (error) {
      console.error('Failed to start focus session:', error);
      throw error;
    }
  }

  /**
   * End focus session and restore availability
   */
  public async endFocusSession(
    memberId: number, 
    sessionQuality?: number,
    completionNotes?: string
  ): Promise<void> {
    try {
      const focusBlock = this.activeFocusBlocks.get(memberId);
      if (!focusBlock) {
        console.warn('No active focus session found for member:', memberId);
        return;
      }
      
      // Update block status
      focusBlock.status = 'completed';
      
      // Restore availability in calendar
      await this.restoreAvailability(memberId, new Date(focusBlock.startTime), new Date(focusBlock.endTime));
      
      // Notify via SignalR
      await calendarSignalRService.endFocusSession(memberId, sessionQuality);
      
      // Remove from active blocks
      this.activeFocusBlocks.delete(memberId);
      
      console.log('Focus session ended and availability restored', { memberId, sessionQuality });
    } catch (error) {
      console.error('Failed to end focus session:', error);
      throw error;
    }
  }

  /**
   * Pause focus session (keep availability blocked)
   */
  public async pauseFocusSession(memberId: number): Promise<void> {
    const focusBlock = this.activeFocusBlocks.get(memberId);
    if (focusBlock) {
      focusBlock.status = 'scheduled'; // Paused but still blocking
      console.log('Focus session paused, availability remains blocked');
    }
  }

  /**
   * Resume focus session
   */
  public async resumeFocusSession(memberId: number): Promise<void> {
    const focusBlock = this.activeFocusBlocks.get(memberId);
    if (focusBlock) {
      focusBlock.status = 'active';
      console.log('Focus session resumed');
    }
  }

  // #endregion

  // #region Optimal Time Suggestions

  /**
   * Get optimal focus times for a member based on calendar and family availability
   */
  public async getOptimalFocusTime(
    memberId: number,
    desiredDuration: number,
    preferences: {
      earliestStart?: string;
      latestEnd?: string;
      preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
      avoidMeetingDays?: boolean;
      minimumBreakBefore?: number; // minutes
      minimumBreakAfter?: number; // minutes
    } = {}
  ): Promise<OptimalFocusTime[]> {
    try {
      // Request suggestions via SignalR
      await calendarSignalRService.requestOptimalFocusTime(memberId, desiredDuration);
      
      // Also get suggestions via API for immediate response
      const response = await apiService.get(`/v1/smart-scheduling/optimal-focus-time`, {
        memberId,
        durationMinutes: desiredDuration,
        ...preferences
      });
      
      if (response.success && response.data) {
        return this.processOptimalTimeSlots(response.data.suggestions || []);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get optimal focus time:', error);
      return [];
    }
  }

  /**
   * Get focus time patterns and analytics for a member
   */
  public async getFocusTimeAnalytics(
    memberId: number,
    timeRange: { startDate: string; endDate: string }
  ): Promise<{
    bestTimes: { hour: number; successRate: number; averageQuality: number }[];
    productivityPatterns: { dayOfWeek: number; averageEfficiency: number }[];
    conflictFrequency: { timeSlot: string; conflictCount: number }[];
    recommendations: string[];
  }> {
    try {
      const response = await apiService.get('/v1/focus/analytics', {
        memberId,
        ...timeRange
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        bestTimes: [],
        productivityPatterns: [],
        conflictFrequency: [],
        recommendations: []
      };
    } catch (error) {
      console.error('Failed to get focus time analytics:', error);
      throw error;
    }
  }

  // #endregion

  // #region Family Quiet Time Coordination

  /**
   * Request family quiet time for focus session
   */
  public async requestFamilyQuietTime(
    familyId: number,
    startTime: Date,
    endTime: Date,
    reason: string,
    priority: number = 3,
    requestedBy: number
  ): Promise<string> {
    try {
      const requestId = `quiet-${Date.now()}-${familyId}`;
      
      // Get family members
      const familyMembers = await this.getFamilyMembers(familyId);
      
      const request: QuietTimeRequest = {
        familyId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason,
        priority,
        requestedBy,
        affectedMembers: familyMembers.map(m => m.id),
        requireConfirmation: priority >= 4 // High priority requires confirmation
      };
      
      this.pendingQuietTimeRequests.set(requestId, request);
      
      // Send via SignalR
      await calendarSignalRService.coordinateFamilyQuietTime(familyId, startTime, endTime, reason);
      
      // Send via API for persistence
      await apiService.post('/v1/family/quiet-time/request', request);
      
      console.log('Family quiet time requested:', request);
      return requestId;
    } catch (error) {
      console.error('Failed to request family quiet time:', error);
      throw error;
    }
  }

  /**
   * Respond to family quiet time request
   */
  public async respondToQuietTimeRequest(
    requestId: string,
    response: QuietTimeResponse
  ): Promise<void> {
    try {
      await apiService.post(`/v1/family/quiet-time/respond/${requestId}`, response);
      console.log('Responded to quiet time request:', { requestId, response });
    } catch (error) {
      console.error('Failed to respond to quiet time request:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot conflicts with family quiet time
   */
  public async checkQuietTimeConflicts(
    familyId: number,
    startTime: Date,
    endTime: Date
  ): Promise<{
    hasConflict: boolean;
    conflictingRequests: QuietTimeRequest[];
    suggestions: OptimalFocusTime[];
  }> {
    try {
      const response = await apiService.get('/v1/family/quiet-time/check-conflicts', {
        familyId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        hasConflict: false,
        conflictingRequests: [],
        suggestions: []
      };
    } catch (error) {
      console.error('Failed to check quiet time conflicts:', error);
      throw error;
    }
  }

  // #endregion

  // #region Availability Management

  /**
   * Block calendar availability during focus session
   */
  private async blockAvailability(
    memberId: number,
    startTime: Date,
    endTime: Date,
    reason: string
  ): Promise<void> {
    try {
      await apiService.post('/v1/family/availability/block', {
        memberId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'Busy',
        reason: `Focus session: ${reason}`,
        isRecurring: false,
        blockType: 'focus_session'
      });
    } catch (error) {
      console.error('Failed to block availability:', error);
      throw error;
    }
  }

  /**
   * Restore calendar availability after focus session
   */
  private async restoreAvailability(
    memberId: number,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    try {
      await apiService.post('/v1/family/availability/restore', {
        memberId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        blockType: 'focus_session'
      });
    } catch (error) {
      console.error('Failed to restore availability:', error);
      throw error;
    }
  }

  /**
   * Get current availability blocks for a member
   */
  public async getAvailabilityBlocks(
    memberId: number,
    timeRange: { startDate: string; endDate: string }
  ): Promise<FocusAvailabilityBlock[]> {
    try {
      const response = await apiService.get('/v1/family/availability/blocks', {
        memberId,
        ...timeRange,
        blockType: 'focus_session'
      });
      
      if (response.success && response.data) {
        return response.data.blocks || [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get availability blocks:', error);
      return [];
    }
  }

  // #endregion

  // #region Helper Methods

  private async getFamilyMembers(familyId: number): Promise<FamilyMember[]> {
    try {
      if (this.familyMembers.has(familyId)) {
        return this.familyMembers.get(familyId)!;
      }
      
      const response = await apiService.get(`/v1/family/${familyId}/members`);
      
      if (response.success && response.data) {
        const members = response.data.members || [];
        this.familyMembers.set(familyId, members);
        return members;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get family members:', error);
      return [];
    }
  }

  private processOptimalTimeSlots(slots: any[]): OptimalFocusTime[] {
    return slots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      confidenceScore: slot.confidenceScore || 0,
      reasoning: slot.reasoning || 'Optimal time based on calendar analysis',
      qualityLevel: slot.qualityLevel || 'Good',
      isQuietTime: slot.isQuietTime || false,
      conflictCount: slot.conflictCount || 0
    }));
  }

  // #endregion

  // #region SignalR Event Handlers

  private handleFocusSessionStarted(session: FocusSession): void {
    console.log('Focus session started via SignalR:', session);
    
    // Update local state if this is for current user
    if (session.memberId && session.sessionId) {
      const focusBlock: FocusAvailabilityBlock = {
        id: `focus-${session.sessionId}`,
        memberId: session.memberId,
        startTime: session.startTime || new Date().toISOString(),
        endTime: session.endTime || new Date(Date.now() + (session.durationMinutes || 60) * 60000).toISOString(),
        taskTitle: session.taskTitle || 'Focus Session',
        status: 'active',
        priority: 'medium',
        allowInterruptions: false
      };
      
      this.activeFocusBlocks.set(session.memberId, focusBlock);
    }
  }

  private handleFocusSessionEnded(data: any): void {
    console.log('Focus session ended via SignalR:', data);
    
    if (data.memberId) {
      this.activeFocusBlocks.delete(data.memberId);
    }
  }

  private handleFocusSessionUpdated(data: any): void {
    console.log('Focus session updated via SignalR:', data);
    
    const focusBlock = this.activeFocusBlocks.get(data.memberId);
    if (focusBlock && data.update) {
      focusBlock.status = data.update.status;
      if (data.update.taskTitle) {
        focusBlock.taskTitle = data.update.taskTitle;
      }
    }
  }

  private handleOptimalFocusTimeSuggestions(data: any): void {
    console.log('Optimal focus time suggestions received via SignalR:', data);
    
    // Trigger event for UI to handle
    window.dispatchEvent(new CustomEvent('optimalFocusTimeSuggestions', {
      detail: data
    }));
  }

  private handleOptimalFocusTimesReceived(data: any): void {
    console.log('Optimal focus times received via SignalR:', data);
    
    // Trigger event for UI to handle
    window.dispatchEvent(new CustomEvent('optimalFocusTimesReceived', {
      detail: data
    }));
  }

  private handleFamilyQuietTimeRequested(data: any): void {
    console.log('Family quiet time requested via SignalR:', data);
    
    if (data.request) {
      const requestId = `quiet-${Date.now()}-${data.familyId}`;
      this.pendingQuietTimeRequests.set(requestId, data.request);
      
      // Trigger event for UI to handle
      window.dispatchEvent(new CustomEvent('familyQuietTimeRequested', {
        detail: { requestId, ...data }
      }));
    }
  }

  private handleAvailabilityUpdated(data: any): void {
    console.log('Availability updated via SignalR:', data);
    
    // Check if this affects any active focus sessions
    const focusBlock = this.activeFocusBlocks.get(data.memberId);
    if (focusBlock && data.update.status === 'Available') {
      // Someone manually restored availability during focus session
      console.warn('Availability restored during focus session:', data);
    }
  }

  // #endregion

  // #region Public API

  /**
   * Get active focus sessions for family members
   */
  public getActiveFocusSessions(): FocusAvailabilityBlock[] {
    return Array.from(this.activeFocusBlocks.values());
  }

  /**
   * Get pending quiet time requests
   */
  public getPendingQuietTimeRequests(): QuietTimeRequest[] {
    return Array.from(this.pendingQuietTimeRequests.values());
  }

  /**
   * Check if a member is currently in focus mode
   */
  public isMemberInFocusMode(memberId: number): boolean {
    const focusBlock = this.activeFocusBlocks.get(memberId);
    return focusBlock?.status === 'active';
  }

  /**
   * Get remaining focus time for a member
   */
  public getRemainingFocusTime(memberId: number): number {
    const focusBlock = this.activeFocusBlocks.get(memberId);
    if (!focusBlock || focusBlock.status !== 'active') {
      return 0;
    }
    
    const endTime = new Date(focusBlock.endTime).getTime();
    const now = Date.now();
    
    return Math.max(0, Math.floor((endTime - now) / 60000)); // minutes
  }

  // #endregion
}

// Create and export singleton instance
export const focusCalendarIntegration = new FocusCalendarIntegrationService();

// Export types
export type {
  OptimalFocusTime,
  FamilyMember,
  FocusAvailabilityBlock,
  QuietTimeRequest,
  QuietTimeResponse
}; 