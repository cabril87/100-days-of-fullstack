'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthContext';
import { authService } from '@/lib/services/authService';
import { familyService } from '@/lib/services/familyService';
import { notificationService } from '@/lib/services/notificationService';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Schema for profile update
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
});

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, refreshToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'invitations'>('profile');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);
  const [processingInvitationIds, setProcessingInvitationIds] = useState<string[]>([]);

  // Initialize the profile form
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      displayName: user?.displayName || '',
    },
  });

  // Initialize the password form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      resetProfile({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
      });
    }
  }, [user, resetProfile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [user, isLoading, router]);

  // Fetch pending invitations
  useEffect(() => {
    if (user && activeTab === 'invitations') {
      loadPendingInvitations();
    }
  }, [user, activeTab]);

  const loadPendingInvitations = async () => {
    if (!user) return;
    
    setLoadingInvitations(true);
    setInvitationsError(null);
    try {
      console.log('Fetching pending invitations for current user...');
      const response = await familyService.getUserPendingInvitations();
      
      if (response.data) {
        console.log(`Received ${response.data.length} pending invitations`);
        // Filter out any potential invitations with missing data
        const validInvitations = response.data.filter(inv => 
          inv && inv.id && inv.token && inv.familyName && inv.invitedBy
        );
        
        if (validInvitations.length !== response.data.length) {
          console.warn(`Filtered out ${response.data.length - validInvitations.length} invalid invitations`);
        }
        
        setPendingInvitations(validInvitations);
      } else if (response.error) {
        console.error('Error fetching invitations:', response.error);
        setInvitationsError(`Unable to load invitations: ${response.error}`);
        // Set empty array to avoid UI issues
        setPendingInvitations([]);
      } else {
        console.log('No invitations data returned');
        setPendingInvitations([]);
      }
    } catch (error) {
      console.error('Error loading pending invitations:', error);
      setInvitationsError('Failed to load invitations. Please try again later.');
      // Set empty array for safety
      setPendingInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string, token: string) => {
    setProcessingInvitationIds(prev => [...prev, invitationId]);
    try {
      const response = await familyService.joinFamily(token);
      if (response.data) {
        // Remove the invitation from the list
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingInvitationIds(prev => prev.filter(id => id !== invitationId));
    }
  };

  const handleDeclineInvitation = async (invitationId: string, token: string) => {
    setProcessingInvitationIds(prev => [...prev, invitationId]);
    try {
      const response = await notificationService.declineInvitation(token);
      
      if (!response.error) {
        // Remove the invitation from the list
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setProcessingInvitationIds(prev => prev.filter(id => id !== invitationId));
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const response = await authService.updateProfile(data);
      
      if (response.status === 204) {
        setUpdateSuccess(true);
        // Refresh user data to get the updated information
        await refreshToken();
      } else {
        setUpdateError(response.error || 'Failed to update profile');
      }
    } catch (error) {
      setUpdateError('An unexpected error occurred');
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsSubmitting(true);
      setPasswordError(null);
      setPasswordSuccess(false);

      const response = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.status === 204) {
        setPasswordSuccess(true);
        resetPassword({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setPasswordError(response.error || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred');
      console.error('Password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-1 ${
              activeTab === 'security'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-4 px-1 ${
              activeTab === 'invitations'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Family Invitations
          </button>
        </nav>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Profile Information</h2>
          
          {updateSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Profile updated successfully.
            </div>
          )}
          
          {updateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {updateError}
            </div>
          )}
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  {...profileRegister('username')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {profileErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.username.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  {...profileRegister('email')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...profileRegister('firstName')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...profileRegister('lastName')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  {...profileRegister('displayName')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This is the name that will be displayed to other users.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Change Password</h2>
          
          {passwordSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Password changed successfully.
            </div>
          )}
          
          {passwordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  {...passwordRegister('currentPassword')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  {...passwordRegister('newPassword')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 8 characters.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...passwordRegister('confirmPassword')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Pending Family Invitations</h2>
          
          {loadingInvitations ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : invitationsError ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{invitationsError}</p>
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="py-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No pending invitations</p>
              <p className="text-sm text-gray-400 mt-1">
                When someone invites you to join their family, you'll see the invitation here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => {
                const isProcessing = processingInvitationIds.includes(invitation.id);
                return (
                  <div key={invitation.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.familyName || 'Family'} Invitation</h3>
                        <p className="text-sm text-gray-500">
                          You've been invited to join {invitation.familyName || 'a family'}.
                        </p>
                        {invitation.invitedBy && (
                          <p className="text-xs text-gray-400 mt-1">
                            Invited by: {invitation.invitedBy}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvitation(invitation.id, invitation.token)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id, invitation.token)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadPendingInvitations}
                  disabled={loadingInvitations}
                >
                  {loadingInvitations ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Invitations'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 