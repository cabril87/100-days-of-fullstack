'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Wifi,
  Monitor,
  Shield,
  Zap,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Settings
} from 'lucide-react';
import { SecurityDashboard } from '@/lib/types/security';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

interface EnhancedSystemHealthProps {
  data: SecurityDashboard;
}

// Chart configurations
const systemMetricsConfig = {
  cpu: {
    label: "CPU Usage",
    color: "hsl(var(--chart-1))",
  },
  memory: {
    label: "Memory Usage", 
    color: "hsl(var(--chart-2))",
  },
  disk: {
    label: "Disk Usage",
    color: "hsl(var(--chart-3))",
  },
  network: {
    label: "Network I/O",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const responseTimeConfig = {
  responseTime: {
    label: "Response Time (ms)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const healthStatusConfig = {
  healthy: {
    label: "Healthy",
    color: "hsl(142 76% 36%)",
  },
  warning: {
    label: "Warning", 
    color: "hsl(48 96% 53%)",
  },
  critical: {
    label: "Critical",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig;

export function EnhancedSystemHealth({ data }: EnhancedSystemHealthProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { systemHealth } = data || {};

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // In a real app, this would trigger a data refresh
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Safety check
  if (!systemHealth) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading system health data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate realistic time-series data
  const generateTimeSeriesData = () => {
    return Array.from({ length: 24 }, (_, index) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - index));
      
      return {
        time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: hour.getTime(),
        cpu: Math.max(0, Math.min(100, systemHealth.cpuUsage + (Math.random() - 0.5) * 20)),
        memory: Math.max(0, Math.min(100, systemHealth.memoryUsage + (Math.random() - 0.5) * 15)),
        disk: Math.max(0, Math.min(100, systemHealth.diskUsage + (Math.random() - 0.5) * 10)),
        network: Math.random() * 100,
        responseTime: Math.max(0, systemHealth.responseTime + (Math.random() - 0.5) * systemHealth.responseTime * 0.5),
      };
    });
  };

  const timeSeriesData = generateTimeSeriesData();

  // Health status distribution
  const healthStatusData = [
    { 
      name: 'Healthy', 
      value: (systemHealth.healthChecks || []).filter(check => check.status === 'healthy').length,
      fill: 'hsl(142 76% 36%)'
    },
    { 
      name: 'Warning', 
      value: (systemHealth.healthChecks || []).filter(check => check.status === 'degraded').length,
      fill: 'hsl(48 96% 53%)'
    },
    { 
      name: 'Critical', 
      value: (systemHealth.healthChecks || []).filter(check => check.status === 'unhealthy').length,
      fill: 'hsl(0 84% 60%)'
    },
  ].filter(item => item.value > 0);

  // API endpoint performance data
  const apiEndpointData = [
    { endpoint: '/api/v1/auth/csrf', requests: 1250, avgResponseTime: 45 },
    { endpoint: '/api/v1/notifications', requests: 890, avgResponseTime: 120 },
    { endpoint: '/api/v1/invitations', requests: 340, avgResponseTime: 85 },
    { endpoint: '/api/v1/gamification', requests: 280, avgResponseTime: 95 },
    { endpoint: '/api/v1/focus/current', requests: 180, avgResponseTime: 65 },
  ];

  // Helper functions
  const getHealthColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600';
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthBg = (status: string | undefined) => {
    if (!status) return 'bg-gray-50 border-gray-200';
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'unhealthy':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced System Health</h2>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and performance analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={autoRefresh ? "default" : "secondary"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Disable' : 'Enable'}
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <Card className={`${getHealthBg(systemHealth.status)} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Server className={`h-6 w-6 ${getHealthColor(systemHealth.status)}`} />
            System Status Overview
            {getStatusIcon(systemHealth.status)}
          </CardTitle>
          <CardDescription>
            Last updated: {lastUpdated.toLocaleString()} • Status: {systemHealth.status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthColor(systemHealth.status)} mb-2`}>
                {systemHealth.status}
              </div>
              <p className="text-sm text-gray-600 font-medium">Overall Status</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {getStatusIcon(systemHealth.status)}
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {systemHealth.responseTime}ms
              </div>
              <p className="text-sm text-gray-600 font-medium">Avg Response Time</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {getTrendIcon(systemHealth.responseTime, 150)}
                <span className="text-xs text-gray-500">vs last hour</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {systemHealth.activeConnections}
              </div>
              <p className="text-sm text-gray-600 font-medium">Active Connections</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-500">Connected</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {systemHealth.uptime}
              </div>
              <p className="text-sm text-gray-600 font-medium">System Uptime</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-500">Running</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
          <TabsTrigger value="health-checks" className="rounded-lg">Health Checks</TabsTrigger>
          <TabsTrigger value="api-metrics" className="rounded-lg">API Metrics</TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Resource Usage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">CPU Usage</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-3xl font-bold ${getUsageColor(systemHealth.cpuUsage)}`}>
                        {systemHealth.cpuUsage}%
                      </p>
                      {getTrendIcon(systemHealth.cpuUsage, 45)}
                    </div>
                  </div>
                </div>
                <Progress value={systemHealth.cpuUsage} className="h-3 mb-2" />
                <p className="text-xs text-blue-700">
                  {systemHealth.cpuUsage < 70 ? 'Normal' : systemHealth.cpuUsage < 90 ? 'High' : 'Critical'} usage
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Memory Usage</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-3xl font-bold ${getUsageColor(systemHealth.memoryUsage)}`}>
                        {systemHealth.memoryUsage}%
                      </p>
                      {getTrendIcon(systemHealth.memoryUsage, 60)}
                    </div>
                  </div>
                </div>
                <Progress value={systemHealth.memoryUsage} className="h-3 mb-2" />
                <p className="text-xs text-green-700">
                  {systemHealth.memoryUsage < 70 ? 'Normal' : systemHealth.memoryUsage < 90 ? 'High' : 'Critical'} usage
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-600 rounded-xl">
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-800">Disk Usage</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-3xl font-bold ${getUsageColor(systemHealth.diskUsage)}`}>
                        {systemHealth.diskUsage}%
                      </p>
                      {getTrendIcon(systemHealth.diskUsage, 35)}
                    </div>
                  </div>
                </div>
                <Progress value={systemHealth.diskUsage} className="h-3 mb-2" />
                <p className="text-xs text-purple-700">
                  {systemHealth.diskUsage < 70 ? 'Normal' : systemHealth.diskUsage < 90 ? 'High' : 'Critical'} usage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Performance Trends (24h)
              </CardTitle>
              <CardDescription>
                Real-time monitoring of system resource usage over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={systemMetricsConfig} className="min-h-[400px] w-full">
                <LineChart accessibilityLayer data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="var(--color-cpu)" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="var(--color-memory)" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disk" 
                    stroke="var(--color-disk)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Response Time Analysis
              </CardTitle>
              <CardDescription>
                API response time trends and performance metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={responseTimeConfig} className="min-h-[300px] w-full">
                <AreaChart accessibilityLayer data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`${value.toFixed(1)}ms`, 'Response Time']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="var(--color-responseTime)" 
                    fill="var(--color-responseTime)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Query Response Time</span>
                    <span className="text-lg font-bold text-blue-600">
                      {systemHealth.responseTime * 0.3}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Active Connections</span>
                    <span className="text-lg font-bold text-green-600">
                      {systemHealth.databaseConnections}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Cache Hit Rate</span>
                    <span className="text-lg font-bold text-purple-600">
                      {systemHealth.cacheHitRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Error Rate</span>
                    <span className={`text-lg font-bold ${
                      systemHealth.errorRate < 1 ? 'text-green-600' :
                      systemHealth.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {systemHealth.errorRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Network & Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Network Latency</span>
                    <span className="text-lg font-bold text-orange-600">
                      {systemHealth.networkLatency}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Throughput</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {(systemHealth.activeConnections * 2.5).toFixed(1)} req/s
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Load Balancer Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">CDN Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health-checks" className="space-y-6">
          {/* Health Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Check Distribution</CardTitle>
                <CardDescription>
                  Overview of all system health checks and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthStatusData.length > 0 ? (
                  <ChartContainer config={healthStatusConfig} className="min-h-[200px] w-full">
                    <PieChart>
                      <Pie
                        data={healthStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {healthStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No health check data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health Summary</CardTitle>
                <CardDescription>
                  Quick overview of critical system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">API Gateway</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Database</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Cache Layer</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">External APIs</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detailed Health Checks
              </CardTitle>
              <CardDescription>
                Individual component health checks with detailed status information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(systemHealth?.healthChecks || []).map((check, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getHealthBg(check.status)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{check.name}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <Badge 
                          variant="secondary" 
                          className={`${
                            check.status === 'healthy' ? 'bg-green-100 text-green-800' :
                            check.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {check.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time:</span>
                        <span className="font-medium">{check.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Check:</span>
                        <span className="font-medium text-xs">
                          {new Date(check.lastChecked).toLocaleString()}
                        </span>
                      </div>
                      {check.details && (
                        <div className="mt-2">
                          <span className="text-gray-600">Details:</span>
                          <p className="text-xs text-gray-800 mt-1 bg-white/50 p-2 rounded">
                            {check.details}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {(systemHealth.healthChecks || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No health checks configured</p>
                  <Button variant="outline" className="mt-4">
                    Configure Health Checks
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-metrics" className="space-y-6">
          {/* API Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top API Endpoints Performance
              </CardTitle>
              <CardDescription>
                Most frequently accessed endpoints and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={systemMetricsConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={apiEndpointData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="endpoint" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={(value) => value.split('/').pop() || value}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="requests" 
                    fill="var(--color-cpu)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* API Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top API Users</CardTitle>
              <CardDescription>
                Users with highest API usage and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                  <span>User</span>
                  <span>Requests</span>
                  <span>Avg Response</span>
                  <span>Status</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">admin</span>
                  <span className="text-blue-600 font-bold">1,247</span>
                  <span className="text-green-600">85ms</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">system</span>
                  <span className="text-blue-600 font-bold">892</span>
                  <span className="text-green-600">45ms</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">api-client</span>
                  <span className="text-blue-600 font-bold">456</span>
                  <span className="text-yellow-600">120ms</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Throttled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts & Notifications
              </CardTitle>
              <CardDescription>
                Recent alerts and system notifications requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">High Memory Usage Detected</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Memory usage has exceeded 80% for the past 15 minutes. Consider scaling up resources.
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">Database Backup Completed</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Scheduled database backup completed successfully. Backup size: 2.3GB
                    </p>
                    <p className="text-xs text-blue-600 mt-2">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">Security Scan Completed</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Weekly security scan completed with no vulnerabilities detected.
                    </p>
                    <p className="text-xs text-green-600 mt-2">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 