'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { 
  Shield, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Save,
  Trash2,
  Eye,
  EyeOff,
  Info,
  Users,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { enhancedAuthService } from '@/lib/services/enhancedAuthService';
import { SecurityQuestionFormData } from '@/lib/interfaces/forms/auth-forms.interface';
import { securityQuestionSchema } from '@/lib/schemas/enhanced-auth';

// Props interface moved to lib/props/components/auth.props.ts
// interface SecurityQuestionSetupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showAgeAppropriate?: boolean;
  userAgeGroup?: 'Child' | 'Teen' | 'Adult';
  isUpdate?: boolean;
}

interface PredefinedQuestion {
  question: string;
  minimumAgeGroup: string;
  category: string;
  exampleFormat: string;
}

export const SecurityQuestionSetupForm: React.FC<SecurityQuestionSetupFormProps> = ({
  onSuccess,
  onCancel,
  showAgeAppropriate = true,
  userAgeGroup = 'Adult',
  isUpdate = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [predefinedQuestions, setPredefinedQuestions] = useState<PredefinedQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAnswers, setShowAnswers] = useState({
    answer1: false,
    answer2: false,
    answer3: false
  });
  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);
  const [existingQuestionStats, setExistingQuestionStats] = useState<{
    totalQuestions: number;
    lastUsedDaysAgo: number;
    totalUsageCount: number;
  } | null>(null);

  const form = useForm<SecurityQuestionFormData>({
    resolver: zodResolver(securityQuestionSchema),
    defaultValues: {
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: '',
    },
  });

  // Check for existing questions on mount
  useEffect(() => {
    const checkExistingQuestions = async () => {
      try {
        const [hasQuestions, stats] = await Promise.all([
          enhancedAuthService.hasSecurityQuestions(),
          enhancedAuthService.getSecurityQuestionStats().catch(() => null)
        ]);
        
        setHasExistingQuestions(hasQuestions.hasQuestions);
        setExistingQuestionStats(stats);
      } catch (error) {
        console.error('Error checking existing questions:', error);
      }
    };

    checkExistingQuestions();
  }, []);

  // Load age-appropriate questions
  useEffect(() => {
    const loadAgeAppropriateQuestions = async () => {
      if (!showAgeAppropriate) return;
      
      setLoadingQuestions(true);
      try {
        const questions = await enhancedAuthService.getAgeAppropriateQuestions(userAgeGroup, 15);
        setPredefinedQuestions(questions);
      } catch (error) {
        console.error('Error loading age-appropriate questions:', error);
        // Fall back to basic questions if API fails
        setPredefinedQuestions([
          { question: "What is your mother's maiden name?", minimumAgeGroup: 'Adult', category: 'Family', exampleFormat: 'Smith' },
          { question: "What city were you born in?", minimumAgeGroup: 'Adult', category: 'Personal', exampleFormat: 'Chicago' },
          { question: "What is the name of your first pet?", minimumAgeGroup: 'Adult', category: 'Personal', exampleFormat: 'Rex' },
          { question: "What is your favorite color?", minimumAgeGroup: 'Child', category: 'Personal', exampleFormat: 'blue' },
          { question: "What is your favorite food?", minimumAgeGroup: 'Child', category: 'Personal', exampleFormat: 'pizza' },
        ]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadAgeAppropriateQuestions();
  }, [showAgeAppropriate, userAgeGroup]);

  const handleSubmit = async (data: SecurityQuestionFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isUpdate) {
        await enhancedAuthService.updateSecurityQuestions(data);
        setSuccess('Security questions updated successfully!');
      } else {
        await enhancedAuthService.setupSecurityQuestions(data);
        setSuccess('Security questions set up successfully!');
      }
      
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('Error setting up security questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to set up security questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!confirm('Are you sure you want to delete all security questions? This cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await enhancedAuthService.deleteAllSecurityQuestions();
      setSuccess(`Successfully deleted ${result.deletedCount} security questions`);
      setHasExistingQuestions(false);
      setExistingQuestionStats(null);
      form.reset();
    } catch (error) {
      console.error('Error deleting security questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete security questions');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomQuestions = () => {
    if (predefinedQuestions.length < 3) return;
    
    const shuffled = [...predefinedQuestions].sort(() => 0.5 - Math.random());
    form.setValue('question1', shuffled[0]?.question || '');
    form.setValue('question2', shuffled[1]?.question || '');
    form.setValue('question3', shuffled[2]?.question || '');
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'family': return <Users className="h-4 w-4" />;
      case 'school': case 'education': return <GraduationCap className="h-4 w-4" />;
      case 'work': case 'job': return <Briefcase className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'family': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'personal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'school': case 'education': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'entertainment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'travel': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const renderQuestionField = (
    questionField: 'question1' | 'question2' | 'question3',
    answerField: 'answer1' | 'answer2' | 'answer3',
    questionNumber: number
  ) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm">
            {questionNumber}
          </span>
          Security Question {questionNumber}
        </h4>
      </div>

      <FormField
        control={form.control}
        name={questionField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question</FormLabel>
            <FormControl>
              {showAgeAppropriate && predefinedQuestions.length > 0 ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {predefinedQuestions.map((q, index) => (
                      <SelectItem key={index} value={q.question}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(q.category)}
                          <span className="flex-1">{q.question}</span>
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(q.category)}`}>
                            {q.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...field}
                  placeholder="Enter your security question"
                  className="w-full"
                />
              )}
            </FormControl>
            <FormDescription>
              Choose a question you&apos;ll remember the answer to
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={answerField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Answer</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={showAnswers[answerField] ? 'text' : 'password'}
                  placeholder="Enter your answer"
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowAnswers(prev => ({ ...prev, [answerField]: !prev[answerField] }))}
                >
                  {showAnswers[answerField] ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              Your answer should be exact and memorable (case-insensitive)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>
                {isUpdate ? 'Update Security Questions' : 'Set Up Security Questions'}
              </CardTitle>
              <CardDescription>
                {isUpdate 
                  ? 'Update your security questions for enhanced account recovery'
                  : 'Create security questions to help recover your account if you forget your password'
                }
              </CardDescription>
            </div>
          </div>
          {hasExistingQuestions && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Questions Set Up
            </Badge>
          )}
        </div>

        {existingQuestionStats && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-4 text-sm">
                <span>Total Questions: {existingQuestionStats.totalQuestions}</span>
                <span>Last Used: {existingQuestionStats.lastUsedDaysAgo === -1 ? 'Never' : `${existingQuestionStats.lastUsedDaysAgo} days ago`}</span>
                <span>Total Uses: {existingQuestionStats.totalUsageCount}</span>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {showAgeAppropriate && (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Age-Appropriate Questions</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Questions are curated for {userAgeGroup.toLowerCase()} users
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getRandomQuestions}
              disabled={loadingQuestions || predefinedQuestions.length < 3}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Random Questions
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {renderQuestionField('question1', 'answer1', 1)}
              {renderQuestionField('question2', 'answer2', 2)}
              {renderQuestionField('question3', 'answer3', 3)}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                {hasExistingQuestions && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAllQuestions}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Questions
                  </Button>
                )}
              </div>
              <Button type="submit" disabled={isLoading} className="min-w-32">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isUpdate ? 'Update Questions' : 'Set Up Questions'}
              </Button>
            </div>
          </form>
        </Form>

        <Alert className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Security Tips:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Choose questions with answers that won&apos;t change over time</li>
              <li>Use memorable answers that only you would know</li>
              <li>Avoid answers that could be found on social media</li>
              <li>Keep your answers private and secure</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}; 
