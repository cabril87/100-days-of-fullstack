'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Trophy, Star, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import type { 
  Toast, 
  ToastContextType, 
  TaskCompletionCelebrationParams,
  CelebrationEvent
} from '@/lib/types/celebrations';



const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Helper functions first
  const getRandomColor = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d', '#6c5ce7', '#fd79a8'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getSoundText = (type: Toast['type']) => {
    switch (type) {
      case 'achievement':
        return 'Achievement unlocked!';
      case 'celebration':
        return 'Celebration!';
      case 'success':
        return 'Success!';
      default:
        return 'Notification';
    }
  };

  const triggerConfetti = useCallback(() => {
    // Create confetti animation
    const confettiCount = 50;
    const container = document.body;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: 8px;
        height: 8px;
        background: ${getRandomColor()};
        z-index: 10000;
        pointer-events: none;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
      `;
      
      container.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
  }, []);

  const playNotificationSound = useCallback((type: Toast['type']) => {
    // In a real app, you'd play actual sound files
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(getSoundText(type));
      utterance.volume = 0.1;
      utterance.rate = 1.5;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || (toast.persistent ? undefined : 5000)
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts

    // Auto-remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        // Use functional state update to avoid dependency on removeToast
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
      }, newToast.duration);
    }

    // Trigger celebration effects
    if (newToast.confetti) {
      triggerConfetti();
    }
    if (newToast.sound) {
      playNotificationSound(newToast.type);
    }
  }, [triggerConfetti, playNotificationSound]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Listen for task completion events
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      addToast(event.detail);
    };

    const handleTaskCompletion = (event: CustomEvent<CelebrationEvent>) => {
      const { type } = event.detail;
      
      if (type === 'confetti') {
        triggerConfetti();
      } else if (type === 'sound') {
        playNotificationSound('achievement');
      }
    };

    window.addEventListener('showToast', handleToastEvent as EventListener);
    window.addEventListener('taskCompletionCelebration', handleTaskCompletion as EventListener);

    return () => {
      window.removeEventListener('showToast', handleToastEvent as EventListener);
      window.removeEventListener('taskCompletionCelebration', handleTaskCompletion as EventListener);
    };
  }, [addToast, triggerConfetti, playNotificationSound]);



  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'celebration':
        return <Star className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20';
      case 'error':
        return 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20';
      case 'warning':
        return 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20';
      case 'achievement':
        return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:border-yellow-600 dark:bg-gradient-to-r dark:from-yellow-900/20 dark:to-orange-900/20';
      case 'celebration':
        return 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 dark:border-purple-600 dark:bg-gradient-to-r dark:from-purple-900/20 dark:to-pink-900/20';
      default:
        return 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 
              transform animate-in slide-in-from-right-full fade-in
              ${getToastStyles(toast.type)}
              ${toast.type === 'achievement' || toast.type === 'celebration' ? 'ring-2 ring-yellow-300 dark:ring-yellow-600' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getToastIcon(toast.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {toast.title}
                  </h4>
                  {(toast.type === 'achievement' || toast.type === 'celebration') && (
                    <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600 dark:text-yellow-400">
                      ✨ New!
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  {toast.message}
                </p>

                {/* Achievement List */}
                {toast.achievementsUnlocked && toast.achievementsUnlocked.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {toast.achievementsUnlocked.slice(0, 2).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {achievement.name || achievement.title}
                        </span>
                        {achievement.points && (
                          <Badge variant="secondary" className="text-xs">
                            +{achievement.points}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {toast.achievementsUnlocked.length > 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{toast.achievementsUnlocked.length - 2} more achievements
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  {toast.actionUrl && toast.actionText && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => {
                        window.location.href = toast.actionUrl!;
                        removeToast(toast.id);
                      }}
                    >
                      {toast.actionText}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeToast(toast.id)}
                    className="text-xs h-6 px-2 ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confetti Animation Styles */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        
        .slide-in-from-right-full {
          transform: translateX(100%);
        }
        
        .fade-in {
          opacity: 0;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// Hook for easy task completion toasts
export const useTaskCompletion = () => {
  const { addToast } = useToast();

  const celebrateTaskCompletion = useCallback((params: TaskCompletionCelebrationParams) => {
    const { taskTitle, pointsEarned, achievementsUnlocked, levelUp } = params;

    // Main completion toast
    addToast({
      type: 'success',
      title: 'Task Completed! 🎉',
      message: `"${taskTitle}" completed! +${pointsEarned} points earned!`,
      duration: 4000,
      confetti: pointsEarned >= 25,
      sound: true
    });

    // Achievement toasts
    if (achievementsUnlocked && achievementsUnlocked.length > 0) {
      setTimeout(() => {
        addToast({
          type: 'achievement',
          title: 'Achievement Unlocked! 🏆',
          message: `You've unlocked ${achievementsUnlocked.length} new achievement${achievementsUnlocked.length > 1 ? 's' : ''}!`,
          achievementsUnlocked,
          duration: 6000,
          actionUrl: '/gamification',
          actionText: 'View Achievements',
          confetti: true,
          sound: true
        });
      }, 1000);
    }

    // Level up toast
    if (levelUp) {
      setTimeout(() => {
        addToast({
          type: 'celebration',
          title: 'Level Up! ⭐',
          message: `Congratulations! You've reached Level ${levelUp.newLevel}!`,
          duration: 5000,
          actionUrl: '/gamification',
          actionText: 'View Progress',
          confetti: true,
          sound: true
        });
      }, achievementsUnlocked?.length ? 2500 : 1500);
    }
  }, [addToast]);

  return { celebrateTaskCompletion };
}; 