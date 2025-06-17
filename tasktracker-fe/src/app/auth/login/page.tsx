import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage() {
  // Middleware handles auth redirect - no need for AuthPagePattern here
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoginForm />
    </div>
  );
} 