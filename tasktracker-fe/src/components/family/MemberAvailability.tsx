import { useState, useEffect } from 'react';
import { familyCalendarService } from '@/lib/services/familyCalendarService';
import { useToast } from '@/lib/hooks/useToast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface MemberAvailabilityProps {
  familyId: number;
  startDate?: Date;
  endDate?: Date;
  onConflictsDetected?: (conflicts: any[]) => void;
}

export function MemberAvailability({ familyId, startDate, endDate, onConflictsDetected }: MemberAvailabilityProps) {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const formattedStartDate = startDate ? startDate.toISOString() : new Date().toISOString();
      const formattedEndDate = endDate 
        ? endDate.toISOString() 
        : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

      const response = await familyCalendarService.getAvailabilityInRange(
        familyId,
        formattedStartDate,
        formattedEndDate
      );

      if (response.data) {
        setAvailabilities(response.data);
        // Check for conflicts
        detectConflicts(response.data);
      } else {
        showToast('Failed to load availability data', 'error');
      }
    } catch (error) {
      showToast('Error loading availability data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (availabilityData: any[]) => {
    // Simple conflict detection algorithm
    const conflicts: any[] = [];
    
    for (let i = 0; i < availabilityData.length; i++) {
      for (let j = i + 1; j < availabilityData.length; j++) {
        const a = availabilityData[i];
        const b = availabilityData[j];
        
        // Check for overlapping time periods where both members are busy
        if (
          a.status === 'Busy' && 
          b.status === 'Busy' &&
          new Date(a.startTime) <= new Date(b.endTime) && 
          new Date(a.endTime) >= new Date(b.startTime)
        ) {
          conflicts.push({
            members: [a.familyMember, b.familyMember],
            startTime: new Date(Math.max(new Date(a.startTime).getTime(), new Date(b.startTime).getTime())),
            endTime: new Date(Math.min(new Date(a.endTime).getTime(), new Date(b.endTime).getTime())),
          });
        }
      }
    }
    
    if (conflicts.length > 0 && onConflictsDetected) {
      onConflictsDetected(conflicts);
    }
    
    return conflicts;
  };

  useEffect(() => {
    if (familyId) {
      fetchAvailabilities();
    }
  }, [familyId, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Member Availability</h3>
      
      {availabilities.length === 0 ? (
        <p className="text-gray-500">No availability information for this time period.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availabilities.map((availability) => (
            <Card key={availability.id} className={`
              ${availability.status === 'Busy' ? 'border-red-200' : ''} 
              ${availability.status === 'Free' ? 'border-green-200' : ''} 
              ${availability.status === 'Tentative' ? 'border-yellow-200' : ''}
            `}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://avatar.vercel.sh/${availability.familyMember?.name}`} />
                      <AvatarFallback>{availability.familyMember?.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-sm">{availability.familyMember?.name}</CardTitle>
                  </div>
                  <Badge className={`
                    ${availability.status === 'Busy' ? 'bg-red-100 text-red-800' : ''} 
                    ${availability.status === 'Free' ? 'bg-green-100 text-green-800' : ''} 
                    ${availability.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}>
                    {availability.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs">
                <p>
                  <span className="font-medium">Start:</span>{' '}
                  {new Date(availability.startTime).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">End:</span>{' '}
                  {new Date(availability.endTime).toLocaleString()}
                </p>
                {availability.note && (
                  <p className="mt-1 italic">{availability.note}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex items-center gap-2">
        <h4 className="text-sm font-medium">Legend:</h4>
        <Badge className="bg-green-100 text-green-800">Free</Badge>
        <Badge className="bg-yellow-100 text-yellow-800">Tentative</Badge>
        <Badge className="bg-red-100 text-red-800">Busy</Badge>
      </div>
    </div>
  );
} 