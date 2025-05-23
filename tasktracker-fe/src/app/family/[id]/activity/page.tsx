"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { familyActivityService, FamilyActivityDTO, FamilyActivityFilterDTO } from "@/lib/services/familyActivityService";
import { familyService } from "@/lib/services/familyService";
import { FamilyMember } from "@/lib/types/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { 
  CalendarIcon, ChevronLeft, ChevronRight, Search, Filter, 
  Eye, BarChart3, Activity, Target, 
  AlertCircle, ArrowLeft, RefreshCw, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ActivityDetailModal from "@/components/family/ActivityDetailModal";

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  topActor: { name: string; count: number } | null;
  mostCommonAction: { type: string; count: number } | null;
  averageActivitiesPerDay: number;
}

const ACTION_TYPE_CONFIG = {
  'created': { label: 'Created', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: '✨' },
  'updated': { label: 'Updated', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: '📝' },
  'completed': { label: 'Completed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: '✅' },
  'deleted': { label: 'Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: '🗑️' },
  'assigned': { label: 'Assigned', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: '👤' },
  'shared': { label: 'Shared', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300', icon: '🔗' },
  'joined': { label: 'Joined', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300', icon: '👋' },
  'left': { label: 'Left', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: '👋' }
};

export default function FamilyActivityPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = Number(params.id);
  
  // Core state
  const [activities, setActivities] = useState<FamilyActivityDTO[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "actor" | "target" | "action" | "date">("all");
  const [actorId, setActorId] = useState<number | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // UI state
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<FamilyActivityDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Load family members
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!familyId) return;
      
      try {
        const response = await familyService.getMembers(familyId.toString());
        if (response.data) {
          setFamilyMembers(response.data);
        }
      } catch (err) {
        console.error("Error loading family members:", err);
      }
    };
    
    loadFamilyMembers();
  }, [familyId]);
  
  // Calculate activity statistics
  const calculateStats = useCallback((activitiesData: FamilyActivityDTO[]): ActivityStats | null => {
    if (!activitiesData.length) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayActivities = activitiesData.filter(a => 
      new Date(a.timestamp) >= today
    ).length;
    
    const weekActivities = activitiesData.filter(a => 
      new Date(a.timestamp) >= weekAgo
    ).length;
    
    // Find top actor
    const actorCounts = activitiesData.reduce((acc, activity) => {
      const actorName = activity.actorDisplayName || activity.actorName;
      acc[actorName] = (acc[actorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topActor = Object.entries(actorCounts).length > 0 
      ? Object.entries(actorCounts).reduce((a, b) => a[1] > b[1] ? a : b)
      : null;
    
    // Find most common action
    const actionCounts = activitiesData.reduce((acc, activity) => {
      acc[activity.actionType] = (acc[activity.actionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonAction = Object.entries(actionCounts).length > 0
      ? Object.entries(actionCounts).reduce((a, b) => a[1] > b[1] ? a : b)
      : null;
    
    return {
      totalActivities: activitiesData.length,
      todayActivities,
      weekActivities,
      topActor: topActor ? { name: topActor[0], count: topActor[1] } : null,
      mostCommonAction: mostCommonAction 
        ? { type: getActionTypeLabel(mostCommonAction[0]), count: mostCommonAction[1] } 
        : null,
      averageActivitiesPerDay: Math.round((weekActivities / 7) * 10) / 10
    };
  }, []);
  
  // Load activities with filters
  const loadActivities = useCallback(async () => {
    if (!familyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      if (searchTerm.trim()) {
        result = await familyActivityService.search(familyId, searchTerm, currentPage, pageSize);
      } else if (filterType === "actor" && actorId) {
        result = await familyActivityService.getByActor(familyId, actorId, currentPage, pageSize);
      } else if (filterType === "target" && targetId) {
        result = await familyActivityService.getByTarget(familyId, targetId, currentPage, pageSize);
      } else if (filterType === "action" && actionType) {
        result = await familyActivityService.getByActionType(familyId, actionType, currentPage, pageSize);
      } else if (filterType === "date" && (startDate || endDate)) {
        const filter: FamilyActivityFilterDTO = {
          pageNumber: currentPage,
          pageSize,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        };
        result = await familyActivityService.filter(familyId, filter);
      } else {
        result = await familyActivityService.getAll(familyId, currentPage, pageSize);
      }
      
      setActivities(result.activities || []);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || 0);
      
      // Calculate stats for unfiltered view
      if (filterType === "all" && !searchTerm.trim() && currentPage === 1) {
        setActivityStats(calculateStats(result.activities || []));
      }
      
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Failed to load activities. Please try again.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [familyId, currentPage, filterType, searchTerm, actorId, targetId, actionType, startDate, endDate, pageSize, calculateStats]);
  
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);
  
  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadActivities();
  };
  
  const handleFilterChange = (type: typeof filterType) => {
    setFilterType(type);
    setCurrentPage(1);
    
    // Clear conflicting filters
    if (type !== "actor") setActorId(null);
    if (type !== "target") setTargetId(null);
    if (type !== "action") setActionType(null);
    if (type !== "date") {
      setStartDate(null);
      setEndDate(null);
    }
  };
  
  const clearAllFilters = () => {
    setFilterType("all");
    setSearchTerm("");
    setActorId(null);
    setTargetId(null);
    setActionType(null);
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };
  
  const toggleActivityExpansion = (activityId: number) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };
  
  const openDetailModal = (activity: FamilyActivityDTO) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };
  
  const closeDetailModal = () => {
    setSelectedActivity(null);
    setShowDetailModal(false);
  };
  
  // Helper functions
  const getActionTypeLabel = (actionType: string) => {
    return ACTION_TYPE_CONFIG[actionType as keyof typeof ACTION_TYPE_CONFIG]?.label || actionType;
  };
  
  const getActionTypeBadgeColor = (actionType: string) => {
    return ACTION_TYPE_CONFIG[actionType as keyof typeof ACTION_TYPE_CONFIG]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };
  
  const getActionTypeIcon = (actionType: string) => {
    return ACTION_TYPE_CONFIG[actionType as keyof typeof ACTION_TYPE_CONFIG]?.icon || '📋';
  };
  
  const formatActivityDate = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    } else if (isThisWeek(date)) {
      return format(date, "EEEE 'at' h:mm a");
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a");
    }
  };
  
  // Component sections
  const renderActivityStats = () => {
    if (!activityStats) return null;
    
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Activity Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activityStats.totalActivities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activityStats.todayActivities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activityStats.weekActivities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activityStats.averageActivitiesPerDay}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-indigo-600 truncate" title={activityStats.topActor?.name}>
                {activityStats.topActor?.name || "N/A"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Most Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-teal-600 truncate" title={activityStats.mostCommonAction?.type}>
                {activityStats.mostCommonAction?.type || "N/A"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Top Action</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderActivityItem = (activity: FamilyActivityDTO) => {
    const isExpanded = expandedActivities.has(activity.id);
    
    return (
      <Card key={activity.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-200 dark:border-l-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                {activity.actorAvatarUrl ? (
                  <AvatarImage src={activity.actorAvatarUrl} alt={activity.actorDisplayName} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {activity.actorDisplayName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {activity.actorDisplayName}
                  </span>
                  <Badge className={cn("text-xs flex items-center gap-1 px-2 py-1", getActionTypeBadgeColor(activity.actionType))}>
                    <span>{getActionTypeIcon(activity.actionType)}</span>
                    {getActionTypeLabel(activity.actionType)}
                  </Badge>
                </div>
                
                {activity.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                    {activity.description}
                  </p>
                )}
                
                {activity.targetId && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Target className="h-3 w-3" />
                    <span>Target: {activity.targetDisplayName || activity.targetName}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatActivityDate(activity.timestamp)}
                </div>
                
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{activity.id}</span>
                      </div>
                      {activity.entityType && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Entity:</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">{activity.entityType}</span>
                        </div>
                      )}
                    </div>
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Metadata:</span>
                        <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-400 overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDetailModal(activity)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActivityExpansion(activity.id)}
                className="h-8 w-8 p-0"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "−" : "+"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderFilterControls = () => {
    const hasActiveFilters = filterType !== "all" || searchTerm || actorId || targetId || actionType || startDate || endDate;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          {/* Filter Tabs */}
          <Tabs value={filterType} onValueChange={(value) => handleFilterChange(value as typeof filterType)}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="actor" className="text-xs">Member</TabsTrigger>
              <TabsTrigger value="action" className="text-xs">Action</TabsTrigger>
              <TabsTrigger value="target" className="text-xs">Target</TabsTrigger>
              <TabsTrigger value="date" className="text-xs">Date</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actor" className="mt-4">
              <Select onValueChange={(value) => setActorId(Number(value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.username || member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="action" className="mt-4">
              <Select onValueChange={(value) => setActionType(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTION_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="target" className="mt-4">
              <Select onValueChange={(value) => setTargetId(Number(value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.username || member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="date" className="mt-4">
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => setStartDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => setEndDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Activity Feed
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track all family activities and interactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!loading && totalCount > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {totalCount} activities
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showStats ? "Hide" : "Show"} Stats
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivities}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Statistics */}
      {showStats && renderActivityStats()}
      
      {/* Filters */}
      {renderFilterControls()}
      
      {/* Activities List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : activities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Activities Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your filters or search terms."
                  : "Family activities will appear here as they happen."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {activities.map(renderActivityItem)}
            {renderPagination()}
          </>
        )}
      </div>
      
      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        activity={selectedActivity}
      />
    </div>
  );
} 