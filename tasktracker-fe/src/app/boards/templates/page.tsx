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
import { TemplatesPage } from '@/components/boards/TemplatesPage';

export const metadata: Metadata = {
  title: 'Board Templates | TaskTracker',
  description: 'Choose from our collection of gamified board templates to jumpstart your productivity',
};

export default function BoardTemplatesPage() {
  return <TemplatesPage />;
} 