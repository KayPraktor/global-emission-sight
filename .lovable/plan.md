

# Sidebar Information Architecture Redesign

## Current State Analysis

Your sidebar currently displays **17 navigation items** across 5 sections, always fully expanded:

| Section | Items | Daily Use Frequency |
|---------|-------|---------------------|
| Overview | 2 | High (Dashboard, Executive) |
| Data Management | 4 | High (Data Entry), Medium (Approvals, Facilities), Low (Emission Factors) |
| Analysis & Planning | 5 | Medium-High |
| Reporting | 6 | Low-Medium (periodic use) |
| Administration | 1-2 | Low |

**Problem**: All 17 items compete for attention equally, creating visual overload and making it harder to find frequently-used items.

---

## Recommended Approach: Collapsible Sections with Smart Defaults

Rather than a Mega Menu (which works better for content-heavy sites), I recommend **collapsible sidebar sections** that:

1. **Auto-expand the section containing the active route**
2. **Remember user preferences** via localStorage
3. **Show pinned "favorites" at the top** for power users
4. **Collapse low-frequency sections by default**

```text
BEFORE (17 visible items):           AFTER (6 visible + expandable):
┌─────────────────────────┐         ┌─────────────────────────┐
│ Overview                │         │ ★ Pinned                │
│   Dashboard             │         │   Dashboard             │
│   Executive             │         │   Data Entry            │
│ Data Management         │         │   Goals                 │
│   Data Entry            │         │ ▼ Overview              │
│   Approvals          3  │         │   Dashboard ✓           │
│   Facilities            │         │   Executive             │
│   Emission Factors      │         │ ▶ Data Management    3  │
│ Analysis & Planning     │         │ ▶ Analysis & Planning   │
│   Analytics             │         │ ▶ Reporting             │
│   Scope 3               │         │ ▶ Administration        │
│   Suppliers             │         └─────────────────────────┘
│   Scenario Planning     │
│   Goals                 │
│ Reporting               │
│   Reports               │
│   Board Reporting       │
│   ... (6 items)         │
│ Administration          │
│   Settings              │
│   Admin                 │
└─────────────────────────┘
```

---

## Implementation Details

### 1. New Sidebar Structure

Transform the current flat section labels into clickable, collapsible groups using Radix `Collapsible` component:

```text
Section Header (clickable)
├── ChevronRight icon (rotates on expand)
├── Section title
├── Badge (if any child has a badge, e.g., Approvals count)
└── Collapse/Expand on click

Collapsed: Show only section headers with aggregate badges
Expanded: Show all child nav items
```

### 2. Smart Default State

| Section | Default State | Reason |
|---------|---------------|--------|
| Pinned Favorites | Always visible | User-curated shortcuts |
| Overview | Expanded | Primary entry points |
| Data Management | Expanded if current route OR has pending approvals | High-frequency tasks |
| Analysis & Planning | Collapsed unless active | Used for specific workflows |
| Reporting | Collapsed unless active | Periodic/quarterly use |
| Administration | Collapsed | Low frequency |

### 3. User Preferences Storage

Store collapsed state in localStorage:
```typescript
interface SidebarPreferences {
  collapsedSections: string[]; // ['reporting', 'admin']
  pinnedItems: string[]; // ['/data-entry', '/goals']
}
```

### 4. Pinned Favorites Feature

Allow users to "pin" up to 5 frequently-used items that appear at the top:
- Right-click or 3-dot menu on any nav item → "Pin to favorites"
- Pinned items appear in a compact "Quick Access" section
- Default pins: Dashboard, Data Entry (can be customized)

---

## Visual Design Enhancements

### Section Headers (Collapsed State)
- Slightly larger touch target (40px height)
- Aggregate badge showing child notifications
- Subtle hover highlight
- Chevron indicator for expand/collapse

### Animation
- Smooth height transition (200ms ease-out)
- Chevron rotation animation
- Staggered reveal of child items on expand

### Active State Intelligence
When user navigates:
1. Auto-expand the parent section of the active route
2. Scroll the active item into view if needed
3. Keep other sections in their current state

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/navigation/AppSidebar.tsx` | Major refactor: Add collapsible sections, pinned items, preferences logic |
| `src/hooks/useSidebarPreferences.ts` | **New file**: Hook for managing localStorage preferences |
| `src/components/navigation/SidebarSection.tsx` | **New file**: Reusable collapsible section component |
| `src/components/navigation/PinnedNav.tsx` | **New file**: Pinned favorites section |

---

## Alternative Approach Considered: Mega Menu

A **Mega Menu** flyout was considered but rejected because:
- Carbon management workflows are task-oriented, not browsing-oriented
- Users typically know which section they need (goal-directed navigation)
- Mega menus work better for e-commerce/content sites with discovery patterns
- Mobile experience is simpler with collapsible sidebars

---

## Bonus Enhancement: Quick Actions in Collapsed Sidebar

When the sidebar is in icon-only collapsed mode (`collapsible="icon"`):
- Show only section icons
- Hover reveals a flyout mini-menu for that section
- Keeps the streamlined collapsed view while providing quick access

---

## Technical Implementation Summary

### Phase 1: Collapsible Sections
1. Create `useSidebarPreferences` hook for localStorage state
2. Create `SidebarSection` component wrapping Radix Collapsible
3. Refactor `AppSidebar` to use new collapsible structure
4. Add smooth animations for expand/collapse

### Phase 2: Pinned Favorites
1. Create `PinnedNav` component
2. Add pin/unpin context menu to nav items
3. Persist pins in preferences

### Phase 3: Smart Defaults
1. Auto-expand section containing active route
2. Show aggregate badges on collapsed sections
3. Remember user's manual expand/collapse actions

