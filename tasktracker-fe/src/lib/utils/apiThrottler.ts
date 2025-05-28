/**
 * API Request Throttling Utility
 * 
 * Prevents too many requests to the same endpoint within a time window
 */

interface ThrottleEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

class ApiThrottler {
  private throttleMap: Map<string, ThrottleEntry> = new Map();
  private readonly maxRequestsPerMinute: number = 10;
  private readonly timeWindow: number = 60 * 1000; // 1 minute
  private readonly minDelay: number = 100; // 100ms minimum delay between requests

  /**
   * Check if a request is allowed for the given endpoint
   */
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const entry = this.throttleMap.get(endpoint);

    if (!entry) {
      this.throttleMap.set(endpoint, {
        count: 1,
        resetTime: now + this.timeWindow,
        lastRequest: now
      });
      return true;
    }

    // Reset counter if time window has passed
    if (now >= entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + this.timeWindow;
      entry.lastRequest = now;
      return true;
    }

    // Check if minimum delay has passed
    if (now - entry.lastRequest < this.minDelay) {
      console.warn(`[ApiThrottler] Request to ${endpoint} blocked - minimum delay not met`);
      return false;
    }

    // Check if we've exceeded the rate limit
    if (entry.count >= this.maxRequestsPerMinute) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      console.warn(`[ApiThrottler] Rate limit exceeded for ${endpoint}. Reset in ${remainingTime}s`);
      return false;
    }

    // Allow the request
    entry.count++;
    entry.lastRequest = now;
    return true;
  }

  /**
   * Get the delay until the next request is allowed
   */
  getDelayUntilNextRequest(endpoint: string): number {
    const now = Date.now();
    const entry = this.throttleMap.get(endpoint);

    if (!entry) {
      return 0;
    }

    // Check minimum delay
    const minDelayRemaining = Math.max(0, this.minDelay - (now - entry.lastRequest));

    // Check rate limit
    if (entry.count >= this.maxRequestsPerMinute && now < entry.resetTime) {
      return Math.max(minDelayRemaining, entry.resetTime - now);
    }

    return minDelayRemaining;
  }

  /**
   * Wait for the throttle to allow a request
   */
  async waitForRequest(endpoint: string): Promise<void> {
    const delay = this.getDelayUntilNextRequest(endpoint);
    if (delay > 0) {
      console.log(`[ApiThrottler] Waiting ${delay}ms before request to ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Make a throttled request
   */
  async throttledRequest<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    options: { 
      skipThrottle?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T> {
    const { skipThrottle = false, maxRetries = 3 } = options;

    if (skipThrottle) {
      return requestFn();
    }

    let retries = 0;
    while (retries <= maxRetries) {
      if (this.canMakeRequest(endpoint)) {
        try {
          return await requestFn();
        } catch (error) {
          // If we get a 429 error, wait longer and retry
          if (error instanceof Error && error.message.includes('429')) {
            retries++;
            if (retries <= maxRetries) {
              const backoffDelay = Math.min(5000, 1000 * Math.pow(2, retries)); // Exponential backoff
              console.warn(`[ApiThrottler] 429 error, retrying in ${backoffDelay}ms (attempt ${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
              continue;
            }
          }
          throw error;
        }
      } else {
        await this.waitForRequest(endpoint);
        retries++;
      }
    }

    throw new Error(`[ApiThrottler] Max retries exceeded for ${endpoint}`);
  }

  /**
   * Clear throttle data for an endpoint
   */
  clearThrottle(endpoint: string): void {
    this.throttleMap.delete(endpoint);
  }

  /**
   * Clear all throttle data
   */
  clearAllThrottles(): void {
    this.throttleMap.clear();
  }

  /**
   * Get throttle status for debugging
   */
  getThrottleStatus(): Record<string, ThrottleEntry> {
    const status: Record<string, ThrottleEntry> = {};
    this.throttleMap.forEach((value, key) => {
      status[key] = { ...value };
    });
    return status;
  }
}

// Export a singleton instance
export const apiThrottler = new ApiThrottler();

// Export debounce utility for component-level request debouncing
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Export throttle utility for limiting function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      return func(...args);
    }
  }) as T;
} 