'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  BackupCodesGridSkeletonProps,
  SecurityLevelBadgeSkeletonProps,
} from '@/lib/types/skeleton';

// === MFA SKELETON COMPONENTS ===

export interface MFAStatusCardSkeletonProps {
  showSetupButton?: boolean;
  showBackupCodesSection?: boolean;
  showDisableButton?: boolean;
  variant?: 'default' | 'gamified';
}

export function MFAStatusCardSkeleton({
  showSetupButton = true,
  showBackupCodesSection = false,
  showDisableButton = false,
  variant = 'gamified'
}: MFAStatusCardSkeletonProps) {
  const cardClass = variant === 'gamified' 
    ? 'border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
    : '';

  return (
    <Card className={cardClass}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Setup Date */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Backup Codes Section */}
        {showBackupCodesSection && (
          <div className="border-t pt-4 space-y-3">
            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {showSetupButton && (
            <div className="h-10 w-28 bg-purple-200 dark:bg-purple-700 rounded animate-pulse" />
          )}
          {showDisableButton && (
            <div className="h-10 w-28 bg-red-200 dark:bg-red-700 rounded animate-pulse" />
          )}
          {showBackupCodesSection && (
            <div className="h-10 w-32 bg-blue-200 dark:bg-blue-700 rounded animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export interface MFASetupWizardSkeletonProps {
  step?: 'setup' | 'verify' | 'backup-codes';
  variant?: 'default' | 'gamified';
}

export function MFASetupWizardSkeleton({
  step = 'setup',
  variant = 'gamified'
}: MFASetupWizardSkeletonProps) {
  const dialogClass = variant === 'gamified'
    ? 'border-2 border-purple-200 dark:border-purple-800'
    : '';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${dialogClass}`}>
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
              />
            ))}
          </div>

          {/* Content based on step */}
          {step === 'setup' && (
            <div className="space-y-4">
              {/* QR Code Area */}
              <div className="flex justify-center">
                <div className="h-48 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
              
              {/* Manual Entry */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              
              {/* Instructions */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              {/* Code Input */}
              <div className="space-y-2">
                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              
              {/* Instructions */}
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          )}

          {step === 'backup-codes' && (
            <div className="space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="h-5 w-5 bg-yellow-200 dark:bg-yellow-700 rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-yellow-200 dark:bg-yellow-700 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-yellow-200 dark:bg-yellow-700 rounded animate-pulse" />
                </div>
              </div>
              
              {/* Backup Codes Grid */}
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-24 bg-purple-200 dark:bg-purple-700 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export interface MFAVerificationFormSkeletonProps {
  showBackupOption?: boolean;
  variant?: 'default' | 'gamified';
}

export function MFAVerificationFormSkeleton({
  showBackupOption = true,
  variant = 'gamified'
}: MFAVerificationFormSkeletonProps) {
  return (
    <Card className={variant === 'gamified' ? 'border-2 border-blue-200 dark:border-blue-800' : ''}>
      <CardHeader>
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-blue-200 dark:bg-blue-700 rounded animate-pulse" />
          {showBackupOption && (
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export interface MFABackupCodesGridSkeletonProps {
  codeCount?: number;
  variant?: 'default' | 'gamified';
}

export function MFABackupCodesGridSkeleton({
  codeCount = 10,
  variant = 'gamified'
}: MFABackupCodesGridSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
      </div>

      {/* Warning Alert */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="h-5 w-5 bg-amber-200 dark:bg-amber-700 rounded animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-full bg-amber-200 dark:bg-amber-700 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-amber-200 dark:bg-amber-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Backup Codes Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: codeCount }).map((_, i) => (
          <div
            key={i}
            className={`
              h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse
              ${variant === 'gamified' ? 'border border-purple-200 dark:border-purple-700' : ''}
            `}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 pt-4">
        <div className="h-10 w-28 bg-green-200 dark:bg-green-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-blue-200 dark:bg-blue-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function MFACodeInputSkeleton({
  variant = 'gamified'
}: { variant?: 'default' | 'gamified' }) {
  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      
      {/* Code Input Boxes */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`
              h-12 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse
              ${variant === 'gamified' ? 'border border-purple-200 dark:border-purple-700' : ''}
            `}
          />
        ))}
      </div>
      
      {/* Helper Text */}
      <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
    </div>
  );
}

export function QRCodeSkeleton({
  size = 'md',
  variant = 'gamified'
}: { size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'gamified' }) {
  const sizeClasses = {
    sm: 'h-32 w-32',
    md: 'h-48 w-48',
    lg: 'h-64 w-64'
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* QR Code */}
      <div
        className={`
          ${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse
          ${variant === 'gamified' ? 'border-2 border-purple-200 dark:border-purple-700' : ''}
        `}
      />
      
      {/* Label */}
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

// ✅ REQUIRED: Backup Codes Grid Skeleton
export const BackupCodesGridSkeleton: React.FC<BackupCodesGridSkeletonProps> = ({
  codeCount,
  showCopyButtons,
  gridColumns,
  variant = 'gamified',
  className = '',
}) => {
  const gridClass = `grid-cols-${gridColumns}`;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-6 w-32"
          aria-label="Loading backup codes title"
        >
          <div />
        </SkeletonWrapper>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-3', gridClass)}>
          {Array.from({ length: codeCount }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-10 flex-1 rounded border font-mono"
                aria-label={`Loading backup code ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              
              {showCopyButtons && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-8 w-8 rounded"
                  aria-label={`Loading copy button for code ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 space-y-2">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-10 w-32 rounded"
            aria-label="Loading download button"
          >
            <div />
          </SkeletonWrapper>
          
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-48"
            aria-label="Loading backup codes warning"
          >
            <div />
          </SkeletonWrapper>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Security Level Badge Skeleton
export const SecurityLevelBadgeSkeleton: React.FC<SecurityLevelBadgeSkeletonProps> = ({
  showShield,
  showLevel,
  showProgress,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          {showShield && (
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-green-200/50 to-emerald-200/50"
              aria-label="Loading security shield"
            >
              <div />
            </SkeletonWrapper>
          )}
          
          <div className="flex-1 space-y-2">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-5 w-24"
              aria-label="Loading security title"
            >
              <div />
            </SkeletonWrapper>
            
            {showLevel && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-16 rounded-full"
                aria-label="Loading security level"
              >
                <div />
              </SkeletonWrapper>
            )}
            
            {showProgress && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-2 w-full rounded-full"
                aria-label="Loading security progress"
              >
                <div />
              </SkeletonWrapper>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: MFA Setup Steps Skeleton
interface MFASetupStepsSkeletonProps {
  stepCount: number;
  currentStep?: number;
  variant?: 'default' | 'gamified' | 'child-friendly';
  className?: string;
}

export const MFASetupStepsSkeleton: React.FC<MFASetupStepsSkeletonProps> = ({
  stepCount,
  currentStep = 1,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress indicator */}
      <div className="flex items-center space-x-2">
        {Array.from({ length: stepCount }).map((_, index) => (
          <React.Fragment key={index}>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className={cn(
                'h-8 w-8 rounded-full',
                index < currentStep ? 'bg-primary/20' : 'bg-muted'
              )}
              aria-label={`Loading step ${index + 1} indicator`}
            >
              <div />
            </SkeletonWrapper>
            {index < stepCount - 1 && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-1 w-8"
                aria-label="Loading step connector"
              >
                <div />
              </SkeletonWrapper>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Step content */}
      <Card>
        <CardHeader>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-6 w-40"
            aria-label="Loading step title"
          >
            <div />
          </SkeletonWrapper>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-full"
              aria-label="Loading step description"
            >
              <div />
            </SkeletonWrapper>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-3/4"
              aria-label="Loading step instructions"
            >
              <div />
            </SkeletonWrapper>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-10 w-32 rounded"
              aria-label="Loading step action button"
            >
              <div />
            </SkeletonWrapper>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 