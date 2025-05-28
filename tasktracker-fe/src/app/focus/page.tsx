'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { useFocus } from '@/lib/providers/FocusContext';
import { FocusMode } from '@/components/focus/FocusMode';
import { FocusStats } from '@/components/focus/FocusStats';
import { FocusInsights } from '@/components/focus/FocusInsights';
import { FocusAnalytics } from '@/components/focus/FocusAnalytics';
import { FocusMLInsights } from '@/components/focus/FocusMLInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Brain, BarChart3, Lightbulb, TrendingUp, Cpu, Timer, Play, Pause } from 'lucide-react';

export default function FocusPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { currentSession } = useFocus();
  const router = useRouter();

  // Handle authentication redirect - stable effect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/focus');
    }
  }, [authLoading, user, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Page Header with Gamification Styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="pt-6 relative z-10 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Brain className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Focus Mode
                </h1>
              </div>
              
              {/* Focus Session Status Indicator */}
              {currentSession?.status === 'InProgress' && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Timer className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Session Active</span>
                  </div>
                  <div className="text-xs text-green-600">
                    {currentSession.task?.title || 'Untitled Task'}
                  </div>
                </div>
              )}
              
              {currentSession?.status === 'Paused' && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                    <Pause className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Session Paused</span>
                  </div>
                  <div className="text-xs text-amber-600">
                    {currentSession.task?.title || 'Untitled Task'}
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-xl">
              Boost your productivity with focused work sessions, track your progress, and get AI-powered insights from ML.NET
            </p>
          </div>
        </div>

        {/* Enhanced Tabs with All Focus Components */}
        <Tabs defaultValue="focus" className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <TabsList className="p-2 bg-transparent w-full grid grid-cols-5">
              <TabsTrigger 
                value="focus" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Brain className="h-4 w-4 mr-2" />
                Focus Mode
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="ml" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Cpu className="h-4 w-4 mr-2" />
                ML.NET
              </TabsTrigger>
            </TabsList>
          </div>
                
          <TabsContent value="focus" className="space-y-6">
            <FocusMode />
          </TabsContent>
                
          <TabsContent value="stats" className="space-y-6">
            <FocusStats />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <FocusInsights />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <FocusAnalytics />
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <FocusMLInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}