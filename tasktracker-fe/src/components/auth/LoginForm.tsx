'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, LogIn, Star } from 'lucide-react';
import { LoginFormData } from '../../lib/types/auth';
import { loginSchema } from '../../lib/schemas';
import { useState } from 'react';
import { DecorativeLines } from '../ui/DecorativeLines';

export const LoginForm: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setErrorMessage('');
    
    try {
      await login(data);
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center   p-4 relative overflow-hidden">

      <Card className="w-full max-w-md  bg-gray-900 dark:bg-white   relative overflow-hidden">
        {/* Card decorative top line */}
      <DecorativeLines />
        {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div> */}
        
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-white dark:text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <LogIn className="h-5 w-5 text-white" />
            </div>
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400 dark:text-gray-600">
            Sign in to continue your productivity journey
          </CardDescription>
          
          {/* Gamification welcome badge */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/20 to-purple-900/20 dark:from-blue-50/50 dark:to-purple-50/50 border border-blue-700/30 dark:border-blue-200/30 rounded-xl px-4 py-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-300 dark:text-gray-700">Ready to level up?</span>
            </div>
          </div>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Email or Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email or username"
                        className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-blue-400 dark:focus:border-blue-500 transition-colors text-white dark:text-gray-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-blue-400 dark:focus:border-blue-500 transition-colors pr-10 text-white dark:text-gray-900"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-2">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-400 dark:text-blue-600 hover:text-blue-300 dark:hover:text-blue-500 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/auth/register" 
                    className="font-medium text-blue-400 dark:text-blue-600 hover:text-blue-300 dark:hover:text-blue-500 hover:underline transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Form>
        
        {/* Card decorative bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>
      </Card>
    </div>
  );
}; 