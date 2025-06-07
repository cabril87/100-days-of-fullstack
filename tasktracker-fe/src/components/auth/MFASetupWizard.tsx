'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { AlertCircle, Shield, Copy, Download, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    MFASetupInitiateDTO,
    MFABackupCodesDTO
} from '@/lib/types/auth';
import { mfaSetupCompleteSchema, MFASetupCompleteFormData } from '@/lib/schemas/auth';
import { authService, AuthServiceError } from '@/lib/services/authService';
import {
    QRCodeSkeleton,
    MFACodeInputSkeleton,
    BackupCodesGridSkeleton
} from '@/components/ui/skeletons/mfa-skeletons';

interface MFASetupWizardProps {
    onComplete?: () => void;
    onCancel?: () => void;
    className?: string;
}

type SetupStep = 'instructions' | 'qr-code' | 'verification' | 'backup-codes' | 'complete';

export const MFASetupWizard: React.FC<MFASetupWizardProps> = ({
    onComplete,
    onCancel,
    className = ''
}) => {
    const [currentStep, setCurrentStep] = useState<SetupStep>('instructions');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [setupData, setSetupData] = useState<MFASetupInitiateDTO | null>(null);
    const [backupCodes, setBackupCodes] = useState<MFABackupCodesDTO | null>(null);
    const [showManualEntry, setShowManualEntry] = useState<boolean>(false);
    const [savedCodes, setSavedCodes] = useState<boolean>(false);

    const form = useForm<MFASetupCompleteFormData>({
        resolver: zodResolver(mfaSetupCompleteSchema),
        defaultValues: {
            code: ''
        }
    });

    const { handleSubmit, formState: { errors } } = form;

    const stepProgress = {
        'instructions': 0,
        'qr-code': 25,
        'verification': 50,
        'backup-codes': 75,
        'complete': 100
    };

    useEffect(() => {
        if (currentStep === 'qr-code') {
            initiateMFASetup();
        }
    }, [currentStep]);

    const initiateMFASetup = async (): Promise<void> => {
        setIsLoading(true);
        setError('');

        try {
            const response: MFASetupInitiateDTO = await authService.initiateMFASetup();
            setSetupData(response);
        } catch (err) {
            if (err instanceof AuthServiceError) {
                setError(err.message);
            } else {
                setError('Failed to initiate MFA setup. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const verifySetupCode = async (data: MFASetupCompleteFormData): Promise<void> => {
        if (!setupData) return;

        setIsLoading(true);
        setError('');

        try {
            const response: MFABackupCodesDTO = await authService.completeMFASetup({
                code: data.code
            });
            setBackupCodes(response);
            setCurrentStep('backup-codes');
        } catch (err) {
            if (err instanceof AuthServiceError) {
                setError(err.message);
            } else {
                setError('Invalid verification code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    const downloadBackupCodes = (): void => {
        if (!backupCodes) return;

        const content = `Family TaskTracker - MFA Backup Codes
Generated: ${new Date(backupCodes.generatedAt).toLocaleString()}

IMPORTANT: Save these codes in a secure location. Each code can only be used once.

${backupCodes.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Use these codes if you lose access to your authenticator app
- Each code can only be used once
- Keep these codes secure and private
- Generate new codes if you suspect they've been compromised`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasktracker-backup-codes-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderStepContent = (): React.ReactElement => {
        switch (currentStep) {
            case 'instructions':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                            <h3 className="text-xl font-semibold mb-2">Set Up Two-Factor Authentication</h3>
                            <p className="text-gray-600">
                                Add an extra layer of security to your account by enabling two-factor authentication (2FA).
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Badge variant="outline" className="mt-1">1</Badge>
                                <div>
                                    <h4 className="font-medium">Download an Authenticator App</h4>
                                    <p className="text-sm text-gray-600">
                                        Install Google Authenticator, Authy, or any TOTP-compatible app on your phone.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Badge variant="outline" className="mt-1">2</Badge>
                                <div>
                                    <h4 className="font-medium">Scan QR Code</h4>
                                    <p className="text-sm text-gray-600">
                                        Use your authenticator app to scan the QR code we&apos;ll show you.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Badge variant="outline" className="mt-1">3</Badge>
                                <div>
                                    <h4 className="font-medium">Save Backup Codes</h4>
                                    <p className="text-sm text-gray-600">
                                        Download and securely store backup codes in case you lose your phone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Make sure your phone&apos;s time is synchronized to ensure codes work correctly.
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button onClick={() => setCurrentStep('qr-code')}>
                                Get Started
                            </Button>
                        </div>
                    </div>
                );

            case 'qr-code':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Scan QR Code</h3>
                            <p className="text-gray-600">
                                Open your authenticator app and scan this QR code to add your account.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            {isLoading || !setupData ? (
                                <QRCodeSkeleton size="lg" variant="gamified" />
                            ) : (
                                <div className="text-center">
                                    <Image
                                        src={`data:image/png;base64,${setupData.qrCode}`}
                                        alt="QR Code for MFA setup"
                                        width={192}
                                        height={192}
                                        className="mx-auto border-2 border-gray-200 rounded-lg"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowManualEntry(!showManualEntry)}
                                        className="mt-2"
                                    >
                                        {showManualEntry ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                        {showManualEntry ? 'Hide' : 'Show'} Manual Entry
                                    </Button>
                                </div>
                            )}
                        </div>

                        {showManualEntry && setupData && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Manual Entry</CardTitle>
                                    <CardDescription>
                                        If you can&apos;t scan the QR code, manually enter this key in your authenticator app:
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-2">
                                        <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                                            {setupData.manualEntryKey}
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(setupData.manualEntryKey)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep('instructions')}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setCurrentStep('verification')}
                                disabled={isLoading || !setupData}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                );

            case 'verification':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Verify Setup</h3>
                            <p className="text-gray-600">
                                Enter the 6-digit code from your authenticator app to complete setup.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(verifySetupCode)} className="space-y-4">
                            <div>
                                {isLoading ? (
                                    <MFACodeInputSkeleton variant="gamified" />
                                ) : (
                                    <div className="flex justify-center">
                                        <Input
                                            {...form.register('code')}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-32 text-center text-lg font-mono tracking-widest"
                                            autoComplete="one-time-code"
                                        />
                                    </div>
                                )}
                                {errors.code && (
                                    <p className="text-sm text-red-500 text-center mt-2">{errors.code.message}</p>
                                )}
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep('qr-code')}
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                </Button>
                            </div>
                        </form>
                    </div>
                );

            case 'backup-codes':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                            <h3 className="text-xl font-semibold mb-2">Save Your Backup Codes</h3>
                            <p className="text-gray-600">
                                Store these backup codes securely. Each code can only be used once.
                            </p>
                        </div>

                        {backupCodes ? (
                            <div className="space-y-4">
                                <BackupCodesGridSkeleton
                                    codeCount={backupCodes.backupCodes.length}
                                    gridColumns={2}
                                    showCopyButtons={true}
                                    className="hidden"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    {backupCodes.backupCodes.map((code: string, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                                        >
                                            <code className="font-mono text-sm">{code}</code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(code)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={downloadBackupCodes}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Codes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => copyToClipboard(backupCodes.backupCodes.join('\n'))}
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy All
                                    </Button>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Important:</strong> Save these codes now. You won&apos;t be able to see them again
                                        after completing setup.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="codes-saved"
                                        checked={savedCodes}
                                        onChange={(e) => setSavedCodes(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="codes-saved" className="text-sm">
                                        I have saved my backup codes securely
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <BackupCodesGridSkeleton codeCount={10} gridColumns={2} showCopyButtons={true} />
                        )}

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep('verification')}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setCurrentStep('complete')}
                                disabled={!savedCodes}
                            >
                                Complete Setup
                            </Button>
                        </div>
                    </div>
                );

            case 'complete':
                return (
                    <div className="space-y-6 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
                            <p className="text-gray-600">
                                Two-factor authentication has been successfully enabled for your account.
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• You&apos;ll be asked for a code when logging in</li>
                                <li>• Use your authenticator app to generate codes</li>
                                <li>• Use backup codes if you lose your phone</li>
                                <li>• Generate new backup codes if needed</li>
                            </ul>
                        </div>

                        <Button onClick={onComplete} size="lg" className="w-full">
                            Return to Security Settings
                        </Button>
                    </div>
                );

            default:
                return <div>Unknown step</div>;
        }
    };

    return (
        <Card className={`w-full max-w-md mx-auto ${className}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Two-Factor Authentication</span>
                    </CardTitle>
                    <Badge variant="outline">
                        Step {Object.keys(stepProgress).indexOf(currentStep) + 1} of {Object.keys(stepProgress).length}
                    </Badge>
                </div>
                <Progress value={stepProgress[currentStep]} className="w-full" />
            </CardHeader>
            <CardContent>
                {renderStepContent()}
            </CardContent>
        </Card>
    );
}; 