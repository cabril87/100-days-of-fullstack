// Family Seeding Types (Admin Only)

export enum FamilyScenario {
  ClearAll = 0,
  NuclearFamily = 1,
  SingleParent = 2,
  ExtendedFamily = 3,
  BlendedFamily = 4,
  MultiGenerational = 5,
  LargeFamily = 6,
  AdultOnly = 7,
  ChildCentric = 8,
  TeenHeavy = 9,
  EdgeCases = 10,
  AdminTransitions = 11,
  Minimal = 12,
  Custom = 99,
}

export enum FamilySeedingAgeGroup {
  Child = 'Child',
  Teen = 'Teen',
  Adult = 'Adult',
}

export enum FamilyRelationshipType {
  Parent = 0,
  Child = 1,
  Spouse = 2,
  ExSpouse = 3,
  Sibling = 4,
  Grandparent = 5,
  Grandchild = 6,
  Aunt = 7,
  Uncle = 8,
  Cousin = 9,
  Niece = 10,
  Nephew = 11,
  StepParent = 12,
  StepChild = 13,
  StepSibling = 14,
  MotherInLaw = 15,
  FatherInLaw = 16,
  SisterInLaw = 17,
  BrotherInLaw = 18,
  Friend = 19,
  Caregiver = 20,
  Nanny = 21,
  Tutor = 22,
  Other = 23,
  Self = 24,
}

export interface CustomFamilyMember {
  name: string;
  ageGroup: FamilySeedingAgeGroup;
  relationshipToAdmin: FamilyRelationshipType;
  relationshipToMember?: FamilyRelationshipType;
  relatedToMemberId?: number;
  email?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  wantsAdminRole?: boolean;
  isNaturalLeader?: boolean;
  notes?: string;
  roleName?: string;
}

export interface FamilySeedingRequest {
  scenario: FamilyScenario;
  memberCount: number;
  familyName?: string;
  clearExisting?: boolean;
  customMembers?: CustomFamilyMember[];
}

export interface SeededMemberInfo {
  id: number;
  name: string;
  email: string;
  ageGroup: FamilySeedingAgeGroup;
  relationshipToAdmin: FamilyRelationshipType;
  roleName: string;
  isAdmin: boolean;
  testPassword: string;
}

export interface FamilySeedingResponse {
  success: boolean;
  message: string;
  familyId: number;
  familyName: string;
  membersCreated: number;
  seededMembers: SeededMemberInfo[];
}

export interface FamilyScenarioInfo {
  scenario: FamilyScenario;
  name: string;
  description: string;
  defaultMemberCount: number;
  memberTypes: string[];
  testCases: string[];
}

export interface FamilySeedingHealthCheck {
  status: string;
  scenariosAvailable: number;
  testFamiliesExists: number;
  timestamp: string;
}

// Utility function to get scenario display name
export const getScenarioDisplayName = (scenario: FamilyScenario): string => {
  switch (scenario) {
    case FamilyScenario.ClearAll:
      return "Clear All";
    case FamilyScenario.NuclearFamily:
      return "Nuclear Family";
    case FamilyScenario.SingleParent:
      return "Single Parent";
    case FamilyScenario.ExtendedFamily:
      return "Extended Family";
    case FamilyScenario.BlendedFamily:
      return "Blended Family";
    case FamilyScenario.MultiGenerational:
      return "Multi-Generational";
    case FamilyScenario.LargeFamily:
      return "Large Family";
    case FamilyScenario.AdultOnly:
      return "Adult Only";
    case FamilyScenario.ChildCentric:
      return "Child-Centric";
    case FamilyScenario.TeenHeavy:
      return "Teen-Heavy";
    case FamilyScenario.EdgeCases:
      return "Edge Cases";
    case FamilyScenario.AdminTransitions:
      return "Admin Transitions";
    case FamilyScenario.Minimal:
      return "Minimal";
    case FamilyScenario.Custom:
      return "Custom";
    default:
      return "Unknown";
  }
};

// Utility function to get age group color
export const getAgeGroupColor = (ageGroup: FamilySeedingAgeGroup): string => {
      switch (ageGroup) {
      case FamilySeedingAgeGroup.Child:
        return "text-blue-600 bg-blue-100";
      case FamilySeedingAgeGroup.Teen:
        return "text-purple-600 bg-purple-100";
      case FamilySeedingAgeGroup.Adult:
        return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// Utility function to get relationship display name
export const getRelationshipDisplayName = (relationship: FamilyRelationshipType): string => {
  switch (relationship) {
    case FamilyRelationshipType.Self:
      return "Self (Admin)";
    case FamilyRelationshipType.Parent:
      return "Parent";
    case FamilyRelationshipType.Child:
      return "Child";
    case FamilyRelationshipType.Spouse:
      return "Spouse";
    case FamilyRelationshipType.ExSpouse:
      return "Ex-Spouse";
    case FamilyRelationshipType.Sibling:
      return "Sibling";
    case FamilyRelationshipType.Grandparent:
      return "Grandparent";
    case FamilyRelationshipType.Grandchild:
      return "Grandchild";
    case FamilyRelationshipType.Aunt:
      return "Aunt";
    case FamilyRelationshipType.Uncle:
      return "Uncle";
    case FamilyRelationshipType.Cousin:
      return "Cousin";
    case FamilyRelationshipType.Niece:
      return "Niece";
    case FamilyRelationshipType.Nephew:
      return "Nephew";
    case FamilyRelationshipType.StepParent:
      return "Step-Parent";
    case FamilyRelationshipType.StepChild:
      return "Step-Child";
    case FamilyRelationshipType.StepSibling:
      return "Step-Sibling";
    case FamilyRelationshipType.MotherInLaw:
      return "Mother-in-Law";
    case FamilyRelationshipType.FatherInLaw:
      return "Father-in-Law";
    case FamilyRelationshipType.SisterInLaw:
      return "Sister-in-Law";
    case FamilyRelationshipType.BrotherInLaw:
      return "Brother-in-Law";
    case FamilyRelationshipType.Friend:
      return "Family Friend";
    case FamilyRelationshipType.Caregiver:
      return "Caregiver";
    case FamilyRelationshipType.Nanny:
      return "Nanny";
    case FamilyRelationshipType.Tutor:
      return "Tutor";
    case FamilyRelationshipType.Other:
      return "Other";
    default:
      return "Unknown";
  }
}; 