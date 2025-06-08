'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { familySeedingService } from '@/lib/services/familySeedingService';
import { FamilyScenario } from '@/lib/types/familySeeding';
import { AdminDashboardContentProps } from '@/lib/types/admin';
import { 
  Users, 
  Settings, 
  Database, 
  Play, 
  Trash2, 
  Eye, 
  Home,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function AdminDashboardContent({ user, initialData }: AdminDashboardContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const quickSeedFamily = async (scenario: FamilyScenario, scenarioName: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await familySeedingService.quickSeed(scenario, 4);
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully seeded ${scenarioName} family with ${response.membersCreated} members` 
        });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to seed family' 
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllFamilies = async () => {
    if (!window.confirm('Are you sure you want to clear ALL test families? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await familySeedingService.clearTestFamilies();
      setMessage({ type: 'success', text: 'Successfully cleared all test families' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to clear families' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Global administrator tools for managing the TaskTracker application
        </p>
      </div>

      {/* System Stats */}
      {(initialData.stats.totalUsers > 0 || initialData.stats.totalFamilies > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.totalFamilies}</div>
              <p className="text-xs text-muted-foreground">Total Families</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">Active Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold capitalize">{initialData.stats.systemHealth}</div>
              <p className="text-xs text-muted-foreground">System Health</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Family Seeding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Family Seeding
            </CardTitle>
            <CardDescription>
              Create test families with realistic data for development and testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/admin/family-seeding')}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced Seeding
            </Button>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick Actions:</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => quickSeedFamily(FamilyScenario.NuclearFamily, 'Nuclear')}
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Nuclear Family
                </Button>
                <Button 
                  onClick={() => quickSeedFamily(FamilyScenario.SingleParent, 'Single Parent')}
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Single Parent
                </Button>
                <Button 
                  onClick={clearAllFamilies}
                  size="sm"
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  disabled={loading}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All Families
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Navigation & Testing
            </CardTitle>
            <CardDescription>
              Quick access to main application areas for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/settings/family')}
              variant="outline"
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Family Management
            </Button>
            <Button 
              onClick={() => router.push('/settings/security')}
              variant="outline"
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              User Management
            </CardTitle>
            <CardDescription>
              Create and manage user accounts for testing family features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/admin/user-creation')}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Users className="h-4 w-4 mr-2" />
              Create New User
            </Button>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Features:</p>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>• Create users with different age groups</div>
                <div>• Assign users to existing families</div>
                <div>• Test Pass the Baton functionality</div>
                <div>• Verify privilege management</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system status and admin information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Admin Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium">{user.role || 'Global Admin'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                <span className="font-medium">{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <h4>How to test the features:</h4>
            <ol>
              <li><strong>Family Seeding:</strong> Use the quick actions above to create test families</li>
              <li><strong>User Creation:</strong> Create new users with different age groups and assign them to families</li>
              <li><strong>Dashboard Check:</strong> Go to Dashboard to see if seeded families appear</li>
              <li><strong>Family Navigation:</strong> Go to Family Management and click on family cards to navigate to family detail pages</li>
              <li><strong>Pass the Baton:</strong> Test ownership transfer between users of different age groups</li>
              <li><strong>Privilege Testing:</strong> Verify age-based permissions work correctly</li>
            </ol>
            
            <h4>Expected Behavior:</h4>
            <ul>
              <li>Seeded families should appear in both Dashboard and Family Management</li>
              <li>Clicking family cards should navigate to <code>/family/[id]</code> pages</li>
              <li>Family detail pages should show member information and statistics</li>
              <li>Admin user should be automatically added as family admin to seeded families</li>
              <li>Created users should be assignable to families with appropriate roles</li>
              <li>Age-based restrictions should prevent children from managing families</li>
              <li>Pass the Baton should work between eligible users (teens and adults)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 