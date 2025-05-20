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

export default function FamilyDashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCompletedTasks: 0,
    totalPendingTasks: 0,
    activeFamilies: 0
  });
  const { showToast } = useToast();
  
  // Fetch all families the user belongs to
  const fetchFamilies = async (retry = 0) => {
    setLoading(true);
    setConnectionError(false);
    
    try {
      console.log("Fetching all families for dashboard");
      const response = await familyService.getAllFamilies();
      console.log("Families response:", response);
      
      if (response.data) {
        setFamilies(response.data);
        setUsingCachedData(false);
        
        // Cache successful response for future use
        try {
          localStorage.setItem('family_dashboard_cache', JSON.stringify(response.data));
          console.log('Cached family dashboard data');
        } catch (cacheError) {
          console.warn('Failed to cache family dashboard data:', cacheError);
        }
        
        // Calculate dashboard stats
        const totalMembers = response.data.reduce((sum, family) => sum + family.members.length, 0);
        const totalCompletedTasks = response.data.reduce((sum, family) => 
          sum + family.members.reduce((s, m) => s + (m.completedTasks || 0), 0), 0);
        const totalPendingTasks = response.data.reduce((sum, family) => 
          sum + family.members.reduce((s, m) => s + (m.pendingTasks || 0), 0), 0);
        const activeFamilies = response.data.filter(family => 
          family.members.some(m => (m.completedTasks || 0) > 0 || (m.pendingTasks || 0) > 0)).length;
        
        setStats({
          totalMembers,
          totalCompletedTasks,
          totalPendingTasks,
          activeFamilies
        });
      } else if (response.error) {
        console.error("Error response from API:", response.error, "Status:", response.status);
        setConnectionError(true);
        setRetryCount(prevCount => prevCount + 1);
        
        // Try to use cached data if available
        const cachedData = localStorage.getItem('family_dashboard_cache');
        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData);
            console.log('Using cached family dashboard data due to API error');
            setFamilies(parsedCache);
            setUsingCachedData(true);
            
            // Calculate dashboard stats from cache
            const totalMembers = parsedCache.reduce((sum: number, family: any) => sum + family.members.length, 0);
            const totalCompletedTasks = parsedCache.reduce((sum: number, family: any) => 
              sum + family.members.reduce((s: number, m: any) => s + (m.completedTasks || 0), 0), 0);
            const totalPendingTasks = parsedCache.reduce((sum: number, family: any) => 
              sum + family.members.reduce((s: number, m: any) => s + (m.pendingTasks || 0), 0), 0);
            const activeFamilies = parsedCache.filter((family: any) => 
              family.members.some((m: any) => (m.completedTasks || 0) > 0 || (m.pendingTasks || 0) > 0)).length;
            
            setStats({
              totalMembers,
              totalCompletedTasks,
              totalPendingTasks,
              activeFamilies
            });
            
            // Show toast about using cached data
            showToast('Using cached family data. Some information may be outdated.', 'warning');
          } catch (parseError) {
            console.error("Failed to parse cached family data:", parseError);
            showToast(response.error, 'error');
          }
        } else {
          // If no cache, retry if not max retries
          if (retry < 3 && response.status === 500) {
            const retryDelay = 1000 * Math.pow(2, retry);  // Exponential backoff
            console.log(`Will retry in ${retryDelay}ms (attempt ${retry + 1}/3)`);
            showToast(`Server error. Retrying in ${retryDelay/1000}s...`, 'warning');
            
            setTimeout(() => fetchFamilies(retry + 1), retryDelay);
            return;
          } else {
            showToast(response.error, 'error');
          }
        }
      }
    } catch (error) {
      console.error("Exception fetching families:", error);
      setConnectionError(true);
      setRetryCount(prevCount => prevCount + 1);
      
      // Try to use cached data on exception
      const cachedData = localStorage.getItem('family_dashboard_cache');
      if (cachedData) {
        try {
          const parsedCache = JSON.parse(cachedData);
          console.log('Using cached family dashboard data due to exception');
          setFamilies(parsedCache);
          setUsingCachedData(true);
          
          // Calculate dashboard stats from cache
          const totalMembers = parsedCache.reduce((sum: number, family: any) => sum + family.members.length, 0);
          const totalCompletedTasks = parsedCache.reduce((sum: number, family: any) => 
            sum + family.members.reduce((s: number, m: any) => s + (m.completedTasks || 0), 0), 0);
          const totalPendingTasks = parsedCache.reduce((sum: number, family: any) => 
            sum + family.members.reduce((s: number, m: any) => s + (m.pendingTasks || 0), 0), 0);
          const activeFamilies = parsedCache.filter((family: any) => 
            family.members.some((m: any) => (m.completedTasks || 0) > 0 || (m.pendingTasks || 0) > 0)).length;
          
          setStats({
            totalMembers,
            totalCompletedTasks,
            totalPendingTasks,
            activeFamilies
          });
          
          showToast('Using cached data. Connection to server failed.', 'warning');
        } catch (parseError) {
          console.error("Failed to parse cached family data:", parseError);
          showToast('Failed to load families', 'error');
        }
      } else {
        // If no cache and exception, retry once
        if (retry < 2) {
          const retryDelay = 1500 * (retry + 1);
          console.log(`Connection failed. Will retry in ${retryDelay}ms (attempt ${retry + 1}/2)`);
          showToast(`Connection failed. Retrying in ${retryDelay/1000}s...`, 'warning');
          
          setTimeout(() => fetchFamilies(retry + 1), retryDelay);
          return;
        } else {
          showToast('Failed to load families after multiple attempts', 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchFamilies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Dashboard</h1>
        <div className="flex gap-2">
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
              <FamilyCard key={family.id} family={family} />
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