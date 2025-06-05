'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  QRCodeSkeletonProps,
  MFACodeInputSkeletonProps,
  BackupCodesGridSkeletonProps,
  SecurityLevelBadgeSkeletonProps,
} from '@/lib/types/skeleton';

// ✅ REQUIRED: QR Code Skeleton
export const QRCodeSkeleton: React.FC<QRCodeSkeletonProps> = ({
  size,
  showBorder,
  showScanningAnimation,
  variant = 'gamified',
  className = '',
}) => {
  const sizeClasses = {
    small: 'h-32 w-32',
    medium: 'h-48 w-48',
    large: 'h-64 w-64',
  };

  const scanningClass = showScanningAnimation ? 'animate-pulse bg-gradient-to-r from-primary/20 to-secondary/20' : '';
  const borderClass = showBorder ? 'border-2 border-muted' : '';

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className={cn(
          sizeClasses[size],
          'rounded-lg',
          borderClass,
          scanningClass
        )}
        aria-label={`Loading ${size} QR code`}
      >
        <div />
      </SkeletonWrapper>
      
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className="h-4 w-32"
        aria-label="Loading QR code instructions"
      >
        <div />
      </SkeletonWrapper>
    </div>
  );
};

// ✅ REQUIRED: MFA Code Input Skeleton
export const MFACodeInputSkeleton: React.FC<MFACodeInputSkeletonProps> = ({
  digitCount,
  showFocusState,
  showErrorState,
  variant = 'gamified',
  className = '',
}) => {
  const focusClass = showFocusState ? 'ring-2 ring-primary' : '';
  const errorClass = showErrorState ? 'ring-2 ring-destructive' : '';

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="flex space-x-2">
        {Array.from({ length: digitCount }).map((_, index) => (
          <SkeletonWrapper
            key={index}
            isLoading={true}
            variant={variant}
            className={cn(
              'h-12 w-10 rounded border',
              focusClass,
              errorClass
            )}
            aria-label={`Loading MFA digit input ${index + 1}`}
          >
            <div />
          </SkeletonWrapper>
        ))}
      </div>
      
      <SkeletonWrapper
        isLoading={true}
        variant={variant}
        className="h-4 w-40"
        aria-label="Loading MFA instructions"
      >
        <div />
      </SkeletonWrapper>
    </div>
  );
};

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