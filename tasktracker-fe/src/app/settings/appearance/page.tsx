'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThemeMarketplace } from '@/components/theme/ThemeMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Monitor, 
  Eye, 
  Accessibility, 
  Zap,
  Volume2,
  Save,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { appearanceSettingsSchema } from '@/lib/schemas/settings';
import { z } from 'zod';

type AppearanceFormData = z.infer<typeof appearanceSettingsSchema>;

export default function AppearanceSettingsPage() {
  const { mode, setMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      theme: 'system',
      colorScheme: 'default',
      fontSize: 'medium',
      animations: {
        enableAnimations: true,
        reducedMotion: false,
        animationSpeed: 'normal',
        particleEffects: true,
      },
      accessibility: {
        highContrast: false,
        focusIndicators: true,
        screenReaderOptimized: false,
        keyboardNavigation: true,
        audioFeedback: false,
      },
      gamification: {
        showAchievementAnimations: true,
        enableLevelUpEffects: true,
        showProgressBars: true,
        compactMode: false,
        ageAppropriateThemes: true,
      },
    },
  });

  // Initialize form after component mounts to prevent SSR issues
  useEffect(() => {
    form.reset({
      theme: mode || 'system',
      colorScheme: 'default',
      fontSize: 'medium',
      animations: {
        enableAnimations: true,
        reducedMotion: false,
        animationSpeed: 'normal',
        particleEffects: true,
      },
      accessibility: {
        highContrast: false,
        focusIndicators: true,
        screenReaderOptimized: false,
        keyboardNavigation: true,
        audioFeedback: false,
      },
      gamification: {
        showAchievementAnimations: true,
        enableLevelUpEffects: true,
        showProgressBars: true,
        compactMode: false,
        ageAppropriateThemes: true,
      },
    });
    setIsInitialized(true);
  }, [form, mode]);

  const onSubmit = async (data: AppearanceFormData): Promise<void> => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Apply theme mode
      setMode(data.theme as 'light' | 'dark' | 'system');
      
      // TODO: Save other appearance settings to backend/localStorage
      console.log('Appearance settings:', data);
      
      setMessage({ type: 'success', text: 'Appearance settings saved successfully!' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save appearance settings';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    form.reset();
    setMessage({ type: 'success', text: 'Settings reset to defaults' });
  };

  // Show loading while initializing to prevent SSR issues
  if (!isInitialized) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Appearance & Themes Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your app&apos;s appearance, themes, and visual preferences
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Form {...form}>
          {/* Appearance Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Display Settings
                </CardTitle>
                <CardDescription>
                  Configure basic display preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="auto">Auto (Time-based)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how you want the app to appear
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorScheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Scheme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color scheme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Default Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primary color scheme for the interface
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="extra_large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Adjust text size for better readability
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </CardContent>
            </Card>

            {/* Accessibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Accessibility
                </CardTitle>
                <CardDescription>
                  Options to improve accessibility and usability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="accessibility.highContrast"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>High Contrast</FormLabel>
                        <FormDescription>
                          Increase contrast for better visibility
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessibility.focusIndicators"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enhanced Focus Indicators</FormLabel>
                        <FormDescription>
                          Better visual focus indicators for navigation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessibility.audioFeedback"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          Audio Feedback
                        </FormLabel>
                        <FormDescription>
                          Play sounds for interactions and achievements
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Animation & Gamification Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Animations & Effects
                </CardTitle>
                <CardDescription>
                  Control visual effects and animations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="animations.enableAnimations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Animations</FormLabel>
                        <FormDescription>
                          Show smooth transitions and animations
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animations.reducedMotion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Reduced Motion</FormLabel>
                        <FormDescription>
                          Minimize motion for sensitivity or performance
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animations.particleEffects"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Particle Effects</FormLabel>
                        <FormDescription>
                          Show celebratory particles for achievements
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Gamification Display
                </CardTitle>
                <CardDescription>
                  Customize how achievements and progress are shown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="gamification.showAchievementAnimations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Achievement Animations</FormLabel>
                        <FormDescription>
                          Celebrate achievements with animations
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gamification.showProgressBars"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Progress Bars</FormLabel>
                        <FormDescription>
                          Show visual progress indicators
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gamification.compactMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Compact Mode</FormLabel>
                        <FormDescription>
                          Use smaller UI elements to save space
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className="flex items-center gap-2 flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetToDefaults}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </Form>
      </div>

      <Separator className="my-8" />

      {/* Theme Marketplace */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Theme Marketplace</h2>
        <ThemeMarketplace />
      </div>
    </div>
  );
} 