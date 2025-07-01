#!/usr/bin/env node

/*
 * Copyright (c) 2025 TaskTracker Enterprise
 * Service Worker Build Script
 * 
 * This script processes the service worker template and injects build-time variables
 */

const fs = require('fs');
const path = require('path');

// ================================
// BUILD CONFIGURATION
// ================================

const isDev = process.env.NODE_ENV === 'development';
const isDocker = process.env.DOCKER_ENVIRONMENT === 'true';

// Generate BUILD_ID for cache versioning
function generateBuildId() {
  if (process.env.BUILD_ID) return process.env.BUILD_ID;
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 8);
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 8);
  return Date.now().toString();
}

// Build constants
const BUILD_ID = generateBuildId();
const CACHE_VERSION = `v${BUILD_ID}`;
const ENV_MODE = isDev ? 'development' : 'production';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// File paths
const TEMPLATE_PATH = path.join(__dirname, '../public/sw-template.js');
const OUTPUT_PATH = path.join(__dirname, '../public/sw.js');

// ================================
// TEMPLATE PROCESSING
// ================================

function processServiceWorkerTemplate() {
  console.log('🔧 Building Service Worker...');
  console.log(`   Build ID: ${BUILD_ID}`);
  console.log(`   Cache Version: ${CACHE_VERSION}`);
  console.log(`   Environment: ${ENV_MODE}`);
  console.log(`   API URL: ${API_URL}`);

  try {
    // Read template file
    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error(`❌ Service Worker template not found: ${TEMPLATE_PATH}`);
      process.exit(1);
    }

    let templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

    // Variable replacements
    const replacements = {
      '{{CACHE_VERSION}}': CACHE_VERSION,
      '{{BUILD_ID}}': BUILD_ID,
      '{{ENV_MODE}}': ENV_MODE,
      '{{API_URL}}': API_URL,
      '{{TIMESTAMP}}': new Date().toISOString(),
    };

    // Apply replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      templateContent = templateContent.replace(regex, value);
    });

    // Add build metadata comment
    const buildMetadata = `/*
 * Service Worker - Build Information
 * Generated: ${new Date().toISOString()}
 * Build ID: ${BUILD_ID}
 * Cache Version: ${CACHE_VERSION}
 * Environment: ${ENV_MODE}
 * API URL: ${API_URL}
 */

`;

    const finalContent = buildMetadata + templateContent;

    // Write processed service worker
    fs.writeFileSync(OUTPUT_PATH, finalContent, 'utf-8');

    console.log(`✅ Service Worker built successfully: ${OUTPUT_PATH}`);
    console.log(`   File size: ${(finalContent.length / 1024).toFixed(2)} KB`);

    // Verify the output
    verifyServiceWorker(finalContent);

  } catch (error) {
    console.error('❌ Service Worker build failed:', error);
    process.exit(1);
  }
}

// ================================
// VERIFICATION
// ================================

function verifyServiceWorker(content) {
  console.log('🔍 Verifying Service Worker...');

  const verifications = [
    {
      test: /const CACHE_VERSION = '[^']+'/,
      name: 'Cache Version'
    },
    {
      test: /const BUILD_ID = '[^']+'/,
      name: 'Build ID'
    },
    {
      test: /const ENV_MODE = '[^']+'/,
      name: 'Environment Mode'
    },
    {
      test: /const API_URL = '[^']+'/,
      name: 'API URL'
    },
    {
      test: /addEventListener\('install'/,
      name: 'Install Event Listener'
    },
    {
      test: /addEventListener\('activate'/,
      name: 'Activate Event Listener'
    },
    {
      test: /addEventListener\('fetch'/,
      name: 'Fetch Event Listener'
    },
    {
      test: /addEventListener\('message'/,
      name: 'Message Event Listener'
    }
  ];

  let allPassed = true;

  verifications.forEach(({ test, name }) => {
    if (test.test(content)) {
      console.log(`   ✅ ${name}`);
    } else {
      console.log(`   ❌ ${name}`);
      allPassed = false;
    }
  });

  if (allPassed) {
    console.log('✅ Service Worker verification passed');
  } else {
    console.error('❌ Service Worker verification failed');
    process.exit(1);
  }
}

// ================================
// DEVELOPMENT FEATURES
// ================================

function setupDevelopmentFeatures() {
  if (!isDev) return;

  console.log('🚀 Setting up development features...');

  // Create cache debug page
  const debugPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cache Debug - TaskTracker Enterprise</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin: 5px;
    }
    .button:hover {
      background: #2563eb;
    }
    .status {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      background: #f0f0f0;
    }
    .success { background: #d1fae5; color: #065f46; }
    .error { background: #fecaca; color: #991b1b; }
    .warning { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TaskTracker Cache Debug</h1>
    <p>Development cache management and debugging tools</p>
    
    <div id="status" class="status">
      Checking Service Worker status...
    </div>
    
    <div>
      <button class="button" onclick="clearAllCaches()">Clear All Caches</button>
      <button class="button" onclick="reloadPage()">Force Reload</button>
      <button class="button" onclick="checkCacheStatus()">Refresh Status</button>
      <button class="button" onclick="exportCacheData()">Export Cache Data</button>
    </div>
    
    <div id="cacheData"></div>
  </div>

  <script>
    let serviceWorkerRegistration = null;

    async function checkCacheStatus() {
      const statusEl = document.getElementById('status');
      
      try {
        if ('serviceWorker' in navigator) {
          serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
          
          if (serviceWorkerRegistration) {
            statusEl.className = 'status success';
            statusEl.textContent = 'Service Worker registered and active';
          } else {
            statusEl.className = 'status warning';
            statusEl.textContent = 'Service Worker not registered (expected in development)';
          }
        } else {
          statusEl.className = 'status error';
          statusEl.textContent = 'Service Worker not supported in this browser';
        }
        
        await displayCacheData();
      } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = 'Error checking Service Worker: ' + error.message;
      }
    }

    async function clearAllCaches() {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        localStorage.clear();
        sessionStorage.clear();
        
        alert('All caches cleared successfully');
        await checkCacheStatus();
      } catch (error) {
        alert('Error clearing caches: ' + error.message);
      }
    }

    function reloadPage() {
      window.location.reload(true);
    }

    async function displayCacheData() {
      const cacheDataEl = document.getElementById('cacheData');
      
      try {
        const cacheNames = await caches.keys();
        let html = '<h3>Current Caches:</h3>';
        
        if (cacheNames.length === 0) {
          html += '<p>No caches found</p>';
        } else {
          html += '<ul>';
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            html += '<li><strong>' + name + '</strong> (' + keys.length + ' entries)</li>';
          }
          html += '</ul>';
        }
        
        cacheDataEl.innerHTML = html;
      } catch (error) {
        cacheDataEl.innerHTML = '<p>Error loading cache data: ' + error.message + '</p>';
      }
    }

    async function exportCacheData() {
      try {
        const cacheNames = await caches.keys();
        const exportData = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          caches: {}
        };
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          exportData.caches[name] = keys.map(req => req.url);
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cache-debug-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
      } catch (error) {
        alert('Error exporting cache data: ' + error.message);
      }
    }

    // Initialize on page load
    checkCacheStatus();
  </script>
</body>
</html>`;

  const debugPagePath = path.join(__dirname, '../public/cache-debug.html');
  fs.writeFileSync(debugPagePath, debugPageContent, 'utf-8');
  console.log(`✅ Cache debug page created: ${debugPagePath}`);
}

// ================================
// PRODUCTION OPTIMIZATIONS
// ================================

function setupProductionOptimizations() {
  if (isDev) return;

  console.log('🚀 Setting up production optimizations...');

  // Create cache status JSON for runtime
  const cacheStatus = {
    buildId: BUILD_ID,
    cacheVersion: CACHE_VERSION,
    buildTimestamp: new Date().toISOString(),
    environment: ENV_MODE,
    apiUrl: API_URL
  };

  const statusPath = path.join(__dirname, '../public/cache-status.json');
  fs.writeFileSync(statusPath, JSON.stringify(cacheStatus, null, 2), 'utf-8');
  console.log(`✅ Cache status file created: ${statusPath}`);
}

// ================================
// CLEANUP
// ================================

function cleanup() {
  console.log('🧹 Cleaning up old service worker files...');

  const filesToClean = [
    path.join(__dirname, '../public/sw.js.map'),
    path.join(__dirname, '../public/workbox-*.js'),
  ];

  filesToClean.forEach(pattern => {
    if (pattern.includes('*')) {
      // Handle glob patterns
      const dir = path.dirname(pattern);
      const filePattern = path.basename(pattern);
      
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          if (file.match(filePattern.replace('*', '.*'))) {
            const filePath = path.join(dir, file);
            fs.unlinkSync(filePath);
            console.log(`   Removed: ${filePath}`);
          }
        });
      }
    } else if (fs.existsSync(pattern)) {
      fs.unlinkSync(pattern);
      console.log(`   Removed: ${pattern}`);
    }
  });
}

// ================================
// MAIN EXECUTION
// ================================

function main() {
  console.log('🚀 TaskTracker Enterprise Service Worker Build');
  console.log('================================================');

  try {
    cleanup();
    processServiceWorkerTemplate();
    
    if (isDev) {
      setupDevelopmentFeatures();
    } else {
      setupProductionOptimizations();
    }

    console.log('================================================');
    console.log('✅ Service Worker build completed successfully');
    
  } catch (error) {
    console.error('================================================');
    console.error('❌ Service Worker build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, processServiceWorkerTemplate }; 