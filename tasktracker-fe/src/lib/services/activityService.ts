export interface ActivityItem {
  id: string;
  type: 'task_completion' | 'achievement' | 'level_up' | 'badge' | 'reward' | 'challenge' | 'login' | 'streak' | 'family' | 'points';
  title: string;
  description: string;
  points?: number;
  timestamp: string;
  data?: {
    taskId?: string;
    taskTitle?: string;
    achievementId?: number;
    achievementName?: string;
    badgeId?: number;
    badgeName?: string;
    rewardId?: number;
    rewardName?: string;
    challengeId?: number;
    challengeName?: string;
    oldLevel?: number;
    newLevel?: number;
    streakLength?: number;
    familyId?: number;
    familyName?: string;
    memberId?: string;
    memberName?: string;
  };
}

export interface ActivityStats {
  totalActivities: number;
  totalPoints: number;
  activitiesToday: number;
  pointsToday: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ActivityFilters {
  type?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

class ActivityService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/activity`;

  /**
   * Get user's recent activity with filtering and pagination
   */
  async getRecentActivity(filters: ActivityFilters = {}): Promise<{
    activities: ActivityItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString());
      }

      const response = await fetch(`${this.baseUrl}/recent?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        activities: data.activities || [],
        total: data.total || 0,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      // Return empty data instead of throwing to prevent UI crashes
      return {
        activities: [],
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * Get activity statistics for the user
   */
  async getActivityStats(): Promise<ActivityStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        totalActivities: data.totalActivities || 0,
        totalPoints: data.totalPoints || 0,
        activitiesToday: data.activitiesToday || 0,
        pointsToday: data.pointsToday || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0
      };
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
      // Return default stats instead of throwing
      return {
        totalActivities: 0,
        totalPoints: 0,
        activitiesToday: 0,
        pointsToday: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    }
  }

  /**
   * Get activity feed for family members (if in a family)
   */
  async getFamilyActivity(familyId: number, filters: ActivityFilters = {}): Promise<{
    activities: ActivityItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString());
      }

      const response = await fetch(`${this.baseUrl}/family/${familyId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        activities: data.activities || [],
        total: data.total || 0,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('Failed to fetch family activity:', error);
      return {
        activities: [],
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * Get activity by specific ID with full details
   */
  async getActivityById(activityId: string): Promise<ActivityItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch activity by ID:', error);
      return null;
    }
  }

  /**
   * Mark activity as read/seen
   */
  async markActivityAsRead(activityId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to mark activity as read:', error);
      return false;
    }
  }

  /**
   * Get activity types and their counts
   */
  async getActivityTypeCounts(dateRange: string = 'all'): Promise<{
    [key: string]: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (dateRange !== 'all') {
        params.append('dateRange', dateRange);
      }

      const response = await fetch(`${this.baseUrl}/types/counts?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.counts || {};
    } catch (error) {
      console.error('Failed to fetch activity type counts:', error);
      return {};
    }
  }

  /**
   * Get activity timeline data for charts/graphs
   */
  async getActivityTimeline(
    dateRange: string = 'month',
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    labels: string[];
    data: number[];
    pointsData: number[];
  }> {
    try {
      const params = new URLSearchParams();
      params.append('dateRange', dateRange);
      params.append('groupBy', groupBy);

      const response = await fetch(`${this.baseUrl}/timeline?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        labels: data.labels || [],
        data: data.data || [],
        pointsData: data.pointsData || []
      };
    } catch (error) {
      console.error('Failed to fetch activity timeline:', error);
      return {
        labels: [],
        data: [],
        pointsData: []
      };
    }
  }

  /**
   * Export activity data to CSV
   */
  async exportActivityData(filters: ActivityFilters = {}): Promise<Blob | null> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await fetch(`${this.baseUrl}/export?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export activity data:', error);
      return null;
    }
  }

  /**
   * Get real-time activity updates via WebSocket/SignalR
   * This would be integrated with the existing SignalR setup
   */
  subscribeToActivityUpdates(callback: (activity: ActivityItem) => void): () => void {
    // This would integrate with the existing SignalR connection
    // For now, return a no-op unsubscribe function
    console.log('Activity updates subscription would be implemented here');
    return () => {
      console.log('Unsubscribing from activity updates');
    };
  }

  /**
   * Helper method to format activity for display
   */
  formatActivityForDisplay(activity: ActivityItem): {
    icon: string;
    color: string;
    formattedTitle: string;
    formattedDescription: string;
    timeAgo: string;
  } {
    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    let timeAgo: string;
    if (diffInSeconds < 60) timeAgo = 'Just now';
    else if (diffInSeconds < 3600) timeAgo = `${Math.floor(diffInSeconds / 60)}m ago`;
    else if (diffInSeconds < 86400) timeAgo = `${Math.floor(diffInSeconds / 3600)}h ago`;
    else if (diffInSeconds < 604800) timeAgo = `${Math.floor(diffInSeconds / 86400)}d ago`;
    else timeAgo = activityDate.toLocaleDateString();

    const typeConfig = {
      task_completion: { icon: '✅', color: 'green' },
      achievement: { icon: '🏆', color: 'yellow' },
      level_up: { icon: '👑', color: 'purple' },
      badge: { icon: '🎖️', color: 'blue' },
      reward: { icon: '🎁', color: 'pink' },
      challenge: { icon: '🎯', color: 'red' },
      login: { icon: '📅', color: 'gray' },
      streak: { icon: '⚡', color: 'amber' },
      family: { icon: '👨‍👩‍👧‍👦', color: 'orange' },
      points: { icon: '⭐', color: 'blue' }
    };

    const config = typeConfig[activity.type] || { icon: 'ℹ️', color: 'gray' };

    return {
      icon: config.icon,
      color: config.color,
      formattedTitle: activity.title,
      formattedDescription: activity.description,
      timeAgo
    };
  }
}

export const activityService = new ActivityService(); 