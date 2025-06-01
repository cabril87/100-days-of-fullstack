'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { TaskTemplate, TaskCategory } from '@/lib/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BookOpen, 
  Folder, 
  Tag, 
  Package, 
  Info, 
  Clock, 
  ArrowLeft,
  Plus,
  Star,
  TrendingUp,
  Zap,
  Settings,
  BarChart3,
  Globe,
  Users,
  Trophy,
  Sparkles,
  PlayCircle,
  Download,
  Heart,
  Share2,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Wand2,
  Target,
  Award,
  Flame,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw,
  Rocket,
  Crown,
  ChevronRight,
  Lightbulb,
  Coins,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for template with enhanced features
interface EnhancedTemplate extends TaskTemplate {
  analytics?: {
    usageCount: number;
    successRate: number;
    rating: number;
    downloadCount: number;
  };
  automationEnabled?: boolean;
  popularity?: 'trending' | 'popular' | 'new' | 'featured';
  gamificationReward?: number;
}

// View modes
type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'popularity' | 'rating' | 'recent' | 'usage';
type FilterTab = 'all' | 'my-templates' | 'marketplace' | 'automation' | 'analytics';

export default function TemplatesPage() {
  const { templates, categories, loading, getTemplates } = useTemplates();
  const { userProgress } = useGamification();
  const router = useRouter();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [purchasedTemplates, setPurchasedTemplates] = useState<Set<number>>(new Set());

  // Mock analytics data (you would fetch this from your analytics service)
  const [templateAnalytics, setTemplateAnalytics] = useState<Record<number, any>>({});

  // Load purchased templates
  const loadPurchasedTemplates = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5211/api'}/v1/points/purchases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const purchases = await response.json();
        const purchasedIds = new Set(purchases.map((p: any) => p.templateId));
        setPurchasedTemplates(purchasedIds);
      }
    } catch (error) {
      console.error('Error loading purchased templates:', error);
    }
  }, []);

  // Load user points
  const loadUserPoints = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5211/api'}/v1/points/balance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const balance = await response.json();
        setUserPoints(balance);
      }
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  }, []);

  // Load analytics from API when available
  const loadTemplateAnalytics = useCallback(async () => {
    // For now, we'll use a simplified approach since analytics endpoints may not be fully implemented
    // In a real implementation, you would call the analytics API for each template
    try {
      const analyticsData: Record<number, any> = {};
      
      // For now, we'll leave analytics empty until the backend analytics are fully implemented
      // This prevents the infinite loop issue from before
      
      setTemplateAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading template analytics:', error);
    }
  }, []);

  // Load templates when the page loads
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setError(null);
      try {
        await getTemplates();
        await loadTemplateAnalytics();
        await loadPurchasedTemplates();
        await loadUserPoints();
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
  }, [getTemplates, templates.length, loading, loadPurchasedTemplates, loadUserPoints]);

  // Load analytics when templates change
  useEffect(() => {
    if (templates.length > 0) {
      loadTemplateAnalytics();
    }
  }, [templates.length, loadTemplateAnalytics]);

  // Enhanced templates with basic data - no mock analytics to prevent infinite loops
  const enhancedTemplates: EnhancedTemplate[] = useMemo(() => {
    return templates.map(template => ({
      ...template,
      analytics: templateAnalytics[template.id] || {
        usageCount: 0,
        successRate: 85,
        rating: 4.2,
        downloadCount: 0
      },
      automationEnabled: false, // Will be determined by real automation rules
      popularity: undefined,
      gamificationReward: 25 // Default reward
    }));
  }, [templates, templateAnalytics]);

  // Filter templates based on search query, category, and tab - memoized
  const filteredTemplates = useMemo(() => {
    let filtered = [...enhancedTemplates];
    
    // Filter by tab
    switch (activeTab) {
      case 'my-templates':
        // Show user's created templates and purchased templates
        filtered = filtered.filter(t => 
          purchasedTemplates.has(t.id) || 
          t.createdBy === 'current_user' // Replace with actual user ID logic
        );
        break;
      case 'marketplace':
        // Show default templates and templates with high usage/rating
        filtered = filtered.filter(t => 
          t.isDefault || 
          (t.analytics && (t.analytics.usageCount > 50 || t.analytics.rating > 4.0))
        );
        break;
      case 'automation':
        filtered = filtered.filter(t => t.automationEnabled);
        break;
      case 'analytics':
        filtered = filtered.filter(t => t.analytics && t.analytics.usageCount > 20);
        break;
    }
    
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
    
    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return (b.analytics?.usageCount || 0) - (a.analytics?.usageCount || 0);
        case 'rating':
          return (b.analytics?.rating || 0) - (a.analytics?.rating || 0);
        case 'recent':
          return b.id - a.id;
        case 'usage':
          return (b.analytics?.usageCount || 0) - (a.analytics?.usageCount || 0);
        default:
          // Default sorting - prioritize featured, then popular, then by name
          if (a.popularity === 'featured' && b.popularity !== 'featured') return -1;
          if (b.popularity === 'featured' && a.popularity !== 'featured') return 1;
          if (a.popularity === 'trending' && b.popularity !== 'trending') return -1;
          if (b.popularity === 'trending' && a.popularity !== 'trending') return 1;
          return a.title.localeCompare(b.title);
      }
    });
    
    return filtered;
  }, [enhancedTemplates, searchQuery, selectedCategory, activeTab, sortBy, purchasedTemplates]);

  // Get category name by ID
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  // Get category color by ID with enhanced colors
  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return '#6b7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  // Count templates by category
  const getTemplateCountByCategory = (categoryId?: number | null): number => {
    if (categoryId === null || categoryId === undefined) return filteredTemplates.length;
    return filteredTemplates.filter(t => t.categoryId === categoryId).length;
  };

  // Get popularity badge info
  const getPopularityBadge = (popularity?: string) => {
    switch (popularity) {
      case 'trending':
        return { icon: TrendingUp, text: 'Trending', color: 'bg-red-100 text-red-700' };
      case 'popular':
        return { icon: Star, text: 'Popular', color: 'bg-yellow-100 text-yellow-700' };
      case 'new':
        return { icon: Sparkles, text: 'New', color: 'bg-green-100 text-green-700' };
      case 'featured':
        return { icon: Crown, text: 'Featured', color: 'bg-purple-100 text-purple-700' };
      default:
        return null;
    }
  };

  // Handle template use
  const handleUseTemplate = useCallback((template: EnhancedTemplate) => {
    // Award gamification points for using templates
    router.push(`/tasks/new?templateId=${template.id}`);
  }, [router]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getTemplates();
      await loadTemplateAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced Template Card Component with gamification styling
  const TemplateCard = ({ template }: { template: EnhancedTemplate }) => {
    const popularityBadge = getPopularityBadge(template.popularity);
    const categoryColor = getCategoryColor(template.categoryId);
    
    // Calculate template level based on usage and success rate
    const templateLevel = template.analytics 
      ? Math.floor((template.analytics.usageCount * template.analytics.successRate) / 1000) + 1
      : 1;
    
    // Determine rarity based on popularity and performance
    const getRarity = () => {
      if (template.popularity === 'featured') return { name: 'Legendary', color: 'from-purple-400 to-purple-600', glow: 'shadow-purple-300' };
      if (template.analytics && template.analytics.successRate > 90) return { name: 'Epic', color: 'from-blue-400 to-blue-600', glow: 'shadow-blue-300' };
      if (template.analytics && template.analytics.usageCount > 70) return { name: 'Rare', color: 'from-green-400 to-green-600', glow: 'shadow-green-300' };
      return { name: 'Common', color: 'from-gray-400 to-gray-600', glow: 'shadow-gray-300' };
    };
    
    const rarity = getRarity();
    
    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -8 }}
        whileTap={{ scale: 0.97 }}
        className={`group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 ${rarity.glow} hover:shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${categoryColor}08 0%, ${categoryColor}04 50%, transparent 100%)`
        }}
      >
        {/* Animated gradient border for high-tier templates */}
        {(template.popularity === 'featured' || (template.analytics && template.analytics.successRate > 85)) && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 opacity-75 blur-sm animate-pulse" />
        )}
        
        {/* Main card content */}
        <div className="relative bg-white rounded-xl">
          {/* Gradient accent bar with sparkle effect */}
          <div 
            className="absolute top-0 left-0 w-full h-2 rounded-t-xl overflow-hidden"
            style={{ 
              background: `linear-gradient(to right, ${categoryColor}, ${categoryColor}aa)`
            }}
          >
            {template.popularity === 'featured' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            )}
          </div>
          
          {/* Level indicator */}
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarity.color} shadow-lg`}>
              LV.{templateLevel}
            </div>
          </div>
          
          {/* Popular badge with enhanced styling */}
          {popularityBadge && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className={`${popularityBadge.color} flex items-center gap-1 text-xs font-semibold shadow-lg animate-bounce`}>
                <popularityBadge.icon className="h-3 w-3" />
                {popularityBadge.text}
              </Badge>
            </div>
          )}

          <div className="p-6 pt-8">
            {/* Header with rarity indicator */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </h3>
                  <Badge variant="outline" className={`text-xs bg-gradient-to-r ${rarity.color} text-white border-none`}>
                    {rarity.name}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {template.description || 'No description available'}
                </p>
              </div>
            </div>

            {/* Enhanced features row with XP indicators */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {template.isDefault && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
              {purchasedTemplates.has(template.id) && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 shadow-sm">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Owned
                </Badge>
              )}
              {template.automationEnabled && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 shadow-sm animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  Auto-Enabled
                </Badge>
              )}
              {template.gamificationReward && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
                  <Star className="h-3 w-3 mr-1 animate-spin" style={{ animationDuration: '3s' }} />
                  +{template.gamificationReward} XP
                </Badge>
              )}
              {template.analytics && template.analytics.successRate > 85 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 shadow-sm">
                  <Award className="h-3 w-3 mr-1" />
                  High Performer
                </Badge>
              )}
            </div>

            {/* Category and enhanced stats */}
            <div className="flex justify-between items-center mb-4">
              <Badge 
                variant="outline" 
                className="text-xs shadow-sm"
                style={{ 
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  borderColor: `${categoryColor}30`
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {getCategoryName(template.categoryId)}
              </Badge>
              
              {template.analytics && (
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                    <Eye className="h-3 w-3" />
                    {template.analytics.usageCount}
                  </span>
                  <span className="flex items-center gap-1 bg-yellow-100 rounded-full px-2 py-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {template.analytics.rating}
                  </span>
                  {template.estimatedDuration && (
                    <span className="flex items-center gap-1 bg-blue-100 rounded-full px-2 py-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {template.estimatedDuration}m
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced analytics bar with XP visualization */}
            {template.analytics && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-600" />
                    Success Rate
                  </span>
                  <span className="font-bold">{template.analytics.successRate}%</span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${template.analytics.successRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full relative overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
                  </motion.div>
                  {/* XP milestone markers */}
                  <div className="absolute top-0 left-1/4 w-0.5 h-3 bg-white opacity-50" />
                  <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-white opacity-50" />
                  <div className="absolute top-0 left-3/4 w-0.5 h-3 bg-white opacity-50" />
                </div>
              </div>
            )}

            {/* Enhanced action buttons with gamification */}
            <div className="flex gap-2">
              <Button 
                onClick={() => handleUseTemplate(template)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Quest
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/templates/${template.id}/preview`)}
                className="border-gray-300 hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 hover:border-red-300 hover:bg-red-50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Heart className="h-4 w-4 hover:text-red-500 transition-colors" />
              </Button>
            </div>

            {/* Enhanced automation indicator with achievement style */}
            {template.automationEnabled && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
                    <Wand2 className="h-4 w-4 animate-pulse" />
                    <Sparkles className="h-3 w-3" />
                    Smart Automation Unlocked
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 h-6 px-2 bg-white/50 hover:bg-white/70 rounded-full"
                    onClick={() => router.push(`/templates/${template.id}/automation`)}
                  >
                    Configure
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Achievement progress indicator for high-performing templates */}
            {template.analytics && template.analytics.usageCount > 50 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-yellow-700">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Community Favorite</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // List view template card
  const TemplateListItem = ({ template }: { template: EnhancedTemplate }) => {
    const popularityBadge = getPopularityBadge(template.popularity);
    const categoryColor = getCategoryColor(template.categoryId);
    
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="group flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
      >
        <div 
          className="w-4 h-16 rounded-lg flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{template.title}</h3>
            {popularityBadge && (
              <Badge className={`${popularityBadge.color} text-xs`}>
                <popularityBadge.icon className="h-3 w-3 mr-1" />
                {popularityBadge.text}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-1 mb-2">
            {template.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{getCategoryName(template.categoryId)}</span>
            {template.analytics && (
              <>
                <span>{template.analytics.usageCount} uses</span>
                <span>★ {template.analytics.rating}</span>
                <span>{template.analytics.successRate}% success</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {template.automationEnabled && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
              <Zap className="h-3 w-3 mr-1" />
              Auto
            </Badge>
          )}
          <Button 
            onClick={() => handleUseTemplate(template)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Use
          </Button>
        </div>
      </motion.div>
    );
  };

  // Quick action cards for the header
  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }: {
    icon: any;
    title: string;
    description: string;
    onClick: () => void;
    color: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${color} hover:shadow-lg group`}
    >
      <Icon className="h-6 w-6 text-white mb-2" />
      <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
      <p className="text-white/80 text-xs">{description}</p>
    </motion.div>
  );

  // Stats overview cards
  const StatsCard = ({ icon: Icon, label, value, color }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className={`p-4 rounded-xl ${color} text-white`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-white/80 text-sm">{label}</p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 text-center p-8"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
        <BookOpen className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
      <p className="text-gray-500 max-w-md mb-4">
        {searchQuery 
          ? `No templates match "${searchQuery}"`
          : selectedCategory !== null 
            ? "No templates in this category" 
            : "You don't have any templates yet"}
      </p>
      <Button 
        onClick={() => router.push('/templates/new')}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Template
      </Button>
    </motion.div>
  );

  // Error state component
  const ErrorState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
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
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-8xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2 -ml-4 hover:bg-white/50">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Template Library
                </h1>
                <p className="text-gray-600 mt-1">Discover, create, and automate your workflow templates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Points Balance */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Points</div>
                    <div className="text-lg font-bold text-gray-900">{userPoints.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="p-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                onClick={() => router.push('/templates/new')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <QuickActionCard
              icon={Wand2}
              title="Template Builder"
              description="Create smart templates"
              onClick={() => router.push('/templates/builder')}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickActionCard
              icon={Globe}
              title="Marketplace"
              description="Browse public templates"
              onClick={() => setActiveTab('marketplace')}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickActionCard
              icon={BarChart3}
              title="Analytics"
              description="Template performance"
              onClick={() => setActiveTab('analytics')}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickActionCard
              icon={Zap}
              title="Automation"
              description="Smart workflows"
              onClick={() => setActiveTab('automation')}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={BookOpen}
              label="Total Templates"
              value={templates.length}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              icon={Star}
              label="Average Rating"
              value="4.2"
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            />
            <StatsCard
              icon={TrendingUp}
              label="Success Rate"
              value="87%"
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatsCard
              icon={Trophy}
              label="Points Earned"
              value={userProgress?.totalPoints || 0}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
              {[
                { key: 'all', label: 'All Templates', icon: BookOpen },
                { key: 'my-templates', label: `My Templates (${purchasedTemplates.size})`, icon: Users },
                { key: 'marketplace', label: 'Marketplace', icon: Globe },
                { key: 'automation', label: 'Automation', icon: Zap },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as FilterTab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 w-64 bg-white shadow-sm"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'grid' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'list' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Most Recent</option>
                <option value="usage">Most Used</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left sidebar with categories */}
          <div className="w-64 space-y-2">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Categories
              </h3>
              
              <button
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-between transition-all duration-200",
                  selectedCategory === null 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "hover:bg-gray-100 text-gray-700 border border-transparent"
                )}
                onClick={() => setSelectedCategory(null)}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>All Categories</span>
                </div>
                <Badge variant="outline" className="bg-white text-xs">
                  {getTemplateCountByCategory(null)}
                </Badge>
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-between transition-all duration-200",
                    selectedCategory === category.id 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "hover:bg-gray-100 text-gray-700 border border-transparent"
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: category.color }} 
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="outline" className="bg-white text-xs">
                    {getTemplateCountByCategory(category.id)}
                  </Badge>
                </button>
              ))}
            </div>

            {/* Gamification widget */}
            {userProgress && (
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-5 w-5" />
                  <h3 className="font-semibold">Your Progress</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level</span>
                    <span className="font-bold">{userProgress.currentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points</span>
                    <span className="font-bold">{userProgress.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak</span>
                    <span className="font-bold flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {userProgress.currentStreak}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => router.push('/gamification')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Dashboard
                </Button>
              </div>
            )}

            {/* Tips widget */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-700">Pro Tips</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use automation to save time on recurring tasks</p>
                <p>• Templates with higher success rates earn more points</p>
                <p>• Share your best templates to help others</p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {activeTab === 'all' && 'All Templates'}
                  {activeTab === 'my-templates' && 'My Templates'}
                  {activeTab === 'marketplace' && 'Template Marketplace'}
                  {activeTab === 'automation' && 'Automated Templates'}
                  {activeTab === 'analytics' && 'High-Performance Templates'}
                  {selectedCategory !== null && ` • ${getCategoryName(selectedCategory)}`}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
                </p>
              </div>
            </div>
            
            {isLoadingTemplates || loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <Spinner size="lg" />
                  <span className="text-sm text-gray-500">Loading templates...</span>
                </div>
              </div>
            ) : error ? (
              <ErrorState />
            ) : filteredTemplates.length === 0 ? (
              <EmptyState />
            ) : (
              <motion.div
                layout
                className={cn(
                  "pb-8",
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-3"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map(template => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      {viewMode === 'grid' ? (
                        <TemplateCard template={template} />
                      ) : (
                        <TemplateListItem template={template} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 