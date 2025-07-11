'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, UserPlus, Trophy, Star, Sparkles, Zap, Shield, Crown, Users, Rocket } from 'lucide-react';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';
import { z } from 'zod';
import { registerSchema } from '@/lib/schemas/auth';

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      ageGroup: FamilyMemberAgeGroup.Adult,
    },
  });

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setErrorMessage('');

    try {
     
        await registerUser({
          username: data.username as string,
          email: data.email as string,
          password: data.password as string,
          confirmPassword: data.confirmPassword as string,
          firstName: (data.firstName as string)?.trim() || null,
          lastName: (data.lastName as string)?.trim() || null,
          ageGroup: data.ageGroup as FamilyMemberAgeGroup,
          dateOfBirth: null, // Optional field
        });
        router.push('/dashboard');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        setErrorMessage(message);
      }
    
  
  }

  // Get age group icon and label for gamification
  const getAgeGroupInfo = (ageGroup: FamilyMemberAgeGroup) => {
    switch (ageGroup) {
      case FamilyMemberAgeGroup.Adult:
        return { icon: <Crown className="h-4 w-4 text-amber-500" />, label: '👑 Adult Hero (18+)', color: 'amber' };
      case FamilyMemberAgeGroup.Teen:
        return { icon: <Star className="h-4 w-4 text-blue-500" />, label: '⭐ Teen Champion (13-17)', color: 'blue' };
      case FamilyMemberAgeGroup.Child:
        return { icon: <Users className="h-4 w-4 text-green-500" />, label: '🌟 Young Explorer (Under 13)', color: 'green' };
      default:
        return { icon: <Users className="h-4 w-4 text-gray-500" />, label: 'Select age group', color: 'gray' };
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden">
      {/* Left Side - Enterprise Gamification Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-32 left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-cyan-300/15 rounded-full blur-2xl animate-bounce delay-300"></div>
        </div>

        {/* Enterprise gamification decorative lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 animate-pulse delay-200"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-80 animate-pulse delay-800"></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 animate-pulse delay-1200"></div>

          {/* Vertical enterprise lines */}
          <div className="absolute left-1/3 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-emerald-300 to-transparent opacity-50 animate-pulse delay-900"></div>
          <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-teal-400 to-transparent opacity-60 animate-pulse delay-400"></div>
        </div>

        {/* Enterprise content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              TaskTracker
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-cyan-200">
              Family Adventure
            </span>
          </h1>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join thousands of families transforming daily routines into exciting gamified adventures.
          </p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
              <span className="text-emerald-100">Create your family workspace</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-200"></div>
              <span className="text-emerald-100">Gamify your daily tasks</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-500"></div>
              <span className="text-emerald-100">Unlock achievements together</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse delay-700"></div>
              <span className="text-emerald-100">Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 lg:p-12 bg-gray-900 overflow-y-auto">
        <Card className="w-full max-w-lg bg-gray-800 border-gray-700 shadow-2xl my-4">{/* Clean dark card design */}

          <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6">
            {/* Sleek icon with glow effect */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300">
                  <UserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
              </div>
            </div>

            {/* Refined typography */}
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Create Account
              </span>
            </CardTitle>

            <CardDescription className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
              Begin your family adventure
            </CardDescription>

            {/* Enterprise gamification badges */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
              <div className="group flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-700/30 rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs sm:text-sm font-medium text-gray-300">Earn Points</span>
              </div>
              <div className="group flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border border-teal-700/30 rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs sm:text-sm font-medium text-gray-300">100% Free</span>
              </div>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6">
                {errorMessage && (
                  <Alert variant="destructive" className="border-red-800 bg-red-950/50 shadow-lg">
                    <AlertDescription className="text-red-200 font-medium text-xs sm:text-sm">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2 sm:space-y-3">
                      <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                        <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="Enter your username"
                            className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-emerald-300"
                            {...field}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2 sm:space-y-3">
                      <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                        <div className="p-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-teal-300"
                            {...field}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                    </FormItem>
                  )}
                />

                {/* Name Fields - Mobile Stack, Desktop Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:space-y-3">
                        <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                          <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          First Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              placeholder="John"
                              className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-blue-300"
                              {...field}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:space-y-3">
                        <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              placeholder="Doe"
                              className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-indigo-300"
                              {...field}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Age Group Field with Gamification */}
                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => {
                    const selectedInfo = getAgeGroupInfo(field.value);
                    return (
                      <FormItem className="space-y-2 sm:space-y-3">
                        <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                          <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          Hero Class
                        </FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium hover:border-purple-300">
                              <SelectValue placeholder="🎯 Choose your hero class">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  {selectedInfo.icon}
                                  <span className="text-sm sm:text-base">{selectedInfo.label}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-2 border-gray-600 shadow-xl">
                            <SelectItem value={FamilyMemberAgeGroup.Adult.toString()} className="text-sm sm:text-base py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                <span className="font-medium">👑 Adult Hero (18+)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={FamilyMemberAgeGroup.Teen.toString()} className="text-sm sm:text-base py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                <span className="font-medium">⭐ Teen Champion (13-17)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={FamilyMemberAgeGroup.Child.toString()} className="text-sm sm:text-base py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                <span className="font-medium">🌟 Young Explorer (Under 13)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                      </FormItem>
                    );
                  }}
                />

                {/* Password Fields - Mobile Stack, Desktop Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:space-y-3">
                        <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                          <div className="p-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg">
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create password"
                              className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl pr-12 sm:pr-14 text-white font-medium group-hover:border-purple-300"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 hover:bg-purple-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-purple-400 transition-colors" />
                              ) : (
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-purple-400 transition-colors" />
                              )}
                            </Button>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:space-y-3">
                        <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                          <div className="p-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Repeat password"
                              className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl pr-12 sm:pr-14 text-white font-medium group-hover:border-emerald-300"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 hover:bg-emerald-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-emerald-400 transition-colors" />
                              ) : (
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-emerald-400 transition-colors" />
                              )}
                            </Button>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 sm:space-y-4 pt-4 sm:pt-6 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-6">
                <Button
                  type="submit"
                  className="relative w-full h-12 sm:h-14 lg:h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                  disabled={form.formState.isSubmitting}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-sm sm:text-base">Start Epic Journey</span>
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse" />
                    </div>
                  )}
                </Button>

                {/* Mobile-optimized sign in section */}
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
                    Already have a hero account?
                  </p>
                  <Link
                    href="/auth/login"
                    className="group inline-flex items-center gap-2 sm:gap-3 bg-gray-800/80 border-2 border-purple-700/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 hover:border-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    <div className="p-1 sm:p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg sm:rounded-xl group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-purple-300 text-sm sm:text-base group-hover:text-purple-200 transition-colors">
                      Sign Into Account
                    </span>
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 group-hover:animate-pulse" />
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
