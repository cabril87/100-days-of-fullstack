'use client';

import { useState, useEffect } from 'react';

type EndpointTest = {
  name: string;
  url: string;
  requiresAuth: boolean;
  method: string;
  testData?: object;
  description: string;
};

const API_ENDPOINTS: EndpointTest[] = [
  { 
    name: 'Health Check', 
    url: '/v1/health', 
    requiresAuth: false,
    method: 'GET',
    description: 'Basic API health status - should always work'
  },
  { 
    name: 'Tasks List', 
    url: '/v1/taskitems', 
    requiresAuth: true,
    method: 'GET',
    description: 'Get all tasks (requires authentication)'
  },
  { 
    name: 'User Profile', 
    url: '/v1/auth/profile', 
    requiresAuth: true,
    method: 'GET',
    description: 'Get current user profile (requires authentication)'
  },
  { 
    name: 'Get CSRF', 
    url: '/v1/auth/csrf', 
    requiresAuth: false,
    method: 'GET',
    description: 'Get CSRF token for API requests'
  },
  { 
    name: 'Login', 
    url: '/v1/auth/login', 
    requiresAuth: false,
    method: 'POST',
    testData: {
      emailOrUsername: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    },
    description: 'Login with email/username and password'
  },
  { 
    name: 'Register User', 
    url: '/v1/auth/register', 
    requiresAuth: false,
    method: 'POST',
    testData: {
      username: "newaccount",
      email: process.env.NEXT_PUBLIC_USER_EMAIL,
      password: process.env.NEXT_PUBLIC_USER_PASSWORD,
      confirmPassword: process.env.NEXT_PUBLIC_USER_PASSWORD,
      firstName: "New",
      lastName: "Account"
    },
    description: 'Register a new user'
  },
  {
    name: 'CSRF Test',
    url: '/v1/auth/login',
    requiresAuth: false,
    method: 'MANUAL',
    testData: {
      emailOrUsername: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    },
    description: 'Test all possible CSRF header formats to find which one works'
  }
];

export default function ApiTest() {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [baseUrl, setBaseUrl] = useState<string>('http://localhost:5000/api');
  const [useCredentials, setUseCredentials] = useState<boolean>(true); 
  const [corsOptions, setCorsOptions] = useState<boolean>(false);
  const [browserOrigin, setBrowserOrigin] = useState<string>('');
  const [testData, setTestData] = useState<Record<string, any>>({});
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [allCookies, setAllCookies] = useState<string>('');
  const [authHeader, setAuthHeader] = useState<boolean>(false);

  useEffect(() => {
    const initialTestData: Record<string, any> = {};
    API_ENDPOINTS.forEach(endpoint => {
      if (endpoint.testData) {
        initialTestData[endpoint.name] = JSON.stringify(endpoint.testData, null, 2);
      }
    });
    setTestData(initialTestData);
  }, []);

  function getAllCookies() {
    return document.cookie;
  }

  function getCsrfTokenFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('XSRF-TOKEN=')) {
        const encodedToken = cookie.substring('XSRF-TOKEN='.length, cookie.length);
        try {
          return decodeURIComponent(encodedToken);
        } catch (e) {
          console.error('Error decoding CSRF token:', e);
          return encodedToken;
        }
      }
    }
    return null;
  }

  function updateCookieDisplay() {
    setAllCookies(getAllCookies());
    const token = getCsrfTokenFromCookies();
    if (token) {
      setCsrfToken(token);
    }
  }

  async function fetchCsrfToken() {
    setLoading(prev => ({ ...prev, 'Get CSRF': true }));
    try {
      const response = await fetch(`${baseUrl}/v1/auth/csrf`, {
        method: 'GET',
        credentials: 'include', 
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { rawText: text };
      }
      
      setTimeout(() => {
        updateCookieDisplay();
      }, 100);
      
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      setTestResults(prev => ({
        ...prev,
        'Get CSRF': {
          status: response.status,
          statusText: response.statusText,
          data,
          headers,
          time: new Date().toISOString(),
          success: true
        }
      }));
    } catch (error) {
      console.error(`CSRF token fetch failed:`, error);
      setTestResults(prev => ({
        ...prev,
        'Get CSRF': {
          error: error instanceof Error ? error.message : String(error),
          time: new Date().toISOString(),
          success: false
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, 'Get CSRF': false }));
    }
  }

  async function testEndpoint(endpoint: EndpointTest) {
    setLoading(prev => ({ ...prev, [endpoint.name]: true }));
    
    try {
      updateCookieDisplay();
      
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      const headersObj: Record<string, string> = options.headers as Record<string, string>;
      
      if (endpoint.method !== 'GET' && csrfToken) {
        headersObj['X-XSRF-TOKEN'] = csrfToken;
        console.log('Using X-XSRF-TOKEN:', csrfToken);
        
        headersObj['X-CSRF-TOKEN'] = csrfToken;
        console.log('Using X-CSRF-TOKEN:', csrfToken);
        
        headersObj['RequestVerificationToken'] = csrfToken;
        console.log('Using RequestVerificationToken:', csrfToken);
      }
      
      if (authHeader && accessToken && endpoint.requiresAuth) {
        headersObj['Authorization'] = `Bearer ${accessToken}`;
        console.log('Using Authorization header with token');
      }
      
      if (['POST', 'PUT'].includes(endpoint.method) && testData[endpoint.name]) {
        try {
          options.body = testData[endpoint.name];
        } catch (e) {
          console.error('Error parsing JSON test data', e);
        }
      }
      
      if (useCredentials) {
        options.credentials = 'include';
      }
      
      console.log(`Testing ${endpoint.method} ${baseUrl}${endpoint.url}`, options);
      
      const response = await fetch(`${baseUrl}${endpoint.url}`, options);
      
      setTimeout(() => {
        updateCookieDisplay();
      }, 100);
      
      const text = await response.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { rawText: text };
      }
      
      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        console.log('Received access token from response', data.accessToken.substring(0, 15) + '...');
      }
      
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: response.status,
          statusText: response.statusText,
          data,
          headers,
          time: new Date().toISOString(),
          success: true
        }
      }));
    } catch (error) {
      console.error(`API test for ${endpoint.name} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          error: error instanceof Error ? error.message : String(error),
          time: new Date().toISOString(),
          success: false
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint.name]: false }));
    }
  }

  async function fetchHealthForCsrf() {
    try {
      const response = await fetch(`${baseUrl}/v1/health`, {
        method: 'GET',
        credentials: 'include'
      });
      
      setTimeout(() => {
        updateCookieDisplay();
      }, 100);
      
      return response.ok;
    } catch (error) {
      console.error('Error fetching health endpoint:', error);
      return false;
    }
  }

  async function testAllEndpoints() {
    await fetchHealthForCsrf();
    
    for (const endpoint of API_ENDPOINTS) {
      await testEndpoint(endpoint);
    }
  }

  function handleTestDataChange(endpointName: string, value: string) {
    setTestData(prev => ({
      ...prev,
      [endpointName]: value
    }));
  }

  useEffect(() => {
    setBrowserOrigin(window.location.origin);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    setBaseUrl(apiUrl);
    
    setTimeout(() => {
      updateCookieDisplay();
    }, 500);
  }, []);

  async function testLoginWithAllCsrfFormats() {
    setLoading(prev => ({ ...prev, 'CSRF Test': true }));
    
    try {
      await fetchCsrfToken();
      
      updateCookieDisplay();
      const csrfTokenValue = csrfToken;
      
      console.log('Testing login with CSRF token:', csrfTokenValue);
      
      const loginData = {
        emailOrUsername: "admin@tasktracker.com",
        password: "password"
      };
      
      interface LoginDataWithCsrf {
        emailOrUsername: string;
        password: string;
        csrfToken?: string;
      }
      
      const headerFormats = [
        { name: 'X-XSRF-TOKEN', decoded: true, inBody: true },
        { name: 'X-XSRF-TOKEN', decoded: true, inBody: false },
        { name: 'X-CSRF-TOKEN', decoded: true, inBody: true },
        { name: 'X-CSRF-TOKEN', decoded: true, inBody: false },
        { name: 'RequestVerificationToken', decoded: true, inBody: true },
        { name: 'RequestVerificationToken', decoded: false, inBody: false },
        { name: '__RequestVerificationToken', decoded: true, inBody: false }
      ];
      
      let successfulFormat = null;
      
      for (const format of headerFormats) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        let tokenValue = csrfTokenValue;
        if (!format.decoded) {
          const cookies = document.cookie.split(';');
          const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
          if (csrfCookie) {
            tokenValue = csrfCookie.split('=')[1]; 
          }
        }
        
        headers[format.name] = tokenValue;
        
        let requestData: LoginDataWithCsrf = { ...loginData };
        
        if (format.inBody) {
          requestData = {
            ...requestData,
            csrfToken: tokenValue
          };
        }
        
        console.log(`Trying login with ${format.name}=${tokenValue} (decoded: ${format.decoded}, inBody: ${format.inBody})`);
        
        try {
          const response = await fetch(`${baseUrl}/v1/auth/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestData),
            credentials: 'include'
          });
          
          const result = await response.json();
          console.log(`Result for ${format.name}:`, { status: response.status, data: result });
          
          if (response.ok) {
            successfulFormat = format;
            console.log('SUCCESS! Working CSRF format:', format);
            break;
          }
        } catch (error) {
          console.error(`Error testing ${format.name}:`, error);
        }
      }
      
      setTestResults(prev => ({
        ...prev,
        'CSRF Test': {
          status: successfulFormat ? 200 : 403,
          data: { 
            message: successfulFormat 
              ? `Success with format: ${successfulFormat.name} (decoded: ${successfulFormat.decoded})` 
              : 'All CSRF header formats failed'
          },
          time: new Date().toISOString(),
          success: !!successfulFormat
        }
      }));
    } catch (error) {
      console.error('CSRF test failed:', error);
      setTestResults(prev => ({
        ...prev,
        'CSRF Test': {
          error: error instanceof Error ? error.message : String(error),
          time: new Date().toISOString(),
          success: false
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, 'CSRF Test': false }));
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">TaskTracker API Connection Test</h1>
      
      <div className="mb-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
        <h2 className="text-xl font-bold mb-3 text-gray-700">Configuration</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">API Base URL:</label>
            <input 
              type="text" 
              value={baseUrl} 
              onChange={(e) => setBaseUrl(e.target.value)} 
              className="w-full p-2 border rounded text-gray-800 bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useCredentials"
                checked={useCredentials}
                onChange={() => setUseCredentials(prev => !prev)}
                className="mr-2"
              />
              <label htmlFor="useCredentials" className="text-gray-700">Include Credentials</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="authHeader"
                checked={authHeader}
                onChange={() => setAuthHeader(prev => !prev)}
                className="mr-2"
              />
              <label htmlFor="authHeader" className="text-gray-700">Use Auth Header</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="corsOptions"
                checked={corsOptions}
                onChange={() => setCorsOptions(prev => !prev)}
                className="mr-2"
              />
              <label htmlFor="corsOptions" className="text-gray-700">Test CORS Preflight</label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => fetchHealthForCsrf()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Get Token from Health
            </button>
            <button 
              onClick={fetchCsrfToken}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Get CSRF Token
            </button>
            <button 
              onClick={testAllEndpoints}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test All Endpoints
            </button>
            <button 
              onClick={testLoginWithAllCsrfFormats}
              className={`px-4 py-2 ${loading['CSRF Test'] ? 'bg-purple-400' : 'bg-purple-600'} text-white rounded hover:bg-purple-700`}
              disabled={loading['CSRF Test']}
            >
              {loading['CSRF Test'] ? 'Testing CSRF Formats...' : 'Test All CSRF Formats'}
            </button>
          </div>
          
          <div className="border-t border-gray-300 pt-3 mt-2">
            <div className="mb-2">
              <p className="text-sm mb-1"><strong>Current CSRF Token:</strong></p>
              <div className="font-mono bg-gray-200 px-2 py-1 rounded text-xs overflow-auto max-h-16">
                {csrfToken || 'Not set'}
              </div>
            </div>
            
            {accessToken && (
              <div className="mb-2">
                <p className="text-sm mb-1"><strong>Access Token:</strong></p>
                <div className="font-mono bg-gray-200 px-2 py-1 rounded text-xs overflow-auto max-h-16">
                  {accessToken.substring(0, 40)}...
                </div>
              </div>
            )}
            
            <div className="mb-2">
              <p className="text-sm mb-1"><strong>All Cookies:</strong></p>
              <div className="font-mono bg-gray-200 px-2 py-1 rounded text-xs overflow-auto max-h-16 whitespace-pre-wrap">
                {allCookies || 'No cookies found'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {API_ENDPOINTS.map((endpoint) => (
          <div key={endpoint.name} className="border rounded-lg overflow-hidden border-gray-300">
            <div className="bg-gray-200 p-3 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{endpoint.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{endpoint.method}</span>
                  {endpoint.requiresAuth && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Auth Required</span>}
                </div>
                <p className="text-sm text-gray-600">{endpoint.description}</p>
                <p className="text-xs text-gray-500">Endpoint: {endpoint.url}</p>
              </div>
              <button 
                onClick={() => testEndpoint(endpoint)}
                disabled={loading[endpoint.name]}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading[endpoint.name] ? 'Testing...' : 'Test'}
              </button>
            </div>
            
            {/* Test data input for POST/PUT requests */}
            {['POST', 'PUT'].includes(endpoint.method) && (
              <div className="p-3 bg-gray-50 border-t border-b border-gray-200">
                <label className="block text-sm font-medium mb-1 text-gray-700">Request Body:</label>
                <textarea
                  value={testData[endpoint.name] || ''}
                  onChange={(e) => handleTestDataChange(endpoint.name, e.target.value)}
                  className="w-full p-2 border rounded text-gray-800 bg-white font-mono text-sm"
                  rows={5}
                />
              </div>
            )}
            
            <div className="p-4 bg-white">
              {testResults[endpoint.name] ? (
                testResults[endpoint.name].success ? (
                  <div>
                    <div className="flex mb-2 items-center">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded mr-2 ${
                        testResults[endpoint.name].status >= 200 && testResults[endpoint.name].status < 300
                          ? 'bg-green-100 text-green-800'
                          : testResults[endpoint.name].status >= 400
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {testResults[endpoint.name].status} {testResults[endpoint.name].statusText}
                      </span>
                      <span className="text-xs text-gray-500">
                        Tested: {testResults[endpoint.name].time}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700">Response Headers:</h4>
                        <pre className="bg-gray-50 p-2 text-xs rounded overflow-auto max-h-32 text-gray-800 border border-gray-200">
                          {JSON.stringify(testResults[endpoint.name].headers, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700">Response Data:</h4>
                        <pre className="bg-gray-50 p-2 text-xs rounded overflow-auto max-h-48 text-gray-800 border border-gray-200">
                          {JSON.stringify(testResults[endpoint.name].data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3">
                    <p className="text-red-700 font-medium">Error: {testResults[endpoint.name].error}</p>
                    <p className="text-xs text-gray-500">Tested: {testResults[endpoint.name].time}</p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium text-gray-800">Common Causes:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>API server not running or unreachable</li>
                        <li>CORS policy not configured correctly</li>
                        <li>Endpoint path is incorrect</li>
                        <li>Authentication required but not provided</li>
                        <li>Network connectivity issues</li>
                      </ul>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-gray-500 italic">Click "Test" to check this endpoint</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t pt-4 border-gray-300">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Debug Information:</h2>
        <div className="text-sm space-y-1 text-gray-700">
          <p><strong>Browser Origin:</strong> {browserOrigin || 'Loading...'}</p>
          <p><strong>Configured API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set in env'}</p>
          <p><strong>Testing with Credentials:</strong> {useCredentials ? 'Yes' : 'No'}</p>
          <p><strong>Using Auth Header:</strong> {authHeader ? 'Yes' : 'No'}</p>
          <p><strong>Testing CORS Preflight:</strong> {corsOptions ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
} 