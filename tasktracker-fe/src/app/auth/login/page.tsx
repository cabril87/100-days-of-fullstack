'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoginForm 
        onLoginSuccess={() => {
          // Redirect to dashboard after successful login
          router.push('/dashboard');
        }}
        onMfaRequired={(mfaToken) => {
          // Redirect to MFA page with token
          router.push(`/auth/mfa?token=${mfaToken}`);
        }}
        onAccountLocked={(unlockTime) => {
          // Handle account locked state - could show a modal or redirect
          console.warn('Account locked until:', unlockTime);
          // Could redirect to account locked page
          router.push('/auth/account-locked');
        }}
        showDeviceRecognition={true}
        rememberDevice={true}
      />
    </div>
  );
} 
