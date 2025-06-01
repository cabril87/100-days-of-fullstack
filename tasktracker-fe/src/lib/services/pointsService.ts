import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';

export interface PointsBalance {
  balance: number;
  userId: number;
}

export interface PointTransaction {
  id: number;
  userId: number;
  points: number;
  transactionType: string;
  description: string;
  templateId?: number;
  createdAt: string;
}

export interface TemplatePurchase {
  id: number;
  userId: number;
  templateId: number;
  pointsSpent: number;
  purchasedAt: string;
  template?: any;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  newBalance: number;
  transaction: PointTransaction;
}

class PointsService {
  
  /**
   * Get user's current points balance
   */
  async getBalance(): Promise<ApiResponse<number>> {
    console.log('[pointsService] Getting points balance');
    
    try {
      const response = await apiClient.get<number>('/v1/points/balance');
      return response;
    } catch (error) {
      console.error('[pointsService] Error getting balance:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get points balance',
        status: 500
      };
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(): Promise<ApiResponse<PointTransaction[]>> {
    console.log('[pointsService] Getting transaction history');
    
    try {
      const response = await apiClient.get<PointTransaction[]>('/v1/points/transactions');
      return response;
    } catch (error) {
      console.error('[pointsService] Error getting transactions:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get transaction history',
        status: 500
      };
    }
  }

  /**
   * Get user's purchased templates
   */
  async getPurchasedTemplates(): Promise<ApiResponse<TemplatePurchase[]>> {
    console.log('[pointsService] Getting purchased templates');
    
    try {
      const response = await apiClient.get<TemplatePurchase[]>('/v1/points/purchases');
      return response;
    } catch (error) {
      console.error('[pointsService] Error getting purchased templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get purchased templates',
        status: 500
      };
    }
  }

  /**
   * Purchase a template
   */
  async purchaseTemplate(templateId: number): Promise<ApiResponse<PurchaseResponse>> {
    console.log('[pointsService] Purchasing template:', templateId);
    
    try {
      const response = await apiClient.post<PurchaseResponse>(`/v1/points/purchase/${templateId}`);
      return response;
    } catch (error) {
      console.error('[pointsService] Error purchasing template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to purchase template',
        status: 500
      };
    }
  }

  /**
   * Check if user has purchased a specific template
   */
  async hasPurchasedTemplate(templateId: number): Promise<ApiResponse<boolean>> {
    console.log('[pointsService] Checking if template purchased:', templateId);
    
    try {
      const response = await apiClient.get<boolean>(`/v1/points/has-purchased/${templateId}`);
      return response;
    } catch (error) {
      console.error('[pointsService] Error checking template purchase:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to check template purchase',
        status: 500
      };
    }
  }

  /**
   * Add points to user account (for testing or admin purposes)
   */
  async addPoints(points: number, description: string): Promise<ApiResponse<PointTransaction>> {
    console.log('[pointsService] Adding points:', points, description);
    
    try {
      const response = await apiClient.post<PointTransaction>('/v1/points/add', {
        points,
        description
      });
      return response;
    } catch (error) {
      console.error('[pointsService] Error adding points:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to add points',
        status: 500
      };
    }
  }
}

export const pointsService = new PointsService(); 