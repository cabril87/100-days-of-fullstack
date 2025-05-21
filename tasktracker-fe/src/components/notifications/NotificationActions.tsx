'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  Trash, 
  Eye,
  ExternalLink
} from 'lucide-react';
import { markNotificationAsRead, deleteNotification } from '@/lib/services/notificationService';
import { useRouter } from 'next/navigation';

interface NotificationActionsProps {
  notificationId: number;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  onActionComplete?: () => void;
}

export default function NotificationActions({ 
  notificationId, 
  isRead, 
  relatedEntityType,
  relatedEntityId,
  onActionComplete 
}: NotificationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsRead = async () => {
    if (isRead) return;
    
    setIsLoading(true);
    try {
      await markNotificationAsRead(notificationId);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteNotification(notificationId);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToEntity = () => {
    if (!relatedEntityType || !relatedEntityId) return;
    
    let url = '';
    
    switch (relatedEntityType.toLowerCase()) {
      case 'task':
        url = `/tasks/${relatedEntityId}`;
        break;
      case 'family':
        url = `/family/${relatedEntityId}`;
        break;
      case 'event':
        url = `/family/calendar?eventId=${relatedEntityId}`;
        break;
      case 'invitation':
        url = `/notifications?highlight=invitation-${relatedEntityId}`;
        break;
      default:
        return;
    }
    
    router.push(url);
  };

  return (
    <div className="flex space-x-2 mt-2">
      {!isRead && (
        <button
          onClick={handleMarkAsRead}
          disabled={isLoading}
          className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50"
          title="Mark as read"
        >
          <CheckCircle className="h-5 w-5" />
        </button>
      )}
      
      {relatedEntityType && relatedEntityId && (
        <button
          onClick={handleNavigateToEntity}
          className="p-1 text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300"
          title={`Go to ${relatedEntityType}`}
        >
          <ExternalLink className="h-5 w-5" />
        </button>
      )}
      
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
        title="Delete notification"
      >
        <Trash className="h-5 w-5" />
      </button>
    </div>
  );
} 