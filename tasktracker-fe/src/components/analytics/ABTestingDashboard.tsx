'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings,
  Play,
  Pause,
  StopCircle,
  Users,
  Target,
  Zap,
  Eye,
  MousePointer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  type: 'ui_component' | 'feature_flag' | 'user_flow' | 'messaging' | 'performance';
  targetMetric: string;
  variants: ABVariant[];
  trafficSplit: number[];
  startDate: string;
  endDate?: string;
  participants: number;
  significance: number;
  confidence: number;
  winner?: string;
  results: ABTestResults;
  segmentation: UserSegment[];
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: { [key: string]: any };
  participants: number;
  conversions: number;
  conversionRate: number;
  metrics: { [key: string]: number };
}

interface ABTestResults {
  statistical_significance: number;
  confidence_level: number;
  expected_improvement: number;
  actual_improvement: number;
  risk_of_loss: number;
  time_to_significance: number;
  sample_size_achieved: number;
  sample_size_required: number;
}

interface UserSegment {
  name: string;
  criteria: string;
  percentage: number;
}

interface TestMetric {
  name: string;
  value: number;
  change: number;
  significance: number;
}

export function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    try {
      setLoading(true);
      // This would call the actual A/B testing service
      // const response = await abTestingService.getTests();
      
      // Mock data for demonstration
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'New Task Creation Flow',
          description: 'Testing simplified vs detailed task creation forms',
          status: 'running',
          type: 'user_flow',
          targetMetric: 'task_creation_completion',
          variants: [
            {
              id: 'control',
              name: 'Current Flow',
              description: 'Existing multi-step form',
              config: { steps: 3, validation: 'strict' },
              participants: 1247,
              conversions: 891,
              conversionRate: 71.4,
              metrics: { completion_time: 84, satisfaction: 3.2 }
            },
            {
              id: 'variant_a',
              name: 'Simplified Flow',
              description: 'Single-step form with smart defaults',
              config: { steps: 1, validation: 'minimal' },
              participants: 1298,
              conversions: 1076,
              conversionRate: 82.9,
              metrics: { completion_time: 32, satisfaction: 4.1 }
            }
          ],
          trafficSplit: [50, 50],
          startDate: '2025-01-10',
          participants: 2545,
          significance: 95.2,
          confidence: 98.7,
          winner: 'variant_a',
          results: {
            statistical_significance: 95.2,
            confidence_level: 98.7,
            expected_improvement: 15,
            actual_improvement: 11.5,
            risk_of_loss: 1.3,
            time_to_significance: 7,
            sample_size_achieved: 2545,
            sample_size_required: 2000
          },
          segmentation: [
            { name: 'New Users', criteria: 'account_age < 30 days', percentage: 35 },
            { name: 'Power Users', criteria: 'tasks_created > 100', percentage: 25 },
            { name: 'Regular Users', criteria: 'default', percentage: 40 }
          ]
        },
        {
          id: '2',
          name: 'Gamification Badge Display',
          description: 'Testing different badge notification styles',
          status: 'completed',
          type: 'ui_component',
          targetMetric: 'engagement_rate',
          variants: [
            {
              id: 'control',
              name: 'Subtle Notifications',
              description: 'Small badge in corner',
              config: { style: 'minimal', animation: false },
              participants: 1834,
              conversions: 734,
              conversionRate: 40.0,
              metrics: { click_through: 12.3, time_engaged: 45 }
            },
            {
              id: 'variant_a',
              name: 'Prominent Celebrations',
              description: 'Full-screen achievement modal',
              config: { style: 'celebration', animation: true },
              participants: 1891,
              conversions: 1023,
              conversionRate: 54.1,
              metrics: { click_through: 24.7, time_engaged: 67 }
            }
          ],
          trafficSplit: [50, 50],
          startDate: '2025-01-05',
          endDate: '2025-01-15',
          participants: 3725,
          significance: 99.1,
          confidence: 99.8,
          winner: 'variant_a',
          results: {
            statistical_significance: 99.1,
            confidence_level: 99.8,
            expected_improvement: 20,
            actual_improvement: 14.1,
            risk_of_loss: 0.2,
            time_to_significance: 5,
            sample_size_achieved: 3725,
            sample_size_required: 3000
          },
          segmentation: []
        },
        {
          id: '3',
          name: 'Dashboard Layout Optimization',
          description: 'Comparing grid vs list layout for task overview',
          status: 'draft',
          type: 'ui_component',
          targetMetric: 'user_satisfaction',
          variants: [
            {
              id: 'control',
              name: 'Grid Layout',
              description: 'Card-based grid display',
              config: { layout: 'grid', columns: 3 },
              participants: 0,
              conversions: 0,
              conversionRate: 0,
              metrics: {}
            },
            {
              id: 'variant_a',
              name: 'List Layout',
              description: 'Dense list with actions',
              config: { layout: 'list', density: 'compact' },
              participants: 0,
              conversions: 0,
              conversionRate: 0,
              metrics: {}
            }
          ],
          trafficSplit: [50, 50],
          startDate: '2025-01-20',
          participants: 0,
          significance: 0,
          confidence: 0,
          results: {
            statistical_significance: 0,
            confidence_level: 0,
            expected_improvement: 0,
            actual_improvement: 0,
            risk_of_loss: 0,
            time_to_significance: 0,
            sample_size_achieved: 0,
            sample_size_required: 2500
          },
          segmentation: []
        }
      ];
      
      setTests(mockTests);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'draft': return <Settings className="h-3 w-3" />;
      case 'archived': return <StopCircle className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return 'text-green-600';
    if (significance >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTests = tests.filter(test => 
    filterStatus === 'all' || test.status === filterStatus
  );

  const renderTestCard = (test: ABTest) => (
    <motion.div
      key={test.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={() => setSelectedTest(test)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FlaskConical className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{test.name}</h3>
            <p className="text-sm text-gray-600">{test.description}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(test.status)} flex items-center gap-1`}>
          {getStatusIcon(test.status)}
          {test.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold">{test.participants.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Participants</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getSignificanceColor(test.significance)}`}>
            {test.significance.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Significance</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">
            {test.winner ? 
              test.variants.find(v => v.id === test.winner)?.name || 'TBD' : 
              'TBD'
            }
          </div>
          <div className="text-xs text-gray-600">Winner</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">
            {test.results.actual_improvement > 0 ? '+' : ''}
            {test.results.actual_improvement.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Improvement</div>
        </div>
      </div>

      {test.status === 'running' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to significance</span>
            <span>{((test.results.sample_size_achieved / test.results.sample_size_required) * 100).toFixed(0)}%</span>
          </div>
          <Progress value={(test.results.sample_size_achieved / test.results.sample_size_required) * 100} />
        </div>
      )}
    </motion.div>
  );

  const renderTestDetails = (test: ABTest) => {
    const chartData = {
      labels: test.variants.map(v => v.name),
      datasets: [
        {
          label: 'Conversion Rate',
          data: test.variants.map(v => v.conversionRate),
          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Conversion Rate by Variant',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return value + '%';
            }
          }
        },
      },
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{test.name}</h2>
            <p className="text-gray-600">{test.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(test.status)} flex items-center gap-1`}>
              {getStatusIcon(test.status)}
              {test.status.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setSelectedTest(null)}>
              ← Back
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Statistical Significance</span>
                      <span className={`font-semibold ${getSignificanceColor(test.results.statistical_significance)}`}>
                        {test.results.statistical_significance.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Confidence Level</span>
                      <span className="font-semibold">{test.results.confidence_level.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Actual Improvement</span>
                      <span className={`font-semibold ${test.results.actual_improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {test.results.actual_improvement > 0 ? '+' : ''}{test.results.actual_improvement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk of Loss</span>
                      <span className="font-semibold text-orange-600">{test.results.risk_of_loss.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar data={chartData} options={chartOptions} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Variant Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {test.variants.map((variant) => (
                    <div key={variant.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{variant.name}</h4>
                          {test.winner === variant.id && (
                            <Badge className="bg-green-100 text-green-800">Winner</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{variant.conversionRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Conversion Rate</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Participants:</span>
                          <span className="font-medium ml-2">{variant.participants.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversions:</span>
                          <span className="font-medium ml-2">{variant.conversions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Traffic Split:</span>
                          <span className="font-medium ml-2">{test.trafficSplit[test.variants.indexOf(variant)]}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <div className="grid gap-6">
              {test.variants.map((variant) => (
                <Card key={variant.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{variant.name}</span>
                      {test.winner === variant.id && (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Winner
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{variant.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Configuration</h5>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <pre>{JSON.stringify(variant.config, null, 2)}</pre>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Performance Metrics</h5>
                        <div className="space-y-2">
                          {Object.entries(variant.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{test.participants.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{test.results.time_to_significance}</div>
                  <div className="text-sm text-gray-600">Days to Significance</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{test.targetMetric.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600">Primary Metric</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Sample Size Progress</span>
                        <span>{((test.results.sample_size_achieved / test.results.sample_size_required) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(test.results.sample_size_achieved / test.results.sample_size_required) * 100} />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{test.results.sample_size_achieved.toLocaleString()} achieved</span>
                        <span>{test.results.sample_size_required.toLocaleString()} required</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Expected Improvement:</span>
                      <span className="font-medium">{test.results.expected_improvement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual Improvement:</span>
                      <span className={`font-medium ${test.results.actual_improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {test.results.actual_improvement > 0 ? '+' : ''}{test.results.actual_improvement}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statistical Power:</span>
                      <span className="font-medium">80%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            {test.segmentation.length > 0 ? (
              <div className="space-y-4">
                {test.segmentation.map((segment, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{segment.name}</h4>
                        <Badge variant="outline">{segment.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{segment.criteria}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Segmentation</h3>
                  <p className="text-gray-600">This test runs on all users without segmentation.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
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

  if (selectedTest) {
    return renderTestDetails(selectedTest);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">A/B Testing Dashboard</h2>
            <p className="text-gray-600">Experiment with features and measure impact</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadABTests} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredTests.map(renderTestCard)}
      </div>

      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FlaskConical className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No A/B Tests Found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' 
                ? 'Start experimenting by creating your first A/B test'
                : `No tests found with status: ${filterStatus}`
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 