'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminService } from '@/lib/services/adminService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { 
  AdminUserCreateRequest, 
  getAgeGroupLabel
} from '@/lib/types/admin';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';
import { FamilyDTO, FamilyRoleDTO } from '@/lib/types/family-invitation';
import { 
  adminUserCreationSchema,
  AdminUserCreationFormData
} from '@/lib/schemas/admin';
import { 
  UserPlus, 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Baby,
  User,
  Crown,
  Users,
  Home
} from 'lucide-react';
import { UserCreationPageContentProps } from '@/lib/types/component-props';

export default function UserCreationPageContent({}: UserCreationPageContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [families, setFamilies] = useState<FamilyDTO[]>([]);
  const [familyRoles, setFamilyRoles] = useState<FamilyRoleDTO[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');

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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Load families and roles for assignment
      const [familiesResponse, rolesResponse] = await Promise.all([
        familyInvitationService.getAllFamilies().catch(() => []),
        familyInvitationService.getFamilyRoles().catch(() => [])
      ]);
      
      setFamilies(familiesResponse || []);
      setFamilyRoles(rolesResponse || []);
      
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

            {/* Family Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Family Assignment (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familyId">Select Family</Label>
                  <Select 
                    value={selectedFamilyId || "none"} 
                    onValueChange={(value) => {
                      const familyId = value === "none" ? "" : value;
                      setSelectedFamilyId(familyId);
                      form.setValue('familyId', familyId ? parseInt(familyId) : undefined);
                    }}
                    disabled={loading || loadingData || families.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingData ? "Loading families..." : 
                        families.length === 0 ? "No families available" : 
                        "Select a family"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No family assignment</SelectItem>
                      {families.map((family) => (
                        <SelectItem key={family.id} value={family.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            {family.name}
                            <span className="text-xs text-gray-500">
                              ({family.memberCount} members)
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
                    value={form.watch('familyRoleId')?.toString() || ''} 
                    onValueChange={(value) => form.setValue('familyRoleId', parseInt(value) || undefined)}
                    disabled={loading || loadingData || !selectedFamilyId || familyRoles.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedFamilyId ? "Select family first" :
                        loadingData ? "Loading roles..." : 
                        familyRoles.length === 0 ? "No roles available" : 
                        "Select family role"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {familyRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {role.name}
                            {role.description && (
                              <span className="text-xs text-gray-500">
                                - {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedFamilyId && families.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Family Assignment:</strong> This user will be added to the selected family with the chosen role. 
                      They will have access to family tasks, calendar, and other shared features.
                    </div>
                  </div>
                </div>
              )}
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