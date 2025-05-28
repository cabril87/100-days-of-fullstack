'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Lock
} from 'lucide-react';
import { SecurityDashboard } from '@/lib/types/security';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

interface SecurityOverviewProps {
  data: SecurityDashboard;
}

export function SecurityOverview({ data }: SecurityOverviewProps): React.ReactElement {
  const { overview, securityMetrics, auditLogs } = data;

  // Safety check - if overview is not available, show loading state
  if (!overview) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading security overview...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate security status color
  const getSecurityStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityStatusBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Prepare chart data using real data
  const requestsData = [
    { name: 'Successful', value: overview?.successfulRequests || 0, color: '#10b981' },
    { name: 'Blocked', value: overview?.blockedRequests || 0, color: '#ef4444' },
  ];

  const securityFeaturesData = (overview?.securityFeatures || []).map(feature => ({
    feature: feature.name || 'Unknown Feature',
    enabled: feature.enabled ?? true,
    status: feature.status || 'active',
    description: feature.description || ''
  }));

  // Recent metrics for trend chart using real data
  const recentMetrics = (securityMetrics || []).slice(-7).map(metric => ({
    date: new Date(metric.timestamp).toLocaleDateString(),
    value: metric.value,
    type: metric.metricType
  }));

  // Get security status text
  const getSecurityStatusText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Security Score Card */}
      <Card className={`${getSecurityStatusBg(overview.securityScore)} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className={`h-6 w-6 ${getSecurityStatusColor(overview.securityScore)}`} />
            Security Score Overview
          </CardTitle>
          <CardDescription>
            Overall security posture and system protection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Current Score</span>
              <span className={`text-3xl font-bold ${getSecurityStatusColor(overview.securityScore)}`}>
                {overview.securityScore}/100
              </span>
            </div>
            
            <Progress 
              value={overview.securityScore} 
              className="h-3"
            />
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                overview.securityScore >= 90 ? 'bg-green-100 text-green-800' :
                overview.securityScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getSecurityStatusText(overview.securityScore)}
              </div>
              <span className="text-sm text-gray-600">
                Last updated: {new Date(overview.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid - Gamification Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Total Requests (24h)</p>
                <p className="text-3xl font-black text-blue-900 tracking-tight">
                  {(overview?.totalRequests || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-blue-700">LIVE</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 via-red-100 to-rose-100 border-red-200 hover:border-red-300 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-800">Blocked Requests</p>
                <p className="text-3xl font-black text-red-900 tracking-tight">
                  {(overview?.blockedRequests || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-red-700">THREATS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Suspicious Activities</p>
                <p className="text-3xl font-black text-amber-900 tracking-tight">
                  {overview?.suspiciousActivity || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-amber-700">ALERTS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">Active Users</p>
                <p className="text-3xl font-black text-green-900 tracking-tight">
                  {overview?.activeUsers || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-green-700">ONLINE</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Request Distribution (24h)
            </CardTitle>
            <CardDescription>
              Breakdown of successful vs blocked requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {requestsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Requests']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Security Features Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Features Status
            </CardTitle>
            <CardDescription>
              Current status of security protection mechanisms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityFeaturesData.length > 0 ? (
                securityFeaturesData.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Lock className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold text-gray-900">{feature.feature}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feature.status === 'active' ? 'bg-green-100 text-green-800' :
                          feature.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {feature.status}
                        </span>
                      </div>
                      {feature.description && (
                        <p className="text-sm text-gray-600 ml-7">{feature.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {feature.enabled ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-medium text-red-600">Disabled</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No security features configured</p>
                  <p className="text-sm">Security features will appear here once configured</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Metrics Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Metrics Trend (7 days)
          </CardTitle>
          <CardDescription>
            Recent security metrics and threat detection patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentMetrics}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Security Events" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health Status
          </CardTitle>
          <CardDescription>
            Overall system health and security status indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              overview.systemHealth === 'healthy' ? 'bg-green-50 border-green-200' :
              overview.systemHealth === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {overview.systemHealth === 'healthy' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : overview.systemHealth === 'warning' ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">System Health</h3>
                  <p className={`text-sm ${
                    overview.systemHealth === 'healthy' ? 'text-green-700' :
                    overview.systemHealth === 'warning' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {overview.systemHealth.charAt(0).toUpperCase() + overview.systemHealth.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Security Score</h3>
                  <p className="text-sm text-blue-700">{overview.securityScore}/100</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg">Active Users</h3>
                  <p className="text-sm text-purple-700">{overview.activeUsers} online</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Security Activity
          </CardTitle>
          <CardDescription>
            Latest security events and audit log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(overview.recentActivity || []).slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  log.isSuspicious ? 'bg-red-100' : 
                  log.isSuccessful ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {log.isSuspicious ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : log.isSuccessful ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.eventType}</p>
                  <p className="text-xs text-gray-600">
                    {log.username} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.severity === 'high' ? 'bg-red-100 text-red-800' :
                  log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {log.severity}
                </div>
              </div>
            ))}
            {(overview.recentActivity || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No recent security activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 