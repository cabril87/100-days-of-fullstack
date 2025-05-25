'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Plus,
  Star,
  StarOff,
  BookOpen,
  Folder,
  Tag,
  Clock,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Users,
  Zap,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { TaskTemplate, TaskCategory } from '@/lib/types/task';

interface AdvancedTemplateLibraryProps {
  onTemplateSelect?: (template: TaskTemplate) => void;
  onTemplateCreate?: () => void;
  showCreateButton?: boolean;
}

export default function AdvancedTemplateLibrary({
  onTemplateSelect,
  onTemplateCreate,
  showCreateButton = true
}: AdvancedTemplateLibraryProps) {
  const { templates, categories, loading, getTemplates, favoriteTemplate, unfavoriteTemplate } = useTemplates();
  
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [viewMode, setViewMode] = useState<string>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Template preview state
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load templates on mount
  useEffect(() => {
    if (templates.length === 0) {
      getTemplates();
    }
  }, [templates.length, getTemplates]);

  // Filter and sort templates
  const filteredTemplates = React.useMemo(() => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => 
        t.categoryId === parseInt(selectedCategory)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(t => t.isFavorite);
    }

    // Sort templates
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'category':
          const aCat = getCategoryName(a.categoryId);
          const bCat = getCategoryName(b.categoryId);
          compareValue = aCat.localeCompare(bCat);
          break;
        case 'type':
          compareValue = (a.type || '').localeCompare(b.type || '');
          break;
        case 'created':
          compareValue = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'usage':
          compareValue = (a.usageCount || 0) - (b.usageCount || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, selectedType, showFavoritesOnly, sortBy, sortOrder]);

  // Helper functions
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return '#6b7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const handleTemplatePreview = (template: TaskTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleFavoriteToggle = async (template: TaskTemplate) => {
    try {
      if (template.isFavorite) {
        await unfavoriteTemplate(template.id);
      } else {
        await favoriteTemplate(template.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Template stats
  const templateStats = React.useMemo(() => {
    return {
      total: templates.length,
      favorites: templates.filter(t => t.isFavorite).length,
      byCategory: categories.map(cat => ({
        ...cat,
        count: templates.filter(t => t.categoryId === cat.id).length
      })),
      recentlyUsed: templates.filter(t => t.lastUsed && 
        new Date(t.lastUsed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length
    };
  }, [templates, categories]);

  // Template card component
  const TemplateCard = ({ template }: { template: TaskTemplate }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: getCategoryColor(template.categoryId) }}
      />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-1">{template.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2 mt-1">
              {template.description || 'No description'}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFavoriteToggle(template)}
              className="h-8 w-8 p-0"
            >
              {template.isFavorite ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTemplatePreview(template)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Template badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              backgroundColor: `${getCategoryColor(template.categoryId)}20`,
              borderColor: `${getCategoryColor(template.categoryId)}40`,
              color: getCategoryColor(template.categoryId)
            }}
          >
            {getCategoryName(template.categoryId)}
          </Badge>
          
          {template.type && (
            <Badge variant="secondary" className="text-xs">
              {template.type}
            </Badge>
          )}
          
          {template.isDefault && (
            <Badge variant="default" className="text-xs">
              Default
            </Badge>
          )}
        </div>

        {/* Template metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {template.estimatedDuration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {template.estimatedDuration}m
              </span>
            )}
            
            {template.usageCount && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {template.usageCount} uses
              </span>
            )}
          </div>
          
          {template.lastUsed && (
            <span>Used {new Date(template.lastUsed).toLocaleDateString()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onTemplateSelect?.(template)}
            className="flex-1"
          >
            Use Template
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTemplatePreview(template)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Template Library</h2>
          <p className="text-gray-600">
            {templateStats.total} templates • {templateStats.favorites} favorites
          </p>
        </div>
        
        {showCreateButton && (
          <Button onClick={onTemplateCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{templateStats.total}</div>
          <div className="text-sm text-gray-500">Total Templates</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{templateStats.favorites}</div>
          <div className="text-sm text-gray-500">Favorites</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{templateStats.recentlyUsed}</div>
          <div className="text-sm text-gray-500">Recently Used</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
          <div className="text-sm text-gray-500">Categories</div>
        </Card>
      </div>

      {/* Filters and search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name} ({templateStats.byCategory.find(c => c.id === cat.id)?.count || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('asc')}
              >
                <SortAsc className="h-4 w-4" />
              </Button>
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('desc')}
              >
                <SortDesc className="h-4 w-4" />
              </Button>
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredTemplates.length} of {templates.length} templates
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No templates match "${searchQuery}"`
                : "You don't have any templates yet"}
            </p>
            {showCreateButton && (
              <Button onClick={onTemplateCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Template
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview: {previewTemplate?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed view of the template configuration and settings
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-gray-600">{getCategoryName(previewTemplate.categoryId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-gray-600">{previewTemplate.type || 'General'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600">{previewTemplate.description || 'No description'}</p>
              </div>
              
              {previewTemplate.templateData && (
                <div>
                  <label className="text-sm font-medium">Template Data</label>
                  <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-60">
                    {JSON.stringify(previewTemplate.templateData, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => {
                  onTemplateSelect?.(previewTemplate);
                  setShowPreview(false);
                }} className="flex-1">
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 