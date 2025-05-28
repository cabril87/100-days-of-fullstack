export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "10 Tips for Gamifying Your Daily Routine",
      excerpt: "Discover how to turn mundane tasks into exciting challenges that motivate you to be more productive.",
      date: "2025-01-15",
      author: "TaskTracker Team",
      readTime: "5 min read",
      category: "Productivity"
    },
    {
      id: 2,
      title: "Building Better Family Habits Together",
      excerpt: "Learn how families are using TaskTracker to create positive routines and strengthen relationships.",
      date: "2025-01-10",
      author: "Sarah Johnson",
      readTime: "7 min read",
      category: "Family"
    },
    {
      id: 3,
      title: "The Science Behind Gamification",
      excerpt: "Explore the psychological principles that make gamified task management so effective.",
      date: "2025-01-05",
      author: "Dr. Michael Chen",
      readTime: "8 min read",
      category: "Research"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">TaskTracker Blog</h1>
        <p className="text-xl text-gray-600">
          Tips, insights, and stories about productivity and family collaboration
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">{post.readTime}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 cursor-pointer">
              {post.title}
            </h2>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>By {post.author}</span>
                <span>•</span>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Read More →
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-gray-600 mb-6">
          Subscribe to our newsletter for the latest productivity tips and TaskTracker updates.
        </p>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg font-medium transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
} 