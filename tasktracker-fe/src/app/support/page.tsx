import { PublicPagePattern } from '@/lib/auth/auth-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for proper authentication detection
export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  // Allow access regardless of auth state (hybrid page)
  await PublicPagePattern();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Customer Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We&apos;re here to help! Get assistance with your TaskTracker account, 
            report issues, or learn how to make the most of our features.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Live Chat Support</CardTitle>
              <CardDescription>
                Get instant help from our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Chat with our friendly support team for immediate assistance with your questions.
              </p>
              <Button className="w-full">Start Live Chat</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Send us a detailed message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Email us at{' '}
                <a 
                  href="mailto:support@tasktracker.com" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  support@tasktracker.com
                </a>
              </p>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I reset my password?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Go to the{' '}
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800">
                  forgot password page
                </Link>
                {' '}and enter your email address. We&apos;ll send you reset instructions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I join a family?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ask your family admin to send you an invitation link. Click the link and 
                follow the instructions to join your family&apos;s TaskTracker.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">How do points and achievements work?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You earn points by completing tasks, achieving goals, and maintaining streaks. 
                Check your dashboard to see your current points and available achievements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Other Ways to Reach Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-gray-600 dark:text-gray-300">1-800-TASKTRACKER</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-gray-600 dark:text-gray-300">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 