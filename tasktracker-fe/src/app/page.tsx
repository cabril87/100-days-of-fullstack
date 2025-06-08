import { PublicPagePattern } from '@/lib/auth/auth-config';
import { ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';
  
export default async function HomePage() {
  // Allow access regardless of auth state
  await PublicPagePattern();

  // Render public landing page
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            TaskTracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your productivity with gamified task management. Earn points, level up, and achieve your goals with style.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                🚀 Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="font-bold px-8 py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300">
                🔑 Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <Card className="bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500/20">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Organize, prioritize, and track your tasks with intelligent features that adapt to your workflow.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-500/20">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Gamification System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Earn points, unlock achievements, and level up as you complete tasks and reach your goals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-500/20">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Family Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Share tasks, track family goals, and celebrate achievements together with collaborative features.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who have leveled up their task management game.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}