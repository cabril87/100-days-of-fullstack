'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService } from '@/lib/services/userService';
import { familyService } from '@/lib/services/familyService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Search, Mail, User, Copy, UserPlus, 
  Home, AlertCircle, ArrowLeft, CheckCircle2 
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Family } from '@/lib/types/family';

interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface FamilyFormValues {
  familyId: string;
}

interface UserLookupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect?: (user: UserSearchResult) => void;
  onInternalUserSelect?: (user: UserSearchResult) => void; // For selection without closing dialog
  specificFamilyId?: string; // Optional specific family ID if called from family context
  onInviteSuccess?: () => void;
  preselectedUser?: UserSearchResult; // Optional pre-selected user to skip search
}

export default function UserLookupDialog({
  isOpen,
  onClose,
  onUserSelect,
  onInternalUserSelect,
  specificFamilyId,
  onInviteSuccess,
  preselectedUser
}: UserLookupDialogProps) {
  // Define dialog steps for a clear flow
  type DialogStep = 'search' | 'select_family';
  const [currentStep, setCurrentStep] = useState<DialogStep>('search');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('username');
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const { showToast } = useToast();
  
  // Create form
  const form = useForm<FamilyFormValues>({
    defaultValues: {
      familyId: specificFamilyId || ''
    }
  });

  // Track if a family is selected
  const [isFamilySelected, setIsFamilySelected] = useState<boolean>(!!specificFamilyId);

  // Watch for family selection changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      setIsFamilySelected(!!value.familyId);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Set the familyId when specificFamilyId changes
  useEffect(() => {
    if (specificFamilyId) {
      form.setValue('familyId', specificFamilyId);
    }
  }, [specificFamilyId, form]);

  // Initialize dialog based on if we have a preselected user
  useEffect(() => {
    if (isOpen) {
      loadFamilies();
      
      // If we have a preselected user, set it and go to family selection step
      if (preselectedUser) {
        setSelectedUser(preselectedUser);
        setCurrentStep('select_family');
      } else {
        setCurrentStep('search');
      }
    }
  }, [isOpen, preselectedUser]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      if (!preselectedUser) {
        setSelectedUser(null);
      }
      setIsSearching(false);
      setActiveTab('username');
      if (!specificFamilyId) {
        form.reset({ familyId: '' });
      }
    }
  }, [isOpen, specificFamilyId, form, preselectedUser]);

  // Load user's families
  const loadFamilies = async () => {
    if (specificFamilyId) {
      form.setValue('familyId', specificFamilyId);
      return;
    }
    
    setLoadingFamilies(true);
    try {
      const response = await familyService.getAllFamilies();
      
      if (response.data) {
        setFamilies(response.data);
        
        if (response.data.length > 0 && !form.getValues().familyId) {
          form.setValue('familyId', response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoadingFamilies(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search for users
  const performSearch = async () => {
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

  // Handle user selection
  const handleUserSelect = (user: UserSearchResult) => {
    // Log the selected user for debugging
    console.log('User selected within dialog:', user);
    
    // Store the selected user in state
    setSelectedUser(user);
    
    // If this dialog is for external user selection, call the handler
    if (onUserSelect) {
      onUserSelect(user);
    }
    
    // If this dialog is for internal user selection (before invitation)
    if (onInternalUserSelect) {
      onInternalUserSelect(user);
    }
    
    // If we're in username search tab, proceed to family selection step
    if (activeTab === 'username') {
      setCurrentStep('select_family');
    }
  };

  // Copy to clipboard utility
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${type} copied to clipboard`, 'success');
  };

  // Add this near the other state variables
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // At the top with other state variables
  const [isSuccess, setIsSuccess] = useState(false);

  // Form submission for family association
  const onSubmit = async (data: FamilyFormValues) => {
    console.log('Submitting with data:', data);
    
    // Clear any previous error
    setErrorMessage(null);
    
    if (!selectedUser || !data.familyId) {
      showToast('Please select both a user and a family', 'error');
      return;
    }

    setIsInviting(true);
    try {
      const response = await familyService.inviteMember(data.familyId, selectedUser.email);
      
      if (response.status === 200 || response.status === 201) {
        // Show success state and message
        setIsSuccess(true);
        showToast(`${selectedUser.username} has been associated with your family!`, 'success');
        
        // Sync family state to ensure data consistency
        try {
          await familyService.syncFamilyState(data.familyId, 'member invitation');
        } catch (syncError) {
          console.error('Error syncing family state:', syncError);
          // We continue even if sync fails
        }
        
        // Delay closing to show success state
        setTimeout(() => {
          if (onInviteSuccess) {
            onInviteSuccess();
          }
          onClose();
        }, 1500);
      } else {
        setErrorMessage(response.error || 'Failed to associate user with family');
        showToast(response.error || 'Failed to associate user with family', 'error');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error associating user with family';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsInviting(false);
    }
  };

  // Reset success state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Get family name from ID
  const getFamilyName = (id: string) => {
    const family = families.find(f => f.id === id);
    return family?.name || 'Unknown Family';
  };

  // Clear selected user and go back to search
  const goBackToSearch = () => {
    if (!preselectedUser) {
      setSelectedUser(null);
    }
    setCurrentStep('search');
  };

  // Render the search interface
  const renderSearchStep = () => (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="username" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            By Username
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            By Email
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <div className="grid gap-2">
            <Label htmlFor="search-input">
              {activeTab === 'username' ? 'Search by Username' : 'Search by Email'}
            </Label>
            <div className="relative">
              <Input
                id="search-input"
                placeholder={activeTab === 'username' ? "Enter username..." : "Enter email address..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>
            
          {searchResults.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm text-gray-500 mb-2 block">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
              </Label>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleUserSelect(user)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={user.avatarUrl || `https://avatar.vercel.sh/${user.username}`} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {user.displayName && user.displayName !== user.username && (
                          <p className="text-xs text-gray-400 truncate">{user.displayName}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
            
          {searchQuery && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="mt-4 text-center py-4 text-gray-500 bg-gray-50 rounded-md">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No users found matching "{searchQuery}"</p>
              <p className="text-xs mt-1">Try a different search term or use {activeTab === 'username' ? 'email' : 'username'} search</p>
            </div>
          )}
            
          {(!searchQuery || searchQuery.length < 2) && (
            <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
              <p className="font-medium text-blue-700 mb-1">How to search:</p>
              <p>Type at least 2 characters to search for users {activeTab === 'username' ? 'by username' : 'by email address'}.</p>
              <p className="mt-2 text-xs">After selecting a user, you'll choose which family to associate them with.</p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );

  // Render the family selection step
  const renderFamilySelectionStep = () => {
    if (!selectedUser) return null;
    
    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-green-700 mb-2">Invitation Sent!</h3>
          <p className="text-center text-gray-600 mb-2">
            {selectedUser.email.includes('@') ? selectedUser.email : selectedUser.username} has been successfully invited to join your family.
          </p>
          <p className="text-center text-gray-500 text-sm">
            They will receive an email with instructions to accept the invitation.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={goBackToSearch} 
            className="mr-2"
            disabled={!!preselectedUser}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h3 className="text-lg font-medium">Associate User with Family</h3>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={selectedUser.avatarUrl || `https://avatar.vercel.sh/${selectedUser.username}`} />
              <AvatarFallback>{selectedUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedUser.displayName || selectedUser.username}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{selectedUser.email}</span>
              </div>
            </div>
          </div>
        </div>
          
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <Home className="h-4 w-4 mr-2 text-blue-600" />
                Select Family
              </h4>
              
              <FormField
                control={form.control}
                name="familyId"
                render={({ field }) => (
                  <FormItem>
                    {specificFamilyId ? (
                      <div className="bg-white border rounded p-3 mb-2 flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">{getFamilyName(specificFamilyId)}</span>
                      </div>
                    ) : (
                      <>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setIsFamilySelected(!!value);
                          }}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={loadingFamilies || families.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder="Select a family for this user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {loadingFamilies ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading families...</span>
                              </div>
                            ) : families.length === 0 ? (
                              <div className="p-2 text-center text-sm text-gray-500">
                                No families available
                              </div>
                            ) : (
                              families.map(family => (
                                <SelectItem key={family.id} value={family.id}>
                                  <div className="flex items-center">
                                    <Home className="h-3.5 w-3.5 mr-2 text-gray-500" />
                                    {family.name}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {!field.value && (
                          <div className="mt-1 text-sm text-amber-700 flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            <span>You must select a family</span>
                          </div>
                        )}
                        <FormDescription>
                          Select which family to associate this user with
                        </FormDescription>
                        <FormMessage />
                      </>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <h4 className="font-medium text-sm mb-3">What happens next?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>An invitation email will be sent to {selectedUser.email}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Once accepted, they'll have access to family resources</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Family admins can manage permissions at any time</span>
                </li>
              </ul>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4 flex justify-end gap-2">  
              <Button
                type="submit"
                size="sm"
                disabled={isInviting || !isFamilySelected}
                className={`gap-2 ${
                  !isFamilySelected 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors'
                }`}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Associating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Associate & Invite
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };

  // Main dialog content
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'search' 
              ? 'Find User' 
              : 'Associate User with Family'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'search'
              ? 'Search for users by username or email address'
              : `Complete the process to associate ${selectedUser?.username} with a family`}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'search' ? renderSearchStep() : renderFamilySelectionStep()}
      </DialogContent>
    </Dialog>
  );
} 