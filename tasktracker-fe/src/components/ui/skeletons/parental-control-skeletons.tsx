'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  ChildAccountCardSkeletonProps,
  ScreenTimeChartSkeletonProps,
  PermissionRequestListSkeletonProps,
  ActivityPanelSkeletonProps,
  ActivityTimelineSkeletonProps,
} from '@/lib/types/skeleton';

// ✅ REQUIRED: Child Account Card Skeleton
export const ChildAccountCardSkeleton: React.FC<ChildAccountCardSkeletonProps> = ({
  showAvatar,
  showBadges,
  showStatus,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          {showAvatar && (
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-12 w-12 rounded-full"
              aria-label="Loading child avatar"
            >
              <div />
            </SkeletonWrapper>
          )}
          <div className="space-y-2 flex-1">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-24"
              aria-label="Loading child name"
            >
              <div />
            </SkeletonWrapper>
            {showStatus && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-3 w-16"
                aria-label="Loading child status"
              >
                <div />
              </SkeletonWrapper>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showBadges && (
          <div className="flex space-x-2 mb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonWrapper
                key={index}
                isLoading={true}
                variant={variant}
                className="h-6 w-16 rounded-full"
                aria-label={`Loading achievement badge ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            ))}
          </div>
        )}
        <div className="space-y-3">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-8 w-full rounded"
            aria-label="Loading account controls"
          >
            <div />
          </SkeletonWrapper>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-6 w-3/4"
            aria-label="Loading account info"
          >
            <div />
          </SkeletonWrapper>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Screen Time Chart Skeleton
export const ScreenTimeChartSkeleton: React.FC<ScreenTimeChartSkeletonProps> = ({
  chartType,
  showAxes,
  dataPointCount,
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
          aria-label="Loading chart title"
        >
          <div />
        </SkeletonWrapper>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          {/* Chart area */}
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-full w-full rounded"
            aria-label={`Loading ${chartType} chart with ${dataPointCount} data points`}
          >
            <div />
          </SkeletonWrapper>
          
          {showAxes && (
            <>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonWrapper
                    key={index}
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-8"
                    aria-label={`Loading Y-axis label ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                ))}
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-12 right-0 flex justify-between px-4">
                {Array.from({ length: dataPointCount }).map((_, index) => (
                  <SkeletonWrapper
                    key={index}
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-8"
                    aria-label={`Loading X-axis label ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex space-x-4 mt-4">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-20"
            aria-label="Loading chart legend"
          >
            <div />
          </SkeletonWrapper>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-24"
            aria-label="Loading chart legend item"
          >
            <div />
          </SkeletonWrapper>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ REQUIRED: Permission Request List Skeleton
export const PermissionRequestListSkeleton: React.FC<PermissionRequestListSkeletonProps> = ({
  itemCount,
  showActions,
  showTimestamps,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* User avatar */}
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-10 w-10 rounded-full"
                  aria-label={`Loading user avatar for request ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
                
                <div className="space-y-2 flex-1">
                  {/* Request title */}
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-4 w-48"
                    aria-label={`Loading request title ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  
                  {/* Request description */}
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-64"
                    aria-label={`Loading request description ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  
                  {showTimestamps && (
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-3 w-20"
                      aria-label={`Loading timestamp for request ${index + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                  )}
                </div>
              </div>
              
              {showActions && (
                <div className="flex space-x-2">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-16 rounded"
                    aria-label={`Loading approve button for request ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-16 rounded"
                    aria-label={`Loading deny button for request ${index + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ✅ REQUIRED: Activity Panel Skeleton
export const ActivityPanelSkeleton: React.FC<ActivityPanelSkeletonProps> = ({
  panelCount,
  showIcons,
  showTimestamps,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: panelCount }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              {showIcons && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-6 w-6 rounded"
                  aria-label={`Loading activity icon ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-24"
                aria-label={`Loading activity title ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-full"
                aria-label={`Loading activity metric ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-3/4"
                aria-label={`Loading activity description ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              {showTimestamps && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-20"
                  aria-label={`Loading activity timestamp ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ✅ REQUIRED: Activity Timeline Skeleton
export const ActivityTimelineSkeleton: React.FC<ActivityTimelineSkeletonProps> = ({
  eventCount,
  showMarkers,
  showDescriptions,
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
            {showMarkers && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-3 w-3 rounded-full relative z-10"
                aria-label={`Loading timeline marker ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            )}
            
            <div className="flex-1 space-y-2">
              {/* Event title */}
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-32"
                aria-label={`Loading event title ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              
              {showDescriptions && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-48"
                  aria-label={`Loading event description ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
              
              {/* Timestamp */}
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-3 w-16"
                aria-label={`Loading event timestamp ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 