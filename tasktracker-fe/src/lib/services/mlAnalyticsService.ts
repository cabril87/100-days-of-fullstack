import { apiClient } from './apiClient';

export interface MLInsightsResult {
  nextSessionPrediction?: {
    willSucceed: boolean;
    probability: number;
    score: number;
  };
  durationPrediction?: {
    predictedMinutes: number;
  };
  distractionPrediction?: {
    predictedDistractions: number;
  };
  weeklyForecast?: {
    forecastedFocusMinutes: number[];
    lowerBoundValues: number[];
    upperBoundValues: number[];
    confidenceIntervals: number[];
  };
  userCluster?: {
    clusterId: number;
    distances: number[];
  };
  personalizedRecommendations: string[];
  predictiveInsights: string[];
  overallProductivityScore: number;
  confidenceLevel: number;
  generatedAt: string;
}

export interface ProductivityPatterns {
  weekly: Record<string, number>;
  hourly: Record<string, number>;
}

export interface ModelTrainingResult {
  successModelTrained: boolean;
  durationModelTrained: boolean;
  distractionModelTrained: boolean;
  message: string;
}

export class MLAnalyticsService {
  private static instance: MLAnalyticsService;
  private baseUrl = '/v1/mlanalytics';

  public static getInstance(): MLAnalyticsService {
    if (!MLAnalyticsService.instance) {
      MLAnalyticsService.instance = new MLAnalyticsService();
    }
    return MLAnalyticsService.instance;
  }

  /**
   * Get comprehensive ML-powered insights for a user
   */
  async getMLInsights(userId: number): Promise<MLInsightsResult> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/insights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ML insights:', error);
      throw new Error('Failed to fetch ML insights');
    }
  }

  /**
   * Get personalized recommendations based on ML analysis
   */
  async getPersonalizedRecommendations(userId: number): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/recommendations/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  /**
   * Get optimal focus times for a specific date
   */
  async getOptimalFocusTimes(userId: number, targetDate?: string): Promise<string[]> {
    try {
      let endpoint = `${this.baseUrl}/optimal-times/${userId}`;
      if (targetDate) {
        endpoint += `?targetDate=${encodeURIComponent(targetDate)}`;
      }
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching optimal times:', error);
      throw new Error('Failed to fetch optimal times');
    }
  }

  /**
   * Get weekly productivity patterns
   */
  async getWeeklyPatterns(userId: number): Promise<Record<string, number>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/patterns/weekly/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly patterns:', error);
      throw new Error('Failed to fetch weekly patterns');
    }
  }

  /**
   * Get hourly productivity patterns
   */
  async getHourlyPatterns(userId: number): Promise<Record<string, number>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/patterns/hourly/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hourly patterns:', error);
      throw new Error('Failed to fetch hourly patterns');
    }
  }

  /**
   * Get both weekly and hourly patterns
   */
  async getProductivityPatterns(userId: number): Promise<ProductivityPatterns> {
    try {
      const [weekly, hourly] = await Promise.all([
        this.getWeeklyPatterns(userId),
        this.getHourlyPatterns(userId)
      ]);
      return { weekly, hourly };
    } catch (error) {
      console.error('Error fetching productivity patterns:', error);
      throw new Error('Failed to fetch productivity patterns');
    }
  }

  /**
   * Train ML models for a specific user
   */
  async trainUserModels(userId: number): Promise<ModelTrainingResult> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/train/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error training models:', error);
      throw new Error('Failed to train models');
    }
  }

  /**
   * Get productivity anomalies
   */
  async getProductivityAnomalies(userId: number): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/anomalies/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      throw new Error('Failed to fetch anomalies');
    }
  }

  /**
   * Get environmental recommendations
   */
  async getEnvironmentalRecommendations(userId: number): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/environment/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching environmental recommendations:', error);
      throw new Error('Failed to fetch environmental recommendations');
    }
  }

  /**
   * Validate model health
   */
  async validateModelHealth(): Promise<{ isHealthy: boolean; timestamp: string }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Error validating model health:', error);
      throw new Error('Failed to validate model health');
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(): Promise<Record<string, any>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/model-metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      throw new Error('Failed to fetch model metrics');
    }
  }
}

export const mlAnalyticsService = MLAnalyticsService.getInstance(); 