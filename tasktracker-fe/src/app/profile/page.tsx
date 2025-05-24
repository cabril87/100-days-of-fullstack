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
import { 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  User, 
  Shield, 
  Mail, 
  Settings,
  Crown,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/card';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Profile Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Account Status"
            value="Active"
            icon={<User className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-green-400 to-emerald-500"
            isLoading={false}
          />
          <StatsCard
            title="Member Since"
            value={user.createdAt ? new Date(user.createdAt).getFullYear().toString() : 'Unknown'}
            icon={<Crown className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-purple-400 to-indigo-500"
            isLoading={false}
          />
          <StatsCard
            title="Profile"
            value="Premium"
            icon={<Star className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-yellow-400 to-orange-500"
            isLoading={false}
          />
        </div>
      
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <nav className="flex space-x-0 p-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'invitations'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Mail className="h-4 w-4" />
              Family Invitations
              {pendingInvitations.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingInvitations.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-gray-600">Update your personal details and preferences</p>
              </div>
            </div>
            
            {updateSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Profile updated successfully.
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <X className="h-5 w-5" />
                {updateError}
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    {...profileRegister('username')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {profileErrors.username && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {profileErrors.username?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...profileRegister('email')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {profileErrors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {profileErrors.email?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...profileRegister('firstName')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...profileRegister('lastName')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    {...profileRegister('displayName')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This is the name that will be displayed to other users.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="purple"
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                <p className="text-gray-600">Keep your account secure with a strong password</p>
              </div>
            </div>
            
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Password changed successfully.
              </div>
            )}
            
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <X className="h-5 w-5" />
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    {...passwordRegister('currentPassword')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {passwordErrors.currentPassword?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    {...passwordRegister('newPassword')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {passwordErrors.newPassword?.message}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Password must be at least 8 characters.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...passwordRegister('confirmPassword')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {passwordErrors.confirmPassword?.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="purple"
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pending Family Invitations</h2>
                <p className="text-gray-600">Manage your family membership invitations</p>
              </div>
            </div>
            
            {loadingInvitations ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : invitationsError ? (
              <div className="py-12 text-center">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg inline-flex items-center gap-2">
                  <X className="h-5 w-5" />
                  {invitationsError}
                </div>
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When someone invites you to join their family, you'll see the invitation here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => {
                  const isProcessing = processingInvitationIds.includes(invitation.id);
                  return (
                    <div key={invitation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
                          <UserPlus className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{invitation.familyName || 'Family'} Invitation</h3>
                          <p className="text-gray-600 mt-1">
                            You've been invited to join {invitation.familyName || 'a family'}.
                          </p>
                          {invitation.invitedBy && (
                            <p className="text-sm text-gray-500 mt-2">
                              Invited by: <span className="font-medium">{invitation.invitedBy}</span>
                            </p>
                          )}
                          <div className="flex gap-3 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineInvitation(invitation.id, invitation.token)}
                              disabled={isProcessing}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="green"
                              onClick={() => handleAcceptInvitation(invitation.id, invitation.token)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-center mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadPendingInvitations}
                    disabled={loadingInvitations}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    {loadingInvitations ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Refresh Invitations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 