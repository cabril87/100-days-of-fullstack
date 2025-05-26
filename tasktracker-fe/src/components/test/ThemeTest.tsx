'use client';

import React from 'react';

export function ThemeTest() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Theme System Test</h1>
      
      <div className="space-y-2">
        <p className="theme-text-primary">Primary text (should be visible in both themes)</p>
        <p className="theme-text-secondary">Secondary text (should be visible with opacity)</p>
        <p className="theme-text-muted">Muted text (should be visible with more opacity)</p>
        <p className="theme-text-heading">Heading text (should use heading color)</p>
        <p className="theme-text-white">White text (should always be white)</p>
        <p className="always-visible-text">Always visible text (should be visible in both themes)</p>
      </div>
      
      <div className="space-y-2">
        <h2 className="sidebar-heading">Sidebar heading (should be white)</h2>
        <h3 className="no-global-style text-blue-600">Custom styled heading (should be blue)</h3>
      </div>
      
      <div className="space-y-2 p-4 theme-bg-card theme-border border rounded-lg">
        <p className="dropdown-text">Dropdown text (should be visible)</p>
        <p className="navbar-text">Navbar text (should be visible)</p>
      </div>
    </div>
  );
} 