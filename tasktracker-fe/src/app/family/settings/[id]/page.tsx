'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, UserPlus, Globe, Bell } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';

export default function FamilySettingsPage() {
  const params = useParams();
  const familyId = params.id as string;
  const router = useRouter();
  const { family, loading, error, isAdmin, updateFamily } = useFamily();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && family && !isAdmin) {
      showToast('You do not have permission to access family settings', 'error');
      router.push('/family/dashboard');
    }
  }, [loading, family, isAdmin, router, showToast]);

  // Load family data
  useEffect(() => {
    if (family) {
      setName(family.name);
      setDescription(family.description || '');
    }
  }, [family]);

  // Load invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await familyService.getFamilyInvitations(familyId);
        if (response.data) {
          setInvitations(response.data);
        }
      } catch (error) {
        console.error('Failed to load invitations:', error);
      } finally {
        setLoadingInvitations(false);
      }
    };

    if (family && isAdmin) {
      fetchInvitations();
    }
  }, [family, isAdmin, familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      await updateFamily(familyId, { name, description });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Not found state
  if (!family) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Family Not Found</h1>
          <p className="text-gray-500 mb-6">
            The family you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/family/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/family/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Family Settings</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <UserPlus className="h-4 w-4 mr-2" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Globe className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Update your family's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Family Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter family name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a brief description of your family"
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting || !name}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Manage pending invitations to your family
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvitations ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : invitations.length > 0 ? (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Sent {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Resend</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No pending invitations</p>
                  <Button onClick={() => router.push('/family/dashboard')}>
                    Invite Members
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage who can see your family information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Privacy settings coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Notification settings coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}