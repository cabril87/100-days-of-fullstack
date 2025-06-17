import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage() {
  // Middleware handles auth redirect - no need for AuthPagePattern here
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <PasswordResetForm />
    </div>
  );
} 