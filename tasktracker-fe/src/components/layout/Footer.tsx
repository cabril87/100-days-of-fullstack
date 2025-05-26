'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthContext';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 border-t border-gray-200 dark:border-gray-700/50 relative overflow-hidden">
      {/* Decorative elements for dark mode */}
      <div className="absolute inset-0 hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center group mb-4">
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 group-hover:from-purple-800 group-hover:via-indigo-800 group-hover:to-blue-800 transition-all duration-300">
                TaskTracker
              </span>
              <div className="ml-3 flex flex-col gap-0.5">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-md"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse delay-500 shadow-sm"></div>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Transform your productivity with gamified task management. Level up your life, one task at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 text-sm font-medium">
                  About TaskTracker
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors duration-200 text-sm font-medium">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors duration-200 text-sm font-medium">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors duration-200 text-sm font-medium">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent dark:from-green-400 dark:to-blue-400">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors duration-200 text-sm font-medium">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 text-sm font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors duration-200 text-sm font-medium">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200 text-sm font-medium">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication Section - Only show when not authenticated */}
          {!user && (
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
                Get Started
              </h3>
              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-6 py-3 bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 font-bold text-sm shadow-sm hover:shadow-md"
                >
                  🔑 Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    🚀 <span>Sign Up Free</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 TaskTracker. All rights reserved. Built with ❤️ for productivity enthusiasts.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements for dark mode */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900/20 to-transparent hidden dark:block"></div>
    </footer>
  );
} 