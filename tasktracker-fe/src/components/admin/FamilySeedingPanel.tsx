// Family Seeding Panel (Global Admin Only)
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { familySeedingService } from '@/lib/services/familySeedingService';
import {
  FamilyScenario,
  FamilyScenarioInfo,
  FamilySeedingResponse,
  getAgeGroupColor,
  getRelationshipDisplayName,
} from '@/lib/types/family';
import { FamilyDTO } from '@/lib/types/family';
import { AlertTriangle, Users, Settings, Trash2, Play, Eye, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FamilySeedingPanelProps {
  className?: string;
}

export default function FamilySeedingPanel({ className = '' }: FamilySeedingPanelProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<FamilyScenarioInfo[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<FamilyScenario>(FamilyScenario.NuclearFamily);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [customFamilyName, setCustomFamilyName] = useState<string>('');
  const [clearExisting, setClearExisting] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FamilySeedingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [testFamilies, setTestFamilies] = useState<FamilyDTO[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(false);

  // Check if user is global admin
  const isGlobalAdmin = user?.email?.toLowerCase() === 'admin@tasktracker.com';

  // Navigation helpers
  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  const navigateToFamilyManagement = () => {
    router.push('/settings/family');
  };

  useEffect(() => {
    if (isGlobalAdmin) {
      loadScenarios();
      loadTestFamilies();
    }
  }, [isGlobalAdmin]);

  useEffect(() => {
    // Update member count when scenario changes
    const scenarioInfo = scenarios.find(s => s.scenario === selectedScenario);
    if (scenarioInfo && memberCount === 0) {
      // Add safety check to prevent NaN
      const defaultCount = scenarioInfo.defaultMemberCount || 0;
      setMemberCount(defaultCount);
    }
  }, [selectedScenario, scenarios, memberCount]);

  const loadScenarios = async () => {
    try {
      const scenarioList = await familySeedingService.getScenarios();
      setScenarios(scenarioList);
      
      // If no scenarios are available (likely due to 404), show a helpful message
      if (scenarioList.length === 0) {
        setError('Family seeding service is not yet available on this server. The backend endpoints may not be implemented yet.');
        return;
      }
      
      // Set initial scenario to first non-clear scenario after loading
      if (scenarioList.length > 1) {
        setSelectedScenario(scenarioList[1].scenario); // Skip ClearAll which is first
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadTestFamilies = async () => {
    try {
      setLoadingFamilies(true);
      const families = await familySeedingService.getTestFamilies();
      setTestFamilies(families);
    } catch (err: unknown) {
      console.warn('Failed to load test families:', err);
      // Don't set error for this - it's not critical
    } finally {
      setLoadingFamilies(false);
    }
  };

  const handleSeedFamily = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Generate more unique family name with timestamp and random string
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const uniqueFamilyName = customFamilyName 
        ? `${customFamilyName}-${timestamp}-${randomSuffix}` 
        : `Family-${timestamp}-${randomSuffix}`;

      // Fix API request structure to match backend expectations
      const request = {
        scenario: selectedScenario,
        memberCount: memberCount || 0,
        familyName: uniqueFamilyName,
        clearExisting: true, // Always clear existing to prevent email conflicts
      };

      const response = await familySeedingService.seedFamily(request);
      setResult(response);
      setShowDetails(true);
      
      // Reload test families to show the newly seeded family
      await loadTestFamilies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async (scenario: FamilyScenario) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get default member count for the scenario to avoid 0 which triggers clear
      const scenarioInfo = scenarios.find(s => s.scenario === scenario);
      const defaultMemberCount = scenarioInfo?.defaultMemberCount || 2; // Fallback to 2
      
      // Generate very unique family name for quick seed
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const uniqueFamilyName = `${scenarioInfo?.name || 'Quick'}-${timestamp}-${randomSuffix}`;
      
      // Use regular seedFamily method with unique name instead of quickSeed
      const request = {
        scenario: scenario,
        memberCount: defaultMemberCount,
        familyName: uniqueFamilyName,
        clearExisting: true, // Clear existing families to prevent email conflicts
      };
      
      const response = await familySeedingService.seedFamily(request);
      setResult(response);
      setShowDetails(true);
      
      // Reload test families to show the newly seeded family
      await loadTestFamilies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestFamilies = async () => {
    if (!window.confirm('Are you sure you want to clear ALL test families? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await familySeedingService.clearTestFamilies();
      setResult({
        success: true,
        message: response.message,
        familyId: 0,
        familyName: '',
        membersCreated: 0,
        seededMembers: [],
      });
      
      // Reload test families to reflect the clear
      await loadTestFamilies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isGlobalAdmin) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Access Denied</h3>
            <p className="text-red-600">
              Family seeding functionality is only accessible to global administrators (admin@tasktracker.com).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedScenarioInfo = scenarios.find(s => s.scenario === selectedScenario);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Family Seeding Panel</h2>
            <p className="text-sm text-gray-600">Create test families for comprehensive testing scenarios</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Service Not Available Banner - Only show when scenarios are empty and no error */}
        {scenarios.length === 0 && !error && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Service Information</span>
            </div>
            <div className="text-blue-700 mt-2">
              <p className="font-medium">Family Seeding Service Not Available</p>
              <p className="text-sm mt-1">
                The family seeding endpoints are not yet implemented on the backend server. 
                This feature allows administrators to create test families with various scenarios for testing purposes.
              </p>
              <div className="mt-3 text-xs text-blue-600">
                <p>Expected endpoints that would be available:</p>
                <ul className="ml-4 mt-1 list-disc">
                  <li>GET /api/v1/admin/family-seeding/scenarios</li>
                  <li>GET /api/v1/admin/family-seeding/test-families</li>
                  <li>POST /api/v1/admin/family-seeding/seed</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {result && result.success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-800 font-medium">Success</span>
              </div>
              
              {/* Navigation Buttons */}
              {result.familyId && result.familyId > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={navigateToDashboard}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={navigateToFamilyManagement}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Manage Family
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-green-700 mt-1">{result.message}</p>
            
            {result.seededMembers.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
                
                {result.familyId && result.familyId > 0 && (
                  <p className="text-sm text-green-600">
                    Family ID: {result.familyId} | Members: {result.seededMembers.length}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scenario Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Scenario
            </label>
            <select
              value={scenarios.length > 0 ? selectedScenario : ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value)) {
                  setSelectedScenario(value as FamilyScenario);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              disabled={loading || scenarios.length === 0}
            >
              {scenarios.length === 0 && (
                <option value="" className="text-gray-500">Loading scenarios...</option>
              )}
              {scenarios.map(scenario => (
                <option key={scenario.scenario} value={scenario.scenario} className="text-gray-900">
                  {scenario.name}
                </option>
              ))}
            </select>
            
            {selectedScenarioInfo && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{selectedScenarioInfo.description}</p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600">Default Members: {selectedScenarioInfo.defaultMemberCount}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Test Cases: {selectedScenarioInfo.testCases.join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Count
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={memberCount || 0}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setMemberCount(isNaN(value) ? 0 : value);
              }}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="0 = use default count"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set to 0 to use scenario default, or specify custom count (max 50)
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Custom Family Name (Optional)
            </label>
            <input
              type="text"
              value={customFamilyName}
              onChange={(e) => setCustomFamilyName(e.target.value)}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Leave empty for auto-generated name"
            />
          </div>
        </div>

        {/* Options */}
        <div className="mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              disabled={loading}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Clear existing test families first</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSeedFamily}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Seeding...' : 'Seed Family'}
          </button>

          <button
            onClick={handleClearTestFamilies}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Test Families
          </button>

          <button
            onClick={() => handleQuickSeed(FamilyScenario.Minimal)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings className="h-4 w-4" />
            Quick Minimal Test
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Scenarios</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {scenarios.slice(1, 9).map(scenario => (
              <button
                key={scenario.scenario}
                onClick={() => handleQuickSeed(scenario.scenario)}
                disabled={loading}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        {/* Member Details */}
        {showDetails && result && result.seededMembers.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Seeded Members ({result.seededMembers.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.seededMembers.map(member => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    {member.isAdmin && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getAgeGroupColor(member.ageGroup)}`}>
                        {member.ageGroup}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getRelationshipDisplayName(member.relationshipToAdmin)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Test Password:</span> {member.testPassword}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previously Seeded Families */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Previously Seeded Families</h3>
            <button
              onClick={loadTestFamilies}
              disabled={loadingFamilies}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {loadingFamilies ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {loadingFamilies ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Loading test families...</p>
            </div>
          ) : testFamilies.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No test families found</p>
              <p className="text-sm text-gray-500">Seed some families to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testFamilies.map(family => (
                <div key={family.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{family.name}</h4>
                    <span className="text-xs text-gray-500">ID: {family.id}</span>
                  </div>
                  
                  {family.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{family.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(family.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => router.push(`/family/${family.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
