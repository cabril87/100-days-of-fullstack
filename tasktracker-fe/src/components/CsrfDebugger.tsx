'use client';

import { useState, useEffect } from 'react';

export default function CsrfDebugger() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  
  const getCsrfToken = (): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('XSRF-TOKEN=')) {
        const encodedToken = trimmed.substring('XSRF-TOKEN='.length);
        try {
          return decodeURIComponent(encodedToken);
        } catch (e) {
          console.error('Error decoding token:', e);
          return encodedToken;
        }
      }
    }
    return null;
  };
  
  const fetchNewToken = async () => {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        setTimeout(() => {
          const token = getCsrfToken();
          setCsrfToken(token);
          setLastChecked(new Date().toLocaleTimeString());
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };
  
  useEffect(() => {
    const token = getCsrfToken();
    setCsrfToken(token);
    setLastChecked(new Date().toLocaleTimeString());
  }, []);
  
  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded text-xs"
      >
        Debug CSRF
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50 w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-700">CSRF Token Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-500 mb-1">CSRF Token:</div>
        <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
          {csrfToken || 'No token found'}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        Last checked: {lastChecked}
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => {
            const token = getCsrfToken();
            setCsrfToken(token);
            setLastChecked(new Date().toLocaleTimeString());
          }}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
        >
          Check Token
        </button>
        <button 
          onClick={fetchNewToken}
          className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200"
        >
          Fetch New Token
        </button>
      </div>
    </div>
  );
} 