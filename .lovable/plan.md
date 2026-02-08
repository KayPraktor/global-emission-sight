

# Premium Sankey Diagram Visual Upgrade

## Overview

Transform the current Sankey diagram from a utilitarian visualization into a **premium, polished** experience with refined colors, smoother curves, better spacing, and enhanced interactivity.

---

## Current vs. Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Container height | 400px | 600px |
| Node padding | 30px | 50px |
| Link style | Solid gradient (0.6-0.3 opacity) | Semi-transparent (0.15-0.25 opacity) |
| Link curvature | Default bezier | Smoother control points |
| Color palette | Blue/Amber (HSL values) | Emerald/Sky/Amber sustainability palette |
| Link hover | opacity-80 | Highlight to opacity 0.6 + tooltip |
| Font size | text-xs (~11px) | 12px explicit with better contrast |
| Label overlap | Common | Eliminated with increased padding |

---

## Color Palette: Modern Sustainability Theme

```text
┌─────────────────────────────────────────────────────────────┐
│  SOURCE (Organization)                                       │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  Emerald Green: hsl(158, 64%, 52%) / #10b981                 │
│                                                              │
│  UPSTREAM (Categories 1-8)                                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  Sky Blue: hsl(199, 89%, 48%) / #0ea5e9                      │
│                                                              │
│  DOWNSTREAM (Categories 9-15)                                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  Amber/Orange: hsl(38, 92%, 50%) / #f59e0b                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Container & Layout (Scope3SankeyDiagram.tsx)

```tsx
// BEFORE
<div className="h-[400px] w-full">

// AFTER
<div className="h-[600px] w-full">
```

```tsx
// BEFORE
<Sankey
  nodePadding={30}
  nodeWidth={12}
  margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
>

// AFTER
<Sankey
  nodePadding={50}
  nodeWidth={14}
  margin={{ top: 30, right: 200, bottom: 30, left: 30 }}
>
```

---

### 2. Premium Color Constants

Add a dedicated color palette at the top of the component:

```tsx
// Premium sustainability color palette
const COLORS = {
  organization: '#10b981',    // Emerald-500
  upstream: '#0ea5e9',        // Sky-500
  downstream: '#f59e0b',      // Amber-500
  upstreamLight: '#38bdf8',   // Sky-400
  downstreamLight: '#fbbf24', // Amber-400
};
```

---

### 3. CustomSankeyNode Refinements

Update the node rendering with better colors and font sizing:

```tsx
const getNodeColor = () => {
  if (node.type === 'organization') return COLORS.organization;
  if (node.type === 'stream') {
    return node.isUpstream ? COLORS.upstream : COLORS.downstream;
  }
  if (node.type === 'category') {
    return node.isUpstream ? COLORS.upstreamLight : COLORS.downstreamLight;
  }
  // Supplier nodes
  return node.isUpstream 
    ? 'hsl(199, 75%, 65%)'   // Lighter sky
    : 'hsl(38, 80%, 65%)';   // Lighter amber
};
```

Label styling with explicit 12px font:

```tsx
<text
  x={x + width + 12}
  y={y + height / 2}
  textAnchor="start"
  dominantBaseline="middle"
  className="fill-foreground font-medium"
  style={{ fontSize: '12px' }}
>
  {displayName}
</text>
```

---

### 4. CustomSankeyLink - Premium Gradient with Hover

This is the core visual upgrade:

```tsx
function CustomSankeyLink(props: any) {
  const { 
    sourceX, targetX, sourceY, targetY, 
    sourceControlX, targetControlX, 
    linkWidth, payload 
  } = props;
  const [isHovered, setIsHovered] = useState(false);
  
  const isUpstream = payload.isUpstream;
  const gradientId = `premium-gradient-${payload.source}-${payload.target}`;
  
  // Source color based on flow direction
  const sourceColor = isUpstream ? COLORS.organization : COLORS.organization;
  const targetColor = isUpstream ? COLORS.upstream : COLORS.downstream;
  
  // Opacity increases on hover
  const baseOpacity = isHovered ? 0.5 : 0.2;
  const endOpacity = isHovered ? 0.35 : 0.15;

  return (
    <Layer>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceColor} stopOpacity={baseOpacity} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={endOpacity} />
        </linearGradient>
      </defs>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX * 1.1},${sourceY} ${targetControlX * 0.9},${targetY} ${targetX},${targetY}
          L${targetX},${targetY + linkWidth}
          C${targetControlX * 0.9},${targetY + linkWidth} ${sourceControlX * 1.1},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
          Z
        `}
        fill={`url(#${gradientId})`}
        stroke={isHovered ? targetColor : 'none'}
        strokeWidth={isHovered ? 1 : 0}
        strokeOpacity={0.3}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer transition-all duration-200"
      />
    </Layer>
  );
}
```

**Key improvements:**
- Gradient flows from source node color → target node color
- Base opacity: 0.2 (subtle, not heavy)
- Hover opacity: 0.5 (clear highlight)
- Subtle stroke on hover for definition
- Smoother curves via adjusted control point multipliers (1.1, 0.9)

---

### 5. Link Tooltip Integration

Currently the tooltip only shows for nodes. We need to add link tooltip support:

```tsx
// In the Sankey component, we'll use a custom tooltip that detects payload type
<Tooltip 
  content={(props) => {
    const payload = props.payload?.[0]?.payload;
    if (!payload) return null;
    
    // Detect if this is a link (has source/target) vs node
    if (payload.source !== undefined && payload.target !== undefined) {
      return <SankeyLinkTooltip {...props} totalEmissions={totals.total} />;
    }
    return <SankeyNodeTooltip {...props} totalEmissions={totals.total} />;
  }}
/>
```

---

### 6. Enhanced SankeyLinkTooltip

Update to show category name with the CO2e value prominently:

```tsx
export function SankeyLinkTooltip({ active, payload, totalEmissions }: SankeyLinkTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const link = payload[0].payload;
  const percentage = calculatePercentage(link.value, totalEmissions);
  const isUpstream = link.isUpstream;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border rounded-xl shadow-xl p-4 min-w-[220px]">
      {/* Flow direction indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isUpstream ? '#0ea5e9' : '#f59e0b' }}
        />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {isUpstream ? 'Upstream Flow' : 'Downstream Flow'}
        </span>
      </div>

      {/* Source → Target */}
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span>{link.source?.name}</span>
        <span className="text-muted-foreground">→</span>
        <span>{link.target?.name}</span>
      </div>

      {/* Prominent CO2e value */}
      <div className="mt-3 p-2 rounded-lg bg-muted/50">
        <div className="text-2xl font-bold text-foreground">
          {formatEmissions(link.value)} <span className="text-sm font-normal">tCO₂e</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {percentage.toFixed(1)}% of total Scope 3
        </div>
      </div>
    </div>
  );
}
```

---

### 7. Legend Color Update

Match the legend to the new color palette:

```tsx
<div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.upstream }} />
    <span className="text-xs text-muted-foreground font-medium">Upstream</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.downstream }} />
    <span className="text-xs text-muted-foreground font-medium">Downstream</span>
  </div>
</div>
```

---

## Visual Before/After Comparison

```text
BEFORE (Cluttered, Heavy)              AFTER (Premium, Breathable)
┌─────────────────────────────┐        ┌─────────────────────────────────────┐
│ ■ Org ████████ Upstream     │        │                                     │
│       ██████████ Cat 1      │        │  ■ Organization                     │
│       ████████ Cat 4        │        │       ╲                             │
│       █████ Cat 6           │        │        ╲ ─────── ■ Upstream         │
│       ██████████ Downstream │        │        ╱           ╲                │
│       █████ Cat 9           │        │       ╱             ▸ Cat 1         │
│       █████ Cat 11          │        │      ╱              ▸ Cat 4         │
│                             │        │     ╱               ▸ Cat 6         │
│ [Black/heavy links]         │        │                                     │
│ [Labels overlap]            │        │        ╲ ─────── ■ Downstream       │
│ [400px height crammed]      │        │                     ▸ Cat 9         │
└─────────────────────────────┘        │                     ▸ Cat 11        │
                                       │                                     │
                                       │  [Soft gradient links, 0.2 opacity] │
                                       │  [600px height, plenty of space]    │
                                       │  [Labels clearly separated]         │
                                       └─────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Scope3/Scope3SankeyDiagram.tsx` | Color palette, container height, node padding, link component with hover state, tooltip integration |
| `src/components/Scope3/SankeyLinkTooltip.tsx` | Premium styling with backdrop blur, category name display, prominent CO2e value |
| `src/components/Scope3/SankeyNodeTooltip.tsx` | Match styling consistency with link tooltip |

---

## Summary of Premium Upgrades

| Feature | Implementation |
|---------|---------------|
| **Softer links** | 0.2 base opacity with source→target gradient |
| **Hover highlight** | 0.5 opacity + subtle stroke on hover |
| **Smoother curves** | Control point multipliers for organic flow |
| **Better spacing** | nodePadding: 50, height: 600px |
| **Legible labels** | 12px font, increased right margin (200px) |
| **Sustainability palette** | Emerald/Sky/Amber color scheme |
| **Link tooltips** | Shows category + CO2e value on hover |
| **Premium feel** | backdrop-blur, rounded-xl, shadow-xl on tooltips |

