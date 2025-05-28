'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      
      // Call the password reset API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
      setIsSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred while sending the reset email. Please check your connection and try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Check your email
            </h1>
            <p className="mt-4 text-sm text-gray-600">
              If an account with the email <strong>{getValues('email')}</strong> exists, 
              we've sent you a password reset link.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              Try different email
            </Button>
            
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to login
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 