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
import { Eye, EyeOff, LogIn, Star, Clock, Sparkles, Zap, Trophy, Shield, KeyRound } from 'lucide-react';
import { LoginFormData } from '../../lib/types/auth';
import { loginSchema } from '../../lib/schemas';
import { useState } from 'react';


export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lockoutInfo, setLockoutInfo] = useState<{ isLocked: boolean; minutesRemaining: number } | null>(null);

  // Parse lockout information from error messages
  const parseLockoutInfo = (message: string): { isLocked: boolean; minutesRemaining: number } | null => {
    // Check for generic lockout message (no specific time provided by backend)
    if (message.toLowerCase().includes('temporarily locked') || message.toLowerCase().includes('multiple failed login attempts')) {
      // Since backend doesn't provide specific time, estimate based on common lockout policies
      // Most systems use 15-30 minutes, let's use 15 minutes as default
      return {
        isLocked: true,
        minutesRemaining: 15 // Default lockout time
      };
    }
    
    // Also check for specific time if provided in future
    const lockoutRegex = /temporarily locked.*?(\d+).*?minute/i;
    const match = message.match(lockoutRegex);
    if (match) {
      return {
        isLocked: true,
        minutesRemaining: parseInt(match[1], 10)
      };
    }
    
    return null;
  };

  // Timer to update lockout countdown
  useEffect(() => {
    if (lockoutInfo?.isLocked && lockoutInfo.minutesRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutInfo(prev => {
          if (!prev || prev.minutesRemaining <= 1) {
            setErrorMessage('');
            return null;
          }
          return {
            ...prev,
            minutesRemaining: prev.minutesRemaining - 1
          };
        });
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [lockoutInfo]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setErrorMessage('');
    setLockoutInfo(null);
    
    try {
      console.log('🔐 Starting login process...');
      await login(data);
      console.log('✅ Login successful, waiting for cookies to settle...');
      
      router.push('/dashboard');
      console.log('✅ Redirect initiated');
    } catch (error) {
      console.error('❌ Login failed:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      setErrorMessage(message);
      
      // Check if this is a lockout error and parse the time
      const lockout = parseLockoutInfo(message);
      if (lockout) {
        setLockoutInfo(lockout);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Decorative Abstract */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-300/15 rounded-full blur-2xl animate-bounce"></div>
        </div>
        
        {/* Neon gradient decorative lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-80 animate-pulse delay-500"></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70 animate-pulse delay-1000"></div>
          
          {/* Vertical neon lines */}
          <div className="absolute left-1/4 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-50 animate-pulse delay-700"></div>
          <div className="absolute right-1/3 top-0 h-full w-1 bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-60 animate-pulse delay-300"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
            Welcome Back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">
              TaskTracker
            </span>
          </h1>
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Continue your productivity journey and achieve your goals with our gamified task management system.
          </p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
              <span className="text-purple-100">Track your daily progress</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-300"></div>
              <span className="text-purple-100">Earn points and achievements</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-700"></div>
              <span className="text-purple-100">Collaborate with your family</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-50/50 dark:bg-gray-900/50">
        <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">{/* Clean glass-like card design */}
        
        <CardHeader className="text-center pb-8 pt-10 px-6">
          {/* Sleek icon with glow effect */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                <LogIn className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
            </div>
          </div>

          {/* Refined typography */}
          <CardTitle className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </CardTitle>
          
          <CardDescription className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Continue your productivity journey
          </CardDescription>
          
          {/* Sleeker gamification badges */}
          <div className="flex justify-center gap-3 mb-4">
            <div className="group flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Trophy className="h-4 w-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Awaits</span>
            </div>
            <div className="group flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Shield className="h-4 w-4 text-emerald-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure Access</span>
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

              {lockoutInfo?.isLocked && (
                <Alert className="border-orange-300 bg-orange-50 dark:bg-orange-950/50 dark:border-orange-800 shadow-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200 font-medium text-sm">
                    🛡️ Security lockout active. Quest continues in{' '}
                    <span className="font-bold text-orange-900 dark:text-orange-100">
                      {lockoutInfo.minutesRemaining} minute{lockoutInfo.minutesRemaining !== 1 ? 's' : ''}
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold text-base flex items-center gap-3">
                      <div className="p-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      Email or Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          placeholder="Enter your email or username"
                          className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-gray-900 dark:text-white font-medium group-hover:border-purple-300 dark:group-hover:border-purple-600"
                          {...field}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-sm font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold text-base flex items-center gap-3">
                      <div className="p-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl pr-14 text-gray-900 dark:text-white font-medium group-hover:border-purple-300 dark:group-hover:border-purple-600"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" />
                          )}
                        </Button>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-sm font-medium" />
                  </FormItem>
                )}
              />

              <div className="flex justify-center pt-4">
                <Link 
                  href="/auth/forgot-password" 
                  className="group flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 font-medium text-base"
                >
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors duration-200">
                    <KeyRound className="h-3 w-3" />
                  </div>
                  <span className="group-hover:underline">Forgot Password?</span>
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 sm:space-y-6 pt-6 pb-8 px-4 sm:px-6">
              <Button 
                type="submit" 
                className="relative w-full h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group" 
                disabled={form.formState.isSubmitting || lockoutInfo?.isLocked}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Launching Quest...</span>
                  </div>
                ) : lockoutInfo?.isLocked ? (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Clock className="h-5 w-5" />
                    <span>Security Lock ({lockoutInfo.minutesRemaining}m)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                    <span>Begin Your Quest</span>
                    <Trophy className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                )}
              </Button>

              {/* Sleek sign up section */}
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  New to the adventure?
                </p>
                <Link 
                  href="/auth/register" 
                  className="group inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-700/50 rounded-2xl px-6 py-4 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl group-hover:from-emerald-600 group-hover:to-green-600 transition-all duration-300">
                    <Star className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-base group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                    Create Hero Account
                  </span>
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:animate-pulse" />
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
        
        </Card>
      </div>
    </div>
  );
}; 