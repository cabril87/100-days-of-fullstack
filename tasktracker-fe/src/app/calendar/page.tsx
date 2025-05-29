/*
 * TaskTracker - Family Calendar Page
 */
'use client';

import { useFamily } from '@/lib/providers/FamilyContext';
import { useAuth } from '@/lib/providers/AuthContext';
import { FamilyCalendar } from '@/components/family/FamilyCalendar';
import CalendarAnalyticsDashboard from '@/components/family/CalendarAnalyticsDashboard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';

export default function CalendarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { family, loading: familyLoading, error: familyError } = useFamily();
  const router = useRouter();
  const params = useParams();
  const [currentView, setCurrentView] = useState<'calendar' | 'analytics'>('calendar');

  // Get family ID from URL params if available
  const familyIdFromUrl = params?.id ? parseInt(params.id as string, 10) : null;

  // IMMEDIATE authentication check - redirect if not authenticated
  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) return;
    
    // If no user after auth loading is complete, redirect to login
    if (!user) {
      console.log('No authenticated user found, redirecting to login');
      router.push('/auth/login?redirect=/calendar');
      return;
    }
    
    // Check for auth token in localStorage as additional verification
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token found, redirecting to login');
      router.push('/auth/login?redirect=/calendar');
      return;
    }
    
    console.log('User authenticated successfully:', user.username || user.email);
  }, [user, authLoading, router]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect is happening)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400">You need to log in to access the family calendar.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
          <Button 
            onClick={() => router.push('/auth/login')} 
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // If we have a family ID in the URL, we're on a family-specific page
  if (familyIdFromUrl) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              📅 Family Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your family's schedule and activities
              {family && <span className="font-semibold text-blue-600 ml-1">for {family.name}</span>}
            </p>
          </div>
          <Button 
            onClick={() => router.push(`/family/${familyIdFromUrl}`)}
            variant="outline"
            className="hidden sm:flex"
          >
            ← Back to Family Hub
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'calendar' | 'analytics')}>
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              📅 Calendar View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              📊 Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <FamilyCalendar familyId={familyIdFromUrl} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <CalendarAnalyticsDashboard familyId={familyIdFromUrl} />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="lg:hidden">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => router.push(`/family/${familyIdFromUrl}`)}
                variant="outline"
                size="sm"
              >
                Family Hub
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
              >
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // We're on the general /calendar page (no family ID in URL)
  // Handle family loading and redirect logic

  if (familyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your family...</p>
            <p className="text-xs text-gray-500">Authenticated as: {user.username || user.email}</p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error loading family data
  if (familyError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center text-red-600">
              ⚠️ Error Loading Family
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {familyError}
            </p>
            <p className="text-xs text-gray-500">
              Authenticated as: {user.username || user.email}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="default">
                Retry
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push('/auth/login')} variant="outline">
                Re-login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has a family, redirect to family-specific calendar
  if (family) {
    router.push(`/family/${family.id}/calendar`);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to your family calendar...</p>
            <p className="text-xs text-gray-500">Family: {family.name}</p>
          </div>
        </div>
      </div>
    );
  }

  // If no family, show create/join options
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            📅 Family Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            You need to be part of a family to access the family calendar.
          </p>
          <p className="text-xs text-gray-500">
            Authenticated as: {user.username || user.email}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push('/family/create')} variant="default">
              Create Family
            </Button>
            <Button onClick={() => router.push('/family/join')} variant="outline">
              Join Family
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}