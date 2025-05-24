'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Star,
  Trophy,
  Target,
  Gift,
  Users,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';

interface PointTransaction {
  id: number;
  userId: number;
  points: number;
  transactionType: string;
  description: string;
  createdAt: string;
  referenceId?: number;
  referenceType?: string;
}

interface TransactionFilters {
  type: 'all' | 'earned' | 'spent';
  category: 'all' | 'daily_login' | 'task_completion' | 'challenge_completion' | 'achievement_unlock' | 'reward_purchase';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  search: string;
}

export default function PointHistoryPage(): React.ReactElement {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use the user progress endpoint and generate some sample data
      // In a real implementation, there would be a specific transactions endpoint
      const userProgress = await gamificationService.getUserProgress();
      
      // Generate sample transaction data based on user progress
      const sampleTransactions: PointTransaction[] = [
        {
          id: 1,
          userId: 1,
          points: 12,
          transactionType: 'daily_login',
          description: 'Daily login reward',
          createdAt: new Date().toISOString(),
          referenceType: 'login'
        },
        {
          id: 2,
          userId: 1,
          points: 50,
          transactionType: 'task_completion',
          description: 'Completed task: Update project documentation',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          referenceType: 'task',
          referenceId: 123
        },
        {
          id: 3,
          userId: 1,
          points: -200,
          transactionType: 'reward_purchase',
          description: 'Redeemed: Extra Break Time',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          referenceType: 'reward',
          referenceId: 456
        },
        {
          id: 4,
          userId: 1,
          points: 100,
          transactionType: 'achievement_unlock',
          description: 'Achievement unlocked: Task Master',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          referenceType: 'achievement',
          referenceId: 789
        },
        {
          id: 5,
          userId: 1,
          points: 300,
          transactionType: 'challenge_completion',
          description: 'Challenge completed: 7-Day Productivity Sprint',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          referenceType: 'challenge',
          referenceId: 101
        }
      ];
      
      setTransactions(sampleTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      showToast('Failed to load transaction history', 'error');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'daily_login': return <Calendar className="h-5 w-5" />;
      case 'task_completion': return <Target className="h-5 w-5" />;
      case 'challenge_completion': return <Trophy className="h-5 w-5" />;
      case 'achievement_unlock': return <Star className="h-5 w-5" />;
      case 'reward_purchase': return <Gift className="h-5 w-5" />;
      case 'family_bonus': return <Users className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getTransactionColor = (points: number) => {
    return points > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBgColor = (points: number) => {
    return points > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filters.type === 'all' || 
      (filters.type === 'earned' && transaction.points > 0) ||
      (filters.type === 'spent' && transaction.points < 0);
    
    const matchesCategory = filters.category === 'all' || transaction.transactionType === filters.category;
    
    const matchesSearch = filters.search === '' || 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase());
    
    // Date filtering would be implemented here
    
    return matchesType && matchesCategory && matchesSearch;
  });

  const totalEarned = transactions.filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0);
  const totalSpent = Math.abs(transactions.filter(t => t.points < 0).reduce((sum, t) => sum + t.points, 0));
  const netGain = totalEarned - totalSpent;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
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
                Point History
              </h1>
              <p className="text-gray-600 mt-1">Track all your point transactions and activities</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                }`}
                title="Toggle filters"
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title="Refresh transactions"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{totalEarned}</div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{totalSpent}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${netGain >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                  <Star className={`h-5 w-5 ${netGain >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${netGain >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {netGain >= 0 ? '+' : ''}{netGain}
                  </div>
                  <div className="text-sm text-gray-600">Net Gain</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Transactions</option>
                    <option value="earned">Points Earned</option>
                    <option value="spent">Points Spent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="daily_login">Daily Login</option>
                    <option value="task_completion">Task Completion</option>
                    <option value="challenge_completion">Challenge Completion</option>
                    <option value="achievement_unlock">Achievement Unlock</option>
                    <option value="reward_purchase">Reward Purchase</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search descriptions..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.type !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start earning points by completing tasks and challenges!'}
              </p>
              {(filters.search || filters.type !== 'all' || filters.category !== 'all') && (
                <button
                  onClick={() => setFilters({ type: 'all', category: 'all', dateRange: 'all', search: '' })}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTransaction(
                    expandedTransaction === transaction.id ? null : transaction.id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getTransactionBgColor(transaction.points)}`}>
                        {getTransactionIcon(transaction.transactionType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                        <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-xl font-bold ${getTransactionColor(transaction.points)}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </div>
                      {expandedTransaction === transaction.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedTransaction === transaction.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">#{transaction.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{transaction.transactionType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</span>
                      </div>
                      {transaction.referenceId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span className="font-medium">{transaction.referenceType} #{transaction.referenceId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination would go here in a real implementation */}
        {filteredTransactions.length > 0 && (
          <div className="text-center mt-8 py-4">
            <p className="text-gray-600">Showing {filteredTransactions.length} transactions</p>
          </div>
        )}
      </div>
    </div>
  );
} 