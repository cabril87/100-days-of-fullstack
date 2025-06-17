import { RegisterForm } from '@/components/auth/RegisterForm';

export default async function RegisterPage() {
  // Middleware handles auth redirect - no need for AuthPagePattern here
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <RegisterForm />
    </div>
  );
} 