'use client';

import React, { useState } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Users, UserPlus } from 'lucide-react';

export default function JoinFamilyPage() {
  const [invitationCode, setInvitationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { joinFamily } = useFamily();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode) return;

    setIsSubmitting(true);
    try {
      await joinFamily(invitationCode);
      // Redirect will be handled by the joinFamily function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 flex flex-col items-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex bg-green-100 p-3 rounded-full">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Join a Family</h1>
          <p className="text-gray-500 mt-2">
            Enter an invitation code to join an existing family.
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Enter Invitation Code</CardTitle>
              <CardDescription>
                Paste the invitation code you received from a family admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invitation-code">Invitation Code</Label>
                  <Input
                    id="invitation-code"
                    placeholder="e.g. FAM-123456-ABCDEF"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" asChild>
                <Link href="/family/create">Create New Family</Link>
              </Button>
              <Button type="submit" disabled={!invitationCode || isSubmitting}>
                {isSubmitting ? 'Joining...' : 'Join Family'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Want to create your own family? <Link href="/family/create" className="text-blue-600 hover:underline">Create a new family</Link>
          </p>
        </div>
      </div>
    </div>
  );
}