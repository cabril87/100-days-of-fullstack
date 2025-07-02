/**
 * Trigger haptic feedback on supported devices
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'start' | 'success' | 'error' = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return false;
  }

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [50],
    start: [20, 50],
    success: [10, 50, 10],
    error: [50, 100, 50]
  };

  try {
    navigator.vibrate(patterns[type]);
    return true;
  } catch (error) {
    console.warn('Haptic feedback not supported:', error);
    return false;
  }
} 