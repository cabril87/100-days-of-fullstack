'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';

export default function CreateFamilyPage() {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create the family
      const success = await createFamily({ name });
      
      if (success) {
        console.log('Family created successfully, navigating directly to the new family page');
        
        // We'll need to fetch the newly created family details
        const response = await familyService.getAllFamilies();
        
        if (response.data && response.data.length > 0) {
          // Find the family we just created - it's likely the newest one
          const sortedByCreationDate = [...response.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          const newFamily = sortedByCreationDate[0];
          
          if (newFamily) {
            // Navigate directly to the family detail page instead of the dashboard
            router.push(`/family/${newFamily.id}`);
            return;
          }
        }
        
        // Fallback - if we couldn't find the new family, just go to the dashboard
        router.push('/family');
      } else {
        showToast('Failed to create family', 'error');
      }
    } catch (error) {
      console.error('Error creating family:', error);
      showToast('An error occurred while creating your family', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 flex flex-col items-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex bg-blue-100 p-3 rounded-full">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Create Your Family</h1>
          <p className="text-gray-500 mt-2">
            Start a new family group to manage tasks and stay connected.
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Family Details</CardTitle>
              <CardDescription>
                What would you like to name your family?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="family-name">Family Name</Label>
                  <Input
                    id="family-name"
                    placeholder="e.g. The Smiths, Team Awesome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" asChild>
                <Link href="/family/join">Join Existing Family</Link>
              </Button>
              <Button type="submit" disabled={!name || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Family'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have a family? <Link href="/family/join" className="text-blue-600 hover:underline">Join with invitation code</Link>
          </p>
        </div>
      </div>
    </div>
  );
}