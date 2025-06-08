'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Star, 
  Trophy, 
  Calendar, 
  Mail, 
  Upload, 
  Save,
  Crown,
  Target,
  Zap
} from 'lucide-react';
import { ProfileHeaderSkeleton, ProfileFormSkeleton } from '@/components/ui/skeletons/settings-profile-skeletons';
import { User as UserType, UserProfileUpdateDTO, FamilyMemberAgeGroup, ProfileSettingsContentProps } from '@/lib/types';
import { ProfileUpdateFormData } from '@/lib/types/forms';
import { profileUpdateSchema } from '@/lib/schemas/auth';

export default function ProfileSettingsContent({ user: initialUser }: ProfileSettingsContentProps) {
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: initialUser?.username || '',
      email: initialUser?.email || '',
      firstName: initialUser?.firstName || '',
      lastName: initialUser?.lastName || '',
      bio: '',
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (initialUser) {
      form.reset({
        username: initialUser.username || '',
        email: initialUser.email || '',
        firstName: initialUser.firstName || '',
        lastName: initialUser.lastName || '',
        bio: '',
      });
    }
  }, [initialUser, form]);

  const onSubmit = async (data: ProfileUpdateFormData): Promise<void> => {
    setIsLoading(true);
    setMessage(null);

    try {
      const updateData: UserProfileUpdateDTO = {
        username: data.username || null,
        email: data.email || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        avatarUrl: null, // Not implemented yet
        bio: data.bio || null,
        preferences: null, // Not implemented yet
      };

      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgeGroupBadge = (ageGroup: FamilyMemberAgeGroup | undefined) => {
    // Default to Adult if ageGroup is undefined
    const safeAgeGroup = ageGroup ?? FamilyMemberAgeGroup.Adult;
    
    const variants = {
      [FamilyMemberAgeGroup.Child]: { variant: 'secondary' as const, color: 'bg-pink-100 text-pink-800', emoji: '🧒' },
      [FamilyMemberAgeGroup.Teen]: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800', emoji: '👦' },
      [FamilyMemberAgeGroup.Adult]: { variant: 'secondary' as const, color: 'bg-green-100 text-green-800', emoji: '👤' },
    };
    
    const config = variants[safeAgeGroup] || variants[FamilyMemberAgeGroup.Adult];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.emoji} {safeAgeGroup === FamilyMemberAgeGroup.Child ? 'Child' : safeAgeGroup === FamilyMemberAgeGroup.Teen ? 'Teen' : 'Adult'}
      </Badge>
    );
  };

  const getUserInitials = (user: UserType): string => {
    if (user.displayName) {
      const names = user.displayName.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username ? user.username[0].toUpperCase() : 'U';
  };

  // Show loading skeleton while user data is not available
  if (!initialUser) {
    return (
      <div className="space-y-6">
        <ProfileHeaderSkeleton 
          showAvatar={true}
          showBadges={true}
          showStats={true}
          userType="adult"
        />
        <ProfileFormSkeleton 
          fieldCount={5} 
          showAvatarUpload={true}
          showSocialLinks={false}
          showBio={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="h-6 w-6" />
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Header Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={initialUser.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getUserInitials(initialUser)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  title="Upload Avatar"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  {initialUser.displayName || `${initialUser.firstName} ${initialUser.lastName}` || initialUser.username}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{initialUser.email}</span>
                </div>
                <div className="flex justify-center">
                  {getAgeGroupBadge(initialUser.ageGroup)}
                </div>
                {initialUser.role === 'admin' && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            
            {/* Gamification Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Stats & Achievements
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Star className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {initialUser.points?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Points</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Achievements</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Tasks Done</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                </div>
              </div>
              
              <div className="text-center pt-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(initialUser.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Enter your email address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your first name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tell us about yourself..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 