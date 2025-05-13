'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
} 