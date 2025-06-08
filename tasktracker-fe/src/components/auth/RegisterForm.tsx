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
import { Eye, EyeOff, UserPlus, Trophy } from 'lucide-react';
import { RegisterFormData, FamilyMemberAgeGroup } from '../../lib/types/auth';
import { registerSchema } from '../../lib/schemas';
import { DecorativeLines } from '../ui/DecorativeLines';

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
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName.trim() || null,
        lastName: data.lastName.trim() || null,
        ageGroup: data.ageGroup,
        dateOfBirth: null, // Optional field
      });
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4 relative overflow-hidden">

      <Card className="w-full max-w-md shadow-xl bg-gray-900 dark:bg-white border-2 border-gray-700/50 dark:border-gray-200/50 relative overflow-hidden">
        {/* Card decorative top line */}
      <DecorativeLines  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 animate-pulse"/>
        {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 animate-pulse"></div> */}
        
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-white dark:text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            Join TaskTracker
          </CardTitle>
          <CardDescription className="text-gray-400 dark:text-gray-600">
            Create your account and start leveling up your productivity
          </CardDescription>
          
          {/* Gamification welcome badge */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 dark:from-emerald-50/50 dark:to-teal-50/50 border border-emerald-700/30 dark:border-emerald-200/30 rounded-xl px-4 py-2">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-300 dark:text-gray-700">Start earning points!</span>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Username *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Choose a username"
                        className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors text-white dark:text-gray-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors text-white dark:text-gray-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors text-white dark:text-gray-900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors text-white dark:text-gray-900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Age Group *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors text-white dark:text-gray-900">
                          <SelectValue placeholder="Select your age group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300">
                        <SelectItem value={FamilyMemberAgeGroup.Adult.toString()}>Adult (18+)</SelectItem>
                        <SelectItem value={FamilyMemberAgeGroup.Teen.toString()}>Teen (13-17)</SelectItem>
                        <SelectItem value={FamilyMemberAgeGroup.Child.toString()}>Child (Under 13)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors pr-10 text-white dark:text-gray-900"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 dark:text-gray-700 font-medium">Confirm Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="bg-gray-800 dark:bg-white border-gray-600 dark:border-gray-300 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors pr-10 text-white dark:text-gray-900"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="font-medium text-emerald-400 dark:text-emerald-600 hover:text-emerald-300 dark:hover:text-emerald-500 hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Form>
        
        {/* Card decorative bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 opacity-50"></div>
      </Card>
    </div>
  );
}; 