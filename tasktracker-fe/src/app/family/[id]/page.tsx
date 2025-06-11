import { notFound } from 'next/navigation';
import { ProtectedPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family-invitation';
import { FamilyDetailPageProps } from '@/lib/types/auth';
import FamilyDetail from '@/components/family/FamilyDetail';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function FamilyDetailPage({ params }: FamilyDetailPageProps) {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/family/[id]');
  
  const resolvedParams = await params;
  const familyId = parseInt(resolvedParams.id);
  
  if (isNaN(familyId)) {
    notFound();
  }

  // Create default family data structure (avoiding null types per enterprise standards)
  const defaultFamily: FamilyDTO = {
    id: familyId,
    name: 'Loading...',
    description: '',
    createdAt: new Date().toISOString(),
    createdById: 0,
    memberCount: 0
  };

  // Server-side data fetching
  let family: FamilyDTO = defaultFamily;
  let familyMembers: FamilyMemberDTO[] = [];
  let error: string | null = null;

  try {
    console.debug(`Attempting to fetch family data for ID: ${familyId}`);
    
    // Fetch family data server-side
    const [familyData, members] = await Promise.all([
      fetchAuthenticatedData<FamilyDTO>(`/v1/family/${familyId}`, defaultFamily),
      fetchAuthenticatedData<FamilyMemberDTO[]>(`/v1/family/${familyId}/members`, [])
    ]);
    
    console.debug('Raw fetch results:', {
      familyData: familyData,
      members: members,
      familyDataType: typeof familyData,
      membersType: typeof members
    });

    // Handle undefined responses from fetchAuthenticatedData
    const safeFamilyData = familyData || defaultFamily;
    const safeMembers = members || [];
    
    // Ensure members is always an array
    familyMembers = Array.isArray(safeMembers) ? safeMembers : [];
    
    // Debug logging
    console.debug('Server-side fetch results:', {
      familyDataUndefined: familyData === undefined,
      membersUndefined: members === undefined,
      familyName: safeFamilyData.name,
      familyId: safeFamilyData.id,
      membersIsArray: Array.isArray(safeMembers),
      membersLength: familyMembers.length,
      requestedFamilyId: familyId
    });
    
    // Check if we got real data or just the fallback/undefined
    if (safeFamilyData.name !== 'Loading...' && safeFamilyData.id === familyId) {
      family = safeFamilyData;
      console.debug('Using server-side family data');
    } else {
      // Server-side fetch failed, let client handle it
      console.debug('Server-side family data fetch failed, client will retry');
      family = defaultFamily; // Ensure we have default data
      error = null; // Don't show error, let client try
    }
  } catch (err) {
    console.error('Failed to load family data:', err);
    error = err instanceof Error ? err.message : 'Failed to load family details';
  }

  // Pass server-fetched data to client component
  return (
    <FamilyDetail 
      user={session}
      familyId={familyId}
      initialFamily={family}
      initialMembers={familyMembers}
      initialError={error}
    />
  );
} 