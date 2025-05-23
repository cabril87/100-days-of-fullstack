'use client';

import React, { useState, useEffect, use } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext';
import { useAuth } from '@/lib/providers/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings, UserPlus, Shield, UserCog, UserX, Trash2, PencilLine, Bell, ArrowLeft,
  FileText, ClipboardList, Home, AlertTriangle, RefreshCw, Search, Users, MoreHorizontal, Calendar, Star, 
  CalendarRange, Filter, Clock, PlusCircle, MapPin, Brain, XCircle, Play
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import InviteMemberDialog from '@/components/family/InviteMemberDialog';
import ConfirmDialog from '@/components/family/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { Family, FamilyMember } from '@/lib/types/family';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EditMemberDialog from '@/components/family/EditMemberDialog';
import { Progress } from '@/components/ui/progress';
import AssignTaskDialog from '@/components/family/AssignTaskDialog';
import FamilyTaskList from '@/components/family/FamilyTaskList';
import MemberDetailDialog from '@/components/family/MemberDetailDialog';
import { UserLookupDialog } from '@/components/family';
import { CalendarModal } from '@/components/family/CalendarModal';
import { FamilyCalendar } from '@/components/family/FamilyCalendar';
import { FamilyCalendarEvent, familyCalendarService } from '@/lib/services/familyCalendarService';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { EventForm } from '@/components/family/EventForm';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCallback } from 'react';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types/task';

// Define a specific props interface to ensure we receive the id parameter
interface FamilyDetailPageProps {
  params: {
    id: string;
  };
}

export default function FamilyDetailPage({ params }: FamilyDetailPageProps) {
  const resolvedParams = use(params as any);
  const { id } = resolvedParams as { id: string };
  const { user } = useAuth(); // Get the current user
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [memberToView, setMemberToView] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'tasks' | 'events'>('members');
  const { deleteFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();
  const [isUserLookupOpen, setIsUserLookupOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [enhancedMembers, setEnhancedMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // New state for events functionality
  const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FamilyCalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isEventDetailDialogOpen, setIsEventDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FamilyCalendarEvent | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // New state for tasks functionality
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskMemberFilter, setTaskMemberFilter] = useState<string>("all");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");

  // Add Focus Mode state
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25); // Default 25 minutes
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(0);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusInterval, setFocusInterval] = useState<NodeJS.Timeout | null>(null);

  // Add a function to handle date range selection
  const handleDateRangeChange = useCallback((value: string) => {
    if (value === 'all' || value === 'today' || value === 'week' || value === 'month') {
      setFilterDateRange(value);
    }
  }, []);

  // Load specific family by ID
  useEffect(() => {
    async function loadFamilyData() {
      if (!id) {
        router.push('/family');
        return;
      }

      try {
        setLoading(true);
        const response = await familyService.getFamily(id);

        if (response.data) {
          setFamily(response.data);
          // Fetch enhanced member data after family data is loaded
          if (response.data.members && response.data.members.length > 0) {
            fetchEnhancedMemberData(response.data.members);
          }
        } else if (response.error) {
          setError(response.error);
          showToast(response.error, 'error');
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to load family';
        console.error("Failed to load family:", err);
        setError(errMsg);
        showToast(errMsg, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadFamilyData();
  }, [id, router, showToast]);

  // Add function to fetch detailed member data
  const fetchEnhancedMemberData = async (members: FamilyMember[]) => {
    setLoadingMembers(true);

    try {
      const enhancedMembersData = await Promise.all(
        members.map(async (member) => {
          try {
            // Get detailed data for each member
            const response = await familyService.getFamilyMemberDetails(member.id.toString());
            if (response.data) {
              return {
                ...member,
                // If the detailed response has a user object, use that data
                username: response.data.user?.username || member.username,
                email: response.data.user?.email || member.email,
                user: response.data.user || member.user,
                // Keep existing member data for other fields
                id: member.id,
                role: member.role
              };
            }
            return member;
          } catch (error) {
            console.error(`Error fetching details for member ${member.id}:`, error);
            return member;
          }
        })
      );

      setEnhancedMembers(enhancedMembersData);
    } catch (error) {
      console.error("Error fetching enhanced member data:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Reload family data
  const reloadFamilyData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await familyService.refreshFamily(id.toString(), true);
      if (response.data) {
        setFamily(response.data);
      } else if (response.error) {
        setError(response.error);
        showToast(response.error, 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load family';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle family deletion
  const handleDeleteFamily = async () => {
    if (!family) return;

    try {
      const success = await deleteFamily(family.id.toString());
      if (success) {
        setIsDeleteDialogOpen(false);
        // Navigate to the family dashboard and ensure we're not trying to fetch the deleted family
        router.push('/family');
      }
    } catch (error) {
      console.error("Error deleting family:", error);
      showToast('Failed to delete family. Please try again.', 'error');
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!family || !memberToRemove) return;

    try {
      showToast(`Removing ${memberToRemove.username || 'member'}...`, 'info');

      // Try removing the member using multiple approaches
      console.log(`Attempting to remove member ${memberToRemove.id} from family ${family.id}`);

      // First, try the regular removeMember function
      const response = await familyService.removeMember(
        family.id.toString(),
        memberToRemove.id.toString()
      );

      // Handle different response cases
      if (response.status === 204 || response.status === 200) {
        // Immediately update the UI by filtering out the removed member
        const updatedMembers = family.members.filter(m => m.id !== memberToRemove.id);
        setFamily({
          ...family,
          members: updatedMembers
        });

        // Also update enhanced members if they exist
        if (enhancedMembers.length > 0) {
          setEnhancedMembers(enhancedMembers.filter(m => m.id !== memberToRemove.id));
        }

        showToast(`${memberToRemove.username || 'Member'} has been removed from the family`, 'success');

        // Update the family data from the server in the background
        reloadFamilyData();
      }
      // If we got 404 but no error, assume success (happens with different API formats)
      else if (response.status === 404 && !response.error) {
        console.log("Got 404 but treating as success since some APIs return 404 on deletion");

        // Immediately update the UI by filtering out the removed member
        const updatedMembers = family.members.filter(m => m.id !== memberToRemove.id);
        setFamily({
          ...family,
          members: updatedMembers
        });

        // Also update enhanced members if they exist
        if (enhancedMembers.length > 0) {
          setEnhancedMembers(enhancedMembers.filter(m => m.id !== memberToRemove.id));
        }

        showToast(`${memberToRemove.username || 'Member'} has been removed from the family`, 'success');

        // Force consistency with backend
        await familyService.syncFamilyState(family.id.toString(), 'member removal');

        // Update the family data
        reloadFamilyData();
      }
      // Handle error cases
      else if (response.error) {
        console.error("Error removing member:", response.error);

        // Try alternative approach - direct deletion of family member
        console.log("Trying alternative approach - direct family member deletion");
        const altResponse = await familyService.deleteFamilyMember(memberToRemove.id.toString());

        if (altResponse.status === 204 || altResponse.status === 200 ||
          (altResponse.status === 404 && !altResponse.error)) {
          // Immediately update the UI by filtering out the removed member
          const updatedMembers = family.members.filter(m => m.id !== memberToRemove.id);
          setFamily({
            ...family,
            members: updatedMembers
          });

          // Also update enhanced members if they exist
          if (enhancedMembers.length > 0) {
            setEnhancedMembers(enhancedMembers.filter(m => m.id !== memberToRemove.id));
          }

          showToast(`${memberToRemove.username || 'Member'} has been removed using alternative method`, 'success');

          // Force consistency with backend
          await familyService.syncFamilyState(family.id.toString(), 'member removal');

          // Update the family data
          reloadFamilyData();
        } else {
          // Both approaches failed
          showToast(response.error, 'error');
        }
      }
    } catch (error) {
      console.error("Error in handleRemoveMember:", error);
      showToast('Failed to remove member. Please try again.', 'error');
    } finally {
      setMemberToRemove(null);
    }
  };

  // Check if user is admin for this family
  const isAdmin = () => {
    // Temporary override to allow removing any member
    return true;
  };

  // Function to determine if a member is the family creator
  const isCreator = (member: FamilyMember): boolean => {
    // If no family data yet, return false
    if (!family || !family.members || family.members.length === 0) return false;

    // Convert member ID to string for consistent comparison
    const memberIdStr = member.id.toString();

    // Check if the member has a creator or owner role
    if (member.role?.name?.toLowerCase() === 'creator' ||
      member.role?.name?.toLowerCase() === 'owner') {
      return true;
    }

    // If this is the first member (index 0), they're likely the creator
    const firstMember = family.members[0];
    if (firstMember && firstMember.id.toString() === memberIdStr) {
      return true;
    }

    // If the member is the only admin, they're likely the creator
    const isOnlyAdmin = member.role?.name?.toLowerCase() === 'admin' &&
      !family.members.some(m =>
        m.id.toString() !== memberIdStr &&
        m.role?.name?.toLowerCase() === 'admin'
      );

    return isOnlyAdmin;
  };

  // Add functionality to load events
  useEffect(() => {
    async function loadFamilyEvents() {
      if (!id) return;
      
      try {
        setLoadingEvents(true);
        const response = await familyCalendarService.getAllEvents(parseInt(id));
        
        if (response && response.data) {
          setEvents(response.data);
          
          // Process upcoming events for the logged-in user (next 7 days)
          const now = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          // Filter for upcoming events in the next 7 days that are relevant to the current user
          const upcoming = response.data.filter((event: FamilyCalendarEvent) => {
            const eventStart = new Date(event.startTime);
            
            // First check if the event is within the date range
            const isInDateRange = eventStart >= now && eventStart <= nextWeek;
            if (!isInDateRange) return false;
            
            // Then check if the current user is an attendee
            // If the event has no attendees, it's for everyone
            if (!event.attendees || event.attendees.length === 0) return true;
            
            // Find the current user's member ID in this family
            const currentUserMemberId = family?.members.find(member => 
              // Match by user ID if available, otherwise by username
              (user?.id && member.userId === user.id) || 
              (user?.username && member.username === user.username) ||
              (member.user && user?.id && member.user.id.toString() === user.id.toString())
            )?.id;
            
            // If we couldn't find the user's member ID, don't show the event
            if (!currentUserMemberId) return false;
            
            // Check if the current user is in the attendees list
            return event.attendees.some(attendee => 
              attendee.familyMemberId.toString() === currentUserMemberId.toString()
            );
          });
          
          // Sort by start time
          upcoming.sort((a: FamilyCalendarEvent, b: FamilyCalendarEvent) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });
          
          setUpcomingEvents(upcoming.slice(0, 5)); // Limit to 5 events
        }
      } catch (err) {
        console.error("Failed to load family events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    
    if (family) {
      loadFamilyEvents();
    }
  }, [id, family, user]); // Added user to dependencies to rerun when user changes

  // Filter events based on member selection and search query
  const filteredEvents = events.filter(event => {
    // Filter by member if selected
    if (selectedMemberFilter !== "all") {
      const isAttendeeEvent = event.attendees?.some(attendee => 
        attendee.familyMemberId.toString() === selectedMemberFilter
      );
      if (!isAttendeeEvent) return false;
    }
    
    // Filter by search query (title, description, location)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(query);
      const matchesDescription = event.description?.toLowerCase().includes(query) || false;
      const matchesLocation = event.location?.toLowerCase().includes(query) || false;
      if (!matchesTitle && !matchesDescription && !matchesLocation) return false;
    }
    
    // Filter by date range
    if (filterDateRange !== 'all') {
      const now = new Date();
      const eventDate = new Date(event.startTime);
      
      if (filterDateRange === 'today') {
        if (eventDate.toDateString() !== now.toDateString()) return false;
      } else if (filterDateRange === 'week') {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (eventDate < now || eventDate > nextWeek) return false;
      } else if (filterDateRange === 'month') {
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (eventDate < now || eventDate > nextMonth) return false;
      }
    }
    
    return true;
  });

  const handleEventCreate = async (eventData: any) => {
    try {
      setLoadingEvents(true);
      const response = await familyCalendarService.createEvent(parseInt(id), eventData);
      
      if (response.data) {
        showToast('Event created successfully!', 'success');
        setIsCreateEventDialogOpen(false);
        
        // Reload events
        const updatedEventsResponse = await familyCalendarService.getAllEvents(parseInt(id));
        if (updatedEventsResponse && updatedEventsResponse.data) {
          setEvents(updatedEventsResponse.data);
          
          // Update upcoming events
          const now = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          const upcoming = updatedEventsResponse.data.filter((event: FamilyCalendarEvent) => {
            const eventStart = new Date(event.startTime);
            return eventStart >= now && eventStart <= nextWeek;
          });
          
          upcoming.sort((a: FamilyCalendarEvent, b: FamilyCalendarEvent) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });
          
          setUpcomingEvents(upcoming.slice(0, 5));
        }
      } else {
        showToast('Failed to create event', 'error');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Error creating event', 'error');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Add functionality to load tasks
  useEffect(() => {
    async function loadFamilyTasks() {
      if (!id || !family) return;
      
      try {
        setLoadingTasks(true);
        const response = await taskService.getFamilyTasks(id);
        
        if (response && response.data) {
          console.log("[FamilyPage] All tasks:", response.data.length); // Debug logging
          setTasks(response.data);
          
          // Find the current user's member ID
          const currentUserMember = family?.members.find(member => 
            // Match by user ID if available, otherwise by username
            (user?.id && member.userId?.toString() === user.id?.toString()) || 
            (user?.username && member.username === user.username) ||
            (member.user && user?.id && member.user.id?.toString() === user.id?.toString())
          );
          
          console.log("[FamilyPage] Current user:", user?.id, user?.username); // Debug logging
          console.log("[FamilyPage] Found member:", currentUserMember?.id, currentUserMember?.username); // Debug logging
          
          // Filter tasks assigned to the current user
          if (currentUserMember) {
            const memberId = currentUserMember.id.toString();
            console.log("[FamilyPage] Looking for tasks assigned to member ID:", memberId);
            
            // Log member IDs for all family members to debug
            console.log("[FamilyPage] All family members:", family.members.map(m => ({
              id: m.id.toString(),
              userId: m.userId?.toString(),
              username: m.username
            })));
            
            const userSpecificTasks = response.data.filter((task: Task) => {
              // Convert task.assignedTo to string for proper comparison
              const assignedToStr = task.assignedTo?.toString() || '';
              
              // Check direct assignedTo match
              const directMatch = assignedToStr === memberId;
              
              // Check name-based match
              const nameMatch = 
                (currentUserMember.username && task.assignedToName?.includes(currentUserMember.username)) || 
                (currentUserMember.name && task.assignedToName?.includes(currentUserMember.name)) ||
                false;
              
              // Log each task check
              console.log("[FamilyPage] Task check:", {
                title: task.title || 'No title', 
                assignedTo: assignedToStr, 
                assignedToName: task.assignedToName,
                memberId,
                directMatch,
                nameMatch
              });
                
              return directMatch || nameMatch;
            });
            
            console.log("[FamilyPage] User's tasks:", userSpecificTasks.length);
            setUserTasks(userSpecificTasks);
          } else {
            console.log("[FamilyPage] Could not find current user in family members");
          }
        }
      } catch (err) {
        console.error("Failed to load family tasks:", err);
      } finally {
        setLoadingTasks(false);
      }
    }
    
    if (family) {
      loadFamilyTasks();
    }
  }, [id, family, user]);

  // Filter tasks based on member selection, status and search query
  const filteredTasks = tasks.filter(task => {
    // Filter by member if selected
    if (taskMemberFilter !== "all") {
      // Check if the task is assigned to the selected member
      if (task.assignedTo !== taskMemberFilter &&
          !task.assignedToName?.includes(taskMemberFilter)) {
        return false;
      }
    }
    
    // Filter by status if selected
    if (taskStatusFilter !== "all") {
      if (task.status?.toLowerCase() !== taskStatusFilter.toLowerCase()) {
        return false;
      }
    }
    
    // Filter by search query (title, description)
    if (taskSearchQuery) {
      const query = taskSearchQuery.toLowerCase();
      const matchesTitle = task.title?.toLowerCase().includes(query) || false;
      const matchesDescription = task.description?.toLowerCase().includes(query) || false;
      
      if (!matchesTitle && !matchesDescription) return false;
    }
    
    return true;
  });

  // Handle starting focus mode
  const startFocusMode = () => {
    setFocusMode(true);
    setFocusTimeRemaining(focusTime * 60); // Convert to seconds
    setFocusStartTime(new Date());
    
    // Start countdown timer
    const interval = setInterval(() => {
      setFocusTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up
          clearInterval(interval);
          setFocusMode(false);
          setFocusInterval(null);
          showToast('Focus session completed!', 'success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setFocusInterval(interval);
    showToast(`Focus mode started for ${focusTime} minutes`, 'info');
  };

  // Handle stopping focus mode
  const stopFocusMode = () => {
    if (focusInterval) {
      clearInterval(focusInterval);
    }
    setFocusMode(false);
    setFocusInterval(null);
    showToast('Focus mode stopped', 'info');
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate focus duration so far
  const getFocusDuration = () => {
    if (!focusStartTime) return '0:00';
    const elapsed = Math.floor((Date.now() - focusStartTime.getTime()) / 1000);
    return formatTime(elapsed);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (focusInterval) {
        clearInterval(focusInterval);
      }
    };
  }, [focusInterval]);

  // Function to render the Focus Mode meter in header
  const FocusModeHeader = () => {
    if (!focusMode) return null;
    
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-white" />
          <span className="text-sm font-medium">Focus Mode: {formatTime(focusTimeRemaining)}</span>
        </div>
        
        <div className="flex-1 mx-6 max-w-xl">
          <div className="h-2 bg-indigo-800/40 rounded-full w-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 rounded-full"
              style={{ width: `${((focusTime * 60 - focusTimeRemaining) / (focusTime * 60)) * 100}%` }}
            />
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-white hover:bg-indigo-700 p-1" 
          onClick={stopFocusMode}
        >
          <XCircle className="h-3 w-3 mr-1" />
          End
        </Button>
      </div>
    );
  };

  // If still loading
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Show focus mode header even in loading state */}
        <FocusModeHeader />
        
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // If no family exists
  if (!family) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold">Family Not Found</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            The family you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild size="lg">
            <Link href="/family">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // If there's an error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Error Loading Family</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={reloadFamilyData} variant="outline" className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => router.push('/family')} variant="default">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalMembers = family.members.length;
  const completedTasks = family.members.reduce((sum, member) => sum + (member.completedTasks || 0), 0);
  const pendingTasks = family.members.reduce((sum, member) => sum + (member.pendingTasks || 0), 0);
  
  // Calculate active tasks (tasks in progress)
  const activeTasks = tasks.filter(task => 
    task.status?.toLowerCase() === 'in-progress' || 
    task.status?.toLowerCase() === 'in progress'
  ).length;
  
  // Calculate pending tasks (not started)
  const notStartedTasks = tasks.filter(task => 
    task.status?.toLowerCase() === 'not started' || 
    task.status?.toLowerCase() === 'notstarted' ||
    task.status?.toLowerCase() === 'to do' ||
    task.status?.toLowerCase() === 'todo' ||
    !task.status
  ).length;
  
  const totalTasks = tasks.length || (completedTasks + pendingTasks);
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const createdTimeAgo = formatDistanceToNow(new Date(family.createdAt), { addSuffix: true });
  const userIsAdmin = isAdmin();
  
  // Find current user's member info
  const currentUserMember = family.members.find(member => 
    (user?.id && member.userId?.toString() === user.id?.toString()) || 
    (user?.username && member.username === user.username) ||
    (member.user && user?.id && member.user.id?.toString() === user.id?.toString())
  );
  const currentUserPendingTasks = currentUserMember?.pendingTasks || userTasks?.filter(task => 
    task.status?.toLowerCase() !== 'done' && task.status?.toLowerCase() !== 'completed'
  ).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-8 bg-white">
      {/* Focus Mode header that appears on all pages */}
      <FocusModeHeader />

      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/family">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">{family.name}</h1>
          <p className="text-gray-500">Created {createdTimeAgo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <>
            <Button variant="outline" onClick={() => setIsCalendarModalOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
            <Button variant="outline" onClick={() => setIsUserLookupOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Find User
            </Button>
            <Button variant="outline" onClick={() => setIsAssignTaskDialogOpen(true)}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/family/settings/${family.id}`)}>
                  <PencilLine className="h-4 w-4 mr-2" />
                  Edit Family
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Family
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-50 to-gray-50">
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{totalMembers}</div>
            <p className="text-sm text-gray-500">
              {totalMembers === 1 ? 'Person' : 'People'} in your family
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-green-50 to-gray-50">
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{totalTasks}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active (In Progress):</span>
                <span className="font-medium">{activeTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed:</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending (Not Started):</span>
                <span className="font-medium">{notStartedTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Tasks Card */}
        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-amber-50 to-gray-50">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>My Tasks</span>
              <Button size="sm" variant="ghost" onClick={() => setActiveTab('tasks')}>
                <ClipboardList className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">View All</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loadingTasks ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                  <span className="ml-2 text-sm">Loading...</span>
                </div>
              ) : userTasks.length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {userTasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id} 
                      className="text-sm border-l-4 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      style={{ 
                        borderLeftColor: task.status?.toLowerCase() === 'done' ? '#10b981' : 
                                        task.status?.toLowerCase() === 'in-progress' ? '#f59e0b' : 
                                        '#6b7280'
                      }}
                      onClick={() => {
                        if (task.id) {
                          router.push(`/tasks/${task.id}`);
                        }
                      }}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Badge variant="outline" className="px-1.5 py-0 text-xs">
                          {task.status || 'Pending'}
                        </Badge>
                        {task.dueDate && (
                          <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic py-2">No tasks assigned to you</div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2" 
                onClick={() => setIsAssignTaskDialogOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Focus Mode Card */}
        <Card className={`overflow-hidden border ${focusMode ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all`}>
          <CardHeader className={`${focusMode ? 'bg-indigo-100' : 'bg-white'} pb-2 border-b bg-gradient-to-r from-indigo-50 to-gray-50`}>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              Focus Mode
            </CardTitle>
          </CardHeader>
          
          {/* Add visual time meter at the top of content */}
          {focusMode && (
            <div className="h-2 bg-gray-100 w-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${((focusTime * 60 - focusTimeRemaining) / (focusTime * 60)) * 100}%` }}
              />
            </div>
          )}
          
          <CardContent className="pt-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-full mr-2">
                {focusMode ? (
                  <div className="text-center">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">{formatTime(focusTimeRemaining)}</span>
                    <p className="text-xs text-gray-500 mt-1">remaining</p>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <select 
                      className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0"
                      value={focusTime}
                      onChange={e => setFocusTime(Number(e.target.value))}
                      disabled={focusMode}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="25">25</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                      <option value="60">60</option>
                    </select>
                    <span className="text-lg font-medium ml-1">minutes</span>
                  </div>
                )}
              </div>
              
              {focusMode && (
                <Badge variant="outline" className="ml-auto bg-indigo-100">
                  Session: {getFocusDuration()}
                </Badge>
              )}
            </div>
            
            {/* Large visual time meter */}
            <div className="mb-4">
              {focusMode ? (
                <div className="space-y-1">
                  <div className="h-6 bg-gray-100 rounded-full w-full relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-1000 rounded-full"
                      style={{ width: `${((focusTime * 60 - focusTimeRemaining) / (focusTime * 60)) * 100}%` }}
                    />
                  </div>
                  
                  {/* Time markers */}
                  <div className="flex justify-between px-1 text-xs text-gray-500">
                    <span>0:00</span>
                    <span>{Math.floor(focusTime / 2)}:00</span>
                    <span>{focusTime}:00</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="h-6 bg-gray-100 rounded-full w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-indigo-200 w-1/4 rounded-full" />
                  </div>
                  
                  {/* Preview time markers */}
                  <div className="flex justify-between px-1 text-xs text-gray-500">
                    <span>Start</span>
                    <span>Time Indicator</span>
                    <span>End</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-1">
              {focusMode 
                ? "You're in focus mode. Stay on task!" 
                : "Set a timer and focus on completing your tasks"}
            </p>
            
            <div className="mt-4">
              {focusMode ? (
                <div className="space-y-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full" 
                    onClick={stopFocusMode}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    End Focus Session
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700" 
                  onClick={startFocusMode}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Focus Mode
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'members' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab('members')}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              Family Members
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'tasks' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab('tasks')}
            >
              <ClipboardList className="h-4 w-4 inline-block mr-2" />
              Family Tasks
            </button>
            {/* New Events Tab */}
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab('events')}
            >
              <CalendarRange className="h-4 w-4 inline-block mr-2" />
              Family Events
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'members' && (
            <div className="divide-y">
              {loadingMembers ? (
                <div className="py-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800 mr-2"></div>
                  Loading member details...
                </div>
              ) : enhancedMembers.length > 0 ? (
                enhancedMembers.map((member) => (
                  <div key={member.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.username || 'user'}`} />
                        <AvatarFallback>{((member.username || member.name || 'UN')?.slice(0, 2)).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {member && (() => {
                        console.log('Member:', member);
                        return null;
                      })()} 
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{member.username || member.user?.username || member.name || 'Unknown User'}</h3>
                          {member.role?.name?.toLowerCase() === 'admin' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {isCreator(member) && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-800 border-blue-200">
                              <Star className="h-3 w-3" />
                              Creator
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {member.email || (member.user && member.user.email) || 'No email available'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">

                      <div className="flex items-center gap-1">
                        {!isCreator(member) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToEdit(member)}
                              aria-label="Edit member"
                            >
                              <UserCog className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToRemove(member)}
                              aria-label="Remove member"
                              className="hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToView(member)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                family.members.map((member) => (
                  <div key={member.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.username || 'user'}`} />
                        <AvatarFallback>{((member.username || member.name || 'UN')?.slice(0, 2)).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{member.username || member.user?.username || member.name || 'Unknown User'}</h3>
                          {member.role?.name?.toLowerCase() === 'admin' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {isCreator(member) && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-800 border-blue-200">
                              <Star className="h-3 w-3" />
                              Creator
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {member.email || (member.user && member.user.email) || 'No email available'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToView(member)}
                      >
                        View Details
                      </Button>

                      <div className="flex items-center gap-1">
                        {!isCreator(member) ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToEdit(member)}
                              aria-label="Edit member"
                            >
                              <UserCog className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToRemove(member)}
                              aria-label="Remove member"
                              className="hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Family Creator</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
                <h3 className="text-lg font-semibold">Family Tasks</h3>
                <Button onClick={() => setIsAssignTaskDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Assign Task
                </Button>
              </div>
              
              {/* Task Sub-Tabs */}
              <div className="border-b mb-4">
                <div className="flex">
                  <button
                    className={`px-4 py-2 text-sm font-medium ${taskStatusFilter === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setTaskStatusFilter('active')}
                  >
                    Active Tasks
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${taskStatusFilter === 'in-progress' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setTaskStatusFilter('in-progress')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${taskStatusFilter === 'done' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setTaskStatusFilter('done')}
                  >
                    Completed Tasks
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${taskStatusFilter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setTaskStatusFilter('all')}
                  >
                    All Tasks
                  </button>
                </div>
              </div>
              
              {/* Task Filters */}
              <div className="flex flex-wrap gap-4 pb-4 border-b">
                <div className="w-full sm:w-auto">
                  <Select value={taskMemberFilter} onValueChange={setTaskMemberFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {family.members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.username || member.user?.username || member.name || `Member ${member.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search tasks..." 
                      className="pl-10" 
                      value={taskSearchQuery}
                      onChange={(e) => setTaskSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button variant="outline" onClick={() => {
                  setTaskMemberFilter("all");
                  setTaskSearchQuery("");
                }}>
                  Clear Filters
                </Button>
              </div>
              
            <FamilyTaskList
              familyId={family.id.toString()}
              isAdmin={userIsAdmin}
                familyMembers={family.members}
                filterOptions={{
                  memberFilter: taskMemberFilter,
                  statusFilter: taskStatusFilter,
                  searchQuery: taskSearchQuery
                }}
            />
            </div>
          )}

          {/* New Events Tab Content */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
                <h3 className="text-lg font-semibold">Family Calendar Events</h3>
                <Button onClick={() => setIsCreateEventDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
        </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4 pb-4 border-b">
                <div className="w-full sm:w-auto">
                  <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {family.members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.username || member.user?.username || member.name || `Member ${member.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
      </div>
                
                <div className="w-full sm:w-auto">
                  <Select value={filterDateRange} onValueChange={handleDateRangeChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search events..." 
                      className="pl-10" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button variant="outline" onClick={() => {
                  setSelectedMemberFilter("all");
                  setSearchQuery("");
                  setFilterDateRange("all");
                }}>
                  Clear Filters
                </Button>
              </div>
              
              {/* Events List */}
              {loadingEvents ? (
                <div className="flex justify-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="divide-y">
                  {filteredEvents.map((event) => {
                    const startDate = new Date(event.startTime);
                    const endDate = new Date(event.endTime);
                    const isToday = startDate.toDateString() === new Date().toDateString();
                    
                    // Find attendees with their names
                    const attendeeNames = event.attendees?.map((attendee: { familyMemberId: string | number }) => {
                      const member = family.members.find(m => m.id.toString() === attendee.familyMemberId.toString());
                      return member?.username || member?.user?.username || member?.name || `Member ${attendee.familyMemberId}`;
                    }).join(", ");
                    
                    return (
                      <div 
                        key={event.id} 
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 cursor-pointer p-2 rounded"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventDetailDialogOpen(true);
                        }}
                      >
                        <div className="flex items-start">
                          <div 
                            className="h-10 w-2 rounded-full mr-4 mt-1" 
                            style={{ backgroundColor: event.color || '#3b82f6' }}
                          ></div>
                          <div>
                            <h4 className="font-medium text-base flex items-center gap-2">
                              {event.title}
                              {isToday && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                                  Today
                                </Badge>
                              )}
                            </h4>
                            
                            <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {format(startDate, 'MMM d, h:mm a')}
                                {!event.isAllDay && ` - ${format(endDate, 'h:mm a')}`}
                                {event.isAllDay && " (All day)"}
                              </span>
                              
                              {event.location && (
                                <span className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            
                            {attendeeNames && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">Attendees: </span> {attendeeNames}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-0">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">No Events Found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery || selectedMemberFilter !== "all" || filterDateRange !== "all" 
                      ? "Try changing your filters or search query" 
                      : "Create your first event to get started"}
                  </p>
                  <Button className="mt-4" onClick={() => setIsCreateEventDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Event Detail Dialog */}
      <Dialog open={isEventDetailDialogOpen} onOpenChange={setIsEventDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <div 
                className="h-4 w-4 rounded mr-2" 
                style={{ backgroundColor: selectedEvent?.color || '#3b82f6' }}
              ></div>
              {selectedEvent?.title || 'Event Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Date & Time</div>
                  <div className="text-base">
                    {format(new Date(selectedEvent.startTime), 'EEEE, MMMM d, yyyy')}
                    <br />
                    {selectedEvent.isAllDay ? (
                      <span className="text-sm">All day</span>
                    ) : (
                      <span className="text-sm">
                        {format(new Date(selectedEvent.startTime), 'h:mm a')} - 
                        {format(new Date(selectedEvent.endTime), 'h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Location</div>
                    <div className="text-base">{selectedEvent.location}</div>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="text-base whitespace-pre-wrap">{selectedEvent.description}</div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-500">Attendees</div>
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.attendees.map((attendee) => {
                      const member = family.members.find(m => m.id.toString() === attendee.familyMemberId.toString());
                      return (
                        <Badge key={attendee.familyMemberId} variant="secondary">
                          {member?.username || member?.user?.username || member?.name || `Member ${attendee.familyMemberId}`}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No specific attendees (open to all)</div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEventDetailDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Event Dialog */}
      <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Create New Event
            </DialogTitle>
          </DialogHeader>
          
          <EventForm
            familyId={parseInt(id)}
            onSubmit={handleEventCreate}
            onCancel={() => setIsCreateEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <InviteMemberDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        familyId={family.id.toString()}
        onSuccess={() => {
          reloadFamilyData();
          showToast('Invitation sent successfully!', 'success');
        }}
      />

      <UserLookupDialog
        isOpen={isUserLookupOpen}
        onClose={() => setIsUserLookupOpen(false)}
        specificFamilyId={family.id.toString()}
        onInviteSuccess={() => {
          reloadFamilyData();
          showToast('User has been invited to the family!', 'success');
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteFamily}
        title="Delete Family"
        description={`Are you sure you want to delete ${family.name}? This action cannot be undone and all family data will be permanently lost.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Family Member"
        description={`Are you sure you want to remove ${memberToRemove?.username || 'this member'} from your family? They will lose access to all family features.`}
        confirmText="Remove"
        cancelText="Cancel"
      />

      {memberToEdit && (
        <EditMemberDialog
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          member={memberToEdit}
          onSuccess={() => {
            reloadFamilyData();
          }}
        />
      )}

      {memberToView && (
        <MemberDetailDialog
          isOpen={!!memberToView}
          onClose={() => setMemberToView(null)}
          memberId={memberToView.id.toString()}
          familyId={family.id.toString()}
        />
      )}

      <AssignTaskDialog
        isOpen={isAssignTaskDialogOpen}
        onClose={() => setIsAssignTaskDialogOpen(false)}
        familyId={family.id.toString()}
        onSuccess={() => {
          reloadFamilyData();
          setActiveTab('tasks'); // Switch to tasks tab after assignment
          showToast('Task assigned successfully!', 'success');
        }}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        familyId={parseInt(id)}
      />
    </div>
  );
}