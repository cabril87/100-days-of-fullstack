'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/useToast';
import { familyService } from '@/lib/services/familyService';
import { userService } from '@/lib/services/userService';
import { Loader2, UserPlus, Mail, User, Check, X, Search, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onSuccess: () => void;
}

export default function InviteMemberDialog({
  isOpen,
  onClose,
  familyId,
  onSuccess,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('email');
  const [searchType, setSearchType] = useState<'username' | 'email'>('username');
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setEmail('');
      setEmailError(null);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setIsSubmitting(false);
      setIsSearching(false);
      setActiveTab('email');
      setSearchType('username');
    }
  }, [isOpen]);

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 && activeTab === 'username') {
        searchUsers();
      }
    }, 500);

    // Detect if search query looks like an email
    if (searchQuery.includes('@')) {
      setSearchType('email');
    } else {
      setSearchType('username');
    }

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!email.trim()) {
      setEmailError('Please enter an email address');
      return false;
    } else if (!isValid) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  const searchUsers = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await userService.searchUsers(searchQuery);
      
      if (response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      showToast('Error searching for users', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (e.target.value) {
      validateEmail(e.target.value);
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async () => {
    let inviteEmail = email;
    
    // If using email tab, validate the email
    if (activeTab === 'email') {
      if (!validateEmail(email)) {
        return;
      }
    }
    
    // If using username search tab and a user is selected, use their email
    if (activeTab === 'username' && selectedUser) {
      inviteEmail = selectedUser.email;
      
      // Debug logging to check what email we're using
      console.log(`[InviteMemberDialog] Using selected user email: ${inviteEmail}`);
    }
    
    if (!inviteEmail) {
      showToast('Please enter an email address or select a user', 'error');
      return;
    }

    // Additional check to ensure we're not appending @example.com to an existing email address
    if (inviteEmail.includes('@') && inviteEmail.endsWith('@example.com') && inviteEmail.indexOf('@') !== inviteEmail.lastIndexOf('@')) {
      // If we have double @ symbols with ending @example.com, fix it
      inviteEmail = inviteEmail.split('@')[0] + '@' + inviteEmail.split('@')[1].replace('@example.com', '');
      console.log(`[InviteMemberDialog] Fixed double email suffix: ${inviteEmail}`);
    }

    setIsSubmitting(true);
    
    try {
      // First check if the email already has a pending invitation for this family
      const checkResponse = await familyService.checkEmailHasPendingInvitation(inviteEmail, familyId);
      
      if (checkResponse.data === true) {
        showToast(`An invitation is already pending for ${inviteEmail}`, 'warning');
        onClose();
        return;
      }
      
      // Log the actual invitation email being sent
      console.log(`[InviteMemberDialog] Sending invitation to email: ${inviteEmail}`);
      
      const response = await familyService.inviteMember(familyId, inviteEmail);
      
      if (response.status === 200 || response.status === 201) {
        // Sync family state to ensure data consistency
        await familyService.syncFamilyState(familyId, 'member invitation');
        
        showToast(`Invitation sent to ${inviteEmail}!`, 'success');
        onSuccess();
        onClose();
      } else {
        showToast(response.error || 'Failed to send invitation', 'error');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      showToast('Error sending invitation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
  };
  
  const clearSelectedUser = () => {
    setSelectedUser(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Family Member</DialogTitle>
          <DialogDescription>
            Invite someone to join your family by email or username
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              By Email
            </TabsTrigger>
            <TabsTrigger value="username">
              <User className="h-4 w-4 mr-2" />
              By Username/Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center">
                  Email Address
                  <Badge variant="outline" className="ml-2 px-2 py-0 h-5 text-xs">Direct Invitation</Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                    className={emailError ? "border-red-300 pr-10" : ""}
                  />
                  {emailError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>
              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                <p className="font-medium text-blue-700 mb-1">How it works:</p>
                <p>We'll send an invitation to this email address with instructions on how to join your family.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="username" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username-search" className="flex items-center">
                  Search by {searchType === 'email' ? 'Email' : 'Username'}
                  <Badge variant="outline" className="ml-2 px-2 py-0 h-5 text-xs">
                    {searchType === 'email' ? 'Email Search' : 'User Lookup'}
                  </Badge>
                </Label>
                
                {selectedUser ? (
                  <div className="flex items-center justify-between border rounded-md p-3 bg-green-50 border-green-200">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={selectedUser.avatarUrl || `https://avatar.vercel.sh/${selectedUser.username}`} />
                        <AvatarFallback>{selectedUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium">{selectedUser.username}</p>
                          <Check className="h-4 w-4 text-green-500 ml-2" />
                        </div>
                        <p className="text-xs text-gray-600">{selectedUser.email}</p>
                        <p className="text-xs text-green-600 mt-1">User selected for invitation</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelectedUser}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="username-search"
                      placeholder={searchType === 'email' ? "Search by email address..." : "Search by username..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              
              {!selectedUser && searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <div className="max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectUser(user)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatarUrl || `https://avatar.vercel.sh/${user.username}`} />
                          <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.displayName && user.displayName !== user.username && (
                            <p className="text-xs text-gray-400">{user.displayName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!selectedUser && searchQuery && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No users found matching "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try with a different {searchType === 'email' ? 'email' : 'username'} or use {searchType === 'email' ? 'username' : 'email'} search instead</p>
                </div>
              )}
              
              {!selectedUser && searchQuery.length < 2 && (
                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                  <p className="font-medium text-blue-700 mb-1">How it works:</p>
                  <p>Start typing to search for users by username or email address. Once you select a user, an invitation will be sent to their email address.</p>
                  <p className="mt-2 text-xs">Tip: Include @ to search by email address</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              (activeTab === 'email' && (!email || !!emailError)) || 
              (activeTab === 'username' && !selectedUser)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}