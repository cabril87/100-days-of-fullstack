import { apiClient } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';
import { 
  TaskTemplate, 
  TaskCategory, 
  CreateTemplateInput, 
  SaveAsTemplateInput,
  TemplateSummary
} from '@/lib/types/task';

// Template service class with real API integration
class TemplateService {
  // Get all task categories
  async getCategories(): Promise<ApiResponse<TaskCategory[]>> {
    console.log('[templateService] Getting task categories');
    
    try {
      const response = await apiClient.get<TaskCategory[]>('/v1/task-categories');
      return response;
    } catch (error) {
      console.error('[templateService] Error getting categories:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get categories',
        status: 500
      };
    }
  }

  // Get all task templates
  async getTemplates(categoryId?: number): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting task templates');
    
    const endpoint = categoryId 
      ? `/v1/taskTemplates?categoryId=${categoryId}` 
      : '/v1/taskTemplates';
    
    const response = await apiClient.get<TaskTemplate[]>(endpoint);
    return response;
  }

  // Get marketplace templates
  async getMarketplaceTemplates(): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting marketplace templates');
    
    try {
      const response = await apiClient.get<TaskTemplate[]>('/v1/taskTemplates/marketplace');
      return response;
    } catch (error) {
      console.error('[templateService] Error getting marketplace templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get marketplace templates',
        status: 500
      };
    }
  }

  // Get featured templates
  async getFeaturedTemplates(): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting featured templates');
    
    try {
      const response = await apiClient.get<TaskTemplate[]>('/v1/taskTemplates/marketplace/featured');
      return response;
    } catch (error) {
      console.error('[templateService] Error getting featured templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get featured templates',
        status: 500
      };
    }
  }

  // Get popular templates
  async getPopularTemplates(count: number = 10): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting popular templates');
    
    try {
      const response = await apiClient.get<TaskTemplate[]>(`/v1/taskTemplates/marketplace/popular?count=${count}`);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting popular templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get popular templates',
        status: 500
      };
    }
  }

  // Get automated templates
  async getAutomatedTemplates(): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting automated templates');
    
    try {
      const response = await apiClient.get<TaskTemplate[]>('/v1/taskTemplates/automation');
      return response;
    } catch (error) {
      console.error('[templateService] Error getting automated templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get automated templates',
        status: 500
      };
    }
  }

  // Search templates
  async searchTemplates(searchTerm: string): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Searching templates:', searchTerm);
    
    try {
      const response = await apiClient.get<TaskTemplate[]>(`/v1/taskTemplates/marketplace/search?searchTerm=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      console.error('[templateService] Error searching templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to search templates',
        status: 500
      };
    }
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<ApiResponse<TaskTemplate[]>> {
    console.log('[templateService] Getting templates by category:', category);
    
    try {
      const response = await apiClient.get<TaskTemplate[]>(`/v1/taskTemplates/marketplace/category/${encodeURIComponent(category)}`);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting templates by category:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get templates by category',
        status: 500
      };
    }
  }

  // Get template by ID
  async getTemplate(templateId: number): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Getting template by ID:', templateId);
    
    try {
      const response = await apiClient.get<TaskTemplate>(`/v1/taskTemplates/${templateId}`);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get template',
        status: 500
      };
    }
  }

  // Create a new template
  async createTemplate(template: CreateTemplateInput): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Creating new template:', template);
    
    try {
      const response = await apiClient.post<TaskTemplate>('/v1/taskTemplates', template);
      return response;
    } catch (error) {
      console.error('[templateService] Error creating template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create template',
        status: 500
      };
    }
  }

  // Update template
  async updateTemplate(templateId: number, template: Partial<TaskTemplate>): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Updating template:', templateId, template);
    
    try {
      const response = await apiClient.put<TaskTemplate>(`/v1/taskTemplates/${templateId}`, template);
      return response;
    } catch (error) {
      console.error('[templateService] Error updating template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update template',
        status: 500
      };
    }
  }

  // Delete template
  async deleteTemplate(templateId: number): Promise<ApiResponse<void>> {
    console.log('[templateService] Deleting template:', templateId);
    
    try {
      const response = await apiClient.delete<void>(`/v1/taskTemplates/${templateId}`);
      return response;
    } catch (error) {
      console.error('[templateService] Error deleting template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to delete template',
        status: 500
      };
    }
  }

  // Apply template
  async applyTemplate(templateId: number, applyData: any): Promise<ApiResponse<any>> {
    console.log('[templateService] Applying template:', templateId, applyData);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/apply`, applyData);
      return response;
    } catch (error) {
      console.error('[templateService] Error applying template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to apply template',
        status: 500
      };
    }
  }

  // Purchase template
  async purchaseTemplate(templateId: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Purchasing template:', templateId);
    
    try {
      const response = await apiClient.post<any>(`/v1/templates/${templateId}/purchase`, {});
      return response;
    } catch (error) {
      console.error('[templateService] Error purchasing template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to purchase template',
        status: 500
      };
    }
  }

  // Rate template
  async rateTemplate(templateId: number, rating: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Rating template:', templateId, rating);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/rate`, { rating });
      return response;
    } catch (error) {
      console.error('[templateService] Error rating template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to rate template',
        status: 500
      };
    }
  }

  // Download template
  async downloadTemplate(templateId: number): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Downloading template:', templateId);
    
    try {
      const response = await apiClient.post<TaskTemplate>(`/v1/taskTemplates/${templateId}/download`, {});
      return response;
    } catch (error) {
      console.error('[templateService] Error downloading template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to download template',
        status: 500
      };
    }
  }

  // Get template analytics
  async getTemplateAnalytics(templateId: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Getting template analytics:', templateId);
    
    try {
      const response = await apiClient.get<any>(`/v1/taskTemplates/${templateId}/analytics`);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting template analytics:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get template analytics',
        status: 500
      };
    }
  }

  // Record template usage
  async recordTemplateUsage(templateId: number, usageData: { success: boolean; completionTimeMinutes: number }): Promise<ApiResponse<any>> {
    console.log('[templateService] Recording template usage:', templateId, usageData);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/usage`, usageData);
      return response;
    } catch (error) {
      console.error('[templateService] Error recording template usage:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to record template usage',
        status: 500
      };
    }
  }

  // Get template summaries (for quick selection UI)
  async getTemplateSummaries(categoryId?: number): Promise<ApiResponse<TemplateSummary[]>> {
    console.log('[templateService] Getting template summaries');
    
    try {
      const endpoint = categoryId 
        ? `/v1/taskTemplates/summaries?categoryId=${categoryId}` 
        : '/v1/taskTemplates/summaries';
      
      const response = await apiClient.get<TemplateSummary[]>(endpoint);
      return response;
    } catch (error) {
      console.error('[templateService] Error getting template summaries:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get template summaries',
        status: 500
      };
    }
  }

  // Save a task as a template
  async saveAsTemplate(input: SaveAsTemplateInput): Promise<ApiResponse<TaskTemplate>> {
    console.log('[templateService] Saving task as template:', input);
    
    try {
      const response = await apiClient.post<TaskTemplate>('/v1/taskTemplates/from-task', input);
      return response;
    } catch (error) {
      console.error('[templateService] Error saving task as template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to save task as template',
        status: 500
      };
    }
  }

  // Publish template to marketplace
  async publishTemplate(templateId: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Publishing template to marketplace:', templateId);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/publish`, {});
      return response;
    } catch (error) {
      console.error('[templateService] Error publishing template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to publish template',
        status: 500
      };
    }
  }

  // Unpublish template from marketplace
  async unpublishTemplate(templateId: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Unpublishing template from marketplace:', templateId);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/unpublish`, {});
      return response;
    } catch (error) {
      console.error('[templateService] Error unpublishing template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to unpublish template',
        status: 500
      };
    }
  }

  // Generate automated tasks from template
  async generateAutomatedTasks(templateId: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Generating automated tasks:', templateId);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/automation/generate`, {});
      return response;
    } catch (error) {
      console.error('[templateService] Error generating automated tasks:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to generate automated tasks',
        status: 500
      };
    }
  }

  // Execute workflow
  async executeWorkflow(templateId: number): Promise<ApiResponse<any>> {
    console.log('[templateService] Executing workflow:', templateId);
    
    try {
      const response = await apiClient.post<any>(`/v1/taskTemplates/${templateId}/workflow/execute`, {});
      return response;
    } catch (error) {
      console.error('[templateService] Error executing workflow:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to execute workflow',
        status: 500
      };
    }
  }
}

// Export singleton instance
export const templateService = new TemplateService(); 