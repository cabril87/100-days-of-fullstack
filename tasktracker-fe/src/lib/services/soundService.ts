/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Sound Service
 * Provides comprehensive audio feedback for TaskTracker Enterprise
 */

import type { EnterpriseSoundEffect } from '@/lib/types/gamification';

/**
 * Sound effect configuration
 */
interface SoundConfig {
  volume: number;
  duration: number;
  frequency?: number;
  type?: OscillatorType;
  fadeOut?: boolean;
}

/**
 * Sound effect library with enterprise-quality audio
 */
class SoundEffectLibrary {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private enabled = false;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.warn('AudioContext not supported:', error);
      }
    }
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Resume audio context if suspended (required for user interaction)
   */
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Create and play a tone
   */
  private async playTone(config: SoundConfig) {
    if (!this.audioContext || !this.enabled) return;

    try {
      await this.resumeContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = config.frequency || 440;
      oscillator.type = config.type || 'sine';

      const volume = config.volume * this.masterVolume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

      if (config.fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
      }

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + config.duration);
    } catch (error) {
      console.warn('Failed to play tone:', error);
    }
  }

  /**
   * Play multiple tones in sequence (chord progression)
   */
  private async playChord(frequencies: number[], config: SoundConfig, delay = 0) {
    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(() => {
        this.playTone({
          ...config,
          frequency: frequencies[i]
        });
      }, i * delay);
    }
  }

  // ================================
  // ENTERPRISE SOUND EFFECTS
  // ================================

  /**
   * Achievement unlocked sound
   */
  async playAchievement() {
    if (!this.enabled) return;
    
    // Triumphant chord progression: C-E-G-C
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    await this.playChord(frequencies, {
      volume: 0.4,
      duration: 0.6,
      type: 'triangle',
      fadeOut: true
    }, 100);
  }

  /**
   * Level up fanfare
   */
  async playLevelUp() {
    if (!this.enabled) return;

    // Ascending fanfare: C-D-E-F-G-A-B-C
    const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
    await this.playChord(frequencies, {
      volume: 0.5,
      duration: 0.4,
      type: 'sawtooth',
      fadeOut: true
    }, 80);
  }

  /**
   * Task completion chime
   */
  async playTaskComplete() {
    if (!this.enabled) return;

    // Pleasant completion chime: E-G#-B
    const frequencies = [659.25, 830.61, 987.77];
    await this.playChord(frequencies, {
      volume: 0.3,
      duration: 0.5,
      type: 'sine',
      fadeOut: true
    }, 120);
  }

  /**
   * Points earned sound
   */
  async playPointsEarned() {
    if (!this.enabled) return;

    // Quick reward sound: G-C
    await this.playTone({
      frequency: 783.99,
      volume: 0.25,
      duration: 0.15,
      type: 'triangle'
    });
    
    setTimeout(() => {
      this.playTone({
        frequency: 1046.50,
        volume: 0.3,
        duration: 0.25,
        type: 'triangle',
        fadeOut: true
      });
    }, 100);
  }

  /**
   * Streak milestone sound
   */
  async playStreak() {
    if (!this.enabled) return;

    // Rhythmic streak sound
    const frequencies = [440, 523.25, 659.25];
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone({
          frequency: frequencies[i],
          volume: 0.3,
          duration: 0.2,
          type: 'square'
        });
      }, i * 150);
    }
  }

  /**
   * Badge earned sound
   */
  async playBadgeEarned() {
    if (!this.enabled) return;

    // Magical badge sound: A-C#-E-A
    const frequencies = [440, 554.37, 659.25, 880];
    await this.playChord(frequencies, {
      volume: 0.35,
      duration: 0.7,
      type: 'triangle',
      fadeOut: true
    }, 90);
  }

  /**
   * Button click/interaction sound
   */
  async playClick() {
    if (!this.enabled) return;

    await this.playTone({
      frequency: 800,
      volume: 0.1,
      duration: 0.05,
      type: 'square'
    });
  }

  /**
   * Success notification
   */
  async playSuccess() {
    if (!this.enabled) return;

    // Success chord: F-A-C
    const frequencies = [698.46, 880, 1046.50];
    await this.playChord(frequencies, {
      volume: 0.3,
      duration: 0.4,
      type: 'sine',
      fadeOut: true
    }, 60);
  }

  /**
   * Error/warning sound
   */
  async playError() {
    if (!this.enabled) return;

    await this.playTone({
      frequency: 220,
      volume: 0.2,
      duration: 0.3,
      type: 'sawtooth',
      fadeOut: true
    });
  }

  /**
   * Gentle notification sound
   */
  async playNotification() {
    if (!this.enabled) return;

    await this.playTone({
      frequency: 523.25,
      volume: 0.2,
      duration: 0.3,
      type: 'sine',
      fadeOut: true
    });
  }

  /**
   * Family celebration sound (more festive)
   */
  async playFamilyCelebration() {
    if (!this.enabled) return;

    // Extended celebration: C-E-G-C-E-G-C
    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    await this.playChord(frequencies, {
      volume: 0.4,
      duration: 0.8,
      type: 'triangle',
      fadeOut: true
    }, 100);
  }

  /**
   * Drag and drop pickup sound
   */
  async playPickup() {
    if (!this.enabled) return;

    await this.playTone({
      frequency: 440,
      volume: 0.15,
      duration: 0.1,
      type: 'sine'
    });
  }

  /**
   * Drag and drop release sound
   */
  async playDrop() {
    if (!this.enabled) return;

    await this.playTone({
      frequency: 523.25,
      volume: 0.2,
      duration: 0.15,
      type: 'sine',
      fadeOut: true
    });
  }

  /**
   * Play enterprise sound effect by type
   */
  async playEnterpriseSoundEffect(effect: EnterpriseSoundEffect) {
    switch (effect) {
      case 'chime':
        await this.playNotification();
        break;
      case 'fanfare':
        await this.playLevelUp();
        break;
      case 'applause':
        await this.playFamilyCelebration();
        break;
      case 'achievement':
        await this.playAchievement();
        break;
      case 'level_up':
        await this.playLevelUp();
        break;
      default:
        await this.playNotification();
    }
  }

  /**
   * Modal open sound
   */
  async playModalOpen() {
    if (!this.enabled) return;

    // Gentle upward chime: C-E
    await this.playTone({
      frequency: 523.25,
      volume: 0.2,
      duration: 0.15,
      type: 'sine'
    });
    
    setTimeout(() => {
      this.playTone({
        frequency: 659.25,
        volume: 0.25,
        duration: 0.2,
        type: 'sine',
        fadeOut: true
      });
    }, 50);
  }

  /**
   * Modal close sound
   */
  async playModalClose() {
    if (!this.enabled) return;

    // Gentle downward chime: E-C
    await this.playTone({
      frequency: 659.25,
      volume: 0.2,
      duration: 0.15,
      type: 'sine'
    });
    
    setTimeout(() => {
      this.playTone({
        frequency: 523.25,
        volume: 0.15,
        duration: 0.2,
        type: 'sine',
        fadeOut: true
      });
    }, 50);
  }

  /**
   * Family notification sound
   */
  async playFamilyNotification() {
    if (!this.enabled) return;

    // Warm family sound: F-A-C
    const frequencies = [698.46, 880.00, 1046.50];
    await this.playChord(frequencies, {
      volume: 0.3,
      duration: 0.4,
      type: 'triangle',
      fadeOut: true
    }, 80);
  }

  /**
   * Urgent alert sound
   */
  async playUrgentAlert() {
    if (!this.enabled) return;

    // Attention-getting alert: alternating high-low
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone({
          frequency: i % 2 === 0 ? 880.00 : 659.25,
          volume: 0.4,
          duration: 0.15,
          type: 'square'
        });
      }, i * 200);
    }
  }

  /**
   * Celebration sound
   */
  async playCelebration() {
    if (!this.enabled) return;

    // Joyful celebration: C major scale up and down
    const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 987.77, 880.00, 783.99];
    await this.playChord(frequencies, {
      volume: 0.35,
      duration: 0.3,
      type: 'triangle',
      fadeOut: true
    }, 60);
  }
}

/**
 * Enterprise Sound Service
 * Centralized sound management for TaskTracker Enterprise
 */
class SoundService {
  private static instance: SoundService;
  private soundLibrary: SoundEffectLibrary;
  private settings = {
    enabled: false,
    volume: 0.3,
    ageGroup: 'Adult' as 'Child' | 'Teen' | 'Adult'
  };

  private constructor() {
    this.soundLibrary = new SoundEffectLibrary();
    this.loadSettings();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  /**
   * Initialize sound service with user settings
   */
  async initialize(audioFeedback: boolean, volume = 0.3, ageGroup: 'Child' | 'Teen' | 'Adult' = 'Adult') {
    this.settings = {
      enabled: audioFeedback,
      volume,
      ageGroup
    };

    this.soundLibrary.setEnabled(audioFeedback);
    this.soundLibrary.setMasterVolume(this.getAgeAdjustedVolume(volume, ageGroup));
    
    // Save settings to localStorage
    this.saveSettings();

    // Resume audio context on first user interaction
    if (audioFeedback) {
      await this.soundLibrary.resumeContext();
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('tasktracker-sound-settings');
        if (stored) {
          const settings = JSON.parse(stored);
          this.settings = { ...this.settings, ...settings };
          this.soundLibrary.setEnabled(this.settings.enabled);
          this.soundLibrary.setMasterVolume(this.settings.volume);
        }
      } catch (error) {
        console.warn('Failed to load sound settings:', error);
      }
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tasktracker-sound-settings', JSON.stringify(this.settings));
      } catch (error) {
        console.warn('Failed to save sound settings:', error);
      }
    }
  }

  /**
   * Adjust volume based on age group
   */
  private getAgeAdjustedVolume(baseVolume: number, ageGroup: string): number {
    switch (ageGroup) {
      case 'Child':
        return Math.min(baseVolume * 1.2, 1); // Slightly louder for children
      case 'Teen':
        return baseVolume * 1.1; // Slightly louder for teens
      default:
        return baseVolume;
    }
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    this.soundLibrary.setEnabled(enabled);
    this.saveSettings();
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number) {
    this.settings.volume = volume;
    this.soundLibrary.setMasterVolume(this.getAgeAdjustedVolume(volume, this.settings.ageGroup));
    this.saveSettings();
  }

  /**
   * Set age group for appropriate volume adjustment
   */
  setAgeGroup(ageGroup: 'Child' | 'Teen' | 'Adult') {
    this.settings.ageGroup = ageGroup;
    this.soundLibrary.setMasterVolume(this.getAgeAdjustedVolume(this.settings.volume, ageGroup));
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  // ================================
  // PUBLIC SOUND EFFECT METHODS
  // ================================

  async playTaskComplete() {
    await this.soundLibrary.playTaskComplete();
  }

  async playAchievementUnlocked() {
    await this.soundLibrary.playAchievement();
  }

  async playLevelUp() {
    await this.soundLibrary.playLevelUp();
  }

  async playPointsEarned() {
    await this.soundLibrary.playPointsEarned();
  }

  async playStreakMilestone() {
    await this.soundLibrary.playStreak();
  }

  async playBadgeEarned() {
    await this.soundLibrary.playBadgeEarned();
  }

  async playButtonClick() {
    await this.soundLibrary.playClick();
  }

  async playSuccess() {
    await this.soundLibrary.playSuccess();
  }

  async playError() {
    await this.soundLibrary.playError();
  }

  async playNotification() {
    await this.soundLibrary.playNotification();
  }

  async playFamilyCelebration() {
    await this.soundLibrary.playFamilyCelebration();
  }

  async playDragPickup() {
    await this.soundLibrary.playPickup();
  }

  async playDragDrop() {
    await this.soundLibrary.playDrop();
  }

  async playEnterpriseSoundEffect(effect: EnterpriseSoundEffect) {
    await this.soundLibrary.playEnterpriseSoundEffect(effect);
  }

  /**
   * Play celebration sound based on level (1-5)
   */
  async playCelebrationByLevel(level: 1 | 2 | 3 | 4 | 5) {
    switch (level) {
      case 1:
        await this.playNotification();
        break;
      case 2:
        await this.playSuccess();
        break;
      case 3:
        await this.playPointsEarned();
        break;
      case 4:
        await this.playAchievementUnlocked();
        break;
      case 5:
        await this.playFamilyCelebration();
        break;
      default:
        await this.playNotification();
    }
  }

  /**
   * Modal open sound
   */
  async playModalOpen() {
    await this.soundLibrary.playModalOpen();
  }

  /**
   * Modal close sound
   */
  async playModalClose() {
    await this.soundLibrary.playModalClose();
  }

  /**
   * Family notification sound
   */
  async playFamilyNotification() {
    await this.soundLibrary.playFamilyNotification();
  }

  /**
   * Urgent alert sound
   */
  async playUrgentAlert() {
    await this.soundLibrary.playUrgentAlert();
  }

  /**
   * Celebration sound
   */
  async playCelebration() {
    await this.soundLibrary.playCelebration();
  }
}

// Export singleton instance
export const soundService = SoundService.getInstance();
export default soundService; 
