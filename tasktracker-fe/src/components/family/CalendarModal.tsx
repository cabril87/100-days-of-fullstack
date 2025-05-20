import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FamilyCalendar } from './FamilyCalendar';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: number;
}

export function CalendarModal({ isOpen, onClose, familyId }: CalendarModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Family Calendar</DialogTitle>
          <DialogDescription>
            View and manage your family events and schedules
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow h-full">
          <FamilyCalendar familyId={familyId} isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 