const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const RESULTS_FILE = path.join(__dirname, 'api-test-results.json');
const DEBUG = true;

// Cookie storage (simulates browser cookie jar)
let cookies = [];

// Store CSRF token
let csrfToken = null;

// Parse cookies from response headers
function parseCookies(response) {
  const cookieHeader = response.headers.get('set-cookie');
  if (!cookieHeader) return [];
  
  return cookieHeader.split(',').map(cookie => cookie.split(';')[0].trim());
}

// Get cookie string for request
function getCookieString() {
  return cookies.join('; ');
}

// Extract CSRF token from cookies
function extractCsrfToken() {
  for (const cookie of cookies) {
    if (cookie.startsWith('XSRF-TOKEN=')) {
      return cookie.substring('XSRF-TOKEN='.length);
    }
  }
  return null;
}

// API test function
async function testEndpoint(method, endpoint, body = null, useToken = true, includeCredentials = true) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Add cookies if needed
  if (includeCredentials && cookies.length > 0) {
    headers['Cookie'] = getCookieString();
  }
  
  // Add CSRF token for non-GET requests if available
  if (useToken && method !== 'GET' && csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }
  
  const options = {
    method,
    headers
  };
  
  // Add body for POST/PUT
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }
  
  if (DEBUG) {
    console.log(`\n${method} ${url}`);
    console.log('Headers:', headers);
    if (options.body) console.log('Body:', options.body);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Parse and store cookies
    const newCookies = parseCookies(response);
    if (newCookies.length > 0) {
      console.log('Got cookies:', newCookies);
      cookies = [...cookies, ...newCookies];
      
      // Update CSRF token if present
      const newToken = extractCsrfToken();
      if (newToken) {
        csrfToken = newToken;
        console.log('Updated CSRF token:', csrfToken);
      }
    }
    
    // Parse response
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { rawText: text };
    }
    
    // Create result object
    const result = {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      cookies: [...cookies],
      csrfToken
    };
    
    if (DEBUG) {
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Response:', data);
    }
    
    return result;
  } catch (error) {
    console.error(`Error testing ${method} ${endpoint}:`, error);
    return {
      endpoint,
      method,
      error: error.message
    };
  }
}

// Run tests
async function runTests() {
  const results = {};
  
  // Test 1: Health check (should work without authentication)
  results.health = await testEndpoint('GET', '/v1/health');
  
  // Test 2: Get CSRF token (this should work and set a cookie)
  results.csrfToken = await testEndpoint('GET', '/v1/auth/csrf');
  
  // Update CSRF token from response
  if (cookies.length > 0) {
    csrfToken = extractCsrfToken();
    console.log('Initial CSRF token:', csrfToken);
  }
  
  // Test 3: Try register with CSRF token
  const registerData = {
    username: "testuser123",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    firstName: "Test",
    lastName: "User"
  };
  results.register = await testEndpoint('POST', '/v1/auth/register', registerData);
  
  // Test 4: Try login with CSRF token
  const loginData = {
    emailOrUsername: "test@example.com",
    password: "Password123!"
  };
  results.login = await testEndpoint('POST', '/v1/auth/login', loginData);
  
  // Test 5: Try the user profile endpoint (should require auth)
  results.profile = await testEndpoint('GET', '/v1/auth/profile');
  
  // Test 6: Try tasks endpoint (should require auth)
  results.tasks = await testEndpoint('GET', '/v1/taskitems');
  
  // Save results to file
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${RESULTS_FILE}`);
  
  // Print summary
  console.log('\n===== TEST SUMMARY =====');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}: ${result.status || 'ERROR'} ${result.statusText || result.error || ''}`);
  });
}

// Run the tests
console.log('Starting API tests...');
runTests().catch(console.error); 