/*
 * TaskTracker - Family-Specific Calendar Page
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFamily } from '@/lib/providers/FamilyContext';
import { useAuth } from '@/lib/providers/AuthContext';
import { FamilyCalendar } from '@/components/family/FamilyCalendar';
import CalendarAnalyticsDashboard from '@/components/family/CalendarAnalyticsDashboard';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function FamilyCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { family } = useFamily();
  const [currentView, setCurrentView] = useState<'calendar' | 'analytics'>('calendar');
  const familyId = parseInt(params.id as string, 10);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (family && parseInt(family.id, 10) !== familyId) {
      // Redirect if current family doesn't match URL
      router.push(`/family/${family.id}/calendar`);
    }
  }, [family, familyId, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!family) {
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
              Loading family information...
            </p>
            <Button onClick={() => router.push('/family')} variant="outline">
              ← Back to Family Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/family')}
          className="p-0 h-auto font-normal hover:text-blue-600"
        >
          Family Hub
        </Button>
        <span>•</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/family/${family.id}`)}
          className="p-0 h-auto font-normal hover:text-blue-600"
        >
          {family.name}
        </Button>
        <span>•</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">Calendar</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            📅 Family Calendar
            <Badge variant="secondary" className="text-sm">
              {family.name}
            </Badge>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Coordinate schedules and manage family activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/family/${family.id}`)}
            variant="outline"
            size="sm"
          >
            ← Family Hub
          </Button>
          <Button 
            onClick={() => router.push('/calendar')}
            variant="ghost"
            size="sm"
          >
            Standalone View
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'calendar' | 'analytics')}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            📅 Calendar View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            📊 Smart Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📅 Family Schedule
                <Badge variant="outline" className="text-xs">
                  Advanced Features
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FamilyCalendar familyId={parseInt(family.id, 10)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Scheduling Analytics
                  <Badge variant="outline" className="text-xs">
                    AI-Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarAnalyticsDashboard familyId={parseInt(family.id, 10)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Mobile */}
      <Card className="sm:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => router.push(`/family/${family.id}`)}
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