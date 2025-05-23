'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { TaskTemplate, TaskCategory } from '@/lib/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Folder, Tag, Package, Info, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TemplatesPage() {
  const { templates, categories, loading, getTemplates } = useTemplates();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load templates when the page loads
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setError(null);
      try {
        await getTemplates();
      } catch (err) {
        setError('Failed to load templates. Please try again.');
        console.error('Error loading templates:', err);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    if (templates.length === 0 && !loading) {
      loadTemplates();
    }
  }, [getTemplates, templates.length, loading]);
  
  // Filter templates based on search query and selected category
  useEffect(() => {
    let filtered = [...templates];
    
    // Filter by category if selected
    if (selectedCategory !== null) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        (t.description && t.description.toLowerCase().includes(query))
      );
    }
    
    // Sort templates - prioritize default templates, then by name
    filtered.sort((a, b) => {
      // Default templates come first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      
      // Then sort by recently used (using template ID as a proxy)
      return b.id - a.id;
    });
    
    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);
  
  // Get category name by ID
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  // Get category color by ID
  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return '#6b7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  // Count templates by category
  const getTemplateCountByCategory = (categoryId?: number): number => {
    if (categoryId === null) return templates.length;
    return templates.filter(t => t.categoryId === categoryId).length;
  };
  
  // Template card component
  const TemplateCard = ({ template }: { template: TaskTemplate }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="p-4 relative"
        style={{
          borderTop: `3px solid ${getCategoryColor(template.categoryId)}`
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-800">
            {template.title}
          </h3>
          {template.isDefault && (
            <Badge variant="secondary" className="text-xs">Default</Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {template.description || 'No description'}
        </p>
        
        <div className="flex justify-between items-center">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              backgroundColor: `${getCategoryColor(template.categoryId)}20`,
              color: getCategoryColor(template.categoryId),
              borderColor: `${getCategoryColor(template.categoryId)}40`
            }}
          >
            {getCategoryName(template.categoryId)}
          </Badge>
          
          {template.estimatedDuration && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {template.estimatedDuration} min
            </span>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
          <a 
            href={`/tasks/new?templateId=${template.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
          >
            Use Template
          </a>
          
          <a 
            href={`/tasks/new?templateId=${template.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 bg-amber-100 text-amber-600 hover:bg-amber-200 px-2 py-1 border border-amber-300"
          >
            New Tab
          </a>
        </div>
      </div>
    </div>
  );
  
  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
      <p className="text-gray-500 max-w-md">
        {searchQuery 
          ? `No templates match "${searchQuery}"`
          : selectedCategory !== null 
            ? "No templates in this category" 
            : "You don't have any templates yet"}
      </p>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="h-12 w-12 text-amber-500 mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">Couldn't load templates</h3>
      <p className="text-gray-500 max-w-md mb-4">
        {error || 'There was an error loading your templates. Please try again.'}
      </p>
      <Button 
        variant="outline" 
        onClick={() => {
          setError(null);
          getTemplates();
        }}
      >
        Try Again
      </Button>
    </div>
  );
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="ghost" className="gap-2 -ml-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold">Task Templates</h1>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex gap-6">
        {/* Left sidebar with categories */}
        <div className="w-64 space-y-2">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Categories</h2>
          
          <button
            className={cn(
              "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-between",
              selectedCategory === null 
                ? "bg-blue-50 text-blue-700" 
                : "hover:bg-gray-100 text-gray-700"
            )}
            onClick={() => setSelectedCategory(null)}
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>All Templates</span>
            </div>
            <Badge variant="outline" className="bg-white">
              {templates.length}
            </Badge>
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-between",
                selectedCategory === category.id 
                  ? "bg-blue-50 text-blue-700" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }} 
                />
                <span>{category.name}</span>
              </div>
              <Badge variant="outline" className="bg-white">
                {getTemplateCountByCategory(category.id)}
              </Badge>
            </button>
          ))}
          
          <div className="text-xs text-gray-500 px-3 py-2 flex items-center gap-1 mt-4">
            <Info className="h-3 w-3" />
            <span>Click a category to filter</span>
          </div>
        </div>
        
        {/* Main content with templates */}
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-medium">
              {selectedCategory !== null 
                ? `${getCategoryName(selectedCategory)} Templates` 
                : 'All Templates'}
              <span className="ml-2 text-xs text-gray-500 font-normal">(recent first)</span>
            </h2>
            <div className="text-sm text-gray-500">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
            </div>
          </div>
          
          {isLoadingTemplates || loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-sm text-gray-500">Loading templates...</span>
              </div>
            </div>
          ) : error ? (
            <ErrorState />
          ) : filteredTemplates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 