/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Analytics Data Types - Cleaned up for .cursorrules compliance
 * Component props moved to lib/props/components/analytics.props.ts
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

// Removed unused AnalyticsTab import to comply with .cursorrules

// ============================================================================
// CHART DATA TYPES - Only data types, no component props
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  date?: string;
  metadata?: Record<string, string | number>;
}

export interface ExportData {
  type: 'user' | 'family' | 'admin';
  data: Record<string, string | number | boolean>;
  generatedAt: string;
  format: string;
} 