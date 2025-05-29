'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Brain, BarChart3, TrendingUp, Sparkles, Trophy, Play, Eye, Lightbulb, Clock } from 'lucide-react';
import { FocusModeManager } from './FocusModeManager';
import { ProductivityInsightsDashboard } from './ProductivityInsightsDashboard';
import { FocusStreakCounter } from './FocusStreakCounter';
import { FocusMLInsights } from './FocusMLInsights';
import { FocusInsights } from './FocusInsights';
import { FocusAnalytics } from './FocusAnalytics';

export function FocusMode() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Enhanced Hero Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Dynamic gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 rounded-t-xl"></div>
          
          <div className="relative z-10 p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-all duration-300">
                  <Brain className="h-10 w-10" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Focus Hub
                </h1>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:scale-105 transition-all duration-300">
                  <Target className="h-10 w-10" />
                </div>
              </div>
              <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                Your complete productivity command center. Manage focus sessions, track patterns, and get AI-powered insights to maximize your potential.
              </p>
              
              {/* Quick Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Active Sessions</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">Live Focus</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Analytics</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">Deep Insights</div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">AI Insights</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-900">Smart Tips</div>
      </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">ML.NET</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">Predictions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Comprehensive Tab System */}
      <Tabs defaultValue="focus" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Decorative elements for tabs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.02] rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.03] rounded-full blur-xl"></div>
            
            <div className="relative z-10 p-3">
              <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent h-auto">
                {/* Focus Session Tab */}
                <TabsTrigger 
                  value="focus" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Focus Session</div>
                    <div className="text-xs opacity-80">Start & manage sessions</div>
                  </div>
                </TabsTrigger>
                
                {/* Real-time Analytics Tab */}
                <TabsTrigger 
                  value="analytics" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Analytics</div>
                    <div className="text-xs opacity-80">Charts & patterns</div>
                  </div>
                </TabsTrigger>
                
                {/* Productivity Insights Tab */}
                <TabsTrigger 
                  value="insights" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Smart Insights</div>
                    <div className="text-xs opacity-80">Productivity patterns</div>
                  </div>
          </TabsTrigger>
                
                {/* AI Focus Insights Tab */}
                <TabsTrigger 
                  value="ai-insights" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">AI Insights</div>
                    <div className="text-xs opacity-80">Smart recommendations</div>
                  </div>
          </TabsTrigger>
                
                {/* ML.NET Predictions Tab */}
                <TabsTrigger 
                  value="ml-predictions" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">ML.NET</div>
                    <div className="text-xs opacity-80">AI predictions</div>
                  </div>
          </TabsTrigger>
        </TabsList>
            </div>
          </div>

          {/* Tab Content */}

          {/* Focus Session Management */}
        <TabsContent value="focus" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Streak Counter */}
            <div className="lg:col-span-1">
              <FocusStreakCounter />
            </div>
            
              {/* Main Focus Manager */}
              <div className="lg:col-span-3">
                <FocusModeManager />
              </div>
            </div>
          </TabsContent>

          {/* Real-time Analytics & Charts */}
          <TabsContent value="analytics" className="space-y-6">
            <FocusAnalytics />
        </TabsContent>

          {/* Productivity Insights Dashboard */}
        <TabsContent value="insights" className="space-y-6">
          <ProductivityInsightsDashboard />
        </TabsContent>

          {/* AI-powered Focus Insights */}
          <TabsContent value="ai-insights" className="space-y-6">
            <FocusInsights />
          </TabsContent>

          {/* ML.NET Predictions */}
          <TabsContent value="ml-predictions" className="space-y-6">
            <FocusMLInsights />
          </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}