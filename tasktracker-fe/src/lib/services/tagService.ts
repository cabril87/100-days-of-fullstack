import { apiClient } from '@/lib/config/api-client';
import { TagDto, Task } from '@/lib/types/task';

export interface CreateTagDTO {
  name: string;
}

export interface TagSearchResult extends TagDto {
  usageCount: number;
  lastUsed?: Date;
}

/**
 * Enterprise Tag Service
 * Provides comprehensive tag management and content discovery capabilities
 */
export class TagService {
  private tagCache = new Map<string, TagDto>();
  private readonly CACHE_TTL = 300000; // 5 minutes cache

  /**
   * Get all user tags with caching
   */
  async getAllTags(): Promise<TagDto[]> {
    try {
      const result = await apiClient.get<TagDto[]>('/v1/tags');
      
      // Update cache
      if (Array.isArray(result)) {
        result.forEach(tag => {
          this.tagCache.set(tag.name.toLowerCase(), tag);
        });
      }
      
      return result || [];
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  /**
   * Create a new tag if it doesn't exist
   */
  async createTag(name: string): Promise<TagDto | null> {
    try {
      const createData: CreateTagDTO = { name: name.trim() };
      const result = await apiClient.post<TagDto>('/v1/tags', createData);
      
      if (result) {
        // Update cache
        this.tagCache.set(result.name.toLowerCase(), result);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to create tag "${name}":`, error);
      return null;
    }
  }

  /**
   * Get tag by name, create if doesn't exist
   */
  async getOrCreateTag(name: string): Promise<TagDto | null> {
    const normalizedName = name.trim().toLowerCase();
    
    // Check cache first
    const cachedTag = this.tagCache.get(normalizedName);
    if (cachedTag) {
      return cachedTag;
    }
    
    // Get all tags and search
    const allTags = await this.getAllTags();
    const existingTag = allTags.find(tag => tag.name.toLowerCase() === normalizedName);
    
    if (existingTag) {
      return existingTag;
    }
    
    // Create new tag
    return await this.createTag(name.trim());
  }

  /**
   * Convert tag names to tag IDs (enterprise solution)
   * Automatically creates tags that don't exist
   */
  async convertTagNamesToIds(tagNames: string[]): Promise<number[]> {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    console.log('🏷️ Converting tag names to IDs:', tagNames);
    
    const tagIds: number[] = [];
    
    for (const tagName of tagNames) {
      if (!tagName || tagName.trim() === '') continue;
      
      try {
        const tag = await this.getOrCreateTag(tagName);
        if (tag && tag.id) {
          tagIds.push(tag.id);
          console.log(`✅ Tag "${tagName}" -> ID ${tag.id}`);
        } else {
          console.warn(`❌ Failed to get/create tag: ${tagName}`);
        }
      } catch (error) {
        console.error(`❌ Error processing tag "${tagName}":`, error);
      }
    }
    
    console.log('🏷️ Final tag IDs:', tagIds);
    return tagIds;
  }

  /**
   * Search tags with intelligent matching
   */
  async searchTags(query: string): Promise<TagSearchResult[]> {
    try {
      const result = await apiClient.get<TagSearchResult[]>(`/v1/tags/search?term=${encodeURIComponent(query)}`);
      return result || [];
    } catch (error) {
      console.error('Failed to search tags:', error);
      return [];
    }
  }

  /**
   * Get tasks by tag for content discovery
   */
  async getTasksByTag(tagId: number): Promise<Task[]> {
    try {
      const result = await apiClient.get<Task[]>(`/v1/tags/${tagId}/tasks`);
      return result || [];
    } catch (error) {
      console.error(`Failed to get tasks for tag ${tagId}:`, error);
      return [];
    }
  }

  /**
   * Get tag usage statistics
   */
  async getTagStatistics(): Promise<Record<string, number>> {
    try {
      const result = await apiClient.get<Record<string, number>>('/v1/tags/statistics');
      return result || {};
    } catch (error) {
      console.error('Failed to get tag statistics:', error);
      return {};
    }
  }

  /**
   * Bulk associate tags with a task
   */
  async associateTagsWithTask(taskId: number, tagIds: number[]): Promise<boolean> {
    try {
      await apiClient.put(`/v1/taskitems/${taskId}/tags`, tagIds);
      return true;
    } catch (error) {
      console.error(`Failed to associate tags with task ${taskId}:`, error);
      return false;
    }
  }

  /**
   * Clear tag cache (useful after tag operations)
   */
  clearCache(): void {
    this.tagCache.clear();
  }

  /**
   * Get popular tags for content discovery
   */
  async getPopularTags(limit: number = 10): Promise<TagSearchResult[]> {
    try {
      const stats = await this.getTagStatistics();
      const allTags = await this.getAllTags();
      
      const popularTags: TagSearchResult[] = allTags
        .map(tag => ({
          ...tag,
          usageCount: stats[tag.name] || 0
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
      
      return popularTags;
    } catch (error) {
      console.error('Failed to get popular tags:', error);
      return [];
    }
  }

  /**
   * Get related tags for content discovery
   */
  async getRelatedTags(currentTags: string[]): Promise<TagDto[]> {
    try {
      // This would ideally be a backend endpoint, but for now we'll do simple similarity
      const allTags = await this.getAllTags();
      const currentTagNames = currentTags.map(t => t.toLowerCase());
      
      return allTags.filter(tag => 
        !currentTagNames.includes(tag.name.toLowerCase()) &&
        currentTagNames.some(current => 
          tag.name.toLowerCase().includes(current) || 
          current.includes(tag.name.toLowerCase())
        )
      ).slice(0, 5);
    } catch (error) {
      console.error('Failed to get related tags:', error);
      return [];
    }
  }
}

// Export singleton instance
export const tagService = new TagService(); 