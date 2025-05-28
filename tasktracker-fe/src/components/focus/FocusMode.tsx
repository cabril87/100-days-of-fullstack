'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Brain, BarChart3, TrendingUp } from 'lucide-react';
import { FocusModeManager } from './FocusModeManager';
import { ProductivityInsightsDashboard } from './ProductivityInsightsDashboard';
import { FocusStreakCounter } from './FocusStreakCounter';

export function FocusMode() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Focus Mode</h1>
        <p className="text-muted-foreground">
          Boost your productivity with focused work sessions and detailed insights
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="focus" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="focus" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Focus Session
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Focus Session Tab */}
        <TabsContent value="focus" className="space-y-6">
          <FocusModeManager 
            showTaskDetails={true}
            showStreakCounter={true}
            showKeyboardHelp={true}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Streak Counter Card */}
            <div className="lg:col-span-1">
              <FocusStreakCounter />
            </div>
            
            {/* Analytics Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Focus Analytics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your detailed productivity analytics and insights are available in the Insights tab.
                    Track your focus patterns, session quality, and productivity trends over time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <ProductivityInsightsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}