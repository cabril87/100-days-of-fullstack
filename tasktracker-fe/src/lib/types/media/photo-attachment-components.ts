/*
 * Photo Attachment Component Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Component-specific prop interfaces for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * ✅ Separation of business logic types from component props
 * ✅ Enterprise clean architecture standards
 */


// ============================================================================
// FAMILY MEMBER TYPE
// ============================================================================

export interface FamilyMember {
  id: number;
  name: string;
  role: string;
}

