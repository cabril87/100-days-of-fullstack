/**
 * Stage Configuration and Feature Flags
 * Controls what features are available in each stage of development
 */

export type AppStage = 'development' | 'alpha' | 'beta' | 'staging' | 'production';

export interface StageConfig {
  stage: AppStage;
  enableRegistration: boolean;
  enablePublicPages: boolean;
  enableBlog: boolean;
  enableContactForm: boolean;
  enablePayments: boolean;
  enableLiveChat: boolean;
  enableAnalytics: boolean;
  showComingSoon: boolean;
  debugMode: boolean;
}

/**
 * Get the current app stage from environment variables
 */
export function getCurrentStage(): AppStage {
  const stage = process.env.NEXT_PUBLIC_APP_STAGE as AppStage;
  return stage || 'development';
}

/**
 * Get stage configuration based on current stage
 */
export function getStageConfig(): StageConfig {
  const stage = getCurrentStage();
  
  // Get feature flags from environment (with fallbacks based on stage)
  const getEnvBoolean = (key: string, fallback: boolean): boolean => {
    const value = process.env[key];
    if (value === undefined) return fallback;
    return value === 'true';
  };

  const baseConfig = {
    stage,
    debugMode: getEnvBoolean('NEXT_PUBLIC_DEBUG_MODE', stage !== 'production'),
  };

  switch (stage) {
    case 'development':
      return {
        ...baseConfig,
        enableRegistration: getEnvBoolean('NEXT_PUBLIC_ENABLE_REGISTRATION', false),
        enablePublicPages: getEnvBoolean('NEXT_PUBLIC_ENABLE_PUBLIC_PAGES', false),
        enableBlog: getEnvBoolean('NEXT_PUBLIC_ENABLE_BLOG', false),
        enableContactForm: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONTACT_FORM', false),
        enablePayments: getEnvBoolean('NEXT_PUBLIC_ENABLE_PAYMENTS', false),
        enableLiveChat: getEnvBoolean('NEXT_PUBLIC_ENABLE_LIVE_CHAT', false),
        enableAnalytics: getEnvBoolean('NEXT_PUBLIC_ANALYTICS_ENABLED', false),
        showComingSoon: getEnvBoolean('NEXT_PUBLIC_SHOW_COMING_SOON', true),
      };

    case 'alpha':
      return {
        ...baseConfig,
        enableRegistration: getEnvBoolean('NEXT_PUBLIC_ENABLE_REGISTRATION', true),
        enablePublicPages: getEnvBoolean('NEXT_PUBLIC_ENABLE_PUBLIC_PAGES', false),
        enableBlog: getEnvBoolean('NEXT_PUBLIC_ENABLE_BLOG', false),
        enableContactForm: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONTACT_FORM', true),
        enablePayments: getEnvBoolean('NEXT_PUBLIC_ENABLE_PAYMENTS', false),
        enableLiveChat: getEnvBoolean('NEXT_PUBLIC_ENABLE_LIVE_CHAT', false),
        enableAnalytics: getEnvBoolean('NEXT_PUBLIC_ANALYTICS_ENABLED', false),
        showComingSoon: getEnvBoolean('NEXT_PUBLIC_SHOW_COMING_SOON', true),
      };

    case 'beta':
      return {
        ...baseConfig,
        enableRegistration: getEnvBoolean('NEXT_PUBLIC_ENABLE_REGISTRATION', true),
        enablePublicPages: getEnvBoolean('NEXT_PUBLIC_ENABLE_PUBLIC_PAGES', true),
        enableBlog: getEnvBoolean('NEXT_PUBLIC_ENABLE_BLOG', false),
        enableContactForm: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONTACT_FORM', true),
        enablePayments: getEnvBoolean('NEXT_PUBLIC_ENABLE_PAYMENTS', true),
        enableLiveChat: getEnvBoolean('NEXT_PUBLIC_ENABLE_LIVE_CHAT', false),
        enableAnalytics: getEnvBoolean('NEXT_PUBLIC_ANALYTICS_ENABLED', true),
        showComingSoon: getEnvBoolean('NEXT_PUBLIC_SHOW_COMING_SOON', false),
      };

    case 'staging':
      return {
        ...baseConfig,
        enableRegistration: getEnvBoolean('NEXT_PUBLIC_ENABLE_REGISTRATION', true),
        enablePublicPages: getEnvBoolean('NEXT_PUBLIC_ENABLE_PUBLIC_PAGES', true),
        enableBlog: getEnvBoolean('NEXT_PUBLIC_ENABLE_BLOG', true),
        enableContactForm: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONTACT_FORM', true),
        enablePayments: getEnvBoolean('NEXT_PUBLIC_ENABLE_PAYMENTS', true),
        enableLiveChat: getEnvBoolean('NEXT_PUBLIC_ENABLE_LIVE_CHAT', true),
        enableAnalytics: getEnvBoolean('NEXT_PUBLIC_ANALYTICS_ENABLED', true),
        showComingSoon: getEnvBoolean('NEXT_PUBLIC_SHOW_COMING_SOON', false),
      };

    case 'production':
    default:
      return {
        ...baseConfig,
        enableRegistration: getEnvBoolean('NEXT_PUBLIC_ENABLE_REGISTRATION', true),
        enablePublicPages: getEnvBoolean('NEXT_PUBLIC_ENABLE_PUBLIC_PAGES', true),
        enableBlog: getEnvBoolean('NEXT_PUBLIC_ENABLE_BLOG', true),
        enableContactForm: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONTACT_FORM', true),
        enablePayments: getEnvBoolean('NEXT_PUBLIC_ENABLE_PAYMENTS', true),
        enableLiveChat: getEnvBoolean('NEXT_PUBLIC_ENABLE_LIVE_CHAT', true),
        enableAnalytics: getEnvBoolean('NEXT_PUBLIC_ANALYTICS_ENABLED', true),
        showComingSoon: getEnvBoolean('NEXT_PUBLIC_SHOW_COMING_SOON', false),
      };
  }
}

/**
 * Check if a feature is enabled in the current stage
 */
export function isFeatureEnabled(feature: keyof Omit<StageConfig, 'stage'>): boolean {
  const config = getStageConfig();
  return config[feature];
}

/**
 * Get API URL based on stage
 */
export function getApiUrl(): string {
  const stage = getCurrentStage();
  
  // Environment variable takes precedence
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default URLs based on stage
  switch (stage) {
    case 'development':
      return 'http://localhost:5000';
    case 'alpha':
      return 'https://alpha-api.tasktracker.com';
    case 'beta':
      return 'https://beta-api.tasktracker.com';
    case 'staging':
      return 'https://staging-api.tasktracker.com';
    case 'production':
    default:
      return 'https://api.tasktracker.com';
  }
}

/**
 * Get base URL based on stage
 */
export function getBaseUrl(): string {
  const stage = getCurrentStage();
  
  // Environment variable takes precedence
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Default URLs based on stage
  switch (stage) {
    case 'development':
      return 'http://localhost:3000';
    case 'alpha':
      return 'https://alpha.tasktracker.com';
    case 'beta':
      return 'https://beta.tasktracker.com';
    case 'staging':
      return 'https://staging.tasktracker.com';
    case 'production':
    default:
      return 'https://tasktracker.com';
  }
} 