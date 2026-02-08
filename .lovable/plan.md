

# Scope 3 Sankey Diagram Implementation

## Overview

This plan replaces the standard bar/pie charts in the Scope 3 Dashboard with an interactive **Sankey Diagram** as the primary visualization, showing the flow of emissions from your organization through the value chain.

---

## Data Flow Visualization

The Sankey diagram will visualize emissions flowing through this hierarchy:

```text
                                          ┌─► Cat 1: Purchased Goods (45.2K)
                                          │     └─► Supplier A (12.5K)
                                          │     └─► Supplier B (8.2K)
                                          │
              ┌─► Upstream (84.1K) ───────┼─► Cat 4: Transport (12.8K)
              │                           │     └─► FastFreight (4.5K)
              │                           │
Organization ─┤                           └─► Cat 6: Travel (3.4K)
(139.5K)      │
              │                           ┌─► Cat 11: Product Use (32K)
              └─► Downstream (55.4K) ─────┤
                                          └─► Cat 9: Distribution (9.6K)
```

---

## Technical Implementation

### Library Choice

**Recharts Sankey** (already installed in `recharts ^2.12.7`)
- Built-in Sankey component at `recharts/chart/Sankey.js`
- Consistent API with existing charts in the codebase
- No additional dependencies required

### Component Architecture

| File | Purpose |
|------|---------|
| `src/components/Scope3/Scope3SankeyDiagram.tsx` | Main Sankey visualization component |
| `src/utils/scope3SankeyTransform.ts` | Data transformation utilities |
| `src/components/Scope3/SankeyNodeTooltip.tsx` | Custom tooltip for nodes |
| `src/components/Scope3/SankeyLinkTooltip.tsx` | Custom tooltip for flow links |

---

## New File: Sankey Data Transformer

Create a utility to transform the existing `Scope3Summary[]` data into the Sankey format:

```typescript
// src/utils/scope3SankeyTransform.ts
interface SankeyNode {
  name: string;
  category?: number;
  emissions?: number;
}

interface SankeyLink {
  source: number;  // Index into nodes array
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

function transformToSankeyData(
  summary: Scope3Summary[],
  hotspots: Scope3Hotspot[],
  totals: { upstream: number; downstream: number }
): SankeyData {
  // Node indices:
  // 0: Organization (root)
  // 1: Upstream
  // 2: Downstream
  // 3+: Individual categories
  // Additional nodes for top suppliers/contributors
}
```

---

## New File: Sankey Diagram Component

Create the main visualization component:

```typescript
// src/components/Scope3/Scope3SankeyDiagram.tsx
import { Sankey, Tooltip, Rectangle, Layer } from 'recharts';

interface Scope3SankeyDiagramProps {
  summary: Scope3Summary[];
  hotspots: Scope3Hotspot[];
  totals: { total: number; upstream: number; downstream: number };
  onNodeClick?: (categoryNumber: number) => void;
}
```

**Features:**
- Responsive container filling available width
- Custom node rendering with category icons and emissions labels
- Custom link rendering with gradient colors (upstream=blue, downstream=amber)
- Click-to-drill interaction for viewing category details
- Hover tooltips showing percentage of total and data quality

---

## Integration with Scope3Dashboard

Update the Overview tab to include the Sankey diagram with a view toggle:

```typescript
// In Scope3Dashboard.tsx
const [viewMode, setViewMode] = useState<'sankey' | 'charts'>('sankey');

// Add toggle buttons
<div className="flex gap-2">
  <Button 
    variant={viewMode === 'sankey' ? 'default' : 'outline'}
    onClick={() => setViewMode('sankey')}
  >
    <GitBranch className="h-4 w-4 mr-2" />
    Flow View
  </Button>
  <Button 
    variant={viewMode === 'charts' ? 'default' : 'outline'}
    onClick={() => setViewMode('charts')}
  >
    <BarChart3 className="h-4 w-4 mr-2" />
    Chart View
  </Button>
</div>
```

---

## Visual Design Specifications

### Color Scheme

| Element | Color | Purpose |
|---------|-------|---------|
| Organization node | Primary (green) | Central hub |
| Upstream flow | Blue gradient | Categories 1-8 |
| Downstream flow | Amber gradient | Categories 9-15 |
| High-impact links | Thicker stroke | Visual weight |
| Low-quality data | Dashed pattern | Indicates estimation |

### Node Styling

- **Rectangle nodes** with rounded corners (8px radius)
- **Category icons** from existing `categoryIcons` mapping
- **Emissions label** below node name
- **Percentage badge** showing share of total

### Link Styling

- **Gradient fill** transitioning between source and target colors
- **Width proportional** to emissions value
- **Hover highlight** with increased opacity
- **Animated flow** using subtle CSS gradient animation

---

## Interactivity Features

### 1. Click-to-Drill

Clicking a category node:
- Expands to show top 3 contributors (suppliers/activities)
- Creates sub-nodes connected to the category
- Shows reduction potential in tooltip

### 2. Hover Tooltips

Custom tooltip showing:
- Category name and number
- Emissions in tCO2e
- Percentage of total Scope 3
- Data quality indicator (primary/secondary/estimated)
- Top contributor preview

### 3. Legend Integration

Interactive legend allowing:
- Toggle upstream/downstream visibility
- Filter by data quality level
- Highlight specific categories

---

## Mobile Responsiveness

Since Sankey diagrams can be complex on small screens:

| Screen Size | Behavior |
|-------------|----------|
| Desktop (>1024px) | Full Sankey with all nodes and drill-down |
| Tablet (768-1024px) | Simplified Sankey, categories only |
| Mobile (<768px) | Fallback to stacked horizontal bar chart |

Implementation:
```typescript
const { width } = useWindowSize();
const isMobile = width < 768;

return isMobile ? (
  <Scope3StackedBarFallback data={summary} />
) : (
  <Scope3SankeyDiagram ... />
);
```

---

## Files to Create

| File | Lines (est.) | Description |
|------|--------------|-------------|
| `src/utils/scope3SankeyTransform.ts` | ~120 | Data transformation utilities |
| `src/components/Scope3/Scope3SankeyDiagram.tsx` | ~280 | Main Sankey component |
| `src/components/Scope3/SankeyNodeTooltip.tsx` | ~60 | Custom node tooltip |
| `src/components/Scope3/SankeyLinkTooltip.tsx` | ~50 | Custom link tooltip |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Scope3/Scope3Dashboard.tsx` | Add Sankey import, view toggle, integrate diagram |
| `src/pages/Scope3Page.tsx` | No changes needed (uses Scope3Dashboard) |

---

## Demo Data Enhancement

Extend `scope3DemoData.ts` to include supplier breakdown for Sankey sub-nodes:

```typescript
export interface SankeySupplierNode {
  categoryNumber: number;
  suppliers: {
    name: string;
    emissions: number;
    dataQuality: string;
  }[];
}
```

---

## Technical Considerations

### Performance

- Memoize Sankey data transformation with `useMemo`
- Limit visible nodes to prevent overcrowding (max 25 nodes)
- Use virtualization for large supplier lists in drill-down

### Accessibility

- ARIA labels for nodes describing emissions values
- Keyboard navigation between nodes
- High-contrast mode support for links
- Screen reader announcements for drill-down actions

### Animation

- Entry animation: nodes fade in, links draw from left to right
- Drill-down animation: new nodes expand from parent
- Hover animation: link opacity and thickness increase

