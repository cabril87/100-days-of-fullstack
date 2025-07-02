'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Send, 
  Clock, 
  Star, 
  Gift, 
  Sparkles, 
  PartyPopper,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface PermissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  initialDescription: string;
  childName: string;
  isChild: boolean;
}

export default function PermissionRequestModal({ 
  isOpen, 
  onClose, 
  action, 
  initialDescription, 
  childName,
  isChild 
}: PermissionRequestModalProps) {
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get action details for different request types
  const getActionDetails = (action: string) => {
    const details = {
      'spend_points': {
        title: '🎁 Request to Spend Stars',
        icon: Gift,
        color: 'bg-pink-100 text-pink-800',
        kidFriendly: true,
        description: 'Ask permission to use your stars for rewards!'
      },
      'extra_screen_time': {
        title: '⏰ Request Extra Screen Time', 
        icon: Clock,
        color: 'bg-blue-100 text-blue-800',
        kidFriendly: true,
        description: 'Ask for a little more time to play or watch!'
      },
      'create_task': {
        title: '✨ Request to Help Family',
        icon: Sparkles,
        color: 'bg-green-100 text-green-800',
        kidFriendly: true,
        description: 'Ask to add a new task to help the family!'
      },
      'join_activity': {
        title: '🎉 Request to Join Activity',
        icon: PartyPopper,
        color: 'bg-purple-100 text-purple-800',
        kidFriendly: true,
        description: 'Ask to join in on the fun!'
      },
      'create_family': {
        title: '👥 Request to Create Family Group',
        icon: Sparkles,
        color: 'bg-indigo-100 text-indigo-800',
        kidFriendly: false,
        description: 'Request permission to create and manage a family group'
      },
      'invite_friends': {
        title: '🤝 Request to Invite Friends',
        icon: Heart,
        color: 'bg-rose-100 text-rose-800',
        kidFriendly: false,
        description: 'Ask to invite friends to join family activities'
      },
      'extended_privileges': {
        title: '👑 Request More Responsibilities',
        icon: Star,
        color: 'bg-amber-100 text-amber-800',
        kidFriendly: false,
        description: 'Request additional family management permissions'
      }
    };
    
    return details[action as keyof typeof details] || {
      title: '📝 Permission Request',
      icon: AlertCircle,
      color: 'bg-gray-100 text-gray-800',
      kidFriendly: true,
      description: 'Request permission for an action'
    };
  };

  const actionDetails = getActionDetails(action);
  const IconComponent = actionDetails.icon;

  // Handle form submission
  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual API call to create permission request
      // await parentalControlService.createPermissionRequest({
      //   requestType: action,
      //   description: description.trim()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setDescription(initialDescription);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit permission request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setDescription(initialDescription);
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md ${isChild ? 'bg-gradient-to-br from-blue-50 to-purple-50' : ''}`}>
        {submitted ? (
          // Success state
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">
              {isChild ? '🎉 Request Sent!' : 'Permission Request Submitted'}
            </h3>
            <p className={`${isChild ? 'text-lg text-green-500' : 'text-green-600'}`}>
              {isChild 
                ? 'Your parents will see your request soon! 💕' 
                : 'Your request has been sent to the family admin for review.'
              }
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-3 ${isChild ? 'text-2xl' : 'text-xl'}`}>
                <div className={`p-2 rounded-full ${actionDetails.color}`}>
                  <IconComponent className={`${isChild ? 'h-6 w-6' : 'h-5 w-5'}`} />
                </div>
                <span>{actionDetails.title}</span>
              </DialogTitle>
              <DialogDescription className={`${isChild ? 'text-base text-gray-600' : ''}`}>
                {actionDetails.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Child-friendly info */}
              {isChild && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Heart className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    <strong>Hi {childName}!</strong> Tell your parents why you&apos;d like to do this. 
                    Be honest and explain how it will help you or the family! 💫
                  </AlertDescription>
                </Alert>
              )}

              {/* Description input */}
              <div className="space-y-2">
                <Label htmlFor="description" className={`${isChild ? 'text-lg font-semibold' : ''}`}>
                  {isChild ? '💬 Your Message to Parents:' : 'Request Details:'}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isChild 
                    ? "Tell your parents why this is important to you..." 
                    : "Provide details about your request..."
                  }
                  className={`min-h-[100px] ${isChild ? 'text-base border-2 border-blue-200 focus:border-purple-400' : ''}`}
                  disabled={isSubmitting}
                />
              </div>

              {/* Character count for kids */}
              {isChild && (
                <div className="text-right">
                  <Badge variant="outline" className="text-blue-600">
                    {description.length} characters
                  </Badge>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={`flex-1 ${isChild ? 'h-12 text-base' : ''}`}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isChild ? 'Cancel' : 'Cancel'}
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!description.trim() || isSubmitting}
                  className={`flex-1 ${isChild 
                    ? 'h-12 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                    : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      {isChild ? 'Sending...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {isChild ? 'Send to Parents 💕' : 'Submit Request'}
                    </>
                  )}
                </Button>
              </div>

              {/* Encouragement for kids */}
              {isChild && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    Remember: Good behavior helps parents say yes! 🌟
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 
