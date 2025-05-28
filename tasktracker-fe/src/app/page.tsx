import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
    

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements - only visible in dark mode */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse dark:block hidden"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000 dark:block hidden"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-full blur-3xl dark:block hidden"></div>

        {/* Dynamic gradient accent bars - only visible in dark mode */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse dark:block hidden"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50 dark:block hidden"></div>
        
        <div className="max-w-8xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <h1 className="text-7xl font-black text-gray-900 dark:bg-gradient-to-r dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 dark:bg-clip-text dark:text-transparent drop-shadow-lg">
                TaskTracker
              </h1>
              <div className="flex flex-col gap-1">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse delay-500 shadow-md"></div>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-3xl text-gray-900 dark:text-gray-200 max-w-4xl mx-auto font-bold leading-relaxed mb-4">
                Gamified Family Task Management
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
                Transform your family's productivity with achievements, rewards, and friendly competition. Make every task an adventure!
        </p>
      </div>

            {/* Enhanced feature badges with statistics */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="group px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  🏆 <span>Achievements System</span>
                </span>
              </div>
              <div className="group px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  ⭐ <span>Points & Rewards</span>
                </span>
              </div>
              <div className="group px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  👨‍👩‍👧‍👦 <span>Family Collaboration</span>
                </span>
              </div>
              <div className="group px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  📊 <span>Real-time Analytics</span>
                </span>
              </div>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-gray-700/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-black text-blue-600 dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 dark:bg-clip-text dark:text-transparent">10K+</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Families</div>
              </div>
              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-gray-700/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-black text-purple-600 dark:bg-gradient-to-r dark:from-purple-400 dark:to-indigo-400 dark:bg-clip-text dark:text-transparent">50K+</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks Completed</div>
              </div>
              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-gray-700/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-black text-indigo-600 dark:bg-gradient-to-r dark:from-indigo-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">25K+</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievements Earned</div>
              </div>
              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-gray-700/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl font-black text-green-600 dark:bg-gradient-to-r dark:from-green-400 dark:to-emerald-400 dark:bg-clip-text dark:text-transparent">98%</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="relative mx-auto max-w-5xl mb-16">
            <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-blue-900/80 dark:to-purple-900/85 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700/50 relative overflow-hidden">
              {/* Complex decorative background - only visible in dark mode */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl dark:block hidden"></div>
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl dark:block hidden"></div>
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-full blur-2xl dark:block hidden"></div>

              {/* Dynamic gradient accents - only visible in dark mode */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-t-3xl dark:block hidden"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50 rounded-b-3xl dark:block hidden"></div>

              <div className="relative z-10 p-12 flex flex-col items-center justify-center text-center">
                <div className="mb-8">
                  <h2 className="text-5xl font-black mb-4 text-gray-900 dark:bg-gradient-to-r dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 dark:bg-clip-text dark:text-transparent">
                    Ready to Level Up?
                  </h2>
                  <p className="text-xl mb-6 max-w-2xl text-gray-600 dark:text-gray-300 font-medium">
                    Join thousands of families who are already gamifying their productivity and achieving more together.
                  </p>

                  {/* Feature highlights */}
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-gradient-to-r dark:from-green-800/40 dark:to-emerald-800/40 rounded-full text-sm font-medium text-green-800 dark:text-green-200">
                      ✅ <span>Free to Start</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-gradient-to-r dark:from-blue-800/40 dark:to-purple-800/40 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200">
                      🚀 <span>Instant Setup</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-gradient-to-r dark:from-purple-800/40 dark:to-indigo-800/40 rounded-full text-sm font-medium text-purple-800 dark:text-purple-200">
                      👨‍👩‍👧‍👦 <span>Family Friendly</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
          <Link 
                      href="/auth/register"
                    className="group px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
          >
                    <span className="relative z-10 flex items-center gap-3">
                      🚀 <span>Start Your Adventure</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link 
            href="/auth/login"
                    className="group px-10 py-5 bg-white dark:bg-gradient-to-r dark:from-gray-700/90 dark:to-gray-600/90 text-gray-800 dark:text-gray-100 rounded-2xl hover:bg-gray-50 dark:hover:from-gray-600/90 dark:hover:to-gray-500/90 transition-all font-bold text-xl border-2 border-gray-200 dark:border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
          >
                    <span className="relative z-10 flex items-center gap-3">
                      🎯 <span>Sign In</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

                {/* Trust indicators */}
                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                    <span>4.9/5 Rating</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div>10,000+ Happy Families</div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div>🔒 Secure & Private</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gradient-to-b dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
        {/* Complex background patterns - only visible in dark mode */}
        <div className="absolute inset-0 bg-gray-50 dark:bg-gradient-to-t dark:from-gray-900/40 dark:via-blue-900/30 dark:to-purple-900/40 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>

        {/* Floating decorative elements - only visible in dark mode */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-full blur-3xl animate-pulse dark:block hidden"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse delay-1000 dark:block hidden"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-gray-900 dark:bg-gradient-to-r dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 dark:bg-clip-text dark:text-transparent">
              Powerful Gamification Features
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              Transform your family's productivity with our comprehensive suite of gamified tools and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Task Management */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-green-900/20 dark:to-emerald-900/30 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 dark:block hidden"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Smart Task Management</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Create, organize, and complete tasks with intelligent categorization. Earn XP points and unlock achievements with every completed task.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>+50 XP per task</span>
                </div>
              </div>
            </div>
            
            {/* Achievements & Rewards */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-purple-900/20 dark:to-indigo-900/30 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-t-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 dark:block hidden"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Achievements & Rewards</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Unlock 50+ unique badges, earn trophies, and collect rewards. Track your progress with beautiful dashboards and detailed analytics.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>50+ Achievements</span>
                </div>
              </div>
            </div>

            {/* Family Collaboration */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-orange-900/20 dark:to-red-900/30 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-t-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 dark:block hidden"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Family Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Create family groups, assign tasks to members, and compete on real-time leaderboards. Make productivity a fun family adventure!
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Real-time Leaderboards</span>
                </div>
              </div>
            </div>

            {/* Real-time Analytics */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-blue-900/20 dark:to-cyan-900/30 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-t-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 dark:block hidden"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Real-time Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Track productivity trends, monitor family progress, and get insights with beautiful charts and comprehensive reporting tools.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Live Progress Tracking</span>
                </div>
              </div>
      </div>

            {/* Smart Notifications */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-yellow-900/20 dark:to-amber-900/30 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-t-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 dark:block hidden"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM12 17h-7a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6M9 9l3 3m0 0l3-3m-3 3V4" />
              </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Smart Notifications</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Get intelligent reminders, achievement notifications, and family updates. Never miss important tasks or celebrations again.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>AI-Powered Reminders</span>
                </div>
              </div>
            </div>

            {/* Focus Mode */}
            <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-indigo-900/20 dark:to-purple-900/30 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 dark:block hidden"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Focus Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Enter distraction-free focus sessions with Pomodoro timers, ambient sounds, and productivity tracking for maximum efficiency.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>Pomodoro Timer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-white dark:bg-gradient-to-br dark:from-gray-900/80 dark:via-purple-900/60 dark:to-blue-900/80 z-0"></div>

        {/* Animated background elements - only visible in dark mode */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/8 to-blue-600/8 rounded-full blur-3xl animate-pulse dark:block hidden"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/8 to-indigo-600/8 rounded-full blur-3xl animate-pulse delay-1000 dark:block hidden"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-purple-900/30 dark:to-blue-900/40 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700/50 relative overflow-hidden p-16">
            {/* Complex decorative background - only visible in dark mode */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-full blur-3xl dark:block hidden"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-full blur-3xl dark:block hidden"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-indigo-600/3 to-purple-600/3 rounded-full blur-2xl dark:block hidden"></div>

            {/* Dynamic gradient accents - only visible in dark mode */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-t-3xl dark:block hidden"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50 rounded-b-3xl dark:block hidden"></div>

            <div className="text-center relative z-10">
              <h2 className="text-5xl font-black mb-6 text-gray-900 dark:bg-gradient-to-r dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 dark:bg-clip-text dark:text-transparent">
                Loved by Families Worldwide
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto font-medium">
                See what families are saying about their productivity transformation with TaskTracker
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {/* Testimonial Cards */}
                <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-green-900/20 dark:to-emerald-900/30 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300 dark:block hidden"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400 mb-2">
                        ⭐⭐⭐⭐⭐
                      </div>
                    </div>
                    <p className="italic text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                      "TaskTracker has completely transformed how our family manages daily tasks. The kids love earning points and badges!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        S
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">Sarah Johnson</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mother of 3, Designer</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-purple-900/20 dark:to-indigo-900/30 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300 dark:block hidden"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400 mb-2">
                        ⭐⭐⭐⭐⭐
                      </div>
                    </div>
                    <p className="italic text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                      "The family leaderboard has made chores fun! My teenagers actually compete to do more tasks now."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">Michael Chen</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Father of 2, Developer</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-orange-900/20 dark:to-red-900/30 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden md:col-span-2 lg:col-span-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300 dark:block hidden"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400 mb-2">
                        ⭐⭐⭐⭐⭐
                      </div>
                    </div>
                    <p className="italic text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                      "Amazing app! The achievements system keeps everyone motivated. We've never been more organized as a family."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        E
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">Emily Rodriguez</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mother of 4, Teacher</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium">App of the Year Nominee</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <span className="font-medium">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  <span className="font-medium">Family Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <span className="font-medium">Cross Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gradient-to-br dark:from-gray-900/70 dark:via-purple-900/50 dark:to-blue-900/70 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent"></div>

        {/* Animated background elements - only visible in dark mode */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/8 to-blue-600/8 rounded-full blur-3xl animate-pulse dark:block hidden"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/8 to-indigo-600/8 rounded-full blur-3xl animate-pulse delay-1000 dark:block hidden"></div>

        <div className="max-w-8xl mx-auto text-center relative z-10">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/95 dark:via-purple-900/30 dark:to-blue-900/40 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700/50 relative overflow-hidden p-16">
            {/* Complex decorative background - only visible in dark mode */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-full blur-3xl dark:block hidden"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-full blur-3xl dark:block hidden"></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-indigo-600/3 to-purple-600/3 rounded-full blur-2xl dark:block hidden"></div>

            {/* Dynamic gradient accents - only visible in dark mode */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-t-3xl animate-pulse dark:block hidden"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50 rounded-b-3xl dark:block hidden"></div>

            <div className="relative z-10">
              <div className="mb-12">
                <h2 className="text-6xl font-black mb-6 text-gray-900 dark:bg-gradient-to-r dark:from-blue-300 dark:via-purple-300 dark:to-indigo-300 dark:bg-clip-text dark:text-transparent">
                  Start Your Family's Adventure Today
                </h2>
                <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto font-medium leading-relaxed">
                  Transform your family's productivity with gamified task management. Join thousands of families who are already leveling up their daily routines.
                </p>

                {/* Enhanced feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gradient-to-br dark:from-gray-700/80 dark:to-gray-600/70 rounded-2xl p-6 border border-gray-200 dark:border-gray-600/50 shadow-lg">
                    <div className="text-3xl mb-3">🚀</div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Quick Setup</h3>
                    <p className="text-gray-600 dark:text-gray-300">Get started in under 5 minutes</p>
                  </div>
                  <div className="bg-white dark:bg-gradient-to-br dark:from-gray-700/80 dark:to-gray-600/70 rounded-2xl p-6 border border-gray-200 dark:border-gray-600/50 shadow-lg">
                    <div className="text-3xl mb-3">💎</div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Premium Features</h3>
                    <p className="text-gray-600 dark:text-gray-300">Free forever, premium optional</p>
                  </div>
                  <div className="bg-white dark:bg-gradient-to-br dark:from-gray-700/80 dark:to-gray-600/70 rounded-2xl p-6 border border-gray-200 dark:border-gray-600/50 shadow-lg">
                    <div className="text-3xl mb-3">🛡️</div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Family Safe</h3>
                    <p className="text-gray-600 dark:text-gray-300">COPPA compliant & secure</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                href="/auth/register"
                  className="group px-12 py-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all font-black text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
              >
                  <span className="relative z-10 flex items-center gap-4">
                    🎮 <span>Start Gaming Your Tasks</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link 
                  href="/auth/login"
                  className="group px-12 py-6 bg-white dark:bg-gradient-to-r dark:from-gray-700/90 dark:to-gray-600/90 text-gray-800 dark:text-gray-100 rounded-2xl hover:bg-gray-50 dark:hover:from-gray-600/90 dark:hover:to-gray-500/90 transition-all font-black text-2xl border-2 border-gray-200 dark:border-gray-500 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
              >
                  <span className="relative z-10 flex items-center gap-4">
                    🏠 <span>Welcome Back</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              </div>

              {/* Enhanced trust indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">⭐</span>
                  <span className="font-bold text-lg">4.9/5</span>
                  <span className="text-sm">User Rating</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                  <span className="font-bold text-lg">10K+</span>
                  <span className="text-sm">Active Families</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">🔒</span>
                  <span className="font-bold text-lg">100%</span>
                  <span className="text-sm">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📱</span>
                  <span className="font-bold text-lg">All</span>
                  <span className="text-sm">Devices</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer links */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-600 dark:text-gray-400">
            <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">About</Link>
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Terms</Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Contact</Link>
            <Link href="/support" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Support</Link>
            <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Blog</Link>
          </div>
        </div>
      </section>
    </div>
  );
}