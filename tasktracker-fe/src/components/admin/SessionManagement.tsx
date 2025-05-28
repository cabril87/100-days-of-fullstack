'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Monitor, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Smartphone, 
  Laptop, 
  Tablet,
  RefreshCw,
  Ban,
  Eye,
  Search,
  Filter,
  X
} from 'lucide-react';
import { SecurityService } from '@/lib/services/securityService';
import type {
  SessionManagementDTO,
  UserSessionDTO,
  SessionSecuritySummaryDTO
} from '@/lib/types/security';

const securityService = new SecurityService();

interface SessionCardProps {
  session: UserSessionDTO;
  onTerminate: (sessionToken: string, reason: string) => void;
  onMarkSuspicious: (sessionToken: string, reason: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onTerminate, onMarkSuspicious }) => {
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showSuspiciousDialog, setShowSuspiciousDialog] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [suspiciousReason, setSuspiciousReason] = useState('');

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Laptop className="h-4 w-4" />;
    }
  };

  const getSessionStatus = (session: UserSessionDTO) => {
    if (!session.isActive) return { label: 'Inactive', variant: 'secondary' as const };
    if (session.isSuspicious) return { label: 'Suspicious', variant: 'destructive' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  const handleTerminate = () => {
    if (terminateReason.trim()) {
      onTerminate(session.sessionToken, terminateReason);
      setShowTerminateDialog(false);
      setTerminateReason('');
    }
  };

  const handleMarkSuspicious = () => {
    if (suspiciousReason.trim()) {
      onMarkSuspicious(session.sessionToken, suspiciousReason);
      setShowSuspiciousDialog(false);
      setSuspiciousReason('');
    }
  };

  const status = getSessionStatus(session);

  return (
    <Card className={`${session.isSuspicious ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getDeviceIcon(session.deviceType)}
            <div>
              <CardTitle className="text-sm font-medium">{session.username}</CardTitle>
              <CardDescription className="text-xs">
                {session.browser} on {session.operatingSystem}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">IP Address:</span>
            <p className="text-muted-foreground">{session.ipAddress}</p>
          </div>
          <div>
            <span className="font-medium">Location:</span>
            <p className="text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {session.country || 'Unknown'}, {session.city || 'Unknown'}
            </p>
          </div>
          <div>
            <span className="font-medium">Created:</span>
            <p className="text-muted-foreground">
              {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="font-medium">Last Activity:</span>
            <p className="text-muted-foreground">
              {new Date(session.lastActivity).toLocaleString()}
            </p>
          </div>
        </div>

        {session.securityNotes && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{session.securityNotes}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1">
                <Ban className="h-3 w-3 mr-1" />
                Terminate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terminate Session</DialogTitle>
                <DialogDescription>
                  Are you sure you want to terminate this session for {session.username}?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="terminate-reason">Reason for termination</Label>
                <Input
                  id="terminate-reason"
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  placeholder="Enter reason..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleTerminate}>
                  Terminate Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!session.isSuspicious && (
            <Dialog open={showSuspiciousDialog} onOpenChange={setShowSuspiciousDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mark Suspicious
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Session as Suspicious</DialogTitle>
                  <DialogDescription>
                    Mark this session as suspicious for {session.username}?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="suspicious-reason">Reason for marking suspicious</Label>
                  <Input
                    id="suspicious-reason"
                    value={suspiciousReason}
                    onChange={(e) => setSuspiciousReason(e.target.value)}
                    placeholder="Enter reason..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSuspiciousDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMarkSuspicious}>
                    Mark Suspicious
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SessionManagement: React.FC = () => {
  const [sessionData, setSessionData] = useState<SessionManagementDTO | null>(null);
  const [activeSessions, setActiveSessions] = useState<UserSessionDTO[]>([]);
  const [recentSessions, setRecentSessions] = useState<UserSessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuspicious, setFilterSuspicious] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sessionManagement, activeSessionsList, recentSessionsList] = await Promise.allSettled([
        securityService.getSessionManagementData(),
        securityService.getActiveSessions(),
        securityService.getActiveSessions() // We'll get recent from the management data
      ]);

      if (sessionManagement.status === 'fulfilled') {
        setSessionData(sessionManagement.value);
        setActiveSessions(sessionManagement.value.activeSessions);
        setRecentSessions(sessionManagement.value.recentSessions);
      }

      if (activeSessionsList.status === 'fulfilled') {
        setActiveSessions(activeSessionsList.value);
      }

    } catch (err) {
      console.error('Error fetching session data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessionData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminateSession = async (sessionToken: string, reason: string) => {
    try {
      await securityService.terminateSession(sessionToken, reason);
      await fetchSessionData(); // Refresh data
    } catch (err) {
      console.error('Error terminating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
    }
  };

  const handleMarkSuspicious = async (sessionToken: string, reason: string) => {
    try {
      await securityService.markSessionSuspicious(sessionToken, reason);
      await fetchSessionData(); // Refresh data
    } catch (err) {
      console.error('Error marking session as suspicious:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark session as suspicious');
    }
  };

  const handleTerminateAllUserSessions = async (userId: number, reason: string) => {
    try {
      await securityService.terminateAllUserSessions(userId, reason);
      await fetchSessionData(); // Refresh data
    } catch (err) {
      console.error('Error terminating all user sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to terminate all user sessions');
    }
  };

  const filteredSessions = (sessions: UserSessionDTO[]) => {
    return sessions.filter(session => {
      const matchesSearch = searchTerm === '' || 
        session.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.ipAddress.includes(searchTerm) ||
        (session.country && session.country.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = !filterSuspicious || session.isSuspicious;
      
      return matchesSearch && matchesFilter;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading session data...</span>
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
          <h1 className="text-3xl font-bold tracking-tight">Session Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user sessions across the platform
          </p>
        </div>
        <Button onClick={fetchSessionData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Session Overview */}
      {sessionData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionData.totalActiveSessions}</div>
              <p className="text-xs text-muted-foreground">
                Max: {sessionData.maxConcurrentSessions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Sessions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {sessionData.securitySummary.suspiciousSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionData.securitySummary.uniqueLocations}</div>
              <p className="text-xs text-muted-foreground">
                Geographic diversity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session Timeout</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionData.defaultSessionTimeout}</div>
              <p className="text-xs text-muted-foreground">
                Default timeout
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Summary */}
      {sessionData && sessionData.securitySummary.unusualLocations.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Unusual locations detected:</strong> {sessionData.securitySummary.unusualLocations.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, IP, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button
          variant={filterSuspicious ? "default" : "outline"}
          onClick={() => setFilterSuspicious(!filterSuspicious)}
          size="sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {filterSuspicious ? 'Show All' : 'Suspicious Only'}
        </Button>
        {(searchTerm || filterSuspicious) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setFilterSuspicious(false);
            }}
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Session Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions(activeSessions).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onTerminate={handleTerminateSession}
                onMarkSuspicious={handleMarkSuspicious}
              />
            ))}
          </div>
          {filteredSessions(activeSessions).length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active sessions found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions(recentSessions).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onTerminate={handleTerminateSession}
                onMarkSuspicious={handleMarkSuspicious}
              />
            ))}
          </div>
          {filteredSessions(recentSessions).length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent sessions found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Device Alerts */}
      {sessionData && sessionData.securitySummary.newDevices.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              New Devices Detected
            </CardTitle>
            <CardDescription>
              New device types have been detected in recent sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessionData.securitySummary.newDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{device}</span>
                  <Badge variant="outline">New</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionManagement; 