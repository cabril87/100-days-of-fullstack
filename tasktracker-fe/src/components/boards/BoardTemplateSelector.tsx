'use client';

/**
 * Board Template Selector Component
 * Allows users to save, load, and manage board templates
 */

import React, { useState, useCallback, useEffect } from 'react';

// Types
import { BoardTemplate, CreateBoardTemplate, Board } from '@/lib/types/board';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  LayoutTemplate,
  Plus,
  Star,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Eye,
  Globe,
  Lock,
  Clock,
  Users,
  Heart,
  BookOpen,
  Sparkles
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BoardTemplateSelectorProps {
  currentBoard?: Board;
  onCreateFromTemplate: (template: BoardTemplate) => Promise<void>;
  onSaveAsTemplate: (templateData: CreateBoardTemplate) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  tags: string;
  isPublic: boolean;
}

export function BoardTemplateSelector({
  currentBoard,
  onCreateFromTemplate,
  onSaveAsTemplate,
  isOpen,
  onClose,
  className = ''
}: BoardTemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<BoardTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Form state for saving templates
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'custom',
    tags: '',
    isPublic: false
  });

  // Mock template data (replace with API calls)
  const mockTemplates: BoardTemplate[] = [
    {
      id: 1,
      name: 'Software Development',
      description: 'Perfect for agile development teams with standard workflow',
      createdByUsername: 'system',
      isPublic: true,
      isDefault: true,
      category: 'Software',
      tags: 'agile,development,scrum',
      layoutConfiguration: JSON.stringify({}),
      usageCount: 1250,
      averageRating: 4.8,
      ratingCount: 127,
      defaultColumns: [],
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Marketing Campaign',
      description: 'Manage marketing campaigns from ideation to execution',
      createdByUsername: 'marketing_pro',
      isPublic: true,
      isDefault: false,
      category: 'Marketing',
      tags: 'marketing,campaign,social-media',
      layoutConfiguration: JSON.stringify({}),
      usageCount: 856,
      averageRating: 4.6,
      ratingCount: 89,
      defaultColumns: [],
      createdAt: '2024-02-15T00:00:00Z'
    },
    {
      id: 3,
      name: 'Personal Tasks',
      description: 'Simple personal task management with basic workflow',
      createdByUsername: 'productivity_guru',
      isPublic: true,
      isDefault: false,
      category: 'Personal',
      tags: 'personal,productivity,simple',
      layoutConfiguration: JSON.stringify({}),
      usageCount: 2341,
      averageRating: 4.9,
      ratingCount: 234,
      defaultColumns: [],
      createdAt: '2024-03-10T00:00:00Z'
    },
    {
      id: 4,
      name: 'Event Planning',
      description: 'Comprehensive event planning with multiple phases',
      createdByUsername: 'event_master',
      isPublic: true,
      isDefault: false,
      category: 'Events',
      tags: 'events,planning,coordination',
      layoutConfiguration: JSON.stringify({}),
      usageCount: 432,
      averageRating: 4.7,
      ratingCount: 56,
      defaultColumns: [],
      createdAt: '2024-03-20T00:00:00Z'
    }
  ];

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories', count: mockTemplates.length },
    { value: 'Software', label: 'Software Development', count: 1 },
    { value: 'Marketing', label: 'Marketing', count: 1 },
    { value: 'Personal', label: 'Personal', count: 1 },
    { value: 'Events', label: 'Event Planning', count: 1 },
    { value: 'custom', label: 'Custom Templates', count: 0 }
  ];

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setTemplates(mockTemplates);
        setFilteredTemplates(mockTemplates);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  // Filter templates based on search and category
  useEffect(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.toLowerCase().includes(query) ||
        template.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);

  // Handle template selection
  const handleSelectTemplate = useCallback(async (template: BoardTemplate) => {
    setIsLoading(true);
    try {
      await onCreateFromTemplate(template);
      onClose();
    } catch (error) {
      console.error('Failed to create board from template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onCreateFromTemplate, onClose]);

  // Handle saving current board as template
  const handleSaveAsTemplate = useCallback(async () => {
    if (!formData.name.trim()) return;
    
    setIsLoading(true);
    try {
      const templateData: CreateBoardTemplate = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPublic: formData.isPublic,
        category: formData.category,
        tags: formData.tags,
      };
      
      await onSaveAsTemplate(templateData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        tags: '',
        isPublic: false
      });
      setShowSaveForm(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSaveAsTemplate]);

  // Get star rating display
  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating) 
            ? "text-yellow-500 fill-current" 
            : "text-gray-300"
        )}
      />
    ));
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Software': 'bg-blue-100 text-blue-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Personal': 'bg-green-100 text-green-800',
      'Events': 'bg-purple-100 text-purple-800',
      'custom': 'bg-gray-100 text-gray-800',
    };
    return colors[category || 'custom'] || colors.custom;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Board Templates
          </DialogTitle>
          <DialogDescription>
            Browse templates, save your board as a template, or load from the marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Templates
              </TabsTrigger>
              <TabsTrigger value="save" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Save As Template
              </TabsTrigger>
              <TabsTrigger value="my-templates" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                My Templates
              </TabsTrigger>
            </TabsList>

            {/* Browse Templates */}
            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{category.label}</span>
                          <Badge variant="outline" className="ml-2">
                            {category.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Templates Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getCategoryColor(template.category)}>
                                {template.category}
                              </Badge>
                              {template.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Official
                                </Badge>
                              )}
                              {template.isPublic ? (
                                <Globe className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSelectTemplate(template)}>
                                <Download className="h-4 w-4 mr-2" />
                                Use Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              {!template.isDefault && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Heart className="h-4 w-4 mr-2" />
                                    Add to Favorites
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                        
                        {/* Rating and Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {getStarRating(template.averageRating || 0)}
                            <span className="ml-1">
                              {template.averageRating?.toFixed(1)} ({template.ratingCount})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{template.usageCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {template.tags && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Use Template Button */}
                        <Button 
                          onClick={() => handleSelectTemplate(template)}
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredTemplates.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or browse different categories
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Save As Template */}
            <TabsContent value="save" className="space-y-6">
              {currentBoard ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Save Current Board as Template</CardTitle>
                    <CardDescription>
                      Create a reusable template from your current board configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        placeholder="Enter template name..."
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="template-description">Description</Label>
                      <Textarea
                        id="template-description"
                        placeholder="Describe when and how to use this template..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="Software">Software Development</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                            <SelectItem value="Events">Event Planning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                        <Input
                          id="template-tags"
                          placeholder="e.g., agile, development, team"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          {formData.isPublic ? 'Public - visible to all users' : 'Private - only visible to you'}
                        </p>
                      </div>
                      <Select
                        value={formData.isPublic ? 'public' : 'private'}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value === 'public' }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Private
                            </div>
                          </SelectItem>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Public
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={handleSaveAsTemplate}
                      disabled={!formData.name.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving Template...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Save as Template
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12">
                  <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Board Selected</h3>
                  <p className="text-muted-foreground">
                    Select a board to save it as a template
                  </p>
                </div>
              )}
            </TabsContent>

            {/* My Templates */}
            <TabsContent value="my-templates" className="space-y-6">
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your custom templates and favorites
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 