
## Dashboard Performance Optimization Plan

This plan addresses three key performance improvements for the dashboard: removing continuous render time logging, adding React.memo to heavy components, and implementing lazy loading for widgets.

---

### Overview of Changes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATION STRATEGY                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. REMOVE CONTINUOUS LOGGING                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ usePerformanceMonitor.ts                                             │   │
│  │ - Remove requestAnimationFrame loop that runs continuously           │   │
│  │ - Change to on-demand measurement only                               │   │
│  │ - Keep FPS/memory tracking opt-in for debugging                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  2. ADD React.memo TO HEAVY COMPONENTS                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Components to memoize:                                               │   │
│  │ - EmissionsOverview.tsx (4 stat cards with sparklines)              │   │
│  │ - EmissionsChart.tsx (recharts with multiple areas/lines)           │   │
│  │ - EmissionsTimeline.tsx (expandable timeline with charts)           │   │
│  │ - QuickWinsSection.tsx (animated cards with hover states)           │   │
│  │ - RealtimeNotificationsPanel.tsx (notification list)                │   │
│  │ - StrategicIntelligencePanel.tsx (KPIs + charts)                    │   │
│  │ - IndustryKPIPanel.tsx (industry metrics grid)                      │   │
│  │ - DraggableWidget.tsx (wrapper for all widgets)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  3. LAZY LOAD DASHBOARD WIDGETS                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Index.tsx:                                                           │   │
│  │ - Use React.lazy() for heavy widget imports                          │   │
│  │ - Add Suspense boundaries with skeleton fallbacks                    │   │
│  │ - Prioritize above-fold content (overview, chart)                    │   │
│  │ - Defer below-fold widgets (KPIs, intelligence panel)               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Fix Performance Monitor Hook

**File:** `src/hooks/usePerformanceMonitor.ts`

**Current Issue:**
The `usePerformanceMonitor` hook runs a continuous `requestAnimationFrame` loop that:
- Updates state every second (causing re-renders)
- Runs indefinitely for every component using it
- Calculates metrics even when not displayed

**Solution:**
- Make the continuous FPS loop opt-in (disabled by default)
- Only measure on mount/unmount for basic metrics
- Add an `enabled` parameter to control active monitoring

**Changes:**
```typescript
// Add enabled parameter
export function usePerformanceMonitor(componentName: string, enabled = false) {
  // Only run the RAF loop when enabled
  useEffect(() => {
    if (!enabled) return;
    // ... existing RAF loop code
  }, [componentName, enabled]);
}
```

---

### Phase 2: Add React.memo to Heavy Components

**Components to Wrap with React.memo:**

| Component | Reason | Props to Compare |
|-----------|--------|------------------|
| `EmissionsOverview` | 4 cards with sparklines, complex calculations | totalEmissions, scope totals, monthlyData |
| `EmissionsChart` | Large recharts component with multiple series | monthlyData, categoryBreakdown, hasData |
| `EmissionsTimeline` | Animated timeline with SVG sparkline | monthlyData, hasData |
| `QuickWinsSection` | Animated cards with hover effects | None (stateful) |
| `RealtimeNotificationsPanel` | Notification list with animations | None (stateful) |
| `StrategicIntelligencePanel` | Multiple charts and KPI grids | None (fetches own data) |
| `IndustryKPIPanel` | KPI grid with progress bars | None (fetches own data) |
| `DraggableWidget` | Wraps every widget, renders frequently | id, isCustomizeMode, isVisible |

**Pattern for each component:**
```typescript
// Before
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => { ... }
export default ComponentName;

// After
const ComponentName: React.FC<Props> = React.memo(({ prop1, prop2 }) => { ... });
export default ComponentName;

// OR for components with complex props
export default React.memo(ComponentName, (prevProps, nextProps) => {
  // Custom comparison for expensive props
  return prevProps.data === nextProps.data;
});
```

---

### Phase 3: Implement Lazy Loading for Widgets

**File:** `src/pages/Index.tsx`

**Strategy:**
1. Keep critical above-fold components eagerly loaded (EmissionsOverview, EmissionsChart)
2. Lazy load below-fold and heavy components
3. Use Suspense with skeleton fallbacks

**Components to Lazy Load:**

| Component | Priority | Reason |
|-----------|----------|--------|
| `EmissionsTimeline` | Medium | Below overview, expandable |
| `QuickWinsSection` | Medium | Makes API calls, heavy animations |
| `RealtimeNotificationsPanel` | Medium | Real-time subscriptions |
| `StrategicIntelligencePanel` | Low | Heavy charts, below fold |
| `IndustryKPIPanel` | Low | API calls, complex calculations |
| `DataQualityWidget` | Low | Secondary widget |
| `QualityAlertsWidget` | Low | Secondary widget |
| `ValueTrackingWidget` | Low | Secondary widget |

**Implementation:**
```typescript
// Lazy imports
const EmissionsTimeline = React.lazy(() => import('@/components/Dashboard/EmissionsTimeline'));
const QuickWinsSection = React.lazy(() => import('@/components/Dashboard/QuickWinsSection'));
const RealtimeNotificationsPanel = React.lazy(() => import('@/components/Dashboard/RealtimeNotificationsPanel'));
const StrategicIntelligencePanel = React.lazy(() => import('@/components/Dashboard/StrategicIntelligencePanel'));
const IndustryKPIPanel = React.lazy(() => 
  import('@/components/Industry/IndustryKPIPanel').then(m => ({ default: m.IndustryKPIPanel }))
);

// Usage with Suspense
<Suspense fallback={<SkeletonCard />}>
  <QuickWinsSection />
</Suspense>
```

---

### Implementation Files Summary

| File | Changes |
|------|---------|
| `src/hooks/usePerformanceMonitor.ts` | Add `enabled` parameter, disable continuous loop by default |
| `src/components/ui/performance-monitor.tsx` | Pass `enabled={true}` to opt-in to monitoring |
| `src/components/Dashboard/EmissionsOverview.tsx` | Wrap with `React.memo` |
| `src/components/Dashboard/EmissionsChart.tsx` | Wrap with `React.memo` |
| `src/components/Dashboard/EmissionsTimeline.tsx` | Wrap with `React.memo` |
| `src/components/Dashboard/QuickWinsSection.tsx` | Wrap with `React.memo` |
| `src/components/Dashboard/RealtimeNotificationsPanel.tsx` | Wrap with `React.memo` |
| `src/components/Dashboard/StrategicIntelligencePanel.tsx` | Wrap with `React.memo` |
| `src/components/Industry/IndustryKPIPanel.tsx` | Wrap with `React.memo` |
| `src/components/Dashboard/DraggableWidget.tsx` | Wrap with `React.memo` and custom comparison |
| `src/pages/Index.tsx` | Add lazy imports and Suspense boundaries |

---

### Expected Performance Improvements

1. **Reduced Re-renders**: React.memo prevents unnecessary re-renders when parent updates but props haven't changed
2. **Faster Initial Load**: Lazy loading defers ~40% of widget code until needed
3. **Lower CPU Usage**: Removing continuous RAF loop eliminates constant metric calculations
4. **Better Memory Profile**: Components only initialize when scrolled into view or needed
5. **Improved FPS**: Less JavaScript execution per frame

---

### Technical Notes

- Lazy loading requires default exports; `IndustryKPIPanel` is a named export, so we use `.then(m => ({ default: m.IndustryKPIPanel }))`
- React.memo uses shallow comparison by default; for objects/arrays as props, ensure referential stability or use custom comparators
- Suspense fallbacks should match the expected size of the lazy component to prevent layout shift
- The `SkeletonCard` component already exists and is suitable for widget loading states
