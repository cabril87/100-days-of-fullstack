import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';

interface AnimatedStateProps {
  state: 'loading' | 'success' | 'error' | 'warning';
  title: string;
  message?: string;
  onRetry?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}

export const AnimatedState: React.FC<AnimatedStateProps> = ({
  state,
  title,
  message,
  onRetry,
  autoHide = false,
  duration = 3000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 100);

    if (autoHide && state !== 'loading') {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [state, autoHide, duration]);

  if (!isVisible) return null;

  const getStateConfig = () => {
    switch (state) {
      case 'loading':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900 dark:text-blue-100'
        };
      case 'success':
        return {
          icon: <Check className="h-8 w-8" />,
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-500',
          titleColor: 'text-green-900 dark:text-green-100'
        };
      case 'error':
        return {
          icon: <X className="h-8 w-8" />,
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900 dark:text-red-100'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-8 w-8" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-900 dark:text-yellow-100'
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className={`
      fixed inset-0 flex items-center justify-center z-50 p-4
      ${isAnimating ? 'animate-in fade-in duration-300' : ''}
      ${className}
    `}>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div className={`
        relative max-w-md w-full p-6 rounded-xl border shadow-xl
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}
      `}>
        {/* Animated icon */}
        <div className={`
          w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
          ${config.bgColor} ${config.iconColor}
          transform transition-transform duration-500 ease-out
          ${state === 'success' ? 'animate-bounce' : state === 'error' ? 'animate-pulse' : ''}
        `}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>
            {title}
          </h3>
          
          {message && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {message}
            </p>
          )}

          {/* Action buttons */}
          {state === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          )}

          {state !== 'loading' && !onRetry && (
            <button
              onClick={() => setIsVisible(false)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors duration-200
                ${config.iconColor.replace('text-', 'bg-').replace('500', '500')} 
                text-white hover:opacity-90
              `}
            >
              Continue
            </button>
          )}
        </div>

        {/* Progress bar for loading */}
        {state === 'loading' && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual state components for convenience
export const LoadingState: React.FC<Omit<AnimatedStateProps, 'state'>> = (props) => (
  <AnimatedState {...props} state="loading" />
);

export const SuccessState: React.FC<Omit<AnimatedStateProps, 'state'>> = (props) => (
  <AnimatedState {...props} state="success" />
);

export const ErrorState: React.FC<Omit<AnimatedStateProps, 'state'>> = (props) => (
  <AnimatedState {...props} state="error" />
);

export const WarningState: React.FC<Omit<AnimatedStateProps, 'state'>> = (props) => (
  <AnimatedState {...props} state="warning" />
);

export default AnimatedState; 