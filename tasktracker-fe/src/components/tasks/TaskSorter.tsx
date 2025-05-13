'use client';

import { useState } from 'react';

export type SortOption = 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

interface TaskSorterProps {
  onSort: (field: SortOption, direction: SortDirection) => void;
}

export function TaskSorter({ onSort }: TaskSorterProps) {
  const [sortField, setSortField] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSortChange = (field: SortOption) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onSort(field, newDirection);
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
      onSort(field, 'desc');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-200">
      <span className="text-gray-600 font-medium">Sort by:</span>
      {[
        { id: 'title', label: 'Title' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'priority', label: 'Priority' },
        { id: 'status', label: 'Status' },
        { id: 'createdAt', label: 'Created' },
      ].map((option) => (
        <button
          key={option.id}
          onClick={() => handleSortChange(option.id as SortOption)}
          className={`px-3 py-1.5 rounded-full transition-all ${
            sortField === option.id 
              ? 'font-medium bg-brand-navy/10 text-brand-navy-dark border border-brand-navy/20' 
              : 'hover:bg-gray-100 border border-transparent'
          }`}
        >
          {option.label}
          {sortField === option.id && (
            <span className="ml-1">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </button>
      ))}
    </div>
  );
} 