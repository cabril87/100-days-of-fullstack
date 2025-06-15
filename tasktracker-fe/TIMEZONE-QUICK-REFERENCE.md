# 🕐 Timezone Quick Reference Guide

## 🚨 **EMERGENCY FIX** - Use This Immediately

If you see wrong timezone display anywhere in the app:

```typescript
// 1. Import the quick fix
import { quickFixTimezone } from '@/lib/utils/dateUtils';

// 2. Replace your date display
// Before (wrong):
<span>{task.createdAt}</span>

// After (correct):
<span>{quickFixTimezone(task.createdAt)}</span>
```

## 🎯 **PROPER IMPLEMENTATION** - Use This for New Features

```typescript
import { parseBackendDate, formatDisplayDate } from '@/lib/utils/dateUtils';

// Parse backend date
const createdDate = parseBackendDate(task.createdAt);

// Display with smart formatting
<span>{formatDisplayDate(createdDate)}</span>
```

## 📋 **COMMON SCENARIOS**

### Task Lists
```typescript
import { parseBackendDate, formatDisplayDate } from '@/lib/utils/dateUtils';

const TaskCard = ({ task }) => {
  const createdDate = parseBackendDate(task.createdAt);
  const dueDate = parseBackendDate(task.dueDate);
  
  return (
    <div>
      <p>Created: {formatDisplayDate(createdDate)}</p>
      <p>Due: {formatDisplayDate(dueDate)}</p>
    </div>
  );
};
```

### Due Date Validation
```typescript
import { parseBackendDate, isOverdue, isToday } from '@/lib/utils/dateUtils';

const dueDate = parseBackendDate(task.dueDate);
const isTaskOverdue = isOverdue(dueDate);
const isDueToday = isToday(dueDate);

<span className={isTaskOverdue ? 'text-red-500' : 'text-gray-500'}>
  {formatDisplayDate(dueDate)}
</span>
```

### Form Inputs
```typescript
import { 
  parseBackendDate, 
  formatDateForInput, 
  formatTimeForInput,
  combineDateAndTime,
  formatDateForBackend 
} from '@/lib/utils/dateUtils';

const TaskForm = ({ task }) => {
  const [dueDate, setDueDate] = useState(formatDateForInput(parseBackendDate(task.dueDate)));
  const [dueTime, setDueTime] = useState(formatTimeForInput(parseBackendDate(task.dueDate)));
  
  const handleSubmit = () => {
    const combinedDate = combineDateAndTime(dueDate, dueTime);
    const backendDate = formatDateForBackend(combinedDate);
    
    // Send backendDate to API
  };
  
  return (
    <form>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
    </form>
  );
};
```

### Calendar Integration
```typescript
import { parseBackendDate } from '@/lib/utils/dateUtils';

const events = tasks.map(task => ({
  title: task.title,
  start: parseBackendDate(task.createdAt),
  end: parseBackendDate(task.dueDate),
  allDay: false
}));
```

## 🔧 **ALL AVAILABLE FUNCTIONS**

### Main Functions
- `parseBackendDate(dateInput)` - Parse any backend date
- `formatDisplayDate(date, options?)` - Smart display formatting
- `formatDateForBackend(date)` - Convert to backend format

### Quick Fix
- `quickFixTimezone(backendDateString)` - One-line emergency fix

### Form Helpers
- `formatDateForInput(date)` - YYYY-MM-DD format
- `formatTimeForInput(date)` - HH:MM format
- `combineDateAndTime(dateStr, timeStr)` - Combine date/time inputs

### Validation Helpers
- `isToday(date)` - Check if date is today
- `isOverdue(date)` - Check if date is past due
- `getStartOfDay(date)` - Get start of day
- `getEndOfDay(date)` - Get end of day

### Debug Tools
- `debugTimezone(label, date)` - Development debugging
- `getUserTimezone()` - Get timezone info

## ⚠️ **WHAT NOT TO DO**

```typescript
// ❌ DON'T use raw backend dates
<span>{task.createdAt}</span>

// ❌ DON'T use new Date() directly on backend strings
const date = new Date(task.createdAt);

// ❌ DON'T format dates without timezone conversion
<span>{task.createdAt.toLocaleString()}</span>
```

## ✅ **WHAT TO DO**

```typescript
// ✅ DO use the timezone utilities
<span>{quickFixTimezone(task.createdAt)}</span>

// ✅ DO parse backend dates properly
const date = parseBackendDate(task.createdAt);

// ✅ DO use smart formatting
<span>{formatDisplayDate(parseBackendDate(task.createdAt))}</span>
```

## 🐛 **TROUBLESHOOTING**

### Problem: Dates showing 4 hours in the future
**Solution:** Backend is sending UTC without 'Z', use `parseBackendDate()`

### Problem: "Invalid Date" errors
**Solution:** Check if backend is sending null/undefined, use null checks

### Problem: Form inputs not working
**Solution:** Use `formatDateForInput()` and `formatTimeForInput()`

### Problem: Calendar events at wrong times
**Solution:** Use `parseBackendDate()` before passing to calendar library

## 📍 **FILE LOCATION**

All utilities are in: `src/lib/utils/dateUtils.ts`

Import what you need:
```typescript
import { 
  quickFixTimezone,
  parseBackendDate, 
  formatDisplayDate,
  isOverdue,
  isToday 
} from '@/lib/utils/dateUtils';
``` 