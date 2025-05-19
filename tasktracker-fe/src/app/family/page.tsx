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
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCompletedTasks: 0,
    totalPendingTasks: 0,
    activeFamilies: 0
  });
  const { showToast } = useToast();
  
  // Fetch all families the user belongs to
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        console.log("Fetching all families for dashboard");
        const response = await familyService.getAllFamilies();
        console.log("Families response:", response);
        
        if (response.data) {
          setFamilies(response.data);
          
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
          showToast(response.error, 'error');
        }
      } catch (error) {
        console.error("Error fetching families:", error);
        showToast('Failed to load families', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilies();
  }, [showToast]);

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