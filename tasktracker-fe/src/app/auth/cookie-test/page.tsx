import { AuthPagePattern } from '@/lib/auth/auth-config';
import CookieTestClient from '@/components/auth/CookieTestClient';

export default async function CookieTestPage() {
  // Redirect to dashboard if already authenticated
  await AuthPagePattern();

  return <CookieTestClient />;
} 