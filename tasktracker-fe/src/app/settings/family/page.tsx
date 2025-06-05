'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  UserPlus, 
  Settings2, 
  Send,
  Trash2,
  Copy,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  Home
} from 'lucide-react';
import { 
  FamilyMemberListSkeleton,
  InvitationFormSkeleton
} from '@/components/ui/skeletons/family-invitation-skeletons';
import { 
  FamilyDTO,
  FamilyMemberDTO,
  InvitationDTO,
  FamilyRoleDTO,
  FamilyFormData,
  InvitationFormData,
  TransferOwnershipDTO,
  UserFamilyRelationships,
  FamilyManagementPermissions
} from '@/lib/types/family-invitation';
import { 
  familyCreateSchema,
  invitationSchema
} from '@/lib/schemas/family-invitation';
import { familyInvitationService } from '@/lib/services/familyInvitationService';

export default function FamilyManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has family admin access
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isFamilyAdmin = user?.isFamilyAdmin || isAdmin;

  // State for family data
  const [familyData, setFamilyData] = useState<FamilyDTO | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [familyRoles, setFamilyRoles] = useState<FamilyRoleDTO[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<InvitationDTO[]>([]);
  const [familyStats, setFamilyStats] = useState({
    memberCount: 0,
    pendingInvitations: 0,
    tasksCompleted: 0,
    pointsEarned: 0
  });

  // New state for enhanced family management
  const [familyRelationships, setFamilyRelationships] = useState<UserFamilyRelationships | null>(null);
  const [managementPermissions, setManagementPermissions] = useState<FamilyManagementPermissions | null>(null);
  const [canManageCurrentFamily, setCanManageCurrentFamily] = useState(true);

  // Forms
  const familyCreateForm = useForm<FamilyFormData>({
    resolver: zodResolver(familyCreateSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const invitationForm = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      roleId: 0,
      message: ''
    }
  });

  const transferOwnershipForm = useForm<TransferOwnershipDTO>({
    defaultValues: {
      familyId: 0,
      newOwnerId: 0,
      reason: ''
    }
  });

  // Load family data
  const loadFamilyData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load current family (handles null gracefully for new users)
      const currentFamily = await familyInvitationService.getCurrentFamily();
      setFamilyData(currentFamily);

      // Load age-based permissions from API (handles null gracefully)
      const permissions = await familyInvitationService.getFamilyManagementPermissions();
      setManagementPermissions(permissions);

      // Load family relationships (handles null gracefully)
      const relationships = await familyInvitationService.getUserFamilyRelationships();
      setFamilyRelationships(relationships);

      if (currentFamily) {
        // Only load family-specific data if user has a family
        try {
          // Check if user can manage this family based on age
          const canManage = await familyInvitationService.canUserManageFamily(currentFamily.id);
          setCanManageCurrentFamily(canManage);

          // Load family members
          const members = await familyInvitationService.getFamilyMembers(currentFamily.id);
          setFamilyMembers(members);

          // Load family roles
          const roles = await familyInvitationService.getFamilyRoles();
          setFamilyRoles(roles);

          // Load pending invitations
          const invitations = await familyInvitationService.getSentInvitations();
          setPendingInvitations(invitations.filter(inv => !inv.isAccepted));

          // Load family stats
          const stats = await familyInvitationService.getFamilyStats(currentFamily.id);
          setFamilyStats({
            memberCount: stats.memberCount,
            pendingInvitations: stats.activeInvitations,
            tasksCompleted: stats.totalTasksCompleted,
            pointsEarned: stats.totalPointsEarned
          });

          // Set form data for transfer ownership
          transferOwnershipForm.setValue('familyId', currentFamily.id);
        } catch (error) {
          console.warn('Failed to load some family data (this is normal for new users):', error);
          // Set default values for new users
          setCanManageCurrentFamily(false);
          setFamilyMembers([]);
          setFamilyRoles([]);
          setPendingInvitations([]);
          setFamilyStats({
            memberCount: 0,
            pendingInvitations: 0,
            tasksCompleted: 0,
            pointsEarned: 0
          });
        }
      } else {
        // Clear all family-specific data for users without families
        setCanManageCurrentFamily(false);
        setFamilyMembers([]);
        setFamilyRoles([]);
        setPendingInvitations([]);
        setFamilyStats({
          memberCount: 0,
          pendingInvitations: 0,
          tasksCompleted: 0,
          pointsEarned: 0
        });
      }

    } catch (error) {
      console.error('Failed to load basic family data:', error);
      // Only show error for critical failures, not for new users without families
      if (error instanceof Error && !error.message.includes('400')) {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load family information. Please try refreshing the page.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, transferOwnershipForm]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFamilyData();
    }
  }, [isAuthenticated, user, loadFamilyData]);

  // Create family handler
  const onCreateFamily = async (data: FamilyFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const newFamily = await familyInvitationService.createFamily(data);
      setFamilyData(newFamily);
      familyCreateForm.reset();
      setMessage({ type: 'success', text: 'Family created successfully! You can now invite members.' });
      await loadFamilyData(); // Reload data
    } catch (error) {
      console.error('Failed to create family:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create family' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send invitation handler
  const onSendInvitation = async (data: InvitationFormData) => {
    if (!familyData) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await familyInvitationService.sendInvitation({
        ...data,
        familyId: familyData.id
      });
      
      invitationForm.reset();
      setMessage({ type: 'success', text: `Invitation sent to ${data.email} successfully!` });
      await loadFamilyData(); // Reload to update pending invitations
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send invitation' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel invitation handler
  const cancelInvitation = async (invitationId: number) => {
    try {
      await familyInvitationService.cancelInvitation(invitationId);
      setMessage({ type: 'success', text: 'Invitation cancelled successfully' });
      await loadFamilyData();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to cancel invitation' 
      });
    }
  };

  // Update member role handler
  const updateMemberRole = async (memberId: number, newRoleId: number) => {
    try {
      await familyInvitationService.updateMemberRole(memberId, newRoleId);
      setMessage({ type: 'success', text: 'Member role updated successfully' });
      await loadFamilyData();
    } catch (error) {
      console.error('Failed to update member role:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update member role' 
      });
    }
  };

  // Remove member handler
  const removeMember = async (memberId: number) => {
    try {
      await familyInvitationService.removeFamilyMember(memberId);
      setMessage({ type: 'success', text: 'Member removed from family successfully' });
      await loadFamilyData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to remove member' 
      });
    }
  };

  // Transfer ownership handler (Pass the Baton)
  const onTransferOwnership = async (data: TransferOwnershipDTO) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await familyInvitationService.transferFamilyOwnership(data);
      transferOwnershipForm.reset();
      setMessage({ type: 'success', text: 'Family ownership transferred successfully! You are no longer the family admin.' });
      await loadFamilyData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to transfer family ownership' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Custom skeleton for family overview */}
        <Card>
          <CardHeader>
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </TabsList>
              <div className="space-y-4">
                <FamilyMemberListSkeleton 
                  memberCount={3}
                  showAvatars={true}
                  showRoles={true}
                  showActions={true}
                />
                <InvitationFormSkeleton 
                  showEmailField={true}
                  showRoleSelector={true} 
                  showSubmitButton={true}
                />
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Non-admin access denied
  if (!isFamilyAdmin) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6" />
            Family Management Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage family members, invitations, and roles
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Admin Access Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Family management features are only available to family administrators. 
                Contact your family admin to manage members and invitations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6" />
          Family Management Settings
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage family members, invitations, and roles
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* No Family Created Yet */}
      {!familyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Create Your Family
            </CardTitle>
            <CardDescription>
              Start by creating a family to manage members and invite others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...familyCreateForm}>
              <form onSubmit={familyCreateForm.handleSubmit(onCreateFamily)} className="space-y-6">
                <FormField
                  control={familyCreateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your family name" />
                      </FormControl>
                      <FormDescription>
                        Choose a name that represents your family (e.g., &quot;The Johnson Family&quot;)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={familyCreateForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your family or add a family motto..."
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a description or family motto to make your family page more personal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Family...
                    </>
                  ) : (
                    <>
                      <Home className="h-4 w-4" />
                      Create Family
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Family Management Tabs */}
      {familyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {familyData.name}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{familyStats.memberCount} members</Badge>
                <Badge variant="outline">{familyStats.pendingInvitations} pending</Badge>
              </div>
            </CardTitle>
            {familyData.description && (
              <CardDescription>{familyData.description}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
                <TabsTrigger value="ownership" disabled={!managementPermissions?.canTransferOwnership}>
                  Pass the Baton
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                          <p className="text-2xl font-bold">{familyStats.memberCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                          <p className="text-2xl font-bold">{familyStats.pendingInvitations}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</p>
                          <p className="text-2xl font-bold">{familyStats.tasksCompleted}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Crown className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                          <p className="text-2xl font-bold">{familyStats.pointsEarned}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Family Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      Family Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Family Created</span>
                        <span className="text-sm font-medium">{new Date(familyData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Members</span>
                        <span className="text-sm font-medium">{familyStats.memberCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Invitations</span>
                        <span className="text-sm font-medium">{familyStats.pendingInvitations}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Can Manage Family</span>
                        <span className="text-sm font-medium">{canManageCurrentFamily ? 'Yes' : 'No'}</span>
                      </div>
                      {managementPermissions && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Age Group</span>
                          <span className="text-sm font-medium">{managementPermissions.ageGroup}</span>
                        </div>
                      )}
                      {familyRelationships && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Admin Families</span>
                          <span className="text-sm font-medium">{familyRelationships.adminFamilies.length}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Family Members ({familyMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.user.avatarUrl || undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {member.user.firstName?.charAt(0) || member.user.username?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.user.displayName || `${member.user.firstName} ${member.user.lastName}` || member.user.username}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{member.user.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{member.role.name}</Badge>
                            <Select 
                              value={member.role.id.toString()} 
                              onValueChange={(value) => updateMemberRole(member.id, parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {familyRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {member.user.id !== user.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMember(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Invitations Tab */}
              <TabsContent value="invitations" className="space-y-6">
                {/* Send New Invitation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Invite New Member
                    </CardTitle>
                    <CardDescription>
                      Send an invitation to add a new member to your family
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...invitationForm}>
                      <form onSubmit={invitationForm.handleSubmit(onSendInvitation)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={invitationForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="member@example.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={invitationForm.control}
                            name="roleId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Family Role</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {familyRoles.map((role) => (
                                      <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={invitationForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personal Message (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Add a personal message to the invitation..."
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sending Invitation...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Pending Invitations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Pending Invitations ({pendingInvitations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingInvitations.length === 0 ? (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No pending invitations</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingInvitations.map((invitation) => (
                          <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{invitation.role.name}</Badge>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Sent {new Date(invitation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">&quot;{invitation.message}&quot;</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(invitation.token)}
                                title="Copy invitation link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pass the Baton Tab - Ownership Transfer */}
              <TabsContent value="ownership" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Pass the Baton - Transfer Family Ownership
                    </CardTitle>
                    <CardDescription>
                      Transfer family ownership to another member. This action cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!managementPermissions?.canTransferOwnership ? (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Transfer Not Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                          {user?.ageGroup === 0 ? 'Children cannot transfer family ownership.' :
                           user?.ageGroup === 1 ? 'Teens cannot transfer family ownership.' :
                           'Family ownership transfer is not available.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Warning Alert */}
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Important:</strong> Transferring ownership will make the selected member the new family admin. 
                            You will lose admin privileges and become a regular member. This action cannot be undone.
                          </AlertDescription>
                        </Alert>

                        <Form {...transferOwnershipForm}>
                          <form onSubmit={transferOwnershipForm.handleSubmit(onTransferOwnership)} className="space-y-6">
                            <FormField
                              control={transferOwnershipForm.control}
                              name="newOwnerId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Select New Family Owner</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose a family member" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {familyMembers
                                        .filter(member => member.user.id !== user?.id && member.user.ageGroup !== 0) // Exclude current user and children
                                        .map((member) => (
                                          <SelectItem key={member.id} value={member.user.id.toString()}>
                                            <div className="flex items-center gap-2">
                                              <span>{member.user.displayName || `${member.user.firstName} ${member.user.lastName}` || member.user.username}</span>
                                              <Badge variant="outline" className="text-xs">
                                                {member.user.ageGroup === 1 ? 'Teen' : 'Adult'}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Only teens and adults can become family owners. Children are not eligible.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={transferOwnershipForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Transfer (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder="Explain why you're transferring ownership..."
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This will be logged for family records.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center gap-4">
                              <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                variant="destructive"
                                className="flex items-center gap-2"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Transferring...
                                  </>
                                ) : (
                                  <>
                                    <Crown className="h-4 w-4" />
                                    Transfer Ownership
                                  </>
                                )}
                              </Button>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                This action cannot be undone
                              </p>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 