'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import {  CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Lightbulb,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react';
import { MLAnalyticsService, MLInsightsResult } from '@/lib/services/mlAnalyticsService';

export function FocusMLInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MLInsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const mlService = MLAnalyticsService.getInstance();

  // Load ML insights from backend
  const loadMLInsights = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[FocusMLInsights] Fetching ML insights from backend...');
      const result = await mlService.getMLInsights(Number(user.id));
      
      console.log('[FocusMLInsights] ML insights received:', result);
      setInsights(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[FocusMLInsights] Error loading ML insights:', err);
      setError('Failed to load AI insights. The ML models may need training with more data.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, mlService]);

  // Load insights on mount
  useEffect(() => {
    loadMLInsights();
  }, [loadMLInsights]);

  // Train models for user
  const handleTrainModels = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('[FocusMLInsights] Training ML models...');
      await mlService.trainUserModels(Number(user.id));
      
      // Reload insights after training
      await loadMLInsights();
    } catch (err) {
      console.error('[FocusMLInsights] Error training models:', err);
      setError('Failed to train ML models. You may need more focus session data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !insights) {
    return (
      <div className="min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-xl"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
        
        <div className="flex justify-center items-center p-8 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading AI insights from ML.NET...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ML.NET AI Insights
                </h2>
                <p className="text-gray-600">Powered by Microsoft ML.NET machine learning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <Button 
                onClick={loadMLInsights} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="hover:bg-purple-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
          
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-red-800">AI Insights Unavailable</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <Button 
                onClick={handleTrainModels}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isLoading ? 'Training...' : 'Train ML Models'}
              </Button>
              <Button 
                onClick={loadMLInsights}
                variant="outline"
                disabled={isLoading}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ML Insights Content */}
      {insights && (
        <Tabs defaultValue="predictions" className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <TabsList className="p-2 bg-transparent w-full grid grid-cols-3">
              <TabsTrigger 
                value="predictions" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Target className="h-4 w-4 mr-2" />
                Predictions
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger 
                value="score" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Star className="h-4 w-4 mr-2" />
                Score
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Next Session Success Prediction */}
              {insights.nextSessionPrediction && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-xl"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-600 opacity-[0.05] rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                        <Target className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Next Session Success</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Prediction</span>
                        <Badge variant={insights.nextSessionPrediction.willSucceed ? "default" : "destructive"}>
                          {insights.nextSessionPrediction.willSucceed ? 'Success' : 'Risk'}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <span className="text-lg font-bold text-green-600">
                            {Math.round(insights.nextSessionPrediction.probability * 100)}%
                          </span>
                        </div>
                        <Progress value={insights.nextSessionPrediction.probability * 100} className="h-2" />
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        ML Score: {insights.nextSessionPrediction.score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Duration Prediction */}
              {insights.durationPrediction && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Predicted Duration</h3>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                        {Math.round(insights.durationPrediction.predictedMinutes)}m
                      </div>
                      <p className="text-sm text-gray-600">Expected session length</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Distraction Prediction */}
              {insights.distractionPrediction && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600 opacity-[0.05] rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                        <Zap className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Distraction Risk</h3>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">
                        {Math.round(insights.distractionPrediction.predictedDistractions)}
                      </div>
                      <p className="text-sm text-gray-600">Expected distractions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Forecast */}
            {insights.weeklyForecast && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-xl"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Weekly Forecast
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {insights.weeklyForecast.forecastedFocusMinutes.map((minutes, index) => (
                        <div key={index} className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <div className="text-xs text-gray-600 mb-1">
                            Day {index + 1}
                          </div>
                          <div className="text-lg font-bold text-purple-600">
                            {Math.round(minutes)}m
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personalized Recommendations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        AI Recommendations
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.personalizedRecommendations.length > 0 ? (
                        insights.personalizedRecommendations.map((recommendation, index) => (
                          <div key={index} className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">{recommendation}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No recommendations available yet. Complete more focus sessions for personalized insights.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-xl"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-600 opacity-[0.05] rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Predictive Insights
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.predictiveInsights.length > 0 ? (
                        insights.predictiveInsights.map((insight, index) => (
                          <div key={index} className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">{insight}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No predictive insights available yet. The ML models need more data to generate predictions.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Productivity Score Tab */}
          <TabsContent value="score" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-600 opacity-[0.05] rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-600 opacity-[0.05] rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                      <Star className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      ML Productivity Score
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      {Math.round(insights.overallProductivityScore)}
                    </div>
                    <p className="text-gray-600 text-lg">Overall Productivity Score</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Performance Level</span>
                        <Badge variant={
                          insights.overallProductivityScore >= 80 ? "default" :
                          insights.overallProductivityScore >= 60 ? "secondary" :
                          insights.overallProductivityScore >= 40 ? "outline" : "destructive"
                        }>
                          {insights.overallProductivityScore >= 80 ? 'Excellent' :
                           insights.overallProductivityScore >= 60 ? 'Good' :
                           insights.overallProductivityScore >= 40 ? 'Fair' : 'Needs Improvement'}
                        </Badge>
                      </div>
                      <Progress value={insights.overallProductivityScore} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Confidence Level</span>
                        <span className="text-sm font-bold text-amber-600">
                          {Math.round(insights.confidenceLevel * 100)}%
                        </span>
                      </div>
                      <Progress value={insights.confidenceLevel * 100} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      This score is calculated using machine learning algorithms that analyze your focus patterns, 
                      session completion rates, distraction management, and consistency over time.
                    </p>
                  </div>
                </CardContent>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && insights && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-t-xl"></div>
          
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-gray-600" />
                Raw ML.NET Response (Dev Only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  View raw ML insights data
                </summary>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(insights, null, 2)}
                </pre>
              </details>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  );
} 