import { PublicPagePattern } from '@/lib/auth/auth-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for proper authentication detection
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  // Allow access regardless of auth state
  await PublicPagePattern();
  
  const blogPosts = [
    {
      id: 1,
      title: "5 Ways to Make Chores Fun for Kids",
      excerpt: "Transform household tasks into engaging activities that kids actually want to do. From gamification to music, discover proven strategies that work.",
      author: "Carlos Abril",
      date: "January 10, 2025",
      category: "Family Tips",
      readTime: "5 min read",
      featured: true
    },
    {
      id: 2,
      title: "The Science Behind Gamification in Productivity",
      excerpt: "Why do points, badges, and leaderboards work so well? Explore the psychology behind gamification and how it can boost your family's motivation.",
      author: "TaskTracker Team",
      date: "January 8, 2025",
      category: "Research",
      readTime: "7 min read",
      featured: false
    },
    {
      id: 3,
      title: "Building Healthy Family Routines That Stick",
      excerpt: "Creating lasting habits is hard, but with the right approach, your family can build routines that become second nature. Here's how to start.",
      author: "Dr. Sarah Chen",
      date: "January 5, 2025",
      category: "Lifestyle",
      readTime: "6 min read",
      featured: false
    },
    {
      id: 4,
      title: "TaskTracker Update: New Achievement System",
      excerpt: "We've completely redesigned our achievement system based on your feedback. Learn about the new badges, levels, and rewards coming this month.",
      author: "Carlos Abril",
      date: "January 3, 2025",
      category: "Product Updates",
      readTime: "4 min read",
      featured: false
    },
    {
      id: 5,
      title: "Teaching Kids About Goal Setting Through Tasks",
      excerpt: "Task management isn't just about getting things done—it's a powerful tool for teaching children valuable life skills like goal setting and persistence.",
      author: "Emily Rodriguez",
      date: "December 28, 2024",
      category: "Parenting",
      readTime: "8 min read",
      featured: false
    },
    {
      id: 6,
      title: "How One Family Increased Their Productivity by 300%",
      excerpt: "Meet the Johnson family and discover how they used TaskTracker to transform their chaotic household into a well-oiled productivity machine.",
      author: "TaskTracker Team",
      date: "December 25, 2024",
      category: "Success Stories",
      readTime: "6 min read",
      featured: false
    }
  ];

  const categories = ["All", "Family Tips", "Research", "Lifestyle", "Product Updates", "Parenting", "Success Stories"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            TaskTracker Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Tips, insights, and updates to help your family achieve more together. 
            From productivity hacks to parenting advice, we&apos;ve got you covered.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Badge 
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        {blogPosts.filter(post => post.featured).map((post) => (
          <Card key={post.id} className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Featured
                </Badge>
                <Badge variant="outline">{post.category}</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{post.title}</CardTitle>
              <CardDescription className="text-lg">{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <span>{post.readTime}</span>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Read Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.filter(post => !post.featured).map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get our latest tips, product updates, and family productivity insights 
              delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </CardContent>
        </Card>

        {/* Archive Link */}
        <div className="text-center mt-12">
          <Link href="/blog/archive">
            <Button variant="outline" size="lg">
              View All Posts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 