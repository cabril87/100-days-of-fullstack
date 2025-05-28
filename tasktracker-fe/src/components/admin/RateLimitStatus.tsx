'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react';
import { SecurityDashboard } from '@/lib/types/security';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RateLimitStatusProps {
  data: SecurityDashboard;
}

export function RateLimitStatus({ data }: RateLimitStatusProps): React.ReactElement {
  const { rateLimitStatus } = data;

  // Safety check - if data is not available, show loading state
  if (!data || !rateLimitStatus) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading rate limit status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get status color based on usage percentage
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };



  // Prepare chart data for top users
  const topUsersData = (rateLimitStatus?.topUsers || []).map(user => ({
    email: user.username.length > 20 ? user.username.substring(0, 20) + '...' : user.username,
    requests: user.requestCount,
    percentage: (user.requestCount / Math.max(...(rateLimitStatus?.topUsers || []).map(u => u.requestCount), 1)) * 100
  }));

  // Circuit breaker status data
  const circuitBreakerStatusData = [
    { 
      name: 'Closed', 
      value: (rateLimitStatus?.circuitBreakers || []).filter(cb => cb.state === 'closed').length,
      color: '#10b981'
    },
    { 
      name: 'Open', 
      value: (rateLimitStatus?.circuitBreakers || []).filter(cb => cb.state === 'open').length,
      color: '#ef4444'
    },
    { 
      name: 'Half-Open', 
      value: (rateLimitStatus?.circuitBreakers || []).filter(cb => cb.state === 'half-open').length,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Rate Limiting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Active Configurations</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(rateLimitStatus?.globalLimits || []).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Monitored Users</p>
                <p className="text-2xl font-bold text-green-900">
                  {(rateLimitStatus?.topUsers || []).length}
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
                <p className="text-sm font-medium text-purple-800">Circuit Breakers</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(rateLimitStatus?.circuitBreakers || []).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Configurations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rate Limit Configurations
          </CardTitle>
          <CardDescription>
            Current rate limiting rules and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(rateLimitStatus?.globalLimits || []).map((config, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{config.endpoint}</h4>
                    <p className="text-sm text-gray-600">{config.window}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    config.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                    config.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {config.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Rate Limit:</span>
                    <p className="font-medium">{config.limit} req/{config.window}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Usage:</span>
                    <p className="font-medium">{config.currentUsage}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className={`font-medium ${
                      config.status === 'healthy' ? 'text-green-600' : 
                      config.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {config.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Request Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Users by API Usage
            </CardTitle>
            <CardDescription>
              Users with highest API usage in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(rateLimitStatus?.topUsers || []).length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topUsersData} layout="horizontal">
                    <XAxis type="number" />
                    <YAxis dataKey="email" type="category" width={120} />
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), 'API Calls']} />
                    <Bar dataKey="requests" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No user activity data available</p>
                  <p className="text-sm">User API usage will appear here once requests are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Circuit Breaker Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Circuit Breaker Status
            </CardTitle>
            <CardDescription>
              Current state of circuit breakers protecting the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={circuitBreakerStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {circuitBreakerStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Quota Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Quota Status
          </CardTitle>
          <CardDescription>
            Individual user quota usage and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(rateLimitStatus?.userQuotas || []).length > 0 ? (
            <div className="space-y-4">
              {(rateLimitStatus?.userQuotas || []).map((user, index) => {
                const apiCallsToday = user.apiCallsUsedToday || 0;
                const dailyLimit = user.dailyLimit || 1000;
                const usagePercentage = (apiCallsToday / dailyLimit) * 100;
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.username || 'Unknown'}</h4>
                        <p className="text-sm text-gray-600">
                          Last Request: {user.lastRequestTime ? new Date(user.lastRequestTime).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === 'exceeded' ? 'bg-red-100 text-red-800' : 
                        user.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.status || 'normal'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-gray-600">API Calls Today:</span>
                        <p className="font-medium">{apiCallsToday.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Daily Limit:</span>
                        <p className="font-medium">{dailyLimit.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Usage:</span>
                        <p className={`font-medium ${getUsageColor(usagePercentage)}`}>
                          {usagePercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Quota Usage</span>
                        <span className={`text-xs font-medium ${getUsageColor(usagePercentage)}`}>
                          {usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No user quota data available</p>
              <p className="text-sm">User quota information will appear here once users make API requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Circuit Breaker Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Circuit Breaker Details
          </CardTitle>
          <CardDescription>
            Individual circuit breaker status and failure information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(rateLimitStatus?.circuitBreakers || []).map((breaker, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{breaker.name || 'Unknown'}</h4>
                    <p className="text-sm text-gray-600">Circuit Breaker</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(breaker.state || 'closed') === 'closed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (breaker.state || 'closed') === 'open' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (breaker.state || 'closed') === 'closed' ? 'bg-green-100 text-green-800' :
                      (breaker.state || 'closed') === 'open' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {breaker.state || 'closed'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">State:</span>
                    <p className="font-medium">{breaker.state || 'unknown'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Failure Count:</span>
                    <p className="font-medium">{breaker.failureCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Failure:</span>
                    <p className="font-medium">
                      {breaker.lastFailureTime ? new Date(breaker.lastFailureTime).toLocaleString() : 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Retry:</span>
                    <p className="font-medium">
                      {breaker.nextAttemptTime ? new Date(breaker.nextAttemptTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rate Limiting Statistics
          </CardTitle>
          <CardDescription>
            Overall rate limiting performance and blocking statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {(rateLimitStatus?.globalLimits || []).length}
              </div>
              <div className="text-sm text-blue-800 font-medium">Active Limits</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(rateLimitStatus?.userQuotas || []).length}
              </div>
              <div className="text-sm text-green-800 font-medium">Monitored Users</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(rateLimitStatus?.circuitBreakers || []).filter(cb => (cb?.state || 'closed') === 'closed').length}
              </div>
              <div className="text-sm text-purple-800 font-medium">Healthy Circuit Breakers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 