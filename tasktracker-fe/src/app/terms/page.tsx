import { PublicPagePattern } from '@/lib/auth/auth-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, AlertTriangle, Mail } from 'lucide-react';

// Force dynamic rendering for proper authentication detection
export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  // Allow access regardless of auth state
  await PublicPagePattern();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: January 15, 2025
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            These terms govern your use of TaskTracker. Please read them carefully.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-amber-800 dark:text-amber-200">Important</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-200">
              By using TaskTracker, you agree to these terms. If you don&apos;t agree, 
              please don&apos;t use our service. These terms may change, and we&apos;ll notify you of significant updates.
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                By accessing or using TaskTracker, you agree to be bound by these 
                Terms of Service. These Terms apply to all visitors, users, and others 
                who access or use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                TaskTracker is a family task management and gamification platform that helps 
                families organize, track, and complete tasks together.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:legal@tasktracker.com" className="text-blue-600 hover:text-blue-800">
                      legal@tasktracker.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Scale className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Legal Department</p>
                    <p className="text-gray-600 dark:text-gray-300">TaskTracker, Raleigh, NC</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
