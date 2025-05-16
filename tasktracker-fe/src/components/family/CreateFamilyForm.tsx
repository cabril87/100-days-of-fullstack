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
import { Family } from '@/lib/types/family';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters').max(50, 'Family name must be less than 50 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateFamilyFormProps {
  onSuccess?: () => void;
}

export function CreateFamilyForm({ onSuccess }: CreateFamilyFormProps) {
  const { setCurrentFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
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
      showToast('Family created successfully', 'success');
      onSuccess?.();
      router.push('/family/dashboard');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create family', 'error');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a New Family</CardTitle>
        <CardDescription>
          Set up your family group to start collaborating on tasks
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
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Creating...' : 'Create Family'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 