'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  InvitationFormSkeletonProps,
  FamilyMemberListSkeletonProps,
  PendingInvitationCardSkeletonProps,
} from '@/lib/types/skeleton';

// ✅ REQUIRED: Invitation Form Skeleton
export const InvitationFormSkeleton: React.FC<InvitationFormSkeletonProps> = ({
  showEmailField,
  showRoleSelector,
  showSubmitButton,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-6 w-40"
          aria-label="Loading invitation form title"
        >
          <div />
        </SkeletonWrapper>
      </CardHeader>
      <CardContent className="space-y-4">
        {showEmailField && (
          <div className="space-y-2">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-20"
              aria-label="Loading email field label"
            >
              <div />
            </SkeletonWrapper>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-10 w-full rounded border"
              aria-label="Loading email input field"
            >
              <div />
            </SkeletonWrapper>
          </div>
        )}

        {showRoleSelector && (
          <div className="space-y-2">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-16"
              aria-label="Loading role selector label"
            >
              <div />
            </SkeletonWrapper>
            <div className="flex space-x-2">
              {['Parent', 'Teen', 'Child'].map((_, index) => (
                <SkeletonWrapper
                  key={index}
                  isLoading={true}
                  variant={variant}
                  className="h-10 w-20 rounded border"
                  aria-label={`Loading role option ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              ))}
            </div>
          </div>
        )}

        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-4 w-full"
          aria-label="Loading invitation message field"
        >
          <div />
        </SkeletonWrapper>

        {showSubmitButton && (
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-10 w-32 rounded bg-gradient-to-r from-primary/20 to-secondary/20"
            aria-label="Loading send invitation button"
          >
            <div />
          </SkeletonWrapper>
        )}
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Family Member List Skeleton
export const FamilyMemberListSkeleton: React.FC<FamilyMemberListSkeletonProps> = ({
  memberCount,
  showAvatars,
  showRoles,
  showActions,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: memberCount }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {showAvatars && (
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-12 w-12 rounded-full"
                    aria-label={`Loading avatar for member ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                )}
                
                <div className="space-y-2">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-5 w-32"
                    aria-label={`Loading name for member ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-4 w-24"
                    aria-label={`Loading email for member ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {showRoles && (
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-6 w-16 rounded-full bg-gradient-to-r from-blue-200/50 to-purple-200/50"
                    aria-label={`Loading role badge for member ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                )}
                
                {showActions && (
                  <div className="flex space-x-1">
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-8 w-8 rounded"
                      aria-label={`Loading action button 1 for member ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-8 w-8 rounded"
                      aria-label={`Loading action button 2 for member ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ✅ REQUIRED: Pending Invitation Cards Skeleton
export const PendingInvitationCardSkeleton: React.FC<PendingInvitationCardSkeletonProps> = ({
  cardCount,
  showTimer,
  showStatus,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-32"
                aria-label={`Loading invitation email ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              
              {showStatus && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-6 w-16 rounded-full bg-gradient-to-r from-orange-200/50 to-yellow-200/50"
                  aria-label={`Loading status for invitation ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-20"
              aria-label={`Loading role for invitation ${index + 1}`}
            >
              <div />
            </SkeletonWrapper>
            
            {showTimer && (
              <div className="space-y-2">
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-16"
                  aria-label={`Loading timer label for invitation ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-6 w-24 rounded bg-gradient-to-r from-red-200/50 to-pink-200/50"
                  aria-label={`Loading countdown timer for invitation ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              </div>
            )}
            
            <div className="flex space-x-2 pt-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-20 rounded"
                aria-label={`Loading resend button for invitation ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-16 rounded"
                aria-label={`Loading cancel button for invitation ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ✅ REQUIRED: Invitation Acceptance Flow Skeleton
interface InvitationAcceptanceFlowSkeletonProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'default' | 'gamified' | 'child-friendly';
  className?: string;
}

export const InvitationAcceptanceFlowSkeleton: React.FC<InvitationAcceptanceFlowSkeletonProps> = ({
  currentStep,
  totalSteps,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
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
            {index < totalSteps - 1 && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-1 w-12"
                aria-label="Loading step connector"
              >
                <div />
              </SkeletonWrapper>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Welcome message */}
      <Card>
        <CardHeader className="text-center">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-8 w-64 mx-auto"
            aria-label="Loading welcome title"
          >
            <div />
          </SkeletonWrapper>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-full"
            aria-label="Loading welcome message"
          >
            <div />
          </SkeletonWrapper>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-3/4 mx-auto"
            aria-label="Loading welcome description"
          >
            <div />
          </SkeletonWrapper>
        </CardContent>
      </Card>
      
      {/* Family info card */}
      <Card>
        <CardHeader>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-6 w-32"
            aria-label="Loading family info title"
          >
            <div />
          </SkeletonWrapper>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-12 w-12 rounded-full"
              aria-label="Loading family avatar"
            >
              <div />
            </SkeletonWrapper>
            <div className="space-y-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-24"
                aria-label="Loading family name"
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-16"
                aria-label="Loading member count"
              >
                <div />
              </SkeletonWrapper>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action buttons */}
      <div className="flex space-x-4 justify-center">
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-10 w-24 rounded bg-gradient-to-r from-green-200/50 to-emerald-200/50"
          aria-label="Loading accept button"
        >
          <div />
        </SkeletonWrapper>
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-10 w-24 rounded"
          aria-label="Loading decline button"
        >
          <div />
        </SkeletonWrapper>
      </div>
    </div>
  );
}; 