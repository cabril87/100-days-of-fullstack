export default function Features() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">TaskTracker Features</h1>
      <p className="text-xl text-gray-600 text-center mb-12">
        Discover all the powerful features that make TaskTracker the ultimate productivity platform
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Gamified Task Management */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-xl font-bold mb-3">Gamified Experience</h3>
          <p className="text-gray-600">
            Turn productivity into a game! Earn XP, level up, unlock achievements, and compete with family members.
          </p>
        </div>

        {/* Smart Task Organization */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-3">Smart Organization</h3>
          <p className="text-gray-600">
            Organize tasks by priority, category, and due date. Use templates for recurring activities.
          </p>
        </div>

        {/* Family Collaboration */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-bold mb-3">Family Collaboration</h3>
          <p className="text-gray-600">
            Share tasks, assign chores, and track family progress together. Perfect for household management.
          </p>
        </div>

        {/* Analytics & Insights */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-3">Analytics & Insights</h3>
          <p className="text-gray-600">
            Visualize your productivity patterns, track completion rates, and identify areas for improvement.
          </p>
        </div>

        {/* Focus Mode */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-3">Focus Mode</h3>
          <p className="text-gray-600">
            Minimize distractions with our focus mode. Set timers, block notifications, and boost concentration.
          </p>
        </div>

        {/* Real-time Notifications */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-xl font-bold mb-3">Smart Notifications</h3>
          <p className="text-gray-600">
            Get timely reminders, achievement notifications, and family updates to stay on track.
          </p>
        </div>

        {/* Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold mb-3">Mobile Friendly</h3>
          <p className="text-gray-600">
            Access your tasks anywhere with our responsive design. Perfect for productivity on the go.
          </p>
        </div>

        {/* Security & Privacy */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
          <p className="text-gray-600">
            Your data is protected with enterprise-grade security. We respect your privacy and never sell your data.
          </p>
        </div>

        {/* Customizable Templates */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-3">Quick Templates</h3>
          <p className="text-gray-600">
            Save time with pre-built templates for common tasks like cleaning, homework, and daily routines.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-8">
          Join thousands of families who are already leveling up their productivity with TaskTracker.
        </p>
        <div className="space-x-4">
          <a
            href="/auth/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Free Trial
          </a>
          <a
            href="/docs"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
} 