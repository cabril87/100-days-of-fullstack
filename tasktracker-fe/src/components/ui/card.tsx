import React from 'react';
import { cn } from '@/lib/utils';

// Standard shadcn/ui Card components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Custom gamification-styled card components
interface GamificationCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'stats';
  gradient?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GamificationCard: React.FC<GamificationCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  gradient,
  hover = true 
}) => {
  const baseClasses = "rounded-xl border shadow-sm transition-all duration-300";
  
  const variants = {
    default: "bg-white border-gray-100",
    gradient: `${gradient || 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white border-transparent`,
    stats: "bg-white border-gray-100 p-4"
  };

  const hoverClasses = hover ? "hover:scale-105 hover:shadow-lg cursor-pointer" : "";

  return (
    <div className={cn(baseClasses, variants[variant], hoverClasses, className)}>
      {children}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  trend?: number;
  isLoading?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColor, 
  trend, 
  isLoading = false,
  onClick 
}) => (
  <GamificationCard 
    variant="gradient" 
    gradient={bgColor}
    className={`relative overflow-hidden p-4 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-white/30 rounded-lg mb-3"></div>
        <div className="h-6 w-16 bg-white/30 rounded mb-2"></div>
        <div className="h-4 w-12 bg-white/30 rounded"></div>
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-white/20">
            {icon}
          </div>
          {trend && (
            <div className="flex items-center text-white/90 text-xs font-medium">
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +{trend}%
            </div>
          )}
        </div>
        <div className="text-white">
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-white/80 text-sm">{title}</div>
        </div>
      </>
    )}
  </GamificationCard>
);

interface ProgressCardProps {
  title: string;
  currentValue: number;
  maxValue: number;
  progress: number;
  icon: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ 
  title, 
  currentValue, 
  maxValue, 
  progress, 
  icon, 
  color = "purple",
  isLoading = false 
}) => (
  <GamificationCard variant="default" className="p-6">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {isLoading ? (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 rounded h-4 w-full"></div>
        <div className="animate-pulse bg-gray-200 rounded h-2 w-full"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/2"></div>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold text-${color}-600`}>
            {currentValue}
          </span>
          <span className="text-sm text-gray-600">
            / {maxValue}
          </span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`absolute top-0 left-0 h-3 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600">
          {Math.round(progress)}% Complete
        </div>
      </div>
    )}
  </GamificationCard>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;
