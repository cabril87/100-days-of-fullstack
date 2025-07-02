// ============================================================================
// INTERFACES INDEX - .cursorrules compliant
// ============================================================================

// Core Interfaces (no conflicts)
export * from './analytics';
export * from './api';
export * from './auth';
export * from './config';
export * from './family';
export * from './forms';
export * from './services';
export * from './signalr';

// UI Interfaces (unified SkeletonWrapperProps location)
export * from './ui';

// Note: Removed './components' export to avoid conflicts
// All UI component interfaces are available through './ui'
// Import directly from './components' where needed for non-conflicting interfaces

// Note: Removed conflicting wildcard exports:
// - './gamification' (conflicts with components, widgets)
// - './widgets' (conflicts with gamification)
// These should be imported directly where needed to avoid conflicts 