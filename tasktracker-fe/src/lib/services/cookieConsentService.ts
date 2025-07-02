/*
 * Enterprise Cookie Consent Service
 * Copyright (c) 2025 Carlos Abril Jr
 * GDPR/CCPA compliant cookie management
 */

import { 
  CookieConsentState, 
  CookieConsentPreferences,
  CookieAuditLog,
  CookieComplianceSettings 
} from '../types/system';

class CookieConsentService {
  private readonly CONSENT_KEY = 'tasktracker_cookie_consent';
  private readonly AUDIT_KEY = 'tasktracker_cookie_audit';
  private readonly CONSENT_VERSION = '1.0.0';
  private readonly DEFAULT_EXPIRY_DAYS = 365;

  private readonly complianceSettings: CookieComplianceSettings = {
    enableGDPR: true,
    enableCCPA: true,
    consentExpiryDays: 365,
    requireExplicitConsent: true,
    enableAuditLogging: true,
    enableConsentWithdrawal: true
  };

  /**
   * Check if user needs to provide cookie consent
   */
  needsConsent(): boolean {
    const consent = this.getConsent();
    
    if (!consent) return true;
    
    // Check if consent has expired
    const consentDate = new Date(consent.timestamp);
    const expiryDate = new Date(consentDate.getTime() + (this.complianceSettings.consentExpiryDays * 24 * 60 * 60 * 1000));
    const now = new Date();
    
    if (now > expiryDate) {
      console.log('🍪 Cookie consent expired, prompting for renewal');
      return true;
    }
    
    // Check if consent version has changed
    if (consent.version !== this.CONSENT_VERSION) {
      console.log('🍪 Cookie consent version outdated, prompting for update');
      return true;
    }
    
    return false;
  }

  /**
   * Get current cookie consent state
   */
  getConsent(): CookieConsentState | null {
    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      if (!stored) return null;
      
      const consent = JSON.parse(stored) as CookieConsentState;
      return consent;
    } catch (error) {
      console.error('🍪 Failed to parse cookie consent:', error);
      return null;
    }
  }

  /**
   * Set cookie consent preferences
   */
  setConsent(preferences: CookieConsentPreferences): void {
    const consentState: CookieConsentState = {
      hasChoiceMade: true,
      timestamp: new Date().toISOString(),
      version: this.CONSENT_VERSION,
      preferences: {
        necessary: true, // Always required
        functional: preferences.functional,
        analytics: preferences.analytics,
        marketing: preferences.marketing
      },
      userAgent: navigator.userAgent
    };

    // Store consent
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentState));

    // Set consent cookies for backend
    this.setConsentCookies(consentState.preferences);

    // Log for compliance audit
    if (this.complianceSettings.enableAuditLogging) {
      this.logConsentAction('consent_given', consentState.preferences);
    }

    console.log('🍪 Cookie consent saved:', consentState.preferences);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { 
      detail: consentState.preferences 
    }));
  }

  /**
   * Check if user has consented to a specific cookie category
   */
  hasConsent(category: keyof CookieConsentPreferences): boolean {
    const consent = this.getConsent();
    if (!consent) return false;
    
    // Necessary cookies are always allowed
    if (category === 'necessary') return true;
    
    return consent.preferences[category] === true;
  }

  /**
   * Check if functional cookies (device tracking) are enabled
   */
  hasFunctionalConsent(): boolean {
    return this.hasConsent('functional');
  }

  /**
   * Check if analytics cookies are enabled
   */
  hasAnalyticsConsent(): boolean {
    return this.hasConsent('analytics');
  }

  /**
   * Check if marketing cookies are enabled
   */
  hasMarketingConsent(): boolean {
    return this.hasConsent('marketing');
  }

  /**
   * Reset cookie consent (for testing or user withdrawal)
   */
  resetConsent(): void {
    const currentConsent = this.getConsent();
    
    if (currentConsent && this.complianceSettings.enableAuditLogging) {
      this.logConsentAction('consent_withdrawn', currentConsent.preferences);
    }

    localStorage.removeItem(this.CONSENT_KEY);
    this.clearConsentCookies();
    
    console.log('🍪 Cookie consent reset');
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('cookie-consent-reset'));
  }

  /**
   * Get default cookie preferences for new users
   */
  getDefaultPreferences(): CookieConsentPreferences {
    return {
      necessary: true,
      functional: false,  // Require explicit opt-in for device tracking
      analytics: false,   // Require explicit opt-in
      marketing: false    // Require explicit opt-in
    };
  }

  /**
   * Get enterprise-recommended preferences
   */
  getRecommendedPreferences(): CookieConsentPreferences {
    return {
      necessary: true,
      functional: true,   // Recommended for device trust and security
      analytics: true,    // Recommended for performance monitoring
      marketing: false    // Optional for personalization
    };
  }

  /**
   * Set consent cookies that backend can read
   */
  private setConsentCookies(preferences: CookieConsentPreferences): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + this.complianceSettings.consentExpiryDays);
    
    const cookieOptions = `expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
    
    // Set individual consent cookies
    document.cookie = `cookie_consent_necessary=true; ${cookieOptions}`;
    document.cookie = `cookie_consent_functional=${preferences.functional}; ${cookieOptions}`;
    document.cookie = `cookie_consent_analytics=${preferences.analytics}; ${cookieOptions}`;
    document.cookie = `cookie_consent_marketing=${preferences.marketing}; ${cookieOptions}`;
    
    // Set master consent cookie
    document.cookie = `cookie_consent_version=${this.CONSENT_VERSION}; ${cookieOptions}`;
  }

  /**
   * Clear all consent cookies
   */
  private clearConsentCookies(): void {
    const pastDate = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    
    document.cookie = `cookie_consent_necessary=; ${pastDate}`;
    document.cookie = `cookie_consent_functional=; ${pastDate}`;
    document.cookie = `cookie_consent_analytics=; ${pastDate}`;
    document.cookie = `cookie_consent_marketing=; ${pastDate}`;
    document.cookie = `cookie_consent_version=; ${pastDate}`;
  }

  /**
   * Log consent action for compliance audit
   */
  private logConsentAction(
    action: CookieAuditLog['action'], 
    preferences: CookieConsentPreferences
  ): void {
    try {
      const auditLog: CookieAuditLog = {
        timestamp: new Date().toISOString(),
        action,
        preferences,
        userAgent: navigator.userAgent,
        version: this.CONSENT_VERSION
      };

      // Get existing audit logs
      const existingLogs = localStorage.getItem(this.AUDIT_KEY);
      const logs: CookieAuditLog[] = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Add new log
      logs.push(auditLog);
      
      // Keep only last 100 entries for storage efficiency
      const recentLogs = logs.slice(-100);
      
      localStorage.setItem(this.AUDIT_KEY, JSON.stringify(recentLogs));
      
      console.log('🍪 Cookie consent audit logged:', action);
    } catch (error) {
      console.error('🍪 Failed to log consent audit:', error);
    }
  }

  /**
   * Get audit logs for compliance reporting
   */
  getAuditLogs(): CookieAuditLog[] {
    try {
      const stored = localStorage.getItem(this.AUDIT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('🍪 Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Check if user is in EU (simplified check for GDPR)
   */
  isEUUser(): boolean {
    // This is a simplified check - in production, use proper geolocation
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = ['Europe/', 'GMT', 'UTC'];
    return euTimezones.some(tz => timezone.includes(tz));
  }

  /**
   * Generate device fingerprint for tracking (only if functional consent given)
   */
  generateDeviceFingerprint(): string | null {
    if (!this.hasFunctionalConsent()) {
      console.log('🍪 Device fingerprinting blocked - no functional consent');
      return null;
    }

    // Generate basic device fingerprint
    const components = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      navigator.language,
      navigator.platform,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ];

    // Simple hash function
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const fingerprint = Math.abs(hash).toString(36);
    console.log('🔍 Device fingerprint generated:', fingerprint);
    return fingerprint;
  }
}

// Singleton instance
export const cookieConsentService = new CookieConsentService();

// Export for testing
export { CookieConsentService }; 
