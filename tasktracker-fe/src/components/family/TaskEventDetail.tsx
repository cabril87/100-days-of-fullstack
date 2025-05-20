import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  Check, 
  Edit, 
  Trash, 
  ChevronRight,
  MapPin,
  ArrowUpRight,
  CalendarDays
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/providers/ToastProvider';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// This would normally be imported from your task types
interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  status: string;
}

// This interface would be for calendar events that aren't tasks
interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  eventType: string;
  createdBy: {
    id: number;
    username: string;
  };
}

interface TaskEventDetailProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  familyId: number;
  tasks: Task[];
  events: CalendarEvent[];
  onEditEvent?: () => void;
  onDeleteEvent?: () => void;
}

export function TaskEventDetail({
  isOpen,
  onClose,
  selectedDate,
  familyId,
  tasks,
  events,
  onEditEvent,
  onDeleteEvent
}: TaskEventDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<string>(tasks.length > 0 ? 'tasks' : 'events');

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM dd, yyyy h:mm a');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'appointment': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'outing': return 'bg-green-100 text-green-800 border-green-300';
      case 'reminder': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'general': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleEditTask = (taskId: number) => {
    router.push(`/family/${familyId}/tasks/${taskId}/edit`);
    onClose();
  };

  const handleViewTask = (taskId: number) => {
    router.push(`/family/${familyId}/tasks/${taskId}`);
    onClose();
  };

  const handleDeleteTask = (taskId: number) => {
    // This would typically call an API to delete the task
    showToast('Task deleted successfully', 'success');
    onClose();
  };

  const handleCompleteTask = (taskId: number) => {
    // This would typically call an API to mark the task as complete
    showToast('Task marked as complete', 'success');
    onClose();
  };

  const handleEditEvent = (eventId: number) => {
    if (onEditEvent) {
      onEditEvent();
    } else {
      showToast('Edit event functionality would open here', 'info');
    }
  };

  const handleDeleteEventClick = (eventId: number) => {
    if (onDeleteEvent) {
      if (window.confirm('Are you sure you want to delete this event?')) {
        onDeleteEvent();
      }
    } else {
      showToast('Delete event functionality would happen here', 'info');
    }
  };

  const dateString = selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : '';

  // Calculate time remaining for tasks
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  // Format time range for events
  const formatTimeRange = (start: string, end: string, isAllDay: boolean) => {
    if (isAllDay) return 'All day';
    const startTime = format(new Date(start), 'h:mm a');
    const endTime = format(new Date(end), 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-brand-navy" />
            <span className="text-brand-navy">{dateString}</span>
          </DialogTitle>
          <DialogDescription className="mt-1">
            View and manage all activities scheduled for this date
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({events.length})
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-0">
            {tasks.length === 0 ? (
              <div className="text-muted-foreground text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Flag className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>No tasks scheduled for this date</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Create a task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <Card 
                    key={task.id} 
                    className={cn(
                      "hover:shadow-md transition-shadow overflow-hidden",
                      task.isCompleted ? "bg-gray-50 border-gray-200" : "border-l-4",
                      task.isCompleted ? "" : getPriorityColorBorder(task.priority)
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className={cn(
                            "text-base flex items-center gap-2",
                            task.isCompleted && "text-gray-500 line-through"
                          )}>
                            {task.title}
                          </CardTitle>
                          {task.assignedTo && (
                            <CardDescription className="flex items-center text-sm mt-1">
                              <User className="mr-1 h-3 w-3" />
                              {task.assignedTo.name}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={getTimeRemainingClass(task.dueDate)}>
                            {getTimeRemaining(task.dueDate)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      {task.description && (
                        <p className={cn(
                          "text-sm text-muted-foreground mb-3 line-clamp-2",
                          task.isCompleted && "text-gray-400"
                        )}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(new Date(task.dueDate), 'h:mm a')}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 bg-gray-50 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewTask(task.id)}
                        aria-label={`View task: ${task.title}`}
                        className="text-brand-navy"
                      >
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      <div className="flex gap-1">
                        {!task.isCompleted && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleCompleteTask(task.id)}
                            aria-label={`Mark task complete: ${task.title}`}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditTask(task.id)}
                          aria-label={`Edit task: ${task.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label={`Delete task: ${task.title}`}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-0">
            {events.length === 0 ? (
              <div className="text-muted-foreground text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>No events scheduled for this date</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Create an event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden border-l-4 border-l-brand-navy">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <CardDescription className="flex items-center text-sm mt-1">
                            <User className="mr-1 h-3 w-3" />
                            Created by {event.createdBy.username}
                          </CardDescription>
                        </div>
                        <Badge className={getEventTypeColor(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-3.5 w-3.5" />
                          {formatTimeRange(event.startTime, event.endTime, event.isAllDay)}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-2 h-3.5 w-3.5" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 bg-gray-50 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-brand-navy"
                      >
                        View Details
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditEvent(event.id)}
                          aria-label={`Edit event: ${event.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteEventClick(event.id)}
                          aria-label={`Delete event: ${event.title}`}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for priority border colors
function getPriorityColorBorder(priority: string) {
  switch (priority) {
    case 'low': return 'border-blue-500';
    case 'medium': return 'border-yellow-500';
    case 'high': return 'border-orange-500';
    case 'urgent': return 'border-red-500';
    default: return 'border-gray-500';
  }
}

// Helper function for time remaining badge classes
function getTimeRemainingClass(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'bg-red-50 text-red-700 border-red-200';
  if (diffDays === 0) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (diffDays <= 2) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-green-50 text-green-700 border-green-200';
} 