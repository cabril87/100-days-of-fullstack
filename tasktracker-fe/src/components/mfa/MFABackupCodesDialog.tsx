'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Key,
    Download,
    Copy,
    RefreshCw,
    AlertTriangle,
    Check,
    Eye,
    EyeOff,
    Shield,
} from 'lucide-react';
import { MFABackupCodesDialogProps } from '@/lib/types/auth';
import { mfaService } from '@/lib/services/mfaService';

export function MFABackupCodesDialog({
    isOpen,
    onClose,
    backupCodes,
    onRegenerate,
    isLoading,
}: MFABackupCodesDialogProps) {
    const [copiedCodes, setCopiedCodes] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [showCodes, setShowCodes] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleDownloadCodes = (): void => {
        try {
            mfaService.downloadBackupCodes(backupCodes, `tasktracker-backup-codes-${Date.now()}.txt`);
        } catch (error) {
            console.error('Failed to download backup codes:', error);
        }
    };

    const handleCopyAllCodes = async (): Promise<void> => {
        try {
            await mfaService.copyBackupCodesToClipboard(backupCodes);
            setCopiedCodes(true);
            setTimeout(() => setCopiedCodes(false), 2000);
        } catch (error) {
            console.error('Failed to copy backup codes:', error);
        }
    };

    const handleCopyIndividualCode = async (code: string, index: number): Promise<void> => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    };

    const handleRegenerate = async (): Promise<void> => {
        setIsRegenerating(true);
        try {
            await onRegenerate();
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleClose = (): void => {
        if (!isLoading && !isRegenerating) {
            setShowCodes(false);
            setCopiedCodes(false);
            setCopiedIndex(null);
            onClose();
        }
    };

    const formatCodeForDisplay = (code: string): string => {
        // Format as XXX-XXX for better readability
        if (code.length === 6) {
            return `${code.substring(0, 3)}-${code.substring(3, 6)}`;
        }
        return code;
    };

    const maskedCode = (): string => {
        return '***-***';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl border-2 border-purple-200 dark:border-purple-800 max-h-[90vh] overflow-y-auto mx-4">
                <DialogHeader className="pb-2 sm:pb-4">
                    <DialogTitle className="flex items-center gap-2 sm:gap-3 text-purple-900 dark:text-purple-100 text-base sm:text-lg">
                        <div className="p-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                            <Key className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold">
                            MFA Backup Codes
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Use these codes to access your account if you lose your authenticator device
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Security Information */}
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Important:</strong> Each backup code can only be used once.
                            Store them securely and treat them like passwords.
                        </AlertDescription>
                    </Alert>

                    {/* Backup Codes Grid or Security Message */}
                    <div className="space-y-4">
                        {backupCodes.length === 0 ? (
                            /* Security Message when no codes available */
                            <div className="text-center py-8">
                                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Backup Codes Not Available
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    For security reasons, backup codes can only be viewed when they are freshly generated.
                                    Your existing codes are securely stored and can be used for login, but cannot be displayed again.
                                </p>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left">
                                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                                        What you can do:
                                    </h4>
                                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                        <li>• Generate new backup codes (this will invalidate old ones)</li>
                                        <li>• Use your authenticator app for regular login</li>
                                        <li>• Contact support if you&apos;ve lost access to both</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            /* Backup Codes Display when codes are available */
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Your Backup Codes</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Key className="h-3 w-3" />
                                            {backupCodes.length} codes
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowCodes(!showCodes)}
                                            className="flex items-center gap-2"
                                        >
                                            {showCodes ? (
                                                <>
                                                    <EyeOff className="h-4 w-4" />
                                                    Hide
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-4 w-4" />
                                                    Show
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                    {backupCodes.map((code, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                                        >
                                            <code className="font-mono text-sm font-medium">
                                                {showCodes ? formatCodeForDisplay(code) : maskedCode()}
                                            </code>
                                            {showCodes && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopyIndividualCode(code, index)}
                                                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    {copiedIndex === index ? (
                                                        <Check className="h-3 w-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Security Best Practices */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Security Best Practices:
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Store these codes in a password manager or secure location</li>
                            <li>• Don&apos;t store them in plain text files or photos</li>
                            <li>• Each code can only be used once - they&apos;re consumed when used</li>
                            <li>• Generate new codes if you suspect they&apos;ve been compromised</li>
                            <li>• Print them and store the paper copy in a safe place</li>
                        </ul>
                    </div>

                    {/* Warning for Low Codes */}
                    {backupCodes.length > 0 && backupCodes.length <= 3 && (
                        <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                                You have {backupCodes.length} backup codes remaining. Consider generating new ones.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                        {backupCodes.length > 0 ? (
                            <>
                                <Button
                                    onClick={handleDownloadCodes}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download as File
                                </Button>

                                <Button
                                    onClick={handleCopyAllCodes}
                                    variant="outline"
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
                                            Copy All
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : null}

                        <Button
                            onClick={handleRegenerate}
                            variant="outline"
                            className={`flex items-center gap-2 ${backupCodes.length === 0
                                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                                : 'text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300'
                                }`}
                            disabled={isRegenerating}
                        >
                            {isRegenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    {backupCodes.length === 0 ? 'Generate Backup Codes' : 'Generate New Codes'}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Regeneration Warning */}
                    <Alert variant="default" className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 dark:text-orange-200">
                            <strong>Note:</strong> Generating new codes will permanently invalidate all current backup codes.
                        </AlertDescription>
                    </Alert>

                    {/* Close Button */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleClose} disabled={isLoading || isRegenerating}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 