'use client';

/**
 * Template Selector Component
 * Comprehensive template marketplace with search, filtering, and application
 */

import React, { useState, useEffect } from 'react';
import { useBoard } from '@/lib/providers/BoardProvider';
import { BoardTemplate, CreateBoardFromTemplateDTO } from '@/lib/types/board';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  LayoutTemplate, 
  Search, 
  Star, 
  Download, 
  Eye, 
  Crown,
  Plus,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

interface TemplateSelectorProps {
  onClose: () => void;
  onTemplateApplied: () => void;
}

export function TemplateSelector({ onClose, onTemplateApplied }: TemplateSelectorProps) {
  const { 
    state: { 
      publicTemplates, 
      isLoadingTemplates
    },
    fetchPublicTemplates,
    createBoardFromTemplate
  } = useBoard();
  
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [filteredTemplates, setFilteredTemplates] = useState<BoardTemplate[]>([]);
  const [showCreateBoard, setShowCreateBoard] = useState<number | null>(null);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');

  // Load templates on mount
  useEffect(() => {
    fetchPublicTemplates();
  }, []);

  // Filter and sort templates
  useEffect(() => {
    let templates = publicTemplates;
    
    // Apply search filter
    if (searchTerm) {
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => 
        template.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        templates = templates.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'rating':
        templates = templates.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        templates = templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
        templates = templates.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    setFilteredTemplates(templates);
  }, [publicTemplates, searchTerm, selectedCategory, sortBy]);

  // Get unique categories from templates
  const getCategories = (): string[] => {
    const categories = new Set(publicTemplates.map(t => t.category).filter(Boolean));
    return Array.from(categories) as string[];
  };

  // Handle template application
  const handleApplyTemplate = async (templateId: number) => {
    if (!boardName.trim()) {
      showToast('Please enter a board name', 'error');
      return;
    }

    try {
      const boardData: CreateBoardFromTemplateDTO = {
        boardName: boardName.trim(),
        boardDescription: boardDescription.trim() || undefined
      };
      
      await createBoardFromTemplate(templateId, boardData);
      showToast('Board created from template successfully', 'success');
      setShowCreateBoard(null);
      setBoardName('');
      setBoardDescription('');
      onTemplateApplied();
    } catch (error) {
      showToast('Failed to create board from template', 'error');
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoadingTemplates) {
    return (
      <Card className="w-96 h-fit">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading templates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5" />
          Template Marketplace
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Popular
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3" />
                    Rating
                  </div>
                </SelectItem>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Templates Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">
              {filteredTemplates.length} templates found
            </h3>
          </div>
          
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{template.name}</h4>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                        {template.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            <Crown className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>

                      {/* Category and Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.category && (
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        )}
                        {template.tags && template.tags.split(',').slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>

                      {/* Statistics */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{template.usageCount}</span>
                          </div>
                          {template.averageRating && (
                            <div className="flex items-center gap-1">
                              {renderStars(Math.round(template.averageRating))}
                              <span>({template.ratingCount})</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      {/* Author */}
                      {template.createdByUsername && (
                        <div className="flex items-center gap-2 text-xs">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">
                              {template.createdByUsername.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">by {template.createdByUsername}</span>
                        </div>
                      )}

                      {/* Columns Preview */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Columns ({template.defaultColumns.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {template.defaultColumns.slice(0, 4).map((column, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                              style={{ borderLeft: `3px solid ${column.color}` }}
                            >
                              <span>{column.name}</span>
                            </div>
                          ))}
                          {template.defaultColumns.length > 4 && (
                            <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs">
                              +{template.defaultColumns.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => setShowCreateBoard(template.id)}
                          className="flex-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 m-4">
            <CardHeader>
              <CardTitle className="text-lg">Create Board from Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Board Name</label>
                <Input
                  placeholder="Enter board name..."
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  placeholder="Enter board description..."
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleApplyTemplate(showCreateBoard!)}
                  className="flex-1"
                  disabled={!boardName.trim()}
                >
                  Create Board
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateBoard(null);
                    setBoardName('');
                    setBoardDescription('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}

export default TemplateSelector; 