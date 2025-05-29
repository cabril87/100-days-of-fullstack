'use client';

import React, { useEffect } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { useToast } from '@/lib/hooks/useToast';

interface FocusKeyboardShortcutsProps {
  enabled?: boolean;
}

export function FocusKeyboardShortcuts({ enabled = true }: FocusKeyboardShortcutsProps) {
  const { 
    currentSession, 
    startFocusSession, 
    endFocusSession, 
    pauseFocusSession, 
    resumeFocusSession 
  } = useFocus();
  const { showToast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      // Check for modifier keys (Ctrl/Cmd + Shift + key)
      const isModifierPressed = (event.ctrlKey || event.metaKey) && event.shiftKey;
      
      if (!isModifierPressed) return;

      switch (event.key.toLowerCase()) {
        case 's': // Ctrl/Cmd + Shift + S: Start/Stop session
          event.preventDefault();
          if (currentSession) {
            if (currentSession.status === 'InProgress') {
              endFocusSession();
              showToast('Focus session ended via keyboard shortcut', 'success');
            } else if (currentSession.status === 'Paused') {
              resumeFocusSession(currentSession.id);
              showToast('Focus session resumed via keyboard shortcut', 'success');
            }
          } else {
            // Navigate to focus page to start new session with task selection
            if (typeof window !== 'undefined') {
              window.location.href = '/focus';
            }
          }
          break;

        case 'n': // Ctrl/Cmd + Shift + N: Start new session with task selection
          event.preventDefault();
          if (currentSession) {
            showToast('Please end current session before starting a new one', 'warning');
          } else {
            // Navigate to focus page to start new session with task selection
            if (typeof window !== 'undefined') {
              window.location.href = '/focus';
            }
          }
          break;

        case 'p': // Ctrl/Cmd + Shift + P: Pause/Resume session
          event.preventDefault();
          if (currentSession) {
            if (currentSession.status === 'InProgress') {
              pauseFocusSession(currentSession.id);
              showToast('Focus session paused via keyboard shortcut', 'success');
            } else if (currentSession.status === 'Paused') {
              resumeFocusSession(currentSession.id);
              showToast('Focus session resumed via keyboard shortcut', 'success');
            }
          } else {
            showToast('No active session to pause/resume', 'warning');
          }
          break;

        case 'e': // Ctrl/Cmd + Shift + E: End session
          event.preventDefault();
          if (currentSession) {
            endFocusSession();
            showToast('Focus session ended via keyboard shortcut', 'success');
          } else {
            showToast('No active session to end', 'warning');
          }
          break;

        case 'h': // Ctrl/Cmd + Shift + H: Show help
          event.preventDefault();
          showKeyboardShortcutsHelp();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, currentSession, startFocusSession, endFocusSession, pauseFocusSession, resumeFocusSession, showToast]);

  const showKeyboardShortcutsHelp = () => {
    const shortcuts = [
      'Ctrl+Shift+S - Start/Stop focus session',
      'Ctrl+Shift+N - Start new session with task selection',
      'Ctrl+Shift+P - Pause/Resume session',
      'Ctrl+Shift+E - End current session',
      'Ctrl+Shift+H - Show this help'
    ];

    showToast(
      `Keyboard Shortcuts:\n${shortcuts.join('\n')}`,
      'info'
    );
  };

  // This component doesn't render anything visible
  return null;
}

// Hook for components that want to show keyboard shortcuts help
export function useKeyboardShortcuts() {
  const showKeyboardShortcutsHelp = () => {
    const shortcuts = [
      { key: 'Ctrl+Shift+S', action: 'Start/Stop focus session' },
      { key: 'Ctrl+Shift+N', action: 'Start new session with task selection' },
      { key: 'Ctrl+Shift+P', action: 'Pause/Resume session' },
      { key: 'Ctrl+Shift+E', action: 'End current session' },
      { key: 'Ctrl+Shift+H', action: 'Show keyboard shortcuts' }
    ];

    return shortcuts;
  };

  return { showKeyboardShortcutsHelp };
}

// Component to display keyboard shortcuts in a help dialog or tooltip
export function KeyboardShortcutsHelp({ className }: { className?: string }) {
  const { showKeyboardShortcutsHelp } = useKeyboardShortcuts();
  const shortcuts = showKeyboardShortcutsHelp();

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{shortcut.action}</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Ctrl+Shift+H (or Cmd+Shift+H on Mac) to show shortcuts anytime
      </p>
    </div>
  );
} 