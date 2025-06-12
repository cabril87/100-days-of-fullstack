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
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Left Side - Decorative Abstract */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
                  {/* Abstract shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-600"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl animate-bounce delay-200"></div>
        </div>
        
        {/* Neon gradient decorative lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-80 animate-pulse delay-900"></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-70 animate-pulse delay-1300"></div>
          
          {/* Vertical neon lines */}
          <div className="absolute left-1/3 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-emerald-300 to-transparent opacity-50 animate-pulse delay-1100"></div>
          <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-60 animate-pulse delay-600"></div>
        </div>
          
          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
              Email <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">
                Sent!
              </span>
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Check your inbox! We&apos;ve sent you a secure password reset link to get you back into your adventure.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                <span className="text-green-100">Reset link delivered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse delay-300"></div>
                <span className="text-green-100">Check your inbox & spam</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse delay-600"></div>
                <span className="text-green-100">Ready to continue your journey</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Success Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-50/50 dark:bg-gray-900/50">
          <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">{/* Clean glass-like card design */}
          
                  <CardHeader className="text-center pb-8 pt-10 px-6">
          {/* Sleek icon with glow effect */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
            </div>
          </div>

          {/* Refined typography */}
          <CardTitle className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Email Sent!
            </span>
          </CardTitle>
          
          <CardDescription className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Check your email for reset instructions
          </CardDescription>
          
          {/* Sleeker success badge */}
          <div className="flex justify-center mb-4">
            <div className="group flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Mail className="h-4 w-4 text-emerald-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reset Link Sent</span>
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
          
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Decorative Abstract */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 relative overflow-hidden">
                  {/* Abstract shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-16 right-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse delay-800"></div>
            <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-yellow-300/15 rounded-full blur-2xl animate-bounce delay-400"></div>
          </div>
          
          {/* Neon gradient decorative lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60 animate-pulse delay-350"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-80 animate-pulse delay-950"></div>
            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70 animate-pulse delay-1350"></div>
            
            {/* Vertical neon lines */}
            <div className="absolute left-1/3 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-amber-300 to-transparent opacity-50 animate-pulse delay-1150"></div>
            <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-orange-400 to-transparent opacity-60 animate-pulse delay-650"></div>
          </div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
            Forgot Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">
              Password?
            </span>
          </h1>
          <p className="text-xl text-orange-100 mb-8 leading-relaxed">
            No worries! We&apos;ll send you a secure reset link to get you back into your TaskTracker adventure.
          </p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
              <span className="text-orange-100">Email verification sent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
              <span className="text-orange-100">Secure reset process</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse delay-500"></div>
              <span className="text-orange-100">Quick account recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-50/50 dark:bg-gray-900/50">
        <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">{/* Clean glass-like card design */}
        
        <CardHeader className="text-center pb-8 pt-10 px-6">
          {/* Sleek icon with glow effect */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/25 transform hover:scale-105 transition-all duration-300">
                <Key className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
            </div>
          </div>

          {/* Refined typography */}
          <CardTitle className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Reset Password
            </span>
          </CardTitle>
          
          <CardDescription className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            We&apos;ll send you a secure reset link
          </CardDescription>
          
          {/* Sleeker help badge */}
          <div className="flex justify-center mb-4">
            <div className="group flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Mail className="h-4 w-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Recovery</span>
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
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold text-base flex items-center gap-3">
                      <div className="p-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-gray-900 dark:text-white font-medium group-hover:border-amber-300 dark:group-hover:border-amber-600"
                          {...field}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-sm font-medium" />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                type="submit" 
                className="relative w-full h-16 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-amber-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group" 
                disabled={form.formState.isSubmitting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Mail className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Send Reset Link</span>
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
        
        </Card>
      </div>
    </div>
  );
}; 