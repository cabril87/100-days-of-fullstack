'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthProvider';

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

const fetchCsrfToken = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/v1/auth/csrf`, {
      method: 'GET',
      credentials: 'include', 
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Cookies after CSRF fetch:', document.cookie);
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('XSRF-TOKEN=')) {
        const token = trimmed.substring('XSRF-TOKEN='.length);
        console.log('CSRF token extracted:', token);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, user, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

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

  useEffect(() => {
    fetchCsrfToken();
    
    if (user) {
      router.push(redirect);
    }
  }, [user, router, redirect]);

  useEffect(() => {
    if (loginSuccess) {
      router.push(redirect);
    }
  }, [loginSuccess, router, redirect]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      
      await fetchCsrfToken();
      
      const csrfToken = getCsrfTokenFromCookies();
      console.log('Using CSRF token for login:', csrfToken);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const requestData = {
        emailOrUsername: data.email,
        password: data.password,
        csrfToken: csrfToken 
      };
      
      console.log('Sending login request with token in body and X-CSRF-TOKEN header');
        
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '' 
      };
      
      try {
        const response = await fetch(`${apiUrl}/v1/auth/login`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
          credentials: 'include'
        });
        
        const result = await response.json();
        console.log('Login result:', { status: response.status, data: result });
        
        if (response.ok) {
          if (result.accessToken) {
            localStorage.setItem('token', result.accessToken);
          }
          
          if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          
          setLoginSuccess(true);
          return;
        } else {
          setAuthError(result.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Error with login attempt:', error);
        setAuthError('Login failed. Please try again.');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('CSRF')) {
          setAuthError('Security token is missing or invalid. Please refresh the page and try again.');
        } else {
          setAuthError('Invalid email or password. Please try again.');
        }
      } else {
        setAuthError('Invalid email or password. Please try again.');
      }
      console.error('Login error:', error);
    }
  };
  
  const getCsrfTokenFromCookies = (): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('XSRF-TOKEN=')) {
        const encodedToken = trimmed.substring('XSRF-TOKEN='.length);
        try {
          return decodeURIComponent(encodedToken);
        } catch (e) {
          console.error('Error decoding CSRF token:', e);
          return encodedToken;
        }
      }
    }
    return null;
  };

  if (isLoading) {
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
      </div>
    </div>
  );
} 