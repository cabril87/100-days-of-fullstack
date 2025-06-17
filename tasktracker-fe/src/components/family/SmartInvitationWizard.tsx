'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  Users,
  Shield,
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Send,
  UserPlus,
  Trophy,
  RefreshCw
} from 'lucide-react';

// Enhanced Family Types from lib directory
import {
  InvitationWizardState,
  InvitationPreviewData
} from '../../lib/types/enhanced-family';
import { FamilyRelationshipType } from '../../lib/types/family-invitation';
import { EnhancedFamilyService } from '../../lib/services/enhancedFamilyService';

// Import schemas and types from lib directory - explicit typing
import {
  invitationBasicSchema,
  invitationSendingSchema,
  type InvitationBasicFormData,
  type InvitationSendingFormData
} from '../../lib/schemas/enhanced-family';
import { type SmartInvitationWizardProps } from '../../lib/types/component-props';

export const SmartInvitationWizard: React.FC<SmartInvitationWizardProps> = ({
  familyId,
  isOpen,
  onClose,
  onInvitationSent,
  showAdvancedOptions = true
}) => {
  // Enhanced Invitation State from lib directory types
  const [wizardState, setWizardState] = useState<InvitationWizardState>({
    step: 'basic',
    currentStep: 1,
    totalSteps: 4,
    canGoBack: false,
    canProceed: false,
    isLoading: false,
    error: null,
  });

  const [invitationPreview, setInvitationPreview] = useState<InvitationPreviewData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const enhancedFamilyService = EnhancedFamilyService.getInstance();

  // Step 1: Basic Information Form
  const basicForm = useForm<InvitationBasicFormData>({
    resolver: zodResolver(invitationBasicSchema),
    defaultValues: {
      email: '',
      name: '',
      estimatedAge: undefined,
      relationship: FamilyRelationshipType.Other,
      relationshipDescription: '',
    },
  });

  // Step 3: Sending Options Form
  const sendingForm = useForm<InvitationSendingFormData>({
    resolver: zodResolver(invitationSendingSchema),
    defaultValues: {
      method: 'email',
      customMessage: '',
      includeQr: false,
      scheduledFor: undefined,
      expirationDays: 7,
      followUpReminders: true,
    },
  });

  // Available family relationships
  const relationships: Array<{ value: FamilyRelationshipType; label: string; description: string }> = [
    { value: FamilyRelationshipType.Parent, label: 'Parent', description: 'Mother or Father' },
    { value: FamilyRelationshipType.Child, label: 'Child', description: 'Son or Daughter' },
    { value: FamilyRelationshipType.Spouse, label: 'Spouse', description: 'Husband or Wife' },
    { value: FamilyRelationshipType.Sibling, label: 'Sibling', description: 'Brother or Sister' },
    { value: FamilyRelationshipType.Grandparent, label: 'Grandparent', description: 'Grandmother or Grandfather' },
    { value: FamilyRelationshipType.Grandchild, label: 'Grandchild', description: 'Grandson or Granddaughter' },
    { value: FamilyRelationshipType.Aunt, label: 'Aunt', description: 'Aunt' },
    { value: FamilyRelationshipType.Uncle, label: 'Uncle', description: 'Uncle' },
    { value: FamilyRelationshipType.Cousin, label: 'Cousin', description: 'Cousin' },
    { value: FamilyRelationshipType.FamilyFriend, label: 'Family Friend', description: 'Close family friend' },
    { value: FamilyRelationshipType.Caregiver, label: 'Caregiver', description: 'Nanny, babysitter, or caregiver' },
    { value: FamilyRelationshipType.Other, label: 'Other', description: 'Other relationship' },
  ];

  // Watch form values for changes
  const watchedValues = basicForm.watch();

  // Generate invitation preview when basic info is complete
  useEffect(() => {
    const generatePreview = async () => {
      const basicData = basicForm.getValues();
      if (basicData.email && basicData.name && basicData.relationship) {
        try {
          setWizardState(prev => ({ ...prev, isLoading: true }));

          const preview = await enhancedFamilyService.previewInvitation(familyId, {
            email: basicData.email,
            name: basicData.name,
            dateOfBirth: basicData.estimatedAge ?
              new Date(new Date().getFullYear() - basicData.estimatedAge, 0, 1).toISOString() : '',
            relationship: basicData.relationship,
            personalMessage: basicData.relationshipDescription || '',
            roleId: 1, // Default role ID, will be updated based on preview
            wantsAdminRole: false,
            expirationDays: 7,
            sendingMethod: 'email' as const,
            includeQr: false,
            followUpReminders: true,
          });

          setInvitationPreview(preview);
          setWizardState(prev => ({ ...prev, canProceed: true, isLoading: false }));

        } catch (error) {
          console.error('Error generating invitation preview:', error);
          setWizardState(prev => ({
            ...prev,
            error: 'Failed to generate preview',
            isLoading: false
          }));
        }
      }
    };

    if (wizardState.step === 'basic') {
      generatePreview();
    }
  }, [watchedValues, familyId, enhancedFamilyService, wizardState.step, basicForm]);

  // Handle step navigation
  const nextStep = () => {
    switch (wizardState.step) {
      case 'basic':
        setWizardState(prev => ({
          ...prev,
          step: 'relationship',
          currentStep: 2,
          canGoBack: true
        }));
        break;
      case 'relationship':
        setWizardState(prev => ({
          ...prev,
          step: 'permissions',
          currentStep: 3
        }));
        break;
      case 'permissions':
        setWizardState(prev => ({
          ...prev,
          step: 'preview',
          currentStep: 4
        }));
        break;
      case 'preview':
        handleSendInvitation();
        break;
    }
  };

  const prevStep = () => {
    switch (wizardState.step) {
      case 'relationship':
        setWizardState(prev => ({
          ...prev,
          step: 'basic',
          currentStep: 1,
          canGoBack: false
        }));
        break;
      case 'permissions':
        setWizardState(prev => ({
          ...prev,
          step: 'relationship',
          currentStep: 2
        }));
        break;
      case 'preview':
        setWizardState(prev => ({
          ...prev,
          step: 'permissions',
          currentStep: 3
        }));
        break;
    }
  };

  // Generate QR Code
  const generateQrCode = async () => {
    if (!invitationPreview) return;

    setIsGeneratingQr(true);
    try {
      // Create a temporary invitation token
      const qrUrl = await enhancedFamilyService.generateInvitationQR('temp-token-for-qr');
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Send invitation
  const handleSendInvitation = async () => {
    const basicData = basicForm.getValues();
    const sendingData = sendingForm.getValues();

    setWizardState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const invitation = await enhancedFamilyService.sendEnhancedInvitation(familyId, {
        email: basicData.email,
        name: basicData.name,
        dateOfBirth: basicData.estimatedAge ?
          new Date(new Date().getFullYear() - basicData.estimatedAge, 0, 1).toISOString() : '',
        relationship: basicData.relationship,
        personalMessage: sendingData.customMessage || '',
        roleId: 1, // Default role ID, will be updated based on preview
        wantsAdminRole: false,
        expirationDays: sendingData.expirationDays,
        sendingMethod: sendingData.method,
        includeQr: sendingData.includeQr,
        followUpReminders: sendingData.followUpReminders,
      });

      setWizardState(prev => ({
        ...prev,
        step: 'success',
        currentStep: 5,
        isLoading: false
      }));

      onInvitationSent(invitation);

    } catch (error) {
      console.error('Error sending invitation:', error);
      const message = error instanceof Error ? error.message : 'Failed to send invitation';
      setWizardState(prev => ({
        ...prev,
        error: message,
        isLoading: false
      }));
    }
  };

  // Step 1: Basic Information
  const renderBasicStep = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about the family member you&apos;d like to invite
        </p>
      </div>

      <Form {...basicForm}>
        <div className="space-y-4">
          <FormField
            control={basicForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter their full name"
                    disabled={wizardState.isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={basicForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter their email address"
                    disabled={wizardState.isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={basicForm.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship</FormLabel>
                <FormControl>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select their relationship to you" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map((rel) => (
                        <SelectItem key={rel.value} value={String(rel.value)}>
                          <div className="flex flex-col">
                            <span>{rel.label}</span>
                            <span className="text-xs text-muted-foreground">{rel.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showAdvancedOptions && (
            <FormField
              control={basicForm.control}
              name="estimatedAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Estimated age"
                      disabled={wizardState.isLoading}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Form>
    </div>
  );

  // Step 2: Family Impact Analysis
  const renderImpactAnalysis = () => {
    if (!invitationPreview) return null;

    const impact = invitationPreview.familyImpact;

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Family Impact Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Here&apos;s how this invitation will affect your family structure
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{impact.currentSize}</div>
                <div className="text-sm text-muted-foreground">Current Size</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{impact.newSize}</div>
                <div className="text-sm text-muted-foreground">New Size</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Family Composition Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{impact.compositionChange.adultsCount}</div>
                <div className="text-xs text-muted-foreground">Adults</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{impact.compositionChange.teensCount}</div>
                <div className="text-xs text-muted-foreground">Teens</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{impact.compositionChange.childrenCount}</div>
                <div className="text-xs text-muted-foreground">Children</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {impact.securityImpact.concerns.length > 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="space-y-1">
                <div><strong>Security Considerations:</strong></div>
                {impact.securityImpact.concerns.slice(0, 3).map((concern, index) => (
                  <div key={index} className="text-sm">• {concern.description}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // Step 3: Role Assignment Preview
  const renderRolePreview = () => {
    if (!invitationPreview) return null;

    const rolePreview = invitationPreview.roleAssignment;

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Role & Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Recommended role based on relationship and age
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recommended Role</CardTitle>
              <Badge variant="outline" className="text-green-700">
                {rolePreview.ageAppropriate ? 'Age Appropriate' : 'Age Restricted'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-medium">{rolePreview.recommendedRole.name}</div>
                <div className="text-sm text-muted-foreground">{rolePreview.recommendedRole.description}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Key Permissions:</div>
              <div className="grid grid-cols-1 gap-2">
                {rolePreview.permissionsPreview.slice(0, 4).map((permission, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{permission.description}</span>
                    <Badge variant={permission.granted ? "default" : "secondary"}>
                      {permission.granted ? 'Granted' : 'Restricted'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {rolePreview.conflictWarnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <div className="space-y-1">
                    <div><strong>Considerations:</strong></div>
                    {rolePreview.conflictWarnings.slice(0, 2).map((warning, index) => (
                      <div key={index} className="text-sm">• {warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Step 4: Final Preview & Sending Options
  const renderFinalPreview = () => {
    if (!invitationPreview) return null;

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Send className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Ready to Send</h3>
          <p className="text-sm text-muted-foreground">
            Review the invitation details and sending options
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Invitation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Recipient</div>
                <div className="text-sm text-muted-foreground">{invitationPreview.recipientInfo.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{invitationPreview.recipientInfo.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Relationship</div>
                <div className="text-sm text-muted-foreground">{invitationPreview.recipientInfo.relationshipDescription}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Role</div>
                <div className="text-sm text-muted-foreground">{invitationPreview.roleAssignment.recommendedRole.name}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...sendingForm}>
          <div className="space-y-4">
            <FormField
              control={sendingForm.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a personal message to the invitation..."
                      rows={3}
                      disabled={wizardState.isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={sendingForm.control}
                name="includeQr"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Include QR Code</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Add QR code for easy joining
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={sendingForm.control}
                name="followUpReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Follow-up Reminders</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Send gentle reminders
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>

        {sendingForm.watch('includeQr') && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qrCodeUrl ? (
                <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                  <Image src={qrCodeUrl} alt="Invitation QR Code" width={128} height={128} className="w-32 h-32" />
                </div>
              ) : (
                <Button
                  onClick={generateQrCode}
                  disabled={isGeneratingQr}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingQr ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Step 5: Success
  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-green-700">Invitation Sent!</h3>
        <p className="text-sm text-muted-foreground">
          Your invitation has been sent successfully. They&apos;ll receive an email with instructions to join your family.
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="space-y-1">
            <div><strong>What happens next:</strong></div>
            <div>• They&apos;ll receive an email invitation</div>
            <div>• They can click the link to join your family</div>
            <div>• You&apos;ll be notified when they accept</div>
          </div>
        </AlertDescription>
      </Alert>

      <Button
        className="w-full"
        onClick={onClose}
      >
        <Trophy className="mr-2 h-4 w-4" />
        Done
      </Button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Invitation
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {wizardState.currentStep} of {wizardState.totalSteps}</span>
              <span>{Math.round((wizardState.currentStep / wizardState.totalSteps) * 100)}%</span>
            </div>
            <Progress value={(wizardState.currentStep / wizardState.totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {wizardState.step === 'basic' && renderBasicStep()}
          {wizardState.step === 'relationship' && renderImpactAnalysis()}
          {wizardState.step === 'permissions' && renderRolePreview()}
          {wizardState.step === 'preview' && renderFinalPreview()}
          {wizardState.step === 'success' && renderSuccessStep()}

          {wizardState.error && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {wizardState.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        {wizardState.step !== 'success' && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={!wizardState.canGoBack || wizardState.isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              disabled={!wizardState.canProceed || wizardState.isLoading}
            >
              {wizardState.isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : wizardState.step === 'preview' ? (
                <Send className="h-4 w-4 mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {wizardState.step === 'preview' ? 'Send Invitation' : 'Next'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}; 