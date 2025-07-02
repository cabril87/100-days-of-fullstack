/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import { Metadata } from 'next';
import FocusPageClient from '@/components/focus/FocusPageClient';

export const metadata: Metadata = {
  title: 'Focus Sessions | TaskTracker Enterprise',
  description: 'Enterprise-grade focus sessions with AI-powered task recommendations and real-time progress tracking',
  keywords: ['focus', 'productivity', 'pomodoro', 'task management', 'concentration'],
};

/**
 * Focus Sessions Page - Server Component
 * Enterprise focus management with session tracking and analytics
 * Follows Next.js App Router patterns with proper SSR optimization
 */
export default function FocusPage() {
  return <FocusPageClient />;
} 
