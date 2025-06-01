'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Search,
  Star,
  Download,
  Eye,
  Heart,
  TrendingUp,
  Crown,
  Sparkles,
  Users,
  Clock,
  Filter,
  Globe,
  Award,
  Coins,
  ShoppingCart,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TaskTemplate } from '@/lib/types/task';
import { templateService } from '@/lib/services/templateService';
import { apiClient } from '@/lib/services/apiClient';
import { useToast } from '@/lib/hooks/useToast';
import { MarketplaceTemplate } from '@/lib/types/template';

// Extended interface for marketplace-specific properties
interface MarketplaceTemplateExtended extends MarketplaceTemplate {
  price?: number;
  isPremium?: boolean;
  valueProposition?: string;
  successStories?: string;
  prerequisites?: string;
  purchaseCount?: number;
}

export default function TemplateMarketplacePage() {
  const router = useRouter();
  const { userProgress } = useGamification();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'downloads' | 'price'>('popular');
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplateExtended[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<MarketplaceTemplateExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [purchasedTemplates, setPurchasedTemplates] = useState<Set<number>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplateExtended | null>(null);

  // Load marketplace data
  useEffect(() => {
    loadMarketplaceData();
    loadUserData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Load marketplace templates
      const templatesResponse = await templateService.getMarketplaceTemplates();
      const templates = (templatesResponse.data || []) as unknown as MarketplaceTemplateExtended[];
      setMarketplaceTemplates(templates);
      
      // Filter featured templates
      const featured = templates.filter((t: MarketplaceTemplateExtended) => t.featured);
      setFeaturedTemplates(featured);
      
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      showToast('Failed to load marketplace templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load user points
      const pointsResponse = await apiClient.get<number>('/v1/points/balance');
      if (pointsResponse.data !== undefined) {
        setUserPoints(pointsResponse.data);
      }

      // Load purchased templates
      const purchasesResponse = await apiClient.get<any[]>('/v1/points/purchases');
      if (purchasesResponse.data) {
        const purchasedIds = new Set(purchasesResponse.data.map(p => p.templateId));
        setPurchasedTemplates(purchasedIds);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't show error for authentication issues on marketplace page
    }
  };

  const handlePurchaseTemplate = async (template: MarketplaceTemplateExtended) => {
    if (!template.price || template.price === 0) {
      showToast('This template is free!', 'info');
      return;
    }

    if (userPoints < template.price) {
      showToast(`You need ${template.price - userPoints} more points to purchase this template`, 'error');
      return;
    }

    if (purchasedTemplates.has(template.id)) {
      showToast('You already own this template', 'info');
      return;
    }

    try {
      const purchaseResponse = await apiClient.post(`/v1/points/purchase/${template.id}`);
      if (purchaseResponse.error) {
        showToast(purchaseResponse.error, 'error');
      } else {
        showToast('Template purchased successfully!', 'success');
        setUserPoints(prev => prev - (template.price || 0));
        setPurchasedTemplates(prev => new Set(prev).add(template.id));
      }
    } catch (error) {
      console.error('Error purchasing template:', error);
      showToast('Failed to purchase template', 'error');
    }
  };

  const handlePreviewTemplate = (template: MarketplaceTemplateExtended) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  // Filter and sort templates
  const filteredTemplates = marketplaceTemplates
    .filter(template => {
      // Category filter
      if (selectedCategory !== 'all' && template.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      
      // Price filter
      if (selectedPriceRange !== 'all') {
        const price = template.price || 0;
        switch (selectedPriceRange) {
          case 'free':
            return price === 0;
          case 'basic':
            return price > 0 && price <= 30;
          case 'premium':
            return price > 30;
        }
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return template.name.toLowerCase().includes(query) ||
               template.description?.toLowerCase().includes(query);
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'downloads':
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default: // popular
          return (b.usageCount || 0) - (a.usageCount || 0);
      }
    });

  const getPriceDisplay = (template: MarketplaceTemplateExtended) => {
    if (!template.price || template.price === 0) {
      return 'Free';
    }
    return `${template.price} pts`;
  };

  const getTemplateStatusButton = (template: MarketplaceTemplateExtended) => {
    const price = template.price || 0;
    const owned = purchasedTemplates.has(template.id);
    const canAfford = userPoints >= price;

    if (owned) {
      return (
        <Button size="sm" variant="outline" disabled>
          Owned
        </Button>
      );
    }

    if (price === 0) {
      return (
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-1" />
          Free
        </Button>
      );
    }

    if (!canAfford) {
      return (
        <Button size="sm" variant="outline" disabled>
          Need {price - userPoints} more pts
        </Button>
      );
    }

    return (
      <Button 
        size="sm" 
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => handlePurchaseTemplate(template)}
      >
        <ShoppingCart className="h-4 w-4 mr-1" />
        {price} pts
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-8xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/templates">
              <Button variant="ghost" className="gap-2 -ml-4 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Template Marketplace
              </h1>
              <p className="text-gray-600 mt-1">Discover and purchase premium templates</p>
            </div>
          </div>

          {/* Points Balance */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-sm text-gray-500">Your Points</div>
                <div className="text-xl font-bold text-gray-900">{userPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search marketplace templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="productivity">Productivity</option>
              <option value="health">Health & Wellness</option>
              <option value="business">Work & Business</option>
              <option value="personal">Personal Development</option>
              <option value="household">Household</option>
              <option value="finance">Finance</option>
            </select>

            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Prices</option>
              <option value="free">Free (0 pts)</option>
              <option value="basic">Basic (1-30 pts)</option>
              <option value="premium">Premium (30+ pts)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloaded</option>
              <option value="price">Price (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Featured Templates */}
        {featuredTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Featured Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      <Crown className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="capitalize">{template.category || 'General'}</span>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {template.rating?.toFixed(1) || '4.5'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Download className="h-4 w-4" />
                      {template.downloadCount?.toLocaleString() || '0'}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {getTemplateStatusButton(template)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            All Templates ({filteredTemplates.length})
          </h2>
          
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.isPremium && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="capitalize">{template.category || 'General'}</span>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {template.rating?.toFixed(1) || '4.0'}
                    </div>
                  </div>

                  {template.valueProposition && (
                    <p className="text-xs text-blue-600 mb-3 bg-blue-50 p-2 rounded">
                      {template.valueProposition}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Download className="h-4 w-4" />
                      {template.downloadCount?.toLocaleString() || '0'}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {getTemplateStatusButton(template)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">{previewTemplate.name}</h2>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{previewTemplate.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                  <p className="text-gray-600 capitalize">{previewTemplate.category || 'General'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Rating</h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-600">{previewTemplate.rating?.toFixed(1) || '4.0'} ({previewTemplate.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Downloads</h4>
                  <p className="text-gray-600">{previewTemplate.downloadCount?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Success Rate</h4>
                  <p className="text-gray-600">{previewTemplate.successRate ? `${previewTemplate.successRate}%` : 'N/A'}</p>
                </div>
              </div>
              
              {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {previewTemplate.valueProposition && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Value Proposition</h4>
                  <p className="text-blue-600 bg-blue-50 p-3 rounded-lg text-sm">{previewTemplate.valueProposition}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={closePreview} className="flex-1">
                Close
              </Button>
              <div className="flex-1">
                {getTemplateStatusButton(previewTemplate)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 