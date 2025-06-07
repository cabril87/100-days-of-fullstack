'use client';

import React, { useState, useCallback } from 'react';
import { Shield, Search, AlertTriangle, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { customerSupportService, CustomerSupportServiceError } from '@/lib/services/customerSupportService';
import { UserSearchResult, UserAccountInfo, UserSearchFormData, MFADisableFormData } from '@/lib/types/customer-support';
import { UserSearchSchema, MFADisableSchema } from '@/lib/schemas/customer-support';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Form data types are imported from lib/types/customer-support

export default function CustomerSupportDashboard() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<UserSearchResult | null>(null);
  const [accountInfo, setAccountInfo] = useState<UserAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMFADisable, setShowMFADisable] = useState(false);

  // User search form
  const searchForm = useForm<UserSearchFormData>({
    resolver: zodResolver(UserSearchSchema),
    defaultValues: { searchTerm: '', searchType: 'email' }
  });

  // MFA disable form
  const mfaForm = useForm<MFADisableFormData>({
    resolver: zodResolver(MFADisableSchema),
    defaultValues: { reason: '', notifyUser: true }
  });

  // Check if user has customer support access
  const hasAccess = user?.role === 'Admin' || user?.role === 'CustomerSupport' || user?.role === 'GlobalAdmin';

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleUserSearch = async (data: UserSearchFormData) => {
    clearMessages();
    setIsLoading(true);
    setSearchResults(null);
    setAccountInfo(null);

    try {
      const result = await customerSupportService.searchUserByEmail(data.searchTerm);
      setSearchResults(result);
      setSuccess(`Found user: ${result.username} (${result.email})`);
    } catch (error) {
      if (error instanceof CustomerSupportServiceError) {
        setError(error.message);
      } else {
        setError('Failed to search for user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAccountInfo = async () => {
    if (!searchResults) return;

    clearMessages();
    setIsLoading(true);

    try {
      const info = await customerSupportService.getUserAccountInfo(searchResults.userId);
      setAccountInfo(info);
      setSuccess('Account information loaded successfully');
    } catch (error) {
      if (error instanceof CustomerSupportServiceError) {
        setError(error.message);
      } else {
        setError('Failed to load account information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFADisable = async (data: MFADisableFormData) => {
    if (!searchResults) return;

    clearMessages();
    setIsLoading(true);

    try {
      const result = await customerSupportService.emergencyDisableMFA(searchResults.userId, data.reason);
      setSuccess(`MFA disabled successfully for ${result.userEmail}`);
      setShowMFADisable(false);
      mfaForm.reset();
      
      // Refresh account info if loaded
      if (accountInfo) {
        await handleGetAccountInfo();
      }
    } catch (error) {
      if (error instanceof CustomerSupportServiceError) {
        setError(error.message);
      } else {
        setError('Failed to disable MFA');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Access control
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access the customer support dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Required roles: Customer Support, Global Admin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Support Dashboard</h1>
                <p className="text-gray-600">Assist users with account issues and security concerns</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Support Agent</p>
              <p className="font-semibold text-gray-900">{user?.displayName || user?.username}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* User Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">User Search</h2>
          </div>

          <form onSubmit={searchForm.handleSubmit(handleUserSearch)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email Address
              </label>
              <div className="flex space-x-3">
                <input
                  {...searchForm.register('searchTerm')}
                  type="email"
                  placeholder="Enter user email address..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>{isLoading ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
                              {searchForm.formState.errors.searchTerm && (
                  <p className="text-red-600 text-sm mt-1">{searchForm.formState.errors.searchTerm.message}</p>
                )}
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
              </div>
              <button
                onClick={handleGetAccountInfo}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Load Detailed Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-semibold">{searchResults.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{searchResults.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold">{searchResults.userRole}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Age Group</p>
                <p className="font-semibold">{searchResults.ageGroup}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Account Status</p>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  searchResults.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {searchResults.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">MFA Status</p>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  searchResults.mfaEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {searchResults.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {searchResults.mfaEnabled && (
                <button
                  onClick={() => setShowMFADisable(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency MFA Disable</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Detailed Account Information */}
        {accountInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Detailed Account Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold">{accountInfo.fullName || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-semibold">{new Date(accountInfo.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-semibold">{new Date(accountInfo.updatedAt).toLocaleDateString()}</p>
              </div>
              {accountInfo.mfaSetupDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">MFA Setup Date</p>
                  <p className="font-semibold">{new Date(accountInfo.mfaSetupDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Device Count</p>
                <p className="font-semibold">{accountInfo.deviceCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-semibold">{accountInfo.accountStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* MFA Disable Dialog */}
        {showMFADisable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Emergency MFA Disable</h3>
              </div>

              <p className="text-gray-600 mb-4">
                This action will disable MFA for the user <strong>{searchResults?.username}</strong>. 
                Please provide a detailed reason for this action.
              </p>

              <form onSubmit={mfaForm.handleSubmit(handleMFADisable)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for MFA Disable
                  </label>
                  <textarea
                    {...mfaForm.register('reason')}
                    rows={3}
                    placeholder="e.g., User lost phone and cannot access authenticator app..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {mfaForm.formState.errors.reason && (
                    <p className="text-red-600 text-sm mt-1">{mfaForm.formState.errors.reason.message}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMFADisable(false);
                      mfaForm.reset();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Disabling...' : 'Disable MFA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 