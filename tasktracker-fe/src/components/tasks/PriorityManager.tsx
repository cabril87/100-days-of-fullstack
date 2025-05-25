'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Zap, 
  Settings,
  Trophy,
  Star,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriorityAdjustment, TaskPriority } from '@/lib/types/task';

interface PriorityManagerProps {
  className?: string;
}

interface PriorityStats {
  totalTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  adjustmentsToday: number;
}

export function PriorityManager({ className = '' }: PriorityManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adjustmentHistory, setAdjustmentHistory] = useState<(PriorityAdjustment & { adjustmentTime: string })[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<PriorityStats>({
    totalTasks: 0,
    highPriorityTasks: 0,
    overdueTasks: 0,
    adjustmentsToday: 0
  });

  useEffect(() => {
    loadPriorityData();
  }, []);

  const loadPriorityData = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API calls when backend is ready
      const mockStats: PriorityStats = {
        totalTasks: 25,
        highPriorityTasks: 8,
        overdueTasks: 3,
        adjustmentsToday: 5
      };
      
      const mockHistory: (PriorityAdjustment & { adjustmentTime: string })[] = [
        {
          taskId: 1,
          taskTitle: "Complete project proposal",
          previousPriority: TaskPriority.Medium,
          newPriority: TaskPriority.High,
          adjustmentReason: "Due date approaching",
          adjustmentTime: new Date().toISOString()
        },
        {
          taskId: 2,
          taskTitle: "Review team feedback",
          previousPriority: TaskPriority.High,
          newPriority: TaskPriority.Medium,
          adjustmentReason: "Deadline extended",
          adjustmentTime: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      setStats(mockStats);
      setAdjustmentHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load priority data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoAdjust = async () => {
    setIsLoading(true);
    try {
      // Simulate auto-adjustment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add a new adjustment to history
      const newAdjustment: (PriorityAdjustment & { adjustmentTime: string }) = {
        taskId: Date.now(),
        taskTitle: "Auto-adjusted task",
        previousPriority: TaskPriority.Low,
        newPriority: TaskPriority.Medium,
        adjustmentReason: "Automatic priority adjustment based on due date",
        adjustmentTime: new Date().toISOString()
      };
      
      setAdjustmentHistory(prev => [newAdjustment, ...prev]);
      setStats(prev => ({ ...prev, adjustmentsToday: prev.adjustmentsToday + 1 }));
      
    } catch (error) {
      console.error('Failed to trigger auto adjustment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority): "destructive" | "default" | "secondary" | "outline" => {
    switch (priority) {
      case TaskPriority.Critical: return 'destructive';
      case TaskPriority.High: return 'default';
      case TaskPriority.Medium: return 'secondary';
      case TaskPriority.Low: return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Critical: return <AlertTriangle className="h-4 w-4" />;
      case TaskPriority.High: return <TrendingUp className="h-4 w-4" />;
      case TaskPriority.Medium: return <Clock className="h-4 w-4" />;
      case TaskPriority.Low: return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.Critical: return 'Critical';
      case TaskPriority.High: return 'High';
      case TaskPriority.Medium: return 'Medium';
      case TaskPriority.Low: return 'Low';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Priority Manager</h2>
            <p className="text-sm text-gray-600">Intelligent task prioritization system</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
          
          <Button
            onClick={handleAutoAdjust}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Auto-Adjust Priorities
          </Button>
        </div>
      </div>

      {/* Priority Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.highPriorityTasks}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.adjustmentsToday}</div>
                <div className="text-sm text-gray-600">Adjustments Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adjustment History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Priority Adjustment History
            </CardTitle>
            <CardDescription>
              Recent priority adjustments and their reasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adjustmentHistory.length > 0 ? (
              <div className="space-y-3">
                {adjustmentHistory.map((adjustment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{adjustment.taskTitle}</div>
                      <div className="text-sm text-gray-600">{adjustment.adjustmentReason}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(adjustment.adjustmentTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(adjustment.previousPriority)}>
                        {getPriorityLabel(adjustment.previousPriority)}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge variant={getPriorityColor(adjustment.newPriority)}>
                        {getPriorityLabel(adjustment.newPriority)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No priority adjustments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gamification Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Priority Management Rewards
          </CardTitle>
          <CardDescription>
            Earn points and badges for effective priority management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Priority Master</div>
                  <div className="text-sm text-gray-600">Adjust 10+ task priorities</div>
                  <div className="text-xs text-purple-600 font-medium">+50 points</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Task Organizer</div>
                  <div className="text-sm text-gray-600">Use auto-adjustment 5 times</div>
                  <div className="text-xs text-green-600 font-medium">+25 points</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 