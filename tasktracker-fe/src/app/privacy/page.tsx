import { PublicPagePattern } from '@/lib/auth/auth-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users, Database, Mail } from 'lucide-react';

// Force dynamic rendering for proper authentication detection
export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  // Allow access regardless of auth state
  await PublicPagePattern();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: January 15, 2025
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        {/* Quick Overview */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle>Privacy at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Lock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Encrypted</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">All data encrypted in transit and at rest</p>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Transparent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Clear about what we collect and why</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Your Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">You own your data and can delete it anytime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Name and email address when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Family member information when you create or join a family</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Usage Data</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Tasks, goals, and achievements you create</li>
                <li>App usage patterns and feature interactions</li>
                <li>Device information and browser type</li>
                <li>IP address and general location (city/state level)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Communication Data</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Messages you send through our support system</li>
                <li>Feedback and survey responses</li>
                <li>Email preferences and notification settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-3">Service Provision</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Provide and maintain TaskTracker services</li>
                <li>Enable family collaboration features</li>
                <li>Calculate points, achievements, and gamification elements</li>
                <li>Sync data across your devices</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Communication</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Send important service updates and notifications</li>
                <li>Respond to your support requests</li>
                <li>Send optional product updates (with your consent)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Improvement</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Analyze usage patterns to improve our service</li>
                <li>Debug issues and optimize performance</li>
                <li>Develop new features based on user needs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <p className="text-green-800 dark:text-green-200 font-semibold">
                  We do not sell, rent, or trade your personal information to third parties.
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-3">Family Members</h3>
              <p className="mb-4">
                When you join a family, certain information (name, tasks, achievements) is shared 
                with other family members to enable collaboration features.
              </p>

              <h3 className="text-lg font-semibold mb-3">Service Providers</h3>
              <p className="mb-4">
                We work with trusted third-party services for:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Cloud hosting and data storage (encrypted)</li>
                <li>Email delivery services</li>
                <li>Payment processing (we don&apos;t store payment info)</li>
                <li>Analytics (anonymized data only)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Legal Requirements</h3>
              <p>
                We may disclose information if required by law, court order, or to protect 
                the rights and safety of our users and service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Measures</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Secure HTTPS connections</li>
                    <li>Regular security audits and updates</li>
                    <li>Multi-factor authentication support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Operational Measures</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Limited employee access to data</li>
                    <li>Background checks for staff</li>
                    <li>Incident response procedures</li>
                    <li>Regular backup and recovery testing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-3">Access and Control</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><strong>Access:</strong> View all data we have about you</li>
                <li><strong>Update:</strong> Correct or update your information</li>
                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Communication Preferences</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Opt out of marketing emails anytime</li>
                <li>Control notification settings in your account</li>
                <li>Choose what family information to share</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">How to Exercise Your Rights</h3>
              <p>
                Contact us at <a href="mailto:privacy@tasktracker.com" className="text-blue-600 hover:text-blue-800">privacy@tasktracker.com</a> or 
                use the data management tools in your account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Active accounts:</strong> Data retained while your account is active</li>
                <li><strong>Inactive accounts:</strong> Data deleted after 2 years of inactivity</li>
                <li><strong>Deleted accounts:</strong> Most data deleted within 30 days</li>
                <li><strong>Legal requirements:</strong> Some data may be retained longer if required by law</li>
                <li><strong>Anonymized data:</strong> May be retained for analytics and service improvement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-4">
                TaskTracker is designed for families, including children. We take special care 
                to protect children&apos;s privacy:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Children&apos;s accounts must be created by a parent or guardian</li>
                <li>Parents control what information children can share</li>
                <li>We don&apos;t collect more information from children than necessary</li>
                <li>Parents can review and delete their children&apos;s data at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Users</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-4">
                TaskTracker is operated from the United States. If you&apos;re using our service 
                from outside the US, your data may be transferred to and processed in the US.
              </p>
              <p>
                We comply with applicable international privacy laws, including GDPR for EU users 
                and CCPA for California residents.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-4">
                We may update this privacy policy from time to time. When we do:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We&apos;ll update the &quot;Last updated&quot; date at the top</li>
                <li>We&apos;ll notify you of significant changes via email</li>
                <li>We&apos;ll post a notice in the app for major updates</li>
                <li>Continued use of the service means acceptance of the new policy</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  If you have questions about this privacy policy or our data practices, 
                  please contact us:
                </p>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:privacy@tasktracker.com" className="text-blue-600 hover:text-blue-800">
                      privacy@tasktracker.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Data Protection Officer</p>
                    <a href="mailto:dpo@tasktracker.com" className="text-blue-600 hover:text-blue-800">
                      dpo@tasktracker.com
                    </a>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>For urgent privacy concerns:</strong> Please include &quot;URGENT PRIVACY&quot; 
                    in your email subject line for faster response.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
