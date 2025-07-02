'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/helpers/utils/utils';
import { SkeletonWrapper } from './base-skeleton-wrapper';
import {
  DashboardCardSkeletonProps,
  DataTableSkeletonProps,
  FormSkeletonProps,
  NavigationSkeletonProps,
  SidebarSkeletonProps,
} from '@/lib/types/skeleton';

export const NavigationSkeleton: React.FC<NavigationSkeletonProps> = ({
  menuItemCount,
  showUserAvatar,
  hasNotificationBadge,
  showBreadcrumbs,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Main navigation bar */}
      <div className="flex items-center justify-between p-4 border-b">
        {/* Logo */}
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-8 w-32"
          aria-label="Loading app logo"
        >
          <div />
        </SkeletonWrapper>
        
        {/* Menu items */}
        <div className="flex items-center space-x-6">
          {Array.from({ length: menuItemCount }).map((_, index) => (
            <SkeletonWrapper
              key={index}
              isLoading={true}
              variant={variant}
              className="h-6 w-20"
              aria-label={`Loading menu item ${index + 1}`}
            >
              <div />
            </SkeletonWrapper>
          ))}
        </div>
        
        {/* User section */}
        <div className="flex items-center space-x-3">
          {hasNotificationBadge && (
            <div className="relative">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-8 rounded"
                aria-label="Loading notification button"
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-200/50 to-pink-200/50"
                aria-label="Loading notification badge"
              >
                <div />
              </SkeletonWrapper>
            </div>
          )}
          
          {showUserAvatar && (
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-8 w-8 rounded-full"
              aria-label="Loading user avatar"
            >
              <div />
            </SkeletonWrapper>
          )}
        </div>
      </div>
      
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="flex items-center space-x-2 px-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <React.Fragment key={index}>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-16"
                aria-label={`Loading breadcrumb ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              {index < 2 && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-3"
                  aria-label="Loading breadcrumb separator"
                >
                  <div />
                </SkeletonWrapper>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ REQUIRED: Sidebar Skeleton
export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  sectionCount,
  showSearch,
  showUserSection,
  isCollapsed,
  variant = 'gamified',
  className = '',
}) => {
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  
  return (
    <div className={cn('h-full border-r bg-background', sidebarWidth, className)}>
      <div className="p-4 space-y-4">
        {/* Search */}
        {showSearch && !isCollapsed && (
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-10 w-full rounded border"
            aria-label="Loading search input"
          >
            <div />
          </SkeletonWrapper>
        )}
        
        {/* Navigation sections */}
        <div className="space-y-6">
          {Array.from({ length: sectionCount }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-2">
              {!isCollapsed && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-4 w-24"
                  aria-label={`Loading section title ${sectionIndex + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
              
              {/* Menu items */}
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-3 p-2">
                    <SkeletonWrapper
                      isLoading={true}
                      variant={variant}
                      className="h-5 w-5 rounded"
                      aria-label={`Loading menu icon ${sectionIndex + 1}-${itemIndex + 1}`}
                    >
                      <div />
                    </SkeletonWrapper>
                    
                    {!isCollapsed && (
                      <SkeletonWrapper
                        isLoading={true}
                        variant={variant}
                        className="h-4 w-20"
                        aria-label={`Loading menu text ${sectionIndex + 1}-${itemIndex + 1}`}
                      >
                        <div />
                      </SkeletonWrapper>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* User section */}
        {showUserSection && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-3 p-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-8 rounded-full"
                aria-label="Loading user avatar"
              >
                <div />
              </SkeletonWrapper>
              
              {!isCollapsed && (
                <div className="space-y-1">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-4 w-20"
                    aria-label="Loading username"
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-3 w-16"
                    aria-label="Loading user role"
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ REQUIRED: Dashboard Cards Skeleton
export const DashboardCardSkeleton: React.FC<DashboardCardSkeletonProps> = ({
  cardCount,
  showStats,
  hasProgressBars,
  showCharts,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-32"
                aria-label={`Loading card title ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-5 w-5 rounded"
                aria-label={`Loading card icon ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {showStats && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-8 w-20"
                aria-label={`Loading stat value ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            )}
            
            {hasProgressBars && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-2 w-full rounded-full"
                aria-label={`Loading progress bar ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            )}
            
            {showCharts && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-24 w-full rounded"
                aria-label={`Loading chart ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            )}
            
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-4 w-3/4"
              aria-label={`Loading card description ${index + 1}`}
            >
              <div />
            </SkeletonWrapper>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ✅ REQUIRED: Data Table Skeleton
export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({
  rowCount,
  columnCount,
  hasActions,
  showPagination,
  showFilters,
  variant = 'gamified',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center space-x-4">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-10 w-64 rounded border"
            aria-label="Loading search filter"
          >
            <div />
          </SkeletonWrapper>
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-10 w-32 rounded border"
            aria-label="Loading dropdown filter"
          >
            <div />
          </SkeletonWrapper>
        </div>
      )}
      
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center p-4 border-b">
            {Array.from({ length: columnCount }).map((_, index) => (
              <SkeletonWrapper
                key={index}
                isLoading={true}
                variant={variant}
                className="h-4 w-24 flex-1 mr-4"
                aria-label={`Loading column header ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            ))}
            {hasActions && (
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-16"
                aria-label="Loading actions column header"
              >
                <div />
              </SkeletonWrapper>
            )}
          </div>
          
          {/* Rows */}
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center p-4 border-b last:border-b-0">
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <SkeletonWrapper
                  key={colIndex}
                  isLoading={true}
                  variant={variant}
                  className="h-4 w-20 flex-1 mr-4"
                  aria-label={`Loading cell ${rowIndex + 1}-${colIndex + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              ))}
              
              {hasActions && (
                <div className="flex space-x-2">
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-8 rounded"
                    aria-label={`Loading action button 1 for row ${rowIndex + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                  <SkeletonWrapper
                    isLoading={true}
                    variant={variant}
                    className="h-8 w-8 rounded"
                    aria-label={`Loading action button 2 for row ${rowIndex + 1}`}
                  >
                    <div />
                  </SkeletonWrapper>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <SkeletonWrapper
            isLoading={true}
            variant={variant}
            className="h-4 w-32"
            aria-label="Loading pagination info"
          >
            <div />
          </SkeletonWrapper>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonWrapper
                key={index}
                isLoading={true}
                variant={variant}
                className="h-8 w-8 rounded"
                aria-label={`Loading pagination button ${index + 1}`}
              >
                <div />
              </SkeletonWrapper>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ REQUIRED: Generic Form Skeleton
export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fieldCount,
  hasSubmitButton,
  showValidation,
  formLayout,
  variant = 'gamified',
  className = '',
}) => {
  const layoutClasses = {
    'single-column': 'grid-cols-1',
    'two-column': 'grid-cols-1 md:grid-cols-2',
    'grid': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <SkeletonWrapper
          isLoading={true}
          variant={variant}
          className="h-6 w-40"
          aria-label="Loading form title"
        >
          <div />
        </SkeletonWrapper>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className={cn('grid gap-4', layoutClasses[formLayout])}>
          {Array.from({ length: fieldCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonWrapper
                isLoading={true}
                variant={variant}
                className="h-4 w-24"
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
              
              {showValidation && Math.random() > 0.7 && (
                <SkeletonWrapper
                  isLoading={true}
                  variant={variant}
                  className="h-3 w-32"
                  aria-label={`Loading validation message ${index + 1}`}
                >
                  <div />
                </SkeletonWrapper>
              )}
            </div>
          ))}
        </div>
        
        {hasSubmitButton && (
          <div className="flex justify-end space-x-2">
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-10 w-20 rounded"
              aria-label="Loading cancel button"
            >
              <div />
            </SkeletonWrapper>
            <SkeletonWrapper
              isLoading={true}
              variant={variant}
              className="h-10 w-24 rounded bg-gradient-to-r from-primary/20 to-secondary/20"
              aria-label="Loading submit button"
            >
              <div />
            </SkeletonWrapper>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
