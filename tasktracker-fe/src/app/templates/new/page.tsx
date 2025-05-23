'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CategoryManager } from '@/components/tasks/CategoryManager';
import { useToast } from '@/lib/hooks/useToast';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Clock, Save, Folder } from 'lucide-react';

export default function NewTemplatePage() {
  const router = useRouter();
  const { categories, createTemplate } = useTemplates();
  const { showToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateData, setTemplateData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    categoryId: undefined as number | undefined,
    estimatedDuration: '' as string | undefined,
    isDefault: false
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateData.title.trim()) {
      showToast('Template title is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert estimatedDuration to number if present
      const estimatedDurationNum = templateData.estimatedDuration 
        ? parseInt(templateData.estimatedDuration) 
        : undefined;
      
      const result = await createTemplate({
        ...templateData,
        estimatedDuration: estimatedDurationNum
      });
      
      if (result) {
        showToast(`Template "${result.title}" created successfully`, 'success');
        router.push('/templates');
      } else {
        showToast('Failed to create template', 'error');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showToast('An error occurred while creating the template', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setTemplateData(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 -ml-3 gap-2" asChild>
          <Link href="/templates">
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Link>
        </Button>
      </div>
      
      <div className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 flex items-center gap-3">
          <Folder className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-blue-700">Create New Template</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <Label htmlFor="title">Template Title *</Label>
            <Input
              id="title"
              value={templateData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter template title"
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={templateData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter template description"
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="priority">Default Priority</Label>
              <Select 
                value={templateData.priority} 
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="status">Default Status</Label>
              <Select 
                value={templateData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select 
                    value={templateData.categoryId?.toString() || ''} 
                    onValueChange={(value) => handleChange('categoryId', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map(category => (
                        <SelectItem 
                          key={category.id} 
                          value={String(category.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CategoryManager 
                  buttonLabel="Manage" 
                  buttonSize="sm"
                  onCategorySelect={(categoryId) => {
                    handleChange('categoryId', categoryId);
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="estimatedDuration" className="flex gap-1 items-center">
                <Clock className="h-4 w-4" />
                Estimated Duration (minutes)
              </Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="0"
                value={templateData.estimatedDuration || ''}
                onChange={(e) => handleChange('estimatedDuration', e.target.value)}
                placeholder="Enter estimated duration"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isDefault"
              checked={templateData.isDefault}
              onCheckedChange={(checked) => handleChange('isDefault', checked)}
            />
            <Label htmlFor="isDefault">Set as default template</Label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              onClick={() => router.push('/templates')}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 