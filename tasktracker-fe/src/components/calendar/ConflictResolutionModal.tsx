'use client';

/*
 * Calendar Conflict Resolution Modal
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Enterprise-grade conflict resolution UI component
 * Following clean architecture and mobile-first responsive design
 */

import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ConflictingEventDTO, 
  ConflictResolutionDTO 
} from '@/lib/types/calendar';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictingEventDTO[];
  resolutions: ConflictResolutionDTO[];
  onResolve: (resolution: ConflictResolutionDTO) => void;
  eventTitle: string;
  originalTime: {
    start: Date;
    end: Date;
  };
}

const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getResolutionIcon = (type: ConflictResolutionDTO['type']) => {
  switch (type) {
    case 'move': return <ArrowRight className="h-4 w-4" />;
    case 'shorten': return <Clock className="h-4 w-4" />;
    case 'ignore': return <AlertTriangle className="h-4 w-4" />;
    case 'cancel': return <XCircle className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getResolutionColor = (severity: ConflictResolutionDTO['severity']): string => {
  switch (severity) {
    case 'error': return 'border-red-200 hover:bg-red-50 text-red-700';
    case 'warning': return 'border-yellow-200 hover:bg-yellow-50 text-yellow-700';
    case 'info': return 'border-blue-200 hover:bg-blue-50 text-blue-700';
    default: return 'border-gray-200 hover:bg-gray-50 text-gray-700';
  }
};

export default function ConflictResolutionModal({
  isOpen,
  onClose,
  conflicts,
  resolutions,
  onResolve,
  eventTitle,
  originalTime
}: ConflictResolutionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Scheduling Conflict Detected
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                &ldquo;{eventTitle}&rdquo; conflicts with {conflicts.length} existing item{conflicts.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Scheduled: {originalTime.start.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })} - {originalTime.end.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Conflicting Events Section */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Conflicts with:
            </h4>
            <div className="space-y-3">
              {conflicts.map((conflict, index) => (
                <div 
                  key={`${conflict.type}-${conflict.id}-${index}`}
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  {conflict.type === 'event' ? (
                    <CalendarIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-red-900 dark:text-red-100 truncate">
                        {conflict.title}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={getSeverityColor(conflict.conflictSeverity)}
                      >
                        {conflict.conflictSeverity} conflict
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {conflict.startTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })} - {conflict.endTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </p>
                  </div>
                  {conflict.priority && (
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        conflict.priority === 'urgent' || conflict.priority === 'high' 
                          ? 'bg-red-100 text-red-800 border-red-300' :
                        conflict.priority === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-green-100 text-green-800 border-green-300'
                      }`}
                    >
                      {conflict.priority}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Options Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Choose a resolution:
            </h4>
            <div className="grid gap-3">
              {resolutions.map((resolution, index) => (
                <button
                  key={`${resolution.type}-${index}`}
                  onClick={() => onResolve(resolution)}
                  className={`w-full flex items-center gap-4 p-4 text-left rounded-lg border transition-all duration-200 hover:shadow-md ${getResolutionColor(resolution.severity)}`}
                >
                  <div className="flex-shrink-0">
                    {getResolutionIcon(resolution.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{resolution.message}</p>
                    {resolution.suggestedTime && (
                      <p className="text-sm opacity-75 mt-1">
                        New time: {resolution.suggestedTime.start} - {resolution.suggestedTime.end}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 