'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFamily } from '@/lib/providers/FamilyContext';
import { familyService } from '@/lib/services/familyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/useToast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters').max(50, 'Family name must be less than 50 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function FamilySettingsPage() {
  const { currentFamily, setCurrentFamily, refreshFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentFamily?.name || '',
    },
  });

  useEffect(() => {
    if (currentFamily) {
      form.reset({ name: currentFamily.name });
    }
  }, [currentFamily, form]);

  const onSubmit = async (values: FormValues) => {
    if (!currentFamily) return;

    try {
      const response = await familyService.updateFamily(currentFamily.id, { name: values.name });
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      if (!response.data) {
        showToast('No family data received', 'error');
        return;
      }
      setCurrentFamily(response.data);
      showToast('Family updated successfully', 'success');
      refreshFamily();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update family', 'error');
    }
  };

  const handleDeleteFamily = async () => {
    if (!currentFamily || isDeleting || isNavigating) return;

    setIsDeleting(true);
    try {
      const response = await familyService.deleteFamily(currentFamily.id);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      setCurrentFamily(null);
      showToast('Family deleted successfully', 'success');
      setIsNavigating(true);
      router.replace('/family/create');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete family', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateFamily = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace('/family/create');
  };

  if (!currentFamily) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Family Selected</CardTitle>
            <CardDescription>
              Please create or select a family to manage its settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={handleCreateFamily}
              disabled={isNavigating}
            >
              {isNavigating ? 'Redirecting...' : 'Create New Family'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Family Settings</CardTitle>
          <CardDescription>
            Manage your family group settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter family name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={form.formState.isSubmitting || isNavigating}
                >
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      disabled={isDeleting || isNavigating}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Family'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your family
                        and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteFamily}
                        disabled={isDeleting || isNavigating}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 