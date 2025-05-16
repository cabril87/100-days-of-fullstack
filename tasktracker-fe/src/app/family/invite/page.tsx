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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof formSchema>;

export default function FamilyInvitePage() {
  const { currentFamily } = useFamily();
  const router = useRouter();
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentFamily) return;

    try {
      const response = await familyService.createInvitation(currentFamily.id, values.email);
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      showToast('Invitation sent successfully', 'success');
      form.reset();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send invitation', 'error');
    }
  };

  if (!currentFamily) {
    router.push('/family/create');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Invite Family Members</CardTitle>
          <CardDescription>
            Send invitations to join your family group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invite" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invite">Send Invitation</TabsTrigger>
              <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
            </TabsList>
            <TabsContent value="invite">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
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
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="pending">
              <PendingInvitations familyId={currentFamily.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PendingInvitations({ familyId }: { familyId: string }) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await familyService.getFamilyInvitations(familyId);
        if (response.error) {
          showToast(response.error, 'error');
          return;
        }
        if (response.data) {
          setInvitations(response.data);
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to fetch invitations', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [familyId, showToast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (invitations.length === 0) {
    return <div className="text-center text-muted-foreground">No pending invitations</div>;
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div>
            <p className="font-medium">{invitation.email}</p>
            <p className="text-sm text-muted-foreground">
              Sent {new Date(invitation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Resend
          </Button>
        </div>
      ))}
    </div>
  );
} 