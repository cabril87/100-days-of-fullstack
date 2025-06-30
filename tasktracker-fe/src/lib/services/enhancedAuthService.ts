/*
 * Enhanced Authentication Service - Advanced UX Features
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { 
  PasswordResetFlowState, 
  PasswordStrengthIndicator, 
  AccountLockoutStatus,
  SessionManagementDashboard,
  LoginAttemptResult,
  DeviceRecognition,
  PermissionMatrix,
  SecurityAlert,
  LockReason
} from '../types/enhanced-auth';
import { SecurityLevel } from '../types/session-management';
import { 
  EnhancedPasswordResetRequestFormData,
  SecurityQuestionFormData,
  DeviceTrustFormData,
  SessionTerminateFormData,
  SecuritySettingsFormData,
  validatePasswordStrength
} from '../schemas/enhanced-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  
  public static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  // === ENHANCED PASSWORD RESET FLOW WITH SECURITY QUESTIONS ===

  async initiatePasswordReset(data: EnhancedPasswordResetRequestFormData): Promise<PasswordResetFlowState> {
    try {
      console.log('🔐 Initiating password reset for email:', data.email);

      // If security questions are provided, try to verify them first
      if (data.securityQuestion && data.securityAnswer) {
        console.log('🔐 Security questions provided, attempting verification...');
        
        // First, get user's security questions to find the matching one
        const securityQuestions = await this.getSecurityQuestionsByEmail(data.email);
        
        if (!securityQuestions.hasQuestionsSetup) {
          return {
            step: 'request',
            email: data.email,
            token: null,
            isLoading: false,
            error: 'No security questions are set up for this account. Please use email verification instead.',
            expiresAt: null,
            attemptsRemaining: 3,
          };
        }

        // Find the matching question and get its order
        const matchingQuestion = securityQuestions.questions.find(
          q => q.question === data.securityQuestion
        );

        if (!matchingQuestion) {
          return {
            step: 'request',
            email: data.email,
            token: null,
            isLoading: false,
            error: 'Selected security question does not match your setup. Please try a different approach.',
            expiresAt: null,
            attemptsRemaining: 3,
          };
        }

        // For simplicity, we'll assume the user answers all three questions
        // In a full implementation, you'd want to present all questions to the user
        const dummyAnswers = ['', '', ''];
        dummyAnswers[matchingQuestion.questionOrder - 1] = data.securityAnswer;

        // Verify the security answer
        const verificationResult = await this.verifySecurityAnswers(
          data.email,
          dummyAnswers[0] || 'dummy',
          dummyAnswers[1] || 'dummy', 
          dummyAnswers[2] || 'dummy'
        );

        if (verificationResult.isVerified && verificationResult.verificationToken) {
          console.log('✅ Security questions verified, password reset token generated');
          return {
            step: 'reset',
            email: data.email,
            token: verificationResult.verificationToken,
            isLoading: false,
            error: null,
            expiresAt: verificationResult.tokenExpiration || null,
            attemptsRemaining: 3,
          };
        } else {
          return {
            step: 'request',
            email: data.email,
            token: null,
            isLoading: false,
            error: verificationResult.errorMessage || 'Security question verification failed. Please check your answer.',
            expiresAt: null,
            attemptsRemaining: 2,
          };
        }
      }

      // Fallback to traditional email-based password reset
      console.log('🔐 Using traditional email-based password reset...');
      
      // For now, simulate traditional password reset flow
      // In a real implementation, you'd call your existing password reset API
      return {
        step: 'verification',
        email: data.email,
        token: null,
        isLoading: false,
        error: null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        attemptsRemaining: 3,
      };

    } catch (error) {
      console.error('❌ Password reset initiation failed:', error);
      return {
        step: 'request',
        email: data.email || null,
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initiate password reset',
        expiresAt: null,
        attemptsRemaining: 3,
      };
    }
  }

  async verifyResetToken(token: string): Promise<{ isValid: boolean; email: string | null }> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/password-reset/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return { isValid: false, email: null };
    }

    const result = await response.json();
    return { isValid: true, email: result.email };
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/password-reset/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // === PASSWORD STRENGTH VALIDATION ===

  validatePasswordStrength(password: string): PasswordStrengthIndicator {
    return validatePasswordStrength(password);
  }

  async checkPasswordCompromised(password: string): Promise<boolean> {
    // Use HaveIBeenPwned API or similar service
    const hash = await this.sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    try {
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();
      
      return data.toLowerCase().includes(suffix.toLowerCase());
    } catch {
      // If service is unavailable, don't block the user
      return false;
    }
  }

  private async sha1Hash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // === ACCOUNT LOCKOUT MANAGEMENT ===

  async getAccountLockoutStatus(email: string): Promise<AccountLockoutStatus | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/security-monitoring/failed-logins/lockout-status?emailOrUsername=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null; // Account not locked
      }

      if (!response.ok) {
        throw new Error('Failed to get lockout status');
      }

      const result = await response.json();
      // The API returns data in a wrapper, so we need to access the data property
      const statusData = result.data || result;
      return statusData;
    } catch (error) {
      console.error('Error getting account lockout status:', error);
      return null;
    }
  }

  async requestAccountUnlock(email: string, method: string, additionalData?: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/unlock-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        method,
        ...additionalData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request account unlock');
    }
  }

  // === ENHANCED SESSION MANAGEMENT ===

  async getSessionManagementDashboard(): Promise<SessionManagementDashboard> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/auth/sessions/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get session dashboard');
    }

    return await response.json();
  }

  async terminateSession(data: SessionTerminateFormData): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/auth/sessions/${data.sessionId}/terminate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: data.reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to terminate session');
    }
  }

  async updateDeviceTrust(data: DeviceTrustFormData): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/auth/devices/${data.deviceId}/trust`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update device trust');
    }
  }

  async updateSecuritySettings(data: SecuritySettingsFormData): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/auth/security-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update security settings');
    }
  }

  // === DEVICE RECOGNITION ===

  generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled,
      typeof navigator.doNotTrack,
      canvas.toDataURL(),
    ].join('|');

    return btoa(fingerprint).substring(0, 32);
  }

  async checkDeviceRecognition(deviceFingerprint: string): Promise<DeviceRecognition> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/device-recognition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceFingerprint }),
      });

      if (!response.ok) {
        // If service is unavailable (404), assume device is not recognized
        // This is expected behavior when the endpoint isn't implemented yet
        console.log('📱 Device recognition service unavailable - treating as new device');
        return {
          isRecognized: false,
          deviceFingerprint,
          lastSeenLocation: null,
          lastSeenAt: null,
          riskScore: 50,
          requiresVerification: true,
        };
      }

      return await response.json();
    } catch {
      console.log('📱 Device recognition check failed - treating as new device');
      return {
        isRecognized: false,
        deviceFingerprint,
        lastSeenLocation: null,
        lastSeenAt: null,
        riskScore: 50,
        requiresVerification: true,
      };
    }
  }

  // === ENHANCED LOGIN FLOW ===

  async enhancedLogin(
    credentials: { emailOrUsername: string; password: string },
    deviceInfo: { fingerprint: string; trustDevice: boolean; rememberDevice: boolean }
  ): Promise<LoginAttemptResult> {
    // Check device recognition (gracefully handle if endpoint doesn't exist)
    const deviceRecognition = await this.checkDeviceRecognition(deviceInfo.fingerprint);
    
    // Attempt login
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        deviceFingerprint: deviceInfo.fingerprint,
        trustDevice: deviceInfo.trustDevice,
        rememberDevice: deviceInfo.rememberDevice,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Check if this is a lockout response
      const isLockout = response.status === 401 && result.message?.includes('locked');
      
      return {
        success: false,
        requiresMfa: false,
        requiresVerification: false,
        lockoutInfo: isLockout ? {
          isLocked: true,
          lockReason: LockReason.FAILED_LOGIN,
          lockExpiry: null,
          attemptsRemaining: 0,
          canUnlock: true,
          unlockMethods: [],
          securityContact: null,
        } : null,
        securityAlert: result.securityAlert || null,
        redirectTo: null,
        sessionCreated: false,
      };
    }

    // Store authentication tokens
    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
    }
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    // Generate security alerts for new devices/locations
    let securityAlert: SecurityAlert | null = null;
    if (!deviceRecognition.isRecognized) {
      securityAlert = {
        type: 'new_device',
        severity: SecurityLevel.MEDIUM,
        message: 'Login from a new device detected. If this was not you, please secure your account immediately.',
        dismissible: true,
        actionRequired: false,
        actionUrl: '/settings/security',
      };
    }

    return {
      success: true,
      requiresMfa: result.requiresMfa || false,
      requiresVerification: result.requiresVerification || false,
      lockoutInfo: null,
      securityAlert,
      redirectTo: result.redirectTo || '/dashboard',
      sessionCreated: true,
    };
  }

  // === PERMISSION MATRIX MANAGEMENT ===

  async getUserPermissionMatrix(userId: number, familyId?: number): Promise<PermissionMatrix> {
    const token = localStorage.getItem('accessToken');
    const url = new URL(`${API_BASE_URL}/v1/auth/permissions/${userId}`);
    if (familyId) {
      url.searchParams.append('familyId', familyId.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get permission matrix');
    }

    return await response.json();
  }

  async updateUserPermissions(
    userId: number,
    changes: Array<{ permission: string; action: 'grant' | 'revoke' | 'modify'; reason: string }>,
    familyId?: number
  ): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/auth/permissions/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changes,
        familyId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update permissions');
    }
  }

  // === SECURITY QUESTIONS MANAGEMENT ===

  async setupSecurityQuestions(data: SecurityQuestionFormData): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/setup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to setup security questions');
    }
  }

  async getMySecurityQuestions(): Promise<{
    questions: Array<{
      id: number;
      question: string;
      questionOrder: number;
      isAgeAppropriate: boolean;
      createdAt: string;
      lastUsedAt?: string;
    }>;
    hasQuestionsSetup: boolean;
    questionCount: number;
  }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/my-questions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get security questions');
    }

    return await response.json();
  }

  async getSecurityQuestionsByEmail(email: string): Promise<{
    questions: Array<{
      id: number;
      question: string;
      questionOrder: number;
      isAgeAppropriate: boolean;
      createdAt: string;
      lastUsedAt?: string;
    }>;
    hasQuestionsSetup: boolean;
    questionCount: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/by-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch security questions by email');
    }

    return await response.json();
  }

  async verifySecurityAnswers(email: string, answer1: string, answer2: string, answer3: string): Promise<{
    isVerified: boolean;
    correctAnswers: number;
    totalQuestions: number;
    verificationToken?: string;
    tokenExpiration?: string;
    errorMessage?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        answer1,
        answer2,
        answer3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        isVerified: false,
        correctAnswers: 0,
        totalQuestions: 3,
        errorMessage: error.message || 'Failed to verify security answers',
      };
    }

    return await response.json();
  }

  async updateSecurityQuestions(data: Partial<SecurityQuestionFormData>): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update security questions');
    }
  }

  async deleteAllSecurityQuestions(): Promise<{ deletedCount: number }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/delete-all`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete security questions');
    }

    return await response.json();
  }

  async hasSecurityQuestions(): Promise<{ hasQuestions: boolean; userId: number }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/has-questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check security questions status');
    }

    return await response.json();
  }

  async getAgeAppropriateQuestions(ageGroup: string, count: number = 10, categories?: string[]): Promise<Array<{
    question: string;
    minimumAgeGroup: string;
    category: string;
    exampleFormat: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/age-appropriate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ageGroup,
        requestedCount: count,
        categories: categories || [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch age-appropriate questions');
    }

    return await response.json();
  }

  async getSecurityQuestionStats(): Promise<{
    totalQuestions: number;
    lastUsedDaysAgo: number;
    totalUsageCount: number;
    userId: number;
  }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch security question stats');
    }

    return await response.json();
  }

  async validatePasswordResetToken(token: string): Promise<{
    isValid: boolean;
    userId?: number;
    message?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/v1/SecurityQuestion/validate-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { isValid: false, message: 'Invalid or expired token' };
    }

    return await response.json();
  }


}

export const enhancedAuthService = EnhancedAuthService.getInstance(); 