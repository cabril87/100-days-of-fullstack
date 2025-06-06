'use client';

import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminService } from '@/lib/services/adminService';
import { 
  AdminUserCreateRequest, 
  AdminFamilySelection, 
  FamilyRole, 
  getAgeGroupLabel
} from '@/lib/types/admin';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';
import { 
  adminUserCreationSchema,
  AdminUserCreationFormData
} from '@/lib/schemas/admin';
import { 
  UserPlus, 
  ArrowLeft, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Home,
  Baby,
  User,
  Crown
} from 'lucide-react';



export default function AdminUserCreationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [families, setFamilies] = useState<AdminFamilySelection[]>([]);
  const [familyRoles, setFamilyRoles] = useState<FamilyRole[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Check if user is global admin
  const isGlobalAdmin = user?.email?.toLowerCase() === 'admin@tasktracker.com';

  const form = useForm<AdminUserCreationFormData>({
    resolver: zodResolver(adminUserCreationSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      ageGroup: FamilyMemberAgeGroup.Adult,
      familyId: undefined,
      familyRoleId: undefined,
      dateOfBirth: '',
    },
  });

  // Get controlled values for Select components to avoid controlled/uncontrolled warnings
  const familyIdValue = form.watch('familyId');
  const familyRoleIdValue = form.watch('familyRoleId');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!isGlobalAdmin) {
      router.push('/dashboard');
      return;
    }

    loadInitialData();
  }, [user, router, isGlobalAdmin]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [familiesData, rolesData] = await Promise.all([
        adminService.getAccessibleFamilies(),
        adminService.getFamilyRoles()
      ]);
      
      setFamilies(familiesData);
      setFamilyRoles(rolesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load families and roles. Some features may not work correctly.' 
      });
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: AdminUserCreationFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const userData: AdminUserCreateRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        ageGroup: data.ageGroup,
        familyId: data.familyId || undefined,
        familyRoleId: data.familyRoleId || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
      };

      const result = await adminService.createUser(userData);
      
      setMessage({ 
        type: 'success', 
        text: result.message 
      });
      
      // Reset form
      form.reset();
      
      console.log('User created successfully:', result);
    } catch (error) {
      console.error('Failed to create user:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create user' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getAgeGroupIcon = (ageGroup: FamilyMemberAgeGroup) => {
    switch (ageGroup) {
      case FamilyMemberAgeGroup.Child:
        return <Baby className="h-4 w-4" />;
      case FamilyMemberAgeGroup.Teen:
        return <User className="h-4 w-4" />;
      case FamilyMemberAgeGroup.Adult:
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };



  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isGlobalAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don&apos;t have permission to access the admin user creation.
          </p>
          <Button onClick={() => router.push('/admin')}>
            <Home className="h-4 w-4 mr-2" />
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            onClick={() => router.push('/admin')} 
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-blue-600" />
          Create New User
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new user account with optional family assignment for testing privileges and Pass the Baton functionality
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* User Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            User Account Details
          </CardTitle>
          <CardDescription>
            Fill in the user information below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...form.register('username')}
                  placeholder="Enter username"
                  disabled={loading}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="Enter email address"
                  disabled={loading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="Enter first name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  placeholder="Enter last name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  placeholder="Enter password (min 6 characters)"
                  disabled={loading}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register('confirmPassword')}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Age Group Selection */}
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group *</Label>
              <Select 
                value={form.watch('ageGroup') !== undefined ? form.watch('ageGroup').toString() : undefined} 
                onValueChange={(value) => form.setValue('ageGroup', parseInt(value) as FamilyMemberAgeGroup)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FamilyMemberAgeGroup)
                    .filter(value => typeof value === 'number')
                    .map((ageGroup) => (
                      <SelectItem key={ageGroup} value={ageGroup.toString()}>
                        <div className="flex items-center gap-2">
                          {getAgeGroupIcon(ageGroup as FamilyMemberAgeGroup)}
                          {getAgeGroupLabel(ageGroup as FamilyMemberAgeGroup)}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Age group determines family management permissions and Pass the Baton eligibility
              </p>
            </div>

            {/* Optional Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register('dateOfBirth')}
                disabled={loading}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If provided, age group will be calculated automatically
              </p>
            </div>

            {/* Family Assignment */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Family Assignment (Optional)
              </h3>
              
              {loadingData ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading families and roles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="familyId">Assign to Family</Label>
                    <Select 
                      value={familyIdValue !== undefined ? familyIdValue.toString() : 'none'} 
                      onValueChange={(value) => form.setValue('familyId', value && value !== 'none' ? parseInt(value) : undefined)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select family (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No family assignment</SelectItem>
                        {families.map((family) => (
                          <SelectItem key={family.id} value={family.id.toString()}>
                            <div className="flex flex-col">
                              <span>{family.name}</span>
                              <span className="text-xs text-gray-500">
                                {family.memberCount} members • Created {new Date(family.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyRoleId">Family Role</Label>
                    <Select 
                      value={familyRoleIdValue !== undefined ? familyRoleIdValue.toString() : 'default'} 
                      onValueChange={(value) => form.setValue('familyRoleId', value && value !== 'default' ? parseInt(value) : undefined)}
                      disabled={loading || !familyIdValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (Member)</SelectItem>
                        {familyRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            <div className="flex flex-col">
                              <span>{role.name}</span>
                              {role.description && (
                                <span className="text-xs text-gray-500">{role.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!familyIdValue && (
                      <p className="text-sm text-gray-500">Select a family first to choose a role</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Family Assignment Benefits:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Test family privilege management and role-based permissions</li>
                  <li>• Practice Pass the Baton ownership transfer functionality</li>
                  <li>• Verify age-based family management restrictions</li>
                  <li>• Simulate real family scenarios for development testing</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || loadingData}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 