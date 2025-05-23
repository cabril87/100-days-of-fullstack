'use client';

import React, { useState } from 'react';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { Task, SaveAsTemplateInput } from '@/lib/types/task';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SaveIcon, Folder } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface SaveAsTemplateButtonProps {
  task: Task;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function SaveAsTemplateButton({
  task,
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true,
  label = 'Save as Template'
}: SaveAsTemplateButtonProps) {
  const { categories, createCategory, saveTaskAsTemplate } = useTemplates();
  const { showToast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateData, setTemplateData] = useState<SaveAsTemplateInput>({
    taskId: task.id,
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    isPublic: false
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  
  // Handle category selection
  const handleCategoryChange = (value: string) => {
    if (value === 'new') {
      setShowNewCategoryInput(true);
    } else if (value === 'uncategorized') {
      setTemplateData(prev => ({
        ...prev,
        categoryId: undefined
      }));
      setShowNewCategoryInput(false);
    } else {
      setTemplateData(prev => ({
        ...prev,
        categoryId: value ? parseInt(value) : undefined
      }));
      setShowNewCategoryInput(false);
    }
  };
  
  // Handle creating a new category
  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }
    
    try {
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}` // Random color
      });
      
      if (newCategory) {
        setTemplateData(prev => ({
          ...prev,
          categoryId: newCategory.id
        }));
        setShowNewCategoryInput(false);
        setNewCategoryName('');
        showToast(`Category "${newCategory.name}" created`, 'success');
      }
    } catch (error) {
      showToast('Failed to create category', 'error');
    }
  };
  
  // Handle template submission
  const handleSubmit = async () => {
    if (!templateData.title.trim()) {
      showToast('Template title is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await saveTaskAsTemplate(templateData);
      
      if (result) {
        showToast('Task saved as template', 'success');
        setIsOpen(false);
      } else {
        showToast('Failed to save template', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          onClick={() => {
            // Reset form state when opening
            setTemplateData({
              taskId: task.id,
              title: task.title,
              description: task.description,
              categoryId: task.categoryId,
              isPublic: false
            });
            setShowNewCategoryInput(false);
            setNewCategoryName('');
          }}
        >
          {showIcon && <Folder className="h-4 w-4 mr-2" />}
          {label}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a reusable template from this task
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-title">Template Title</Label>
            <Input
              id="template-title"
              value={templateData.title}
              onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter template title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateData.description || ''}
              onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter template description"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="template-category">Category</Label>
            {!showNewCategoryInput ? (
              <Select 
                value={templateData.categoryId ? String(templateData.categoryId) : 'uncategorized'} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories.map(category => (
                    <SelectItem 
                      key={category.id} 
                      value={String(category.id)}
                      style={{ color: category.color }}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Create new category</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleCreateNewCategory}
                >
                  Create
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNewCategoryInput(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="template-public"
              checked={templateData.isPublic}
              onCheckedChange={(checked) => setTemplateData(prev => ({ ...prev, isPublic: checked }))}
            />
            <Label htmlFor="template-public">Make template available to all team members</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 