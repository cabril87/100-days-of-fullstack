'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  DeviceListSkeletonProps,
  SessionTimelineSkeletonProps,
  SecurityDashboardSkeletonProps,
} from '@/lib/types/skeleton';

// ✅ REQUIRED: Device List Skeleton
export const DeviceListSkeleton: React.FC<DeviceListSkeletonProps> = ({
  deviceCount,
  showSecurityBadges,
  showTrustIndicators,
  showActions,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: deviceCount }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Device icon */}
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-200/50 to-cyan-200/50"
                  aria-label={`Loading device icon ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
                
                <div className="space-y-2 flex-1">
                  {/* Device name */}
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-5 w-40"
                    aria-label={`Loading device name ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  
                  {/* Device details */}
                  <div className="flex items-center space-x-2">
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-4 w-24"
                      aria-label={`Loading device platform ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-4 w-20"
                      aria-label={`Loading device location ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                  </div>
                  
                  {/* Last active */}
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-32"
                    aria-label={`Loading last active time ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {showTrustIndicators && (
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-6 w-16 rounded-full bg-gradient-to-r from-green-200/50 to-emerald-200/50"
                    aria-label={`Loading trust indicator ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                )}
                
                {showSecurityBadges && (
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-200/50 to-orange-200/50"
                    aria-label={`Loading security badge ${index + 1}`}
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
                      aria-label={`Loading device action 1 ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-8 w-8 rounded"
                      aria-label={`Loading device action 2 ${index + 1}`}
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

// ✅ REQUIRED: Session Timeline Skeleton
export const SessionTimelineSkeleton: React.FC<SessionTimelineSkeletonProps> = ({
  eventCount,
  showTimestamps,
  showActivityIcons,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
      
      <div className="space-y-6">
        {Array.from({ length: eventCount }).map((_, index) => (
          <div key={index} className="relative flex items-start space-x-4">
            {/* Timeline marker */}
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-3 w-3 rounded-full relative z-10 bg-gradient-to-r from-primary/20 to-secondary/20"
              aria-label={`Loading timeline marker ${index + 1}`}
            >
              <div />
            </SkeletonWrapper>
            
            <div className="flex-1 space-y-2">
              {/* Event header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {showActivityIcons && (
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-5 w-5 rounded"
                      aria-label={`Loading activity icon ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                  )}
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-4 w-32"
                    aria-label={`Loading event title ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
                
                {showTimestamps && (
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-16"
                    aria-label={`Loading timestamp ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                )}
              </div>
              
              {/* Event description */}
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-3 w-48"
                aria-label={`Loading event description ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              
              {/* Event details */}
              <div className="flex items-center space-x-4 text-sm">
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-20"
                  aria-label={`Loading event detail 1 ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-16"
                  aria-label={`Loading event detail 2 ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ REQUIRED: Security Dashboard Skeleton
export const SecurityDashboardSkeleton: React.FC<SecurityDashboardSkeletonProps> = ({
  showScoreCard,
  showRecommendations,
  showActivityFeed,
  cardCount,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Security score card */}
      {showScoreCard && (
        <Card>
          <CardHeader>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-6 w-32"
              aria-label="Loading security score title"
            >
              <div />
            </SkeletonWrapper>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-green-200/50 to-emerald-200/50"
                aria-label="Loading security score circle"
              >
                <div />
              </SkeletonWrapper>
              <div className="space-y-2 flex-1">
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-8 w-24"
                  aria-label="Loading security score value"
                >
                  <div />
                </SkeletonWrapper>
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-4 w-40"
                  aria-label="Loading security score description"
                >
                  <div />
                </SkeletonWrapper>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Security metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-6 w-6 rounded bg-gradient-to-r from-primary/20 to-secondary/20"
                  aria-label={`Loading metric icon ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-4 w-16"
                  aria-label={`Loading metric title ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              </div>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-20 mt-2"
                aria-label={`Loading metric value ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Security recommendations */}
      {showRecommendations && (
        <Card>
          <CardHeader>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-6 w-40"
              aria-label="Loading recommendations title"
            >
              <div />
            </SkeletonWrapper>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-6 w-6 rounded bg-gradient-to-r from-yellow-200/50 to-orange-200/50"
                    aria-label={`Loading recommendation icon ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <div className="space-y-2 flex-1">
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-4 w-48"
                      aria-label={`Loading recommendation ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-3 w-32"
                      aria-label={`Loading recommendation description ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Activity feed */}
      {showActivityFeed && (
        <Card>
          <CardHeader>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-6 w-32"
              aria-label="Loading activity feed title"
            >
              <div />
            </SkeletonWrapper>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-2 w-2 rounded-full"
                    aria-label={`Loading activity marker ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-4 flex-1"
                    aria-label={`Loading activity ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-12"
                    aria-label={`Loading activity time ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 