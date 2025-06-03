import { useToast } from './useToast';

/**
 * Safe toast hook that handles cases where ToastProvider is not available
 * Useful for pages that might be statically generated
 */
export function useSafeToast() {
  try {
    const toast = useToast();
    return {
      showToast: toast.showToast,
      isAvailable: true
    };
  } catch (error) {
    console.log('Toast provider not available, using fallback');
    return {
      showToast: (message: string, type: string = 'info') => {
        console.log(`Toast [${type}]: ${message}`);
      },
      isAvailable: false
    };
  }
} 