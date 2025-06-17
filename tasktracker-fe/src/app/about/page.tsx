import { PublicPagePattern } from '@/lib/auth/auth-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Heart, Zap, Award, Globe } from 'lucide-react';

// Force dynamic rendering for proper authentication detection
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  // Allow access regardless of auth state
  await PublicPagePattern();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About TaskTracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to transform how families manage tasks and achieve goals together. 
            Through gamification and collaboration, we make productivity fun and rewarding.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              To empower families worldwide to achieve their goals together through innovative, 
              gamified task management that turns everyday productivity into an engaging, 
              collaborative experience.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Family First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe that families are stronger when they work together. 
                  Our platform is designed to bring families closer through shared goals and achievements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Simplicity & Joy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Productivity shouldn't be a chore. We make task management enjoyable 
                  with intuitive design and rewarding gamification elements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We continuously evolve our platform with cutting-edge features, 
                  AI-driven insights, and user-requested improvements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>
                TaskTracker was born from a simple observation: traditional task management tools 
                were built for individuals, not families. As busy parents and professionals, 
                our founders struggled to coordinate household responsibilities, track children's 
                chores, and maintain family goals.
              </p>
              <p>
                Founded in 2024 in Raleigh, NC, we set out to create something different. 
                We combined the engagement of gaming with the practicality of task management, 
                creating a platform where completing chores earns points, family challenges 
                bring everyone together, and achievements celebrate both individual and collective success.
              </p>
              <p>
                Today, thousands of families use TaskTracker to stay organized, motivated, 
                and connected. From single parents managing busy schedules to large families 
                coordinating complex routines, our platform adapts to every family's unique needs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-300">Active Families</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-300">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">1M+</div>
            <div className="text-gray-600 dark:text-gray-300">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">25K+</div>
            <div className="text-gray-600 dark:text-gray-300">Achievements Unlocked</div>
          </div>
        </div>

        {/* Team Preview */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Meet the Team</CardTitle>
            <CardDescription>
              Passionate individuals dedicated to helping families succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">CA</span>
                </div>
                <h3 className="font-semibold text-lg">Carlos Abril</h3>
                <p className="text-gray-600 dark:text-gray-300">Founder & CEO</p>
                <div className="flex justify-center mt-2">
                  <Badge variant="outline">Full-Stack Developer</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">TT</span>
                </div>
                <h3 className="font-semibold text-lg">The Team</h3>
                <p className="text-gray-600 dark:text-gray-300">Growing Daily</p>
                <div className="flex justify-center mt-2">
                  <Badge variant="outline">Join Us!</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Community</h3>
                <p className="text-gray-600 dark:text-gray-300">Families Worldwide</p>
                <div className="flex justify-center mt-2">
                  <Badge variant="outline">Global Impact</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="py-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Want to Learn More?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We'd love to hear from you! Reach out with questions, feedback, or just to say hello.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Contact Us
              </a>
              <a 
                href="/support" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Get Support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 