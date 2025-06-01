'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  Calendar,
  Target,
  Zap,
  LineChart,
  BarChart3,
  Activity,
  Sparkles,
  Eye,
  BookOpen,
  Trophy,
  Shield,
  Flame
} from 'lucide-react';
import { mlAnalyticsService } from '@/lib/services/mlAnalyticsService';
import { useAuth } from '@/lib/providers/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PatternInsight {
  id: string;
  type: 'productivity' | 'behavioral' | 'prediction' | 'optimization' | 'anomaly';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  timeframe: string;
  metrics: { [key: string]: number | string };
  trend: 'improving' | 'declining' | 'stable';
  actionable: boolean;
}

interface ProductivityPattern {
  pattern: string;
  frequency: number;
  impact: number;
  timeOfDay: string[];
  daysOfWeek: string[];
  tasks: string[];
  confidence: number;
  prediction: string;
}

interface BehavioralAnalytics {
  workingStyle: 'focused_sprints' | 'steady_pace' | 'burst_worker' | 'deep_work';
  peakHours: string[];
  averageSessionLength: number;
  breakPatterns: string[];
  motivationTriggers: string[];
  stressIndicators: string[];
  adaptabilityScore: number;
  consistencyScore: number;
}

interface PredictiveModel {
  goalAchievementProbability: number;
  burnoutRisk: number;
  optimalWorkload: number;
  suggestedSchedule: ScheduleSuggestion[];
  performanceForecast: PerformanceForecast;
}

interface ScheduleSuggestion {
  timeSlot: string;
  taskType: string;
  confidence: number;
  reason: string;
}

interface PerformanceForecast {
  nextWeek: number;
  nextMonth: number;
  factors: string[];
  recommendations: string[];
}

export function MLPatternRecognition() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [patterns, setPatterns] = useState<ProductivityPattern[]>([]);
  const [behavioral, setBehavioral] = useState<BehavioralAnalytics | null>(null);
  const [predictions, setPredictions] = useState<PredictiveModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PatternInsight | null>(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    if (user) {
      loadMLAnalytics();
    }
  }, [user]);

  const loadMLAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load different types of ML analytics
      const [insightsData, patternsData, behavioralData, predictionsData] = await Promise.all([
        loadPatternInsights(),
        loadProductivityPatterns(),
        loadBehavioralAnalytics(),
        loadPredictiveModels()
      ]);

      setInsights(insightsData);
      setPatterns(patternsData);
      setBehavioral(behavioralData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading ML analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatternInsights = async (): Promise<PatternInsight[]> => {
    // This would call the actual ML service
    // const response = await mlAnalyticsService.getPatternInsights();
    
    // Mock data for demonstration
    return [
      {
        id: '1',
        type: 'productivity',
        severity: 'high',
        confidence: 0.92,
        title: 'Peak Performance Window Identified',
        description: 'Your productivity peaks between 9-11 AM with 40% higher task completion rates',
        recommendation: 'Schedule your most challenging tasks during this window',
        impact: 'Could increase daily productivity by 25%',
        timeframe: 'Immediate',
        metrics: { completionRate: 87, focusScore: 94, energyLevel: 89 },
        trend: 'improving',
        actionable: true
      },
      {
        id: '2',
        type: 'behavioral',
        severity: 'medium',
        confidence: 0.78,
        title: 'Deep Work Pattern Detected',
        description: 'You work best in 90-minute focused sessions with 15-minute breaks',
        recommendation: 'Use the Pomodoro technique with extended focus periods',
        impact: 'May reduce context switching by 35%',
        timeframe: 'This week',
        metrics: { sessionLength: 90, breakFrequency: 15, focusQuality: 82 },
        trend: 'stable',
        actionable: true
      },
      {
        id: '3',
        type: 'prediction',
        severity: 'low',
        confidence: 0.85,
        title: 'Goal Achievement Forecast',
        description: 'Based on current patterns, 78% likely to achieve monthly goals',
        recommendation: 'Increase task completion rate by 12% to reach 90% confidence',
        impact: 'Would ensure goal achievement with high confidence',
        timeframe: 'Next 2 weeks',
        metrics: { currentProgress: 68, requiredRate: 12, confidence: 78 },
        trend: 'improving',
        actionable: true
      },
      {
        id: '4',
        type: 'anomaly',
        severity: 'medium',
        confidence: 0.71,
        title: 'Stress Pattern Alert',
        description: 'Task completion drops 30% on Wednesdays, suggesting mid-week fatigue',
        recommendation: 'Consider lighter workload or wellness activities on Wednesdays',
        impact: 'Could prevent burnout and maintain consistent performance',
        timeframe: 'Ongoing',
        metrics: { wednesdayDrop: 30, stressLevel: 65, recoveryTime: 24 },
        trend: 'declining',
        actionable: true
      }
    ];
  };

  const loadProductivityPatterns = async (): Promise<ProductivityPattern[]> => {
    return [
      {
        pattern: 'Morning Sprint',
        frequency: 85,
        impact: 92,
        timeOfDay: ['9:00-11:00'],
        daysOfWeek: ['Monday', 'Tuesday', 'Thursday'],
        tasks: ['Analysis', 'Writing', 'Problem Solving'],
        confidence: 0.89,
        prediction: 'Continues for next 4 weeks'
      },
      {
        pattern: 'Afternoon Administrative',
        frequency: 67,
        impact: 74,
        timeOfDay: ['14:00-16:00'],
        daysOfWeek: ['Wednesday', 'Friday'],
        tasks: ['Email', 'Planning', 'Reviews'],
        confidence: 0.76,
        prediction: 'Stable pattern'
      }
    ];
  };

  const loadBehavioralAnalytics = async (): Promise<BehavioralAnalytics> => {
    return {
      workingStyle: 'focused_sprints',
      peakHours: ['9:00-11:00', '15:00-17:00'],
      averageSessionLength: 87,
      breakPatterns: ['15min every 90min', '30min lunch', '5min micro-breaks'],
      motivationTriggers: ['Progress tracking', 'Achievement badges', 'Team collaboration'],
      stressIndicators: ['Task switching', 'Long sessions', 'Late deadlines'],
      adaptabilityScore: 78,
      consistencyScore: 82
    };
  };

  const loadPredictiveModels = async (): Promise<PredictiveModel> => {
    return {
      goalAchievementProbability: 78,
      burnoutRisk: 23,
      optimalWorkload: 6.5,
      suggestedSchedule: [
        {
          timeSlot: '9:00-11:00',
          taskType: 'Complex Problem Solving',
          confidence: 0.92,
          reason: 'Peak cognitive performance window'
        },
        {
          timeSlot: '14:00-15:30',
          taskType: 'Administrative Tasks',
          confidence: 0.78,
          reason: 'Good for routine work after lunch'
        }
      ],
      performanceForecast: {
        nextWeek: 85,
        nextMonth: 82,
        factors: ['Consistent sleep schedule', 'Reduced meeting load', 'Improved focus techniques'],
        recommendations: ['Maintain current routine', 'Add 15min morning planning', 'Schedule difficult tasks earlier']
      }
    };
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      productivity: <TrendingUp className="h-5 w-5" />,
      behavioral: <Brain className="h-5 w-5" />,
      prediction: <Eye className="h-5 w-5" />,
      optimization: <Zap className="h-5 w-5" />,
      anomaly: <AlertTriangle className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons] || <Lightbulb className="h-5 w-5" />;
  };

  const getInsightColor = (type: string, severity: string) => {
    if (severity === 'high') return 'bg-red-50 border-red-200 text-red-800';
    if (severity === 'medium') return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getWorkingStyleBadge = (style: string) => {
    const styles = {
      focused_sprints: { label: 'Sprint Worker', color: 'bg-blue-100 text-blue-800', icon: <Zap className="h-3 w-3" /> },
      steady_pace: { label: 'Steady Performer', color: 'bg-green-100 text-green-800', icon: <Activity className="h-3 w-3" /> },
      burst_worker: { label: 'Burst Mode', color: 'bg-purple-100 text-purple-800', icon: <Flame className="h-3 w-3" /> },
      deep_work: { label: 'Deep Focus', color: 'bg-indigo-100 text-indigo-800', icon: <Brain className="h-3 w-3" /> }
    };
    const styleInfo = styles[style as keyof typeof styles];
    return (
      <Badge className={`${styleInfo.color} flex items-center gap-1`}>
        {styleInfo.icon}
        {styleInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Pattern Recognition</h2>
            <p className="text-gray-600">Discover insights from your productivity patterns</p>
          </div>
        </div>
        <Button onClick={loadMLAnalytics} variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="behavioral">Behavior</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getInsightColor(insight.type, insight.severity)}`}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-sm opacity-90">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(insight.trend)}
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confident
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{insight.impact}</span>
                  <span className="text-xs opacity-75">{insight.timeframe}</span>
                </div>
                
                <div className="mt-3 p-3 bg-white/50 rounded border">
                  <p className="text-sm font-medium mb-1">💡 Recommendation:</p>
                  <p className="text-sm">{insight.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {patterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pattern.pattern}</span>
                    <Badge variant="outline">{Math.round(pattern.confidence * 100)}% confidence</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{pattern.frequency}%</div>
                      <div className="text-sm text-gray-600">Frequency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{pattern.impact}%</div>
                      <div className="text-sm text-gray-600">Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{pattern.timeOfDay.join(', ')}</div>
                      <div className="text-sm text-gray-600">Time of Day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{pattern.daysOfWeek.join(', ')}</div>
                      <div className="text-sm text-gray-600">Days</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Optimal Tasks:</div>
                    <div className="flex flex-wrap gap-2">
                      {pattern.tasks.map((task, i) => (
                        <Badge key={i} variant="secondary">{task}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium mb-1">📈 Prediction:</div>
                    <div className="text-sm">{pattern.prediction}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-4">
          {behavioral && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Working Style Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Style:</span>
                      {getWorkingStyleBadge(behavioral.workingStyle)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Adaptability Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={behavioral.adaptabilityScore} className="flex-1" />
                          <span className="text-sm font-medium">{behavioral.adaptabilityScore}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Consistency Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={behavioral.consistencyScore} className="flex-1" />
                          <span className="text-sm font-medium">{behavioral.consistencyScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Peak Performance Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {behavioral.peakHours.map((hour, i) => (
                        <Badge key={i} className="mr-2">{hour}</Badge>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Average session: {behavioral.averageSessionLength} minutes
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Motivation Triggers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {behavioral.motivationTriggers.map((trigger, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Trophy className="h-3 w-3 text-yellow-600" />
                          <span className="text-sm">{trigger}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions && (
            <div className="grid gap-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {predictions.goalAchievementProbability}%
                    </div>
                    <div className="text-sm text-gray-600">Goal Achievement</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {predictions.burnoutRisk}%
                    </div>
                    <div className="text-sm text-gray-600">Burnout Risk</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {predictions.optimalWorkload}h
                    </div>
                    <div className="text-sm text-gray-600">Optimal Workload</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Suggested Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.suggestedSchedule.map((suggestion, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{suggestion.timeSlot}</div>
                          <div className="text-sm text-gray-600">{suggestion.taskType}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{Math.round(suggestion.confidence * 100)}%</Badge>
                          <div className="text-xs text-gray-600 mt-1">{suggestion.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Performance Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Next Week</span>
                          <span className="font-medium">{predictions.performanceForecast.nextWeek}%</span>
                        </div>
                        <Progress value={predictions.performanceForecast.nextWeek} />
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Next Month</span>
                          <span className="font-medium">{predictions.performanceForecast.nextMonth}%</span>
                        </div>
                        <Progress value={predictions.performanceForecast.nextMonth} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Key Factors:</div>
                      <div className="space-y-1">
                        {predictions.performanceForecast.factors.map((factor, i) => (
                          <div key={i} className="text-sm text-gray-600">• {factor}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                {getInsightIcon(selectedInsight.type)}
                <h3 className="text-lg font-bold">{selectedInsight.title}</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">{selectedInsight.description}</p>
                
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="font-medium text-blue-800 mb-1">Recommendation</div>
                  <div className="text-blue-700">{selectedInsight.recommendation}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{Math.round(selectedInsight.confidence * 100)}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{selectedInsight.severity.toUpperCase()}</div>
                    <div className="text-sm text-gray-600">Priority</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setSelectedInsight(null)} 
                className="w-full mt-4"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 