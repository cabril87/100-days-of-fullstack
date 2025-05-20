'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, UserPlus, Globe, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

// Helper function to safely access localStorage (only in browser)
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export default function FamilySettingsPage() {
  const params = useParams();
  const familyId = params.id as string;
  const router = useRouter();
  const { family: contextFamily, loading: contextLoading, isAdmin, updateFamily } = useFamily();
  const { showToast } = useToast();
  
  // Initialize with context family if available, otherwise null
  const [family, setFamily] = useState(contextFamily || null);
  // Start loading as false if we already have family data from context
  const [loading, setLoading] = useState(!contextFamily);
  const [name, setName] = useState(contextFamily?.name || '');
  const [description, setDescription] = useState(contextFamily?.description || '');
  
  // Rest of your existing state declarations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(!!contextFamily);
  const [cancelingInvitation, setCancelingInvitation] = useState<string | null>(null);
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null);
  const [invitationsLastUpdated, setInvitationsLastUpdated] = useState(Date.now());
  
  // Explicitly load the specific family by ID
  useEffect(() => {
    // Skip if already finished loading
    if (initialLoadComplete) {
      console.log('Family data already loaded, skipping load request');
      return;
    }
    
    console.log(`Loading family data for ID: ${familyId}`);
    
    // Simple loading function
    const loadFamily = async () => {
      try {
        // Mark as loading
        setLoading(true);
        
        // Fetch family data
        const response = await familyService.getFamily(familyId);
        console.log('Family data load response:', response);
        
        if (response.data) {
          // Set family data
          setFamily(response.data);
          setName(response.data.name || '');
          setDescription(response.data.description || '');
          
          // Log family members for debugging
          if (response.data.members) {
            console.log('Family members found:', response.data.members.length);
          }
        } else if (response.error) {
          setLoadError(response.error);
          console.error('Error loading family:', response.error);
        }
      } catch (error) {
        console.error('Exception loading family:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load family data');
      } finally {
        // Always mark loading as complete
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    // Execute the load
    loadFamily();
  }, [familyId]);

  // Load invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoadingInvitations(true);
        console.log(`Fetching invitations for family ${familyId} at ${new Date().toISOString()}`);
        // Add cache-busting timestamp to force fresh data
        const response = await familyService.getFamilyInvitations(familyId, {
          extraHeaders: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.data) {
          console.log(`Received ${response.data.length} invitations`);
          setInvitations(response.data);
        } else if (response.error) {
          console.error('Error loading invitations:', response.error);
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
  }, [family, isAdmin, familyId, invitationsLastUpdated]);

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

  const handleCancelInvitation = async (invitationId: string) => {
    if (!isAdmin) return;
    
    setCancelingInvitation(invitationId);
    try {
      // Call the API to cancel the invitation
      const response = await familyService.cancelInvitation(familyId, invitationId);
      
      if (!response.error && response.data?.success) {
        // Remove the invitation from the list
        setInvitations(prevInvitations => prevInvitations.filter(inv => inv.id !== invitationId));
        // Mark invitations as needing refresh
        setInvitationsLastUpdated(Date.now());
        
        showToast(
          "The invitation has been successfully canceled.",
          "success"
        );
      } else {
        showToast(
          response.error || "Failed to cancel invitation. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      showToast(
        "Failed to cancel invitation. Please try again.",
        "error"
      );
    } finally {
      setCancelingInvitation(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!isAdmin) return;
    
    setResendingInvitation(invitationId);
    try {
      // Call the API to resend the invitation
      const response = await familyService.resendInvitation(familyId, invitationId);
      
      if (!response.error && response.data?.success) {
        // Mark invitations as needing refresh
        setInvitationsLastUpdated(Date.now());
        
        showToast(
          "The invitation has been successfully resent.",
          "success"
        );
      } else {
        showToast(
          response.error || "Failed to resend invitation. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      showToast(
        "Failed to resend invitation. Please try again.",
        "error"
      );
    } finally {
      setResendingInvitation(null);
    }
  };

  // Loading state
  if (!initialLoadComplete || loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500">Loading family settings...</p>
      </div>
    );
  }

  // Error state 
  if (loadError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading family</AlertTitle>
          <AlertDescription>
            {loadError}
          </AlertDescription>
        </Alert>
        <div className="text-center p-8">
          <Button asChild className="mt-4">
            <Link href="/family/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (initialLoadComplete && !family) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Family Not Found</h1>
          <p className="text-gray-500 mb-6">
            The family you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="space-y-4">
            <Button asChild>
              <Link href="/family/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Family is loaded, render the main content
  if (family) {
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
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
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
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={resendingInvitation === invitation.id}
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            {resendingInvitation === invitation.id ? 'Sending...' : 'Resend'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={cancelingInvitation === invitation.id}
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            {cancelingInvitation === invitation.id ? 'Canceling...' : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </div>
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
        </Tabs>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
      </div>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unexpected state</AlertTitle>
        <AlertDescription>
          We couldn't load your family settings. Please try refreshing the page.
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2 mt-4">
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
        <Button variant="outline" onClick={() => router.push('/family/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}