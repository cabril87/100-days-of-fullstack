'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bell, 
  Filter,
  Search,
  Plus,
  Clock,
  User,
  Shield,
  Activity,
  RefreshCw,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { SecurityDashboard, SecurityAlert } from '@/lib/types/security';
import { securityService } from '@/lib/services/securityService';
import { useToast } from '@/lib/hooks/useToast';

interface SecurityAlertsProps {
  data: SecurityDashboard;
}

export function SecurityAlerts({ data }: SecurityAlertsProps): React.ReactElement {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<SecurityAlert[]>(data?.alerts || []);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>(data?.alerts || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    type: 'security' as 'security' | 'performance' | 'system' | 'user',
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    source: '',
    recommendedActions: [''],
    affectedResources: ['']
  });

  // Safety check - if data is not available, show loading state
  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading security alerts...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(alert => !alert.isResolved);
      } else if (statusFilter === 'resolved') {
        filtered = filtered.filter(alert => alert.isResolved);
      }
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, severityFilter, statusFilter, typeFilter]);

  // Refresh alerts
  const refreshAlerts = async () => {
    try {
      setLoading(true);
      const freshAlerts = await securityService.getSecurityAlerts();
      setAlerts(freshAlerts);
      showToast('Alerts refreshed successfully', 'success');
    } catch (error) {
      showToast('Failed to refresh alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      await securityService.resolveAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isResolved: true } : alert
      ));
      showToast('Alert resolved successfully', 'success');
    } catch (error) {
      showToast('Failed to resolve alert', 'error');
    }
  };

  // Create new alert
  const createAlert = async () => {
    try {
      if (!newAlert.title || !newAlert.description || !newAlert.type) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const createdAlert = await securityService.createAlert(newAlert);
      setAlerts(prev => [createdAlert, ...prev]);
      setNewAlert({
        type: 'security',
        title: '',
        description: '',
        severity: 'medium',
        source: '',
        recommendedActions: [''],
        affectedResources: ['']
      });
      setShowCreateForm(false);
      showToast('Alert created successfully', 'success');
    } catch (error) {
      showToast('Failed to create alert', 'error');
    }
  };

  // Export alerts
  const exportAlerts = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      alerts: filteredAlerts,
      filters: { searchTerm, severityFilter, statusFilter, typeFilter }
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-alerts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Alerts exported successfully', 'success');
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get unique alert types for filter
  const alertTypes = [...new Set((alerts || []).map(alert => alert.type))];

  // Statistics
  const activeAlerts = (alerts || []).filter(alert => !alert.isResolved);
  const highSeverityAlerts = activeAlerts.filter(alert => alert.severity === 'high');
  const mediumSeverityAlerts = activeAlerts.filter(alert => alert.severity === 'medium');
  const lowSeverityAlerts = activeAlerts.filter(alert => alert.severity === 'low');

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">High Priority</p>
                <p className="text-2xl font-bold text-red-900">{highSeverityAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-900">{mediumSeverityAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Low Priority</p>
                <p className="text-2xl font-bold text-green-900">{lowSeverityAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Active</p>
                <p className="text-2xl font-bold text-blue-900">{activeAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Security Alerts Management
              </CardTitle>
              <CardDescription>
                Monitor, manage, and resolve security alerts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAlerts}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAlerts}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Alert
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {alertTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Create Alert Form */}
          {showCreateForm && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Create New Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Alert Type *</label>
                    <Select value={newAlert.type} onValueChange={(value: 'security' | 'performance' | 'system' | 'user') => 
                      setNewAlert(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity *</label>
                    <Select value={newAlert.severity} onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewAlert(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <Input
                      value={newAlert.title}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief alert title"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={newAlert.description}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the alert"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Source</label>
                    <Input
                      value={newAlert.source}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="Alert source (optional)"
                    />
                  </div>
                  
                                     <div>
                     <label className="block text-sm font-medium mb-1">Recommended Actions</label>
                     <Input
                       value={newAlert.recommendedActions[0]}
                       onChange={(e) => setNewAlert(prev => ({ ...prev, recommendedActions: [e.target.value] }))}
                       placeholder="Recommended action (optional)"
                     />
                   </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAlert}>
                    Create Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {alerts.length === 0 ? 'No Security Alerts' : 'No Matching Alerts'}
                </h3>
                <p className="text-gray-600">
                  {alerts.length === 0 
                    ? 'All security alerts have been resolved. System is operating normally.'
                    : 'Try adjusting your filters to see more alerts.'
                  }
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.severity === 'high' ? 'border-l-red-500' :
                  alert.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                } ${alert.isResolved ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">{alert.title}</h4>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            {alert.isResolved && (
                              <Badge className="bg-gray-100 text-gray-800">
                                RESOLVED
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">Type:</span>
                              <p>{alert.type}</p>
                            </div>
                            <div>
                              <span className="font-medium">Source:</span>
                              <p>{alert.source || 'System'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <p>{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="font-medium">ID:</span>
                              <p className="font-mono">{alert.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                          
                          {alert.recommendedActions && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-blue-800">
                                <strong>Recommended Action:</strong> {alert.recommendedActions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAlert(alert)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        {!alert.isResolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getSeverityIcon(selectedAlert.severity)}
                  Alert Details
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedAlert.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                    {selectedAlert.isResolved && (
                      <Badge className="bg-gray-100 text-gray-800">RESOLVED</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedAlert.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Type</h4>
                    <p className="text-gray-700">{selectedAlert.type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Source</h4>
                    <p className="text-gray-700">{selectedAlert.source || 'System'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Created</h4>
                    <p className="text-gray-700">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Alert ID</h4>
                    <p className="text-gray-700 font-mono text-sm">{selectedAlert.id}</p>
                  </div>
                </div>
                
                {selectedAlert.recommendedActions && (
                  <div>
                    <h4 className="font-medium mb-2">Recommended Action</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800">{selectedAlert.recommendedActions}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {!selectedAlert.isResolved && (
                    <Button
                      onClick={() => {
                        resolveAlert(selectedAlert.id);
                        setSelectedAlert(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Resolve Alert
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
} 