/*
 * Family Types Index
 * Central export point for all family-related type definitions
 * Compliance with .cursorrules enterprise standards
 */

// ============================================================================
// FAMILY TYPES INDEX - .cursorrules compliant
// ============================================================================

export * from './enhanced-family';
export * from './family-invitation';
export * from './family-task';
export * from './family-events';
export * from './familySeeding';

// Family Events Types
export * from './family-events';

// Family Seeding Types (selective exports to avoid conflicts)
export {
  FamilyScenario,
  FamilySeedingAgeGroup,
  getScenarioDisplayName,
  getAgeGroupColor
} from './familySeeding';

export type {
  CustomFamilyMember,
  FamilySeedingRequest,
  SeededMemberInfo,
  FamilySeedingResponse,
  FamilyScenarioInfo,
  FamilySeedingHealthCheck
} from './familySeeding';

// Note: FamilyRelationshipType and getRelationshipDisplayName come from family-invitation
// to avoid conflicts with identical exports from familySeeding 