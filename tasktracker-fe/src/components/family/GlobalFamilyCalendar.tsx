/**
 * Global Family Calendar Component
 * Provides a hybrid view showing all user's families and their events
 * with smart filtering and graceful error handling
 */

'use client';

/**
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar';
import moment from 'moment';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { CalendarIcon, RefreshCw, AlertTriangle, Clock, Users, Eye, EyeOff, Filter, Search, ArrowLeft, ArrowRight, Settings, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthContext';
import EventManagementModal from './EventManagementModal';
import { userCalendarService, 
  type UserGlobalCalendarDTO, 
  type UserFamilyCalendarSummaryDTO, 
  type FamilyCalendarEventWithFamilyDTO,
  type CalendarConflictDTO,
  type CreateEventRequest,
  type UpdateEventRequest
} from '@/lib/services/userCalendarService';
import { familyService } from '@/lib/services/familyService';
import { familyCalendarService } from '@/lib/services/familyCalendarService';
import { Family, FamilyCalendarEvent } from '@/lib/types/family';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);

interface GlobalFamilyCalendarProps {
  isModal?: boolean;
  initialView?: 'month' | 'week' | 'day' | 'agenda';
}

interface FamilyWithEvents extends Family {
  events: FamilyCalendarEvent[];
  color: string;
  isLoading: boolean;
  hasError: boolean;
}

interface CalendarViewMode {
  type: 'global' | 'family';
  familyId?: number;
}

interface EventModalState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view' | 'copy';
    event?: FamilyCalendarEventWithFamilyDTO;
    selectedDate?: Date;
}

interface FilterState {
    familyIds: number[];
    eventTypes: string[];
    priorities: string[];
    showPastEvents: boolean;
    showPrivateEvents: boolean;
    searchQuery: string;
}

interface CalendarConnectionState {
    isConnected: boolean;
    lastUpdate: Date | null;
    reconnectAttempts: number;
}

export function GlobalFamilyCalendar({ isModal = false, initialView = 'month' }: GlobalFamilyCalendarProps) {
  const { user, isAuthenticated, getAccessToken } = useAuth();
  
  // Core state
  const [globalCalendar, setGlobalCalendar] = useState<UserGlobalCalendarDTO | null>(null);
  const [userFamilies, setUserFamilies] = useState<UserFamilyCalendarSummaryDTO[]>([]);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<CalendarConflictDTO[]>([]);
  
  // Calendar state
  const [currentView, setCurrentView] = useState<View>(initialView as View);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>({ type: 'global' });
  
  // Modal state
  const [modalState, setModalState] = useState<EventModalState>({
    isOpen: false,
    mode: 'create'
  });
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    familyIds: [],
    eventTypes: [],
    priorities: [],
    showPastEvents: false,
    showPrivateEvents: true,
    searchQuery: ''
  });
  
  // SignalR state
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<CalendarConnectionState>({
    isConnected: false,
    lastUpdate: null,
    reconnectAttempts: 0
  });

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadGlobalCalendar();
      loadUserFamilies(); 
      loadConflicts();
      initializeSignalR();
    }
  }, [isAuthenticated, user]);

  // Update filters when families change
  useEffect(() => {
    if (userFamilies.length > 0 && filters.familyIds.length === 0) {
      setFilters(prev => ({
        ...prev,
        familyIds: userFamilies.map(f => f.familyId)
      }));
    }
  }, [userFamilies]);

  const loadGlobalCalendar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[GlobalFamilyCalendar] Loading global calendar...');
      const calendar = await userCalendarService.getUserGlobalCalendar();
      
      if (calendar) {
        setGlobalCalendar(calendar);
        console.log(`[GlobalFamilyCalendar] Loaded global calendar with ${calendar.allEvents.length} events across ${calendar.families.length} families`);
      } else {
        setError('Failed to load calendar data');
      }
    } catch (error) {
      console.error('[GlobalFamilyCalendar] Error loading global calendar:', error);
      setError('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserFamilies = async () => {
    try {
      console.log('[GlobalFamilyCalendar] Loading user families...');
      
      const familySummaries = await userCalendarService.getUserFamiliesCalendarSummary();
      setUserFamilies(familySummaries);
      
      // Load actual family data for member information
      const familyPromises = familySummaries.map(async (summary: UserFamilyCalendarSummaryDTO) => {
        try {
          const familyResponse = await familyService.getFamily(summary.familyId.toString());
          return familyResponse.data;
        } catch (error) {
          console.error(`Error loading family ${summary.familyId}:`, error);
          return null;
        }
      });
      
      const families = (await Promise.all(familyPromises)).filter((f): f is Family => f !== null);
      setAllFamilies(families);
      
      // Auto-switch to single family view if user only has one family
      if (familySummaries.length === 1) {
        setViewMode({ type: 'family', familyId: familySummaries[0].familyId });
      } else if (familySummaries.length > 1) {
        setViewMode({ type: 'global' });
      }

      // Initialize filters with all families
      setFilters(prev => ({
        ...prev,
        familyIds: familySummaries.map((f: UserFamilyCalendarSummaryDTO) => f.familyId)
      }));
      
      console.log(`[GlobalFamilyCalendar] Loaded ${familySummaries.length} family summaries`);
      
    } catch (error) {
      console.error('[GlobalFamilyCalendar] Error loading user families:', error);
    }
  };

  const loadConflicts = async () => {
    try {
      const userConflicts = await userCalendarService.getUserCalendarConflicts();
      setConflicts(userConflicts);
    } catch (error) {
      console.error('[GlobalFamilyCalendar] Error loading conflicts:', error);
    }
  };

  // Convert events to calendar format
  const calendarEvents = useMemo(() => {
    if (!globalCalendar?.allEvents) return [];
    
    return globalCalendar.allEvents
      .filter(event => {
        // Filter by selected families
        if (viewMode.type === 'family' && event.familyId !== viewMode.familyId) {
          return false;
        }
        
        // Apply filters
        if (filters.familyIds.length > 0 && !filters.familyIds.includes(event.familyId)) {
          return false;
        }
        
        if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.eventType)) {
          return false;
        }
        
        if (filters.priorities.length > 0 && !filters.priorities.includes(event.priority)) {
          return false;
        }
        
        if (!filters.showPastEvents && new Date(event.endTime) < new Date()) {
          return false;
        }
        
        if (!filters.showPrivateEvents && event.isPrivate) {
          return false;
        }
        
        if (filters.searchQuery && !event.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && 
            !event.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
          return false;
        }
        
        return true;
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        allDay: event.isAllDay,
        resource: event
      }));
  }, [globalCalendar?.allEvents, viewMode, filters]);

  // Statistics
  const calendarStats = useMemo(() => {
    const filteredEvents = calendarEvents.map(e => e.resource);
    const totalEvents = filteredEvents.length;
    const upcomingEvents = filteredEvents.filter(event => 
      new Date(event.startTime) > new Date()
    ).length;
    const todayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startTime).toDateString();
      const today = new Date().toDateString();
      return eventDate === today;
    }).length;
    const conflictEvents = conflicts.length;
    
    return {
      total: totalEvents,
      upcoming: upcomingEvents,
      today: todayEvents,
      conflicts: conflictEvents
    };
  }, [calendarEvents, conflicts]);

  const initializeSignalR = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const newConnection = new HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}/hubs/calendar`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Connection event handlers
      newConnection.onreconnecting(() => {
        console.log('[GlobalFamilyCalendar] SignalR reconnecting...');
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
      });

      newConnection.onreconnected(() => {
        console.log('[GlobalFamilyCalendar] SignalR reconnected');
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          lastUpdate: new Date(),
          reconnectAttempts: 0
        }));
        // Reload data after reconnection
        loadGlobalCalendar();
        loadConflicts();
      });

      newConnection.onclose(() => {
        console.log('[GlobalFamilyCalendar] SignalR connection closed');
        setConnectionState(prev => ({
          ...prev,
          isConnected: false
        }));
      });

      // Event handlers
      newConnection.on('EventCreated', (event: FamilyCalendarEventWithFamilyDTO) => {
        console.log('[GlobalFamilyCalendar] Event created via SignalR:', event);
        setConnectionState(prev => ({ ...prev, lastUpdate: new Date() }));
        loadGlobalCalendar(); // Reload to get updated data
      });

      newConnection.on('EventUpdated', (event: FamilyCalendarEventWithFamilyDTO) => {
        console.log('[GlobalFamilyCalendar] Event updated via SignalR:', event);
        setConnectionState(prev => ({ ...prev, lastUpdate: new Date() }));
        loadGlobalCalendar(); // Reload to get updated data
      });

      newConnection.on('EventDeleted', (eventId: number, familyId: number) => {
        console.log('[GlobalFamilyCalendar] Event deleted via SignalR:', { eventId, familyId });
        setConnectionState(prev => ({ ...prev, lastUpdate: new Date() }));
        loadGlobalCalendar(); // Reload to get updated data
      });

      newConnection.on('ConflictDetected', (conflict: CalendarConflictDTO) => {
        console.log('[GlobalFamilyCalendar] Conflict detected via SignalR:', conflict);
        loadConflicts(); // Reload conflicts
      });

      newConnection.on('ConflictResolved', (conflictId: number) => {
        console.log('[GlobalFamilyCalendar] Conflict resolved via SignalR:', conflictId);
        loadConflicts(); // Reload conflicts
      });

      // Start connection
      await newConnection.start();
      console.log('[GlobalFamilyCalendar] SignalR connected');
      
      setConnection(newConnection);
      setConnectionState({
        isConnected: true,
        lastUpdate: new Date(),
        reconnectAttempts: 0
      });

    } catch (error) {
      console.error('[GlobalFamilyCalendar] SignalR connection error:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false
      }));
    }
  };

  // Cleanup SignalR on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  // Event handlers
  const handleEventCreated = useCallback(async (event: any) => {
    console.log('[GlobalFamilyCalendar] Event created:', event);
    await loadGlobalCalendar();
    await loadConflicts();
    setModalState({ isOpen: false, mode: 'create' });
  }, []);

  const handleEventUpdated = useCallback(async (event: any) => {
    console.log('[GlobalFamilyCalendar] Event updated:', event);
    await loadGlobalCalendar(); 
    await loadConflicts();
    setModalState({ isOpen: false, mode: 'edit' });
  }, []);

  const handleEventDeleted = useCallback(async (eventId: number) => {
    console.log('[GlobalFamilyCalendar] Event deleted:', eventId);
    await loadGlobalCalendar();
    await loadConflicts();
    setModalState({ isOpen: false, mode: 'view' });
  }, []);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setCurrentView(newView);
  };

  const handleSelectEvent = (event: Event) => {
    const eventData = globalCalendar?.allEvents.find(e => e.id === (event.resource as FamilyCalendarEventWithFamilyDTO).id);
    if (eventData) {
      setModalState({
        isOpen: true,
        mode: 'view',
        event: eventData
      });
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setModalState({
      isOpen: true,
      mode: 'create',
      selectedDate: start
    });
  };

  const eventStyleGetter = (event: any) => {
    const eventData = event.resource as FamilyCalendarEventWithFamilyDTO;
    const familyColor = eventData.familyColor || '#3b82f6';
    
    let backgroundColor = familyColor;
    let borderColor = familyColor;
    
    // Priority-based styling
    if (eventData.priority === 'High') {
      borderColor = '#ef4444';
    } else if (eventData.priority === 'Low') {
      backgroundColor = `${familyColor}80`; // 50% opacity
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: `2px solid ${borderColor}`,
        opacity: eventData.isPrivate ? 0.7 : 1
      }
    };
  };

  const getUniqueEventTypes = () => {
    return [...new Set(globalCalendar?.allEvents.map(e => e.eventType) || [])];
  };

  const getUniquePriorities = () => {
    return [...new Set(globalCalendar?.allEvents.map(e => e.priority) || [])];
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in Required</h3>
            <p className="text-gray-600">Please sign in to view your family calendar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Loading Calendar</h3>
              <p className="text-gray-600">Getting your family events...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Calendar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadGlobalCalendar} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden p-6">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  {viewMode.type === 'global' ? 'Global Family Calendar' : 
                   `${userFamilies.find(f => f.familyId === viewMode.familyId)?.familyName || 'Family'} Calendar`}
                </h1>
                <p className="text-gray-600 mt-1">
                  {viewMode.type === 'global' ? 
                    'Coordinate schedules across all your families' : 
                    'Manage and view family events'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={loadGlobalCalendar} 
                  variant="outline" 
                  size="sm"
                  className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                <Button 
                  onClick={() => setModalState({ isOpen: true, mode: 'create' })}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                <CalendarIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold mb-1">{calendarStats.total}</div>
              <div className="text-white/80 text-sm">Total Events</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold mb-1">{calendarStats.today}</div>
              <div className="text-white/80 text-sm">Today</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold mb-1">{calendarStats.upcoming}</div>
              <div className="text-white/80 text-sm">Upcoming</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold mb-1 text-white">{calendarStats.conflicts}</div>
              <div className="text-white/80 text-sm">Conflicts</div>
            </div>
          </div>
        </div>

        {/* Family Information Cards (Global View) */}
        {viewMode.type === 'global' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userFamilies.map(family => (
              <Card 
                key={family.familyId} 
                className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden"
                onClick={() => setViewMode({ type: 'family', familyId: family.familyId })}
              >
                {/* Decorative elements */}
                <div className="absolute -top-5 -right-5 w-20 h-20 opacity-[0.05] rounded-full blur-2xl"
                     style={{ backgroundColor: family.familyColor }}></div>
                <div className="absolute -bottom-5 -left-5 w-20 h-20 opacity-[0.03] rounded-full blur-2xl"
                     style={{ backgroundColor: family.familyColor }}></div>
                
                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
                     style={{ backgroundColor: family.familyColor }}></div>
                
                <CardContent className="pt-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: family.familyColor }}
                      />
                      <h3 className="font-semibold">{family.familyName}</h3>
                    </div>
                    <Badge variant="outline">{family.userRole}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-1 font-medium">{family.totalEvents}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Upcoming:</span>
                      <span className="ml-1 font-medium">{family.upcomingEvents}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Today:</span>
                      <span className="ml-1 font-medium">{family.todayEvents}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-1 font-medium">{family.userCreatedEvents}</span>
                    </div>
                  </div>
                  
                  {family.nextEventDate && (
                    <div className="mt-2 text-xs text-gray-500">
                      Next: {moment(family.nextEventDate).format('MMM D, YYYY')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600 opacity-[0.05] rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b relative z-10">
            <CardTitle className="text-lg font-medium flex items-center text-gray-800">
              <Filter className="h-5 w-5 mr-2 text-indigo-600" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search">Search Events</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search events..."
                    className="pl-10"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Family Filter */}
              {userFamilies.length > 1 && viewMode.type === 'global' && (
                <div>
                  <Label>Families</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {userFamilies.map(family => (
                      <div key={family.familyId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`family-${family.familyId}`}
                          checked={filters.familyIds.includes(family.familyId)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              familyIds: checked 
                                ? [...prev.familyIds, family.familyId]
                                : prev.familyIds.filter(id => id !== family.familyId)
                            }));
                          }}
                        />
                        <label 
                          htmlFor={`family-${family.familyId}`}
                          className="text-sm flex items-center space-x-1 cursor-pointer"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: family.familyColor }}
                          />
                          <span>{family.familyName}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Event Type Filter */}
              <div>
                <Label>Event Types</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {getUniqueEventTypes().map(eventType => (
                    <div key={eventType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${eventType}`}
                        checked={filters.eventTypes.includes(eventType)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            eventTypes: checked 
                              ? [...prev.eventTypes, eventType]
                              : prev.eventTypes.filter(type => type !== eventType)
                          }));
                        }}
                      />
                      <label htmlFor={`type-${eventType}`} className="text-sm cursor-pointer">
                        {eventType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Priority Filter */}
              <div>
                <Label>Priorities</Label>
                <div className="space-y-2">
                  {getUniquePriorities().map(priority => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priorities.includes(priority)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            priorities: checked 
                              ? [...prev.priorities, priority]
                              : prev.priorities.filter(p => p !== priority)
                          }));
                        }}
                      />
                      <label htmlFor={`priority-${priority}`} className="text-sm cursor-pointer">
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Toggle Options */}
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-past"
                  checked={filters.showPastEvents}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showPastEvents: checked }))}
                />
                <Label htmlFor="show-past" className="text-sm">Show Past Events</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-private"
                  checked={filters.showPrivateEvents}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showPrivateEvents: checked }))}
                />
                <Label htmlFor="show-private" className="text-sm">Show Private Events</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        {userFamilies.length > 1 && (
          <div className="flex items-center space-x-4">
            <Button
              variant={viewMode.type === 'global' ? 'default' : 'outline'}
              onClick={() => setViewMode({ type: 'global' })}
              size="sm"
              className={viewMode.type === 'global' 
                ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                : "bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-300"
              }
            >
              <Users className="h-4 w-4 mr-2" />
              All Families
            </Button>
            
            <Select 
              value={viewMode.type === 'family' ? viewMode.familyId?.toString() : ''} 
              onValueChange={(value) => setViewMode({ type: 'family', familyId: parseInt(value) })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select family..." />
              </SelectTrigger>
              <SelectContent>
                {userFamilies.map(family => (
                  <SelectItem key={family.familyId} value={family.familyId.toString()}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: family.familyColor }}
                      />
                      <span>{family.familyName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Calendar */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          <CardContent className="pt-6 relative z-10">
            <div style={{ height: isModal ? '400px' : '600px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                date={currentDate}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view={currentView}
                onView={handleViewChange}
                eventPropGetter={eventStyleGetter}
                components={{
                  event: ({ event }: { event: any }) => (
                    <div className="p-1">
                      <div className="font-medium text-sm">{event.title}</div>
                      {event.resource.location && (
                        <div className="text-xs opacity-75">📍 {event.resource.location}</div>
                      )}
                      {event.resource.isPrivate && (
                        <div className="text-xs opacity-75">🔒 Private</div>
                      )}
                    </div>
                  )
                }}
                formats={{
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }) => 
                    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Event Details */}
        {modalState.mode === 'view' && modalState.event && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Event Details</span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModalState(prev => ({ ...prev, mode: 'edit' }))}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModalState({ isOpen: false, mode: 'view' })}
                  >
                    Close
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="text-lg font-semibold">{modalState.event.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Family</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: modalState.event.familyColor }}
                    />
                    <span>{modalState.event.family.name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time</label>
                  <p>
                    {modalState.event.isAllDay ? (
                      moment(modalState.event.startTime).format('MMMM D, YYYY') + ' (All day)'
                    ) : (
                      `${moment(modalState.event.startTime).format('MMMM D, YYYY HH:mm')} - ${moment(modalState.event.endTime).format('HH:mm')}`
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type & Priority</label>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{modalState.event.eventType}</Badge>
                    <Badge variant={modalState.event.priority === 'High' ? 'destructive' : 'secondary'}>
                      {modalState.event.priority}
                    </Badge>
                  </div>
                </div>
                {modalState.event.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-700">{modalState.event.description}</p>
                  </div>
                )}
                {modalState.event.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-gray-700">{modalState.event.location}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Attendees</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modalState.event.attendees.map((attendee: any) => (
                      <Badge key={attendee.id} variant="secondary">
                        {attendee.familyMember?.name || `Member ${attendee.familyMemberId}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex justify-between items-center">
                <div>
                  <strong>{conflicts.length} calendar conflict(s) detected.</strong>
                  <p className="text-sm mt-1">
                    You have overlapping events that need attention.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadConflicts}>
                  View Details
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Event Management Modal */}
        <EventManagementModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, mode: 'create' })}
          mode={modalState.mode}
          event={modalState.event}
          selectedDate={modalState.selectedDate}
          selectedFamilyId={viewMode.type === 'family' ? viewMode.familyId : undefined}
          userFamilies={userFamilies}
          onEventCreated={handleEventCreated}
          onEventUpdated={handleEventUpdated}
          onEventDeleted={handleEventDeleted}
        />
      </div>
    </div>
  );
} 