'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthContext';
import { authService } from '@/lib/services/authService';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    </div>
  );
} 