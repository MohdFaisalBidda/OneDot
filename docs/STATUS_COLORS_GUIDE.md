# Status Colors Utility Guide

This guide shows how to use the reusable status and category color utilities across your application.

## Import

```typescript
import { 
  getStatusBadgeStyle, 
  getStatusText,
  getCategoryColor, 
  getCategoryIcon,
  getMoodColor,
  getMoodIcon
} from "@/lib/status-colors";
```

## Status Badges

Use these functions for consistent status indicators across focus entries and decisions.

### Example: Status Badge

```tsx
<Badge className={`text-xs rounded-full border ${getStatusBadgeStyle(status)}`}>
  {getStatusText(status)}
</Badge>
```

### Status Colors:
- **ACHIEVED**: Green background (`bg-green-100 text-green-700`)
- **PARTIALLY_ACHIEVED**: Yellow background (`bg-yellow-100 text-yellow-700`)
- **NOT_ACHIEVED**: Red background (`bg-red-100 text-red-700`)
- **PENDING**: Blue background (`bg-blue-100 text-blue-700`)

## Decision Categories

### Example: Progress Bar with Category Color

```tsx
const colorClass = getCategoryColor(category);

<div className="flex items-center justify-between">
  <span>{category}</span>
  <span className={`px-2 py-0.5 rounded-full ${colorClass}`}>
    {percentage}%
  </span>
</div>

<div className="h-2.5 bg-[#F7F5F3] rounded-full overflow-hidden">
  <div 
    className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Category Colors (Light Blend):
- **CAREER**: Blue (`bg-blue-200`)
- **HEALTH**: Green (`bg-green-200`)
- **FINANCE**: Yellow (`bg-yellow-200`)
- **RELATIONSHIPS**: Pink (`bg-pink-200`)
- **LIFESTYLE**: Purple (`bg-purple-200`)
- **GENERAL**: Gray (`bg-gray-200`)
- **OTHER**: Orange (`bg-orange-200`)

### Example: With Icon

```tsx
<span className="text-lg">{getCategoryIcon(category)}</span>
<span>{category}</span>
```

## Mood Tracking

### Example: Mood Progress Bar

```tsx
const colorClass = getMoodColor(mood);

<div className="flex items-center justify-between">
  <span className="capitalize">{mood}</span>
  <span className={`px-2 py-0.5 rounded-full ${colorClass}`}>
    {percentage}%
  </span>
</div>

<div className="h-2.5 bg-[#F7F5F3] rounded-full overflow-hidden">
  <div 
    className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Mood Colors (Light Blend):
- **Happy**: Yellow (`bg-yellow-200`)
- **Calm**: Blue (`bg-blue-200`)
- **Focused**: Indigo (`bg-indigo-200`)
- **Energized**: Green (`bg-green-200`)
- **Stressed**: Red (`bg-red-200`)
- And more...

### Example: With Icon

```tsx
<span>{getMoodIcon(mood)}</span>
<span className="capitalize">{mood}</span>
```

## Benefits

✅ **Consistent colors** across the entire application  
✅ **Reusable** - import once, use anywhere  
✅ **Maintainable** - change colors in one place  
✅ **Type-safe** - with TypeScript support  
✅ **Clear visual indicators** for better UX  

## Usage Examples

### Recent Activity List
```tsx
{activities.map(activity => (
  <div key={activity.id}>
    {activity.status && (
      <Badge className={`${getStatusBadgeStyle(activity.status)}`}>
        {getStatusText(activity.status)}
      </Badge>
    )}
  </div>
))}
```

### Category Breakdown Chart
```tsx
{categories.map(cat => (
  <div key={cat.name}>
    <span>{getCategoryIcon(cat.name)} {cat.name}</span>
    <div className={`progress-bar ${getCategoryColor(cat.name)}`} />
  </div>
))}
```

### Mood Timeline
```tsx
{moods.map(mood => (
  <div key={mood.date}>
    <span>{getMoodIcon(mood.value)} {mood.value}</span>
    <div className={`indicator ${getMoodColor(mood.value)}`} />
  </div>
))}
```
