import { FamilyCalendar } from '@/components/family/FamilyCalendar';

interface FamilyCalendarPageProps {
  params: {
    id: string;
  };
}

export default function FamilyCalendarPage({ params }: FamilyCalendarPageProps) {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <FamilyCalendar familyId={parseInt(params.id)} />
    </div>
  );
} 