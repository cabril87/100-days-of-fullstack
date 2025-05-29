'use client';

import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  Clock, 
  Star,
  Brain,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { FocusSession } from '@/lib/types/focus';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (templateName: string) => void;
  defaultTitle: string;
  defaultDescription?: string;
  sourceType: 'focus-session' | 'task' | 'manual';
  sourceSession?: FocusSession;
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onTemplateCreated,
  defaultTitle,
  defaultDescription = '',
  sourceType,
  sourceSession
}: CreateTemplateModalProps) {
  const [templateName, setTemplateName] = useState(defaultTitle);
  const [templateDescription, setTemplateDescription] = useState(defaultDescription);
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!templateName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await onTemplateCreated(templateName.trim());
    } finally {
      setIsCreating(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getQualityLabel = (rating?: number) => {
    if (!rating) return 'Not rated';
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Great';
      case 5: return 'Excellent';
      default: return 'Good';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-purple-500" />
            Create Task Template
          </DialogTitle>
          <DialogDescription>
            Turn this successful focus session into a reusable task template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Session Summary */}
          {sourceSession && sourceType === 'focus-session' && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Source Focus Session
                </h3>
                <div className="flex items-center gap-2">
                  {sourceSession.taskCompletedDuringSession && (
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(sourceSession.durationMinutes)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-600 font-medium">Quality Rating:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {sourceSession.sessionQualityRating && (
                      <>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= sourceSession.sessionQualityRating!
                                ? 'text-amber-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-purple-700">
                          {getQualityLabel(sourceSession.sessionQualityRating)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Completion Date:</span>
                  <p className="text-purple-800 mt-1">
                    {new Date(sourceSession.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {sourceSession.completionNotes && (
                <div className="mt-3">
                  <span className="text-purple-600 font-medium text-sm">Session Notes:</span>
                  <p className="text-purple-700 text-sm mt-1 italic">
                    "{sourceSession.completionNotes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Template Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name" className="text-base font-medium">
                Template Name
              </Label>
              <Input
                id="template-name"
                placeholder="Enter a descriptive name for your template"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="template-description" className="text-base font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="template-description"
                placeholder="Add details about what this template is for..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
                className="resize-none mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-public" className="text-base font-medium">
                  Share Template
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Make this template available to other users
                </p>
              </div>
              <Switch
                id="is-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !templateName.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 