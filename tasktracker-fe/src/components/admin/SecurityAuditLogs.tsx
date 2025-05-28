'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  User,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { securityService } from '@/lib/services/securityService';
import { SecurityAuditLog } from '@/lib/types/security';
import { useToast } from '@/lib/hooks/useToast';

export function SecurityAuditLogs(): React.ReactElement {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState<'old' | 'all'>('old');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, severityFilter]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await securityService.getAuditLogs(
        severityFilter ? { severity: severityFilter } : undefined,
        currentPage, 
        pageSize
      );
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      showToast('Failed to load audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSeverityFilter = (severity: string) => {
    setSeverityFilter(severity);
    setCurrentPage(1);
  };

  const handleViewDetails = (log: SecurityAuditLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleExport = async () => {
    try {
      showToast('Exporting audit logs...', 'info');
      // In a real implementation, this would trigger a download
      showToast('Export functionality coming soon', 'info');
    } catch {
      showToast('Failed to export logs', 'error');
    }
  };

  const handleClearLogs = async () => {
    try {
      setIsClearing(true);
      
      let result;
      if (clearType === 'all') {
        result = await securityService.clearAllSecurityLogs();
        showToast(`Successfully cleared all security logs: ${result.clearedCount} items`, 'success');
      } else {
        // Clear logs older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        result = await securityService.clearAuditLogs(thirtyDaysAgo);
        showToast(`Successfully cleared ${result.clearedCount} audit logs older than 30 days`, 'success');
      }
      
      // Refresh the logs
      await fetchAuditLogs();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear logs:', error);
      showToast('Failed to clear logs', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const openClearConfirm = (type: 'old' | 'all') => {
    setClearType(type);
    setShowClearConfirm(true);
  };

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.ipAddress && log.ipAddress.includes(searchTerm)) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEventIcon = (log: SecurityAuditLog) => {
    if (log.isSuspicious) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    } else if (log.isSuccessful) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Security Audit Logs
          </CardTitle>
          <CardDescription>
            Comprehensive security event logging and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs by event, user, IP, or details..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={severityFilter}
                onChange={(e) => handleSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Clear Logs Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => openClearConfirm('old')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  Clear Old Logs (30+ days)
                </button>
                <button
                  onClick={() => openClearConfirm('all')}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg border-t border-gray-100"
                >
                  Clear ALL Logs
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{filteredLogs.length}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredLogs.filter(log => log.isSuspicious).length}
              </div>
              <div className="text-sm text-red-600">Suspicious</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredLogs.filter(log => log.isSuccessful).length}
              </div>
              <div className="text-sm text-green-600">Successful</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredLogs.filter(log => !log.isSuccessful && !log.isSuspicious).length}
              </div>
              <div className="text-sm text-yellow-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No audit logs found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getEventIcon(log)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.eventType}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {log.details}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                                                  <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.username || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {log.id}
                          </div>
                        </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{log.ipAddress || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(log.severity || 'info')}`}>
                          {log.severity || 'Info'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={filteredLogs.length < pageSize}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Logs Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {clearType === 'all' ? 'Clear ALL Security Logs' : 'Clear Old Security Logs'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {clearType === 'all' 
                      ? 'This will permanently delete ALL security logs, metrics, and audit data.'
                      : 'This will permanently delete audit logs older than 30 days.'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action cannot be undone. 
                    {clearType === 'all' && ' You will lose all historical security data.'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearLogs}
                  disabled={isClearing}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    clearType === 'all' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isClearing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Clearing...
                    </div>
                  ) : (
                    clearType === 'all' ? 'Clear ALL Logs' : 'Clear Old Logs'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Event Type</label>
                    <p className="text-sm text-gray-900">{selectedLog.eventType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Severity</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(selectedLog.severity || 'info')}`}>
                      {selectedLog.severity || 'Info'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-sm text-gray-900">{selectedLog.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Log ID</label>
                    <p className="text-sm text-gray-900">{selectedLog.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Success</label>
                    <div className="flex items-center gap-2">
                      {selectedLog.isSuccessful ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-900">
                        {selectedLog.isSuccessful ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Suspicious</label>
                    <div className="flex items-center gap-2">
                      {selectedLog.isSuspicious ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-900">
                        {selectedLog.isSuspicious ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Details</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLog.details}</p>
                  </div>
                </div>

                {selectedLog.userAgent && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Agent</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-900 break-all">
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 