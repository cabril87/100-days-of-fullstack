'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/helpers/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  InvitationFormSkeletonProps,
  FamilyMemberListSkeletonProps,
  PendingInvitationCardSkeletonProps,
  InvitationAcceptanceFlowSkeletonProps,
} from '@/lib/props/ui/skeleton.props';

// ✅ REQUIRED: Invitation Form Skeleton
export const InvitationFormSkeleton: React.FC<InvitationFormSkeletonProps> = ({
  className,
  isLoading = true,
  showEmailField = true,
  showRoleSelector = true,
  showSubmitButton = true,
  ...props
}) => {
  return (
    <SkeletonWrapper
      isLoading={isLoading}
      className={cn('space-y-4', className)}
      variant="default"
      {...props}
    >
      <div className="space-y-6">
        {/* Form Header */}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Email Field */}
        {showEmailField && (
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        )}

        {/* Role Selector */}
        {showRoleSelector && (
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        )}

        {/* Additional Form Fields */}
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Action Buttons */}
        {showSubmitButton && (
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-10 w-24 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
          </div>
        )}
      </div>
    </SkeletonWrapper>
  );
};

// ✅ REQUIRED: Family Member List Skeleton
export const FamilyMemberListSkeleton: React.FC<FamilyMemberListSkeletonProps> = ({
  className,
  isLoading = true,
  memberCount = 3,
  showActions = true,
  showAvatars = true,
  showRoles = true,
  ...props
}) => {
  const members = Array.from({ length: memberCount }, (_, i) => i);

  return (
    <SkeletonWrapper
      isLoading={isLoading}
      className={cn('space-y-4', className)}
      variant="default"
      {...props}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          {showActions && (
            <div className="h-8 w-20 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
          )}
        </div>

        {/* Member List */}
        <div className="space-y-3">
          {members.map((index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                {showAvatars && (
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                )}
                
                {/* Member Info */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  {showRoles && (
                    <div className="h-3 w-16 bg-green-200 dark:bg-green-800 rounded animate-pulse" />
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-red-200 dark:bg-red-800 rounded animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
};

// ✅ REQUIRED: Pending Invitation Card Skeleton
export const PendingInvitationCardSkeleton: React.FC<PendingInvitationCardSkeletonProps> = ({
  className,
  isLoading = true,
  cardCount = 2,
  showTimer = true,
  showActions = true,
  showStatus = true,
  ...props
}) => {
  const cards = Array.from({ length: cardCount }, (_, i) => i);

  return (
    <SkeletonWrapper
      isLoading={isLoading}
      className={cn('space-y-4', className)}
      variant="card"
      {...props}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

        {/* Invitation Cards */}
        <div className="grid gap-4">
          {cards.map((index) => (
            <div
              key={index}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="space-y-3">
                {/* Invitation Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    {showStatus && (
                      <div className="h-3 w-20 bg-yellow-200 dark:bg-yellow-800 rounded animate-pulse" />
                    )}
                  </div>
                  
                  {/* Timer */}
                  {showTimer && (
                    <div className="h-6 w-16 bg-orange-200 dark:bg-orange-800 rounded animate-pulse" />
                  )}
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex space-x-2 pt-2">
                    <div className="h-8 w-16 bg-green-200 dark:bg-green-800 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-red-200 dark:bg-red-800 rounded animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
};

// ✅ REQUIRED: Invitation Acceptance Flow Skeleton
export const InvitationAcceptanceFlowSkeleton: React.FC<InvitationAcceptanceFlowSkeletonProps> = ({
  className,
  isLoading = true,
  currentStep = 1,
  totalSteps = 3,
  showProgress = true,
  showNavigation = true,
  ...props
}) => {
  return (
    <SkeletonWrapper
      isLoading={isLoading}
      className={cn('space-y-6', className)}
      variant="default"
      {...props}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        {showProgress && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse">
              <div
                className="h-2 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Navigation */}
        {showNavigation && (
          <div className="flex justify-between pt-4">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-20 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
          </div>
        )}
      </div>
    </SkeletonWrapper>
  );
}; 
