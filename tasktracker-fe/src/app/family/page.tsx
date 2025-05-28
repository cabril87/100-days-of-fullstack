'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, PlusCircle, LogIn, CheckCircle, Clock, FileText, Settings, AlertTriangle, RefreshCw, Search, CheckCircle2, CircleDashed, CircleX, Hourglass, Activity, Star, ListChecks, ArrowUpRight, Play, Pause, XCircle, Brain } from 'lucide-react';
import Link from 'next/link';
import { familyService } from '@/lib/services/familyService';
import { Family } from '@/lib/types/family';
import { useToast } from '@/lib/hooks/useToast';
import FamilyCard from '@/components/family/FamilyCard';
import { useRouter, usePathname } from 'next/navigation';
import { taskService } from '@/lib/services/taskService';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatsCard } from '@/components/ui/card';

// Constants for retries
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
// const REFRESH_INTERVAL_MS = 2000; // How often to check for updates

// Helper function to get cached families
const getCachedFamilies = (): Family[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cached = localStorage.getItem('family_dashboard_cache');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading cached families:', error);
  }
  return [];
};

export default function FamilyDashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [cacheKey, setCacheKey] = useState<string>(Date.now().toString());
  const [stats, setStats] = useState<{
    totalMembers: number;
    totalCompletedTasks: number;
    totalPendingTasks: number;
    userPendingTasks: number;
    activeFamilies: number;
    tasksByFamily?: Record<string, unknown[]>;
  }>({
    totalMembers: 0,
    totalCompletedTasks: 0,
    totalPendingTasks: 0,
    userPendingTasks: 0,
    activeFamilies: 0
  });
  const { showToast } = useToast();
  // const router = useRouter();
  const pathname = usePathname();
  
  // Add direct task fetching for more accurate counts
  const [userFamilyTasks, setUserFamilyTasks] = useState<unknown[]>([]);
  const [loadingUserTasks, setLoadingUserTasks] = useState(false);

  // Add Focus Mode state
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25); // Default 25 minutes
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(0);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusInterval, setFocusInterval] = useState<NodeJS.Timeout | null>(null);

  // New function to get current user info more reliably
  const getCurrentUserInfo = () => {
    // Try to get from token first
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    let userId = '';
    let username = localStorage.getItem('username');
    let userEmail = localStorage.getItem('userEmail');
    
    // Try to parse username if it's a JSON string
    if (username && (username.startsWith('{') || username.startsWith('['))) {
      try {
        const parsedUser = JSON.parse(username);
        console.log('[DEBUG] Parsed user from JSON string:', parsedUser);
        
        // Extract information from the parsed object
        if (parsedUser.id) userId = parsedUser.id.toString();
        if (parsedUser.username) username = parsedUser.username;
        if (parsedUser.email) userEmail = parsedUser.email;
      } catch (e) {
        console.error('[DEBUG] Error parsing username JSON:', e);
      }
    }
    
    if (authToken) {
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = userId || payload.sub || payload.id || payload.userId || '';
          
          // Some tokens might store email/username directly
          if (payload.email && !userEmail) userEmail = payload.email;
          if (payload.username && !username) username = payload.username;
        }
      } catch (e) {
        console.error('[DEBUG] Error parsing token:', e);
      }
    }
    
    // If still no user info, try to get from localStorage under different keys
    if (!userId) {
      userId = localStorage.getItem('userId') || localStorage.getItem('user_id') || '';
    }
    
    // Log what we found
    console.log('[DEBUG] Enhanced user identification:', { 
      userId, 
      username, 
      userEmail,
      authToken: authToken ? 'present' : 'missing'
    });
    
    return { userId, username, userEmail };
  };
  
  // Fetch all families with cache busting
  const fetchFamilies = useCallback(async (retry = 0, forceCacheBust = false) => {
    setLoading(true);
    setConnectionError(false);
    
    // Use a local cache key instead of state to avoid infinite loops
    const currentCacheKey = forceCacheBust ? Date.now().toString() : cacheKey;
    
    try {
      console.log(`[DEBUG] Fetching all families for dashboard (cache key: ${currentCacheKey})`);
      
      // Standard API call - no fancy options
      const response = await familyService.getAllFamilies();
      console.log("[DEBUG] Families API response:", response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`[DEBUG] Got ${response.data.length} families from server`);
        
        // Check for recently deleted families that might still appear
        const filteredFamilies = response.data.filter(family => {
          // Check if this family was recently deleted
          const wasRecent = localStorage.getItem(`recently_deleted_family_${family.id}`);
          if (wasRecent) {
            console.log(`[DEBUG] Filtering out recently deleted family: ${family.id}`);
            return false;
          }
          return true;
        });
        
        if (filteredFamilies.length !== response.data.length) {
          console.log(`[DEBUG] Filtered out ${response.data.length - filteredFamilies.length} recently deleted families`);
        }
        
        // Process families data
        setFamilies(filteredFamilies);
        
        // Calculate stats with unique member counting
        const uniqueMembers = new Set();
        let totalCompletedTasks = 0;
        let totalPendingTasks = 0;
        
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(family => {
            if (family.members && Array.isArray(family.members)) {
              family.members.forEach(member => {
                // Use userId as the unique identifier
                if (member.userId) {
                  uniqueMembers.add(member.userId.toString());
                } else if (member.user && member.user.id) {
                  uniqueMembers.add(member.user.id.toString());
                }
                
                // Continue counting tasks
                totalCompletedTasks += (member.completedTasks || 0);
                totalPendingTasks += (member.pendingTasks || 0);
              });
            }
          });
        }
        
        // Set stats with unique member count
        setStats(prevStats => ({
          ...prevStats,
          totalMembers: uniqueMembers.size,
          totalCompletedTasks,
          totalPendingTasks,
          activeFamilies: response.data?.length || 0
        }));
        
        console.log(`[DEBUG] Found ${uniqueMembers.size} unique members across all families`);
        
        // Reset error states
        setConnectionError(false);
        setUsingCachedData(false);
      } else if (response.error) {
        console.error("Error fetching families:", response.error);
        setConnectionError(true);
        
        // Use cached data as fallback
        const cachedFamilies = getCachedFamilies();
        if (cachedFamilies.length > 0) {
          setFamilies(cachedFamilies);
          setUsingCachedData(true);
        }
      }
    } catch (error) {
      console.error("Exception in fetchFamilies:", error);
      setConnectionError(true);
      
      // Use cached data as fallback
      const cachedFamilies = getCachedFamilies();
      if (cachedFamilies.length > 0) {
        setFamilies(cachedFamilies);
        setUsingCachedData(true);
      }
      
      // Auto-retry logic
      if (retry < MAX_RETRIES) {
        setRetryCount(retry + 1);
        setTimeout(() => fetchFamilies(retry + 1), RETRY_DELAY_MS * (retry + 1));
      }
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  }, [showToast]);
  
  // Initial load and polling setup
  useEffect(() => {
    console.log("[DEBUG] Family dashboard mounted - setting up data fetching");
    
    // Always clear the deletion in progress flag when we reach the family dashboard
    if (typeof window !== 'undefined') {
      localStorage.removeItem('family_deletion_in_progress');
    }
    
    // Check if we're coming from a family deletion or check for recently deleted families
    const isComingFromDeletion = 
      localStorage.getItem('family_deletion_timestamp') || 
      Object.keys(localStorage).some(key => key.includes('recently_deleted_family_'));
    
    if (isComingFromDeletion) {
      console.log('[DEBUG] Coming from family deletion, showing loading state immediately');
      setLoading(true);
      
      // Wipe all family-related data from local storage
      try {
        Object.keys(localStorage)
          .filter(key => key.includes('family') && !key.includes('recently_deleted_family_'))
          .forEach(key => localStorage.removeItem(key));
          
        console.log('[DEBUG] Cleared all regular family cache entries after deletion');
      } catch (err) {
        console.warn('[DEBUG] Error clearing family cache:', err);
      }
    }
    
    // Check if we're coming from a family deletion
    const deletionTimestamp = localStorage.getItem('family_deletion_timestamp');
    if (deletionTimestamp) {
      const timeSinceDeletion = Date.now() - parseInt(deletionTimestamp, 10);
      console.log(`[DEBUG] Page loaded after family deletion (${timeSinceDeletion}ms ago)`);
      
      // If the deletion was recent (within 30 seconds), force a reload
      if (timeSinceDeletion < 30000) {
        console.log('[DEBUG] Recent deletion detected, forcing reload of page');
        
        // Remove the deletion timestamp to prevent infinite reload loop
        localStorage.removeItem('family_deletion_timestamp');
        
        // Force a complete reload to ensure fresh data
        window.location.reload();
        return;
      } else {
        // Clear old deletion timestamp
        localStorage.removeItem('family_deletion_timestamp');
      }
    }
    
    // Clear all family-related caches
    try {
      console.log('[DEBUG] Clearing family caches on dashboard mount');
      localStorage.removeItem('family_dashboard_cache');
      
      // Check for recently deleted families
      const deletedFamilyKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('recently_deleted_family_')) {
          deletedFamilyKeys.push(key);
          const familyId = key.replace('recently_deleted_family_', '');
          console.log(`[DEBUG] Found record of recently deleted family: ${familyId}`);
        }
        
        // Also clear other family-related caches
        if (key && key.includes('family')) {
          localStorage.removeItem(key);
        }
      }
      
      // Clear deletion markers after handling them
      deletedFamilyKeys.forEach(key => {
        console.log(`[DEBUG] Removing deletion marker: ${key}`);
        localStorage.removeItem(key);
      });
    } catch (err) {
      console.warn('[DEBUG] Error clearing family cache:', err);
    }
    
    // Initial fetch
    console.log('[DEBUG] Starting initial families fetch');
    
    // Create a local version of fetchFamilies to avoid dependency issues
    const localFetchFamilies = async (retry = 0, forceCacheBust = false) => {
      setLoading(true);
      setConnectionError(false);
      
      // Use a local cache key instead of state to avoid infinite loops
      const currentCacheKey = forceCacheBust ? Date.now().toString() : cacheKey;
      
      try {
        console.log(`[DEBUG] Fetching all families for dashboard (cache key: ${currentCacheKey})`);
        
        // Standard API call - no fancy options
        const response = await familyService.getAllFamilies();
        console.log("[DEBUG] Families API response:", response);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`[DEBUG] Got ${response.data.length} families from server`);
          
          // Check for recently deleted families that might still appear
          const filteredFamilies = response.data.filter(family => {
            // Check if this family was recently deleted
            const wasRecent = localStorage.getItem(`recently_deleted_family_${family.id}`);
            if (wasRecent) {
              console.log(`[DEBUG] Filtering out recently deleted family: ${family.id}`);
              return false;
            }
            return true;
          });
          
          if (filteredFamilies.length !== response.data.length) {
            console.log(`[DEBUG] Filtered out ${response.data.length - filteredFamilies.length} recently deleted families`);
          }
          
          // Process families data
          setFamilies(filteredFamilies);
          
          // Calculate stats with unique member counting
          const uniqueMembers = new Set();
          let totalCompletedTasks = 0;
          let totalPendingTasks = 0;
          
          if (response.data && Array.isArray(response.data)) {
            response.data.forEach(family => {
              if (family.members && Array.isArray(family.members)) {
                family.members.forEach(member => {
                  // Use userId as the unique identifier
                  if (member.userId) {
                    uniqueMembers.add(member.userId.toString());
                  } else if (member.user && member.user.id) {
                    uniqueMembers.add(member.user.id.toString());
                  }
                  
                  // Continue counting tasks
                  totalCompletedTasks += (member.completedTasks || 0);
                  totalPendingTasks += (member.pendingTasks || 0);
                });
              }
            });
          }
          
          // Set stats with unique member count
          setStats(prevStats => ({
            ...prevStats,
            totalMembers: uniqueMembers.size,
            totalCompletedTasks,
            totalPendingTasks,
            activeFamilies: response.data?.length || 0
          }));
          
          console.log(`[DEBUG] Found ${uniqueMembers.size} unique members across all families`);
          
          // Reset error states
          setConnectionError(false);
          setUsingCachedData(false);
        } else if (response.error) {
          console.error("Error fetching families:", response.error);
          setConnectionError(true);
          
          // Use cached data as fallback
          const cachedFamilies = getCachedFamilies();
          if (cachedFamilies.length > 0) {
            setFamilies(cachedFamilies);
            setUsingCachedData(true);
          }
        }
      } catch (error) {
        console.error("Exception in fetchFamilies:", error);
        setConnectionError(true);
        
        // Use cached data as fallback
        const cachedFamilies = getCachedFamilies();
        if (cachedFamilies.length > 0) {
          setFamilies(cachedFamilies);
          setUsingCachedData(true);
        }
        
        // Auto-retry logic
        if (retry < MAX_RETRIES) {
          setRetryCount(retry + 1);
          setTimeout(() => localFetchFamilies(retry + 1), RETRY_DELAY_MS * (retry + 1));
        }
      } finally {
        setLoading(false);
        setLastRefresh(Date.now());
      }
    };
    
    localFetchFamilies(0, true);
    
    // Set up polling to check for updates
    // This helps when families are created/deleted in other tabs or after redirection
    const pollInterval = setInterval(() => {
      console.log("[DEBUG] Polling for family updates...");
      localFetchFamilies(0, true);
    }, 3000); // Poll every 3 seconds
    
    // Stop polling after 15 seconds to conserve resources
    const stopPollingTimeout = setTimeout(() => {
      clearInterval(pollInterval);
      console.log("[DEBUG] Stopped polling for family updates");
    }, 15000);
    
    return () => {
      clearInterval(pollInterval);
      clearTimeout(stopPollingTimeout);
    };
  }, [pathname]); // Re-run when pathname changes
  
  // Force refresh handler
  const handleForceRefresh = () => {
    fetchFamilies(0, true);
    showToast('Refreshing family data...', 'info');
  };

  // Calculate last refresh time display
  const getLastRefreshDisplay = () => {
    const elapsed = Date.now() - lastRefresh;
    if (elapsed < 60000) {
      return 'just now';
    } else if (elapsed < 3600000) {
      return `${Math.floor(elapsed / 60000)} min ago`;
    } else {
      return `${Math.floor(elapsed / 3600000)} hr ago`;
    }
  };

  // Calculate task stats, making sure to include "not started" tasks and "in-progress" tasks
  const calculateUserTaskStats = (families: Family[]) => {
    let totalPending = 0;
    let familyStats: Array<{
      familyId: string | number;
      familyName: string;
      pendingTasks: number;
      hasMembership: boolean;
      totalMembers: number;
    }> = [];
    
    // Get user info for matching
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    let userId = '';
    if (authToken) {
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = payload.sub || payload.id || payload.userId || '';
        }
      } catch (e) {}
    }
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    
    // Log user identification info for debugging
    console.log('[DEBUG] User identification:', { userId, username, userEmail });
    
    // Process each family
    families.forEach((family: Family) => {
      // Find the current user in this family
      const currentMember = family.members?.find((member: any) => {
        // Match by various identifiers
        return (
          (userId && member.userId && member.userId.toString() === userId) || 
          (username && member.username === username) ||
          (userEmail && member.email === userEmail) ||
          (member.user && 
            ((userId && member.user.id?.toString() === userId) || 
             (username && member.user.username === username) || 
             (userEmail && member.user.email === userEmail)))
        );
      });
      
      // Count active and not-started tasks for this user in this family
      // Note: pendingTasks should include both not-started and in-progress tasks
      const pendingCount = currentMember?.pendingTasks || 0;
      totalPending += pendingCount;
      
      // Add family stats with user info
      familyStats.push({
        familyId: family.id,
        familyName: family.name,
        pendingTasks: pendingCount,
        hasMembership: !!currentMember,
        totalMembers: family.members?.length || 0
      });
      
      // Log for debugging
      if (currentMember) {
        console.log(`[DEBUG] Found user in family ${family.name} with ${pendingCount} pending tasks`);
      }
    });
    
    return { totalPending, familyStats };
  };

  // Add to existing fetch families function
  const updateTaskStats = () => {
    const { totalPending, familyStats } = calculateUserTaskStats(families);
    
    // Update stats state with the calculated values
    setStats(prevStats => ({
      ...prevStats,
      userPendingTasks: totalPending,
      familyTaskStats: familyStats
    }));
    
    console.log(`[DEBUG] Updated user pending tasks: ${totalPending}`);
  };
  
  // Update the fetchUserAssignedTasks function
  const fetchUserAssignedTasks = useCallback(async () => {
    if (!families.length) return;
    
    setLoadingUserTasks(true);
    
    try {
      console.log(`[DEBUG] Fetching tasks for ${families.length} families`);
      
      // Get current user info once
      const { userId, username, userEmail } = getCurrentUserInfo();
      
      // First, identify the user's membership in each family
      // This helps us understand which family member record corresponds to the current user
      const userMembershipsByFamily: Record<string | number, any> = {};
      families.forEach(family => {
        const userMembership = family.members?.find(member => {
          const matchesId = userId && member.userId && member.userId.toString() === userId;
          const matchesUsername = username && member.username && 
            member.username.toLowerCase() === username.toLowerCase();
          const matchesEmail = userEmail && member.email && 
            member.email.toLowerCase() === userEmail.toLowerCase();
          
          // Check user object too
          const matchesUserObject = member.user && (
            (userId && member.user.id?.toString() === userId) ||
            (username && member.user.username?.toLowerCase() === username?.toLowerCase()) ||
            (userEmail && member.user.email?.toLowerCase() === userEmail?.toLowerCase())
          );
          
          return matchesId || matchesUsername || matchesEmail || matchesUserObject;
        });
        
        if (userMembership) {
          console.log(`[DEBUG] Found user membership in family ${family.name}:`, {
            memberId: userMembership.id,
            userId: userMembership.userId,
            username: userMembership.username,
            pendingTasks: userMembership.pendingTasks
          });
          userMembershipsByFamily[family.id] = userMembership;
        } else {
          console.log(`[DEBUG] No membership found for user in family ${family.name}`);
        }
      });
      
      // Get tasks for each family the user is a member of
      const allFamilyTasks = await Promise.all(
        families.map(async (family) => {
          try {
            // Get all tasks for this family
            const response = await taskService.getFamilyTasks(family.id.toString());
            
            if (response.data && Array.isArray(response.data)) {
              console.log(`[DEBUG] Found ${response.data.length} tasks in family ${family.name}`);
              console.log('[DEBUG] Raw tasks data:', JSON.stringify(response.data).substring(0, 300) + '...');
              
              // Get user's family membership
              const userMembership = userMembershipsByFamily[family.id];
              
              // Filter for tasks assigned to current user
              const userTasks = response.data.filter(task => {
                // Handle task as a generic object since it may have additional fields
                const taskObj = task as any;

                // More detailed logging of each task
                console.log(`[DEBUG] Examining task: "${taskObj.title}" - assigned to: ${taskObj.assignedToName || 'unassigned'} (id: ${taskObj.assignedTo || 'none'}, familyMemberId: ${taskObj.assignedToFamilyMemberId || 'none'})`);
                
                // Check if this task is assigned to the current user
                let isAssignedToUser = false;
                
                // Direct ID match
                if (userId && taskObj.assignedTo && taskObj.assignedTo.toString() === userId) {
                  isAssignedToUser = true;
                  console.log(`[DEBUG] Task matches user ID: ${userId}`);
                }
                
                // IMPORTANT: Check assignedToFamilyMemberId first - this is how family tasks are assigned
                if (!isAssignedToUser && userMembership && taskObj.assignedToFamilyMemberId && 
                    taskObj.assignedToFamilyMemberId.toString() === userMembership.id.toString()) {
                  isAssignedToUser = true;
                  console.log(`[DEBUG] Task matches user's family member ID via assignedToFamilyMemberId: ${userMembership.id}`);
                }
                
                // Regular assignedTo check
                if (!isAssignedToUser && userMembership && taskObj.assignedTo && 
                    taskObj.assignedTo.toString() === userMembership.id.toString()) {
                  isAssignedToUser = true;
                  console.log(`[DEBUG] Task matches user's family member ID via assignedTo: ${userMembership.id}`);
                }
                
                // By name - more flexible matching
                if (!isAssignedToUser && username && taskObj.assignedToName && 
                    taskObj.assignedToName.toLowerCase().includes(username.toLowerCase())) {
                  isAssignedToUser = true;
                  console.log(`[DEBUG] Task matches username: ${username}`);
                }
                
                // By email - more flexible matching
                if (!isAssignedToUser && userEmail && taskObj.assignedToName && 
                    taskObj.assignedToName.toLowerCase().includes(userEmail.toLowerCase())) {
                  isAssignedToUser = true;
                  console.log(`[DEBUG] Task matches email: ${userEmail}`);
                }
                
                // Check if task is active (not-started or in-progress)
                const isActive = 
                  !taskObj.status || 
                  taskObj.status.toLowerCase() === 'notstarted' ||
                  taskObj.status.toLowerCase() === 'not started' || 
                  taskObj.status.toLowerCase() === 'todo' ||
                  taskObj.status.toLowerCase() === 'to do' ||
                  taskObj.status.toLowerCase() === 'in-progress' ||
                  taskObj.status.toLowerCase() === 'in progress';
                
                // For debugging
                if (isAssignedToUser) {
                  console.log(`[DEBUG] Task "${taskObj.title}" IS assigned to current user (${taskObj.assignedToName})`);
                }
                
                if (!isAssignedToUser) {
                  console.log(`[DEBUG] Task "${taskObj.title}" is NOT assigned to current user`);
                }
                
                // Fall back to checking if userId matches creator if assignedTo is empty
                if (!isAssignedToUser && !taskObj.assignedTo && !taskObj.assignedToFamilyMemberId &&
                    taskObj.createdBy && userId && taskObj.createdBy.toString() === userId) {
                  console.log(`[DEBUG] Task "${taskObj.title}" was created by current user and has no assignee - counting as assigned to user`);
                  return isActive;
                }
                
                return isAssignedToUser && isActive;
              });
              
              console.log(`[DEBUG] Found ${userTasks.length} tasks assigned to user in family ${family.name}`);
              
              // Return tasks with family info
              return userTasks.map(task => ({
                ...task,
                familyId: family.id,
                familyName: family.name
              }));
            }
            return [];
          } catch (error) {
            console.error(`[DEBUG] Error fetching tasks for family ${family.id}:`, error);
            return [];
          }
        })
      );
      
      // Flatten results
      const flattenedTasks = allFamilyTasks.flat();
      console.log(`[DEBUG] Total user tasks across all families: ${flattenedTasks.length}`);
      
      // Group by family
      const tasksByFamily = flattenedTasks.reduce<Record<string, any[]>>((acc, task) => {
        const familyId = task.familyId.toString();
        if (!acc[familyId]) {
          acc[familyId] = [];
        }
        acc[familyId].push(task);
        return acc;
      }, {});
      
      // Update state
      setUserFamilyTasks(flattenedTasks);
      
      // Update stats with accurate count
      setStats(prevStats => ({
        ...prevStats,
        userPendingTasks: flattenedTasks.length,
        tasksByFamily
      }));
      
    } catch (error) {
      console.error('[DEBUG] Error fetching user tasks:', error);
    } finally {
      setLoadingUserTasks(false);
    }
  }, [families]);

  // Call this after setting families state
  useEffect(() => {
    if (families.length > 0) {
      updateTaskStats();
      fetchUserAssignedTasks();
    }
  }, [families, fetchUserAssignedTasks]);

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

  // New function to render the Focus Mode meter in header
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Show focus mode header even in loading state */}
        <FocusModeHeader />
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-400">Loading Family Data...</h1>
          <div className="animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="pt-6 h-32">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-1/3 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Focus Mode header that appears on all pages */}
        <FocusModeHeader />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Family Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your families and track assignments
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-500 hidden md:inline-block">
              Last updated: {getLastRefreshDisplay()}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleForceRefresh}
              className="flex items-center"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <div className="flex gap-2">
              <Button size="sm" asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              <Link href="/family/create">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Family
              </Link>
            </Button>
              <Button size="sm" variant="outline" asChild className="hidden md:flex">
              <Link href="/family/join">
                <LogIn className="w-4 h-4 mr-2" />
                Join Family
              </Link>
            </Button>
            </div>
          </div>
        </div>
        
        {/* Connection status */}
        {(connectionError || usingCachedData) && (
          <div className={`p-3 rounded-md ${connectionError ? 'bg-red-50 border border-red-300 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {connectionError ? 'Connection Error' : 'Using Cached Data'}
              </span>
              <span className="mx-2">-</span>
              <span className="text-sm">
                {connectionError 
                  ? `Failed to connect to server (${retryCount} attempt${retryCount !== 1 ? 's' : ''}). Data may be outdated.` 
                  : 'Using previously cached data. Some information may be outdated.'}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                className={`ml-auto ${connectionError ? 'text-red-600 hover:text-red-700 hover:bg-red-100' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'}`}
                onClick={() => fetchFamilies()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Tabs for different dashboard views */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <TabsList className="p-2 bg-transparent w-full">
              <TabsTrigger 
                value="overview" 
                className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="families" 
                className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Families
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Dashboard Stats - Overview Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Members"
                value={stats.totalMembers.toString()}
                icon={<Users className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-blue-400 to-blue-600"
                isLoading={loading}
              />
              
              <StatsCard
                title="Completed Tasks"
                value={stats.totalCompletedTasks.toString()}
                icon={<CheckCircle className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-green-400 to-emerald-500"
                trend={12}
                isLoading={loading}
              />
              
              <StatsCard
                title="Active Families"
                value={families.length.toString()}
                icon={<Activity className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-purple-400 to-indigo-500"
                isLoading={loading}
              />

              <StatsCard
                title="Focus Mode"
                value={focusMode ? formatTime(focusTimeRemaining) : 'Inactive'}
                icon={<Brain className="h-5 w-5 text-white" />}
                bgColor={focusMode ? "bg-gradient-to-br from-indigo-400 to-indigo-600" : "bg-gradient-to-br from-gray-400 to-gray-600"}
                isLoading={loading}
              />

              <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Active Families
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-3 flex items-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">{families.length}</span>
                    <span className="text-sm text-gray-500 ml-2">available families</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                    {families.length > 0 ? (
                      families.map(family => (
                        <Link 
                          href={`/family/${family.id}`} 
                          key={family.id}
                          className="flex items-center p-2.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 hover:border-purple-200 hover:shadow-sm transition-all group relative"
                        >
                          <Avatar className="h-7 w-7 bg-gradient-to-r from-purple-100 to-blue-100 mr-3">
                            <AvatarFallback className="text-xs text-purple-600 font-medium">
                              {family.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium group-hover:text-purple-700">{family.name}</span>
                          <ArrowUpRight className="h-4 w-4 text-gray-400 absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No families found
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t text-xs text-center text-gray-500">
                    Click on a family to view details
                  </div>
                </CardContent>
              </Card>

              <Card className={`overflow-hidden border ${focusMode ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all`}>
                <CardHeader className={`${focusMode ? 'bg-gradient-to-r from-indigo-50 to-indigo-100' : 'bg-gradient-to-r from-gray-50 to-gray-100'} pb-2 border-b`}>
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
                          <span className="text-3xl font-bold">{formatTime(focusTimeRemaining)}</span>
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
              
              {/* Task summary card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Task Summary
                    </CardTitle>
                    <CardDescription>Your tasks across all families</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
              <div className="flex items-center">
                          <CircleDashed className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm font-medium">In Progress</span>
                </div>
                        <span className="text-sm font-medium">{Math.max(0, Math.floor(userFamilyTasks.length * 0.4))}</span>
                      </div>
                      <Progress value={40} className="h-2 bg-amber-100" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CircleX className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm font-medium">Not Started</span>
                        </div>
                        <span className="text-sm font-medium">{Math.max(0, Math.floor(userFamilyTasks.length * 0.6))}</span>
                      </div>
                      <Progress value={60} className="h-2 bg-red-100" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                        <span className="text-sm font-medium">{stats.totalCompletedTasks}</span>
                      </div>
                      <Progress value={75} className="h-2 bg-green-100" />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Tasks</h4>
                    <div className="space-y-2">
                      {loadingUserTasks ? (
                        <div className="py-4 flex justify-center">
                          <div className="w-6 h-6 animate-spin rounded-full border-2 border-dotted border-amber-600"></div>
                        </div>
                      ) : userFamilyTasks.length > 0 ? (
                        userFamilyTasks.slice(0, 3).map((task: any, index: number) => (
                          <div key={task.id} className="flex items-center justify-between p-2 rounded-md border bg-gray-50 hover:bg-gray-100">
                            <div className="flex items-center gap-2 flex-grow min-w-0">
                              <div className="flex-shrink-0">
                                {task.status?.toLowerCase().includes('progress') ? (
                                  <CircleDashed className="h-5 w-5 text-amber-500" />
                                ) : (
                                  <CircleX className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {task.familyName} • Due {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                              <Link href={`/family/${task.familyId}/tasks/${task.id}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No tasks assigned to you</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/tasks?filter=active">
                        View All Tasks
                      </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
            
                <Card className="overflow-hidden border-amber-100">
                  <CardHeader className="bg-amber-50 pb-3">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Your Family Tasks
                    </CardTitle>
                    <CardDescription>Tasks assigned to you in your families</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                        <h3 className="text-2xl font-bold">
                          {loadingUserTasks ? (
                            <span className="inline-block w-6 h-6 animate-spin rounded-full border-2 border-dotted border-amber-600"></span>
                          ) : (
                            userFamilyTasks.length || 0
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">Active tasks need attention</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">By Family</h4>
                      <span className="text-xs text-gray-500">{families.length} {families.length === 1 ? 'family' : 'families'}</span>
                    </div>
                    
                    {loadingUserTasks ? (
                      <div className="py-4 flex justify-center">
                        <div className="w-6 h-6 animate-spin rounded-full border-2 border-dotted border-amber-600"></div>
                      </div>
                    ) : families.length > 0 ? (
                      <div className="space-y-2">
                        {families.map((family: Family) => {
                          const familyTasks = stats.tasksByFamily?.[family.id.toString()] || [];
                          const taskCount = familyTasks.length;
                          const percentage = families.length > 0 
                            ? Math.floor((taskCount / Math.max(1, userFamilyTasks.length)) * 100) 
                            : 0;
                          
                          return (
                            <div key={family.id} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-gray-100">
                                      {family.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{family.name}</span>
                                </div>
                                <span className="text-sm font-medium">{taskCount}</span>
                              </div>
                              <Progress value={percentage} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic py-4 text-center">
                        No families found
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between gap-2">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/tasks?filter=active">
                          View Tasks
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/tasks/create?type=family">
                          Create Task
                        </Link>
                      </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          
            {/* Quick Actions Card - More compact */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center justify-center border-purple-200 hover:bg-purple-50 hover:border-purple-300" asChild>
                  <Link href="/family/create">
                    <PlusCircle className="h-5 w-5 mb-1 text-purple-600" />
                    <span className="text-xs">Create Family</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center justify-center border-blue-200 hover:bg-blue-50 hover:border-blue-300" asChild>
                  <Link href="/family/join">
                    <LogIn className="h-5 w-5 mb-1 text-blue-600" />
                    <span className="text-xs">Join Family</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center justify-center border-amber-200 hover:bg-amber-50 hover:border-amber-300" asChild>
                  <Link href="/tasks/create">
                    <FileText className="h-5 w-5 mb-1 text-amber-600" />
                    <span className="text-xs">Create Task</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center justify-center border-green-200 hover:bg-green-50 hover:border-green-300" asChild>
                  <Link href="/family/lookup">
                    <Search className="h-5 w-5 mb-1 text-green-600" />
                    <span className="text-xs">Find Members</span>
                  </Link>
                </Button>
                {families.length > 0 && families[0] && (
                  <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center justify-center border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 sm:col-span-2 lg:col-span-1" asChild>
                    <Link href={`/family/${families[0].id}/activity`}>
                      <Activity className="h-5 w-5 mb-1 text-indigo-600" />
                      <span className="text-xs">Activity Feed</span>
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            {/* Task-focused view */}
            <Card>
              <CardHeader>
                <CardTitle>Your Assigned Tasks</CardTitle>
                <CardDescription>All tasks assigned to you across families</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUserTasks ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-dotted border-primary"></div>
                  </div>
                ) : userFamilyTasks.length > 0 ? (
                  <div className="space-y-3">
                    {userFamilyTasks.map((task: any) => (
                      <div key={task.id} className="flex items-start p-3 rounded-md border bg-gray-50 hover:bg-gray-100">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {task.status?.toLowerCase().includes('progress') ? (
                            <CircleDashed className="h-5 w-5 text-amber-500" />
                          ) : (
                            <CircleX className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{task.title}</h4>
                            <Badge variant="outline" className="ml-2">
                              {task.familyName}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{task.description?.substring(0, 100) || 'No description'}</p>
                          <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                            <Hourglass className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                  </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                            <Link href={`/family/${task.familyId}/tasks/${task.id}`}>
                              View Details
                            </Link>
                          </Button>
                </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No tasks assigned to you</p>
                    <Button asChild className="mt-4">
                      <Link href="/tasks/create?type=family">
                        Create a Task
                      </Link>
                    </Button>
                  </div>
                )}
            </CardContent>
              {userFamilyTasks.length > 0 && (
                <CardFooter className="flex justify-end border-t pt-4">
                  <Button asChild>
                    <Link href="/tasks?filter=active">
                      View All Tasks
                    </Link>
                  </Button>
                </CardFooter>
              )}
          </Card>
          </TabsContent>

          <TabsContent value="families" className="space-y-4">
            {/* Families Section - Tab View */}
          <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Families
                <Badge variant="outline" className="ml-2">
                  {families.length}
                </Badge>
              </h2>
              <div className="flex gap-2">
            {families.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                    <Link href="/family/manage" className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Manage All
                    </Link>
              </Button>
            )}
                <Button size="sm" asChild>
                  <Link href="/family/create" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Create
                  </Link>
                </Button>
              </div>
          </div>

          {families.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Families Yet</h2>
              <p className="text-gray-500 text-center max-w-md mb-6">
                You haven't created or joined any families yet. Create a new family or join an existing one using an invitation code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/family/create">
                      <PlusCircle className="h-5 w-5" />
                      Create a Family
                    </Link>
                </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href="/family/join">
                      <LogIn className="h-5 w-5" />
                      Join a Family
                    </Link>
                </Button>
              </div>
            </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {families.map((family) => (
                <FamilyCard 
                  key={family.id} 
                  family={family} 
                  onRefresh={() => fetchFamilies(0, true)} 
                />
              ))}

                {/* Add Family Card */}
                <Card className="border-dashed border-2 border-gray-200 hover:border-primary/50 transition-colors">
                  <CardContent className="p-0">
                    <Button 
                      variant="ghost" 
                      className="h-full w-full flex flex-col items-center justify-center py-12 rounded-none"
                      asChild
                    >
                <Link href="/family/create">
                        <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="font-medium">Create New Family</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Add another family to your dashboard
                        </p>
                </Link>
              </Button>
          </CardContent>
        </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}