'use client';

import React, { useEffect, useState } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, PlusCircle, LogIn, CheckCircle, Clock, FileText, BarChart3, Settings, UserPlus, Shield, UserCog, UserX, Trash2, PencilLine, Bell, ArrowLeft, ClipboardList, Home, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { familyService } from '@/lib/services/familyService';
import { Family } from '@/lib/types/family';
import { useToast } from '@/lib/hooks/useToast';
import FamilyCard from '@/components/family/FamilyCard';
import { useRouter, usePathname } from 'next/navigation';

// Constants for retries
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REFRESH_INTERVAL_MS = 2000; // How often to check for updates

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
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCompletedTasks: 0,
    totalPendingTasks: 0,
    activeFamilies: 0
  });
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  // Fetch all families with cache busting
  const fetchFamilies = async (retry = 0, forceCacheBust = false) => {
    setLoading(true);
    setConnectionError(false);
    
    // Generate a new cache key if force cache busting is requested
    if (forceCacheBust) {
      setCacheKey(Date.now().toString());
    }
    
    try {
      console.log(`[DEBUG] Fetching all families for dashboard (cache key: ${cacheKey})`);
      
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
        
        // Calculate stats
        const totalMembers = response.data.reduce((sum, family) => 
          sum + (family.members?.length || 0), 0);
        
        const totalCompletedTasks = response.data.reduce((sum, family) => 
          sum + family.members?.reduce((memberSum, member) => 
            memberSum + (member.completedTasks || 0), 0) || 0, 0);
        
        const totalPendingTasks = response.data.reduce((sum, family) => 
          sum + family.members?.reduce((memberSum, member) => 
            memberSum + (member.pendingTasks || 0), 0) || 0, 0);
        
        setStats({
          totalMembers,
          totalCompletedTasks,
          totalPendingTasks,
          activeFamilies: response.data.length
        });
        
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
  };
  
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
    fetchFamilies(0, true);
    
    // Set up polling to check for updates
    // This helps when families are created/deleted in other tabs or after redirection
    const pollInterval = setInterval(() => {
      console.log("[DEBUG] Polling for family updates...");
      fetchFamilies(0, true);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-400">Loading Family Data...</h1>
          <div className="animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 w-1/3 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleForceRefresh}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          {connectionError && (
            <Button 
              variant="destructive" 
              onClick={() => fetchFamilies()}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          )}
          
          <Button asChild>
            <Link href="/family/create">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Family
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/family/join">
              <LogIn className="w-4 h-4 mr-2" />
              Join Family
            </Link>
          </Button>
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

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <h3 className="text-2xl font-bold">{stats.totalMembers}</h3>
                <p className="text-xs text-gray-500">
                  Across {families.length} {families.length === 1 ? 'family' : 'families'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                <h3 className="text-2xl font-bold">{stats.totalCompletedTasks}</h3>
                <p className="text-xs text-gray-500">
                  Total tasks completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-full mr-4">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <h3 className="text-2xl font-bold">{stats.totalPendingTasks}</h3>
                <p className="text-xs text-gray-500">
                  Tasks awaiting completion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full mr-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Families</p>
                <h3 className="text-2xl font-bold">{stats.activeFamilies}</h3>
                <p className="text-xs text-gray-500">
                  Families with active tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Families Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Families</h2>
          {families.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/family/manage">Manage All</Link>
            </Button>
          )}
        </div>

        {families.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Families Yet</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              You haven't created or joined any families yet. Create a new family or join an existing one using an invitation code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/family/create">Create a Family</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/family/join">Join a Family</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {families.map((family) => (
              <FamilyCard 
                key={family.id} 
                family={family} 
                onRefresh={() => fetchFamilies(0, true)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used family management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
              <Link href="/family/create">
                <PlusCircle className="h-6 w-6 mb-2" />
                <span>Create Family</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
              <Link href="/family/join">
                <LogIn className="h-6 w-6 mb-2" />
                <span>Join Family</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
              <Link href="/tasks/create">
                <FileText className="h-6 w-6 mb-2" />
                <span>Create Task</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
              <Link href="/family/lookup">
                <Search className="h-6 w-6 mb-2" />
                <span>User Lookup</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}