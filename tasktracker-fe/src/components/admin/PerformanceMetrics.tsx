'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Activity, 
  TrendingUp, 
  Zap, 
  Globe, 
  Users, 
  BarChart3, 
  Database 
} from 'lucide-react';
import { SecurityDashboard } from '@/lib/types/security';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface PerformanceMetricsProps {
  data: SecurityDashboard;
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps): React.ReactElement {
  const { performanceMetrics } = data || {};

  // Safety check - if data is not available, show loading state
  if (!data || !performanceMetrics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading performance metrics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely prepare chart data with fallbacks for undefined arrays
  const responseTimeData = (performanceMetrics?.responseTimeDistribution || []).map(metric => ({
    hour: new Date(metric?.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    responseTime: metric?.averageTime || 0,
    requests: metric?.requestCount || 0
  }));

  const endpointData = (performanceMetrics?.topEndpoints || []).map(endpoint => ({
    endpoint: (endpoint?.endpoint || 'Unknown').length > 20 ? (endpoint?.endpoint || 'Unknown').substring(0, 20) + '...' : (endpoint?.endpoint || 'Unknown'),
    requests: endpoint?.requestCount || 0,
    avgResponseTime: endpoint?.averageResponseTime || 0
  }));

  const userActivityData = (performanceMetrics?.topUsers || []).map(user => ({
    user: (user?.username || 'Unknown').length > 15 ? (user?.username || 'Unknown').substring(0, 15) + '...' : (user?.username || 'Unknown'),
    requests: user?.requestCount || 0,
    lastActivity: user?.lastActivity || new Date().toISOString()
  }));

  const errorRateData = (performanceMetrics?.statusCodeDistribution || []).map(status => ({
    name: `${status?.statusCode || 0} ${(status?.statusCode || 0) >= 200 && (status?.statusCode || 0) < 300 ? 'Success' : 
           (status?.statusCode || 0) >= 400 && (status?.statusCode || 0) < 500 ? 'Client Error' : 'Server Error'}`,
    value: status?.percentage || 0,
    color: (status?.statusCode || 0) >= 200 && (status?.statusCode || 0) < 300 ? '#10b981' : 
           (status?.statusCode || 0) >= 400 && (status?.statusCode || 0) < 500 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-900">
                  {performanceMetrics?.averageResponseTime || 0}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Requests/Hour</p>
                <p className="text-2xl font-bold text-green-900">
                  {((performanceMetrics?.requestsPerSecond || 0) * 3600).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Error Rate</p>
                <p className="text-2xl font-bold text-red-900">
                  {performanceMetrics?.errorRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Throughput</p>
                <p className="text-2xl font-bold text-purple-900">
                  {performanceMetrics?.requestsPerSecond || 0} req/s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Response Time Trends (24h)
          </CardTitle>
          <CardDescription>
            API response time and request volume over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responseTimeData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="right"
                  dataKey="requests" 
                  fill="#e0e7ff" 
                  name="Requests"
                  opacity={0.6}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Response Time (ms)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No response time data available</p>
                <p className="text-sm">Data will appear here once API requests are made</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Endpoints and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top API Endpoints
            </CardTitle>
            <CardDescription>
              Most frequently accessed endpoints and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {endpointData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={endpointData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="endpoint" type="category" width={100} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Requests']} />
                  <Bar dataKey="requests" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No endpoint data available</p>
                  <p className="text-sm">Endpoint usage will appear here once API requests are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top API Users
            </CardTitle>
            <CardDescription>
              Users with highest API usage and their performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userActivityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="user" type="category" width={100} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Requests']} />
                  <Bar dataKey="requests" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No user activity data available</p>
                  <p className="text-sm">User activity will appear here once API requests are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Rate Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              HTTP Status Code Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of HTTP response status codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorRateData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {errorRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No status code data available</p>
                  <p className="text-sm">HTTP status distribution will appear here once API requests are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
            <CardDescription>
              Database query performance and connection metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Average Query Time</span>
                <span className="text-lg font-bold text-blue-600">{performanceMetrics?.databaseMetrics?.averageQueryTime || 0}ms</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Active Connections</span>
                <span className="text-lg font-bold text-green-600">{performanceMetrics?.databaseMetrics?.connectionCount || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Slow Queries</span>
                <span className="text-lg font-bold text-yellow-600">{performanceMetrics?.databaseMetrics?.slowQueries || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Cache Hit Rate</span>
                <span className="text-lg font-bold text-purple-600">{performanceMetrics?.databaseMetrics?.cacheHitRate || 0}%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Active Transactions</span>
                <span className="text-lg font-bold text-indigo-600">{performanceMetrics?.databaseMetrics?.activeTransactions || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Endpoint Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Endpoint Performance Details
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for each API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(performanceMetrics?.topEndpoints || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {(performanceMetrics?.topEndpoints || []).map((endpoint, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {endpoint.endpoint}
                      </div>
                      <div className="text-sm text-gray-500">
                        GET
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {endpoint.requestCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {endpoint.averageResponseTime}ms
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {endpoint.errorRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        endpoint.errorRate < 1 ? 'bg-green-100 text-green-800' :
                        endpoint.errorRate < 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.errorRate < 1 ? 'Healthy' :
                         endpoint.errorRate < 5 ? 'Warning' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No endpoint performance data available</p>
              <p className="text-sm">Detailed endpoint metrics will appear here once API requests are made</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Performance Analysis
          </CardTitle>
          <CardDescription>
            Individual user API usage patterns and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(performanceMetrics?.topUsers || []).length > 0 ? (
          <div className="space-y-4">
              {(performanceMetrics?.topUsers || []).map((user, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{user.username}</h4>
                    <p className="text-sm text-gray-600">IP: {user.ipAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{user.requestCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">requests today</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Last Activity:</span>
                    <p className="font-medium">{new Date(user.lastActivity).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <p className="font-medium">{user.ipAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">User Agent:</span>
                      <p className="font-medium text-xs truncate" title={user.userAgent || ''}>
                        {(user.userAgent || '').length > 30 ? (user.userAgent || '').substring(0, 30) + '...' : (user.userAgent || 'Unknown')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No user performance data available</p>
              <p className="text-sm">User activity analysis will appear here once API requests are made</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 