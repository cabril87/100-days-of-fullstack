'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Monitor, 
  Clock, 
  Users, 
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Activity,
  Smartphone,
  Laptop,
  Tablet,
  RefreshCw,
  Ban,
  CheckCircle,
  XCircle,
  Info,
  Settings
} from 'lucide-react';
import { SecurityDashboard } from '@/lib/types/security';

interface EnhancedSecurityProps {
  data: SecurityDashboard | null;
}

export function EnhancedSecurity({ data }: EnhancedSecurityProps) {
  const [selectedTab, setSelectedTab] = useState('failed-logins');
  const [refreshing, setRefreshing] = useState(false);

  // Use only real data from the API - no mock data fallbacks
  const failedLoginData = data?.failedLoginSummary || {
    totalAttempts: 0,
    uniqueIPs: 0,
    suspiciousAttempts: 0,
    topTargetedAccounts: [],
    topAttackingIPs: [],
    recentAttempts: []
  };

  const sessionData = data?.sessionManagement || {
    totalActiveSessions: 0,
    maxConcurrentSessions: 5,
    defaultSessionTimeout: { hours: 2, minutes: 0 },
    activeSessions: [],
    recentSessions: [],
    securitySummary: {
      suspiciousSessions: 0,
      uniqueLocations: 0,
      expiredSessions: 0,
      unusualLocations: [],
      newDevices: []
    }
  };

  const geolocationData = data?.geolocationSummary || {
    totalUniqueIPs: 0,
    suspiciousIPs: 0,
    blockedCountriesCount: 0,
    allowedCountries: [],
    blockedCountries: [],
    recentAccess: []
  };

  // No mock data - use only real data from API
  const displayFailedLogins = failedLoginData.recentAttempts || [];
  const displaySessions = sessionData.activeSessions || [];
  const displayGeolocationAccess = geolocationData.recentAccess || [];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Laptop className="h-4 w-4" />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    switch (browser?.toLowerCase()) {
      case 'chrome': return <Globe className="h-4 w-4" />;
      case 'firefox': return <Globe className="h-4 w-4" />;
      case 'safari': return <Globe className="h-4 w-4" />;
      case 'edge': return <Globe className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (isSuspicious: boolean) => {
    return isSuspicious ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  const getSeverityIcon = (isSuspicious: boolean) => {
    return isSuspicious ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            Enhanced Security Monitoring
          </h2>
          <p className="text-gray-600 mt-1">
            Advanced security features including failed login monitoring, IP geolocation, and session management
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Failed Logins</p>
                <p className="text-2xl font-bold text-red-900">{failedLoginData.totalAttempts}</p>
                <p className="text-xs text-red-600">Last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-900">{sessionData.totalActiveSessions}</p>
                <p className="text-xs text-blue-600">Currently online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Unique IPs</p>
                <p className="text-2xl font-bold text-green-900">{geolocationData.totalUniqueIPs}</p>
                <p className="text-xs text-green-600">Last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Suspicious IPs</p>
                <p className="text-2xl font-bold text-orange-900">{geolocationData.suspiciousIPs}</p>
                <p className="text-xs text-orange-600">Flagged for review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg p-1">
          <TabsTrigger 
            value="failed-logins" 
            className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
          >
            <Lock className="h-4 w-4" />
            Failed Logins
          </TabsTrigger>
          <TabsTrigger 
            value="sessions" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            <Monitor className="h-4 w-4" />
            Session Management
          </TabsTrigger>
          <TabsTrigger 
            value="geolocation" 
            className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
          >
            <MapPin className="h-4 w-4" />
            IP Geolocation
          </TabsTrigger>
        </TabsList>

        {/* Failed Logins Tab */}
        <TabsContent value="failed-logins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-600" />
                Failed Login Attempts
              </CardTitle>
              <CardDescription>
                Monitor and analyze failed authentication attempts with account lockout protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayFailedLogins.length > 0 ? (
                  displayFailedLogins.map((attempt: any) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(attempt.isSuspicious)}`}>
                          {getSeverityIcon(attempt.isSuspicious)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{attempt.emailOrUsername}</span>
                            <Badge variant={attempt.isSuspicious ? "destructive" : "secondary"}>
                              {attempt.isSuspicious ? "Suspicious" : "Normal"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {attempt.country}, {attempt.city}
                            </span>
                            <span>{attempt.ipAddress}</span>
                            <span>{new Date(attempt.attemptTime).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Reason: {attempt.failureReason}
                            {attempt.riskFactors && (
                              <span className="text-red-600 ml-2">• {attempt.riskFactors}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {attempt.isSuspicious && (
                          <Button variant="destructive" size="sm">
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Failed Login Attempts</h3>
                    <p className="text-gray-500">No failed login attempts have been recorded recently.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Lockout Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Account Lockout Protection
              </CardTitle>
              <CardDescription>
                Automatic account protection after multiple failed attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">5</div>
                  <div className="text-sm text-blue-600">Max Failed Attempts</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">15m</div>
                  <div className="text-sm text-orange-600">Lockout Duration</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">0</div>
                  <div className="text-sm text-green-600">Currently Locked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Management Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                Active User Sessions
              </CardTitle>
              <CardDescription>
                Monitor active sessions with automatic timeout and concurrent session limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displaySessions.length > 0 ? (
                  displaySessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(session.isSuspicious)}`}>
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{session.username}</span>
                            <Badge variant={session.isSuspicious ? "destructive" : "default"}>
                              {session.isSuspicious ? "Suspicious" : "Active"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.country}, {session.city}
                            </span>
                            <span className="flex items-center gap-1">
                              {getBrowserIcon(session.browser)}
                              {session.browser} on {session.operatingSystem}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span>Duration: {session.sessionDuration}</span>
                            <span>Last activity: {new Date(session.lastActivity).toLocaleTimeString()}</span>
                            <span>IP: {session.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                    <p className="text-gray-500">No active user sessions are currently being monitored.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Session Configuration
              </CardTitle>
              <CardDescription>
                Current session management settings and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{sessionData.maxConcurrentSessions}</div>
                  <div className="text-sm text-purple-600">Max Concurrent Sessions</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {typeof sessionData.defaultSessionTimeout === 'object' 
                      ? `${sessionData.defaultSessionTimeout.hours || 2}h` 
                      : '2h'}
                  </div>
                  <div className="text-sm text-blue-600">Session Timeout</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">Auto</div>
                  <div className="text-sm text-green-600">Cleanup Enabled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Geolocation Tab */}
        <TabsContent value="geolocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Geographic Access Control
              </CardTitle>
              <CardDescription>
                Monitor access patterns and control geographic restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayGeolocationAccess.length > 0 ? (
                  displayGeolocationAccess.map((access: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(access.isSuspicious)}`}>
                          <Globe className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{access.ipAddress}</span>
                            <Badge variant={access.isAllowed ? "default" : "destructive"}>
                              {access.isAllowed ? "Allowed" : "Blocked"}
                            </Badge>
                            {access.isSuspicious && (
                              <Badge variant="destructive">Suspicious</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {access.country}, {access.city}
                            </span>
                            <span>User: {access.username}</span>
                            <span>{new Date(access.accessTime).toLocaleTimeString()}</span>
                          </div>
                          {access.riskFactors && (
                            <div className="text-sm text-red-600">
                              Risk factors: {access.riskFactors}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {access.isSuspicious && (
                          <Button variant="destructive" size="sm">
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Geographic Access Data</h3>
                    <p className="text-gray-500">No recent geographic access patterns have been recorded.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Allowed Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {geolocationData.allowedCountries.map((country: string) => (
                    <Badge key={country} variant="secondary" className="bg-green-100 text-green-800">
                      {country}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Blocked Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {geolocationData.blockedCountries.map((country: string) => (
                    <Badge key={country} variant="destructive">
                      {country}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 