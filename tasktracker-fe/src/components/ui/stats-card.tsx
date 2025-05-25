import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  trend?: number;
  isLoading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColor, 
  trend, 
  isLoading = false 
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${bgColor} text-white pb-2`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            {trend !== undefined && (
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            )}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {trend !== undefined && (
              <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}% from last week
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface ProgressCardProps {
  title: string;
  currentValue: number;
  maxValue: number;
  isLoading?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ 
  title, 
  currentValue, 
  maxValue, 
  isLoading = false 
}) => {
  const percentage = maxValue > 0 ? Math.round((currentValue / maxValue) * 100) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ) : (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentValue} / {maxValue}</span>
              <span>{percentage}%</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 