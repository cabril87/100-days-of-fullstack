// Central skeleton components library - Component exports only
// Types are centralized in lib/types/skeleton.ts following project standards

// ✅ Import types from centralized location (.cursorrules compliant)
export type * from '@/lib/interfaces/ui/ui-components.interface';

// ✅ Component Exports Only
export * from './parental-control-skeletons';
export * from './mfa-skeletons';
export * from './family-invitation-skeletons';
export * from './session-management-skeletons';
export * from './gamification-skeletons';
export * from './settings-profile-skeletons';
export * from './common-ui-skeletons';
export { SkeletonWrapper } from './base-skeleton-wrapper'; 