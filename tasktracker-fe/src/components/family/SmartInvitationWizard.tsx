'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Users,
    Mail,
    User,
    AlertTriangle,
    Sparkles,
    Heart,
    Shield,
    Star,
    CheckCircle2,
    Info
} from 'lucide-react';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import {
    SmartInvitationRequest,
    InvitationValidationResult,
    FamilyRelationshipType,
    getInvitableRelationships,
    getRelationshipDisplayName,
    SmartRelationshipFormData
} from '@/lib/types/family-invitation';
import { smartRelationshipFormSchema } from '@/lib/schemas/smart-relationship';
import {
    getRelationshipContext,
    getSmartRelationshipMapping,
    createSmartInvitationWithContext
} from '@/lib/services/smartRelationshipService';

import { SmartInvitationWizardProps } from '@/lib/types/component-props';

export function SmartInvitationWizard({ isOpen, onClose, onSuccess }: SmartInvitationWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [validationResult, setValidationResult] = useState<InvitationValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        trigger
    } = useForm<SmartRelationshipFormData>({
        resolver: zodResolver(smartRelationshipFormSchema),
        mode: 'onChange'
    });

    const watchedFields = watch();
    const relationshipOptions = getInvitableRelationships();

    // Mock user data - in real app, get from AuthContext
    const currentUser = {
        id: 1,
        globalRole: 'User', // or 'Admin'
        familyRole: 'Child', // or 'Parent', 'Admin'
        isFamilyAdmin: false
    };

    // Get relationship context
    const relationshipContext = getRelationshipContext(currentUser);
    const relationshipMapping = getSmartRelationshipMapping(relationshipContext);

    // Auto-validate invitation when key fields change
    useEffect(() => {
        const validateInvitation = async () => {
            if (watchedFields.email && watchedFields.relationship) {
                setIsValidating(true);
                try {
                    const request: SmartInvitationRequest = {
                        email: watchedFields.email,
                        relationshipToAdmin: watchedFields.relationship,
                        personalMessage: watchedFields.personalMessage,
                        dateOfBirth: watchedFields.dateOfBirth || '',
                        name: watchedFields.name || '',
                        wantsAdminRole: false,
                        notes: watchedFields.notes,
                    };

                    const result = await familyInvitationService.getInvitationPreview(request);
                    setValidationResult(result);
                } catch (error) {
                    console.error('Validation error:', error);
                    setValidationResult(null);
                } finally {
                    setIsValidating(false);
                }
            } else {
                setValidationResult(null);
            }
        };

        const debounceTimer = setTimeout(validateInvitation, 500);
        return () => clearTimeout(debounceTimer);
    }, [watchedFields.email, watchedFields.relationship, watchedFields.dateOfBirth, watchedFields.personalMessage, watchedFields.name, watchedFields.notes]);

    const onSubmit = async (data: SmartRelationshipFormData) => {
        setIsLoading(true);
        try {
            // Create smart invitation with proper context
            const request = createSmartInvitationWithContext(
                {
                    email: data.email,
                    name: data.name || '',
                    relationship: data.relationship,
                    dateOfBirth: data.dateOfBirth || '',
                    personalMessage: data.personalMessage,
                    notes: data.notes,
                    wantsAdminRole: false
                },
                relationshipContext,
                FamilyRelationshipType.Child // Current user's relationship to admin (mock)
            );

            await familyInvitationService.createSmartInvitation(request);
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to send invitation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setCurrentStep(1);
        setValidationResult(null);
        onClose();
    };

    const nextStep = async () => {
        const fieldsToValidate = currentStep === 1
            ? ['email', 'relationship'] as const
            : ['name', 'dateOfBirth'] as const;

        const isValid = await trigger(fieldsToValidate);
        if (isValid && currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getRelationshipIcon = (relationship: FamilyRelationshipType) => {
        switch (relationship) {
            case FamilyRelationshipType.Parent:
            case FamilyRelationshipType.Stepparent:
                return <Shield className="h-4 w-4" />;
            case FamilyRelationshipType.Child:
            case FamilyRelationshipType.Stepchild:
                return <Heart className="h-4 w-4" />;
            case FamilyRelationshipType.Spouse:
                return <Heart className="h-4 w-4" />;
            case FamilyRelationshipType.Grandparent:
            case FamilyRelationshipType.Grandchild:
                return <Star className="h-4 w-4" />;
            default:
                return <Users className="h-4 w-4" />;
        }
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'parent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'child': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Smart Family Invitation
                    </DialogTitle>
                    <DialogDescription>
                        Invite someone to your family with intelligent role recommendations
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step}
                            </div>
                            <div className="ml-2 text-sm font-medium">
                                {step === 1 && 'Basic Info'}
                                {step === 2 && 'Details'}
                                {step === 3 && 'Review'}
                            </div>
                            {step < 3 && (
                                <div
                                    className={`ml-4 w-12 h-0.5 ${step < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Who are you inviting?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="friend@example.com"
                                            {...register('email')}
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="relationship">{relationshipMapping.relationshipLabel}</Label>
                                        <p className="text-sm text-gray-500">{relationshipMapping.relationshipDescription}</p>
                                        <div className="text-xs text-purple-600 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                                            💡 {relationshipMapping.contextualPrompt}
                                        </div>
                                        <Select
                                            value={watchedFields.relationship !== undefined ? watchedFields.relationship.toString() : ""}
                                            onValueChange={(value) => {
                                                if (value) {
                                                    setValue('relationship', parseInt(value) as FamilyRelationshipType);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select relationship..." />
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                side="bottom"
                                                align="start"
                                                sideOffset={4}
                                                className="p-0"
                                            >
                                                <div
                                                    className="h-[300px] rounded-md border bg-gray-50 dark:bg-gray-900 overflow-y-scroll p-4"
                                                    style={{
                                                        scrollbarWidth: 'thin',
                                                        scrollbarColor: '#ffffff #4b5563', // white thumb on gray-600 track
                                                    }}
                                                >
                                                    {Object.entries(
                                                        relationshipOptions.reduce((groups: { [key: string]: typeof relationshipOptions }, option) => {
                                                            if (!groups[option.category]) {
                                                                groups[option.category] = [];
                                                            }
                                                            groups[option.category].push(option);
                                                            return groups;
                                                        }, {})
                                                    ).map(([category, options]) => (
                                                        <SelectGroup key={category}>
                                                            <SelectLabel>{category}</SelectLabel>
                                                            {options.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value.toString()}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        {errors.relationship && (
                                            <p className="text-sm text-red-500 mt-1">{errors.relationship.message}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Live Validation Preview */}
                            {(isValidating || validationResult) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            Smart Suggestions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isValidating ? (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                                                Analyzing invitation...
                                            </div>
                                        ) : validationResult ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">Recommended Role:</span>
                                                    <Badge variant="secondary">
                                                        {validationResult.suggestedRole}
                                                    </Badge>
                                                </div>

                                                {validationResult.ageGroup !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">Age Group:</span>
                                                        <Badge variant="outline">
                                                            {validationResult.ageGroup === 0 ? 'Child' :
                                                                validationResult.ageGroup === 1 ? 'Teen' : 'Adult'}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {validationResult.warnings.length > 0 && (
                                                    <Alert>
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {validationResult.warnings.map((warning, index) => (
                                                                    <li key={index} className="text-sm">{warning}</li>
                                                                ))}
                                                            </ul>
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                {validationResult.errors.length > 0 && (
                                                    <Alert variant="destructive">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {validationResult.errors.map((error, index) => (
                                                                    <li key={index} className="text-sm">{error}</li>
                                                                ))}
                                                            </ul>
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Step 2: Additional Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Additional Information
                                    </CardTitle>
                                    <CardDescription>
                                        Help us personalize the invitation (optional)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="name">Preferred Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="What should we call them?"
                                            {...register('name')}
                                        />
                                        <p className="text-sm text-gray-500">
                                            This helps personalize the invitation message
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            {...register('dateOfBirth')}
                                        />
                                        <p className="text-sm text-gray-500">
                                            Helps us recommend the right role and permissions
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="personalMessage">Personal Message</Label>
                                        <Textarea
                                            id="personalMessage"
                                            placeholder="Add a personal touch to your invitation..."
                                            {...register('personalMessage')}
                                            className="min-h-[100px]"
                                        />
                                        <p className="text-sm text-gray-500">
                                            This will be included in the invitation email
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Review & Send */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Review Invitation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Email</Label>
                                            <p className="font-medium">{watchedFields.email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Relationship</Label>
                                            <div className="flex items-center gap-2">
                                                {watchedFields.relationship && getRelationshipIcon(watchedFields.relationship)}
                                                <span className="font-medium">
                                                    {watchedFields.relationship && getRelationshipDisplayName(watchedFields.relationship)}
                                                </span>
                                            </div>
                                        </div>
                                        {watchedFields.name && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Name</Label>
                                                <p className="font-medium">{watchedFields.name}</p>
                                            </div>
                                        )}
                                        {validationResult && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Assigned Role</Label>
                                                <Badge className={getRoleBadgeColor(validationResult.suggestedRole)}>
                                                    {validationResult.suggestedRole}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {watchedFields.personalMessage && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Personal Message</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                                <p className="text-sm">{watchedFields.personalMessage}</p>
                                            </div>
                                        </div>
                                    )}

                                    {validationResult && validationResult.warnings.length > 0 && (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                <p className="font-medium mb-1">Please note:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {validationResult.warnings.map((warning, index) => (
                                                        <li key={index} className="text-sm">{warning}</li>
                                                    ))}
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <div>
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!watchedFields.email || !watchedFields.relationship}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isLoading || (validationResult ? !validationResult.isValid : false)}
                                    className="bg-purple-500 hover:bg-purple-600"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Invitation'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 