'use client';

import React, { useState } from 'react';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { TaskCategory } from '@/lib/types/task';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Pencil, Trash2, Plus, FolderPlus, Settings, List, TagIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

export interface CategoryManagerProps {
  buttonLabel?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  buttonSize?: "default" | "sm" | "lg" | "icon" | null | undefined;
  buttonId?: string;
  onCategorySelect?: (categoryId: number | null) => void;
}

export function CategoryManager({ 
  buttonLabel = "Categories", 
  buttonVariant = "default", 
  buttonSize = "default",
  buttonId,
  onCategorySelect 
}: CategoryManagerProps) {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useTemplates();
  const { showToast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [newCategoryData, setNewCategoryData] = useState<Partial<TaskCategory>>({
    name: '',
    color: '#6b7280',
    icon: 'tag'
  });
  const [editCategoryData, setEditCategoryData] = useState<TaskCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle creating a new category
  const handleCreateCategory = async () => {
    if (!newCategoryData.name?.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createCategory(newCategoryData);
      
      if (result) {
        showToast(`Category "${result.name}" created`, 'success');
        setNewCategoryData({
          name: '',
          color: '#6b7280',
          icon: 'tag'
        });
        setActiveTab('view');
      } else {
        showToast('Failed to create category', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
      console.error('Error creating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle updating a category
  const handleUpdateCategory = async () => {
    if (!editCategoryData || !editCategoryData.name?.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await updateCategory(editCategoryData.id, editCategoryData);
      
      if (result) {
        showToast(`Category "${result.name}" updated`, 'success');
        setEditCategoryData(null);
        setActiveTab('view');
      } else {
        showToast('Failed to update category', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
      console.error('Error updating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? Tasks will remain but become uncategorized.')) {
      return;
    }
    
    try {
      const success = await deleteCategory(categoryId);
      
      if (success) {
        showToast('Category deleted', 'success');
      } else {
        showToast('Failed to delete category', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
      console.error('Error deleting category:', error);
    }
  };
  
  // Handle category selection
  const handleSelectCategory = (categoryId: number) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
      setIsOpen(false);
    }
  };
  
  // Generate a random color for new categories
  const generateRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setNewCategoryData(prev => ({ ...prev, color: randomColor }));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          id={buttonId}
          className={cn(buttonLabel ? "" : "p-0 h-10 w-10 rounded-full")}
        >
          {buttonLabel ? (
            <>
              <Tag className="h-4 w-4 mr-2" />
              {buttonLabel}
            </>
          ) : (
            <Tag className="h-5 w-5" />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Categories</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="view">
              <List className="h-4 w-4 mr-2" />
              View Categories
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <FolderPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No categories yet</h3>
                <p className="text-gray-500 mb-4">Create your first category to organize tasks</p>
                <Button onClick={() => setActiveTab('create')}>
                  Create Category
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                  {categories.map(category => (
                    <div 
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 group"
                    >
                      <div 
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => handleSelectCategory(category.id)}
                      >
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color || '#6b7280' }} 
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setEditCategoryData({ ...category });
                            setActiveTab('edit');
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategoryData.name || ''}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="color"
                    value={newCategoryData.color || '#6b7280'}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-md cursor-pointer"
                  />
                  <Input
                    value={newCategoryData.color || '#6b7280'}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateRandomColor}>
                    Random
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newCategoryData.description || ''}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewCategoryData({
                      name: '',
                      color: '#6b7280',
                      icon: 'tag'
                    });
                    setActiveTab('view');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edit">
            {editCategoryData && (
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    value={editCategoryData.name || ''}
                    onChange={(e) => setEditCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="edit-color"
                      value={editCategoryData.color || '#6b7280'}
                      onChange={(e) => setEditCategoryData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-10 rounded-md cursor-pointer"
                    />
                    <Input
                      value={editCategoryData.color || '#6b7280'}
                      onChange={(e) => setEditCategoryData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Input
                    id="edit-description"
                    value={editCategoryData.description || ''}
                    onChange={(e) => setEditCategoryData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditCategoryData(null);
                      setActiveTab('view');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateCategory}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Update Category
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 