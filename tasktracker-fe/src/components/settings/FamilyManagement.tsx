'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  UserFamilyRelationships
} from '@/lib/types/family-invitation';
import { 
  familyCreateSchema,
  invitationSchema
} from '@/lib/schemas/family-invitation';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { SmartInvitationWizard } from '@/components/family/SmartInvitationWizard';
import { FamilyManagementContentProps } from '@/lib/types/settings';

// FamilyManagementContentProps is imported from lib/types/settings

export default function FamilyManagementContent({ user }: FamilyManagementContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSmartInvitationWizard, setShowSmartInvitationWizard] = useState(false);

  // Check if user has family admin access
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isFamilyAdmin = user?.isFamilyAdmin || isAdmin;
  
  // Check if user can create families based on age group
  const canCreateFamily = user?.ageGroup !== 0; // Child = 0, Teen = 1, Adult = 2

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

  // Load family data
  const loadFamilyData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load family relationships to get all families user belongs to
      const relationships = await familyInvitationService.getUserFamilyRelationships();
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

      // Load current family (or first family if multiple) - handle 404 gracefully for new users
      let currentFamily: FamilyDTO | null = null;
      try {
        currentFamily = await familyInvitationService.getUserFamily();
      } catch (error) {
        // Expected for new users who haven't created/joined a family yet
        console.debug('User has no current family yet (normal for new users)');
      }
      
      const selectedFamily = currentFamily || (uniqueFamilies.length > 0 ? uniqueFamilies[0] : null);
      setFamilyData(selectedFamily);

      // Load age-based permissions from API
      await familyInvitationService.getFamilyManagementPermissions();

      // Always load family roles
      try {
        const roles = await familyInvitationService.getFamilyRoles();
        setFamilyRoles(roles);
      } catch (error) {
        console.error('Failed to load family roles:', error);
        setFamilyRoles([]);
      }

      if (currentFamily?.id) {
        try {
          // Load family members
          const members = await familyInvitationService.getFamilyMembers(currentFamily.id);
          setFamilyMembers(members);

          // Load pending invitations
          try {
            const invitations = await familyInvitationService.getSentInvitations();
            setPendingInvitations(invitations.filter(inv => !inv.isAccepted));
          } catch (error) {
            console.warn('Failed to load sent invitations:', error);
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
        } catch (error) {
          console.warn('Failed to load family data:', error);
        }
      }

    } catch (error) {
      console.error('Failed to load basic family data:', error);
      if (error instanceof Error && !error.message.includes('400')) {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load family information. Please try refreshing the page.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user, loadFamilyData]);

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
      const newFamily = await familyInvitationService.createFamily(data);
      setFamilyData(newFamily);
      setAllFamilies(prev => [...prev, newFamily]);
      familyCreateForm.reset();
      setMessage({ type: 'success', text: 'Family created successfully! You can now invite members.' });
      
      setTimeout(async () => {
        await loadFamilyData();
      }, 500);
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
        email: data.email,
        familyId: familyData.id,
        familyRoleId: data.roleId,
        message: data.message
      });
      
      invitationForm.reset();
      setMessage({ type: 'success', text: `Invitation sent to ${data.email} successfully!` });
      await loadFamilyData();
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

  // Loading skeleton
  if (!user || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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
    if (familyData) {
      return true;
    }
    
    return false;
  };

  // Block access only if user doesn't have any permission to manage families
  if (!hasAccessPermission()) {
    const isChild = user?.ageGroup === 0;
    
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

      {/* New User Welcome Banner - Only show when user has no families and no specific message */}
      {allFamilies.length === 0 && !message && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Home className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-2">
              <div className="font-medium">Welcome to Family Management! 🏠</div>
              <div className="text-sm">
                You haven't created or joined any families yet. Start by creating your first family below to organize tasks, invite members, and manage your household together.
              </div>
            </div>
          </AlertDescription>
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
                            setFamilyData(family);
                          }}
                        >
                          {isSelected ? "Managing" : "Manage"}
                        </Button>
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
                <Button
                  variant="outline"
                  onClick={() => setShowSmartInvitationWizard(true)}
                  className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Smart Invite
                </Button>
              </div>
            </CardTitle>
            {familyData.description && (
              <CardDescription>{familyData.description}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
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

                {/* Family Overview Details */}
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
                                      <SelectItem value="loading" disabled>
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
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Smart Invitation Wizard */}
      <SmartInvitationWizard
        isOpen={showSmartInvitationWizard}
        onClose={() => setShowSmartInvitationWizard(false)}
        onSuccess={() => {
          setShowSmartInvitationWizard(false);
          setMessage({ type: 'success', text: 'Smart invitation sent successfully!' });
          loadFamilyData();
        }}
      />
    </div>
  );
}
