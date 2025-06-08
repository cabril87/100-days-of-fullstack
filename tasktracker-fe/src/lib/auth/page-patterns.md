# Page Authentication Patterns

This document shows how to implement different types of pages using our centralized authentication system.

## 1. Protected Pages (Dashboard, Tasks, Settings)

```typescript
// app/dashboard/page.tsx
import { ProtectedPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';
import { DashboardStats } from '@/lib/types';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/dashboard', async () => {
    // Fetch dashboard data only if authenticated
    return await fetchAuthenticatedData<DashboardStats>(
      '/api/v1/dashboard/stats',
      {
        tasksCompleted: 0,
        activeGoals: 0,
        focusTime: 0,
        totalPoints: 0,
        familyMembers: 0,
        familyTasks: 0,
        familyPoints: 0,
        streakDays: 0,
        totalFamilies: 0
      }
    );
  });

  return <DashboardClient session={session} initialData={data} />;
}
```

## 2. Authentication Pages (Login, Register)

```typescript
// app/auth/login/page.tsx
import { AuthPagePattern } from '@/lib/auth/auth-config';
import LoginClient from '@/components/auth/LoginClient';

export default async function LoginPage() {
  // Redirect to dashboard if already authenticated
  await AuthPagePattern();

  return <LoginClient />;
}
```

## 3. Public Pages (Landing, Pricing)

```typescript
// app/page.tsx
import { PublicPagePattern } from '@/lib/auth/auth-config';
import LandingClient from '@/components/landing/LandingClient';

export default async function HomePage() {
  // Allow access regardless of auth state
  const { session } = await PublicPagePattern();

  return <LandingClient session={session} />;
}
```

## 4. Hybrid Pages (Help, Support)

```typescript
// app/help/page.tsx
import { PublicPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';
import HelpClient from '@/components/help/HelpClient';

export default async function HelpPage() {
  // Get session without redirecting
  const { session } = await PublicPagePattern(async () => {
    // Fetch user-specific help data if authenticated
    if (session) {
      return await fetchAuthenticatedData('/api/v1/help/personalized', {});
    }
    return {};
  });

  return <HelpClient session={session} initialData={data} />;
}
```

## 5. Role-Based Protected Pages (Admin)

```typescript
// app/admin/page.tsx
import { ProtectedPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';
import { redirect } from 'next/navigation';
import AdminClient from '@/components/admin/AdminClient';

export default async function AdminPage() {
  const { session } = await ProtectedPagePattern('/admin');

  // Additional role check
  if (session.role !== 'Admin' && session.role !== 'GlobalAdmin') {
    redirect('/403'); // Forbidden page
  }

  const data = await fetchAuthenticatedData('/api/v1/admin/stats', {});

  return <AdminClient session={session} initialData={data} />;
}
```

## 6. Client Component Patterns

```typescript
// components/dashboard/DashboardClient.tsx
'use client';

import { useAuth } from '@/lib/providers/AuthProvider';
import { User } from '@/lib/types';

interface DashboardClientProps {
  session: User | null; // From server
  initialData: any;
}

export default function DashboardClient({ session, initialData }: DashboardClientProps) {
  // Get real-time auth state from client
  const { user, isLoading } = useAuth();
  
  // Use server session for initial render, client state for updates
  const currentUser = user || session;

  if (isLoading && !session) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    // This shouldn't happen for protected pages, but handle gracefully
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.firstName}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

## 7. Middleware Configuration

```typescript
// middleware.ts
import { createAuthMiddleware, middlewareConfig } from '@/lib/auth/middleware-config';

export const middleware = createAuthMiddleware();
export const config = middlewareConfig;
```

## Key Benefits

1. **Separation of Concerns**: Middleware handles routing, server components handle data, client components handle UI
2. **Performance**: Server-side data fetching with proper caching
3. **SEO-Friendly**: Server-side rendering with authentication
4. **Type Safety**: Consistent type definitions across all patterns
5. **Reusability**: Common patterns can be reused across pages
6. **Maintainability**: Centralized auth logic reduces duplication

## Migration Strategy

1. Start with middleware - update routing logic
2. Update server components to use new patterns
3. Update client components to handle server/client state
4. Remove old authentication logic
5. Test each page type thoroughly 