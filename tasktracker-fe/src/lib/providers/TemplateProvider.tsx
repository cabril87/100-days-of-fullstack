'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  getCategory: (id: number) => Promise<TaskCategory | null>;
  createCategory: (category: Partial<TaskCategory>) => Promise<TaskCategory | null>;
  updateCategory: (id: number, category: Partial<TaskCategory>) => Promise<TaskCategory | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  
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

  // Load templates and categories on mount - only when authenticated
  useEffect(() => {
    async function loadInitialData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Load categories first
        const categoriesResponse = await templateService.getCategories();
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        } else if (categoriesResponse.error) {
          console.error('Failed to load categories:', categoriesResponse.error);
        }
        
        // Then load templates
        const templatesResponse = await templateService.getTemplates();
        if (templatesResponse.data) {
          setTemplates(templatesResponse.data);
        } else if (templatesResponse.error) {
          console.error('Failed to load templates:', templatesResponse.error);
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
  
  // Template methods
  const getTemplates = async (categoryId?: number): Promise<TaskTemplate[]> => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates(categoryId);
      
      if (response.data) {
        // Update state if no category filter, otherwise return without updating state
        if (!categoryId) {
          setTemplates(response.data);
        }
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return [];
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting templates';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const getTemplate = async (id: number): Promise<TaskTemplate | null> => {
    try {
      console.log('[templateService] Getting template with ID:', id);
      
      // First check if we already have it in state
      const cachedTemplate = templates.find(t => t.id === id);
      if (cachedTemplate) {
        console.log('[templateService] Found template in cache:', cachedTemplate.title);
        return cachedTemplate;
      }
      
      // Otherwise fetch from API
      console.log('[templateService] Template not in cache, fetching from API');
      const response = await templateService.getTemplate(id);
      
      if (response.data) {
        console.log('[templateService] Template fetched successfully:', response.data.title);
        return response.data;
      } else if (response.error) {
        console.error('[templateService] Error getting template:', response.error);
        setError(response.error);
        return null;
      }
      
      console.error('[templateService] No data or error returned for template');
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting template';
      console.error('[templateService] Exception getting template:', errorMessage);
      setError(errorMessage);
      return null;
    }
  };
  
  const createTemplate = async (template: CreateTemplateInput): Promise<TaskTemplate | null> => {
    try {
      setLoading(true);
      const response = await templateService.createTemplate(template);
      
      if (response.data) {
        // Add new template to state
        setTemplates(prev => [...prev, response.data as TaskTemplate]);
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
        // Add new template to state
        setTemplates(prev => [...prev, response.data as TaskTemplate]);
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error saving task as template';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Category methods
  const getCategories = async (): Promise<TaskCategory[]> => {
    try {
      setLoading(true);
      const response = await templateService.getCategories();
      
      if (response.data) {
        setCategories(response.data);
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return [];
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting categories';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const getCategory = async (id: number): Promise<TaskCategory | null> => {
    try {
      const response = await templateService.getCategory(id);
      
      if (response.data) {
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting category';
      setError(errorMessage);
      return null;
    }
  };
  
  const createCategory = async (category: Partial<TaskCategory>): Promise<TaskCategory | null> => {
    try {
      setLoading(true);
      const response = await templateService.createCategory(category);
      
      if (response.data) {
        // Add new category to state
        setCategories(prev => [...prev, response.data as TaskCategory]);
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating category';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateCategory = async (id: number, category: Partial<TaskCategory>): Promise<TaskCategory | null> => {
    try {
      setLoading(true);
      const response = await templateService.updateCategory(id, category);
      
      if (response.data) {
        // Update category in state
        setCategories(prev => prev.map(c => c.id === id ? response.data as TaskCategory : c));
        return response.data;
      } else if (response.error) {
        setError(response.error);
        return null;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating category';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteCategory = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await templateService.deleteCategory(id);
      
      if (response.status === 204) {
        // Remove category from state
        setCategories(prev => prev.filter(c => c.id !== id));
        return true;
      } else if (response.error) {
        setError(response.error);
        return false;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting category';
      setError(errorMessage);
      return false;
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
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    
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