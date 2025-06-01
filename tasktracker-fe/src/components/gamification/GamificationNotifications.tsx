'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Award, Gift, Zap } from 'lucide-react';
import { useWebSocket } from '@/lib/hooks/useWebSocket';

interface GamificationNotification {
  id: string;
  type: 'points_earned' | 'achievement_unlocked' | 'level_up' | 'streak_updated' | 'badge_earned' | 'reward_redeemed';
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  timestamp: Date;
}

interface GamificationNotificationsProps {
  maxNotifications?: number;
  autoHideDuration?: number;
}

export const GamificationNotifications: React.FC<GamificationNotificationsProps> = ({
  maxNotifications = 3,
  autoHideDuration = 5000,
}) => {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);

  const addNotification = (update: any) => {
    const notification: GamificationNotification = {
      id: `${Date.now()}-${Math.random()}`,
      type: update.type,
      timestamp: new Date(),
      ...getNotificationContent(update)
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      return newNotifications.slice(0, maxNotifications);
    });

    // Auto-hide notification
    setTimeout(() => {
      removeNotification(notification.id);
    }, autoHideDuration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationContent = (update: any) => {
    switch (update.type) {
      case 'points_earned':
        return {
          title: 'Points Earned!',
          message: `+${update.data.points} points for ${update.data.reason}`,
          icon: <Star className="w-5 h-5" />,
          color: 'from-yellow-400 to-orange-500',
        };
      case 'achievement_unlocked':
        return {
          title: 'Achievement Unlocked!',
          message: `${update.data.achievementName} (+${update.data.points} points)`,
          icon: <Trophy className="w-5 h-5" />,
          color: 'from-purple-400 to-pink-500',
        };
      case 'level_up':
        return {
          title: 'Level Up!',
          message: `Congratulations! You reached level ${update.data.newLevel}`,
          icon: <Zap className="w-5 h-5" />,
          color: 'from-green-400 to-blue-500',
        };
      case 'streak_updated':
        return {
          title: update.data.isNewRecord ? 'New Streak Record!' : 'Streak Updated!',
          message: `${update.data.currentStreak} day${update.data.currentStreak !== 1 ? 's' : ''} in a row!`,
          icon: <Flame className="w-5 h-5" />,
          color: 'from-red-400 to-orange-500',
        };
      case 'badge_earned':
        return {
          title: 'Badge Earned!',
          message: `You earned the ${update.data.badgeName} badge!`,
          icon: <Award className="w-5 h-5" />,
          color: 'from-indigo-400 to-purple-500',
        };
      case 'reward_redeemed':
        return {
          title: 'Reward Redeemed!',
          message: `${update.data.rewardName} (${update.data.pointsCost} points)`,
          icon: <Gift className="w-5 h-5" />,
          color: 'from-pink-400 to-red-500',
        };
      default:
        return {
          title: 'Gamification Update',
          message: 'Something awesome happened!',
          icon: <Star className="w-5 h-5" />,
          color: 'from-blue-400 to-purple-500',
        };
    }
  };

  // Use WebSocket to listen for gamification updates
  useWebSocket({
    onUpdate: addNotification,
  });

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="pointer-events-auto"
          >
            <motion.div
              className={`
                relative overflow-hidden rounded-lg shadow-lg backdrop-blur-sm
                bg-gradient-to-r ${notification.color}
                border border-white/20
                p-4 max-w-sm
              `}
              whileHover={{ scale: 1.02 }}
              onClick={() => removeNotification(notification.id)}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              
              {/* Content */}
              <div className="relative flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                  {notification.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-white/90 text-xs mt-1 break-words">
                    {notification.message}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress bar for auto-hide */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GamificationNotifications; 