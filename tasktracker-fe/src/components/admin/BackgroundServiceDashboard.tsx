'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Bell,
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Cpu,
  Server,
  AlertCircle,
  Plus,
  History,
  BarChart3,
  Shield,
  Eye,
  Filter
} from 'lucide-react';
import { 
  backgroundServiceService, 
  BackgroundServiceStatus, 
  BackgroundServiceExecution,
  SystemMaintenanceNotification,
  CreateMaintenanceNotification,
  SystemOptimizationRecommendation,
  BackgroundServiceMetrics,
  ServiceHealthSummary
} from '@/lib/services/backgroundServiceService';
import { useAuth } from '@/lib/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { ServiceHealthIndicator } from './ServiceHealthIndicator';
import { MaintenanceNotificationCard } from './MaintenanceNotificationCard';
import { ServiceMetricsChart } from './ServiceMetricsChart';

export function BackgroundServiceDashboard(): React.ReactElement {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Data states
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthSummary | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<BackgroundServiceStatus[]>([]);
  const [filteredServices, setFilteredServices] = useState<BackgroundServiceStatus[]>([]);
  const [maintenanceNotifications, setMaintenanceNotifications] = useState<SystemMaintenanceNotification[]>([]);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<SystemOptimizationRecommendation[]>([]);
  const [serviceMetrics, setServiceMetrics] = useState<BackgroundServiceMetrics | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [executionHistory, setExecutionHistory] = useState<BackgroundServiceExecution[]>([]);

  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'healthy' | 'unhealthy' | 'running' | 'error'>('all');
  const [serviceSearch, setServiceSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newMaintenance, setNewMaintenance] = useState<CreateMaintenanceNotification>({
    title: '',
    message: '',
    type: 'Scheduled',
    priority: 'Medium'
  });

  // Check if user is admin
  const isAdmin = user?.role === 'Admin' || user?.email?.includes('admin');

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (autoRefresh && isAdmin) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, isAdmin]);

  // Filter services based on search and filter criteria
  useEffect(() => {
    let filtered = serviceStatuses;

    // Apply status filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(service => {
        switch (serviceFilter) {
          case 'healthy':
            return service.isHealthy;
          case 'unhealthy':
            return !service.isHealthy;
          case 'running':
            return service.status.toLowerCase() === 'running';
          case 'error':
            return service.status.toLowerCase() === 'error';
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (serviceSearch) {
      filtered = filtered.filter(service =>
        service.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (service.message && service.message.toLowerCase().includes(serviceSearch.toLowerCase()))
      );
    }

    setFilteredServices(filtered);
  }, [serviceStatuses, serviceFilter, serviceSearch]);

  const loadDashboardData = async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [
        healthResponse,
        statusResponse,
        maintenanceResponse,
        recommendationsResponse,
        metricsResponse
      ] = await Promise.all([
        backgroundServiceService.getServiceHealth(),
        backgroundServiceService.getAllServiceStatus(),
        backgroundServiceService.getMaintenanceNotifications(true),
        backgroundServiceService.getOptimizationRecommendations(),
        backgroundServiceService.getServiceMetrics()
      ]);

      if (healthResponse.success) {
        setServiceHealth(healthResponse.data);
      }

      if (statusResponse.success) {
        setServiceStatuses(statusResponse.data);
      }

      if (maintenanceResponse.success) {
        setMaintenanceNotifications(maintenanceResponse.data);
      }

      if (recommendationsResponse.success) {
        setOptimizationRecommendations(recommendationsResponse.data);
      }

      if (metricsResponse.success) {
        setServiceMetrics(metricsResponse.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceExecutionHistory = async (serviceName: string) => {
    if (!isAdmin) return;

    try {
      const response = await backgroundServiceService.getServiceExecutionHistory(serviceName, 20);
      if (response.success) {
        setExecutionHistory(response.data);
        setSelectedService(serviceName);
      }
    } catch (error) {
      console.error('Error loading execution history:', error);
    }
  };

  const handleCreateMaintenance = async () => {
    if (!isAdmin) return;

    try {
      const response = await backgroundServiceService.createMaintenanceNotification(newMaintenance);
      if (response.success) {
        setMaintenanceNotifications(prev => [response.data, ...prev]);
        setIsCreateMaintenanceOpen(false);
        setNewMaintenance({
          title: '',
          message: '',
          type: 'Scheduled',
          priority: 'Medium'
        });
      }
    } catch (error) {
      console.error('Error creating maintenance notification:', error);
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8">
          <CardContent className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
            <p className="text-gray-600">
              You need administrator privileges to view the background service dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !serviceHealth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Background Services</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage system background services
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
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Overview Cards */}
      {serviceHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`border-2 ${
            serviceHealth.overallHealth === 'Healthy' ? 'border-green-200 bg-green-50' :
            serviceHealth.overallHealth === 'Degraded' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Health</p>
                  <p className={`text-2xl font-bold ${backgroundServiceService.getOverallHealthColor(serviceHealth.overallHealth)}`}>
                    {serviceHealth.overallHealth}
                  </p>
                </div>
                <Activity className={`h-8 w-8 ${backgroundServiceService.getOverallHealthColor(serviceHealth.overallHealth)}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-blue-600">{serviceHealth.totalServices}</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Healthy Services</p>
                  <p className="text-2xl font-bold text-green-600">{serviceHealth.healthyServices}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Services</p>
                  <p className="text-2xl font-bold text-red-600">{serviceHealth.errorServices}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Service Status Summary
                </CardTitle>
                <CardDescription>
                  Current status of all background services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceStatuses.slice(0, 5).map((service) => (
                    <ServiceHealthIndicator
                      key={service.serviceName}
                      service={service}
                      compact={true}
                      onClick={() => loadServiceExecutionHistory(service.serviceName)}
                    />
                  ))}
                  
                  {serviceStatuses.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => setActiveTab('services')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All {serviceStatuses.length} Services
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Maintenance Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Maintenance
                </CardTitle>
                <CardDescription>
                  Active maintenance notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceNotifications.slice(0, 3).map((notification) => (
                    <MaintenanceNotificationCard
                      key={notification.id}
                      notification={notification}
                      compact={true}
                    />
                  ))}
                  
                  {maintenanceNotifications.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No active maintenance notifications</p>
                    </div>
                  )}
                  
                  {maintenanceNotifications.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => setActiveTab('maintenance')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All {maintenanceNotifications.length} Notifications
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Metrics Chart */}
          {serviceMetrics && (
            <ServiceMetricsChart metrics={serviceMetrics} height={350} />
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          {/* Service Filters and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={serviceFilter} onValueChange={(value: any) => setServiceFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="healthy">Healthy Only</SelectItem>
                    <SelectItem value="unhealthy">Unhealthy Only</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Service Details ({filteredServices.length})
                </CardTitle>
                <CardDescription>
                  Filtered and searchable service status information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
                  {filteredServices.map((service) => (
                    <ServiceHealthIndicator
                      key={service.serviceName}
                      service={service}
                      compact={viewMode === 'list'}
                      showDetails={viewMode === 'grid'}
                      onClick={() => loadServiceExecutionHistory(service.serviceName)}
                    />
                  ))}
                  
                  {filteredServices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Server className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No services match your current filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Execution History */}
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  {selectedService ? `Recent executions for ${selectedService}` : 'Select a service to view execution history'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {executionHistory.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {executionHistory.map((execution) => (
                      <div key={execution.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-1 ${execution.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {execution.success ? 'Success' : 'Failed'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(execution.executionTime)}
                            </span>
                          </div>
                          
                          {execution.details && (
                            <p className="text-xs text-gray-600 mt-1">{execution.details}</p>
                          )}
                          
                          {execution.recordsProcessed && (
                            <p className="text-xs text-blue-600 mt-1">
                              Processed {execution.recordsProcessed} records
                            </p>
                          )}
                          
                          {execution.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {backgroundServiceService.formatDuration(execution.duration)}
                            </p>
                          )}
                          
                          {execution.errorMessage && (
                            <p className="text-xs text-red-600 mt-1 p-2 bg-red-50 rounded">
                              {execution.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Select a service to view its execution history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Maintenance Notifications</h3>
              <p className="text-gray-600">Manage system maintenance notifications and alerts</p>
            </div>
            
            <Dialog open={isCreateMaintenanceOpen} onOpenChange={setIsCreateMaintenanceOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Maintenance Notification</DialogTitle>
                  <DialogDescription>
                    Create a new system maintenance notification to inform users
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newMaintenance.title}
                      onChange={(e) => setNewMaintenance(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Maintenance notification title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newMaintenance.message}
                      onChange={(e) => setNewMaintenance(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Detailed maintenance message"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newMaintenance.type}
                        onValueChange={(value) => setNewMaintenance(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newMaintenance.priority}
                        onValueChange={(value) => setNewMaintenance(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="affectedServices">Affected Services (Optional)</Label>
                    <Input
                      id="affectedServices"
                      value={newMaintenance.affectedServices || ''}
                      onChange={(e) => setNewMaintenance(prev => ({ ...prev, affectedServices: e.target.value }))}
                      placeholder="Comma-separated list of affected services"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateMaintenanceOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateMaintenance}
                    disabled={!newMaintenance.title || !newMaintenance.message}
                  >
                    Create Notification
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {maintenanceNotifications.map((notification) => (
              <MaintenanceNotificationCard
                key={notification.id}
                notification={notification}
                showActions={true}
              />
            ))}
            
            {maintenanceNotifications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Maintenance Notifications</h3>
                  <p className="text-gray-600 mb-4">
                    No maintenance notifications have been created yet.
                  </p>
                  <Button 
                    onClick={() => setIsCreateMaintenanceOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Notification
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">System Optimization Recommendations</h3>
            <p className="text-gray-600">AI-generated recommendations to improve system performance</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {optimizationRecommendations.map((recommendation) => {
              const priorityInfo = backgroundServiceService.formatPriority(recommendation.priority);
              return (
                <Card key={recommendation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{priorityInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{recommendation.title}</h4>
                          <Badge variant="outline">{recommendation.category}</Badge>
                          <Badge variant="secondary" className={priorityInfo.color}>
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline">
                            Impact: {recommendation.impact}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{recommendation.description}</p>
                        
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-800 mb-1">Recommendation:</p>
                          <p className="text-sm text-blue-700">{recommendation.recommendation}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Created: {formatRelativeTime(recommendation.createdAt)}</span>
                          {recommendation.isImplemented ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              ✓ Implemented
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Pending Implementation
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {optimizationRecommendations.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-gray-600">
                    The system is currently analyzing performance metrics. 
                    Optimization recommendations will appear here when available.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {serviceMetrics && <ServiceMetricsChart metrics={serviceMetrics} height={500} />}
          
          {serviceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Executions</p>
                      <p className="text-2xl font-bold text-blue-600">{serviceMetrics.totalExecutions}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className={`text-2xl font-bold ${backgroundServiceService.getHealthColor(serviceMetrics.overallSuccessRate)}`}>
                        {serviceMetrics.overallSuccessRate.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className={`h-8 w-8 ${backgroundServiceService.getHealthColor(serviceMetrics.overallSuccessRate)}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed Executions</p>
                      <p className="text-2xl font-bold text-red-600">{serviceMetrics.failedExecutions}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Execution</p>
                      <p className="text-sm font-bold text-gray-600">
                        {serviceMetrics.lastExecutionTime ? formatRelativeTime(serviceMetrics.lastExecutionTime) : 'Never'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>Background Service Dashboard • Last updated: {lastUpdated.toLocaleString()}</p>
            <p>Monitoring {serviceStatuses.length} services • Auto-refresh: {autoRefresh ? `Every ${refreshInterval/1000}s` : 'Disabled'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${serviceHealth?.overallHealth === 'Healthy' ? 'bg-green-500' : serviceHealth?.overallHealth === 'Degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span>System {serviceHealth?.overallHealth || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>Auto-refresh {autoRefresh ? 'enabled' : 'disabled'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 