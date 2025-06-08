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
    // Fetch family data server-side
    const [familyData, members] = await Promise.all([
      fetchAuthenticatedData<FamilyDTO>(`/api/v1/family/${familyId}`, defaultFamily),
      fetchAuthenticatedData<FamilyMemberDTO[]>(`/api/v1/family/${familyId}/members`, [])
    ]);

    family = familyData;
    familyMembers = members;
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