'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/providers/AuthProvider';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, ArrowLeft, Key, CheckCircle2 } from 'lucide-react';
import { passwordResetSchema } from '../../lib/schemas';
import { PasswordResetFormData } from '../../lib/types/forms';

// PasswordResetFormData is imported from lib/types/forms

export const PasswordResetForm: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: PasswordResetFormData): Promise<void> => {
    setErrorMessage('');
    
    try {
      await requestPasswordReset(data.email);
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      setErrorMessage(message);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4 relative overflow-hidden">
        {/* Animated decorative lines - top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-pulse"></div>
        <div className="absolute top-2 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 opacity-50"></div>
        
        {/* Animated decorative lines - bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 animate-pulse"></div>
        <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-50"></div>

        <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-900 border-2 border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
          {/* Card decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-pulse"></div>
          
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              Email Sent!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Check your email for password reset instructions
            </CardDescription>
            
            {/* Success badge */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/30 dark:border-green-700/30 rounded-xl px-4 py-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reset link sent!</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
              <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                If an account with that email exists, we&apos;ve sent you a password reset link. Please check your inbox and spam folder.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="pt-6">
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
          
          {/* Card decorative bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 opacity-50"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4 relative overflow-hidden">
      {/* Animated decorative lines - top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 animate-pulse"></div>
      <div className="absolute top-2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 opacity-50"></div>
      
      {/* Animated decorative lines - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 animate-pulse"></div>
      <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 opacity-50"></div>

      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-900 border-2 border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
        {/* Card decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 animate-pulse"></div>
        
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-gray-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
          
          {/* Help badge */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl px-4 py-2">
              <Mail className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">We&apos;ll help you get back in</span>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Reset Link
                  </div>
                )}
              </Button>

              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Form>
        
        {/* Card decorative bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 opacity-50"></div>
      </Card>
    </div>
  );
}; 