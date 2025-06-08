'use client';

import { useState } from 'react';
import { authService } from '@/lib/services/authService';

export default function CookieTestClient() {
  const [result, setResult] = useState<{ type: string; data?: unknown; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    emailOrUsername: '',
    password: ''
  });

  const testCookieAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/v1/auth/cookie-test', {
        credentials: 'include',
      });
      const data = await response.json();
      setResult({ type: 'cookie-test', data });
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    if (!credentials.emailOrUsername || !credentials.password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.loginWithCookie(credentials);
      setResult({ type: 'login', data: response });
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testGetMe = async () => {
    setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      setResult({ type: 'get-me', data: response });
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await authService.logoutWithCookie();
      setResult({ type: 'logout', data: response });
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Cookie Authentication Test</h1>
          
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email/Username
                </label>
                <input
                  type="text"
                  value={credentials.emailOrUsername}
                  onChange={(e) => setCredentials(prev => ({ ...prev, emailOrUsername: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email or username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={testCookieAuth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Test Cookie Auth
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Login
            </button>
            
            <button
              onClick={testGetMe}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Get /me
            </button>
            
            <button
              onClick={testLogout}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Logout
            </button>
          </div>

          {loading && (
            <div className="text-center text-gray-600 mb-4">
              Loading...
            </div>
          )}

          {result && (
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Result ({result.type}):
              </h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 