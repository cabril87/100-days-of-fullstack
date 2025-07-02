'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { 
  MFAStatusCardProps,
  MFAManagementState 
} from '@/lib/types/auth';
import { mfaService, MFAServiceError } from '@/lib/services/mfaService';
import { MFAStatusCardSkeleton } from '@/components/ui/skeletons/mfa-skeletons';
import { MFADisableDialog } from './MFADisableDialog';
import { MFABackupCodesDialog } from './MFABackupCodesDialog';
import { formatDistanceToNow } from 'date-fns';

interface MFAStatusCardContainerProps {
  onSetupMFA: () => void;
  onMFAStatusChange?: (isEnabled: boolean) => void;
}

export function MFAStatusCardContainer({ 
  onSetupMFA, 
  onMFAStatusChange 
}: MFAStatusCardContainerProps) {
  const [managementState, setManagementState] = useState<MFAManagementState>({
    status: null,
    isLoading: true,
    error: null,
    showBackupCodes: false,
    showDisableDialog: false,
  });
  
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadMFAStatus = React.useCallback(async (): Promise<void> => {
    setManagementState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const status = await mfaService.getMFAStatus();
      setManagementState(prev => ({
        ...prev,
        status,
        isLoading: false,
      }));
      
      // Notify parent component of MFA status
      onMFAStatusChange?.(status.isEnabled);
    } catch (error) {
      const errorMessage = error instanceof MFAServiceError 
        ? error.message 
        : 'Failed to load MFA status';
      
      setManagementState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [onMFAStatusChange]);

  useEffect(() => {
    loadMFAStatus();
  }, [loadMFAStatus]);

  const handleSetup = (): void => {
    onSetupMFA();
  };

  const handleDisable = (): void => {
    setManagementState(prev => ({ ...prev, showDisableDialog: true }));
  };

  const handleViewBackupCodes = (): void => {
    // For security reasons, backup codes can only be viewed when generated
    // Show a dialog explaining this and offering to generate new codes
    setBackupCodes([]); // Empty array to show security message
    setManagementState(prev => ({ 
      ...prev, 
      showBackupCodes: true
    }));
  };

  const handleRegenerateBackupCodes = async (): Promise<void> => {
    setIsRegenerating(true);
    try {
      const newBackupCodes = await mfaService.regenerateBackupCodes();
      setBackupCodes(newBackupCodes.backupCodes);
      await loadMFAStatus(); // Refresh status to update backup codes count
      setManagementState(prev => ({ 
        ...prev, 
        showBackupCodes: true, // Show the new codes
        error: null 
      }));
    } catch (error) {
      const errorMessage = error instanceof MFAServiceError 
        ? error.message 
        : 'Failed to regenerate backup codes';
      
      setManagementState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleConfirmDisable = async (password: string, code?: string): Promise<void> => {
    setIsDisabling(true);
    try {
      await mfaService.disableMFA({ password, code });
      await loadMFAStatus(); // Refresh status
      setManagementState(prev => ({ 
        ...prev, 
        showDisableDialog: false,
        error: null 
      }));
      onMFAStatusChange?.(false); // Notify parent
    } catch (error) {
      const errorMessage = error instanceof MFAServiceError 
        ? error.message 
        : 'Failed to disable MFA';
      
      setManagementState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCloseDisableDialog = (): void => {
    if (!isDisabling) {
      setManagementState(prev => ({ ...prev, showDisableDialog: false }));
    }
  };

  const handleCloseBackupCodesDialog = (): void => {
    setManagementState(prev => ({ ...prev, showBackupCodes: false }));
    setBackupCodes([]);
  };

  // Show loading skeleton
  if (managementState.isLoading) {
    return (
      <MFAStatusCardSkeleton 
        showSetupButton={true}
        showBackupCodesSection={false}
        showDisableButton={false}
        variant="gamified"
      />
    );
  }

  // Show error state
  if (managementState.error || !managementState.status) {
    return (
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <ShieldAlert className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Failed to load MFA status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{managementState.error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={loadMFAStatus} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <MFAStatusCard 
        status={managementState.status}
        onSetup={handleSetup}
        onDisable={handleDisable}
        onViewBackupCodes={handleViewBackupCodes}
        onRegenerateBackupCodes={handleRegenerateBackupCodes}
      />
      
      {/* MFA Disable Dialog */}
      <MFADisableDialog
        isOpen={managementState.showDisableDialog}
        onClose={handleCloseDisableDialog}
        onConfirm={handleConfirmDisable}
        isLoading={isDisabling}
      />
      
      {/* MFA Backup Codes Dialog */}
      <MFABackupCodesDialog
        isOpen={managementState.showBackupCodes}
        onClose={handleCloseBackupCodesDialog}
        backupCodes={backupCodes}
        onRegenerate={handleRegenerateBackupCodes}
        isLoading={isRegenerating}
      />
    </>
  );
}

export function MFAStatusCard({
  status,
  onSetup,
  onDisable,
  onViewBackupCodes,
  onRegenerateBackupCodes,
}: MFAStatusCardProps) {
  const formatSetupDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getSecurityLevel = (): { level: string; color: string; icon: React.ReactNode } => {
    if (status.isEnabled) {
      if (status.backupCodesRemaining > 5) {
        return {
          level: 'Excellent',
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
          icon: <ShieldCheck className="h-4 w-4" />,
        };
      } else if (status.backupCodesRemaining > 0) {
        return {
          level: 'Good',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
          icon: <Shield className="h-4 w-4" />,
        };
      } else {
        return {
          level: 'At Risk',
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
          icon: <ShieldAlert className="h-4 w-4" />,
        };
      }
    }
    
    return {
      level: 'Disabled',
      color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800',
      icon: <X className="h-4 w-4" />,
    };
  };

  const securityInfo = getSecurityLevel();

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-xl overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-purple-900 dark:text-purple-100 text-base sm:text-lg">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold">
                <span className="hidden sm:inline">Two-Factor Authentication</span>
                <span className="sm:hidden">2FA</span>
              </span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add an extra layer of security to your account
            </CardDescription>
          </div>
          <Badge className={`flex items-center gap-1 text-xs sm:text-sm px-2 py-1 rounded-lg shadow-lg ${securityInfo.color}`}>
            {securityInfo.icon}
            <span className="hidden sm:inline">{securityInfo.level}</span>
            <span className="sm:hidden">{securityInfo.level.split(' ')[0]}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Status Information */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {status.isEnabled ? (
              <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            ) : (
              <div className="p-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <X className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            )}
            <span className="text-xs sm:text-sm font-medium">
              MFA is {status.isEnabled ? 'enabled' : 'disabled'}
            </span>
          </div>
          
          {status.setupDate && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Setup {formatSetupDate(status.setupDate)}
              </span>
            </div>
          )}
          
          {status.isEnabled && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                <Key className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {status.backupCodesRemaining} backup codes remaining
              </span>
            </div>
          )}
        </div>

        {/* Backup Codes Warning */}
        {status.isEnabled && status.backupCodesRemaining <= 2 && (
          <Alert variant="default" className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-lg">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
              {status.backupCodesRemaining === 0 
                ? 'You have no backup codes left. Generate new ones immediately.'
                : `You only have ${status.backupCodesRemaining} backup codes left. Consider generating new ones.`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-4">
          {!status.isEnabled ? (
            <Button
              onClick={onSetup}
              className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden group flex items-center gap-2 px-4 py-2 h-10 sm:h-12"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
              <span className="relative z-10">Setup MFA</span>
            </Button>
          ) : (
            <>
              <Button
                onClick={onViewBackupCodes}
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-10 sm:h-12"
              >
                <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">View Backup Codes</span>
                <span className="sm:hidden">View Codes</span>
              </Button>
              
              <Button
                onClick={onRegenerateBackupCodes}
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-10 sm:h-12"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Generate New Codes</span>
                <span className="sm:hidden">New Codes</span>
              </Button>
              
              <Button
                onClick={onDisable}
                variant="outline"
                className="text-red-400 hover:text-red-300 border-red-400/30 hover:border-red-300/50 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-12"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Disable MFA</span>
                <span className="sm:hidden">Disable</span>
              </Button>
            </>
          )}
        </div>

        {/* Security Tips */}
        {!status.isEnabled && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 shadow-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
              Why enable MFA?
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Protects your account even if your password is compromised</li>
              <li>• Required for accessing sensitive family management features</li>
              <li>• Recommended by security experts worldwide</li>
              <li>• Takes less than 2 minutes to set up</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
