'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Settings, Shield, Eye, TrendingUp } from 'lucide-react';
import { cookieConsentService } from '@/lib/services/cookieConsentService';
import type { CookieConsentPreferences } from '@/lib/types/cookie-consent';

interface CookieConsentBannerProps {
  position?: 'bottom' | 'top';
  companyName?: string;
}

export function CookieConsentBanner({ 
  position = 'bottom', 
  companyName = 'TaskTracker'
}: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already made consent choices
    const checkConsentStatus = async () => {
      try {
        const needsConsent = cookieConsentService.needsConsent();
        setIsVisible(needsConsent);
        
        if (!needsConsent) {
          const currentConsent = cookieConsentService.getConsent();
          if (currentConsent && currentConsent.preferences) {
            setPreferences(currentConsent.preferences);
          }
        }
      } catch (error) {
        console.error('Error checking consent status:', error);
        setIsVisible(true); // Show banner on error to be safe
      }
    };

    checkConsentStatus();
  }, []);

  const handleAcceptAll = async () => {
    setIsLoading(true);
    try {
      const allAcceptedPreferences: CookieConsentPreferences = {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true
      };
      
      cookieConsentService.setConsent(allAcceptedPreferences);
      setPreferences(allAcceptedPreferences);
      setIsVisible(false);
    } catch (error) {
      console.error('Error recording consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptNecessary = async () => {
    setIsLoading(true);
    try {
      const necessaryOnlyPreferences: CookieConsentPreferences = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false
      };
      
      cookieConsentService.setConsent(necessaryOnlyPreferences);
      setPreferences(necessaryOnlyPreferences);
      setIsVisible(false);
    } catch (error) {
      console.error('Error recording consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomPreferences = async () => {
    setIsLoading(true);
    try {
      cookieConsentService.setConsent(preferences);
      setIsVisible(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (category: keyof CookieConsentPreferences, enabled: boolean) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const categoryDescriptions = {
    necessary: {
      icon: Shield,
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cannot be disabled.',
      examples: 'Authentication, security, basic functionality'
    },
    functional: {
      icon: Settings,
      title: 'Functional Cookies',
      description: 'Enable enhanced features like device tracking and personalized experiences.',
      examples: 'Device fingerprinting, preferences, language settings'
    },
    analytics: {
      icon: TrendingUp,
      title: 'Analytics Cookies',
      description: 'Help us understand how you use our website to improve our services.',
      examples: 'Page views, user behavior, performance metrics'
    },
    marketing: {
      icon: Eye,
      title: 'Marketing Cookies',
      description: 'Used to deliver personalized advertisements and measure campaign effectiveness.',
      examples: 'Ad targeting, social media integration, tracking pixels'
    }
  };

  if (!isVisible) return null;

  const positionClasses = position === 'bottom' 
    ? 'bottom-0 left-0 right-0' 
    : 'top-0 left-0 right-0';

  return (
    <div className={`fixed ${positionClasses} z-50 inset-x-0`}>
      {/* Sleek Thin Banner */}
      <div className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-blue-700 border-t border-yellow-400/50 shadow-lg backdrop-blur-sm">
        <div className="relative">
          <Card className="w-full rounded-none bg-transparent border-0 shadow-none">
            <CardContent className="py-3 px-4 lg:px-6">
              {!showDetails ? (
                // Compact Banner View
                <div className="flex items-center justify-between gap-4">
                  {/* Left section with icon and text */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-1.5 bg-yellow-400 rounded-full shadow-sm flex-shrink-0">
                      <Cookie className="h-4 w-4 text-purple-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium leading-tight">
                        🍪 We use cookies to enhance your experience. 
                        <strong className="text-yellow-400 ml-1">Functional cookies unlock device tracking!</strong>
                      </p>
                    </div>
                  </div>
                  
                  {/* Right section with buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                      className="h-8 px-3 text-xs text-white hover:bg-white/10 border border-white/20 hover:border-white/40"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                    <Button
                      onClick={handleAcceptNecessary}
                      disabled={isLoading}
                      size="sm"
                      className="h-8 px-3 text-xs bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Essential Only
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      disabled={isLoading}
                      size="sm"
                      className="h-8 px-3 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-purple-900 font-medium"
                    >
                      {isLoading ? 'Loading...' : 'Accept All'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVisible(false)}
                      className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-full flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Detailed Preferences View - Also made more compact
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-white text-sm font-medium">Cookie Preferences</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVisible(false)}
                      className="h-6 w-6 p-0 text-white hover:bg-white/10 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {(Object.keys(categoryDescriptions) as (keyof CookieConsentPreferences)[]).map((category) => {
                      const { icon: Icon, title, description } = categoryDescriptions[category];
                      const isEnabled = preferences[category];
                      const isNecessary = category === 'necessary';

                      return (
                        <div key={category} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Icon className="h-3 w-3 text-purple-300 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-white text-xs font-medium">{title}</h4>
                              <p className="text-purple-200 text-xs leading-tight">{description}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isNecessary ? (
                              <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                                Required
                              </span>
                            ) : (
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={(e) => handleCategoryToggle(category, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(false)}
                      className="h-7 px-3 text-xs text-white hover:bg-white/10"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSaveCustomPreferences}
                      disabled={isLoading}
                      size="sm"
                      className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Privacy links - more compact */}
              {!showDetails && (
                <div className="mt-2 pt-2 border-t border-white/10 text-center">
                  <p className="text-purple-200 text-xs">
                    <a href="/privacy" className="text-yellow-400 hover:text-yellow-300 underline">Privacy</a>
                    {' • '}
                    <a href="/cookies" className="text-yellow-400 hover:text-yellow-300 underline">Cookies</a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 