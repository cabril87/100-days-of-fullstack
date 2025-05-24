# TaskTracker Gamification Style Guide

## Overview
This document outlines the consistent design patterns and styling that should be applied across all components and pages in the TaskTracker application to maintain a cohesive gamification experience.

## 🎨 Color Palette

### Primary Gradients
- **Background Gradient**: `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100`
- **Purple Gradient**: `bg-gradient-to-br from-purple-500 to-purple-600`
- **Blue Gradient**: `bg-gradient-to-br from-blue-500 to-blue-600`
- **Green Gradient**: `bg-gradient-to-br from-green-500 to-emerald-600`
- **Amber Gradient**: `bg-gradient-to-br from-amber-500 to-orange-600`
- **Red Gradient**: `bg-gradient-to-br from-red-500 to-red-600`

### Text Gradients
- **Primary Heading**: `bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent`
- **Secondary Heading**: `bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`

## 🏗️ Layout Structure

### Page Container
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  <div className="container mx-auto p-4 space-y-6">
    {/* Page content */}
  </div>
</div>
```

### Main Content Cards
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
  {/* Decorative background elements */}
  <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
  <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
  
  {/* Page header with gradient accent */}
  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
  
  <div className="pt-6 relative z-10 p-6">
    {/* Content */}
  </div>
</div>
```

## 📊 Components

### StatsCard Component
```tsx
<StatsCard
  title="Card Title"
  value="42"
  icon={<Icon className="h-5 w-5 text-white" />}
  bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
  trend={12} // Optional trend percentage
  isLoading={false}
/>
```

### Enhanced Card with Gradient Header
```tsx
<Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
  <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
    <CardTitle className="text-lg font-medium flex items-center gap-2">
      <Icon className="h-5 w-5 text-purple-600" />
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Progress Cards
```tsx
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
  {/* Decorative gradient elements */}
  <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
  
  <div className="relative z-10">
    {/* Content with gradient elements */}
  </div>
</div>
```

## 🔳 Buttons

### Primary Action Buttons
```tsx
<Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
  Action
</Button>
```

### Secondary Action Buttons
```tsx
<Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
  Action
</Button>
```

### Icon Buttons
```tsx
<Button 
  variant="outline" 
  className="h-10 w-10 p-0 rounded-full bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
>
  <Icon className="h-5 w-5" />
</Button>
```

## 📋 Tabs

### Consistent Tab Styling
```tsx
<Tabs defaultValue="overview" className="w-full">
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
    <TabsList className="p-2 bg-transparent w-full">
      <TabsTrigger 
        value="overview" 
        className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
      >
        Overview
      </TabsTrigger>
    </TabsList>
  </div>
</Tabs>
```

## 🎯 Interactive Elements

### Hover Effects
- Cards: `hover:shadow-md transition-all`
- Stats Cards: `hover:scale-105 hover:shadow-xl transition-all duration-300`
- Buttons: `hover:scale-105 transition-all duration-300`

### Focus Mode Indicators
```tsx
<div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white py-1 px-4 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Brain className="h-4 w-4 text-white" />
    <span className="text-sm font-medium">Focus Mode: {formatTime(timeRemaining)}</span>
  </div>
  
  <div className="flex-1 mx-6 max-w-xl">
    <div className="h-2 bg-indigo-800/40 rounded-full w-full relative overflow-hidden">
      <div 
        className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
</div>
```

## 🎊 Templates and Quick Actions

### Template Cards
```tsx
<a
  href={`/tasks/new?templateId=${template.id}`}
  className="group p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 bg-white flex flex-col h-full cursor-pointer relative overflow-hidden"
>
  {/* Gradient accent bar */}
  <div 
    className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
    style={{ 
      background: `linear-gradient(to right, ${color}, ${color}aa)`
    }}
  />
  
  <div className="flex items-start mb-2">
    <div 
      className="w-3 h-3 rounded-full mr-2 mt-1 flex-shrink-0 shadow-sm" 
      style={{ backgroundColor: color }}
    />
    <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
      {title}
    </span>
  </div>
</a>
```

## 🎮 Gamification Specific Elements

### Stats Display
```tsx
<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
      <Icon className="h-6 w-6" />
    </div>
    <div className="text-right">
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-white/80 text-sm font-medium">{label}</div>
    </div>
  </div>
  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
    <div className="h-full bg-white/40 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
  </div>
</div>
```

### Loading States
```tsx
<div className="flex flex-col items-center">
  <div className="w-8 h-8 animate-spin rounded-full border-2 border-dotted border-blue-500"></div>
  <span className="mt-2 text-sm text-gray-500">Loading...</span>
</div>
```

## 📝 Typography

### Headings
- **Page Title**: `text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent`
- **Section Title**: `text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`
- **Card Title**: `text-lg font-medium text-gray-800`

### Body Text
- **Primary**: `text-gray-700`
- **Secondary**: `text-gray-600`
- **Muted**: `text-gray-500`

## 🎨 Animations

### Standard Transitions
- **Cards**: `transition-all duration-300`
- **Buttons**: `transition-all duration-300 hover:scale-105`
- **Progress**: `transition-all duration-1000`

### Fade In Animation
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 🚀 Implementation Guidelines

1. **Always use the standard background gradient** for main page containers
2. **Apply consistent card styling** with shadow, hover effects, and border radius
3. **Use gradient text for all major headings** to maintain brand consistency
4. **Include decorative elements** in main content areas for visual interest
5. **Implement hover effects** on interactive elements
6. **Use consistent color scheme** across all gamification elements
7. **Apply smooth transitions** for all interactive states
8. **Include progress indicators** where appropriate
9. **Use consistent spacing** with Tailwind's space-y-6 and gap-6 patterns
10. **Implement loading states** with consistent spinner design

## 🔧 Required Imports

```tsx
import { StatsCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Include appropriate Lucide React icons
```

This style guide ensures consistent gamification styling across all components and pages in the TaskTracker application. 