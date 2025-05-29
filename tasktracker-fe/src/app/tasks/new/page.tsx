'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthContext';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFormData } from '@/lib/types/task';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, RefreshCw, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/useToast';
import { Spinner } from '@/components/ui/spinner';

// Function to sanitize input to only allow alphanumeric and spaces
const sanitizeBasic = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9 ]/g, '');
};

function NewTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { user, isLoading: authLoading } = useAuth();
  const { createTask, error: taskProviderError } = useTasks();
  const { getTemplate, loading: templateLoading } = useTemplates();
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialFormData, setInitialFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 1
  });
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const { showToast } = useToast();
  
  // Remove the debug alert that might be contributing to the loop
  useEffect(() => {
    if (templateId) {
      console.log('🟢 NEW TASK PAGE: templateId received in URL:', templateId);
    } else {
      console.log('🟢 NEW TASK PAGE: No templateId in URL parameters');
    }
  }, [templateId]);
  
  // Load template data if templateId is provided
  useEffect(() => {
    // Skip if template was already loaded or no templateId
    if (!templateId || templateLoaded) {
      return;
    }
    
    const loadTemplate = async () => {
      try {
        setIsLoadingTemplate(true);
        setError(null);
        const templateIdNumber = parseInt(templateId);
        
        if (isNaN(templateIdNumber) || templateIdNumber <= 0) {
          console.error('Invalid template ID:', templateId);
          showToast('Invalid template ID', 'error');
          setError('The template ID is invalid. Using default values instead.');
          setTemplateLoaded(true); // Mark as loaded even if invalid
          return;
        }
        
        console.log(`⏳ Loading template with ID: ${templateIdNumber}`);
        
        const template = await getTemplate(templateIdNumber);
        
        if (template) {
          console.log('✅ Template loaded successfully:', template.title);
          
          // Initialize form with template data
          setInitialFormData({
            title: template.title,
            description: template.description || '',
            status: template.status as any || 'todo',
            priority: template.priority as any || 1,
            categoryId: template.categoryId
          });
          
          showToast(`Template "${template.title}" loaded`, 'success');
        } else {
          console.error('❌ Template not found or failed to load');
          showToast('Template not found', 'error');
          setError('The requested template could not be found. Using default values instead.');
        }
      } catch (error) {
        console.error('❌ Error loading template:', error);
        showToast('Failed to load template', 'error');
        setError('There was an error loading the template. Using default values instead.');
      } finally {
        setIsLoadingTemplate(false);
        setTemplateLoaded(true); // Mark as loaded in any case
      }
    };
    
    loadTemplate();
  }, [templateId, getTemplate, showToast, templateLoaded]);
  
  // Monitor task provider errors
  useEffect(() => {
    if (taskProviderError) {
      setError(taskProviderError);
      setIsSubmitting(false);
    }
  }, [taskProviderError]);

  // Redirect to login if not authenticated
  useEffect(() => {
  if (!authLoading && !user) {
    router.push('/auth/login?redirect=/tasks/new');
  }
  }, [authLoading, user, router]);

  // If successfully created, show feedback and then redirect
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/tasks?refresh=true');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  if (authLoading || isLoadingTemplate) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="text-brand-navy-dark dark:text-brand-cream text-sm mt-4">
            {isLoadingTemplate ? 'Loading template...' : 'Please wait...'}
          </p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-lg text-center shadow-md">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-xl font-medium bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">Task created successfully!</p>
          <p className="mt-2 text-green-600">Redirecting to tasks page...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare safe data
      const safeData: TaskFormData = {
        title: sanitizeBasic(data.title).substring(0, 50),
        description: data.description ? sanitizeBasic(data.description).substring(0, 200) : '',
        status: data.status || 'todo',
        priority: data.priority || 1,
        dueDate: data.dueDate,
        categoryId: data.categoryId,
      };
      
      console.log('Creating task:', safeData);
      
      const taskResult = await createTask(safeData);
      
      if (taskResult) {
        console.log('Task created successfully:', taskResult);
        showToast('Task created successfully!', 'success');
        setSuccess(true);
      } else {
        console.error('Task creation returned null or undefined result');
        setError(taskProviderError || 'Unable to create task. Please try again with simpler text.');
        showToast('Failed to create task', 'error');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError('An unexpected error occurred. Please try again with a simpler title and description (no special characters).');
      showToast('Error creating task', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 ">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-600">
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
            </Link>
            
            {templateId && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Creating from template</span>
              </div>
            )}
          </div>
          
          {/* Beautiful header card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600 opacity-[0.03] rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600 opacity-[0.05] rounded-full blur-2xl"></div>
            
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>
            
            <div className="relative z-10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Create New Task
                  </h1>
                  <p className="text-gray-600">
                    {templateId ? 'Creating a new task from template' : 'Build your next achievement step by step'}
                  </p>
                </div>
              </div>
              
              {/* Quick stats or tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Clear Goals</span>
                  </div>
                  <p className="text-xs text-blue-700">Define specific, actionable objectives</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Time Estimates</span>
                  </div>
                  <p className="text-xs text-green-700">Set realistic timeframes for completion</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Priority Focus</span>
                  </div>
                  <p className="text-xs text-purple-700">Organize by importance and urgency</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display with enhanced styling */}
        {error && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Error Creating Task</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Task Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-600 opacity-[0.02] rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-blue-600 opacity-[0.03] rounded-full blur-xl"></div>
          
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>
          
          <div className="relative z-10 p-8">
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={() => router.push('/tasks')}
              isSubmitting={isSubmitting}
              initialData={initialFormData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="text-brand-navy-dark dark:text-brand-cream text-sm mt-4">
            Loading...
          </p>
        </div>
      </div>
    }>
      <NewTaskForm />
    </Suspense>
  );
} 