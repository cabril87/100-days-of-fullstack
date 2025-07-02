import { AuthPagePattern } from '@/lib/auth/auth-config';
import ResetPassword from '@/components/auth/ResetPassword';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  // Redirect to dashboard if already authenticated
  await AuthPagePattern();

  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  // Server-side token validation
  let isValidToken = false;
  let validationMessage = '';

  if (!token) {
    validationMessage = 'Invalid or missing reset token.';
        } else {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        isValidToken = data.valid;
      }
      
      if (!isValidToken) {
        validationMessage = 'Invalid or expired reset token. Please request a new password reset.';
      }
    } catch (error) {
      console.error('Error validating token:', error);
      validationMessage = 'Error validating reset token. Please try again.';
    }
  }

  // Pass server-validated data to client component
  return (
    <ResetPassword 
      token={token || null}
      isValidToken={isValidToken}
      validationMessage={validationMessage}
    />
  );
} 
