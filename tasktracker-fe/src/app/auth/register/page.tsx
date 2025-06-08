import { RegisterForm } from '@/components/auth/RegisterForm';

export default async function RegisterPage() {
  // Middleware handles auth redirect - no need for AuthPagePattern here
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <RegisterForm />
    </div>
  );
} 