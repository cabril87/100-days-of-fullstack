'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthContext';
import { Spinner } from '@/components/ui/spinner';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/dashboard';
  const expired = searchParams?.get('expired') === 'true';
  const { login, user, isLoading, clearAllStorage } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleClearStorage = () => {
    clearAllStorage();
    setAuthError(null);
    window.location.reload();
  };

  useEffect(() => {
    if (expired) {
      setAuthError('Your session has expired. Please log in again.');
    }
  }, [expired]);

  useEffect(() => {
    if (user && !isLoading && !isRedirecting) {
      console.log('User already logged in, redirecting to:', redirect);
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(redirect);
      }, 100);
    }
  }, [user, isLoading, router, redirect, isRedirecting]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      console.log('Attempting login with redirect to:', redirect);
      
      const success = await login(data.email, data.password);
      
      if (success) {
        console.log('Login successful, redirecting to:', redirect);
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(redirect);
        }, 100);
      } else {
        setAuthError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('An error occurred during login. Please try again.');
    }
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          Sign in to your account
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6">
                Password
              </label>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link href="/auth/register" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Create an account
          </Link>
        </p>

        {/* Temporary button to clear storage */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleClearStorage}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear Browser Storage (if seeing old data)
          </button>
        </div>
      </div>
    </div>
  );
} 