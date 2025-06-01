'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon
} from 'lucide-react';
import { BackgroundServiceMetrics, ServiceMetric } from '@/lib/services/backgroundServiceService';

interface ServiceMetricsChartProps {
  metrics: BackgroundServiceMetrics;
  height?: number;
}

type ChartType = 'bar' | 'line' | 'area' | 'pie';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

export function ServiceMetricsChart({ 
  metrics, 
  height = 400 
}: ServiceMetricsChartProps): React.ReactElement {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [metric, setMetric] = useState<'successRate' | 'executionCount' | 'errorCount'>('successRate');

  const getChartData = () => {
    return metrics.serviceMetrics.map(service => ({
      name: service.serviceName.replace('Service', ''), // Shorten service names
      successRate: Math.round(service.successRate * 100) / 100,
      executionCount: service.executionCount,
      errorCount: service.errorCount,
      successCount: service.successCount,
      status: service.status
    }));
  };

  const getAggregatedData = () => {
    const total = metrics.totalExecutions;
    return [
      {
        name: 'Successful',
        value: metrics.successfulExecutions,
        percentage: total > 0 ? Math.round((metrics.successfulExecutions / total) * 100) : 0,
        color: '#10b981'
      },
      {
        name: 'Failed',
        value: metrics.failedExecutions,
        percentage: total > 0 ? Math.round((metrics.failedExecutions / total) * 100) : 0,
        color: '#ef4444'
      }
    ];
  };

  const getStatusData = () => {
    return [
      {
        name: 'Running',
        value: metrics.runningServices,
        color: '#10b981'
      },
      {
        name: 'Error',
        value: metrics.errorServices,
        color: '#ef4444'
      },
      {
        name: 'Idle',
        value: metrics.idleServices,
        color: '#3b82f6'
      }
    ];
  };

  const renderChart = () => {
    const data = getChartData();

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value, 
                name
              ]}
            />
            <Legend />
            {metric === 'successRate' && (
              <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
            )}
            {metric === 'executionCount' && (
              <>
                <Bar dataKey="successCount" fill="#10b981" name="Successful" />
                <Bar dataKey="errorCount" fill="#ef4444" name="Errors" />
              </>
            )}
            {metric === 'errorCount' && (
              <Bar dataKey="errorCount" fill="#ef4444" name="Error Count" />
            )}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={metric} 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name={metric === 'successRate' ? 'Success Rate %' : 
                    metric === 'executionCount' ? 'Execution Count' : 'Error Count'}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="successCount" 
              stackId="1"
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
              name="Successful"
            />
            <Area 
              type="monotone" 
              dataKey="errorCount" 
              stackId="1"
              stroke="#ef4444" 
              fill="#ef4444"
              fillOpacity={0.6}
              name="Errors"
            />
          </AreaChart>
        );

      case 'pie':
        const pieData = getAggregatedData();
        return (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </div>
            <div className="space-y-3">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.value.toLocaleString()} ({item.percentage}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'line':
        return <TrendingUp className="h-4 w-4" />;
      case 'area':
        return <AreaChartIcon className="h-4 w-4" />;
      case 'pie':
        return <PieChartIcon className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <div>
              <CardTitle>Service Performance Metrics</CardTitle>
              <CardDescription>
                Visual analysis of background service execution statistics
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Chart:</span>
              <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {chartType !== 'pie' && chartType !== 'area' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Metric:</span>
                <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successRate">Success Rate</SelectItem>
                    <SelectItem value="executionCount">Executions</SelectItem>
                    <SelectItem value="errorCount">Errors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Success Rate</p>
            <p className="text-xl font-bold text-green-700">
              {metrics.overallSuccessRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Executions</p>
            <p className="text-xl font-bold text-blue-700">
              {metrics.totalExecutions.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-medium">Failed</p>
            <p className="text-xl font-bold text-red-700">
              {metrics.failedExecutions.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Services</p>
            <p className="text-xl font-bold text-gray-700">
              {metrics.totalServices}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Service Status Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold mb-3">Service Status Distribution</h4>
          <div className="flex flex-wrap gap-3">
            {getStatusData().map((status, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="flex items-center gap-2 px-3 py-1"
                style={{ borderColor: status.color, color: status.color }}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                {status.name}: {status.value}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top Performing Services */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold mb-3">Top Performing Services</h4>
          <div className="space-y-2">
            {metrics.serviceMetrics
              .sort((a, b) => b.successRate - a.successRate)
              .slice(0, 3)
              .map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"}
                      className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{service.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600 font-medium">
                      {service.successRate.toFixed(1)}%
                    </span>
                    <span className="text-gray-500">
                      {service.executionCount} runs
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 