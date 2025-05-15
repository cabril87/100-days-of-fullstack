'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { FocusMode } from '@/components/focus/FocusMode';
import { FocusStats } from '@/components/focus/FocusStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FocusPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/focus');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-brand-navy-dark mb-2">Focus Mode</h1>
        <p className="text-gray-600 text-xl">
          Boost your productivity with focused work sessions
        </p>
      </div>

      <Tabs defaultValue="focus" className="w-full">
        <TabsList className="mb-8 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-gray-200">
          <TabsTrigger value="focus" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Focus Mode</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Focus Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="focus" className="space-y-6">
          <FocusMode />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <FocusStats />
        </TabsContent>
      </Tabs>
    </div>
  );
} 