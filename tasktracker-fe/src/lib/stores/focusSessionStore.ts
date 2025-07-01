/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import type { 
  FocusSession, 
  FocusSessionState,
  TimerState
} from '@/lib/types/focus';

// ============================================================================
// PERSISTENT STORE INTERFACES - ENTERPRISE TYPESCRIPT STANDARDS
// ============================================================================

interface PersistedSessionData {
  session: FocusSession | null;
  focusState: FocusSessionState;
  timerState: TimerState;
  sessionStartTime: string | null; // ISO string for accurate time tracking
  pausedDuration: number; // Total paused time in seconds
  lastActivity: string; // ISO string for session validation
  userId: string | null;
}

interface FocusSessionStoreState extends PersistedSessionData {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type FocusSessionStoreListener = (state: FocusSessionStoreState) => void;

// ============================================================================
// ENTERPRISE FOCUS SESSION STORE - PERSISTENT STATE MANAGEMENT
// ============================================================================

class FocusSessionStore {
  private static readonly STORAGE_KEY = 'tasktracker_focus_session';
  private static readonly STORAGE_VERSION = '1.0';
  private static readonly SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  private state: FocusSessionStoreState;
  private listeners: Set<FocusSessionStoreListener> = new Set();
  private timerInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.getInitialState();
    this.initializeStore();
  }

  // ============================================================================
  // INITIALIZATION & PERSISTENCE MANAGEMENT
  // ============================================================================

  private getInitialState(): FocusSessionStoreState {
    return {
      session: null,
      focusState: 'NO_SESSION',
      timerState: {
        elapsedSeconds: 0,
        isRunning: false,
        isPaused: false,
        displayTime: '00:00'
      },
      sessionStartTime: null,
      pausedDuration: 0,
      lastActivity: new Date().toISOString(),
      userId: null,
      isLoading: false,
      error: null,
      isInitialized: false
    };
  }

  private async initializeStore(): Promise<void> {
    try {
      // Load persisted state
      await this.loadFromStorage();
      
      // Validate and restore session if needed
      await this.validateAndRestoreSession();
      
      // Start sync interval for cross-tab communication
      this.startSyncInterval();
      
      // Listen for storage changes from other tabs
      this.setupStorageListener();
      
      this.updateState({ isInitialized: true });
    } catch (error) {
      console.error('🚨 FocusStore: Initialization failed:', error);
      this.updateState({ 
        error: 'Failed to initialize focus session store',
        isInitialized: true 
      });
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem(FocusSessionStore.STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      
      // Validate storage version and structure
      if (parsed.version !== FocusSessionStore.STORAGE_VERSION) {
        console.log('🔄 FocusStore: Storage version mismatch, clearing old data');
        localStorage.removeItem(FocusSessionStore.STORAGE_KEY);
        return;
      }

      const persistedData: PersistedSessionData = parsed.data;
      
      // Validate session timeout
      const lastActivity = new Date(persistedData.lastActivity);
      const now = new Date();
      
      if (now.getTime() - lastActivity.getTime() > FocusSessionStore.SESSION_TIMEOUT_MS) {
        console.log('⏰ FocusStore: Session expired, clearing data');
        localStorage.removeItem(FocusSessionStore.STORAGE_KEY);
        return;
      }

      // Restore state
      this.state = {
        ...this.state,
        ...persistedData
      };

      console.log('✅ FocusStore: State loaded from storage', {
        hasSession: !!this.state.session,
        focusState: this.state.focusState,
        elapsedSeconds: this.state.timerState.elapsedSeconds
      });

    } catch (error) {
      console.error('🚨 FocusStore: Failed to load from storage:', error);
      localStorage.removeItem(FocusSessionStore.STORAGE_KEY);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const persistedData: PersistedSessionData = {
        session: this.state.session,
        focusState: this.state.focusState,
        timerState: this.state.timerState,
        sessionStartTime: this.state.sessionStartTime,
        pausedDuration: this.state.pausedDuration,
        lastActivity: new Date().toISOString(),
        userId: this.state.userId
      };

      const storageData = {
        version: FocusSessionStore.STORAGE_VERSION,
        data: persistedData
      };

      localStorage.setItem(FocusSessionStore.STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('🚨 FocusStore: Failed to save to storage:', error);
    }
  }

  private async validateAndRestoreSession(): Promise<void> {
    if (!this.state.session || !this.state.sessionStartTime) return;

    try {
      // Calculate accurate elapsed time including any time since last save
      const sessionStart = new Date(this.state.sessionStartTime);
      const now = new Date();
      const totalElapsed = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      const adjustedElapsed = Math.max(0, totalElapsed - this.state.pausedDuration);

      // Update timer state with accurate time
      const updatedTimerState: TimerState = {
        ...this.state.timerState,
        elapsedSeconds: adjustedElapsed,
        displayTime: this.formatTime(adjustedElapsed)
      };

      this.updateState({
        timerState: updatedTimerState
      });

      // Resume timer if session was running
      if (this.state.focusState === 'IN_PROGRESS' && this.state.timerState.isRunning) {
        this.startTimer();
      }

      console.log('🔄 FocusStore: Session restored', {
        sessionId: this.state.session.id,
        taskTitle: this.state.session.taskItem?.title,
        elapsedSeconds: adjustedElapsed,
        displayTime: this.formatTime(adjustedElapsed)
      });

    } catch (error) {
      console.error('🚨 FocusStore: Session restoration failed:', error);
      this.clearSession();
    }
  }

  // ============================================================================
  // TIMER MANAGEMENT - ACCURATE TIME TRACKING
  // ============================================================================

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (!this.state.sessionStartTime) return;

      const sessionStart = new Date(this.state.sessionStartTime);
      const now = new Date();
      const totalElapsed = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      const adjustedElapsed = Math.max(0, totalElapsed - this.state.pausedDuration);

      this.updateState({
        timerState: {
          ...this.state.timerState,
          elapsedSeconds: adjustedElapsed,
          displayTime: this.formatTime(adjustedElapsed),
          isRunning: true,
          isPaused: false
        }
      });

      // Auto-save every minute
      if (adjustedElapsed % 60 === 0) {
        this.saveToStorage();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ============================================================================
  // CROSS-TAB SYNCHRONIZATION
  // ============================================================================

  private startSyncInterval(): void {
    // Sync state every 30 seconds
    this.syncInterval = setInterval(() => {
      this.saveToStorage();
    }, 30000);
  }

  private setupStorageListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key === FocusSessionStore.STORAGE_KEY) {
        // Reload state from storage when changed by another tab
        this.loadFromStorage().then(() => {
          this.notifyListeners();
        });
      }
    });

    // Handle visibility change for cross-tab sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.loadFromStorage().then(() => {
          this.validateAndRestoreSession();
        });
      }
    });
  }

  // ============================================================================
  // STATE MANAGEMENT & LISTENERS
  // ============================================================================

  private updateState(partial: Partial<FocusSessionStoreState>): void {
    this.state = { ...this.state, ...partial };
    this.saveToStorage();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('🚨 FocusStore: Listener error:', error);
      }
    });
  }

  subscribe(listener: FocusSessionStoreListener): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ============================================================================
  // PUBLIC API - SESSION MANAGEMENT
  // ============================================================================

  getState(): FocusSessionStoreState {
    return { ...this.state };
  }

  async startSession(session: FocusSession, userId: string): Promise<void> {
    const now = new Date();
    
    this.updateState({
      session,
      focusState: 'IN_PROGRESS',
      sessionStartTime: now.toISOString(),
      pausedDuration: 0,
      userId,
      timerState: {
        elapsedSeconds: 0,
        isRunning: true,
        isPaused: false,
        displayTime: '00:00'
      },
      error: null
    });

    this.startTimer();
    
    console.log('🚀 FocusStore: Session started', {
      sessionId: session.id,
      taskTitle: session.taskItem?.title,
      userId
    });
  }

  async pauseSession(): Promise<void> {
    if (this.state.focusState !== 'IN_PROGRESS') return;

    this.stopTimer();
    
    this.updateState({
      focusState: 'PAUSED',
      timerState: {
        ...this.state.timerState,
        isRunning: false,
        isPaused: true
      }
    });

    console.log('⏸️ FocusStore: Session paused');
  }

  async resumeSession(): Promise<void> {
    if (this.state.focusState !== 'PAUSED') return;

    this.updateState({
      focusState: 'IN_PROGRESS',
      timerState: {
        ...this.state.timerState,
        isRunning: true,
        isPaused: false
      }
    });

    this.startTimer();
    
    console.log('▶️ FocusStore: Session resumed');
  }

  async completeSession(): Promise<void> {
    this.stopTimer();
    
    const completedSession = this.state.session;
    
    this.updateState({
      session: null,
      focusState: 'NO_SESSION',
      sessionStartTime: null,
      pausedDuration: 0,
      timerState: {
        elapsedSeconds: 0,
        isRunning: false,
        isPaused: false,
        displayTime: '00:00'
      }
    });

    console.log('✅ FocusStore: Session completed', {
      sessionId: completedSession?.id,
      elapsedMinutes: Math.floor((this.state.timerState.elapsedSeconds || 0) / 60)
    });
  }

  async clearSession(): Promise<void> {
    this.stopTimer();
    
    this.updateState({
      session: null,
      focusState: 'NO_SESSION',
      sessionStartTime: null,
      pausedDuration: 0,
      timerState: {
        elapsedSeconds: 0,
        isRunning: false,
        isPaused: false,
        displayTime: '00:00'
      },
      error: null
    });

    console.log('🗑️ FocusStore: Session cleared');
  }

  async updateSessionData(session: FocusSession): Promise<void> {
    if (!this.state.session || this.state.session.id !== session.id) return;

    this.updateState({
      session: { ...session }
    });

    console.log('🔄 FocusStore: Session data updated');
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    this.stopTimer();
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.listeners.clear();
    console.log('🧹 FocusStore: Store destroyed');
  }
}

// ============================================================================
// SINGLETON INSTANCE - ENTERPRISE PATTERN
// ============================================================================

export const focusSessionStore = new FocusSessionStore();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    focusSessionStore.destroy();
  });
} 