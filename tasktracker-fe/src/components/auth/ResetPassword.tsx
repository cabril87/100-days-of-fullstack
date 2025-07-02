'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, CheckCircle2, Shield, Zap, Sparkles, Rocket, Key, XCircle, RotateCcw } from 'lucide-react';
import { ResetPasswordContentProps, ResetPasswordFormData } from '@/lib/types/auth/auth';
import { resetPasswordSchema } from '../../lib/schemas';
import { authService } from '../../lib/services/authService';

export default function ResetPasswordContent({
  token,
  isValidToken,
  validationMessage
}: ResetPasswordContentProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Auto redirect after successful reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
    if (!token) {
      setErrorMessage('Invalid reset token');
      return;
    }

    setErrorMessage('');

    try {
      await authService.resetPassword({
          token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
        setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      setErrorMessage(message);
    }
  };

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex bg-gray-900">
        {/* Left Side - Enterprise Content */}
        <div className="hidden lg:flex lg:w-1/2  relative overflow-hidden">
          {/* Abstract shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-24 right-32 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-28 left-28 w-88 h-88 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute top-1/2 left-1/2 w-44 h-44 bg-amber-300/15 rounded-full blur-2xl animate-bounce delay-1000"></div>
          </div>

          {/* Neon gradient decorative lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60 animate-pulse delay-100"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent opacity-80 animate-pulse delay-600"></div>
            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70 animate-pulse delay-1100"></div>

            {/* Vertical neon lines */}
            <div className="absolute left-1/4 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-orange-300 to-transparent opacity-50 animate-pulse delay-800"></div>
            <div className="absolute right-1/3 top-0 h-full w-1 bg-gradient-to-b from-transparent via-red-400 to-transparent opacity-60 animate-pulse delay-300"></div>
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
              Security <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-white">
                First
              </span>
            </h1>
            <p className="text-xl text-red-100 mb-8 leading-relaxed">
              We take your account security seriously. This reset link appears to be invalid or expired.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                <span className="text-red-100">Secure password reset</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-400"></div>
                <span className="text-red-100">Request a new reset link</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse delay-800"></div>
                <span className="text-red-100">Your data stays protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Invalid Token Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-900">
          <Card className="w-full max-w-lg bg-gray-800 border-gray-700 shadow-2xl">{/* Clean dark card design */}

            <CardHeader className="text-center pb-6 pt-8 px-4 sm:px-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-red-400">
                ⚠️ Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm sm:text-base px-2">
                {validationMessage || "This password reset link is invalid or has expired."}
              </CardDescription>
          </CardHeader>
            <CardContent className="px-4 sm:px-6">
            <div className="space-y-4">
                <Button asChild className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-base rounded-xl shadow-xl">
                  <Link href="/auth/forgot-password">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    🔄 Request New Magic Key
                  </Link>
              </Button>
                <Button variant="outline" asChild className="w-full h-12 sm:h-14 border-2 border-gray-600 hover:bg-gray-800 font-bold text-base rounded-xl">
                  <Link href="/auth/login">
                    <Shield className="h-5 w-5 mr-2" />
                    🏠 Return to Login Portal
                  </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex bg-gray-900">
        {/* Left Side - Enterprise Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 relative overflow-hidden">
          {/* Abstract shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-28 left-28 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-24 right-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl animate-bounce delay-300"></div>
          </div>

          {/* Neon gradient decorative lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 animate-pulse delay-150"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-80 animate-pulse delay-750"></div>
            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-70 animate-pulse delay-1050"></div>

            {/* Vertical neon lines */}
            <div className="absolute left-1/3 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-emerald-300 to-transparent opacity-50 animate-pulse delay-950"></div>
            <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-60 animate-pulse delay-450"></div>
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
              Password <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">
                Updated!
              </span>
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
                <span className="text-green-100">Password securely updated</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-300"></div>
                <span className="text-green-100">Ready to log in</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse delay-600"></div>
                <span className="text-green-100">Account remains secure</span>
              </div>
            </div>
          </div>
        </div>

                {/* Right Side - Success Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-50/50 dark:bg-gray-900/50">
                       <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">{/* Clean glass-like card design */}

            <CardHeader className="text-center pb-6 pt-8 px-4 sm:px-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-green-700 dark:text-green-400">
                🎉 Password Reset Complete!
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base px-2">
                Your password has been successfully updated. Redirecting to login portal...
            </CardDescription>
          </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Button asChild className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-base rounded-xl shadow-xl">
                <Link href="/auth/login">
                  <Rocket className="h-5 w-5 mr-2 animate-bounce" />
                  🚀 Continue to Adventure
                </Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Decorative Abstract */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-cyan-600 to-purple-600 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-300/15 rounded-full blur-2xl animate-bounce"></div>
        </div>

        {/* Neon gradient decorative lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 animate-pulse delay-250"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80 animate-pulse delay-850"></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-70 animate-pulse delay-1250"></div>

          {/* Vertical neon lines */}
          <div className="absolute left-1/4 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-50 animate-pulse delay-1050"></div>
          <div className="absolute right-1/3 top-0 h-full w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse delay-550"></div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
            Secure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">
              Reset
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Create a strong new password to keep your TaskTracker account secure and protected.
          </p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
              <span className="text-blue-100">Secure password creation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-300"></div>
              <span className="text-blue-100">Enhanced account protection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-700"></div>
              <span className="text-blue-100">Continue your journey safely</span>
            </div>
          </div>
        </div>
      </div>

            {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-50/50 dark:bg-gray-900/50">
                  <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">{/* Clean glass-like card design */}

          <CardHeader className="text-center pb-8 pt-10 px-6">
            {/* Sleek icon with glow effect */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
              </div>
            </div>

            {/* Refined typography */}
            <CardTitle className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Reset Password
              </span>
            </CardTitle>
            
            <CardDescription className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Create a new secure password
            </CardDescription>
            
            {/* Sleeker security badge */}
            <div className="flex justify-center mb-4">
              <div className="group flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Key className="h-4 w-4 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure Reset</span>
              </div>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {errorMessage && (
                  <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950/50 dark:border-red-800 shadow-lg">
                    <AlertDescription className="text-red-800 dark:text-red-200 font-medium text-sm">
                      {errorMessage}
                    </AlertDescription>
              </Alert>
            )}

                {/* Password Fields - Mobile Stack, Desktop Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold text-base flex items-center gap-3">
                          <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                            <Zap className="h-4 w-4 text-white" />
                          </div>
                          New Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create new password"
                              className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl pr-14 text-gray-900 dark:text-white font-medium group-hover:border-blue-300 dark:group-hover:border-blue-600"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                              )}
                            </Button>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 text-sm font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold text-base flex items-center gap-3">
                          <div className="p-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Repeat new password"
                              className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl pr-14 text-gray-900 dark:text-white font-medium group-hover:border-cyan-300 dark:group-hover:border-cyan-600"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors" />
                              )}
                            </Button>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 sm:space-y-6 pt-6 pb-8 px-4 sm:px-6">
            <Button 
              type="submit" 
                  className="relative w-full h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-blue-700 hover:via-cyan-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                  disabled={form.formState.isSubmitting}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Securing Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>��️ Update Quest Code</span>
                      <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                    </div>
              )}
            </Button>

                {/* Mobile-optimized back to login section */}
            <div className="text-center">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
                    Remembered your credentials?
                  </p>
              <Link 
                href="/auth/login" 
                    className="group inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700/50 rounded-2xl px-6 py-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
              >
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
                      <Key className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-base group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors">
                Back to Login
                    </span>
                    <Rocket className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
              </Link>
            </div>
              </CardFooter>
          </form>
          </Form>

      </Card>
      </div>
    </div>
  );
} 
