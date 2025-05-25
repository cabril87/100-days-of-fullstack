import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with improved design */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream to-white dark:from-navy-dark dark:to-navy opacity-70 z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-navy opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-beige opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 gradient-text">TaskTracker</h1>
            <p className="text-2xl tagline max-w-3xl mx-auto font-medium leading-relaxed">
              Beautiful task management for the way you work.
        </p>
      </div>

          <div className="relative mx-auto max-w-4xl h-[400px] mb-16">
            <div className="apple-card absolute top-0 left-0 w-full h-full overflow-hidden flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-dark/10 to-brand-navy/10 z-0"></div>
                <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full">
                  <h2 className="text-4xl font-semibold mb-6">Organize your life</h2>
                  <p className="text-xl mb-8 text-center max-w-lg tagline">
                    Seamlessly manage tasks, set priorities, and track your progress with our intuitive interface.
          </p>
                  <div className="flex flex-col sm:flex-row gap-4">
          <Link 
                      href="/auth/register"
                      className="px-8 py-4 bg-brand-navy text-white rounded-full hover:bg-opacity-90 transition-all font-medium text-lg shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
          <Link 
            href="/auth/login"
                      className="px-8 py-4 bg-white bg-opacity-50 backdrop-blur-sm text-gray-800 rounded-full hover:bg-opacity-70 transition-all font-medium text-lg border border-white/30 shadow-sm hover:shadow-md"
          >
            Sign In
          </Link>
        </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with improved card layout */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white bg-opacity-50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream/30 to-white/20 z-0"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">Designed for productivity</h2>
            <p className="text-xl tagline max-w-2xl mx-auto">
              Powerful features wrapped in a beautiful, intuitive interface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="apple-card flex flex-col items-center text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-full bg-brand-navy-dark bg-opacity-20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-navy-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Task Management</h3>
              <p className="text-gray-700 dark:text-gray-200">
                Create, organize, and track your tasks with ease. Set priorities and due dates to stay on top of your work.
              </p>
            </div>
            
            <div className="apple-card flex flex-col items-center text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-full bg-brand-beige bg-opacity-30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Beautiful Dashboard</h3>
              <p className="text-gray-700 dark:text-gray-200">
                Get a complete overview of your tasks with our intuitive dashboard. Track progress and stay motivated.
              </p>
      </div>

            <div className="apple-card flex flex-col items-center text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-full bg-brand-navy bg-opacity-20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Secure by Design</h3>
              <p className="text-gray-700 dark:text-gray-200">
                Your data is protected with enterprise-grade security including CSRF protection and XSS prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section with improved styling */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-brand-cream/20 dark:from-navy-dark/50 dark:to-navy/50 z-0"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="apple-card bg-gradient-to-br from-brand-cream/90 to-white/90 dark:from-navy/90 dark:to-navy-dark/90">
          <div className="text-center">
              <h2 className="text-3xl font-semibold mb-12">Why people love TaskTracker</h2>
              
              <div className="flex flex-col md:flex-row gap-8 justify-center">
                <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-sm flex-1 max-w-md dark:bg-white/10 border border-white/50">
                  <p className="italic text-gray-700 dark:text-gray-200 mb-4">
                    &ldquo;TaskTracker has completely transformed how I manage my daily tasks. The interface is intuitive and beautiful.&rdquo;
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Sarah J., Designer</p>
                </div>
                
                <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-sm flex-1 max-w-md dark:bg-white/10 border border-white/50">
                  <p className="italic text-gray-700 dark:text-gray-200 mb-4">
                    &ldquo;The dashboard gives me a perfect overview of what needs to be done. I&apos;ve never been more productive.&rdquo;
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Michael T., Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-navy/10 to-brand-beige/10 relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent dark:from-navy-dark dark:to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="apple-card p-10 shadow-lg">
            <h2 className="text-4xl font-semibold mb-6">Ready to get organized?</h2>
            <p className="text-xl tagline mb-10 max-w-2xl mx-auto">
              Join thousands of users who are already managing their tasks more efficiently with TaskTracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register"
                className="px-8 py-4 bg-brand-navy text-white rounded-full hover:bg-opacity-90 transition-all font-medium text-lg shadow-md hover:shadow-lg"
              >
                Start for Free
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-white bg-opacity-60 backdrop-blur-sm text-gray-800 rounded-full hover:bg-opacity-80 transition-all font-medium text-lg border border-white/30 dark:text-gray-100 dark:bg-white/10 shadow-sm hover:shadow-md"
              >
                View Demo
              </Link>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
