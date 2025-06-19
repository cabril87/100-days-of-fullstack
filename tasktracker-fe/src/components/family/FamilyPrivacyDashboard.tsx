'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Form components removed - using direct UI components instead
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Eye, 
  Users,
  Baby,
  AlertTriangle,
  CheckCircle,
  Settings,
  Globe,
  UserCheck,
  Clock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import type { 
  FamilyPrivacySettings,
  FamilyPrivacyDashboardProps
} from '@/lib/types/enhanced-family';

// Import existing types and services following architecture patterns
import { EnhancedFamilyService } from '@/lib/services/enhancedFamilyService';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';

// Default privacy settings for enhanced family structure
const DEFAULT_PRIVACY_SETTINGS: Omit<FamilyPrivacySettings, 'familyId'> = {
  visibility: {
    profileVisibility: 'family_only',
    taskVisibility: 'all_members',
    achievementVisibility: 'family_only',
    activityVisibility: 'all_members',
    searchable: false,
    showInDirectory: false
  },
  dataSharing: {
    shareWithPartners: false,
    analyticsOptIn: false,
    marketingOptIn: false,
    researchParticipation: false,
    dataRetentionPeriod: 365,
    automaticDeletion: true,
    exportOptions: [
      { format: 'json', scope: 'personal', available: true, estimatedSize: '< 1MB' },
      { format: 'csv', scope: 'tasks', available: true, estimatedSize: '< 500KB' }
    ]
  },
  memberPrivacy: [],
  childProtection: {
    enableProtection: true,
    ageVerificationRequired: true,
    parentalConsentRequired: true,
    dataMinimization: true,
    automaticDeletion: {
      enabled: true,
      retentionPeriod: 90,
      exemptions: ['achievements', 'milestones'],
      notificationBeforeDeletion: true
    },
    reportingSettings: {
      enableReporting: true,
      reportableActions: ['inappropriate_content', 'bullying', 'privacy_violation'],
      notificationRecipients: [],
      escalationRules: []
    }
  },
  externalIntegrations: [],
  auditLog: []
};

// Privacy Dashboard Component - follows SecuritySettings.tsx pattern
export default function FamilyPrivacyDashboard({ 
  familyId, 
  isAdmin, 
  onSettingsChanged,
  showChildProtection = true,
  allowExport = true 
}: FamilyPrivacyDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  
  const enhancedFamilyService = EnhancedFamilyService.getInstance();

  // Initialize privacy settings with proper types
  const [privacySettings, setPrivacySettings] = useState<FamilyPrivacySettings>({
    familyId,
    ...DEFAULT_PRIVACY_SETTINGS
  });


  // Update visibility settings
  const updateVisibility = useCallback((key: keyof FamilyPrivacySettings['visibility'], value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: value
      }
    }));
  }, []);

  // Update data sharing settings
  const updateDataSharing = useCallback((key: keyof FamilyPrivacySettings['dataSharing'], value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      dataSharing: {
        ...prev.dataSharing,
        [key]: value
      }
    }));
  }, []);

  // Save settings
  const saveSettings = useCallback(async () => {
    if (!isAdmin) {
      toast.error('Only administrators can modify privacy settings');
      return;
    }

    setIsSaving(true);
    try {
      // Convert to form data structure expected by the API
      const formData = {
        familyId: privacySettings.familyId,
        visibility: privacySettings.visibility,
        dataSharing: privacySettings.dataSharing,
        memberPrivacy: privacySettings.memberPrivacy,
        childProtection: privacySettings.childProtection,
        externalIntegrations: privacySettings.externalIntegrations.map(integration => ({
          service: integration.service,
          enabled: integration.enabled,
          dataSharing: integration.dataSharing,
          permissions: integration.permissions,
          syncFrequency: integration.syncFrequency as 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual'
        }))
      };
      
      await enhancedFamilyService.updateFamilyPrivacySettings(familyId, formData);
      onSettingsChanged(privacySettings);
      setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
      toast.success('Privacy settings updated!');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      toast.error('Failed to save privacy settings');
    } finally {
      setIsSaving(false);
    }
  }, [familyId, privacySettings, onSettingsChanged, enhancedFamilyService, isAdmin]);

  // Load family members
  const loadFamilyMembers = useCallback(async () => {
    try {
      const { familyInvitationService } = await import('@/lib/services/familyInvitationService');
      const members = await familyInvitationService.getFamilyMembers(familyId);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  // Load data on mount
  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Family Privacy Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control who can see your family&apos;s information and activities
          </p>
        </div>
        
        {allowExport && isAdmin && (
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Family Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Visibility Settings
          </CardTitle>
          <CardDescription>
            Control who can see different aspects of your family
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Profile Visibility</label>
              <p className="text-xs text-gray-500">Who can see family profiles</p>
            </div>
            <Select
              value={privacySettings.visibility.profileVisibility}
              onValueChange={(value: string) => updateVisibility('profileVisibility', value)}
              disabled={!isAdmin}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="family_only">Family Only</SelectItem>
                <SelectItem value="admin_only">Admin Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Task Visibility</label>
              <p className="text-xs text-gray-500">Who can see family tasks</p>
            </div>
            <Select
              value={privacySettings.visibility.taskVisibility}
              onValueChange={(value: string) => updateVisibility('taskVisibility', value)}
              disabled={!isAdmin}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_members">All Members</SelectItem>
                <SelectItem value="age_appropriate">Age Appropriate</SelectItem>
                <SelectItem value="role_based">Role Based</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Achievement Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Achievement Visibility</label>
              <p className="text-xs text-gray-500">Who can see achievements</p>
            </div>
            <Select
              value={privacySettings.visibility.achievementVisibility}
              onValueChange={(value: string) => updateVisibility('achievementVisibility', value)}
              disabled={!isAdmin}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="family_only">Family Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Data Sharing
          </CardTitle>
          <CardDescription>
            Control how your family data is shared and used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analytics Opt-in */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Analytics</label>
              <p className="text-xs text-gray-500">Help improve the app with usage data</p>
            </div>
            <Switch
              checked={privacySettings.dataSharing.analyticsOptIn}
              onCheckedChange={(checked) => updateDataSharing('analyticsOptIn', checked)}
              disabled={!isAdmin}
            />
          </div>

          {/* Marketing Opt-in */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Marketing</label>
              <p className="text-xs text-gray-500">Receive product updates and offers</p>
            </div>
            <Switch
              checked={privacySettings.dataSharing.marketingOptIn}
              onCheckedChange={(checked) => updateDataSharing('marketingOptIn', checked)}
              disabled={!isAdmin}
            />
          </div>

          {/* Automatic Deletion */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Automatic Data Deletion</label>
              <p className="text-xs text-gray-500">Automatically delete old data</p>
            </div>
            <Switch
              checked={privacySettings.dataSharing.automaticDeletion}
              onCheckedChange={(checked) => updateDataSharing('automaticDeletion', checked)}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Child Protection Settings */}
      {showChildProtection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-pink-600" />
              Child Protection
            </CardTitle>
            <CardDescription>
              Enhanced protection settings for children in the family
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable Protection */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable Child Protection</label>
                <p className="text-xs text-gray-500">Enhanced safety features for children</p>
              </div>
              <Switch
                checked={privacySettings.childProtection.enableProtection}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({
                    ...prev,
                    childProtection: {
                      ...prev.childProtection,
                      enableProtection: checked
                    }
                  }))
                }
                disabled={!isAdmin}
              />
            </div>

            {/* Age Verification */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Age Verification Required</label>
                <p className="text-xs text-gray-500">Verify ages for appropriate content</p>
              </div>
              <Switch
                checked={privacySettings.childProtection.ageVerificationRequired}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({
                    ...prev,
                    childProtection: {
                      ...prev.childProtection,
                      ageVerificationRequired: checked
                    }
                  }))
                }
                disabled={!isAdmin || !privacySettings.childProtection.enableProtection}
              />
            </div>

            {/* Data Minimization */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Data Minimization</label>
                <p className="text-xs text-gray-500">Collect only necessary data for children</p>
              </div>
              <Switch
                checked={privacySettings.childProtection.dataMinimization}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({
                    ...prev,
                    childProtection: {
                      ...prev.childProtection,
                      dataMinimization: checked
                    }
                  }))
                }
                disabled={!isAdmin || !privacySettings.childProtection.enableProtection}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Members Privacy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Family Members
          </CardTitle>
          <CardDescription>
            Privacy settings overview for each family member
          </CardDescription>
        </CardHeader>
        <CardContent>
          {familyMembers.length > 0 ? (
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                                         <div>
                       <p className="text-sm font-medium">{member.user?.displayName || 'Unknown User'}</p>
                       <p className="text-xs text-gray-500">{member.role?.name || 'Member'}</p>
                     </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Protected
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No family members found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Administrator Actions
            </CardTitle>
            <CardDescription>
              Advanced privacy management options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export Privacy Report
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                View Audit Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 