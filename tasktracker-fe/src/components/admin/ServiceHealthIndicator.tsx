'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Cpu
} from 'lucide-react';
import { BackgroundServiceStatus, backgroundServiceService } from '@/lib/services/backgroundServiceService';

interface ServiceHealthIndicatorProps {
  service: BackgroundServiceStatus;
  showDetails?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function ServiceHealthIndicator({ 
  service, 
  showDetails = true, 
  compact = false,
  onClick 
}: ServiceHealthIndicatorProps): React.ReactElement {
  const statusInfo = backgroundServiceService.formatServiceStatus(service.status);
  
  const getStatusIcon = () => {
    switch (service.status.toLowerCase()) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'stopped':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatLastRun = (lastRun?: string): string => {
    if (!lastRun) return 'Never';
    
    const date = new Date(lastRun);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
          onClick ? 'cursor-pointer hover:bg-gray-50' : ''
        } ${service.isHealthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
        onClick={onClick}
      >
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{service.serviceName}</p>
          <p className="text-xs text-gray-500">
            {service.successRate.toFixed(0)}% success
          </p>
        </div>
        <Badge 
          variant={service.isHealthy ? "default" : "destructive"} 
          className="text-xs"
        >
          {statusInfo.text}
        </Badge>
      </div>
    );
  }

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-sm">{service.serviceName}</h4>
              <p className="text-xs text-gray-500">
                Last run: {formatLastRun(service.lastRun)}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${statusInfo.color} border-current`}
          >
            {statusInfo.text}
          </Badge>
        </div>

        {showDetails && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="text-center">
                <p className="text-gray-600">Executions</p>
                <p className="font-semibold">{service.executionCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Success</p>
                <p className="font-semibold text-green-600">{service.successCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Errors</p>
                <p className="font-semibold text-red-600">{service.errorCount}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Success Rate</span>
                <span className={backgroundServiceService.getHealthColor(service.successRate)}>
                  {service.successRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={service.successRate} className="h-2" />
            </div>

            {service.message && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                {service.message}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  service.isHealthy ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{service.isHealthy ? 'Healthy' : 'Unhealthy'}</span>
              </div>
              {service.nextRun && (
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  <span>Next: {formatLastRun(service.nextRun)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 