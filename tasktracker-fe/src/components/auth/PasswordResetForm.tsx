'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
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

  // Available security questions
  const securityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What was your childhood nickname?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What was your favorite childhood book?",
    "What was the make of your first car?",
    "What street did you grow up on?",
    "What was your favorite teacher's name?",
    "What is your favorite movie?",
  ];

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
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <KeyRound className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll help you reset your password securely.
        </p>
        </div>

      <Form {...requestForm}>
        <form onSubmit={requestForm.handleSubmit(handlePasswordResetRequest)} className="space-y-4">
          <FormField
            control={requestForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="Enter your email address"
                    disabled={flowState.isLoading}
                  />
                </FormControl>
                <FormMessage />
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
          </div>

                <FormField
                  control={requestForm.control}
                  name="securityQuestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose a security question</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>
                                {question}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
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
                        <FormLabel>Your answer</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your answer"
                            disabled={flowState.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>
            </>
          )}

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
            disabled={flowState.isLoading}
          >
            {flowState.isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Link
              </>
            )}
              </Button>
        </form>
      </Form>
    </div>
  );

  // Step 2: Email Verification
  const renderVerificationStep = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Check Your Email</h2>
        <p className="text-muted-foreground">
          We&apos;ve sent a password reset link to <strong>{flowState.email}</strong>
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
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

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => handlePasswordResetRequest(requestForm.getValues())}
          disabled={flowState.isLoading}
          className="flex-1"
        >
          {flowState.isLoading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Resend Email
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={() => router.push('/auth/login')}
          className="flex-1"
        >
          Back to Login
        </Button>
            </div>
          </div>
  );

  // Step 3: Set New Password
  const renderResetStep = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Create New Password</h2>
        <p className="text-muted-foreground">
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
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-700">Password Reset Complete!</h2>
        <p className="text-muted-foreground">
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
        className="w-full"
        onClick={() => router.push('/auth/login')}
      >
        <Unlock className="mr-2 h-4 w-4" />
        Continue to Sign In
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Password Reset Card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskTracker
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </CardHeader>
        
            <CardContent className="space-y-4">
          {flowState.step === 'request' && renderRequestStep()}
          {flowState.step === 'verification' && renderVerificationStep()}
          {flowState.step === 'reset' && renderResetStep()}
          {flowState.step === 'success' && renderSuccessStep()}
            </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="flex items-center justify-between w-full">
            {canGoBack && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button variant="link" size="sm" asChild>
              <Link href="/auth/login">
                Return to Login
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Enhanced security with breach detection</span>
            </div>
          </div>
            </CardFooter>
      </Card>

      {/* Enhanced Features Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Breach Detection</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <Key className="h-6 w-6 mx-auto mb-2 text-green-600" />
          <div className="text-xs font-medium text-green-700 dark:text-green-300">Strength Validation</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <HelpCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
          <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Security Questions</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
          <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Multi-Step Flow</div>
        </div>
      </div>
    </div>
  );
}; 