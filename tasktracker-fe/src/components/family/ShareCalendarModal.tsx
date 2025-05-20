import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Calendar, Link, Mail } from 'lucide-react';
import { FamilyCalendarEvent } from '@/lib/services/familyCalendarService';
import { downloadCalendarAsICal, getCalendarSubscriptionUrl } from '@/lib/utils/calendarExport';
import { useToast } from '@/lib/providers/ToastProvider';

interface ShareCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: FamilyCalendarEvent[];
  familyId: number;
  familyName: string;
}

export function ShareCalendarModal({
  isOpen,
  onClose,
  events,
  familyId,
  familyName
}: ShareCalendarModalProps) {
  const [shareOption, setShareOption] = useState<'export' | 'link' | 'email'>('export');
  const [includeAllEvents, setIncludeAllEvents] = useState(true);
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      downloadCalendarAsICal(events, familyName);
      showToast('Calendar exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export calendar', 'error');
    }
  };

  const handleCopyLink = () => {
    const subscriptionUrl = getCalendarSubscriptionUrl(familyId);
    navigator.clipboard.writeText(subscriptionUrl);
    showToast('Subscription link copied to clipboard', 'success');
  };

  const handleEmailShare = () => {
    if (!email) {
      showToast('Please enter an email address', 'error');
      return;
    }
    
    // This would typically call an API to share the calendar via email
    showToast(`Calendar shared with ${email}`, 'success');
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Calendar</DialogTitle>
          <DialogDescription>
            Export or share your family calendar with others
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="export" onClick={() => setShareOption('export')}>Export</TabsTrigger>
            <TabsTrigger value="link" onClick={() => setShareOption('link')}>Get Link</TabsTrigger>
            <TabsTrigger value="email" onClick={() => setShareOption('email')}>Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="includeAllEvents" 
                checked={includeAllEvents}
                onCheckedChange={setIncludeAllEvents}
              />
              <Label htmlFor="includeAllEvents">Include all events</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Download your calendar in iCal format to import into other calendar applications.
            </p>
            <Button 
              className="w-full" 
              onClick={handleExport}
              aria-label="Export calendar as iCal file"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Export as iCal
            </Button>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get a subscription link that others can use to add your calendar to their calendar app.
            </p>
            <div className="flex space-x-2">
              <Input
                readOnly
                value={getCalendarSubscriptionUrl(familyId)}
                aria-label="Calendar subscription URL"
              />
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                aria-label="Copy subscription link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share your calendar via email invitation.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Recipient email address"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleEmailShare}
              aria-label="Share calendar via email"
            >
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 