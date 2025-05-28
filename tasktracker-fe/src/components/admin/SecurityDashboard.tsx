'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Globe, 
  Activity, 
  Lock, 
  Eye, 
  TrendingUp,
  MapPin,
  UserX,
  Brain,
  Target,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { SecurityService } from '@/lib/services/securityService';
import type {
  SecurityDashboard as SecurityDashboardType,
  FailedLoginSummaryDTO,
  SessionManagementDTO,
  IPGeolocationSummaryDTO,
  ThreatIntelligenceSummaryDTO,
  BehavioralAnalyticsSummaryDTO,
  SecurityMonitoringSummaryDTO
} from '@/lib/types/security';

const securityService = new SecurityService();

interface SecurityMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityMetricCard: React.FC<SecurityMetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  severity = 'low'
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <Card className={`${getSeverityColor(severity)} border-2`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-4 w-4 ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
            <span className="text-xs ml-1">
              {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SecurityDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardType | null>(null);
  const [failedLoginData, setFailedLoginData] = useState<FailedLoginSummaryDTO | null>(null);
  const [sessionData, setSessionData] = useState<SessionManagementDTO | null>(null);
  const [geolocationData, setGeolocationData] = useState<IPGeolocationSummaryDTO | null>(null);
  const [threatData, setThreatData] = useState<ThreatIntelligenceSummaryDTO | null>(null);
  const [behavioralData, setBehavioralData] = useState<BehavioralAnalyticsSummaryDTO | null>(null);
  const [monitoringData, setMonitoringData] = useState<SecurityMonitoringSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main dashboard data
      const dashboard = await securityService.getDashboardData();
      setDashboardData(dashboard);

      // Fetch enhanced security features data
      const [
        failedLogins,
        sessions,
        geolocation,
        threats,
        behavioral,
        monitoring
      ] = await Promise.allSettled([
        securityService.getFailedLoginSummary(),
        securityService.getSessionManagementData(),
        securityService.getGeolocationSummary(),
        securityService.getThreatIntelligenceSummary(),
        securityService.getBehavioralAnalyticsSummary(),
        securityService.getSecurityMonitoringSummary()
      ]);

      if (failedLogins.status === 'fulfilled') setFailedLoginData(failedLogins.value);
      if (sessions.status === 'fulfilled') setSessionData(sessions.value);
      if (geolocation.status === 'fulfilled') setGeolocationData(geolocation.value);
      if (threats.status === 'fulfilled') setThreatData(threats.value);
      if (behavioral.status === 'fulfilled') setBehavioralData(behavioral.value);
      if (monitoring.status === 'fulfilled') setMonitoringData(monitoring.value);

    } catch (err) {
      console.error('Error fetching security dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load security dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSecurityScoreSeverity = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 90) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 50) return 'high';
    return 'critical';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive security monitoring and threat detection
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Score Overview */}
      {dashboardData && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold ${getSecurityScoreColor(dashboardData.overview.securityScore)}`}>
                {dashboardData.overview.securityScore}%
              </div>
              <div className="flex-1">
                <Progress 
                  value={dashboardData.overview.securityScore} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  System health: {dashboardData.overview.systemHealth}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData && (
          <>
            <SecurityMetricCard
              title="Total Requests (24h)"
              value={(dashboardData.overview?.totalRequests || 0).toLocaleString()}
              description="API requests processed"
              icon={<Activity className="h-4 w-4" />}
              severity="low"
            />
            <SecurityMetricCard
              title="Blocked Requests"
              value={(dashboardData.overview?.blockedRequests || 0).toLocaleString()}
              description="Malicious requests blocked"
              icon={<Shield className="h-4 w-4" />}
              severity={(dashboardData.overview?.blockedRequests || 0) > 100 ? 'high' : 'medium'}
            />
            <SecurityMetricCard
              title="Suspicious Activity"
              value={(dashboardData.overview?.suspiciousActivity || 0).toLocaleString()}
              description="Potential threats detected"
              icon={<AlertTriangle className="h-4 w-4" />}
              severity={(dashboardData.overview?.suspiciousActivity || 0) > 50 ? 'critical' : 'medium'}
            />
            <SecurityMetricCard
              title="Active Users"
              value={(dashboardData.overview?.activeUsers || 0).toLocaleString()}
              description="Currently authenticated"
              icon={<Users className="h-4 w-4" />}
              severity="low"
            />
          </>
        )}
      </div>

      {/* Enhanced Security Features */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {failedLoginData && (
          <SecurityMetricCard
            title="Failed Login Attempts"
            value={(failedLoginData.totalAttempts || 0).toLocaleString()}
            description={`${failedLoginData.suspiciousAttempts || 0} suspicious attempts`}
            icon={<UserX className="h-4 w-4" />}
            severity={(failedLoginData.suspiciousAttempts || 0) > 10 ? 'high' : 'medium'}
          />
        )}
        
        {sessionData && (
          <SecurityMetricCard
            title="Active Sessions"
            value={(sessionData.totalActiveSessions || 0).toLocaleString()}
            description={`${sessionData.securitySummary?.suspiciousSessions || 0} suspicious sessions`}
            icon={<Lock className="h-4 w-4" />}
            severity={(sessionData.securitySummary?.suspiciousSessions || 0) > 0 ? 'high' : 'low'}
          />
        )}

        {geolocationData && (
          <SecurityMetricCard
            title="Unique IP Addresses"
            value={(geolocationData.totalUniqueIPs || 0).toLocaleString()}
            description={`${geolocationData.suspiciousIPs || 0} suspicious IPs`}
            icon={<Globe className="h-4 w-4" />}
            severity={(geolocationData.suspiciousIPs || 0) > 5 ? 'high' : 'medium'}
          />
        )}

        {threatData && (
          <SecurityMetricCard
            title="Threat Indicators"
            value={(threatData.totalThreats || 0).toLocaleString()}
            description={`${threatData.blockedIPs || 0} blocked IPs`}
            icon={<Target className="h-4 w-4" />}
            severity={(threatData.totalThreats || 0) > 100 ? 'high' : 'medium'}
          />
        )}

        {behavioralData && (
          <SecurityMetricCard
            title="Behavioral Anomalies"
            value={(behavioralData.anomaliesDetected || 0).toLocaleString()}
            description={`${behavioralData.suspiciousUsers || 0} high-risk users`}
            icon={<Brain className="h-4 w-4" />}
            severity={(behavioralData.suspiciousUsers || 0) > 0 ? 'high' : 'low'}
          />
        )}

        {monitoringData && (
          <SecurityMetricCard
            title="Security Events"
            value={(monitoringData.totalEvents || 0).toLocaleString()}
            description={`${monitoringData.criticalEvents || 0} critical events`}
            icon={<Monitor className="h-4 w-4" />}
            severity={(monitoringData.criticalEvents || 0) > 0 ? 'critical' : 'low'}
          />
        )}
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="failed-logins">Failed Logins</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardData && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Security Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Alerts</CardTitle>
                  <CardDescription>Latest security incidents and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(dashboardData.alerts || []).length > 0 ? (
                      (dashboardData.alerts || []).slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No recent alerts</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>CPU Usage</span>
                      <span>{dashboardData.systemHealth?.cpuUsage || 0}%</span>
                    </div>
                    <Progress value={dashboardData.systemHealth?.cpuUsage || 0} />
                    
                    <div className="flex justify-between">
                      <span>Memory Usage</span>
                      <span>{dashboardData.systemHealth?.memoryUsage || 0}%</span>
                    </div>
                    <Progress value={dashboardData.systemHealth?.memoryUsage || 0} />
                    
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span>{dashboardData.systemHealth?.responseTime || 0}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed-logins" className="space-y-4">
          {failedLoginData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Failed Login Summary</CardTitle>
                  <CardDescription>Recent failed authentication attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Total Attempts</p>
                        <p className="text-2xl font-bold">{failedLoginData.totalAttempts || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Unique IPs</p>
                        <p className="text-2xl font-bold">{failedLoginData.uniqueIPs || 0}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Top Targeted Accounts</p>
                      <div className="space-y-1">
                        {(failedLoginData.topTargetedAccounts || []).slice(0, 5).map((account, index) => (
                          <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                            {account}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Failed Attempts</CardTitle>
                  <CardDescription>Latest failed login attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(failedLoginData.recentAttempts || []).slice(0, 5).map((attempt) => (
                      <div key={attempt.id} className="p-2 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{attempt.emailOrUsername}</p>
                            <p className="text-sm text-muted-foreground">
                              {attempt.ipAddress} • {attempt.country || 'Unknown'}
                            </p>
                          </div>
                          {attempt.isSuspicious && (
                            <Badge variant="destructive">Suspicious</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(attempt.attemptTime).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {sessionData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Session Overview</CardTitle>
                  <CardDescription>Current session statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Active Sessions</p>
                        <p className="text-2xl font-bold">{sessionData.totalActiveSessions || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Max Concurrent</p>
                        <p className="text-2xl font-bold">{sessionData.maxConcurrentSessions || 0}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Security Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Suspicious Sessions</span>
                          <Badge variant={(sessionData.securitySummary?.suspiciousSessions || 0) > 0 ? 'destructive' : 'secondary'}>
                            {sessionData.securitySummary?.suspiciousSessions || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Unique Locations</span>
                          <span>{sessionData.securitySummary?.uniqueLocations || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Currently active user sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(sessionData.activeSessions || []).slice(0, 5).map((session) => (
                      <div key={session.id} className="p-2 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{session.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.ipAddress} • {session.country || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.deviceType} • {session.browser}
                            </p>
                          </div>
                          {session.isSuspicious && (
                            <Badge variant="destructive">Suspicious</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last activity: {new Date(session.lastActivity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="geolocation" className="space-y-4">
          {geolocationData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Geolocation Overview</CardTitle>
                  <CardDescription>Geographic access patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Unique IPs</p>
                        <p className="text-2xl font-bold">{geolocationData.totalUniqueIPs || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Suspicious IPs</p>
                        <p className="text-2xl font-bold text-red-600">{geolocationData.suspiciousIPs || 0}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Country Access Control</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Allowed Countries</span>
                          <span>{(geolocationData.allowedCountries || []).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blocked Countries</span>
                          <span>{(geolocationData.blockedCountries || []).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Access</CardTitle>
                  <CardDescription>Latest geographic access attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(geolocationData.recentAccess || []).slice(0, 5).map((access, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{access.ipAddress}</p>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {access.country}, {access.city}
                            </p>
                            {access.username && (
                              <p className="text-sm text-muted-foreground">User: {access.username}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {!access.isAllowed && (
                              <Badge variant="destructive">Blocked</Badge>
                            )}
                            {access.isSuspicious && (
                              <Badge variant="outline">Suspicious</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(access.accessTime).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          {threatData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Intelligence</CardTitle>
                  <CardDescription>Current threat landscape</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Total Threats</p>
                        <p className="text-2xl font-bold">{threatData.totalThreats || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Blocked IPs</p>
                        <p className="text-2xl font-bold">{threatData.blockedIPs || 0}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Threat Types</p>
                      <div className="space-y-1">
                        {(threatData.threatsByType || []).slice(0, 5).map((threat, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{threat.threatType}</span>
                            <span>{threat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Threats</CardTitle>
                  <CardDescription>Latest threat indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(threatData.recentThreats || []).slice(0, 5).map((threat) => (
                      <div key={threat.id} className="p-2 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{threat.indicatorValue}</p>
                            <p className="text-sm text-muted-foreground">
                              {threat.threatType} • {threat.source}
                            </p>
                          </div>
                          <Badge variant={threat.severity === 'high' ? 'destructive' : 'secondary'}>
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {threat.confidence}% • Last seen: {new Date(threat.lastSeen).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-4">
          {behavioralData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Analytics</CardTitle>
                  <CardDescription>User behavior analysis and anomaly detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">User Profiles</p>
                        <p className="text-2xl font-bold">{behavioralData.totalProfiles || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Anomalies</p>
                        <p className="text-2xl font-bold text-orange-600">{behavioralData.anomaliesDetected || 0}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Risk Distribution</p>
                      <div className="space-y-1">
                        {(behavioralData.riskDistribution || []).map((risk, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{risk.riskLevel}</span>
                            <span>{risk.count} ({risk.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Anomalies</CardTitle>
                  <CardDescription>Latest behavioral anomalies detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(behavioralData.recentAnomalies || []).slice(0, 5).map((anomaly) => (
                      <div key={anomaly.id} className="p-2 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{anomaly.username}</p>
                            <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Risk Score: {anomaly.riskScore}
                            </p>
                          </div>
                          <Badge variant={anomaly.isResolved ? 'secondary' : 'destructive'}>
                            {anomaly.isResolved ? 'Resolved' : 'Active'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(anomaly.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard; 