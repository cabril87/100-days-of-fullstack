'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Shield,
  Key,
  Download,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { 
  MFASetupWizardProps,
  MFASetupState 
} from '@/lib/types/auth';
import {
  mfaSetupCompleteSchema,
  MFASetupCompleteFormData,
} from '@/lib/schemas/auth';
import { mfaService, MFAServiceError } from '@/lib/services/mfaService';
import {
  MFASetupWizardSkeleton,
  QRCodeSkeleton,
  MFABackupCodesGridSkeleton,
} from '@/components/ui/skeletons/mfa-skeletons';

export function MFASetupWizard({ isOpen, onClose, onComplete }: MFASetupWizardProps) {
  const [setupState, setSetupState] = useState<MFASetupState>({
    step: 'setup',
    setupData: null,
    isLoading: false,
    error: null,
  });

  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const form = useForm<MFASetupCompleteFormData>({
    resolver: zodResolver(mfaSetupCompleteSchema),
    defaultValues: {
      code: '',
    },
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSetupState({
        step: 'setup',
        setupData: null,
        isLoading: false,
        error: null,
      });
      setBackupCodes([]);
      setShowManualEntry(false);
      setCopiedCodes(false);
      form.reset();
      initiateMFASetup();
    }
  }, [isOpen, form]);

  const initiateMFASetup = async (): Promise<void> => {
    setSetupState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const setupData = await mfaService.initiateMFASetup();
      setSetupState(prev => ({
        ...prev,
        setupData,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof MFAServiceError 
        ? error.message 
        : 'Failed to initialize MFA setup';
      
      setSetupState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const onVerifyCode = async (data: MFASetupCompleteFormData): Promise<void> => {
    setSetupState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const backupCodesData = await mfaService.completeMFASetup(data);
      setBackupCodes(backupCodesData.backupCodes);
      setSetupState(prev => ({
        ...prev,
        step: 'backup-codes',
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof MFAServiceError 
        ? error.message 
        : 'Invalid verification code. Please try again.';
      
      setSetupState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleDownloadCodes = (): void => {
    try {
      mfaService.downloadBackupCodes(backupCodes);
    } catch {
      setSetupState(prev => ({
        ...prev,
        error: 'Failed to download backup codes',
      }));
    }
  };

  const handleCopyCodes = async (): Promise<void> => {
    try {
      await mfaService.copyBackupCodesToClipboard(backupCodes);
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch {
      setSetupState(prev => ({
        ...prev,
        error: 'Failed to copy backup codes',
      }));
    }
  };

  const handleFinish = (): void => {
    onComplete(backupCodes);
    onClose();
  };

  const getStepProgress = (): number => {
    switch (setupState.step) {
      case 'setup': return 33;
      case 'verify': return 66;
      case 'backup-codes': return 100;
      default: return 0;
    }
  };

  // Show loading skeleton while setting up
  if (setupState.isLoading && !setupState.setupData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Shield className="h-5 w-5" />
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Initializing MFA setup, please wait...
            </DialogDescription>
          </DialogHeader>
          <MFASetupWizardSkeleton step="setup" variant="gamified" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-purple-200 dark:border-purple-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <Shield className="h-5 w-5" />
            Setup Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Setup</span>
              <span>Verify</span>
              <span>Backup Codes</span>
            </div>
          </div>

          {/* Error Alert */}
          {setupState.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{setupState.error}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          {setupState.step === 'setup' && setupState.setupData && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Scan QR Code with Authenticator App
                </h3>
                
                {/* QR Code */}
                <div className="flex justify-center">
                  {setupState.setupData.qrCode ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${setupState.setupData.qrCode}`}
                      alt="MFA QR Code"
                      className="w-48 h-48 border-2 border-purple-200 dark:border-purple-700 rounded-lg"
                    />
                  ) : (
                    <QRCodeSkeleton size="md" variant="gamified" />
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>1. Open your authenticator app (Google Authenticator, Authy, etc.)</p>
                  <p>2. Scan the QR code above</p>
                  <p>3. Enter the 6-digit code from your app on the next step</p>
                </div>

                {/* Manual Entry Option */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {showManualEntry ? 'Hide' : 'Enter'} Secret Key Manually
                    {showManualEntry ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  
                  {showManualEntry && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Secret Key:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={setupState.setupData.manualEntryKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(setupState.setupData!.secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setSetupState(prev => ({ ...prev, step: 'verify' }))}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {setupState.step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Enter Verification Code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onVerifyCode)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="000000"
                            maxLength={6}
                            className="text-center text-lg tracking-widest font-mono"
                            autoFocus
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the 6-digit code from your authenticator app
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSetupState(prev => ({ ...prev, step: 'setup' }))}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={setupState.isLoading}
                      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                      {setupState.isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {setupState.step === 'backup-codes' && (
            <div className="space-y-6">
              <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> Save these backup codes in a secure location. 
                  Each code can only be used once to recover access to your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-center">
                  Your MFA Backup Codes
                </h3>
                
                {backupCodes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-50 dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded text-center font-mono text-sm"
                      >
                        {mfaService.formatBackupCodeForDisplay(code)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <MFABackupCodesGridSkeleton variant="gamified" />
                )}

                <div className="flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadCodes}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyCodes}
                    className="flex items-center gap-2"
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 