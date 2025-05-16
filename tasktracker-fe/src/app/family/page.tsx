'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function FamilyPage() {
  const { currentFamily, isLoading } = useFamily();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (currentFamily) {
        router.push('/family/dashboard');
      } else {
        router.push('/family/create');
      }
    }
  }, [currentFamily, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 