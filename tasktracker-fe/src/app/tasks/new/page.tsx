'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthContext';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFormData } from '@/lib/types/task';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/useToast';
import { Spinner } from '@/components/ui/spinner';

// Function to sanitize input to only allow alphanumeric and spaces
const sanitizeBasic = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9 ]/g, '');
};

export default function NewTaskPage() {
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
    priority: 'medium'
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
            priority: template.priority as any || 'medium',
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
        router.push('/tasks');
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
        priority: data.priority || 'medium',
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 -ml-3 gap-2" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
        </Link>
        </Button>
        
        {templateId && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Created from template</span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1"
              onClick={() => router.replace('/tasks/new')}
            >
              <RefreshCw className="h-3 w-3" />
              Clear template
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Create New Task</h1>
        </div>
        
        <div className="p-6">
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
          </div>
        )}
        
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <p className="text-sm">For best results, use simple alphanumeric characters in your task title and description.</p>
        </div>
        
        <TaskForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/tasks')} 
            initialData={initialFormData}
            isSubmitting={isSubmitting}
        />
        </div>
      </div>
    </div>
  );
} 