'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2,
  Crown,
  Trophy,
  Star,
  ArrowLeft,
  Search,
  Send,
  Gift,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import Image from 'next/image';

interface Friend {
  id: number;
  username: string;
  avatar?: string;
  level: number;
  totalPoints: number;
  isOnline: boolean;
  lastActivity: string;
  mutualFriends: number;
  status: 'friend' | 'pending' | 'request' | 'none';
}

interface PostMetadata {
  achievementId?: number;
  pointsEarned?: number;
  newLevel?: number;
  streakLength?: number;
  bonusPoints?: number;
}

interface SocialPost {
  id: number;
  userId: number;
  username: string;
  avatar?: string;
  type: 'achievement' | 'level_up' | 'streak' | 'challenge_complete';
  content: string;
  metadata: PostMetadata;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
}

export default function SocialPage(): React.ReactElement {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'discover'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComments, setShowComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { showToast } = useToast();

  
  const fetchSocialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate social data
      const sampleFriends: Friend[] = [
        {
          id: 1,
          username: 'Alex Chen',
          level: 15,
          totalPoints: 2850,
          isOnline: true,
          lastActivity: new Date(Date.now() - 300000).toISOString(),
          mutualFriends: 3,
          status: 'friend'
        },
        {
          id: 2,
          username: 'Sarah Johnson',
          level: 12,
          totalPoints: 2100,
          isOnline: false,
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          mutualFriends: 5,
          status: 'friend'
        },
        {
          id: 3,
          username: 'Mike Rodriguez',
          level: 18,
          totalPoints: 3200,
          isOnline: true,
          lastActivity: new Date(Date.now() - 600000).toISOString(),
          mutualFriends: 2,
          status: 'pending'
        }
      ];

      const samplePosts: SocialPost[] = [
        {
          id: 1,
          userId: 1,
          username: 'Alex Chen',
          type: 'achievement',
          content: 'Just unlocked the "Task Master" achievement! 🏆',
          metadata: { achievementId: 5, pointsEarned: 100 },
          likes: 12,
          comments: 3,
          isLiked: false,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 2,
          userId: 2,
          username: 'Sarah Johnson',
          type: 'level_up',
          content: 'Level 12 achieved! The grind continues! 🚀',
          metadata: { newLevel: 12, pointsEarned: 200 },
          likes: 8,
          comments: 5,
          isLiked: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          userId: 3,
          username: 'Mike Rodriguez',
          type: 'streak',
          content: 'Maintained my 30-day streak! Consistency is key! 🔥',
          metadata: { streakLength: 30, bonusPoints: 150 },
          likes: 15,
          comments: 2,
          isLiked: false,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      setFriends(sampleFriends);
      setSocialFeed(samplePosts);
    } catch (error) {
      console.error('Failed to fetch social data:', error);
      showToast('Failed to load social data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);
  
  const handleLike = (postId: number) => {
    setSocialFeed(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleAddFriend = (friendId: number) => {
    setFriends(prev => prev.map(friend => 
      friend.id === friendId 
        ? { ...friend, status: 'pending' as const }
        : friend
    ));
    showToast('Friend request sent!', 'success');
  };

  const handleShowComments = async (postId: number) => {
    if (showComments === postId) {
      setShowComments(null);
      return;
    }
    
    setShowComments(postId);
    
    // Simulate loading comments
    const sampleComments: Comment[] = [
      {
        id: 1,
        userId: 2,
        username: 'Sarah Johnson',
        content: 'Awesome work! Keep it up! 👏',
        createdAt: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: 2,
        userId: 3,
        username: 'Mike Rodriguez',
        content: 'Congrats! That achievement is tough to get.',
        createdAt: new Date(Date.now() - 1200000).toISOString()
      }
    ];
    
    setComments(sampleComments);
  };

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      userId: 999, // Current user
      username: 'You',
      content: newComment,
      createdAt: new Date().toISOString()
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    
    // Update comment count
    setSocialFeed(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
    
    showToast('Comment added!', 'success');
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'level_up': return <Crown className="h-5 w-5 text-purple-500" />;
      case 'streak': return <Zap className="h-5 w-5 text-orange-500" />;
      case 'challenge_complete': return <Target className="h-5 w-5 text-green-500" />;
      default: return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/gamification"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Social Hub
              </h1>
              <p className="text-gray-600 mt-1">
                Connect with friends and share your achievements
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {(['feed', 'friends', 'discover'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {socialFeed.map((post) => (
              <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {post.avatar ? (
                      <Image src={post.avatar} alt={post.username} className="w-full h-full rounded-full object-cover" width={40} height={40} />
                    ) : (
                      getInitials(post.username)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{post.username}</h3>
                      {getPostIcon(post.type)}
                    </div>
                    <p className="text-sm text-gray-600">{formatTimeAgo(post.createdAt)}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 mb-3">{post.content}</p>
                  
                  {/* Post Metadata */}
                  {post.metadata && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {post.metadata.pointsEarned && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="h-4 w-4" />
                            +{post.metadata.pointsEarned} points
                          </div>
                        )}
                        {post.metadata.newLevel && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Crown className="h-4 w-4" />
                            Level {post.metadata.newLevel}
                          </div>
                        )}
                        {post.metadata.streakLength && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Zap className="h-4 w-4" />
                            {post.metadata.streakLength} day streak
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      post.isLiked 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </button>
                  <button
                    onClick={() => handleShowComments(post.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                  </button>
                </div>

                {/* Comments Section */}
                {showComments === post.id && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="space-y-3 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                            {comment.avatar ? (
                              <Image src={comment.avatar} alt={comment.username} className="w-full h-full rounded-full object-cover" width={32} height={32} />
                            ) : (
                              getInitials(comment.username)
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="font-medium text-sm text-gray-900 mb-1">{comment.username}</div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        You
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Friends</h3>
              <div className="space-y-4">
                {friends.filter(f => f.status === 'friend').map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {friend.avatar ? (
                            <Image src={friend.avatar} alt={friend.username} className="w-full h-full rounded-full object-cover" width={48} height={48} />
                          ) : (
                            getInitials(friend.username)
                          )}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{friend.username}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Level {friend.level}</span>
                          <span>{friend.totalPoints.toLocaleString()} points</span>
                          <span>{friend.mutualFriends} mutual friends</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {friend.isOnline ? 'Online now' : `Last active ${formatTimeAgo(friend.lastActivity)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Gift className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for friends..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Friends</h3>
              <div className="space-y-4">
                {friends.filter(f => f.status !== 'friend').map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {friend.avatar ? (
                          <Image src={friend.avatar} alt={friend.username} className="w-full h-full rounded-full object-cover" width={48} height={48} />
                        ) : (
                          getInitials(friend.username)
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{friend.username}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Level {friend.level}</span>
                          <span>{friend.totalPoints.toLocaleString()} points</span>
                        </div>
                        <p className="text-xs text-gray-500">{friend.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(friend.id)}
                      disabled={friend.status === 'pending'}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        friend.status === 'pending'
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {friend.status === 'pending' ? 'Request Sent' : 'Add Friend'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 