'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Eye,
  EyeOff,
  LogIn,
  Clock,
  Sparkles,
  Trophy,
  Shield,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  MapPin,
  Timer,
  Mail,
  HelpCircle,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Globe,
  Wifi
} from 'lucide-react';

// Enhanced Auth Types & Schemas
import {
  DeviceRecognition,
  SecurityAlert,
  AccountLockoutStatus,
  PasswordStrengthIndicator,
  LockReason
} from '../../lib/types/enhanced-auth';
import { SecurityLevel } from '../../lib/types/session-management';
import {
  validatePasswordStrength,
  loginFormSchema,
  type LoginFormData
} from '../../lib/schemas/enhanced-auth';
import { EnhancedAuthService } from '../../lib/services/enhancedAuthService';
import { type EnhancedLoginFormProps } from '../../lib/types/component-props';

export const LoginForm: React.FC<EnhancedLoginFormProps> = ({
  onLoginSuccess,
  onMfaRequired,
  onAccountLocked,
  showDeviceRecognition = true,
  rememberDevice = false
}) => {
  const { login } = useAuth();
  const router = useRouter();

  // Enhanced Authentication State
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lockoutInfo, setLockoutInfo] = useState<AccountLockoutStatus | null>(null);
  const [deviceRecognition, setDeviceRecognition] = useState<DeviceRecognition | null>(null);
  const [securityAlert, setSecurityAlert] = useState<SecurityAlert | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthIndicator | null>(null);

  // Device Management State
  const [isCheckingDevice, setIsCheckingDevice] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [trustThisDevice, setTrustThisDevice] = useState(false);
  const [rememberThisDevice, setRememberThisDevice] = useState(rememberDevice);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'unlock'>('login');

  const enhancedAuthService = EnhancedAuthService.getInstance();

  // Enhanced form with device info - properly typed
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberDevice: false,
      trustDevice: false,
    },
  });

  // Initialize enhanced features on component mount
  useEffect(() => {
    const initializeEnhancedFeatures = async () => {
      try {
        console.log('🔧 Initializing enhanced authentication features...');

        // Generate device fingerprint
        const fingerprint = enhancedAuthService.generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
        form.setValue('deviceFingerprint', fingerprint);

        if (showDeviceRecognition) {
          setIsCheckingDevice(true);

          // Check device recognition
          const recognition = await enhancedAuthService.checkDeviceRecognition(fingerprint);
          setDeviceRecognition(recognition);

          // Auto-trust recognized devices with low risk
          if (recognition.isRecognized && recognition.riskScore < 30) {
            setTrustThisDevice(true);
            form.setValue('trustDevice', true);
          }

          console.log('✅ Device recognition completed:', {
            isRecognized: recognition.isRecognized,
            riskScore: recognition.riskScore,
            lastSeen: recognition.lastSeenAt
          });
        }
      } catch (error) {
        console.error('❌ Error initializing enhanced features:', error);
        // Continue with basic login if enhanced features fail
      } finally {
        setIsCheckingDevice(false);
      }
    };

    initializeEnhancedFeatures();
  }, [enhancedAuthService, showDeviceRecognition, form]);

  // Real-time password strength checking
  const handlePasswordChange = useCallback((password: string) => {
    if (password.length > 0) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, []);

  // Enhanced login submission
  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');
    setLockoutInfo(null);
    setSecurityAlert(null);

    try {
      console.log('🔐 Starting enhanced login process...');

      // Update form with current device settings
      const enhancedData = {
        ...data,
        deviceFingerprint,
        trustDevice: trustThisDevice,
        rememberDevice: rememberThisDevice,
      };

      // Attempt enhanced login
      const loginResult = await enhancedAuthService.enhancedLogin(
        {
          emailOrUsername: enhancedData.emailOrUsername,
          password: enhancedData.password
        },
        {
          fingerprint: deviceFingerprint,
          trustDevice: trustThisDevice,
          rememberDevice: rememberThisDevice
        }
      );

      // Handle login result
      if (loginResult.success) {
        console.log('✅ Enhanced login successful');

        // Show security alerts if any
        if (loginResult.securityAlert) {
          setSecurityAlert(loginResult.securityAlert);
        }

        // Handle MFA requirement
        if (loginResult.requiresMfa) {
          console.log('🔐 MFA required, redirecting...');
          if (onMfaRequired) {
            onMfaRequired(0); // User ID would come from result
          } else {
            router.push('/auth/mfa-verify');
          }
          return;
        }

        // Handle email verification requirement
        if (loginResult.requiresVerification) {
          console.log('📧 Email verification required, redirecting...');
          router.push('/auth/verify-email');
          return;
        }

        // Update AuthProvider context with the successful login
        try {
          await login({
            emailOrUsername: data.emailOrUsername,
            password: data.password
          });
        } catch (authProviderError) {
          console.warn('⚠️ AuthProvider update failed, but login was successful:', authProviderError);
        }

        // Successful login callback
        if (onLoginSuccess) {
          onLoginSuccess(loginResult);
        } else {
          // Default redirect
          const redirectTo = loginResult.redirectTo || '/dashboard';
          router.push(redirectTo);
        }

      } else {
        // Handle login failure
        console.log('❌ Enhanced login failed');

        if (loginResult.lockoutInfo) {
          setLockoutInfo(loginResult.lockoutInfo);
          setActiveTab('unlock');
          if (onAccountLocked) {
            onAccountLocked(loginResult.lockoutInfo);
          }
        }

        if (loginResult.securityAlert) {
          setSecurityAlert(loginResult.securityAlert);
        }

        setErrorMessage('Login failed. Please check your credentials.');
      }

    } catch (error) {
      console.error('❌ Enhanced login error:', error);

      // Fallback to standard login for compatibility
      try {
        console.log('🔄 Falling back to standard login...');
        await login({
          emailOrUsername: data.emailOrUsername,
          password: data.password
        });
        router.push('/dashboard');
      } catch (fallbackError) {
        const message = fallbackError instanceof Error ? fallbackError.message : 'Login failed';
        setErrorMessage(message);

        // Check for lockout indicators in error message
        if (message.toLowerCase().includes('locked') ||
          message.toLowerCase().includes('suspended') ||
          message.toLowerCase().includes('multiple failed')) {

          // Try to get actual lockout status
          try {
            const lockoutStatus = await enhancedAuthService.getAccountLockoutStatus(data.emailOrUsername);
            if (lockoutStatus) {
              setLockoutInfo(lockoutStatus);
              setActiveTab('unlock');
            }
          } catch (lockoutError) {
            console.warn('Could not fetch lockout status:', lockoutError);
            // Create mock lockout info for UI
            const mockLockout: AccountLockoutStatus = {
              isLocked: true,
              lockReason: LockReason.FAILED_LOGIN,
              lockExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              attemptsRemaining: 0,
              canUnlock: true,
              unlockMethods: [{
                method: 'email_verification',
                available: true,
                description: 'Request unlock via email',
                estimatedTime: '5 minutes'
              }],
              securityContact: null
            };
            setLockoutInfo(mockLockout);
            setActiveTab('unlock');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Account unlock request
  const handleUnlockRequest = async (method: string) => {
    if (!lockoutInfo) return;

    try {
      setIsLoading(true);
      const email = form.getValues('emailOrUsername');

      await enhancedAuthService.requestAccountUnlock(email, method);

      setSecurityAlert({
        type: 'policy_change',
        severity: SecurityLevel.MEDIUM,
        message: `Unlock request sent via ${method}. Please check your email.`,
        dismissible: true,
        actionRequired: false,
        actionUrl: null
      });

    } catch (error) {
      console.error('Error requesting unlock:', error);
      setErrorMessage('Failed to request account unlock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Device Recognition Display Component
  const DeviceRecognitionDisplay = () => {
    if (isCheckingDevice) {
      return (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Monitor className="h-4 w-4 text-blue-600 animate-pulse" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Analyzing device security...
          </AlertDescription>
        </Alert>
      );
    }

    if (deviceRecognition?.isRecognized) {
      return (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between">
              <div>
                <strong className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  Trusted Device
                </strong>
                <div className="text-xs mt-1 flex items-center gap-2">
                  {deviceRecognition.lastSeenLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {deviceRecognition.lastSeenLocation}
                    </span>
                  )}
                  {deviceRecognition.lastSeenAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(deviceRecognition.lastSeenAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-green-700">
                Risk: {deviceRecognition.riskScore}/100
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (deviceRecognition && !deviceRecognition.isRecognized) {
      const riskLevel = deviceRecognition.riskScore > 70 ? 'high' :
        deviceRecognition.riskScore > 40 ? 'medium' : 'low';
      const riskColor = riskLevel === 'high' ? 'red' :
        riskLevel === 'medium' ? 'amber' : 'blue';

      return (
        <Alert className={`border-${riskColor}-200 bg-${riskColor}-50 dark:bg-${riskColor}-950/20`}>
          <AlertTriangle className={`h-4 w-4 text-${riskColor}-600`} />
          <AlertDescription className={`text-${riskColor}-800 dark:text-${riskColor}-200`}>
            <div className="flex items-center justify-between">
              <div>
                <strong className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  New Device Detected
                </strong>
                <div className="text-xs mt-1">
                  Additional verification may be required for security.
                </div>
              </div>
              <Badge variant="outline" className={`text-${riskColor}-700`}>
                Risk: {deviceRecognition.riskScore}/100
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
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

    const getAlertIcon = (type: string) => {
      switch (type) {
        case 'new_device': return <Monitor className="h-4 w-4" />;
        case 'new_location': return <Globe className="h-4 w-4" />;
        case 'suspicious_activity': return <Shield className="h-4 w-4" />;
        default: return <AlertTriangle className="h-4 w-4" />;
      }
    };

    return (
      <Alert className={getAlertStyle(securityAlert.severity)}>
        {getAlertIcon(securityAlert.type)}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Security Alert</strong>
              <div className="text-sm mt-1">{securityAlert.message}</div>
            </div>
            <div className="flex gap-2">
              {securityAlert.actionUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={securityAlert.actionUrl}>
                    Review
                  </Link>
                </Button>
              )}
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
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Account Lockout Display Component
  const AccountLockoutDisplay = () => {
    if (!lockoutInfo || !lockoutInfo.isLocked) return null;

    const formatTime = (dateString: string | null) => {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      const minutes = Math.ceil(diff / 60000);

      if (minutes <= 0) return 'Expired';
      if (minutes < 60) return `${minutes} minutes`;
      const hours = Math.ceil(minutes / 60);
      return `${hours} hours`;
    };

    const getLockReasonText = (reason: string) => {
      switch (reason) {
        case 'FAILED_LOGIN': return 'Multiple failed login attempts';
        case 'SUSPICIOUS_ACTIVITY': return 'Suspicious activity detected';
        case 'ADMIN_ACTION': return 'Administrative action';
        case 'POLICY_VIOLATION': return 'Policy violation';
        case 'MFA_FAILURES': return 'Multi-factor authentication failures';
        default: return 'Security concern';
      }
    };

    return (
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-2">
              <div>
                <strong>Account Temporarily Locked</strong>
                <div className="text-sm mt-1">
                  {getLockReasonText(lockoutInfo.lockReason)}
                </div>
              </div>

              {lockoutInfo.lockExpiry && (
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="h-3 w-3" />
                  <span>Unlocks in: {formatTime(lockoutInfo.lockExpiry)}</span>
                </div>
              )}

              {lockoutInfo.attemptsRemaining > 0 && (
                <div className="text-sm">
                  Attempts remaining: {lockoutInfo.attemptsRemaining}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {lockoutInfo.canUnlock && lockoutInfo.unlockMethods.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                Unlock Your Account
              </CardTitle>
              <CardDescription className="text-xs">
                Choose a method to regain access to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lockoutInfo.unlockMethods
                .filter(method => method.available)
                .map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {method.method === 'email_verification' && <Mail className="h-4 w-4 text-blue-600" />}
                      {method.method === 'security_questions' && <HelpCircle className="h-4 w-4 text-green-600" />}
                      {method.method === 'admin_approval' && <Shield className="h-4 w-4 text-purple-600" />}
                      {method.method === 'time_based' && <Timer className="h-4 w-4 text-orange-600" />}

                      <div>
                        <div className="font-medium text-sm">{method.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Estimated time: {method.estimatedTime}
                        </div>
                      </div>
                    </div>

                    {method.method !== 'time_based' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlockRequest(method.method)}
                        disabled={isLoading}
                      >
                        {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Request'}
                      </Button>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {lockoutInfo.securityContact && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Need Help?</strong>
              <div className="text-sm mt-1">
                Contact security support: {lockoutInfo.securityContact}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
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

    const getStrengthText = (level: string) => {
      switch (level) {
        case 'excellent': return 'Excellent password strength';
        case 'strong': return 'Strong password';
        case 'good': return 'Good password';
        case 'fair': return 'Fair password';
        case 'weak': return 'Weak password';
        default: return 'Password strength unknown';
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Password Strength</span>
          <Badge variant="outline" className={`text-xs ${passwordStrength.score > 80 ? 'text-green-700' : passwordStrength.score > 60 ? 'text-blue-700' : 'text-orange-700'}`}>
            {passwordStrength.score}/100
          </Badge>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.level)}`}
            style={{ width: `${passwordStrength.score}%` }}
          ></div>
        </div>

        <div className="text-xs text-muted-foreground">
          {getStrengthText(passwordStrength.level)}
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

  return (
    <div className="space-y-6">
      {/* Main Authentication Card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskTracker
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your family task management account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'unlock')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="unlock" disabled={!lockoutInfo} className="flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                Unlock Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {/* Device Recognition Status */}
              {showDeviceRecognition && <DeviceRecognitionDisplay />}

              {/* Security Alert */}
              <SecurityAlertDisplay />

              {/* Login Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailOrUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter your email or username"
                            autoComplete="username"
                            disabled={isLoading}
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={isLoading}
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
                              disabled={isLoading}
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

                        {/* Real-time password strength indicator */}
                        {field.value && field.value.length > 0 && (
                          <PasswordStrengthDisplay />
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Enhanced Device Options */}
                  {showDeviceRecognition && (
                    <div className="space-y-3">
                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="trustDevice"
                            checked={trustThisDevice}
                            onCheckedChange={(checked) => {
                              setTrustThisDevice(checked as boolean);
                              form.setValue('trustDevice', checked as boolean);
                            }}
                            disabled={isLoading}
                          />
                          <label
                            htmlFor="trustDevice"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Trust this device
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rememberDevice"
                            checked={rememberThisDevice}
                            onCheckedChange={(checked) => {
                              setRememberThisDevice(checked as boolean);
                              form.setValue('rememberDevice', checked as boolean);
                            }}
                            disabled={isLoading}
                          />
                          <label
                            htmlFor="rememberDevice"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                          >
                            <Monitor className="h-3 w-3" />
                            Remember this device
                          </label>
                        </div>
                      </div>

                      {(trustThisDevice || rememberThisDevice) && (
                        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                          <Wifi className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                            Device settings will improve your login experience while maintaining security.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isCheckingDevice}
                  >
                    {isLoading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="unlock" className="space-y-4">
              <AccountLockoutDisplay />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="flex items-center justify-between w-full text-sm">
            <Button variant="link" size="sm" asChild>
              <Link href="/auth/forgot-password">
                Forgot password?
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            >
              <Shield className="h-3 w-3 mr-1" />
              Security Info
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" size="sm" asChild>
              <Link href="/auth/register">
                Sign up
              </Link>
            </Button>
          </div>

          {showSecurityInfo && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 mt-4">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                <div className="space-y-1">
                  <div><strong>Enhanced Security Features:</strong></div>
                  <div>• Device recognition and fingerprinting</div>
                  <div>• Real-time security monitoring</div>
                  <div>• Advanced password breach detection</div>
                  <div>• Family-safe authentication controls</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>

      {/* Enhanced Features Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Enhanced Security</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <Monitor className="h-6 w-6 mx-auto mb-2 text-green-600" />
          <div className="text-xs font-medium text-green-700 dark:text-green-300">Device Trust</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-600" />
          <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Smart Login</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
          <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Family Safe</div>
        </div>
      </div>
    </div>
  );
}; 