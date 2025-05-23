import { apiClient } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';
import { 
  TaskTemplate, 
  TaskCategory, 
  CreateTemplateInput, 
  SaveAsTemplateInput,
  TemplateSummary
} from '@/lib/types/task';

// Default categories for tasks
const DEFAULT_CATEGORIES: TaskCategory[] = [
  { id: 1, name: 'Work', color: '#4f46e5', icon: 'briefcase' },
  { id: 2, name: 'Personal', color: '#10b981', icon: 'user' },
  { id: 3, name: 'Health', color: '#ef4444', icon: 'heart' },
  { id: 4, name: 'Finance', color: '#f59e0b', icon: 'dollar-sign' },
  { id: 5, name: 'Education', color: '#8b5cf6', icon: 'book' },
  { id: 6, name: 'Household', color: '#3b82f6', icon: 'home' },
];

// Default templates for tasks
const DEFAULT_TEMPLATES: TaskTemplate[] = [
  { 
    id: 1, 
    title: 'Daily Stand-up Meeting', 
    description: 'Participate in daily team sync meeting', 
    priority: 'medium', 
    status: 'todo',
    categoryId: 1, // Work
    isDefault: true,
    isPublic: true
  },
  { 
    id: 2, 
    title: 'Weekly Review', 
    description: 'Review completed tasks and plan for next week', 
    priority: 'high', 
    status: 'todo',
    estimatedDuration: 60,
    categoryId: 1, // Work
    isDefault: true,
    isPublic: true
  },
  { 
    id: 3, 
    title: 'Workout Session', 
    description: '30-minute exercise routine', 
    priority: 'medium', 
    status: 'todo',
    estimatedDuration: 30,
    categoryId: 3, // Health
    isDefault: true,
    isPublic: true
  },
  { 
    id: 4, 
    title: 'Pay Bills', 
    description: 'Pay monthly bills and review budget', 
    priority: 'high', 
    status: 'todo',
    categoryId: 4, // Finance
    isDefault: true,
    isPublic: true
  },
  { 
    id: 5, 
    title: 'Study Session', 
    description: '1-hour focused learning on a topic', 
    priority: 'medium', 
    status: 'todo',
    estimatedDuration: 60,
    categoryId: 5, // Education
    isDefault: true,
    isPublic: true
  },
  { 
    id: 6, 
    title: 'House Cleaning', 
    description: 'Regular house cleaning and organization', 
    priority: 'low', 
    status: 'todo',
    categoryId: 6, // Household
    isDefault: true,
    isPublic: true
  },
];

// Flag to use mock data when API is not available
const USE_MOCK_DATA = true;

class TemplateService {
  // Get all task categories
  async getCategories(): Promise<ApiResponse<TaskCategory[]>> {
    console.log('[templateService] Getting task categories');
    
    if (USE_MOCK_DATA) {
      // Try to get user-defined categories from local storage
      const userCategories = this.getUserCategories();
      
      // Combine with default categories
      return {
        data: [...DEFAULT_CATEGORIES, ...userCategories],
        status: 200
      };
    }
    
    try {
      const response = await apiClient.get<TaskCategory[]>('/v1/task-categories');
      return response;
    } catch (error) {
      console.error('[templateService] Error getting categories:', error);
      
      // Fall back to mock data
      const userCategories = this.getUserCategories();
      
      return {
        data: [...DEFAULT_CATEGORIES, ...userCategories],
        status: 200
      };
    }
  }
  
  // Get category by ID
  async getCategory(id: number): Promise<ApiResponse<TaskCategory>> {
    console.log(`[templateService] Getting category with ID: ${id}`);
    
    if (USE_MOCK_DATA) {
      const userCategories = this.getUserCategories();
      const allCategories = [...DEFAULT_CATEGORIES, ...userCategories];
      const category = allCategories.find(c => c.id === id);
      
      if (category) {
        return {
          data: category,
          status: 200
        };
      } else {
        return {
          error: 'Category not found',
          status: 404
        };
      }
    }
    
    try {
      const response = await apiClient.get<TaskCategory>(`/v1/task-categories/${id}`);
      return response;
    } catch (error) {
      console.error(`[templateService] Error getting category ${id}:`, error);
      
      // Try to find in local data
      const userCategories = this.getUserCategories();
      const allCategories = [...DEFAULT_CATEGORIES, ...userCategories];
      const category = allCategories.find(c => c.id === id);
      
      if (category) {
        return {
          data: category,
          status: 200
        };
      } else {
        return {
          error: 'Category not found',
          status: 404
        };
      }
    }
  }
  
  // Create a new category
  async createCategory(category: Partial<TaskCategory>): Promise<ApiResponse<TaskCategory>> {
    console.log('[templateService] Creating new category:', category);
    
    if (USE_MOCK_DATA) {
      const userCategories = this.getUserCategories();
      
      // Generate new ID (higher than default categories to avoid conflicts)
      const newId = Math.max(...[...DEFAULT_CATEGORIES, ...userCategories].map(c => c.id)) + 1;
      
      const newCategory: TaskCategory = {
        id: newId,
        name: category.name || 'New Category',
        description: category.description,
        color: category.color || '#6b7280', // Default gray color
        icon: category.icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      userCategories.push(newCategory);
      localStorage.setItem('userCategories', JSON.stringify(userCategories));
      
      return {
        data: newCategory,
        status: 201
      };
    }
    
    try {
      const response = await apiClient.post<TaskCategory>('/v1/task-categories', category);
      return response;
    } catch (error) {
      console.error('[templateService] Error creating category:', error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.createCategory(category);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to create category',
        status: 500
      };
    }
  }
  
  // Update an existing category
  async updateCategory(id: number, category: Partial<TaskCategory>): Promise<ApiResponse<TaskCategory>> {
    console.log(`[templateService] Updating category ${id}:`, category);
    
    if (USE_MOCK_DATA) {
      const userCategories = this.getUserCategories();
      const index = userCategories.findIndex(c => c.id === id);
      
      // Check if trying to update a default category
      const isDefaultCategory = DEFAULT_CATEGORIES.some(c => c.id === id);
      if (isDefaultCategory) {
        // Create a copy instead of updating default
        return this.createCategory({
          ...DEFAULT_CATEGORIES.find(c => c.id === id),
          ...category,
          name: `${category.name || DEFAULT_CATEGORIES.find(c => c.id === id)?.name} (Custom)`
        });
      }
      
      if (index === -1) {
        return {
          error: 'Category not found',
          status: 404
        };
      }
      
      // Update the category
      userCategories[index] = {
        ...userCategories[index],
        ...category,
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      localStorage.setItem('userCategories', JSON.stringify(userCategories));
      
      return {
        data: userCategories[index],
        status: 200
      };
    }
    
    try {
      const response = await apiClient.put<TaskCategory>(`/v1/task-categories/${id}`, category);
      return response;
    } catch (error) {
      console.error(`[templateService] Error updating category ${id}:`, error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.updateCategory(id, category);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to update category',
        status: 500
      };
    }
  }
  
  // Delete a category
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    console.log(`[templateService] Deleting category ${id}`);
    
    if (USE_MOCK_DATA) {
      // Check if trying to delete a default category
      const isDefaultCategory = DEFAULT_CATEGORIES.some(c => c.id === id);
      if (isDefaultCategory) {
        return {
          error: 'Cannot delete default category',
          status: 403
        };
      }
      
      const userCategories = this.getUserCategories();
      const index = userCategories.findIndex(c => c.id === id);
      
      if (index === -1) {
        return {
          error: 'Category not found',
          status: 404
        };
      }
      
      // Remove the category
      userCategories.splice(index, 1);
      
      // Save to local storage
      localStorage.setItem('userCategories', JSON.stringify(userCategories));
      
      return {
        status: 204
      };
    }
    
    try {
      const response = await apiClient.delete<void>(`/v1/task-categories/${id}`);
      return response;
    } catch (error) {
      console.error(`[templateService] Error deleting category ${id}:`, error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.deleteCategory(id);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to delete category',
        status: 500
      };
    }
  }
  
  // Get all task templates
  async getTemplates(categoryId?: number): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting task templates');
    
    if (USE_MOCK_DATA) {
      // Try to get user-defined templates from local storage
      const userTemplates = this.getUserTemplates();
      
      // Combine with default templates
      let templates = [...DEFAULT_TEMPLATES, ...userTemplates];
      
      // Filter by category if specified
      if (categoryId) {
        templates = templates.filter(t => t.categoryId === categoryId);
      }
      
      return {
        data: templates,
        status: 200
      };
    }
    
    try {
      const endpoint = categoryId 
        ? `/v1/task-templates?categoryId=${categoryId}` 
        : '/v1/task-templates';
      
      const response = await apiClient.get<TaskTemplate[]>(endpoint);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting templates:', error);
      
      // Fall back to mock data
      const userTemplates = this.getUserTemplates();
      
      // Combine with default templates
      let templates = [...DEFAULT_TEMPLATES, ...userTemplates];
      
      // Filter by category if specified
      if (categoryId) {
        templates = templates.filter(t => t.categoryId === categoryId);
      }
      
      return {
        data: templates,
        status: 200
      };
    }
  }
  
  // Get template by ID
  async getTemplate(id: number): Promise<ApiResponse<TaskTemplate>> {
    console.log(`[templateService] Getting template with ID: ${id}`);
    
    if (USE_MOCK_DATA) {
      console.log(`[templateService] Using mock data for template ${id}`);
      
      const userTemplates = this.getUserTemplates();
      console.log(`[templateService] User templates loaded:`, userTemplates.length);
      
      const allTemplates = [...DEFAULT_TEMPLATES, ...userTemplates];
      console.log(`[templateService] Total templates available:`, allTemplates.length);
      console.log(`[templateService] Default templates:`, DEFAULT_TEMPLATES.map(t => t.id));
      
      const template = allTemplates.find(t => t.id === id);
      
      if (template) {
        console.log(`[templateService] ✅ Template found: ${template.title}`);
        console.log(`[templateService] Template details:`, template);
        return {
          data: template,
          status: 200
        };
      } else {
        console.error(`[templateService] ❌ Template with ID ${id} not found in mock data`);
        console.log(`[templateService] Available template IDs:`, allTemplates.map(t => t.id));
        return {
          error: 'Template not found',
          status: 404
        };
      }
    }
    
    try {
      console.log(`[templateService] API fallback: Calling API for template ${id}`);
      const response = await apiClient.get<TaskTemplate>(`/v1/task-templates/${id}`);
      console.log(`[templateService] API response:`, response);
      return response;
    } catch (error) {
      console.error(`[templateService] Error getting template ${id}:`, error);
      
      // Try to find in local data
      console.log(`[templateService] API error, falling back to local data`);
      const userTemplates = this.getUserTemplates();
      const allTemplates = [...DEFAULT_TEMPLATES, ...userTemplates];
      const template = allTemplates.find(t => t.id === id);
      
      if (template) {
        console.log(`[templateService] Template found in fallback: ${template.title}`);
        return {
          data: template,
          status: 200
        };
      } else {
        console.error(`[templateService] Template not found in fallback data`);
        return {
          error: 'Template not found',
          status: 404
        };
      }
    }
  }
  
  // Create a new template
  async createTemplate(template: CreateTemplateInput): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Creating new template:', template);
    
    if (USE_MOCK_DATA) {
      const userTemplates = this.getUserTemplates();
      
      // Generate new ID (higher than default templates to avoid conflicts)
      const newId = Math.max(...[...DEFAULT_TEMPLATES, ...userTemplates].map(t => t.id)) + 1;
      
      const newTemplate: TaskTemplate = {
        id: newId,
        title: template.title,
        description: template.description,
        status: template.status || 'todo',
        priority: template.priority || 'medium',
        estimatedDuration: template.estimatedDuration,
        categoryId: template.categoryId,
        tags: template.tags,
        isPublic: template.isPublic || false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      userTemplates.push(newTemplate);
      localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
      
      return {
        data: newTemplate,
        status: 201
      };
    }
    
    try {
      const response = await apiClient.post<TaskTemplate>('/v1/task-templates', template);
      return response;
    } catch (error) {
      console.error('[templateService] Error creating template:', error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.createTemplate(template);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to create template',
        status: 500
      };
    }
  }
  
  // Save a task as a template
  async saveAsTemplate(input: SaveAsTemplateInput): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Saving task as template:', input);
    
    if (USE_MOCK_DATA) {
      const userTemplates = this.getUserTemplates();
      
      // Generate new ID
      const newId = Math.max(...[...DEFAULT_TEMPLATES, ...userTemplates].map(t => t.id)) + 1;
      
      const newTemplate: TaskTemplate = {
        id: newId,
        title: input.title,
        description: input.description,
        status: 'todo', // Default status for templates
        priority: 'medium', // Default priority for templates
        categoryId: input.categoryId,
        isPublic: input.isPublic || false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      userTemplates.push(newTemplate);
      localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
      
      return {
        data: newTemplate,
        status: 201
      };
    }
    
    try {
      const response = await apiClient.post<TaskTemplate>('/v1/task-templates/from-task', input);
      return response;
    } catch (error) {
      console.error('[templateService] Error saving task as template:', error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.saveAsTemplate(input);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to save task as template',
        status: 500
      };
    }
  }
  
  // Update an existing template
  async updateTemplate(id: number, template: Partial<TaskTemplate>): Promise<ApiResponse<TaskTemplate>> {
    console.log(`[templateService] Updating template ${id}:`, template);
    
    if (USE_MOCK_DATA) {
      const userTemplates = this.getUserTemplates();
      const index = userTemplates.findIndex(t => t.id === id);
      
      // Check if trying to update a default template
      const isDefaultTemplate = DEFAULT_TEMPLATES.some(t => t.id === id);
      if (isDefaultTemplate) {
        // Create a copy instead of updating default
        return this.createTemplate({
          title: `${template.title || DEFAULT_TEMPLATES.find(t => t.id === id)?.title} (Custom)`,
          description: template.description || DEFAULT_TEMPLATES.find(t => t.id === id)?.description,
          status: template.status || DEFAULT_TEMPLATES.find(t => t.id === id)?.status,
          priority: template.priority || DEFAULT_TEMPLATES.find(t => t.id === id)?.priority,
          estimatedDuration: template.estimatedDuration || DEFAULT_TEMPLATES.find(t => t.id === id)?.estimatedDuration,
          categoryId: template.categoryId || DEFAULT_TEMPLATES.find(t => t.id === id)?.categoryId,
          tags: template.tags || DEFAULT_TEMPLATES.find(t => t.id === id)?.tags,
          isPublic: template.isPublic || false
        });
      }
      
      if (index === -1) {
        return {
          error: 'Template not found',
          status: 404
        };
      }
      
      // Update the template
      userTemplates[index] = {
        ...userTemplates[index],
        ...template,
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
      
      return {
        data: userTemplates[index],
        status: 200
      };
    }
    
    try {
      const response = await apiClient.put<TaskTemplate>(`/v1/task-templates/${id}`, template);
      return response;
    } catch (error) {
      console.error(`[templateService] Error updating template ${id}:`, error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.updateTemplate(id, template);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to update template',
        status: 500
      };
    }
  }
  
  // Delete a template
  async deleteTemplate(id: number): Promise<ApiResponse<void>> {
    console.log(`[templateService] Deleting template ${id}`);
    
    if (USE_MOCK_DATA) {
      // Check if trying to delete a default template
      const isDefaultTemplate = DEFAULT_TEMPLATES.some(t => t.id === id);
      if (isDefaultTemplate) {
        return {
          error: 'Cannot delete default template',
          status: 403
        };
      }
      
      const userTemplates = this.getUserTemplates();
      const index = userTemplates.findIndex(t => t.id === id);
      
      if (index === -1) {
        return {
          error: 'Template not found',
          status: 404
        };
      }
      
      // Remove the template
      userTemplates.splice(index, 1);
      
      // Save to local storage
      localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
      
      return {
        status: 204
      };
    }
    
    try {
      const response = await apiClient.delete<void>(`/v1/task-templates/${id}`);
      return response;
    } catch (error) {
      console.error(`[templateService] Error deleting template ${id}:`, error);
      
      if (USE_MOCK_DATA) {
        // Fall back to mock implementation
        return this.deleteTemplate(id);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to delete template',
        status: 500
      };
    }
  }
  
  // Get template summaries (for quick selection UI)
  async getTemplateSummaries(categoryId?: number): Promise<ApiResponse<TemplateSummary[]>> {
    console.log('[templateService] Getting template summaries');
    
    if (USE_MOCK_DATA) {
      // Get categories for names
      const categoriesResponse = await this.getCategories();
      const categories = categoriesResponse.data || [];
      
      // Get templates
      const userTemplates = this.getUserTemplates();
      let templates = [...DEFAULT_TEMPLATES, ...userTemplates];
      
      // Filter by category if specified
      if (categoryId) {
        templates = templates.filter(t => t.categoryId === categoryId);
      }
      
      // Map to summaries
      const summaries: TemplateSummary[] = templates.map(t => ({
        id: t.id,
        title: t.title,
        categoryId: t.categoryId,
        categoryName: categories.find(c => c.id === t.categoryId)?.name,
        isPublic: t.isPublic || false,
        isDefault: t.isDefault || false,
        timesUsed: Math.floor(Math.random() * 20) // Mock data for usage stats
      }));
      
      return {
        data: summaries,
        status: 200
      };
    }
    
    try {
      const endpoint = categoryId 
        ? `/v1/task-templates/summaries?categoryId=${categoryId}` 
        : '/v1/task-templates/summaries';
      
      const response = await apiClient.get<TemplateSummary[]>(endpoint);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting template summaries:', error);
      
      // Fall back to mock implementation
      if (USE_MOCK_DATA) {
        return this.getTemplateSummaries(categoryId);
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to get template summaries',
        status: 500
      };
    }
  }
  
  // Private helper methods
  
  // Get user-defined categories from localStorage
  private getUserCategories(): TaskCategory[] {
    try {
      const stored = localStorage.getItem('userCategories');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[templateService] Error parsing user categories from localStorage:', error);
      return [];
    }
  }
  
  // Get user-defined templates from localStorage
  private getUserTemplates(): TaskTemplate[] {
    try {
      const stored = localStorage.getItem('userTemplates');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[templateService] Error parsing user templates from localStorage:', error);
      return [];
    }
  }
}

export const templateService = new TemplateService(); 