# Gamification Styles Reference

This document contains all the styling patterns, components, and design systems that were used in the gamification system before it was removed from the codebase.

## Color Schemes & Gradients

### Progress/Statistics Cards
```css
/* Blue Progress Cards */
.progress-card-blue {
  background: linear-gradient(to bottom right, #dbeafe, #bfdbfe);
  border: 1px solid #bfdbfe;
  color: #1e3a8a;
}

/* Emerald Achievement Cards */
.progress-card-emerald {
  background: linear-gradient(to bottom right, #d1fae5, #a7f3d0);
  border: 1px solid #a7f3d0;
  color: #064e3b;
}

/* Amber Warning/Streak Cards */
.progress-card-amber {
  background: linear-gradient(to bottom right, #fef3c7, #fde68a);
  border: 1px solid #fde68a;
  color: #92400e;
}

/* Purple Level Cards */
.progress-card-purple {
  background: linear-gradient(to bottom right, #f3e8ff, #e9d5ff);
  border: 1px solid #e9d5ff;
  color: #581c87;
}
```

### Badge Variants
```css
/* Points Badge (Primary) */
.badge-points {
  background-color: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

/* Level Badge (Secondary) */
.badge-level {
  background-color: #f3e8ff;
  color: #7c3aed;
  border: 1px solid #e9d5ff;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

/* Streak Badge (Warning) */
.badge-streak {
  background-color: #fed7aa;
  color: #ea580c;
  border: 1px solid #fdba74;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

/* Achievement Badge (Success) */
.badge-achievement {
  background-color: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}
```

## Component Patterns

### Statistics Card Grid
```tsx
// 2-column grid for quick stats
<div className="grid grid-cols-2 gap-3">
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
    <div className="flex items-center gap-2 mb-1">
      <Trophy className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-900">Tasks</span>
    </div>
    <div className="text-lg font-bold text-blue-900">24</div>
    <div className="text-xs text-blue-700">completed</div>
  </div>
  
  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
    <div className="flex items-center gap-2 mb-1">
      <Award className="h-4 w-4 text-emerald-600" />
      <span className="text-sm font-medium text-emerald-900">Achievements</span>
    </div>
    <div className="text-lg font-bold text-emerald-900">8</div>
    <div className="text-xs text-emerald-700">unlocked</div>
  </div>
</div>
```

### Progress Badge Layout
```tsx
// Horizontal badge collection
<div className="flex flex-wrap gap-2">
  <div className="bg-blue-50 text-blue-700 border-blue-200 rounded-full border inline-flex items-center font-medium gap-1 text-sm px-2.5 py-1">
    <Star className="h-4 w-4 text-amber-500" />
    <span>1,240 pts</span>
  </div>
  <div className="bg-purple-50 text-purple-700 border-purple-200 rounded-full border inline-flex items-center font-medium gap-1 text-sm px-2.5 py-1">
    <Award className="h-4 w-4 text-purple-500" />
    <span>Level 5</span>
  </div>
  <div className="bg-orange-50 text-orange-700 border-orange-200 rounded-full border inline-flex items-center font-medium gap-1 text-sm px-2.5 py-1">
    <Flame className="h-4 w-4 text-orange-500" />
    <span>7 days</span>
  </div>
</div>
```

### Achievement Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
  <div className="flex items-start gap-3">
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center border border-amber-200">
      <Trophy className="h-6 w-6 text-amber-600" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900">First Steps</h3>
      <p className="text-sm text-gray-600">Complete your first task</p>
      <div className="mt-2">
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">1/1 completed</p>
      </div>
    </div>
    <div className="text-amber-500">
      <Award className="h-5 w-5" />
    </div>
  </div>
</div>
```

### Leaderboard Entry
```tsx
<div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
      1
    </div>
    <div>
      <h4 className="font-medium text-gray-900">John Doe</h4>
      <p className="text-sm text-gray-500">Level 12</p>
    </div>
  </div>
  <div className="text-right">
    <div className="font-bold text-gray-900">2,450 pts</div>
    <div className="text-sm text-gray-500">15 streak</div>
  </div>
</div>
```

## Progress Indicators

### Circular Progress
```tsx
<div className="relative w-16 h-16">
  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      className="text-gray-200"
    />
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      strokeDasharray={`${175.84 * 0.75} 175.84`}
      className="text-blue-500"
    />
  </svg>
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-bold text-gray-900">75%</span>
  </div>
</div>
```

### Linear Progress Bar
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
    style={{ width: '65%' }}
  ></div>
</div>
```

## Icon Colors & Patterns

### Standard Icon Colors
- **Points/Stars**: `text-amber-500` (Gold)
- **Levels/Awards**: `text-purple-500` (Purple)  
- **Streaks/Fire**: `text-orange-500` (Orange)
- **Tasks/Trophy**: `text-blue-600` (Blue)
- **Achievements**: `text-emerald-600` (Emerald)

### Icon Sizing
```css
/* Small (badges) */
.icon-sm { width: 0.75rem; height: 0.75rem; }

/* Medium (standard) */
.icon-md { width: 1rem; height: 1rem; }

/* Large (headers) */
.icon-lg { width: 1.25rem; height: 1.25rem; }

/* Extra Large (hero sections) */
.icon-xl { width: 1.5rem; height: 1.5rem; }
```

## Animation Classes

### Hover Effects
```css
.card-hover {
  transition: all 0.2s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.badge-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

### Loading Skeletons
```tsx
<div className="space-y-3">
  <div className="flex gap-2">
    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
  </div>
  <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
</div>
```

## Responsive Design Patterns

### Mobile-First Grid
```css
/* Default: 1 column on mobile */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Badge Responsiveness
```css
/* Stack badges on small screens */
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .badge-container {
    justify-content: center;
  }
}
```

## Dark Mode Variants

All components included dark mode support using these patterns:

```css
/* Light/Dark background cards */
.card-adaptive {
  background-color: white;
  border: 1px solid #e5e7eb;
}

.dark .card-adaptive {
  background-color: #1f2937;
  border-color: #374151;
}

/* Adaptive text colors */
.text-adaptive {
  color: #111827;
}

.dark .text-adaptive {
  color: #f9fafb;
}

/* Adaptive gradients */
.gradient-adaptive {
  background: linear-gradient(to bottom right, #dbeafe, #bfdbfe);
}

.dark .gradient-adaptive {
  background: linear-gradient(to bottom right, #1e3a8a, #1d4ed8);
}
```

## Component Size Variants

### Size System
```typescript
const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1', 
  lg: 'text-base px-3 py-1.5'
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
};
```

## Typography Scale

### Gamification-Specific Text Styles
```css
/* Stat Values */
.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

/* Badge Text */
.badge-text {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
}

/* Achievement Titles */
.achievement-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

/* Progress Labels */
.progress-label {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.2;
}
```

This reference contains all the visual patterns, color schemes, and component structures used in the gamification system. You can reference these styles when rebuilding or creating similar UI components in the future. 