'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft,  
  Shield, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  HelpCircle, 
  RefreshCw,
  Lock,
  Unlock,
  Zap,
  Trophy,
  ShieldCheck,
  KeyRound
} from 'lucide-react';


// Enhanced Auth Types from lib directory
import { 
  PasswordResetFlowState,
  PasswordStrengthIndicator,
  SecurityAlert
} from '../../lib/types/enhanced-auth';
import { SecurityLevel } from '../../lib/types/session-management';
import { 
  validatePasswordStrength
} from '../../lib/schemas/enhanced-auth';
import { EnhancedAuthService } from '../../lib/services/enhancedAuthService';

// Import schemas and types from lib directory - explicit typing
import {
  passwordResetRequestSchema,
  newPasswordSchema,
  type PasswordResetRequestFormData,
  type NewPasswordFormData
} from '../../lib/schemas/enhanced-auth';
import { type EnhancedPasswordResetFormProps } from '../../lib/types/component-props';

export const PasswordResetForm: React.FC<EnhancedPasswordResetFormProps> = ({
  onClose,
  onSuccess,
  showSecurityQuestions = true
}) => {
  const router = useRouter();
  
  // Enhanced Password Reset State from lib directory types
  const [flowState, setFlowState] = useState<PasswordResetFlowState>({
    step: 'request',
    email: null,
    token: null,
    isLoading: false,
    error: null,
    expiresAt: null,
    attemptsRemaining: 3,
  });
  
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthIndicator | null>(null);
  const [securityAlert, setSecurityAlert] = useState<SecurityAlert | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [isPasswordCompromised, setIsPasswordCompromised] = useState(false);

  const enhancedAuthService = EnhancedAuthService.getInstance();

  // Step 1: Password Reset Request Form
  const requestForm = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
      securityQuestion: '',
      securityAnswer: '',
      useAlternateMethod: false,
    },
  });



  // Step 3: New Password Form
  const passwordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // User's security questions (loaded dynamically)
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
  const [loadingSecurityQuestions, setLoadingSecurityQuestions] = useState(false);
  const [securityQuestionsError, setSecurityQuestionsError] = useState<string | null>(null);

  // Load user's security questions when email is entered
  const loadUserSecurityQuestions = useCallback(async (email: string) => {
    if (!email || !showSecurityQuestions) return;
    
    setLoadingSecurityQuestions(true);
    setSecurityQuestionsError(null);
    
    try {
      const result = await enhancedAuthService.getSecurityQuestionsByEmail(email);
      if (result.hasQuestionsSetup && result.questions.length > 0) {
        setSecurityQuestions(result.questions.map(q => q.question));
      } else {
        setSecurityQuestions([]);
        setSecurityQuestionsError('No security questions found for this email address.');
      }
    } catch (error) {
      console.error('Error loading security questions:', error);
      setSecurityQuestions([]);
      setSecurityQuestionsError('Could not load security questions. You can still use email verification.');
    } finally {
      setLoadingSecurityQuestions(false);
    }
  }, [showSecurityQuestions, enhancedAuthService]);

  // Real-time password strength and breach checking
  const handlePasswordChange = useCallback(async (password: string) => {
    if (password.length > 0) {
      // Validate password strength using lib directory function
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
      
      // Check password breach using enhanced auth service
      if (password.length >= 8) {
        setIsCheckingBreach(true);
        try {
          const isCompromised = await enhancedAuthService.checkPasswordCompromised(password);
          setIsPasswordCompromised(isCompromised);
          
          if (isCompromised) {
            setSecurityAlert({
              type: 'suspicious_activity',
              severity: SecurityLevel.HIGH,
              message: 'This password has been found in data breaches. Please choose a different password.',
              dismissible: true,
              actionRequired: true,
              actionUrl: null
            });
          } else {
            setSecurityAlert(null);
          }
        } catch (error) {
          console.warn('Could not check password breach status:', error);
        } finally {
          setIsCheckingBreach(false);
        }
      }
    } else {
      setPasswordStrength(null);
      setIsPasswordCompromised(false);
      setSecurityAlert(null);
    }
  }, [enhancedAuthService]);

  // Watch email field to load security questions
  const watchedEmail = requestForm.watch('email');
  useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@') && watchedEmail.length > 5) {
      // Debounce the security questions loading
      const timer = setTimeout(() => {
        loadUserSecurityQuestions(watchedEmail);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setSecurityQuestions([]);
      setSecurityQuestionsError(null);
    }
  }, [watchedEmail, loadUserSecurityQuestions]);

  // Step 1: Handle password reset request
  const handlePasswordResetRequest = async (data: PasswordResetRequestFormData): Promise<void> => {
    setFlowState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔐 Initiating enhanced password reset...');
      
      const resetState = await enhancedAuthService.initiatePasswordReset({
        email: data.email,
        securityQuestion: data.securityQuestion,
        securityAnswer: data.securityAnswer,
        useAlternateMethod: data.useAlternateMethod,
      });
      
      setFlowState(resetState);
      console.log('✅ Password reset initiated successfully');
      
    } catch (error) {
      console.error('❌ Password reset initiation failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to initiate password reset';
      setFlowState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: message 
      }));
    }
  };



  // Step 3: Handle new password reset
  const handleNewPasswordReset = async (data: NewPasswordFormData): Promise<void> => {
    if (!flowState.token) {
      setFlowState(prev => ({ 
        ...prev, 
        error: 'Invalid reset token. Please start the process again.' 
      }));
      return;
    }
    
    if (isPasswordCompromised) {
      setFlowState(prev => ({ 
        ...prev, 
        error: 'Please choose a password that has not been compromised in data breaches.' 
      }));
      return;
    }
    
    setFlowState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔐 Resetting password...');
      
      await enhancedAuthService.resetPassword(flowState.token, data.password);
      
      setFlowState(prev => ({ 
        ...prev, 
        step: 'success',
        isLoading: false 
      }));
      
      console.log('✅ Password reset completed successfully');
      
      // Call success callback after a delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/auth/login?message=Password reset successful');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      setFlowState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: message 
      }));
    }
  };

  // Navigation helpers
  const goBack = () => {
    switch (flowState.step) {
      case 'verification':
        setFlowState(prev => ({ ...prev, step: 'request' }));
        break;
      case 'reset':
        setFlowState(prev => ({ ...prev, step: 'verification' }));
        break;
      default:
        break;
    }
  };

  const canGoBack = flowState.step !== 'request' && flowState.step !== 'success';

  // Progress calculation
  const getStepProgress = () => {
    switch (flowState.step) {
      case 'request': return 25;
      case 'verification': return 50;
      case 'reset': return 75;
      case 'success': return 100;
      default: return 0;
    }
  };

  // Security Alert Display Component
  const SecurityAlertDisplay = () => {
    if (!securityAlert) return null;

    const getAlertStyle = (severity: string) => {
      switch (severity) {
        case 'critical': return 'border-red-200 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200';
        case 'high': return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200';
        case 'medium': return 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200';
        default: return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200';
      }
    };

    return (
      <Alert className={getAlertStyle(securityAlert.severity)}>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Security Alert</strong>
              <div className="text-sm mt-1">{securityAlert.message}</div>
            </div>
            {securityAlert.dismissible && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSecurityAlert(null)}
              >
                ×
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Password Strength Display Component
  const PasswordStrengthDisplay = () => {
    if (!passwordStrength) return null;

    const getStrengthColor = (level: string) => {
      switch (level) {
        case 'excellent': return 'bg-green-500';
        case 'strong': return 'bg-blue-500';
        case 'good': return 'bg-yellow-500';
        case 'fair': return 'bg-orange-500';
        case 'weak': return 'bg-red-500';
        default: return 'bg-gray-300';
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Password Strength</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${passwordStrength.score > 80 ? 'text-green-700' : passwordStrength.score > 60 ? 'text-blue-700' : 'text-orange-700'}`}>
              {passwordStrength.score}/100
            </Badge>
            {isCheckingBreach && <RefreshCw className="h-3 w-3 animate-spin" />}
            {isPasswordCompromised && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {!isPasswordCompromised && passwordStrength.score > 70 && !isCheckingBreach && (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.level)}`}
            style={{ width: `${passwordStrength.score}%` }}
          ></div>
        </div>
          
        {passwordStrength.suggestions.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">Suggestions:</div>
            <ul className="list-disc list-inside space-y-1 mt-1">
              {passwordStrength.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Step 1: Password Reset Request
  const renderRequestStep = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
          <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Reset Your Password
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Enter your email address and we&apos;ll help you reset your password securely.
        </p>
        
        {/* Enterprise gamification badges */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
          <div className="group flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm font-medium text-gray-300">Secure Reset</span>
          </div>
          <div className="group flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-700/30 rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm font-medium text-gray-300">Fast Recovery</span>
          </div>
        </div>
        </div>

      <Form {...requestForm}>
        <form onSubmit={requestForm.handleSubmit(handlePasswordResetRequest)} className="space-y-3 sm:space-y-4">
          <FormField
            control={requestForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2 sm:space-y-3">
                <FormLabel className="text-gray-300 font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3">
                  <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="Enter your email address"
                    disabled={flowState.isLoading}
                      className="h-12 sm:h-14 text-base sm:text-lg bg-gray-700 border-2 border-gray-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-blue-300"
                  />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs sm:text-sm font-medium" />
              </FormItem>
            )}
          />

          {showSecurityQuestions && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Security Questions (Optional)</span>
                  {loadingSecurityQuestions && (
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                  )}
                </div>

                {securityQuestionsError && (
                  <Alert className="border-yellow-600 bg-yellow-950/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200 text-sm">
                      {securityQuestionsError}
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={requestForm.control}
                  name="securityQuestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-medium">Choose a security question</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={loadingSecurityQuestions || securityQuestions.length === 0}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-400 text-white">
                            <SelectValue placeholder={
                              loadingSecurityQuestions 
                                ? "Loading your security questions..." 
                                : securityQuestions.length === 0 
                                  ? "No security questions found" 
                                  : "Select a security question"
                            } />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>
                                {question}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        {securityQuestions.length > 0 
                          ? `${securityQuestions.length} security question(s) found for this email`
                          : watchedEmail && watchedEmail.includes('@') 
                            ? "Enter a valid email to load security questions"
                            : "Security questions will load after entering your email"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {requestForm.watch('securityQuestion') && (
                  <FormField
                    control={requestForm.control}
                    name="securityAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-medium">Your answer</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your answer"
                            disabled={flowState.isLoading}
                            className="bg-gray-700 border-gray-600 focus:border-blue-400 transition-colors text-white"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400 text-xs">
                          Enter the exact answer you provided when setting up this security question
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>
            </>
          )}

          {flowState.error && (
            <Alert className="border-red-800 bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {flowState.error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="relative w-full h-12 sm:h-14 lg:h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
            disabled={flowState.isLoading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {flowState.isLoading ? (
              <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="text-sm sm:text-base">Sending Reset Link...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm sm:text-base">Send Reset Link</span>
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse" />
              </div>
            )}
              </Button>
        </form>
      </Form>
    </div>
  );

  // Step 2: Email Verification
  const renderVerificationStep = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-2xl blur-xl opacity-30 -z-10"></div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Check Your Email
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          We&apos;ve sent a password reset link to <strong className="text-white">{flowState.email}</strong>
        </p>
      </div>

      <Alert className="border-blue-800 bg-blue-950/20">
        <Clock className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <div className="space-y-1">
            <div><strong>Next Steps:</strong></div>
            <div>1. Check your email inbox (and spam folder)</div>
            <div>2. Click the reset link in the email</div>
            <div>3. Create your new password</div>
            {flowState.expiresAt && (
              <div className="mt-2 text-xs">
                Link expires: {new Date(flowState.expiresAt).toLocaleString()}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          onClick={() => handlePasswordResetRequest(requestForm.getValues())}
          disabled={flowState.isLoading}
          className="flex-1 h-10 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
        >
          {flowState.isLoading ? (
            <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          )}
          Resend Email
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={() => router.push('/auth/login')}
          className="flex-1 h-10 sm:h-12 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-gray-300 hover:text-white border-white/20 hover:border-white/30 text-xs sm:text-sm"
        >
          Back to Login
        </Button>
            </div>
          </div>
  );

  // Step 3: Set New Password
  const renderResetStep = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
          <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Create New Password
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Choose a strong password that you haven&apos;t used before.
        </p>
      </div>

      <SecurityAlertDisplay />

      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handleNewPasswordReset)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      disabled={flowState.isLoading}
                      onChange={(e) => {
                        field.onChange(e);
                        handlePasswordChange(e.target.value);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={flowState.isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                
                {/* Real-time password strength */}
                {field.value && field.value.length > 0 && (
                  <PasswordStrengthDisplay />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
            <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      disabled={flowState.isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={flowState.isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {flowState.error && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {flowState.error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={Boolean(flowState.isLoading || isPasswordCompromised || (passwordStrength && passwordStrength.score < 50))}
          >
            {flowState.isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );

  // Step 4: Success
  const renderSuccessStep = () => (
    <div className="space-y-3 sm:space-y-4 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
        <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-30 -z-10"></div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Password Reset Complete!
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="space-y-1">
            <div><strong>Security Enhancements Applied:</strong></div>
            <div>• Password strength validated</div>
            <div>• Breach detection completed</div>
            <div>• Account security updated</div>
          </div>
        </AlertDescription>
      </Alert>

      <Button 
        className="relative w-full h-12 sm:h-14 lg:h-16 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group"
        onClick={() => router.push('/auth/login')}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
          <Unlock className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm sm:text-base">Continue to Sign In</span>
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse" />
        </div>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden">
      {/* Left Side - Enterprise Gamification Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-32 left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-indigo-300/15 rounded-full blur-2xl animate-bounce delay-300"></div>
        </div>
        
        {/* Enterprise gamification decorative lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 animate-pulse delay-200"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-80 animate-pulse delay-800"></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70 animate-pulse delay-1200"></div>
          
          {/* Vertical enterprise lines */}
          <div className="absolute left-1/3 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-50 animate-pulse delay-900"></div>
          <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-60 animate-pulse delay-400"></div>
        </div>
        
        {/* Enterprise content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              TaskTracker
            </div>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
            Secure Password <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
              Recovery
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Enterprise-grade security for your family&apos;s digital safety and productivity journey.
          </p>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <span className="text-blue-100">Multi-step verification</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-200"></div>
              <span className="text-blue-100">Breach detection security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-500"></div>
              <span className="text-blue-100">Password strength validation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-700"></div>
              <span className="text-blue-100">Secure token encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Password Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 lg:p-12 bg-gray-900 overflow-y-auto">
        <div className="space-y-4 sm:space-y-6 w-full max-w-md my-4">
          {/* Main Password Reset Card */}
          <Card className="w-full bg-gray-800 border-gray-700 shadow-2xl">
            <CardHeader className="space-y-1 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Reset Portal
                  </div>
                </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10">
                ×
              </Button>
            )}
          </div>
          
                      {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                <span>Progress</span>
                <span>{getStepProgress()}%</span>
              </div>
              <Progress value={getStepProgress()} className="h-1.5 sm:h-2" />
            </div>
          </CardHeader>
        
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          {flowState.step === 'request' && renderRequestStep()}
          {flowState.step === 'verification' && renderVerificationStep()}
          {flowState.step === 'reset' && renderResetStep()}
          {flowState.step === 'success' && renderSuccessStep()}
            </CardContent>

        <CardFooter className="flex flex-col space-y-2 px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between w-full">
            {canGoBack && (
              <Button variant="ghost" size="sm" onClick={goBack} className="text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button variant="link" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/auth/login">
                Return to Login
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-400">
            <div className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Enhanced security with breach detection</span>
            </div>
          </div>
            </CardFooter>
        </Card>

          {/* Enhanced Features Showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-blue-950 to-blue-900">
              <Shield className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-blue-400" />
              <div className="text-xs font-medium text-blue-300">Breach Detection</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-green-950 to-green-900">
              <Key className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-green-400" />
              <div className="text-xs font-medium text-green-300">Strength Validation</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-purple-950 to-purple-900">
              <HelpCircle className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-purple-400" />
              <div className="text-xs font-medium text-purple-300">Security Questions</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-b from-orange-950 to-orange-900">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-orange-400" />
              <div className="text-xs font-medium text-orange-300">Multi-Step Flow</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 