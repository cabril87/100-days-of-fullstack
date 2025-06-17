import { PublicPagePattern } from '@/lib/auth/auth-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, Users, Zap, Trophy, Calendar, 
  BarChart3, Bell, Shield, Smartphone, Cloud,
  Target, Star, Gift, Medal, Crown, 
  Gamepad2, TrendingUp, Clock, MapPin
} from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for proper authentication detection
export const dynamic = 'force-dynamic';

export default async function FeaturesPage() {
  // Allow access regardless of auth state
  await PublicPagePattern();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Features for Modern Families
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how TaskTracker transforms everyday productivity into an engaging, 
            collaborative experience that brings families together.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Task Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Task Management</CardTitle>
              <CardDescription>
                Organize, prioritize, and track tasks with intelligent features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Drag & drop task organization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Due dates and reminders
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Priority levels and categories
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Recurring task templates
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Family Collaboration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Family Collaboration</CardTitle>
              <CardDescription>
                Work together towards common goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Shared family boards
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Task assignment and delegation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time updates and notifications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Family goal tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Gamification System</CardTitle>
              <CardDescription>
                Turn productivity into a rewarding game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Points and experience system
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Achievements and badges
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Level progression
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Streak tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Insights to improve family productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Productivity trends
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Family performance metrics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Goal completion rates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Custom reports
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>
                Sync with your existing calendar apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Google Calendar sync
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Outlook integration
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Apple Calendar support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Event-based task creation
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Mobile App */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Mobile Experience</CardTitle>
              <CardDescription>
                Full-featured mobile app for on-the-go productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  iOS and Android apps
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Offline functionality
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Push notifications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Voice task creation
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Deep Dive */}
        <Card className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Advanced Gamification</CardTitle>
            <CardDescription>
              Make productivity addictive with game-like elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Achievements</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Unlock badges for completing tasks, maintaining streaks, and reaching milestones
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Leaderboards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Friendly competition with family members across different categories
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Rewards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Earn virtual and real-world rewards for consistent performance
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Challenges</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Weekly and monthly challenges to keep everyone engaged
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Security & Privacy First</CardTitle>
            <CardDescription>
              Your family's data is protected with enterprise-grade security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="font-semibold mb-3">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All data is encrypted in transit and at rest using industry-standard protocols
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold mb-3">GDPR Compliant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Full compliance with international privacy regulations and data protection laws
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold mb-3">Zero Data Selling</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We never sell your data. Your privacy is not our product
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription>
              Exciting features in development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Task Suggestions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Smart recommendations based on your patterns</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Context-aware alerts that don't overwhelm</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Location-Based Tasks</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tasks that trigger based on your location</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Cloud className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Integrations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Connect with more apps and services</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Goal Templates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pre-built goal templates for common objectives</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Time Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Built-in time tracking for tasks and projects</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Family&apos;s Productivity?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of families who have discovered the joy of gamified task management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="font-bold px-8 py-3">
                  View Pricing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 