'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/analytics/dashboard/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, BarChart3, Activity, Target } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/analytics');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen dark:bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-64 bg-white/20 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-36 bg-white/10 rounded-xl backdrop-blur-sm"></div>
              ))}
            </div>
            <div className="h-96 bg-white/10 rounded-xl backdrop-blur-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen dark:bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white ">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                  <p className="text-white/80 text-lg">Comprehensive insights into your productivity and performance</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="text-white/80 text-sm">Performance</div>
                      <div className="text-white text-lg font-semibold">Real-time Insights</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-blue-400" />
                    <div>
                      <div className="text-white/80 text-sm">Activity</div>
                      <div className="text-white text-lg font-semibold">Track Progress</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-purple-400" />
                    <div>
                      <div className="text-white/80 text-sm">Goals</div>
                      <div className="text-white text-lg font-semibold">Achieve More</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <AnalyticsDashboard 
            theme="dark"
            showExportControls={true}
            autoRefresh={false}
            refreshInterval={300}
          />
        </div>
      </div>
    </div>
  );
} 