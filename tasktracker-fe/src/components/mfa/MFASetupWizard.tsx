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
      <DialogContent className="sm:max-w-md border-2 border-purple-200 dark:border-purple-800 mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-2 sm:px-6 pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-purple-900 dark:text-purple-100 text-base sm:text-lg">
            <div className="p-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
              <span className="hidden sm:inline">Setup Two-Factor Authentication</span>
              <span className="sm:hidden">Setup 2FA</span>
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-2 sm:px-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getStepProgress()} className="h-1.5 sm:h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Setup</span>
              <span>Verify</span>
              <span className="hidden sm:inline">Backup Codes</span>
              <span className="sm:hidden">Codes</span>
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
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
                </div>
                <h3 className="font-semibold text-base sm:text-lg">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Scan QR Code with Authenticator App
                  </span>
                </h3>
                
                {/* QR Code */}
                <div className="flex justify-center">
                  {setupState.setupData.qrCode ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${setupState.setupData.qrCode}`}
                      alt="MFA QR Code"
                      className="w-40 h-40 sm:w-48 sm:h-48 border-2 border-purple-200 dark:border-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                  ) : (
                    <QRCodeSkeleton size="md" variant="gamified" />
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <p>1. Open your authenticator app (Google Authenticator, Authy, etc.)</p>
                  <p>2. Scan the QR code above</p>
                  <p>3. Enter the 6-digit code from your app on the next step</p>
                </div>

                {/* Manual Entry Option */}
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
                  >
                    <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{showManualEntry ? 'Hide' : 'Enter'} Secret Key Manually</span>
                    <span className="sm:hidden">{showManualEntry ? 'Hide' : 'Show'} Key</span>
                    {showManualEntry ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
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
                  className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden group flex items-center gap-2 px-4 py-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Next</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          )}

          {setupState.step === 'verify' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
                </div>
                <h3 className="font-semibold text-base sm:text-lg">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Enter Verification Code
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onVerifyCode)} className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:space-y-3">
                        <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                          <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          Verification Code
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                          <Input
                            {...field}
                            placeholder="000000"
                            maxLength={6}
                              className="h-12 sm:h-14 text-center text-base sm:text-lg tracking-widest font-mono bg-gray-700 border-2 border-gray-600 focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-green-300"
                            autoFocus
                          />
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm text-gray-400">
                          Enter the 6-digit code from your authenticator app
                        </FormDescription>
                        <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSetupState(prev => ({ ...prev, step: 'setup' }))}
                      className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-10 sm:h-12"
                    >
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={setupState.isLoading}
                      className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden group flex items-center gap-2 px-4 py-2 h-10 sm:h-12"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {setupState.isLoading ? (
                        <div className="flex items-center gap-2 relative z-10">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 relative z-10">
                          <span>Verify & Continue</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {setupState.step === 'backup-codes' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/25 transform hover:scale-105 transition-all duration-300">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
                </div>
                <h3 className="font-semibold text-base sm:text-lg">
                  <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    Your MFA Backup Codes
                  </span>
                </h3>
              </div>

              <Alert variant="default" className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-lg">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
                  <strong>Important:</strong> Save these backup codes in a secure location. 
                  Each code can only be used once to recover access to your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 sm:space-y-4">
                
                {backupCodes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-purple-200 dark:border-purple-700 rounded-lg text-center font-mono text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        {mfaService.formatBackupCodeForDisplay(code)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <MFABackupCodesGridSkeleton variant="gamified" />
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadCodes}
                    className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-10 sm:h-12"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyCodes}
                    className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-10 sm:h-12"
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden group flex items-center gap-2 px-4 py-2 h-10 sm:h-12"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
                  <span className="relative z-10">Complete Setup</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 