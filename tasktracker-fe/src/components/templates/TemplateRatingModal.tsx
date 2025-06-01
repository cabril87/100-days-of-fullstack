'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { templateService } from '@/lib/services/templateService';
import { useAuth } from '@/lib/providers/AuthContext';
import { useToast } from '@/lib/hooks/useToast';
import { 
  TemplateRatingModalProps, 
  TemplateAnalytics, 
  TemplateReview, 
  TemplateRatingSubmission 
} from '@/lib/types/template';

export function TemplateRatingModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  currentRating = 0,
  totalRatings = 0,
  analytics
}: TemplateRatingModalProps) {
  const { user } = useAuth();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [completionTime, setCompletionTime] = useState<string>('');
  const [helpfulTips, setHelpfulTips] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userPreviousRating, setUserPreviousRating] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load user's previous rating if exists
      loadUserRating();
      setShowAnalytics(false);
    }
  }, [isOpen, templateId]);

  const loadUserRating = async () => {
    try {
      // This would be implemented in the backend
      // const response = await templateService.getUserRating(templateId);
      // setUserPreviousRating(response.data?.rating || null);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) {
      showToast('Please select a rating', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const submission: TemplateRatingSubmission = {
        rating: selectedRating,
        review: review.trim() || undefined,
        wouldRecommend: wouldRecommend ?? true,
        completionTime: completionTime ? parseInt(completionTime) : undefined,
        helpfulTips: helpfulTips.trim() || undefined,
      };

      await templateService.rateTemplate(templateId, selectedRating);
      
      // If backend supports full review submission:
      // await templateService.submitTemplateReview(templateId, submission);

      showToast(
        userPreviousRating 
          ? 'Rating updated successfully!' 
          : 'Thank you for your rating!',
        'success'
      );
      
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('Failed to submit rating. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: 'Poor - Not helpful',
      2: 'Fair - Some issues',
      3: 'Good - Mostly helpful',
      4: 'Very Good - Highly useful',
      5: 'Excellent - Outstanding!'
    };
    return labels[rating as keyof typeof labels] || '';
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderStarRating = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || selectedRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {(hoverRating || selectedRating) > 0 && (
        <div className="text-center">
          <p className={`font-semibold ${getRatingColor(hoverRating || selectedRating)}`}>
            {getRatingLabel(hoverRating || selectedRating)}
          </p>
          <p className="text-sm text-gray-600">
            {hoverRating || selectedRating} out of 5 stars
          </p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{analytics.usageCount}</div>
              <div className="text-sm text-gray-600">Users</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{analytics.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{analytics.averageCompletionTime}m</div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{analytics.rating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Rating Distribution
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <Progress 
                    value={(analytics.ratingDistribution[rating] || 0) / totalRatings * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {analytics.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Reviews */}
        {analytics.topReviews && analytics.topReviews.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Helpful Reviews
              </h4>
              <div className="space-y-4">
                {analytics.topReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.userName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-gray-600">{review.helpfulCount} helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Rate Template: {templateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Rating Display */}
          {currentRating > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Current Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= currentRating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-blue-900 font-semibold">
                        {currentRating.toFixed(1)} ({totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    {showAnalytics ? 'Hide' : 'Show'} Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Section */}
          {showAnalytics && renderAnalytics()}

          {/* Rating Input */}
          {!showAnalytics && (
            <>
              {userPreviousRating && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You previously rated this template {userPreviousRating} stars. 
                    Your new rating will replace the previous one.
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">How would you rate this template?</h3>
                {renderStarRating()}
              </div>

              {selectedRating > 0 && (
                <div className="space-y-4">
                  {/* Recommendation */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Would you recommend this template to others?
                    </label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={wouldRecommend === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWouldRecommend(true)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={wouldRecommend === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWouldRecommend(false)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        No
                      </Button>
                    </div>
                  </div>

                  {/* Review */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Share your experience (optional)
                    </label>
                    <Textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="What did you like about this template? How did it help you?"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {review.length}/500 characters
                    </p>
                  </div>

                  {/* Completion Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      How long did it take to complete? (minutes, optional)
                    </label>
                    <input
                      type="number"
                      value={completionTime}
                      onChange={(e) => setCompletionTime(e.target.value)}
                      placeholder="e.g., 30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="9999"
                    />
                  </div>

                  {/* Helpful Tips */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Any tips for future users? (optional)
                    </label>
                    <Textarea
                      value={helpfulTips}
                      onChange={(e) => setHelpfulTips(e.target.value)}
                      placeholder="Share any insights or tips that could help others succeed with this template"
                      rows={2}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {helpfulTips.length}/200 characters
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {!showAnalytics && selectedRating > 0 && (
            <Button 
              onClick={handleSubmitRating} 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Rating
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 