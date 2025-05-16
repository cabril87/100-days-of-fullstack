'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/lib/providers/FamilyContext';
import { familyService } from '@/lib/services/familyService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { Family, FamilyMember } from '@/lib/types/family';
import { CreateFamilyForm } from '@/components/family/CreateFamilyForm';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function FamilyDashboard() {
  const { currentFamily, setCurrentFamily, refreshFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch families only once on mount
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await familyService.getAllFamilies();
        if (response.error) {
          showToast(response.error, 'error');
          return;
        }
        if (!response.data) {
          showToast('No family data received', 'error');
          return;
        }
        setFamilies(response.data);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to fetch families', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilies();
  }, [showToast]);

  // Update families list when currentFamily changes
  useEffect(() => {
    if (currentFamily) {
      setFamilies(prev => {
        const exists = prev.some(f => f.id === currentFamily.id);
        if (exists) {
          return prev.map(f => f.id === currentFamily.id ? currentFamily : f);
        }
        const newFamilies = [...prev, currentFamily];
        return newFamilies;
      });
    }
  }, [currentFamily]);

  const handleCreateFamily = async (values: { name: string }) => {
    if (isCreating || isNavigating) return;
    setIsCreating(true);
    try {
      const response = await familyService.createFamily(values.name);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      if (!response.data) {
        showToast('No family data received', 'error');
        return;
      }
      setCurrentFamily(response.data);
      setFamilies(prev => [...prev, response.data as Family]);
      showToast('Family created successfully', 'success');
      setIsDialogOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create family', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (isDeleting || isNavigating) return;
    setIsDeleting(true);
    try {
      const response = await familyService.deleteFamily(familyId);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      setFamilies(prev => prev.filter(f => f.id !== familyId));
      
      // If we deleted the current family, switch to another one if available
      if (currentFamily?.id === familyId) {
        const remainingFamilies = families.filter(f => f.id !== familyId);
        if (remainingFamilies.length > 0) {
          // Switch to the first remaining family
          setCurrentFamily(remainingFamilies[0]);
        } else {
          // Only redirect to create if no families are left
          setCurrentFamily(null);
          setIsNavigating(true);
          router.replace('/family/create');
        }
      }
      showToast('Family deleted successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete family', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSwitchFamily = async (familyId: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      const response = await familyService.getFamily(familyId);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      if (!response.data) {
        showToast('No family data received', 'error');
        return;
      }
      setCurrentFamily(response.data);
      router.replace('/family/dashboard');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to switch family', 'error');
    } finally {
      setIsNavigating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-8 md:grid-cols-2">
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
      </div>
    );
  }

  if (!currentFamily) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Family Selected</CardTitle>
            <CardDescription>
              Please create or select a family to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => setIsDialogOpen(true)}
              disabled={isCreating || isNavigating}
            >
              {isCreating ? 'Creating...' : 'Create New Family'}
            </Button>
          </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Family</DialogTitle>
              <DialogDescription>
                Enter a name for your new family group
              </DialogDescription>
            </DialogHeader>
            <CreateFamilyForm 
              onSuccess={() => {
                setIsDialogOpen(false);
                refreshFamily();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Family</CardTitle>
            <CardDescription>
              {currentFamily.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {new Date(currentFamily.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="text-sm">{currentFamily.members.length}</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/family/settings')}
                disabled={isNavigating}
              >
                Manage Family
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Families</CardTitle>
            <CardDescription>
              Switch between your family groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {families.map((family) => (
                <div
                  key={family.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{family.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {family.members.length} members
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {family.id !== currentFamily.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchFamily(family.id)}
                        disabled={isNavigating}
                      >
                        Switch
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFamily(family.id)}
                      disabled={isDeleting || isNavigating}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                className="w-full"
                onClick={() => setIsDialogOpen(true)}
                disabled={isCreating || isNavigating}
              >
                {isCreating ? 'Creating...' : 'Create New Family'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Family</DialogTitle>
            <DialogDescription>
              Enter a name for your new family group
            </DialogDescription>
          </DialogHeader>
          <CreateFamilyForm 
            onSuccess={() => {
              setIsDialogOpen(false);
              refreshFamily();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 