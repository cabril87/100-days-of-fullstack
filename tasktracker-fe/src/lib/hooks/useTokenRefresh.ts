import { useEffect, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';

interface ParsedToken {
  exp?: number;
  iat?: number;
  sub?: string;
}

export const useTokenRefresh = (): void => {
  const { refreshAccessToken, accessToken, isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Parse JWT token to get expiration time
    const parseJwt = (token: string): ParsedToken | null => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload) as ParsedToken;
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
      }
    };

    const tokenData = parseJwt(accessToken);
    if (!tokenData?.exp) return;

    const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Refresh 5 minutes before expiration
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000);

    intervalRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [accessToken, isAuthenticated, refreshAccessToken]);
}; 