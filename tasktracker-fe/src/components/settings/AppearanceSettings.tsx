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
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Monitor, 
  Eye, 
  Accessibility, 
  Zap,
  Volume2,
  Save,
  RotateCcw,
  Trophy,
  Sparkles,
  BarChart3,
  Users,
  Minimize2,
  Star,
  Play,
  RotateCw,
  Heart,
  Smile
} from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { useAppearanceSettings } from '@/lib/contexts/AppearanceContext';
import { appearanceSettingsSchema } from '@/lib/schemas/settings';
import { AppearanceFormData } from '@/lib/types/forms/forms';
import { AppearanceSettingsContentProps } from '@/lib/props/components/settings.props';
import { spriteAnimationService } from '@/lib/services/spriteAnimationService';

// AppearanceFormData is imported from lib/types/forms

// AppearanceSettingsContentProps is imported from lib/types/settings

export default function AppearanceSettingsContent({ }: AppearanceSettingsContentProps) {
  const { setMode } = useTheme();
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    playTestSound, 
    getAvailableSounds,
    shouldAnimate,
    getAnimationClass,
    isLoading: contextLoading 
  } = useAppearanceSettings();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingAnimation, setTestingAnimation] = useState<string | null>(null);

  const form = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: settings,
  });

  // Update form when context settings change
  useEffect(() => {
    if (!contextLoading) {
      form.reset(settings);
    }
  }, [settings, contextLoading, form]);

  const onSubmit = async (data: AppearanceFormData): Promise<void> => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Apply theme mode
      setMode(data.theme as 'light' | 'dark' | 'system');
      
      // Update context settings
      updateSettings(data);
      
      // Play success sound if enabled
      if (data.accessibility.audioFeedback) {
        playTestSound('success');
      }
      
      // Save settings to localStorage
      localStorage.setItem('tasktracker-appearance-settings', JSON.stringify(data));
      
      setMessage({ type: 'success', text: 'Appearance settings saved successfully!' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save appearance settings';
      setMessage({ type: 'error', text: message });
      
      // Play error sound if enabled
      if (data.accessibility.audioFeedback) {
        playTestSound('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    resetSettings();
    setMessage({ type: 'success', text: 'Settings reset to defaults' });
    if (settings.accessibility.audioFeedback) {
      playTestSound('notification');
    }
  };

  // Enhanced animation test function
  const testAnimation = (animationType: string) => {
    if (!shouldAnimate()) return;
    
    setTestingAnimation(animationType);
    playTestSound('buttonClick');
    
    // Get screen center for animation
    const position = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    
    // Play sprite animation based on type
    switch (animationType) {
      case 'achievement-unlock':
        spriteAnimationService.playEnhancedAnimation({
          type: 'achievement-unlock',
          position,
          duration: 3000,
          quality: 'high',
          particles: 15,
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      case 'level-up':
        spriteAnimationService.playEnhancedAnimation({
          type: 'level-up',
          position,
          duration: 4000,
          quality: 'high',
          particles: 25,
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      case 'celebration-fireworks':
        spriteAnimationService.playEnhancedAnimation({
          type: 'celebration-fireworks',
          position,
          duration: 5000,
          quality: 'high',
          particles: 30,
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      case 'task-complete':
        spriteAnimationService.playEnhancedAnimation({
          type: 'task-complete',
          position,
          duration: 2000,
          quality: 'high',
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      case 'character-dance':
        spriteAnimationService.playEnhancedAnimation({
          type: 'character-dance',
          position,
          character: 'hero',
          duration: 3000,
          quality: 'high',
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      case 'energy-wave':
        spriteAnimationService.playEnhancedAnimation({
          type: 'energy-wave',
          position,
          color: '#00ff88',
          duration: 2000,
          quality: 'high',
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      case 'text-animation':
        spriteAnimationService.playTextAnimation({
          text: 'Enterprise Animation!',
          position,
          fontSize: 32,
          fontWeight: '700',
          color: '#4CAF50',
          animation: 'bounce-in',
          duration: 2500,
          onComplete: () => setTestingAnimation(null)
        });
        break;
        
      default:
        setTimeout(() => {
          setTestingAnimation(null);
        }, 2000);
    }
  };

  // Test all animations in sequence
  const testAllAnimations = async () => {
    const animations = [
      'achievement-unlock',
      'level-up', 
      'task-complete',
      'character-dance',
      'energy-wave',
      'text-animation',
      'celebration-fireworks'
    ];
    
    for (let i = 0; i < animations.length; i++) {
      testAnimation(animations[i]);
      await new Promise(resolve => setTimeout(resolve, 3500));
    }
  };

  // Show loading while initializing to prevent SSR issues
  if (contextLoading) {
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
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred color palette
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

            {/* Enhanced Accessibility Settings */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Accessibility className="h-5 w-5" />
                  ♿ Enhanced Accessibility
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">
                  Accessibility features and audio feedback controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="accessibility.highContrast"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-green-200 dark:border-green-700 p-4 bg-white dark:bg-gray-800">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <Eye className="h-4 w-4" />
                          High Contrast Mode
                        </FormLabel>
                        <FormDescription className="text-green-600 dark:text-green-300">
                          Increase contrast for better visibility
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessibility.audioFeedback"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border-2 border-blue-200 dark:border-blue-700 p-4 bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <Volume2 className="h-4 w-4" />
                            Audio Feedback
                          </FormLabel>
                          <FormDescription className="text-blue-600 dark:text-blue-300">
                            Play sounds for interactions and achievements
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              updateSettings({ 
                                accessibility: { 
                                  ...settings.accessibility, 
                                  audioFeedback: checked 
                                } 
                              });
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                          />
                        </FormControl>
                      </div>

                      {/* Enhanced Sound Testing Grid */}
                      {field.value && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-2 mb-4">
                            <Volume2 className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-800 dark:text-blue-200">Sound Library Test</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {getAvailableSounds().map((soundType) => (
                              <Button
                                key={soundType}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => playTestSound(soundType)}
                                className="flex items-center gap-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              >
                                <Play className="h-3 w-3" />
                                {soundType.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </Button>
                            ))}
                          </div>

                          {/* Animation Feedback Testing */}
                          <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-800 dark:text-purple-200">Animation Feedback Test</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testAnimation('bounce')}
                                className={getAnimationClass(
                                  "flex items-center gap-2 text-xs",
                                  testingAnimation === 'bounce' ? 'animate-bounce' : ''
                                )}
                              >
                                <Heart className="h-3 w-3" />
                                Bounce Effect
                              </Button>
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testAnimation('pulse')}
                                className={getAnimationClass(
                                  "flex items-center gap-2 text-xs",
                                  testingAnimation === 'pulse' ? 'animate-pulse' : ''
                                )}
                              >
                                <Star className="h-3 w-3" />
                                Pulse Effect
                              </Button>
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testAnimation('spin')}
                                className={getAnimationClass(
                                  "flex items-center gap-2 text-xs",
                                  testingAnimation === 'spin' ? 'animate-spin' : ''
                                )}
                              >
                                <RotateCw className="h-3 w-3" />
                                Spin Effect
                              </Button>
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testAnimation('wiggle')}
                                className={getAnimationClass(
                                  "flex items-center gap-2 text-xs",
                                  testingAnimation === 'wiggle' ? 'animate-ping' : ''
                                )}
                              >
                                <Smile className="h-3 w-3" />
                                Ping Effect
                              </Button>
                            </div>
                          </div>

                          {/* Enhanced Sprite Animation Testing */}
                          <div className="border-t border-emerald-200 dark:border-emerald-700 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium text-emerald-800 dark:text-emerald-200">Enterprise Sprite Animation Test</span>
                                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                  High Performance
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={testAllAnimations}
                                className="text-xs text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
                              >
                                <RotateCw className="h-3 w-3 mr-1" />
                                Test All
                              </Button>
                            </div>
                            
                            {/* Achievement & Gamification Animations */}
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                Achievement & Gamification
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('achievement-unlock')}
                                  disabled={testingAnimation === 'achievement-unlock'}
                                  className="flex items-center gap-2 text-xs hover:bg-yellow-100 dark:hover:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
                                >
                                  {testingAnimation === 'achievement-unlock' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trophy className="h-3 w-3 text-yellow-600" />
                                  )}
                                  Achievement Unlock
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('level-up')}
                                  disabled={testingAnimation === 'level-up'}
                                  className="flex items-center gap-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                                >
                                  {testingAnimation === 'level-up' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Zap className="h-3 w-3 text-blue-600" />
                                  )}
                                  Level Up
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('task-complete')}
                                  disabled={testingAnimation === 'task-complete'}
                                  className="flex items-center gap-2 text-xs hover:bg-green-100 dark:hover:bg-green-900/20 border-green-200 dark:border-green-700"
                                >
                                  {testingAnimation === 'task-complete' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="text-green-600">✅</span>
                                  )}
                                  Task Complete
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('celebration-fireworks')}
                                  disabled={testingAnimation === 'celebration-fireworks'}
                                  className="flex items-center gap-2 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                                >
                                  {testingAnimation === 'celebration-fireworks' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="text-purple-600">🎆</span>
                                  )}
                                  Celebration
                                </Button>
                              </div>
                            </div>

                            {/* Character & Interactive Animations */}
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Character & Interactive
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('character-dance')}
                                  disabled={testingAnimation === 'character-dance'}
                                  className="flex items-center gap-2 text-xs hover:bg-pink-100 dark:hover:bg-pink-900/20 border-pink-200 dark:border-pink-700"
                                >
                                  {testingAnimation === 'character-dance' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="text-pink-600">💃</span>
                                  )}
                                  Character Dance
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('energy-wave')}
                                  disabled={testingAnimation === 'energy-wave'}
                                  className="flex items-center gap-2 text-xs hover:bg-cyan-100 dark:hover:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700"
                                >
                                  {testingAnimation === 'energy-wave' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="text-cyan-600">⚡</span>
                                  )}
                                  Energy Wave
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('text-animation')}
                                  disabled={testingAnimation === 'text-animation'}
                                  className="flex items-center gap-2 text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700"
                                >
                                  {testingAnimation === 'text-animation' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="text-indigo-600">📝</span>
                                  )}
                                  Text Effects
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testAnimation('success-ripple')}
                                  disabled={testingAnimation === 'success-ripple'}
                                  className="flex items-center gap-2 text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                                >
                                  {testingAnimation === 'success-ripple' ? (
                                    <RotateCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="text-emerald-600">💫</span>
                                  )}
                                  Success Ripple
                                </Button>
                              </div>
                            </div>

                            {/* Animation Quality & Performance */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Animation Quality</span>
                                <Badge variant="outline" className="text-xs">
                                  Enterprise Grade
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {['low', 'medium', 'high', 'ultra'].map((quality) => (
                                  <Button
                                    key={quality}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      spriteAnimationService.setQuality(quality as 'low' | 'medium' | 'high' | 'ultra');
                                      playTestSound('buttonClick');
                                    }}
                                    className="text-xs py-1 px-2 h-7"
                                  >
                                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-3 w-3 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                  Live Performance Metrics
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-mono text-emerald-600">60fps</div>
                                  <div className="text-emerald-500">Frame Rate</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-mono text-emerald-600">0</div>
                                  <div className="text-emerald-500">Active</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-mono text-emerald-600">98%</div>
                                  <div className="text-emerald-500">Smooth</div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-3 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Enterprise-grade sprite animations with high-performance rendering and smooth 60fps effects!
                            </p>
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* ⚡ Enhanced Animation & Effects Settings */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border-cyan-200 dark:border-cyan-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
                  <Zap className="h-5 w-5" />
                  ⚡ Animations & Effects
                </CardTitle>
                <CardDescription className="text-cyan-600 dark:text-cyan-300">
                  Control visual effects and smooth animations for better UX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="animations.enableAnimations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-cyan-200 dark:border-cyan-700 p-4 bg-white dark:bg-gray-800">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
                          <Sparkles className="h-4 w-4" />
                          Smooth Animations
                        </FormLabel>
                        <FormDescription className="text-cyan-600 dark:text-cyan-300">
                          Enable beautiful transitions and micro-interactions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              animations: { 
                                ...settings.animations, 
                                enableAnimations: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-cyan-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animations.reducedMotion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-orange-200 dark:border-orange-700 p-4 bg-orange-50/50 dark:bg-orange-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                          <Minimize2 className="h-4 w-4" />
                          Reduced Motion
                        </FormLabel>
                        <FormDescription className="text-orange-600 dark:text-orange-300">
                          Minimize motion for accessibility or performance
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              animations: { 
                                ...settings.animations, 
                                reducedMotion: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animations.particleEffects"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-pink-200 dark:border-pink-700 p-4 bg-pink-50/50 dark:bg-pink-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-pink-800 dark:text-pink-200">
                          <Star className="h-4 w-4" />
                          Celebration Particles
                        </FormLabel>
                        <FormDescription className="text-pink-600 dark:text-pink-300">
                          Show confetti and particle effects for achievements
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              animations: { 
                                ...settings.animations, 
                                particleEffects: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animations.spriteAnimations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-emerald-200 dark:border-emerald-700 p-4 bg-emerald-50/50 dark:bg-emerald-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                          <Heart className="h-4 w-4" />
                          Sprite Animations
                        </FormLabel>
                        <FormDescription className="text-emerald-600 dark:text-emerald-300">
                          Enable 2D sprite characters and animated badges
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              animations: { 
                                ...settings.animations, 
                                spriteAnimations: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animations.characterAnimations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-indigo-200 dark:border-indigo-700 p-4 bg-indigo-50/50 dark:bg-indigo-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                          <Users className="h-4 w-4" />
                          Character Celebrations
                        </FormLabel>
                        <FormDescription className="text-indigo-600 dark:text-indigo-300">
                          Animated family characters celebrating achievements
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              animations: { 
                                ...settings.animations, 
                                characterAnimations: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 🎬 Animation Preview */}
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-cyan-600" />
                    <span className="font-semibold text-cyan-800 dark:text-cyan-200">Animation Features</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
                      ✨ Smooth Transitions
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200">
                      🎊 Confetti Effects
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                      🎮 Sprite Characters
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200">
                      👨‍👩‍👧‍👦 Family Animations
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
                      ♿ Accessibility Options
                    </div>
                  </div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-300">
                    Enhanced animations with 2D sprites, characters, and particle effects make interactions feel more responsive and engaging!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 🎮 Enterprise Gamification Settings */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                  <Trophy className="h-5 w-5" />
                  🎮 Enterprise Gamification
                </CardTitle>
                <CardDescription className="text-purple-600 dark:text-purple-300">
                  Customize your achievement experience and motivation system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="gamification.showAchievementAnimations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-purple-200 dark:border-purple-700 p-4 bg-white/50 dark:bg-gray-800/50">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                          <Sparkles className="h-4 w-4" />
                          Achievement Celebrations
                        </FormLabel>
                        <FormDescription className="text-purple-600 dark:text-purple-300">
                          Epic confetti and animations when you unlock achievements
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              gamification: { 
                                ...settings.gamification, 
                                showAchievementAnimations: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gamification.enableLevelUpEffects"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-amber-200 dark:border-amber-700 p-4 bg-amber-50/50 dark:bg-amber-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                          <Star className="h-4 w-4" />
                          Level Up Fanfare
                        </FormLabel>
                        <FormDescription className="text-amber-600 dark:text-amber-300">
                          Spectacular effects when you level up your family rank
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              gamification: { 
                                ...settings.gamification, 
                                enableLevelUpEffects: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-amber-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gamification.showProgressBars"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-blue-200 dark:border-blue-700 p-4 bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <BarChart3 className="h-4 w-4" />
                          Progress Visualization
                        </FormLabel>
                        <FormDescription className="text-blue-600 dark:text-blue-300">
                          Beautiful progress bars and XP indicators
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              gamification: { 
                                ...settings.gamification, 
                                showProgressBars: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gamification.ageAppropriateThemes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-green-200 dark:border-green-700 p-4 bg-green-50/50 dark:bg-green-900/10">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <Users className="h-4 w-4" />
                          Age-Appropriate Themes
                        </FormLabel>
                        <FormDescription className="text-green-600 dark:text-green-300">
                          Adapt gamification style based on family member ages
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              gamification: { 
                                ...settings.gamification, 
                                ageAppropriateThemes: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gamification.compactMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                          <Minimize2 className="h-4 w-4" />
                          Compact Interface
                        </FormLabel>
                        <FormDescription className="text-gray-600 dark:text-gray-300">
                          Smaller UI elements for focused productivity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            updateSettings({ 
                              gamification: { 
                                ...settings.gamification, 
                                compactMode: checked 
                              } 
                            });
                          }}
                          className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 🎯 Gamification Preview */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-800 dark:text-indigo-200">Gamification Preview</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
                      🏆 175+ Achievements
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                      ⭐ 50+ Badges
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                      🎯 Real-time Celebrations
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                      👨‍👩‍👧‍👦 Family Leaderboards
                    </div>
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-300">
                    Your gamification settings will enhance task completion motivation and family collaboration!
                  </p>
                </div>
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
                onClick={handleResetToDefaults}
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
