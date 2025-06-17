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
  Wifi,
  Star,
  User
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
        <Alert className="border-blue-800 bg-blue-950/50 shadow-lg">
          <Monitor className="h-4 w-4 text-blue-400 animate-pulse" />
          <AlertDescription className="text-blue-200 flex items-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Analyzing device security...
          </AlertDescription>
        </Alert>
      );
    }

    if (deviceRecognition?.isRecognized) {
      return (
        <Alert className="border-green-800 bg-green-950/50 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            <div className="flex items-center justify-between">
              <div>
                <strong className="flex items-center gap-2 text-base font-semibold">
                  <UserCheck className="h-4 w-4" />
                  Trusted Device
                </strong>
                <div className="text-sm mt-2 flex items-center gap-3 font-medium">
                  {deviceRecognition.lastSeenLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {deviceRecognition.lastSeenLocation}
                    </span>
                  )}
                  {deviceRecognition.lastSeenAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(deviceRecognition.lastSeenAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-green-300 border-green-600 bg-green-900/50 font-semibold">
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
        <Alert className={`border-${riskColor}-800 bg-${riskColor}-950/50 shadow-lg`}>
          <AlertTriangle className={`h-4 w-4 text-${riskColor}-400`} />
          <AlertDescription className={`text-${riskColor}-200`}>
            <div className="flex items-center justify-between">
              <div>
                <strong className="flex items-center gap-2 text-base font-semibold">
                  <Monitor className="h-4 w-4" />
                  New Device Detected
                </strong>
                <div className="text-sm mt-2 font-medium">
                  Additional verification may be required for security.
                </div>
              </div>
              <Badge variant="outline" className={`text-${riskColor}-300 border-${riskColor}-600 bg-${riskColor}-900/50 font-semibold`}>
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
        case 'critical': return 'border-red-800 bg-red-950/50 text-red-200 shadow-lg';
        case 'high': return 'border-orange-800 bg-orange-950/50 text-orange-200 shadow-lg';
        case 'medium': return 'border-amber-800 bg-amber-950/50 text-amber-200 shadow-lg';
        default: return 'border-blue-800 bg-blue-950/50 text-blue-200 shadow-lg';
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
      <div className="space-y-6">
        {/* Enhanced Security Alert */}
        <Alert className="border-red-800 bg-red-950/50 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-900/50 rounded-lg">
              <Lock className="h-6 w-6 text-red-400" />
            </div>
            <AlertDescription className="text-red-200 flex-1">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-red-100 mb-2">Account Temporarily Locked</h3>
                  <p className="text-sm font-medium text-red-300">
                    {getLockReasonText(lockoutInfo.lockReason)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {lockoutInfo.lockExpiry && (
                    <div className="flex items-center gap-2 text-sm bg-red-900/30 rounded-lg p-3">
                      <Timer className="h-4 w-4 text-red-400" />
                      <div>
                        <div className="font-semibold text-red-200">Auto-unlock in:</div>
                        <div className="text-red-300">{formatTime(lockoutInfo.lockExpiry)}</div>
                      </div>
                    </div>
                  )}

                  {lockoutInfo.attemptsRemaining > 0 && (
                    <div className="flex items-center gap-2 text-sm bg-red-900/30 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <div>
                        <div className="font-semibold text-red-200">Attempts left:</div>
                        <div className="text-red-300">{lockoutInfo.attemptsRemaining}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </div>
        </Alert>

        {/* Enterprise Unlock Options */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Unlock className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white">
                Unlock Your Account
              </CardTitle>
            </div>
            <CardDescription className="text-gray-400 text-base">
              Choose a secure method to regain access to your family hub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Email Unlock Option */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-700/50 rounded-xl p-4 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-100 mb-1">Email Verification</h3>
                    <p className="text-sm text-blue-300 font-medium">Send unlock code to your registered email</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-300 font-semibold">Recommended • 2-3 minutes</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleUnlockRequest('email_verification')}
                  disabled={isLoading}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Send Code</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Other Unlock Methods */}
            {lockoutInfo.canUnlock && lockoutInfo.unlockMethods.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span>Other Options</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>
                {lockoutInfo.unlockMethods
                  .filter(method => method.available && method.method !== 'email_verification')
                  .map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-600 rounded-lg">
                          {method.method === 'security_questions' && <HelpCircle className="h-5 w-5 text-green-400" />}
                          {method.method === 'admin_approval' && <Shield className="h-5 w-5 text-purple-400" />}
                          {method.method === 'time_based' && <Timer className="h-5 w-5 text-orange-400" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-base">{method.description}</div>
                          <div className="text-sm text-gray-400 font-medium">
                            Estimated time: {method.estimatedTime}
                          </div>
                        </div>
                      </div>

                      {method.method !== 'time_based' && (
                        <Button
                          variant="outline"
                          onClick={() => handleUnlockRequest(method.method)}
                          disabled={isLoading}
                          className="h-10 px-4 border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white font-semibold rounded-lg transition-all duration-300"
                        >
                          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Request'}
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enterprise Security Support */}
        <Alert className="border-indigo-800 bg-indigo-950/50 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-900/50 rounded-lg">
              <HelpCircle className="h-5 w-5 text-indigo-400" />
            </div>
            <AlertDescription className="text-indigo-200 flex-1">
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-indigo-100 mb-1">Need Additional Help?</h3>
                  <p className="text-sm text-indigo-300 font-medium">
                    Our security team is available 24/7 to assist with account recovery
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-indigo-900/30 rounded-lg p-3">
                  <Mail className="h-4 w-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-indigo-200 text-sm">Security Support:</div>
                    <div className="text-indigo-300 font-medium">{lockoutInfo.securityContact || 'security@tasktracker.com'}</div>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </div>
        </Alert>
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
    <div className="min-h-screen flex bg-gray-900">
      {/* Left Side - Enterprise Gamification Content */}
      <div className="hidden lg:flex lg:w-1/2  relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-32 left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-indigo-300/15 rounded-full blur-2xl animate-bounce delay-300"></div>
        </div>

        {/* Enterprise gamification decorative lines */}
                  <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60 animate-pulse delay-200"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-80 animate-pulse delay-800"></div>
            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70 animate-pulse delay-1200"></div>
            
            {/* Vertical enterprise lines */}
            <div className="absolute left-1/3 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-purple-300 to-transparent opacity-50 animate-pulse delay-900"></div>
            <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-60 animate-pulse delay-400"></div>
          </div>

        {/* Enterprise content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              TaskTracker
            </div>
          </div>

                    <h1 className="text-4xl xl:text-5xl font-black mb-6 leading-tight">
            Welcome Back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200">
              Your Family Hub
            </span>
          </h1>
          
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Continue your productivity journey with enterprise-grade family task management and gamification.
          </p>

          {/* Enterprise gamification features */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
              <span className="text-purple-100">Advanced family collaboration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-200"></div>
              <span className="text-purple-100">Enterprise gamification system</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-500"></div>
              <span className="text-purple-100">Real-time achievement tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-700"></div>
              <span className="text-purple-100">Secure family data protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-900">
        <Card className="w-full max-w-lg bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-8 pt-10 px-6">
            {/* Sleek icon with glow effect */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                  <LogIn className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
              </div>
            </div>

            {/* Refined typography */}
            <CardTitle className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </CardTitle>
            
            <CardDescription className="text-gray-400 text-lg mb-6">
              Continue your family productivity journey
            </CardDescription>

            {/* Enterprise gamification badges */}
            <div className="flex justify-center gap-3 mb-4">
              <div className="group flex items-center gap-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Star className="h-4 w-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-300">Level Up</span>
              </div>
              <div className="group flex items-center gap-2 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/30 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Shield className="h-4 w-4 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-300">Secure</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'unlock')}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="login" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="unlock" disabled={!lockoutInfo} className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-semibold text-base flex items-center gap-3">
                            <div className="p-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            Email or Username
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter your email or username"
                                autoComplete="username"
                                disabled={isLoading}
                                className="h-14 text-lg bg-gray-700 border-2 border-gray-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl text-white font-medium group-hover:border-purple-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-sm font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-semibold text-base flex items-center gap-3">
                            <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                              <Lock className="h-4 w-4 text-white" />
                            </div>
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={isLoading}
                                className="h-14 text-lg bg-gray-700 border-2 border-gray-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl pr-14 text-white font-medium group-hover:border-blue-300"
                                onChange={(e) => {
                                  field.onChange(e);
                                  handlePasswordChange(e.target.value);
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-blue-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-blue-400 transition-colors" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400 hover:text-blue-400 transition-colors" />
                                )}
                              </Button>
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-sm font-medium" />

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
                          <Alert className="border-blue-700/30 bg-blue-950/20">
                            <Wifi className="h-4 w-4 text-blue-400" />
                            <AlertDescription className="text-blue-200 text-xs">
                              Device settings will improve your login experience while maintaining security.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                      <Alert className="border-red-800 bg-red-950/50 shadow-lg">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-200 font-medium text-sm">
                          {errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                      disabled={isLoading || isCheckingDevice}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="font-semibold">Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="font-semibold">Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="unlock" className="space-y-4">
                <AccountLockoutDisplay />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="flex items-center justify-between w-full text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                className="text-gray-400 hover:text-gray-300"
              >
                <Shield className="h-3 w-3 mr-1" />
                Security Info
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
              >
                Sign up for free
              </Link>
            </div>

            {showSecurityInfo && (
              <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 mt-4">
                <Shield className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 dark:text-purple-200 text-xs">
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
      </div>
    </div>
  );
}; 