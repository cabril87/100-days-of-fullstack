'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
  Home,
  RotateCcw,
  Sparkles
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
import { SmartInvitationWizard } from '@/components/family/SmartInvitationWizard';

export default function FamilyManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [familyToLeave, setFamilyToLeave] = useState<FamilyDTO | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<FamilyDTO | null>(null);
  const [showSmartInvitationWizard, setShowSmartInvitationWizard] = useState(false);

  // Check if user has family admin access
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isFamilyAdmin = user?.isFamilyAdmin || isAdmin;
  
  // Check if user can create families based on age group
  const canCreateFamily = user?.ageGroup !== 0; // Child = 0, Teen = 1, Adult = 2 (teens and adults can create families)

  // State for family data
  const [familyData, setFamilyData] = useState<FamilyDTO | null>(null);
  const [allFamilies, setAllFamilies] = useState<FamilyDTO[]>([]);
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

      // Load family relationships to get all families user belongs to
      console.log('🔍 CALLING getUserFamilyRelationships API...');
      const relationships = await familyInvitationService.getUserFamilyRelationships();
      console.log('🔍 getUserFamilyRelationships RESPONSE:', relationships);
      setFamilyRelationships(relationships);

      // Combine all families user belongs to (with null safety)
      const allUserFamilies = [
        ...(relationships?.adminFamilies || []),
        ...(relationships?.memberFamilies || []),
        ...(relationships?.managementFamilies || [])
      ];

      // Remove duplicates by ID
      const uniqueFamilies = allUserFamilies.filter((family, index, self) => 
        index === self.findIndex(f => f.id === family.id)
      );
      setAllFamilies(uniqueFamilies);

      // Load current family (or first family if multiple)
      const currentFamily = await familyInvitationService.getUserFamily();
      console.log('Current family from API:', currentFamily);
      console.log('Unique families found:', uniqueFamilies.length, uniqueFamilies);
      
      // Only set family data if user actually has families
      const selectedFamily = currentFamily || (uniqueFamilies.length > 0 ? uniqueFamilies[0] : null);
      console.log('Selected family:', selectedFamily);
      setFamilyData(selectedFamily);

      // Load age-based permissions from API (handles null gracefully)
      const permissions = await familyInvitationService.getFamilyManagementPermissions();
      setManagementPermissions(permissions);

            // Always load family roles (they're global, not family-specific)
      try {
        const roles = await familyInvitationService.getFamilyRoles();
        console.log('Family roles API response:', roles);
        
        setFamilyRoles(roles);
        console.log('Successfully set family roles:', roles.length, 'roles');
      } catch (error) {
        console.error('Failed to load family roles:', error);
        setFamilyRoles([]);
      }

      if (currentFamily?.id) {
        // Only load family-specific data if user has a family with valid ID
        try {
          // Check if user can manage this family based on age
          const canManage = await familyInvitationService.canUserManageFamily(currentFamily.id);
          setCanManageCurrentFamily(canManage);

          // Load family members
          const members = await familyInvitationService.getFamilyMembers(currentFamily.id);
          setFamilyMembers(members);

                  // Load pending invitations with error handling
        try {
          const invitations = await familyInvitationService.getSentInvitations();
          setPendingInvitations(invitations.filter(inv => !inv.isAccepted));
        } catch (error) {
          console.warn('Failed to load sent invitations, continuing without them:', error);
          setPendingInvitations([]);
        }

          // Load family stats
          const stats = await familyInvitationService.getFamilyStats(currentFamily.id);
          setFamilyStats({
            memberCount: stats.memberCount,
            pendingInvitations: stats.pendingInvitations,
            tasksCompleted: stats.totalTasks,
            pointsEarned: stats.totalPoints
          });

          // Set form data for transfer ownership
          transferOwnershipForm.setValue('familyId', currentFamily.id);
        } catch (error) {
          console.warn('Failed to load some family data (this is normal for new users):', error);
          // Set default values for new users
          setCanManageCurrentFamily(false);
          setFamilyMembers([]);
          setPendingInvitations([]);
          setFamilyStats({
            memberCount: 0,
            pendingInvitations: 0,
            tasksCompleted: 0,
            pointsEarned: 0
          });
        }
      } else {
        // Clear family-specific data for users without families
        setCanManageCurrentFamily(false);
        setFamilyMembers([]);
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

  // Auto-refresh when page gains focus (useful after admin seeding)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && user && !isLoading) {
        console.log('Page gained focus, refreshing family data...');
        loadFamilyData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, user, isLoading, loadFamilyData]);

  // Manual refresh handler
  const refreshFamilyData = async () => {
    setMessage(null);
    await loadFamilyData();
    setMessage({ type: 'success', text: 'Family data refreshed successfully!' });
  };

  // Create family handler
  const onCreateFamily = async (data: FamilyFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      console.log('🔨 Creating family with data:', data);
      const newFamily = await familyInvitationService.createFamily(data);
      console.log('✅ Family created successfully:', newFamily);
      
      // Immediately update states
      setFamilyData(newFamily);
      setAllFamilies(prev => {
        const updated = [...prev, newFamily];
        console.log('📋 Updated allFamilies:', updated.length, 'families');
        return updated;
      });
      
      familyCreateForm.reset();
      setMessage({ type: 'success', text: 'Family created successfully! You can now invite members.' });
      
      // Wait a bit for the database to be consistent, then reload
      console.log('⏳ Waiting 500ms before reloading family data...');
      setTimeout(async () => {
        console.log('🔄 Reloading family data after creation...');
        await loadFamilyData();
      }, 500);
    } catch (error) {
      console.error('❌ Failed to create family:', error);
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
        email: data.email,
        familyId: familyData.id,
        familyRoleId: data.roleId,
        message: data.message
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
              await familyInvitationService.updateMemberRoleInUserFamily(memberId, newRoleId);
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
              await familyInvitationService.removeFamilyMemberFromUserFamily(memberId);
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

  // Switch to a different family
  const switchToFamily = async (family: FamilyDTO) => {
    setFamilyData(family);
    await loadSelectedFamilyData(family);
  };

  // Load data for the selected family
  const loadSelectedFamilyData = async (family: FamilyDTO) => {
    try {
      setIsLoading(true);

      // Check if user can manage this family based on age
      const canManage = await familyInvitationService.canUserManageFamily(family.id);
      setCanManageCurrentFamily(canManage);

      // Load family-specific data
      const [members, invitations, stats] = await Promise.all([
        familyInvitationService.getFamilyMembers(family.id),
        familyInvitationService.getSentInvitations(),
        familyInvitationService.getFamilyStats(family.id)
      ]);

      setFamilyMembers(members);
      setPendingInvitations(invitations.filter(inv => !inv.isAccepted && inv.familyId === family.id));
      setFamilyStats({
        memberCount: stats.memberCount,
                    pendingInvitations: stats.pendingInvitations,
            tasksCompleted: stats.totalTasks,
            pointsEarned: stats.totalPoints
      });

      // Set form data for transfer ownership
      transferOwnershipForm.setValue('familyId', family.id);

    } catch (error) {
      console.warn('Failed to load family data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Leave specific family handler
  const leaveFamily = async (familyToLeave?: FamilyDTO) => {
    const targetFamily = familyToLeave || familyData;
    if (!targetFamily) return;

    // Show confirmation modal instead of alert
    setFamilyToLeave(targetFamily);
    setShowLeaveConfirmModal(true);
  };

  // Confirm leave family after modal confirmation
  const confirmLeaveFamily = async () => {
    if (!familyToLeave) return;

    setIsSubmitting(true);
    setMessage(null);
    setShowLeaveConfirmModal(false);

    try {
              await familyInvitationService.leaveFamilyAsUser();
      setMessage({ type: 'success', text: `You have left "${familyToLeave.name}" successfully.` });
      
      // Reload all families to update the list
      await loadFamilyData();
      
    } catch (error) {
      console.error('Failed to leave family:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to leave family' 
      });
    } finally {
      setIsSubmitting(false);
      setFamilyToLeave(null);
    }
  };

  // Delete family function
  const deleteFamily = async (familyToDelete: FamilyDTO) => {
    setFamilyToDelete(familyToDelete);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteFamily = async () => {
    if (!familyToDelete) return;
    
    setIsSubmitting(true);
    setMessage(null);
    setShowDeleteConfirmModal(false);

    try {
      await familyInvitationService.deleteFamily(familyToDelete.id);
      setMessage({ type: 'success', text: `Family '${familyToDelete.name}' permanently deleted` });
      
      // Reload all families to update the list
      await loadFamilyData();
      
      // Clear selected family if it was the deleted one
      if (familyData?.id === familyToDelete.id) {
        setFamilyData(null);
      }
      
    } catch (error) {
      console.error('Failed to delete family:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete family' 
      });
    } finally {
      setIsSubmitting(false);
      setFamilyToDelete(null);
    }
  };

  // Helper function to get user role in a specific family
  const getUserRoleInFamily = (family: FamilyDTO): string => {
    if (!familyRelationships) return 'Member';
    
    if (familyRelationships.adminFamilies?.some(f => f.id === family.id)) {
      return 'Admin';
    }
    if (familyRelationships.managementFamilies?.some(f => f.id === family.id)) {
      return 'Manager';
    }
    if (familyRelationships.memberFamilies?.some(f => f.id === family.id)) {
      return 'Member';
    }
    
    return 'Member';
  };

  // Smart family analysis for leaving recommendations  
  const analyzeFamilyComposition = () => {
    if (!familyMembers || familyMembers.length === 0) {
      return { canLeave: false, shouldDelete: true, reason: 'Empty family should be deleted' };
    }

    const currentUserId = user?.id;
    const otherMembers = familyMembers.filter(m => m.user.id !== currentUserId);
    
    if (otherMembers.length === 0) {
      return { canLeave: false, shouldDelete: true, reason: 'You are the only member' };
    }

    const adults = otherMembers.filter(m => m.user.ageGroup === 2); // Adult = 2
    const teens = otherMembers.filter(m => m.user.ageGroup === 1);  // Teen = 1  
    const children = otherMembers.filter(m => m.user.ageGroup === 0); // Child = 0
    const otherAdmins = otherMembers.filter(m => m.role.name === 'Admin');

    // If there are other admins, leaving is fine
    if (otherAdmins.length > 0) {
      return { canLeave: true, shouldDelete: false, reason: 'Other admins can manage the family' };
    }

    // If there are other adults, can pass baton
    if (adults.length > 0) {
      return { 
        canLeave: false, 
        shouldDelete: false, 
        canPassBaton: true,
        reason: 'Consider transferring ownership to another adult first',
        eligibleMembers: adults
      };
    }

    // If only teens and children, depends on family size and teen capability
    if (teens.length > 0 && familyMembers.length <= 5) {
      const hasChildren = children.length > 0;
      return {
        canLeave: false,
        shouldDelete: hasChildren, // Delete if children present, teens might struggle
        canPassBaton: !hasChildren, // Only pass to teen if no children
        reason: hasChildren 
          ? 'Consider deleting - teens managing children is complex'
          : 'Consider transferring to teen or deleting',
        eligibleMembers: teens
      };
    }

    // Only children or family too large for teen management
    return {
      canLeave: false,
      shouldDelete: true,
      reason: children.length > 0 
        ? 'Children cannot manage families - deletion recommended'
        : 'Family too large for teen management'
    };
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

  // Check if user has permission to access family management
  const hasAccessPermission = () => {
    // Children (age group 0) are blocked from family management
    const isChild = user?.ageGroup === 0;
    if (isChild) return false;
    
    // Global admins always have access
    if (isAdmin) return true;
    
    // If user has no families, check if they can create one based on age
    if (!familyData || allFamilies.length === 0) {
      return canCreateFamily; // Teens and Adults can create families
    }
    
    // If user has families, ALL non-child members can access family management
    // (includes invitation features for regular family members)
    if (familyData) {
      // Regular family members (non-children) can access invitation features
      return true;
    }
    
    return false;
  };

  // Block access only if user doesn't have any permission to manage families
  if (!hasAccessPermission()) {
    const isChild = user?.ageGroup === 0; // Child = 0
    
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
                {isChild ? 'Age Restriction' : 'Admin Access Required'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {isChild 
                  ? 'Family management features are not available for children. Ask a parent or guardian to manage family settings.'
                  : 'Family management features are only available to family administrators. Contact your family admin to manage members and invitations, or create your own family.'
                }
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
          {isFamilyAdmin ? (
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Family Admin
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
              <Home className="h-3 w-3 mr-1" />
              Manager
            </Badge>
          )}
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

            {/* Create Your First Family - Only show when user has no families */}
      {allFamilies.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Create Your First Family
            </CardTitle>
            <CardDescription>
              Start by creating a family to manage members, tasks, and invite others
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
                      <FormLabel htmlFor="family-name">Family Name</FormLabel>
                      <FormControl>
                        <Input {...field} id="family-name" placeholder="Enter your family name" />
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
                      <FormLabel htmlFor="family-description">Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          id="family-description"
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

      {/* Create Another Family - Show button when user has families */}
      {allFamilies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Create Another Family
            </CardTitle>
            <CardDescription>
              Create additional families for different groups or purposes
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
                      <FormLabel htmlFor="new-family-name">Family Name</FormLabel>
                      <FormControl>
                        <Input {...field} id="new-family-name" placeholder="Enter your family name" />
                      </FormControl>
                      <FormDescription>
                        Choose a name that represents your family (e.g., &quot;Work Team&quot;, &quot;Study Group&quot;)
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
                      <FormLabel htmlFor="new-family-description">Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          id="new-family-description"
                          placeholder="Describe this family or add a motto..."
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a description to help distinguish this family from your others
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

      {/* My Families List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Families ({allFamilies.length})
          </CardTitle>
          <CardDescription>
            All families you belong to - click to manage
          </CardDescription>
            </div>
            <Button 
              onClick={refreshFamilyData}
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allFamilies.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No families yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Create your first family above to get started!
              </p>
              {isAdmin && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                     <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                     <strong>Admin:</strong> If you&apos;ve used the Family Seeding tool, click &quot;Refresh&quot; above to see your seeded families.
                   </p>
                  <Button
                    onClick={refreshFamilyData}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh Now
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {allFamilies.map((family) => {
                const isSelected = familyData?.id === family.id;
                const userRole = getUserRoleInFamily(family);
                
                return (
                  <div 
                    key={family.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                    onClick={() => {
                      console.log('🔍 Family card clicked:', family.name, 'ID:', family.id);
                      console.log('🚀 Navigating to:', `/family/${family.id}`);
                      router.push(`/family/${family.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {family.name}
                          {isSelected && <span className="ml-2 text-blue-600">(Selected)</span>}
                        </h3>
                        {family.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {family.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{userRole}</Badge>
                          <span className="text-xs text-gray-500">
                            Created {new Date(family.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            switchToFamily(family);
                          }}
                        >
                          {isSelected ? "Managing" : "Manage"}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            leaveFamily(family);
                          }}
                        >
                          Leave
                        </Button>
                        
                        {/* Only show delete for admins */}
                        {(familyRelationships?.adminFamilies?.some(f => f.id === family.id)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 hover:text-red-800 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFamily(family);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Management Tabs - Show if family selected */}
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
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Family Overview
                      </div>
                      {familyData && (
                        <Button 
                          onClick={() => {
                            console.log('🏠 View Details button clicked for family:', familyData.name, 'ID:', familyData.id);
                            console.log('🚀 Navigating to:', `/family/${familyData.id}`);
                            router.push(`/family/${familyData.id}`);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      )}
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
                          <span className="text-sm font-medium">{familyRelationships?.adminFamilies?.length}</span>
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
                      Family Members ({familyMembers.length ?? 0})
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
                                {!Array.isArray(familyRoles) || familyRoles.length === 0 ? (
                                  <SelectItem value="" disabled>
                                    Loading roles...
                                  </SelectItem>
                                ) : (
                                  familyRoles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                      {role.name}
                                    </SelectItem>
                                  ))
                                )}
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
                    <div className="flex items-center justify-between">
                      <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Invite New Member
                    </CardTitle>
                    <CardDescription>
                      Send an invitation to add a new member to your family
                    </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowSmartInvitationWizard(true)}
                        className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                      >
                        <Sparkles className="h-4 w-4" />
                        Smart Invite
                      </Button>
                    </div>
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
                                <FormLabel htmlFor="invitation-email">Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} id="invitation-email" type="email" placeholder="member@example.com" />
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
                                <FormLabel htmlFor="invitation-role">Family Role</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger id="invitation-role">
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {!Array.isArray(familyRoles) || familyRoles.length === 0 ? (
                                      <SelectItem value="" disabled>
                                        Loading roles...
                                      </SelectItem>
                                    ) : (
                                      familyRoles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                          {role.name}
                                        </SelectItem>
                                      ))
                                    )}
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
                              <FormLabel htmlFor="invitation-message">Personal Message (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  id="invitation-message"
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
                                  <FormLabel htmlFor="transfer-new-owner">Select New Family Owner</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                    <FormControl>
                                      <SelectTrigger id="transfer-new-owner">
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
                                  <FormLabel htmlFor="transfer-reason">Reason for Transfer (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      id="transfer-reason"
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

            {/* Leave Family Confirmation Modal */}
      {showLeaveConfirmModal && familyToLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Leave Family</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to leave <span className="font-semibold">&quot;{familyToLeave?.name}&quot;</span>? 
                You will lose access to this family&apos;s data and will need to be re-invited to rejoin.
              </p>
              
              {/* Smart Recommendations */}
              {(() => {
                const analysis = analyzeFamilyComposition();
                
                if (analysis.shouldDelete) {
                  return (
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-semibold text-orange-800 mb-2">🤔 Consider Deleting Instead</h4>
                      <p className="text-sm text-orange-700 mb-3">{analysis.reason}</p>
                      <button
                        onClick={() => {
                          setShowLeaveConfirmModal(false);
                          setFamilyToLeave(null);
                          deleteFamily(familyToLeave);
                        }}
                        className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                      >
                        Delete Family Instead
                      </button>
                    </div>
                  );
                }
                
                if (analysis.canPassBaton) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">👑 Pass the Baton First</h4>
                      <p className="text-sm text-blue-700 mb-3">{analysis.reason}</p>
                      <p className="text-xs text-blue-600">
                        Eligible members: {analysis.eligibleMembers?.map(m => 
                          m.user.displayName || `${m.user.firstName} ${m.user.lastName}` || m.user.username
                        ).join(', ')}
                      </p>
                    </div>
                  );
                }
                
                if (analysis.canLeave) {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Safe to Leave</h4>
                      <p className="text-sm text-green-700">{analysis.reason}</p>
                    </div>
                  );
                }
                
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Action Required</h4>
                    <p className="text-sm text-yellow-700">{analysis.reason}</p>
                  </div>
                );
              })()}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowLeaveConfirmModal(false);
                  setFamilyToLeave(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveFamily}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Leaving...' : 'Yes, I&apos;m Sure'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Family Confirmation Modal */}
      {showDeleteConfirmModal && familyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Family Permanently</h3>
                <p className="text-sm text-gray-500">This action CANNOT be undone!</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2">⚠️ Warning: Complete Data Loss</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• The family <span className="font-semibold">&quot;{familyToDelete?.name}&quot;</span> will be permanently deleted</li>
                  <li>• All members will be removed</li>
                  <li>• All family tasks and data will be lost</li>
                  <li>• All pending invitations will be cancelled</li>
                  <li>• This action cannot be reversed</li>
                </ul>
              </div>
              
              <p className="text-gray-700">
                Unlike &quot;Leave Family&quot;, this will completely destroy the family for all members. Are you absolutely sure?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setFamilyToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFamily}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Invitation Wizard */}
      <SmartInvitationWizard
        isOpen={showSmartInvitationWizard}
        onClose={() => setShowSmartInvitationWizard(false)}
        onSuccess={() => {
          setShowSmartInvitationWizard(false);
          setMessage({ type: 'success', text: 'Smart invitation sent successfully!' });
          loadFamilyData(); // Refresh data
        }}
      />
    </div>
  );
} 