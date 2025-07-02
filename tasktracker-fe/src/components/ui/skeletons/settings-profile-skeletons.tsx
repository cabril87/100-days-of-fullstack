'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/helpers/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  ProfileHeaderSkeletonProps,
  ProfileFormSkeletonProps,
  SettingsMenuSkeletonProps,
  SettingsSectionSkeletonProps,
  FamilyManagementSkeletonProps,
} from '@/lib/types/ui/skeleton';

// ✅ REQUIRED: Profile Header Skeleton
export const ProfileHeaderSkeleton: React.FC<ProfileHeaderSkeletonProps> = ({
  showAvatar,
  showBadges,
  showStats,
  userType,
  variant = 'gamified',
  className = '',
}) => {
  const userTypeColors = {
    child: 'from-pink-200/50 to-purple-200/50',
    teen: 'from-blue-200/50 to-cyan-200/50',
    adult: 'from-gray-200/50 to-slate-200/50',
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-6">
          {/* Avatar section */}
          {showAvatar && (
            <div className="flex flex-col items-center space-y-3">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className={cn('h-24 w-24 rounded-full', `bg-gradient-to-r ${userTypeColors[userType]}`)}
                aria-label="Loading user avatar"
              >
                <div />
              </SkeletonWrapper>
              
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-20 rounded"
                aria-label="Loading change avatar button"
              >
                <div />
              </SkeletonWrapper>
            </div>
          )}
          
          {/* Profile info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-48"
                aria-label="Loading username"
              >
                <div />
              </SkeletonWrapper>
              
              <SkeletonWrapper
                isLoading={true}
                variant="default"
                className="h-5 w-32"
                aria-label="Loading user role"
              >
                <div />
              </SkeletonWrapper>
              
              <SkeletonWrapper
                isLoading={true}
                variant="default"
                className="h-4 w-64"
                aria-label="Loading user bio"
              >
                <div />
              </SkeletonWrapper>
            </div>
            
            {/* Achievement badges */}
            {showBadges && (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonWrapper
                    key={index}
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-16 rounded-full bg-gradient-to-r from-yellow-200/50 to-amber-200/50"
                    aria-label={`Loading achievement badge ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                ))}
              </div>
            )}
            
            {/* Stats for gamification */}
            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Points', 'Level', 'Streak', 'Tasks'].map((_, index) => (
                  <div key={index} className="text-center space-y-1">
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-6 w-12 mx-auto"
                      aria-label={`Loading stat value ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-3 w-16 mx-auto"
                      aria-label={`Loading stat label ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Profile Form Skeleton
export const ProfileFormSkeleton: React.FC<ProfileFormSkeletonProps> = ({
  fieldCount,
  showAvatarUpload,
  showSocialLinks,
  showBio,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-6 w-32"
          aria-label="Loading profile form title"
        >
          <div />
        </SkeletonWrapper>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar upload section */}
        {showAvatarUpload && (
          <div className="space-y-3">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-24"
              aria-label="Loading avatar upload label"
            >
              <div />
            </SkeletonWrapper>
            <div className="flex items-center space-x-4">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-16 w-16 rounded-full"
                aria-label="Loading current avatar preview"
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-10 w-32 rounded"
                aria-label="Loading upload button"
              >
                <div />
              </SkeletonWrapper>
            </div>
          </div>
        )}
        
        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: fieldCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-20"
                aria-label={`Loading field label ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-10 w-full rounded border"
                aria-label={`Loading form field ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
          ))}
        </div>
        
        {/* Bio section */}
        {showBio && (
          <div className="space-y-2">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-16"
              aria-label="Loading bio field label"
            >
              <div />
            </SkeletonWrapper>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-24 w-full rounded border"
              aria-label="Loading bio textarea"
            >
              <div />
            </SkeletonWrapper>
          </div>
        )}
        
        {/* Social links */}
        {showSocialLinks && (
          <div className="space-y-3">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-5 w-24"
              aria-label="Loading social links title"
            >
              <div />
            </SkeletonWrapper>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-5 w-5 rounded"
                    aria-label={`Loading social icon ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-10 flex-1 rounded border"
                    aria-label={`Loading social link ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Save button */}
        <div className="flex justify-end">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-10 w-24 rounded bg-gradient-to-r from-primary/20 to-secondary/20"
            aria-label="Loading save button"
          >
            <div />
          </SkeletonWrapper>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Settings Menu Skeleton
export const SettingsMenuSkeleton: React.FC<SettingsMenuSkeletonProps> = ({
  tabCount,
  showIcons,
  showNotificationBadges,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: tabCount }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            {showIcons && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-5 rounded"
                aria-label={`Loading menu icon ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            )}
            
            <div className="space-y-1">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-32"
                aria-label={`Loading menu title ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-3 w-48"
                aria-label={`Loading menu description ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showNotificationBadges && Math.random() > 0.7 && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-5 rounded-full bg-gradient-to-r from-red-200/50 to-pink-200/50"
                aria-label={`Loading notification badge ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            )}
            
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-4 rounded"
              aria-label={`Loading menu arrow ${index + 1}`}
            >
              <div />
            </SkeletonWrapper>
          </div>
        </div>
      ))}
    </div>
  );
};

// ✅ REQUIRED: Settings Section Skeleton
export const SettingsSectionSkeleton: React.FC<SettingsSectionSkeletonProps> = ({
  sectionTitle,
  itemCount,
  showToggles,
  showDropdowns,
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
          aria-label={`Loading section title: ${sectionTitle}`}
        >
          <div />
        </SkeletonWrapper>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="space-y-1">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-36"
                aria-label={`Loading setting title ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-3 w-48"
                aria-label={`Loading setting description ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
            
            <div>
              {showToggles && index % 2 === 0 ? (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-6 w-10 rounded-full"
                  aria-label={`Loading toggle ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              ) : showDropdowns && index % 2 === 1 ? (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-8 w-24 rounded border"
                  aria-label={`Loading dropdown ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              ) : (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-8 w-16 rounded"
                  aria-label={`Loading setting control ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Family Management Section Skeleton
export const FamilyManagementSkeleton: React.FC<FamilyManagementSkeletonProps> = ({
  memberCount,
  showRoleManagement,
  showInviteSection,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Family overview */}
      <Card>
        <CardHeader>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-6 w-32"
            aria-label="Loading family overview title"
          >
            <div />
          </SkeletonWrapper>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-16 w-16 rounded-full"
              aria-label="Loading family avatar"
            >
              <div />
            </SkeletonWrapper>
            <div className="space-y-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-32"
                aria-label="Loading family name"
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-24"
                aria-label="Loading member count"
              >
                <div />
              </SkeletonWrapper>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Family members */}
      <Card>
        <CardHeader>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-6 w-40"
            aria-label="Loading family members title"
          >
            <div />
          </SkeletonWrapper>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: memberCount }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-10 w-10 rounded-full"
                  aria-label={`Loading member avatar ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
                <div className="space-y-1">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-4 w-24"
                    aria-label={`Loading member name ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-16"
                    aria-label={`Loading member role ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              </div>
              
              {showRoleManagement && (
                <div className="flex space-x-2">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-20 rounded border"
                    aria-label={`Loading role selector ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-8 rounded"
                    aria-label={`Loading member actions ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Invite section */}
      {showInviteSection && (
        <Card>
          <CardHeader>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-6 w-32"
              aria-label="Loading invite section title"
            >
              <div />
            </SkeletonWrapper>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-10 flex-1 rounded border"
                aria-label="Loading email input"
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-10 w-24 rounded bg-gradient-to-r from-primary/20 to-secondary/20"
                aria-label="Loading invite button"
              >
                <div />
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
