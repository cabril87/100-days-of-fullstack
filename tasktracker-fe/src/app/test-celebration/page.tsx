/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Celebration Test Page Route
 * Provides access to comprehensive celebration system testing
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import CelebrationTestPage from '@/components/gamification/CelebrationTestPage';

export default function TestCelebrationPage() {
  return <CelebrationTestPage />;
}

export const metadata = {
  title: 'Celebration System Test Lab | TaskTracker Enterprise',
  description: 'Comprehensive testing environment for mobile-first responsive celebrations',
}; 