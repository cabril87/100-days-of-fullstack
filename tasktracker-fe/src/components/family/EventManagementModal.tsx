'use client';

/**
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Bell,
    AlertTriangle,
    Plus,
    Minus,
    Edit,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Repeat,
    Star,
    Info
} from 'lucide-react';
import {
    userCalendarService,
    FamilyCalendarEventWithFamilyDTO,
    CreateEventRequest,
    UpdateEventRequest,
    CreateReminderRequest,
    UserFamilyCalendarSummaryDTO,
    FamilyCalendarEventAttendeeDTO
} from '@/lib/services/userCalendarService';
import { familyService } from '@/lib/services/familyService';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';

interface EventManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'view' | 'copy';
    event?: FamilyCalendarEventWithFamilyDTO;
    selectedDate?: Date;
    selectedFamilyId?: number;
    userFamilies: UserFamilyCalendarSummaryDTO[];
    onEventCreated?: (event: any) => void;
    onEventUpdated?: (event: any) => void;
    onEventDeleted?: (eventId: number) => void;
}

interface FormReminder {
    id: string;
    reminderTime: string;
    reminderType: string;
    message: string;
}

export default function EventManagementModal({
    isOpen,
    onClose,
    mode,
    event,
    selectedDate,
    selectedFamilyId,
    userFamilies,
    onEventCreated,
    onEventUpdated,
    onEventDeleted
}: EventManagementModalProps) {
    const { showToast } = useToast();
    
    // Form state
    const [formData, setFormData] = useState({
        familyId: selectedFamilyId || 0,
        title: '',
        description: '',
        location: '',
        eventType: 'Event',
        startTime: '',
        endTime: '',
        isAllDay: false,
        isRecurring: false,
        recurrencePattern: '',
        priority: 'Normal',
        isPrivate: false,
        attendeeIds: [] as number[],
    });

    const [reminders, setReminders] = useState<FormReminder[]>([]);
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Event types
    const eventTypes = [
        'Meeting', 'Appointment', 'Task', 'Reminder', 'Event',
        'Birthday', 'Holiday', 'Vacation', 'Work', 'Personal', 'Family', 'Social'
    ];

    // Priority levels
    const priorities = ['Low', 'Normal', 'High', 'Critical'];

    // Reminder types
    const reminderTypes = ['Email', 'SMS', 'Push', 'InApp'];

    // Recurrence patterns
    const recurrencePatterns = [
        'Daily', 'Weekly', 'BiWeekly', 'Monthly', 'Yearly'
    ];

    // Initialize form data
    useEffect(() => {
        if (mode === 'create') {
            const now = new Date();
            const startDate = selectedDate || now;
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

            setFormData({
                familyId: selectedFamilyId || (userFamilies.length > 0 ? userFamilies[0].familyId : 0),
                title: '',
                description: '',
                location: '',
                eventType: 'Event',
                startTime: startDate.toISOString().slice(0, 16),
                endTime: endDate.toISOString().slice(0, 16),
                isAllDay: false,
                isRecurring: false,
                recurrencePattern: '',
                priority: 'Normal',
                isPrivate: false,
                attendeeIds: [],
            });
            setReminders([]);
        } else if (event) {
            setFormData({
                familyId: event.familyId,
                title: event.title,
                description: event.description,
                location: event.location,
                eventType: event.eventType,
                startTime: new Date(event.startTime).toISOString().slice(0, 16),
                endTime: new Date(event.endTime).toISOString().slice(0, 16),
                isAllDay: event.isAllDay,
                isRecurring: event.isRecurring,
                recurrencePattern: event.recurrencePattern || '',
                priority: event.priority,
                isPrivate: event.isPrivate,
                attendeeIds: event.attendees.map(a => a.familyMemberId),
            });

            setReminders(event.reminders.map(r => ({
                id: r.id.toString(),
                reminderTime: new Date(r.reminderTime).toISOString().slice(0, 16),
                reminderType: r.reminderType,
                message: r.message
            })));

            if (mode === 'copy') {
                setFormData(prev => ({
                    ...prev,
                    title: `Copy of ${prev.title}`,
                }));
            }
        }
    }, [mode, event, selectedDate, selectedFamilyId, userFamilies]);

    // Load family members when family changes
    useEffect(() => {
        if (formData.familyId) {
            loadFamilyMembers(formData.familyId);
        }
    }, [formData.familyId]);

    // Check for conflicts when time changes
    useEffect(() => {
        if (formData.startTime && formData.endTime && !formData.isAllDay) {
            checkConflicts();
        }
    }, [formData.startTime, formData.endTime, formData.familyId]);

    const loadFamilyMembers = async (familyId: number) => {
        try {
            const family = await familyService.getFamily(familyId.toString());
            if (family?.data) {
                setFamilyMembers(family.data.members || []);
            }
        } catch (error) {
            console.error('Error loading family members:', error);
        }
    };

    const checkConflicts = async () => {
        try {
            const userConflicts = await userCalendarService.getUserCalendarConflicts();
            const eventStart = new Date(formData.startTime);
            const eventEnd = new Date(formData.endTime);

            const relevantConflicts = userConflicts.filter(conflict => {
                const conflictStart = new Date(conflict.conflictStartTime);
                const conflictEnd = new Date(conflict.conflictEndTime);
                return (
                    (eventStart >= conflictStart && eventStart <= conflictEnd) ||
                    (eventEnd >= conflictStart && eventEnd <= conflictEnd) ||
                    (eventStart <= conflictStart && eventEnd >= conflictEnd)
                );
            });

            setConflicts(relevantConflicts);
        } catch (error) {
            console.error('Error checking conflicts:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const reminderRequests: CreateReminderRequest[] = reminders.map(r => ({
                reminderTime: r.reminderTime,
                reminderType: r.reminderType,
                message: r.message
            }));

            if (mode === 'create' || mode === 'copy') {
                const request: CreateEventRequest = {
                    ...formData,
                    attendeeIds: formData.attendeeIds,
                    reminders: reminderRequests
                };

                const result = await userCalendarService.createEvent(request);
                if (result) {
                    onEventCreated?.(result);
                    onClose();
                    showToast("The event has been successfully created.", "success");
                }
            } else if (mode === 'edit' && event) {
                const request: UpdateEventRequest = {
                    id: event.id,
                    ...formData,
                    attendeeIds: formData.attendeeIds,
                    reminders: reminderRequests
                };

                const result = await userCalendarService.updateEvent(request);
                if (result) {
                    onEventUpdated?.(result);
                    onClose();
                    showToast("The event has been successfully updated.", "success");
                }
            }
        } catch (error) {
            console.error('Error saving event:', error);
            setError('Failed to save event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!event || mode !== 'edit') return;

        if (confirm('Are you sure you want to delete this event?')) {
            setLoading(true);
            try {
                const success = await userCalendarService.deleteEvent(event.familyId, event.id);
                if (success) {
                    onEventDeleted?.(event.id);
                    onClose();
                    showToast("The event has been successfully deleted.", "success");
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                setError('Failed to delete event. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const addReminder = () => {
        const newReminder: FormReminder = {
            id: Date.now().toString(),
            reminderTime: formData.startTime,
            reminderType: 'Email',
            message: `Reminder: ${formData.title}`
        };
        setReminders([...reminders, newReminder]);
    };

    const removeReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const updateReminder = (id: string, field: string, value: string) => {
        setReminders(reminders.map(r => 
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const isReadOnly = mode === 'view';
    const selectedFamily = userFamilies.find(f => f.familyId === formData.familyId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden p-6">
                    {/* Decorative background elements */}
                    <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
                    
                    {/* Gradient accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
                    
                    <div className="relative z-10">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {mode === 'create' && <Plus className="w-5 h-5 text-purple-600" />}
                                {mode === 'edit' && <Edit className="w-5 h-5 text-purple-600" />}
                                {mode === 'view' && <Eye className="w-5 h-5 text-purple-600" />}
                                {mode === 'copy' && <Copy className="w-5 h-5 text-purple-600" />}
                                {mode === 'create' ? 'Create Event' : 
                                 mode === 'edit' ? 'Edit Event' : 
                                 mode === 'copy' ? 'Copy Event' : 'Event Details'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                {mode === 'create' ? 'Create a new calendar event' :
                                 mode === 'edit' ? 'Modify event details' :
                                 mode === 'copy' ? 'Create a copy of this event' :
                                 'View event information'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            {error && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {conflicts.length > 0 && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="font-semibold">Schedule Conflicts Detected</div>
                                        <div className="text-sm mt-1">
                                            This event conflicts with {conflicts.length} other event(s). 
                                            Please review the timing.
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Information */}
                            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                
                                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b relative z-10">
                                    <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
                                        <Info className="w-5 h-5 text-purple-600" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 relative z-10">
                                    {/* Family Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="family">Family</Label>
                                        <Select 
                                            value={formData.familyId.toString()} 
                                            onValueChange={(value) => setFormData({...formData, familyId: parseInt(value)})}
                                            disabled={isReadOnly}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a family" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userFamilies.map((family) => (
                                                    <SelectItem key={family.familyId} value={family.familyId.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full" 
                                                                style={{ backgroundColor: family.familyColor }}
                                                            />
                                                            {family.familyName}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            placeholder="Event title"
                                            required
                                            disabled={isReadOnly}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Event description"
                                            rows={3}
                                            disabled={isReadOnly}
                                        />
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            placeholder="Event location"
                                            disabled={isReadOnly}
                                        />
                                    </div>

                                    {/* Event Type and Priority */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="eventType">Event Type</Label>
                                            <Select 
                                                value={formData.eventType} 
                                                onValueChange={(value) => setFormData({...formData, eventType: value})}
                                                disabled={isReadOnly}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {eventTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-3 h-3 rounded-full" 
                                                                    style={{ backgroundColor: userCalendarService.getEventTypeColor(type) }}
                                                                />
                                                                {type}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority" className="flex items-center gap-2">
                                                <Star className="w-4 h-4" />
                                                Priority
                                            </Label>
                                            <Select 
                                                value={formData.priority} 
                                                onValueChange={(value) => setFormData({...formData, priority: value})}
                                                disabled={isReadOnly}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorities.map((priority) => (
                                                        <SelectItem key={priority} value={priority}>
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-3 h-3 rounded-full" 
                                                                    style={{ backgroundColor: userCalendarService.getPriorityColor(priority) }}
                                                                />
                                                                {priority}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Date and Time */}
                            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                
                                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b relative z-10">
                                    <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        Date & Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 relative z-10">
                                    {/* All Day Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isAllDay"
                                            checked={formData.isAllDay}
                                            onCheckedChange={(checked) => setFormData({...formData, isAllDay: checked})}
                                            disabled={isReadOnly}
                                        />
                                        <Label htmlFor="isAllDay">All day event</Label>
                                    </div>

                                    {/* Start and End Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startTime">Start Time *</Label>
                                            <Input
                                                id="startTime"
                                                type={formData.isAllDay ? "date" : "datetime-local"}
                                                value={formData.isAllDay ? formData.startTime.split('T')[0] : formData.startTime}
                                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                                required
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="endTime">End Time *</Label>
                                            <Input
                                                id="endTime"
                                                type={formData.isAllDay ? "date" : "datetime-local"}
                                                value={formData.isAllDay ? formData.endTime.split('T')[0] : formData.endTime}
                                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                                required
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>

                                    {/* Recurring Event */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="isRecurring"
                                                checked={formData.isRecurring}
                                                onCheckedChange={(checked) => setFormData({...formData, isRecurring: checked})}
                                                disabled={isReadOnly}
                                            />
                                            <Label htmlFor="isRecurring" className="flex items-center gap-2">
                                                <Repeat className="w-4 h-4" />
                                                Recurring event
                                            </Label>
                                        </div>

                                        {formData.isRecurring && (
                                            <div className="space-y-2">
                                                <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                                                <Select 
                                                    value={formData.recurrencePattern} 
                                                    onValueChange={(value) => setFormData({...formData, recurrencePattern: value})}
                                                    disabled={isReadOnly}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select recurrence pattern" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {recurrencePatterns.map((pattern) => (
                                                            <SelectItem key={pattern} value={pattern}>
                                                                {pattern}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Advanced Settings */}
                            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                
                                <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-amber-50 border-b relative z-10">
                                    <CardTitle 
                                        className="text-lg font-medium flex items-center gap-2 cursor-pointer text-gray-800" 
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                    >
                                        <Users className="w-5 h-5 text-green-600" />
                                        Advanced Settings
                                        <Badge variant="outline" className="ml-auto bg-white/80 hover:bg-white transition-colors">
                                            {showAdvanced ? 'Hide' : 'Show'}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                {showAdvanced && (
                                    <CardContent className="space-y-4 pt-4 relative z-10">
                                        {/* Privacy */}
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="isPrivate"
                                                checked={formData.isPrivate}
                                                onCheckedChange={(checked) => setFormData({...formData, isPrivate: checked})}
                                                disabled={isReadOnly}
                                            />
                                            <Label htmlFor="isPrivate" className="flex items-center gap-2">
                                                {formData.isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                Private event
                                            </Label>
                                        </div>

                                        {/* Attendees */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Attendees
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {familyMembers.map((member) => (
                                                    <div key={member.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`member-${member.id}`}
                                                            checked={formData.attendeeIds.includes(member.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        attendeeIds: [...formData.attendeeIds, member.id]
                                                                    });
                                                                } else {
                                                                    setFormData({
                                                                        ...formData,
                                                                        attendeeIds: formData.attendeeIds.filter(id => id !== member.id)
                                                                    });
                                                                }
                                                            }}
                                                            disabled={isReadOnly}
                                                        />
                                                        <Label htmlFor={`member-${member.id}`} className="text-sm">
                                                            {member.user?.username || member.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Reminders */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="flex items-center gap-2">
                                                    <Bell className="w-4 h-4" />
                                                    Reminders
                                                </Label>
                                                {!isReadOnly && (
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={addReminder}
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add Reminder
                                                    </Button>
                                                )}
                                            </div>

                                            {reminders.map((reminder) => (
                                                <Card 
                                                    key={reminder.id} 
                                                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all relative overflow-hidden"
                                                >
                                                    {/* Small decorative elements for reminder cards */}
                                                    <div className="absolute -top-5 -right-5 w-16 h-16 bg-blue-600 opacity-[0.03] rounded-full blur-xl"></div>
                                                    <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-purple-600 opacity-[0.03] rounded-full blur-xl"></div>
                                                    
                                                    <div className="grid grid-cols-12 gap-4 items-center relative z-10">
                                                        <div className="col-span-4">
                                                            <Label className="text-sm">Time</Label>
                                                            <Input
                                                                type="datetime-local"
                                                                value={reminder.reminderTime}
                                                                onChange={(e) => updateReminder(reminder.id, 'reminderTime', e.target.value)}
                                                                disabled={isReadOnly}
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Label className="text-sm">Type</Label>
                                                            <Select 
                                                                value={reminder.reminderType} 
                                                                onValueChange={(value) => updateReminder(reminder.id, 'reminderType', value)}
                                                                disabled={isReadOnly}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {reminderTypes.map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            {type}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="col-span-5">
                                                            <Label className="text-sm">Message</Label>
                                                            <Input
                                                                value={reminder.message}
                                                                onChange={(e) => updateReminder(reminder.id, 'message', e.target.value)}
                                                                placeholder="Reminder message"
                                                                disabled={isReadOnly}
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            {!isReadOnly && (
                                                                <Button 
                                                                    type="button" 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => removeReminder(reminder.id)}
                                                                    className="mt-5"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Event Info (View Mode) */}
                            {mode === 'view' && event && (
                                <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
                                    {/* Decorative elements */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-600 opacity-[0.05] rounded-full blur-2xl"></div>
                                    
                                    <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-cyan-50 border-b relative z-10">
                                        <CardTitle className="text-lg font-medium text-gray-800">Event Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 pt-4 relative z-10">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-indigo-600" />
                                            Created by {event.createdByName} on {new Date(event.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4 text-cyan-600" />
                                            Last modified on {new Date(event.lastModified).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="w-4 h-4 text-indigo-600" />
                                            {event.attendees.length} attendee(s)
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <DialogFooter className="flex justify-between pt-6">
                                <div>
                                    {mode === 'edit' && (
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={onClose}
                                        className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-300"
                                    >
                                        Cancel
                                    </Button>
                                    {!isReadOnly && (
                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {loading ? 'Saving...' : 
                                             mode === 'create' ? 'Create Event' : 
                                             mode === 'copy' ? 'Copy Event' : 'Update Event'}
                                        </Button>
                                    )}
                                </div>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 