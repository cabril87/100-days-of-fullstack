'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { templateService } from '@/lib/services/templateService';
import { TaskTemplate, TaskCategory, CreateTemplateInput, SaveAsTemplateInput } from '@/lib/types/task';
import { useAuth } from '@/lib/providers/AuthContext';

interface TemplateContextType {
  templates: TaskTemplate[];
  categories: TaskCategory[];
  loading: boolean;
  error: string | null;
  
  // Template methods
  getTemplates: (categoryId?: number) => Promise<TaskTemplate[]>;
  getTemplate: (id: number) => Promise<TaskTemplate | null>;
  createTemplate: (template: CreateTemplateInput) => Promise<TaskTemplate | null>;
  updateTemplate: (id: number, template: Partial<TaskTemplate>) => Promise<TaskTemplate | null>;
  deleteTemplate: (id: number) => Promise<boolean>;
  saveTaskAsTemplate: (input: SaveAsTemplateInput) => Promise<TaskTemplate | null>;
  
  // Category methods
  getCategories: () => Promise<TaskCategory[]>;
  
  // Additional template methods
  getMarketplaceTemplates: () => Promise<void>;
  getFeaturedTemplates: () => Promise<TaskTemplate[]>;
  getAutomatedTemplates: () => Promise<void>;
  
  // Filtered data
  getTemplatesByCategory: (categoryId: number) => TaskTemplate[];
  getCategoryById: (categoryId?: number) => TaskCategory | null;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Load templates and categories on mount - load marketplace templates when not authenticated
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);
        
        if (isAuthenticated) {
          // Load categories first (only when authenticated)
          const categoriesResponse = await templateService.getCategories();
          if (categoriesResponse.data) {
            setCategories(categoriesResponse.data);
          } else if (categoriesResponse.error) {
            console.error('Failed to load categories:', categoriesResponse.error);
          }
          
          // Then try to load user templates
          const templatesResponse = await templateService.getTemplates();
          
          // If authentication failed, fall back to marketplace templates
          if (templatesResponse.status === 401 || (templatesResponse.error && templatesResponse.error.includes('Authentication'))) {
            console.log('[TemplateProvider] Authentication failed during initial load, falling back to marketplace templates');
            const marketplaceResponse = await templateService.getMarketplaceTemplates();
            if (marketplaceResponse.data) {
              setTemplates(marketplaceResponse.data);
            } else if (marketplaceResponse.error) {
              console.error('Failed to load marketplace templates:', marketplaceResponse.error);
              setError(marketplaceResponse.error);
            }
          } else if (templatesResponse.data) {
            setTemplates(templatesResponse.data);
          } else if (templatesResponse.error) {
            console.error('Failed to load templates:', templatesResponse.error);
          }
        } else {
          // Load marketplace templates when not authenticated
          const marketplaceResponse = await templateService.getMarketplaceTemplates();
          if (marketplaceResponse.data) {
            setTemplates(marketplaceResponse.data);
          } else if (marketplaceResponse.error) {
            console.error('Failed to load marketplace templates:', marketplaceResponse.error);
            setError(marketplaceResponse.error);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading templates';
        console.error('Error in loadInitialData:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, [isAuthenticated]);
  
  // Load templates
  const getTemplates = useCallback(async (categoryId?: number): Promise<TaskTemplate[]> => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (isAuthenticated) {
        // Try to load user templates when authenticated
        response = await templateService.getTemplates(categoryId);
        
        // If authentication failed (401), fall back to marketplace templates
        if (response.status === 401 || (response.error && response.error.includes('Authentication'))) {
          console.log('[TemplateProvider] Authentication failed, falling back to marketplace templates');
          response = await templateService.getMarketplaceTemplates();
        }
      } else {
        // Load marketplace templates when not authenticated
        response = await templateService.getMarketplaceTemplates();
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setTemplates(response.data);
        return response.data;
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      console.error('Error loading templates:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load categories
  const getCategories = useCallback(async (): Promise<TaskCategory[]> => {
    try {
      const response = await templateService.getCategories();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setCategories(response.data);
        return response.data;
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      console.error('Error loading categories:', err);
      // Don't set global error for categories, just log it
      return [];
    }
  }, []);

  // Get marketplace templates
  const getMarketplaceTemplates = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await templateService.getMarketplaceTemplates();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load marketplace templates';
      setError(errorMessage);
      console.error('Error loading marketplace templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get featured templates
  const getFeaturedTemplates = useCallback(async (): Promise<TaskTemplate[]> => {
    try {
      const response = await templateService.getFeaturedTemplates();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (err) {
      console.error('Error loading featured templates:', err);
      return [];
    }
  }, []);

  // Get automated templates
  const getAutomatedTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await templateService.getAutomatedTemplates();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load automated templates';
      setError(errorMessage);
      console.error('Error loading automated templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Template methods
  const getTemplate = async (id: number): Promise<TaskTemplate | null> => {
    try {
      setLoading(true);
      const response = await templateService.getTemplate(id);
      
      if (response.data) {
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting template';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const createTemplate = async (templateData: CreateTemplateInput): Promise<TaskTemplate | null> => {
    try {
      setLoading(true);
      const response = await templateService.createTemplate(templateData);
      
      if (response.data) {
        // Add to templates list
        setTemplates(prev => [...prev, response.data!]);
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating template';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTemplate = async (id: number, template: Partial<TaskTemplate>): Promise<TaskTemplate | null> => {
    try {
      setLoading(true);
      const response = await templateService.updateTemplate(id, template);
      
      if (response.data) {
        // Update template in state
        setTemplates(prev => prev.map(t => t.id === id ? response.data as TaskTemplate : t));
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating template';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTemplate = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await templateService.deleteTemplate(id);
      
      if (response.status === 204) {
        // Remove template from state
        setTemplates(prev => prev.filter(t => t.id !== id));
        return true;
      } else if (response.error) {
        setError(response.error);
        return false;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting template';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const saveTaskAsTemplate = async (input: SaveAsTemplateInput): Promise<TaskTemplate | null> => {
    try {
      setLoading(true);
      const response = await templateService.saveAsTemplate(input);
      
      if (response.data) {
        // Add to templates list
        setTemplates(prev => [...prev, response.data!]);
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error saving template';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Helper methods for filtering data
  const getTemplatesByCategory = (categoryId: number): TaskTemplate[] => {
    return templates.filter(t => t.categoryId === categoryId);
  };
  
  const getCategoryById = (categoryId?: number): TaskCategory | null => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId) || null;
  };

  const contextValue: TemplateContextType = {
    templates,
    categories,
    loading,
    error,
    
    // Template methods
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    saveTaskAsTemplate,
    
    // Category methods
    getCategories,
    
    // Additional template methods
    getMarketplaceTemplates,
    getFeaturedTemplates,
    getAutomatedTemplates,
    
    // Filtered data
    getTemplatesByCategory,
    getCategoryById
  };

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
}; 