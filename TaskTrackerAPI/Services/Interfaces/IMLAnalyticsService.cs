using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models.ML;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Machine Learning Analytics Service for advanced focus predictions and insights
    /// </summary>
    public interface IMLAnalyticsService
    {
        // Model Training and Management
        Task<bool> TrainFocusSuccessModelAsync(int userId);
        Task<bool> TrainFocusDurationModelAsync(int userId);
        Task<bool> TrainDistractionModelAsync(int userId);
        Task<bool> TrainUserClusteringModelAsync();
        Task<bool> RetrainAllModelsAsync();

        // Predictions
        Task<FocusSessionPrediction> PredictNextSessionSuccessAsync(int userId);
        Task<FocusDurationPrediction> PredictSessionDurationAsync(int userId, DateTime plannedStartTime);
        Task<DistractionPrediction> PredictDistractionsAsync(int userId, DateTime plannedStartTime);
        Task<FocusForecast> ForecastWeeklyFocusAsync(int userId, int daysAhead = 7);

        // User Behavior Analysis
        Task<UserClusterPrediction> AnalyzeUserBehaviorClusterAsync(int userId);
        Task<List<string>> GetPersonalizedRecommendationsAsync(int userId);
        Task<float> CalculateProductivityScoreAsync(int userId);

        // Comprehensive Insights
        Task<MLInsightsResult> GetComprehensiveMLInsightsAsync(int userId);
        Task<List<string>> GetPredictiveInsightsAsync(int userId);

        // Data Preparation
        Task<List<FocusPredictionData>> PrepareTrainingDataAsync(int userId);
        Task<FocusPredictionData> PrepareCurrentUserDataAsync(int userId);
        Task<List<FocusTimeSeriesData>> PrepareTimeSeriesDataAsync(int userId);

        // Model Evaluation
        Task<Dictionary<string, double>> EvaluateModelPerformanceAsync(int userId);
        Task<bool> IsModelTrainedAsync(string modelType);
        Task<DateTime?> GetLastTrainingDateAsync(string modelType);

        // Optimal Time Recommendations
        Task<List<DateTime>> GetOptimalFocusTimesAsync(int userId, DateTime targetDate);
        Task<TimeSpan> GetRecommendedSessionLengthAsync(int userId, DateTime plannedStartTime);
        Task<List<string>> GetEnvironmentalRecommendationsAsync(int userId);

        // Pattern Recognition
        Task<Dictionary<string, object>> AnalyzeFocusPatternsAsync(int userId);
        Task<List<string>> DetectProductivityAnomaliesAsync(int userId);
        Task<Dictionary<DayOfWeek, float>> GetWeeklyProductivityPatternsAsync(int userId);
        Task<Dictionary<int, float>> GetHourlyProductivityPatternsAsync(int userId);

        // Model Health and Monitoring
        Task<bool> ValidateModelHealthAsync();
        Task<Dictionary<string, object>> GetModelMetricsAsync();
        Task<bool> ShouldRetrainModelAsync(string modelType);
    }
} 