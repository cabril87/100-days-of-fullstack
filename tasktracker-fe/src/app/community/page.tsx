export default function Community() {
  const communityStats = [
    { label: "Active Families", value: "10,000+", icon: "👨‍👩‍👧‍👦" },
    { label: "Tasks Completed", value: "2.5M+", icon: "✅" },
    { label: "Countries", value: "50+", icon: "🌍" },
    { label: "Success Stories", value: "500+", icon: "⭐" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mom of 3",
      content: "TaskTracker has transformed our family's daily routine. The kids are actually excited to do chores now!",
      avatar: "👩"
    },
    {
      name: "Mike Chen",
      role: "Dad & Teacher",
      content: "The gamification aspect is brilliant. My students and my own kids love the achievement system.",
      avatar: "👨"
    },
    {
      name: "Lisa Rodriguez",
      role: "Working Mom",
      content: "Finally, a way to keep everyone organized without constant nagging. The family leaderboard is a game-changer!",
      avatar: "👩‍💼"
    }
  ];

  const forumTopics = [
    {
      title: "Best Practices for Family Task Management",
      replies: 45,
      lastActivity: "2 hours ago",
      category: "Tips & Tricks"
    },
    {
      title: "Creative Reward Ideas for Kids",
      replies: 32,
      lastActivity: "4 hours ago",
      category: "Parenting"
    },
    {
      title: "Setting Up Effective Chore Rotations",
      replies: 28,
      lastActivity: "6 hours ago",
      category: "Organization"
    },
    {
      title: "Motivating Teenagers with Gamification",
      replies: 67,
      lastActivity: "1 day ago",
      category: "Teens"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">TaskTracker Community</h1>
        <p className="text-xl text-gray-600">
          Connect with families worldwide who are leveling up their productivity
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {communityStats.map((stat, index) => (
          <div key={index} className="text-center bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Success Stories */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Forum Preview */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Community Discussions</h2>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold">Popular Topics</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {forumTopics.map((topic, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{topic.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {topic.category}
                      </span>
                      <span>{topic.replies} replies</span>
                      <span>Last activity: {topic.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-6 py-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View All Discussions →
            </button>
          </div>
        </div>
      </div>

      {/* Join Community CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Growing Community</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Connect with other families, share tips, get support, and celebrate your productivity wins together.
        </p>
        <div className="space-x-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Join Discord Server
          </button>
          <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Follow on Social Media
          </button>
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="mt-16 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Community Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-green-600">✅ Do</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Be respectful and supportive</li>
              <li>• Share helpful tips and experiences</li>
              <li>• Celebrate others' achievements</li>
              <li>• Ask questions when you need help</li>
              <li>• Keep discussions family-friendly</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-red-600">❌ Don't</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Share personal information</li>
              <li>• Spam or self-promote</li>
              <li>• Use inappropriate language</li>
              <li>• Criticize parenting styles</li>
              <li>• Share unrelated content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 