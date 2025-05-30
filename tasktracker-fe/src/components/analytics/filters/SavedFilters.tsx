'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { savedFiltersService } from '@/lib/services/analytics';
import type { SavedFilter, FilterCriteria } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  FilterIcon, 
  SearchIcon, 
  PlayIcon, 
  TrashIcon, 
  ShareIcon,
  LockIcon,
  UnlockIcon,
  CalendarIcon,
  RefreshCwIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface SavedFiltersProps {
  className?: string;
  onFilterApply?: (criteria: FilterCriteria) => void;
}

export const SavedFilters: React.FC<SavedFiltersProps> = ({
  className = '',
  onFilterApply
}) => {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharing, setSharing] = useState<number | null>(null);

  // Fetch saved filters
  const fetchFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userFilters = await savedFiltersService.getUserFilters();
      setFilters(userFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved filters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  // Apply filter
  const handleApplyFilter = async (filter: SavedFilter) => {
    try {
      const criteria = await savedFiltersService.applyFilter(filter.id);
      
      if (onFilterApply) {
        onFilterApply(criteria);
      }
    } catch (err) {
      console.error('Failed to apply filter:', err);
      alert('Failed to apply filter');
    }
  };

  // Delete filter
  const handleDeleteFilter = async (filterId: number) => {
    try {
      await savedFiltersService.deleteFilter(filterId);
      
      // Remove from local state
      setFilters(filters.filter(f => f.id !== filterId));
    } catch (err) {
      console.error('Failed to delete filter:', err);
      alert('Failed to delete filter');
    }
  };

  // Share filter
  const handleShareFilter = async (filterId: number) => {
    try {
      setSharing(filterId);
      
      // This would typically open a sharing dialog
      // For now, we'll just simulate sharing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Filter shared successfully!');
    } catch (err) {
      console.error('Failed to share filter:', err);
      alert('Failed to share filter');
    } finally {
      setSharing(null);
    }
  };

  // Filter search
  const filteredFilters = filters.filter(filter =>
    filter.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get filter summary
  const getFilterSummary = (criteria: FilterCriteria): string => {
    const parts = [];
    
    if (criteria.dateRange) {
      parts.push('Date range');
    }
    if (criteria.status && criteria.status.length > 0) {
      parts.push(`Status: ${criteria.status.join(', ')}`);
    }
    if (criteria.categories && criteria.categories.length > 0) {
      parts.push(`Categories: ${criteria.categories.join(', ')}`);
    }
    if (criteria.priority && criteria.priority.length > 0) {
      parts.push(`Priority: ${criteria.priority.join(', ')}`);
    }
    if (criteria.tags && criteria.tags.length > 0) {
      parts.push(`Tags: ${criteria.tags.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Saved Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Saved Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading saved filters: {error}</p>
            <Button onClick={fetchFilters} variant="outline" className="mt-4">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Saved Filters
          </CardTitle>
          
          <Button onClick={fetchFilters} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved filters..."
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredFilters.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <FilterIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {filters.length === 0 ? 'No saved filters yet' : 'No filters match your search'}
            </h3>
            <p className="text-sm">
              {filters.length === 0 
                ? 'Create your first filter using the Advanced Filter Builder.'
                : 'Try adjusting your search terms.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filters.length}
                </div>
                <div className="text-sm text-gray-500">Total Filters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filters.filter(f => f.isPublic).length}
                </div>
                <div className="text-sm text-gray-500">Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filters.filter(f => !f.isPublic).length}
                </div>
                <div className="text-sm text-gray-500">Private</div>
              </div>
            </div>

            {/* Filters table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filter Name</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFilters.map((filter) => (
                    <TableRow key={filter.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FilterIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{filter.name}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs">
                          <span className="text-sm text-gray-600 line-clamp-2">
                            {getFilterSummary(filter.filterCriteria)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={filter.isPublic ? 'default' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {filter.isPublic ? (
                            <>
                              <UnlockIcon className="h-3 w-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <LockIcon className="h-3 w-3" />
                              Private
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(filter.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Apply filter button */}
                          <Button
                            onClick={() => handleApplyFilter(filter)}
                            variant="ghost"
                            size="sm"
                            title="Apply filter"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                          
                          {/* Share filter button */}
                          <Button
                            onClick={() => handleShareFilter(filter.id)}
                            disabled={sharing === filter.id}
                            variant="ghost"
                            size="sm"
                            title="Share filter"
                          >
                            {sharing === filter.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <ShareIcon className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Delete filter button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                title="Delete filter"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Filter</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the filter "{filter.name}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteFilter(filter.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedFilters; 