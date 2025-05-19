'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import UserLookupDialog from '@/components/family/UserLookupDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, Mail, Copy, UserPlus, Home } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import Link from 'next/link';

interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export default function UserLookupPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [invitationSent, setInvitationSent] = useState(false);
  const [preselectedForDialog, setPreselectedForDialog] = useState<UserSearchResult | null>(null);
  const { showToast } = useToast();

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    setIsDialogOpen(false);
    showToast('User selected successfully', 'success');
  };

  const handleDialogUserSelection = (user: UserSearchResult) => {
    console.log('User selected within dialog:', user);
    setSelectedUser(user);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${type} copied to clipboard`, 'success');
  };

  const handleInviteSuccess = () => {
    setInvitationSent(true);
    setIsDialogOpen(false);
    showToast('Invitation sent successfully!', 'success');
  };

  const openLookupDialog = (preselect: boolean = false) => {
    if (preselect && selectedUser) {
      setPreselectedForDialog(selectedUser);
    } else {
      setPreselectedForDialog(null);
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Lookup & Invitation</h1>
          <p className="text-gray-500">
            Search for users by username or email to quickly find and invite them to your family.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Find Users</CardTitle>
            <CardDescription>
              Use our lookup system to search for users by their username or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center my-8">
              <Button 
                onClick={() => openLookupDialog()}
                size="lg"
                className="gap-2"
              >
                <Search className="h-5 w-5" />
                Open User Lookup
              </Button>
            </div>

            {selectedUser && (
              <div className="mt-8 border rounded-lg p-6 bg-blue-50">
                <h3 className="text-lg font-medium mb-4">Selected User</h3>
                <div className="flex items-start">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src={selectedUser.avatarUrl || `https://avatar.vercel.sh/${selectedUser.username}`} />
                    <AvatarFallback>{selectedUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-xl font-medium">{selectedUser.displayName || selectedUser.username}</h4>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between bg-white rounded p-3 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">Username:</span>
                          <span className="ml-2">{selectedUser.username}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedUser.username, 'Username')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white rounded p-3 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">Email:</span>
                          <span className="ml-2">{selectedUser.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedUser.email, 'Email')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {invitationSent && (
                      <div className="mt-4 bg-green-100 text-green-800 p-3 rounded-md flex items-center">
                        <UserPlus className="h-5 w-5 mr-2" />
                        <div>
                          <p className="font-medium">Invitation Sent!</p>
                          <p className="text-sm">The user will receive an email with instructions to join.</p>
                        </div>
                      </div>
                    )}
                    
                    {!invitationSent && (
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => openLookupDialog(true)}
                          className="gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Associate & Invite to Family
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/family">Back to Family Dashboard</Link>
            </Button>
            
            {selectedUser && (
              <Button onClick={() => {
                setSelectedUser(null);
                setInvitationSent(false);
              }}>
                Clear Selection
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              The user lookup feature allows you to easily find and connect with other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Search className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">Search by Username or Email</h3>
                  <p className="text-gray-500 text-sm">
                    You can search for users by typing their username or email address. The system will show matching results as you type.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <User className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium">View User Details</h3>
                  <p className="text-gray-500 text-sm">
                    Select a user from the search results to view their detailed profile information, including their email and username.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <Home className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Select Family</h3>
                  <p className="text-gray-500 text-sm">
                    Choose which family you want to invite the user to. You must be an admin of the family to send invitations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-full mr-4">
                  <UserPlus className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-medium">Send Invitation</h3>
                  <p className="text-gray-500 text-sm">
                    Once you've selected a user and a family, you can send them an invitation to join your family. They'll receive an email notification.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserLookupDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUserSelect={handleUserSelect}
        onInternalUserSelect={handleDialogUserSelection}
        onInviteSuccess={handleInviteSuccess}
        preselectedUser={preselectedForDialog || undefined}
      />
    </div>
  );
} 