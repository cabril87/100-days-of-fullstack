'use client';

import React from 'react';
import FamilySeedingPanel from '@/components/admin/FamilySeedingPanel';
import { FamilySeedingPageContentProps } from '@/lib/types/component-props';

export default function FamilySeedingPageContent({}: FamilySeedingPageContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Family Seeding</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Global admin tools for creating test families with realistic data. Use this for development and testing purposes.
        </p>
      </div>

      <FamilySeedingPanel />
    </div>
  );
} 