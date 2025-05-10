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
    <div className="flex items-center mt-2 space-x-1 text-sm">
      <span className="text-gray-500">Sort by:</span>
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
          className={`px-2 py-1 rounded hover:bg-gray-100 ${
            sortField === option.id ? 'font-semibold bg-gray-100' : ''
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