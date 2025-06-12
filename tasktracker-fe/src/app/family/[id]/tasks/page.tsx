import { notFound } from 'next/navigation';
import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import { FamilyDetailPageProps } from '@/lib/types/auth';
import FamilyTaskManagementPage from '@/components/family/FamilyTaskManagementPage';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function FamilyTasksPage({ params }: FamilyDetailPageProps) {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/family/[id]/tasks');
  
  const resolvedParams = await params;
  const familyId = parseInt(resolvedParams.id);
  
  if (isNaN(familyId)) {
    notFound();
  }

  return (
    <FamilyTaskManagementPage 
      user={session}
      familyId={familyId}
    />
  );
} 