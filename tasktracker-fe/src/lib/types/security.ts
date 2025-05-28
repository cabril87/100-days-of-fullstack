// Security Dashboard Types
export interface SecurityDashboard {
  overview: SecurityOverview;
  rateLimitStatus: RateLimitStatus;
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  securityMetrics: SecurityMetric[];
  auditLogs: SecurityAuditLog[];
  alerts: SecurityAlert[];
  // Enhanced security features
  failedLoginSummary?: FailedLoginSummaryDTO;
  sessionManagement?: SessionManagementDTO;
  geolocationSummary?: IPGeolocationSummaryDTO;
  threatIntelligence?: ThreatIntelligenceSummaryDTO;
  behavioralAnalytics?: BehavioralAnalyticsSummaryDTO;
}

export interface SecurityOverview {
  securityScore: number;
  totalRequests: number;
  blockedRequests: number;
  successfulRequests: number;
  suspiciousActivity: number;
  activeUsers: number;
  systemHealth: string;
  lastUpdated: string;
  securityFeatures: SecurityFeature[];
  recentActivity: SecurityAuditLog[];
}

export interface SecurityFeature {
  name: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'warning';
  description: string;
}

export interface RateLimitStatus {
  globalLimits: RateLimitConfig[];
  userQuotas: UserQuotaStatus[];
  topUsers: UserActivity[];
  circuitBreakers: CircuitBreakerStatus[];
}

export interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: string;
  currentUsage: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface UserQuotaStatus {
  username: string;
  dailyLimit: number;
  apiCallsUsedToday: number;
  lastRequestTime: string;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface UserActivity {
  username: string;
  requestCount: number;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
}

export interface CircuitBreakerStatus {
  name: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  successCount: number;
  lastFailureTime: string;
  nextAttemptTime: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: string;
  responseTime: number;
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseConnections: number;
  cacheHitRate: number;
  errorRate: number;
  healthChecks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: string;
  details: string;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  totalRequests24h: number;
  totalErrors24h: number;
  topEndpoints: EndpointMetric[];
  topUsers: UserActivity[];
  responseTimeDistribution: ResponseTimeMetric[];
  statusCodeDistribution: StatusCodeMetric[];
  databaseMetrics: DatabaseMetric;
}

export interface EndpointMetric {
  endpoint: string;
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface ResponseTimeMetric {
  timestamp: string;
  averageTime: number;
  requestCount: number;
}

export interface StatusCodeMetric {
  statusCode: number;
  count: number;
  percentage: number;
}

export interface DatabaseMetric {
  connectionCount: number;
  averageQueryTime: number;
  slowQueries: number;
  cacheHitRate: number;
  activeTransactions: number;
}

export interface SecurityMetric {
  id: number;
  timestamp: string;
  metricType: string;
  metricName: string;
  value: number;
  description?: string;
  source?: string;
  severity?: string;
}

export interface SecurityAuditLog {
  id: number;
  timestamp: string;
  eventType: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: number;
  username?: string;
  resource?: string;
  severity?: string;
  details?: string;
  status?: string;
  isSuccessful: boolean;
  isSuspicious: boolean;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'security' | 'performance' | 'system' | 'user';
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  recommendedActions: string[];
  affectedResources: string[];
  source: string;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
}

export interface SecurityTrendData {
  timestamp: string;
  securityScore: number;
  threats: number;
  incidents: number;
}

export interface RequestDistributionData {
  name: string;
  value: number;
  color: string;
}

// API Response Types
export interface SecurityDashboardResponse {
  success: boolean;
  data: SecurityDashboard;
  message?: string;
  timestamp: string;
}

export interface SecurityMetricsResponse {
  success: boolean;
  data: SecurityMetric[];
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface SecurityAuditLogsResponse {
  success: boolean;
  data: SecurityAuditLog[];
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface SecurityAlertsResponse {
  success: boolean;
  data: SecurityAlert[];
  message?: string;
}

// Filter and Search Types
export interface SecurityLogFilter {
  eventType?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  username?: string;
  ipAddress?: string;
  isSuccessful?: boolean;
  isSuspicious?: boolean;
}

export interface SecurityMetricFilter {
  type?: string;
  category?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  source?: string;
}

// Configuration Types
export interface AlertConfiguration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  cooldownPeriod: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  timeWindow: number;
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'sms' | 'notification';
  target: string;
  template: string;
}

// Statistics Types
export interface SecurityStatistics {
  totalEvents: number;
  suspiciousEvents: number;
  successfulEvents: number;
  failedEvents: number;
  uniqueUsers: number;
  uniqueIPs: number;
  topEventTypes: Array<{ type: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
}

// Enhanced Failed Login Types
export interface FailedLoginSummaryDTO {
  totalAttempts: number;
  uniqueIPs: number;
  suspiciousAttempts: number;
  topTargetedAccounts: string[];
  topAttackingIPs: string[];
  recentAttempts: FailedLoginAttemptDTO[];
}

export interface FailedLoginAttemptDTO {
  id: number;
  emailOrUsername: string;
  ipAddress: string;
  userAgent?: string;
  attemptTime: string;
  failureReason?: string;
  country?: string;
  city?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  isSuspicious: boolean;
  riskFactors?: string;
}

export interface AccountLockoutStatusDTO {
  emailOrUsername: string;
  isLocked: boolean;
  lockoutUntil?: string;
  failedAttempts: number;
  maxAttempts: number;
  lockoutDuration: string; // TimeSpan as string
  lastAttempt?: string;
}

// Enhanced Session Management Types
export interface SessionManagementDTO {
  totalActiveSessions: number;
  maxConcurrentSessions: number;
  defaultSessionTimeout: string; // TimeSpan as string
  activeSessions: UserSessionDTO[];
  recentSessions: UserSessionDTO[];
  securitySummary: SessionSecuritySummaryDTO;
}

export interface UserSessionDTO {
  id: number;
  userId: number;
  username: string;
  sessionToken: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
  lastActivity: string;
  expiresAt?: string;
  isActive: boolean;
  country?: string;
  city?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  isSuspicious: boolean;
  securityNotes?: string;
  sessionDuration: string; // TimeSpan as string
}

export interface SessionSecuritySummaryDTO {
  suspiciousSessions: number;
  uniqueLocations: number;
  expiredSessions: number;
  unusualLocations: string[];
  newDevices: string[];
}

// Enhanced Geolocation Types
export interface IPGeolocationSummaryDTO {
  totalUniqueIPs: number;
  suspiciousIPs: number;
  blockedCountriesCount: number;
  allowedCountries: string[];
  blockedCountries: string[];
  recentAccess: GeolocationAccessDTO[];
}

export interface GeolocationAccessDTO {
  ipAddress: string;
  country?: string;
  city?: string;
  accessTime: string;
  username?: string;
  isAllowed: boolean;
  isSuspicious: boolean;
  riskFactors?: string;
}

export interface GeolocationDTO {
  country?: string;
  city?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  organization?: string;
  isVPN: boolean;
  isProxy: boolean;
}

// Threat Intelligence Types
export interface ThreatIntelligenceSummaryDTO {
  totalThreats: number;
  activeThreatFeeds: number;
  blockedIPs: number;
  maliciousDomains: number;
  recentThreats: ThreatIndicatorDTO[];
  threatsByType: ThreatTypeStatDTO[];
  threatsBySource: ThreatSourceStatDTO[];
}

export interface ThreatIndicatorDTO {
  id: number;
  indicatorType: string;
  indicatorValue: string;
  threatType: string;
  severity: string;
  source: string;
  description?: string;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean;
  confidence: number;
  tags: string[];
}

export interface ThreatTypeStatDTO {
  threatType: string;
  count: number;
  percentage: number;
}

export interface ThreatSourceStatDTO {
  source: string;
  count: number;
  reliability: number;
}

// Behavioral Analytics Types
export interface BehavioralAnalyticsSummaryDTO {
  totalProfiles: number;
  anomaliesDetected: number;
  riskScoreAverage: number;
  suspiciousUsers: number;
  recentAnomalies: BehavioralAnomalyDTO[];
  riskDistribution: RiskDistributionDTO[];
  topRiskFactors: RiskFactorDTO[];
}

export interface BehavioralAnomalyDTO {
  id: number;
  userId: number;
  username: string;
  anomalyType: string;
  description: string;
  riskScore: number;
  detectedAt: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  metadata?: string;
}

export interface RiskDistributionDTO {
  riskLevel: string;
  count: number;
  percentage: number;
}

export interface RiskFactorDTO {
  factor: string;
  weight: number;
  occurrences: number;
  description: string;
}

export interface UserBehaviorProfileDTO {
  id: number;
  userId: number;
  username: string;
  riskScore: number;
  lastActivity: string;
  loginPatterns: string;
  locationPatterns: string;
  devicePatterns: string;
  activityPatterns: string;
  anomalyCount: number;
  isHighRisk: boolean;
  profileUpdated: string;
}

// Security Monitoring Types
export interface SecurityMonitoringEventDTO {
  id: number;
  eventType: string;
  severity: string;
  description: string;
  source: string;
  timestamp: string;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SecurityMonitoringSummaryDTO {
  totalEvents: number;
  criticalEvents: number;
  highRiskEvents: number;
  resolvedEvents: number;
  averageResolutionTime: string; // TimeSpan as string
  eventsByType: SecurityEventTypeStatDTO[];
  eventsBySeverity: SecurityEventSeverityStatDTO[];
  recentEvents: SecurityMonitoringEventDTO[];
}

export interface SecurityEventTypeStatDTO {
  eventType: string;
  count: number;
  percentage: number;
}

export interface SecurityEventSeverityStatDTO {
  severity: string;
  count: number;
  percentage: number;
} 