"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define category types
export type Category = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateCategoryDto = {
  name: string;
  description?: string | null;
  color?: string | null;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// Define category state
type CategoryState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
};

// Define category context type
type CategoryContextType = CategoryState & {
  fetchCategories: () => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
  createCategory: (category: CreateCategoryDto) => Promise<Category | null>;
  updateCategory: (id: number, category: UpdateCategoryDto) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  clearError: () => void;
};

// Create the category context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Category provider props
type CategoryProviderProps = {
  children: ReactNode;
};

// Category provider component
export function CategoryProvider({ children }: CategoryProviderProps) {
  const { isAuthenticated } = useAuth();
  
  const [state, setState] = useState<CategoryState>({
    categories: [],
    isLoading: false,
    error: null,
  });

  // Fetch categories when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  // Fetch all categories
  const fetchCategories = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.categories.getAll();
      
      if (response.succeeded && response.data) {
        setState({
          categories: response.data as Category[],
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to fetch categories',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to fetch categories',
      }));
    }
  };

  // Get category by ID
  const getCategoryById = (id: number) => {
    return state.categories.find(category => category.id === id);
  };

  // Create a new category
  const createCategory = async (category: CreateCategoryDto): Promise<Category | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.categories.create(category);
      
      if (response.succeeded && response.data) {
        setState((prev) => ({
          ...prev,
          categories: [...prev.categories, response.data as Category],
          isLoading: false,
        }));
        toast.success("Category created successfully");
        return response.data as Category;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to create category',
        }));
        toast.error("Failed to create category");
        return null;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to create category',
      }));
      toast.error((error as ApiError).message || "Failed to create category");
      return null;
    }
  };

  // Update a category
  const updateCategory = async (id: number, category: UpdateCategoryDto): Promise<Category | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.categories.update(id, category);
      
      if (response.succeeded && response.data) {
        setState((prev) => ({
          ...prev,
          categories: prev.categories.map(c => c.id === id ? response.data as Category : c),
          isLoading: false,
        }));
        toast.success("Category updated successfully");
        return response.data as Category;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to update category',
        }));
        toast.error("Failed to update category");
        return null;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to update category',
      }));
      toast.error((error as ApiError).message || "Failed to update category");
      return null;
    }
  };

  // Delete a category
  const deleteCategory = async (id: number): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.categories.delete(id);
      
      if (response.succeeded) {
        setState((prev) => ({
          ...prev,
          categories: prev.categories.filter(c => c.id !== id),
          isLoading: false,
        }));
        toast.success("Category deleted successfully");
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to delete category',
        }));
        toast.error(response.message || "Failed to delete category");
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to delete category',
      }));
      toast.error((error as ApiError).message || "Failed to delete category");
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Provide category context
  return (
    <CategoryContext.Provider
      value={{
        ...state,
        fetchCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        clearError,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

// Hook to use category context
export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
} 