'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BOARD_TEMPLATES, BoardTemplate } from '../../lib/types/board';
import { BoardService } from '../../lib/services/boardService';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import {
  Star,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Rocket,
  Plus,
  Users,
  Briefcase,
  Home,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  TrendingUp,
  CheckCircle,
  Calendar,
  DollarSign,
  Snowflake,
  GraduationCap,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';

// Enhanced template categories with gamification
const TEMPLATE_CATEGORIES = [
  {
    id: 'all',
    name: 'All Templates',
    icon: Star,
    color: 'from-gray-500 to-gray-600',
    description: 'Browse all available templates'
  },
  {
    id: 'basic',
    name: 'Basic & Work',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-500',
    description: 'Professional project management and workflows'
  },
  {
    id: 'family',
    name: 'Family & Home',
    icon: Home,
    color: 'from-green-500 to-emerald-500',
    description: 'Perfect for household management and family tasks'
  },
  {
    id: 'education',
    name: 'Education & Learning',
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-500',
    description: 'Study plans and educational goals'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: Activity,
    color: 'from-red-500 to-pink-500',
    description: 'Health tracking and fitness goals'
  },
  {
    id: 'events',
    name: 'Events & Celebrations',
    icon: Calendar,
    color: 'from-yellow-500 to-orange-500',
    description: 'Party planning and special occasions'
  },
  {
    id: 'financial',
    name: 'Financial & Budget',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-500',
    description: 'Budget tracking and financial planning'
  },
  {
    id: 'seasonal',
    name: 'Seasonal & Holidays',
    icon: Snowflake,
    color: 'from-cyan-500 to-blue-500',
    description: 'Holiday planning and seasonal activities'
  }
];

// Enhanced templates with gamification elements
interface EnhancedTemplate extends BoardTemplate {
  features: string[];
  xpReward: number;
  popularity: number;
}

const enhanceTemplate = (template: BoardTemplate, index: number): EnhancedTemplate => {
  const baseXP = 100;
  const difficultyMultiplier = template.difficulty === 'beginner' ? 1 : template.difficulty === 'intermediate' ? 1.5 : 2;
  const columnMultiplier = template.columns.length * 10;
  
  return {
    ...template,
    features: generateFeatures(template),
    xpReward: Math.round(baseXP * difficultyMultiplier + columnMultiplier),
    popularity: Math.max(70, 100 - (index * 2) + Math.random() * 20)
  };
};

const generateFeatures = (template: BoardTemplate): string[] => {
  const features = [];
  
  if (template.columns.length <= 3) features.push('Simple workflow');
  if (template.columns.length >= 5) features.push('Detailed process');
  if (template.category === 'family') features.push('Family-friendly');
  if (template.category === 'basic') features.push('Professional');
  if (template.difficulty === 'beginner') features.push('Easy setup');
  if (template.difficulty === 'advanced') features.push('Advanced features');
  if (template.estimatedSetupTime <= 3) features.push('Quick start');
  if (template.estimatedSetupTime >= 8) features.push('Comprehensive');
  
  return features.slice(0, 3);
};

const ENHANCED_TEMPLATES: EnhancedTemplate[] = BOARD_TEMPLATES.map(enhanceTemplate);

export const Templates: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'difficulty' | 'name'>('popularity');

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = ENHANCED_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        t.recommendedFor.some(rec => rec.toLowerCase().includes(query))
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCreateFromTemplate = async (template: BoardTemplate, templateIndex: number) => {
    try {
      setLoading(true);
      setSelectedTemplate(templateIndex);

      const createBoardDto = {
        Name: template.name,
        Description: template.description,
        Columns: template.columns,
      };

      const newBoard = await BoardService.createBoard(createBoardDto);
      
      const enhancedTemplate = ENHANCED_TEMPLATES.find(t => t.name === template.name);
      toast.success('🎯 Template board created successfully!', {
        description: `"${template.name}" created! +${enhancedTemplate?.xpReward || 100} XP earned!`,
      });
      
      // Navigate to the new board
      router.push(`/boards/${newBoard.id}`);
    } catch (error) {
      console.error('Error creating board from template:', error);
      toast.error('Failed to create board from template');
    } finally {
      setLoading(false);
      setSelectedTemplate(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPopularityStars = (popularity: number) => {
    const stars = Math.floor(popularity / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={cn(
          "h-3 w-3",
          i < stars ? "text-yellow-400 fill-current" : "text-gray-300"
        )} 
      />
    ));
  };

  const getCategoryStats = () => {
    const stats = TEMPLATE_CATEGORIES.map(category => ({
      ...category,
      count: category.id === 'all' 
        ? ENHANCED_TEMPLATES.length 
        : ENHANCED_TEMPLATES.filter(t => t.category === category.id).length
    }));
    return stats;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/boards')}
                className="border-orange-200 hover:bg-orange-50 text-orange-700 hover:text-orange-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Boards</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl text-white">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Template Gallery
                  </span>
                </h1>
                <p className="text-slate-600 mt-2">
                  Choose from {ENHANCED_TEMPLATES.length} professionally designed board templates to jumpstart your productivity
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200">
                <Sparkles className="h-3 w-3 mr-1" />
                {filteredAndSortedTemplates.length} templates
              </Badge>
              <Button
                onClick={() => router.push('/boards')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Custom Board</span>
                <span className="sm:hidden">Custom</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/80 border-gray-200 focus:border-orange-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-orange-500" />
                  <span>Categories</span>
                </h3>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {getCategoryStats().map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left",
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 text-orange-800"
                            : "hover:bg-gray-50 border-2 border-transparent text-gray-600 hover:text-gray-800"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg text-white bg-gradient-to-br",
                            category.color
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sort Options */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span>Sort By</span>
                </h3>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {[
                    { value: 'popularity', label: 'Popularity', icon: Star },
                    { value: 'difficulty', label: 'Difficulty', icon: Target },
                    { value: 'name', label: 'Name', icon: CheckCircle }
                  ].map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as 'popularity' | 'difficulty' | 'name')}
                        className={cn(
                          "w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 text-left",
                          sortBy === option.value
                            ? "bg-orange-100 text-orange-800"
                            : "hover:bg-gray-50 text-gray-600"
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            {filteredAndSortedTemplates.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">No templates found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or selecting a different category.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory('all')}
                    >
                      Show All Categories
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedTemplates.map((template) => {
                  const actualIndex = ENHANCED_TEMPLATES.indexOf(template);
                  const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
                  const CategoryIcon = category?.icon || Target;
                  
                  return (
                    <Card
                      key={actualIndex}
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden h-fit"
                    >
                      <CardHeader className="pb-3">
                        {/* Header with category and difficulty */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "p-2 rounded-lg text-white bg-gradient-to-br",
                              category?.color || "from-gray-500 to-gray-600"
                            )}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs border", getDifficultyColor(template.difficulty))}
                            >
                              {template.difficulty}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {getPopularityStars(template.popularity)}
                          </div>
                        </div>

                        {/* Template name and description */}
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors mb-2">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {template.description}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Features */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature, featureIndex) => (
                              <Badge 
                                key={featureIndex} 
                                variant="secondary" 
                                className="text-xs bg-gray-100 text-gray-600 border-gray-200"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Columns preview */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Workflow ({template.columns.length} columns):</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.columns.slice(0, 4).map((column, colIndex) => (
                              <Badge
                                key={colIndex}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: column.Color,
                                  color: column.Color,
                                }}
                              >
                                {column.Name}
                              </Badge>
                            ))}
                            {template.columns.length > 4 && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                +{template.columns.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Setup time and recommended for */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{template.estimatedSetupTime} min setup</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{template.recommendedFor[0]}</span>
                          </div>
                        </div>

                        {/* XP Reward and Action */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-gray-700">
                              +{template.xpReward} XP
                            </span>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleCreateFromTemplate(template, actualIndex)}
                            disabled={loading}
                            className={cn(
                              "bg-gradient-to-r text-white border-0 shadow-md hover:shadow-lg transition-all duration-200",
                              category?.color || "from-orange-500 to-yellow-500"
                            )}
                          >
                            {loading && selectedTemplate === actualIndex ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Rocket className="h-3 w-3 mr-1" />
                                Use Template
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 