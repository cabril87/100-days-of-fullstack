/*
 * Component Interfaces - Central Export File
 * Centralized exports for all component interface definitions
 * Following .cursorrules compliance standards
 */

// ================================
// UI COMPONENT INTERFACES
// ================================
export * from './ui.interface';

// ================================
// FEATURE COMPONENT INTERFACES
// ================================
export * from './auth.interface';
export * from './calendar.interface';
export * from './dashboard.interface';
export * from './family.interface';
export * from './gamification.interface';
export * from './layout.interface';
export * from './search.interface';

// ================================
// SPECIALIZED INTERFACES
// ================================
export * from './focus.interface';
export * from './analytics.interface';

// Boards and Tasks interfaces export separately to avoid conflicts
export * as BoardsInterfaces from './boards.interface';
export * as TasksInterfaces from './tasks.interface'; 