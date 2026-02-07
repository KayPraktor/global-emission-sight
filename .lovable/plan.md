

# Micro-Interactions Enhancement Plan

## Current State Analysis

### Existing Animation Infrastructure (Strong Foundation)
Your project already has an excellent animation foundation:

| Component | Location | Status |
|-----------|----------|--------|
| Framer Motion wrappers | `page-transitions.tsx` | Built but underutilized |
| Interactive components | `micro-interactions.tsx` | Built but only used on Index.tsx |
| Celebration effects | `celebration-effects.tsx` | Comprehensive, used in GoalsPage |
| Animation hooks | `useAdvancedAnimations.ts` | Built but unused |
| CSS keyframes | `tailwind.config.ts` | Basic set defined |
| Loading states | `animated-elements.tsx` | Comprehensive |

### Gap Analysis: Where Animations Are Missing

| Area | Current State | Opportunity |
|------|---------------|-------------|
| Page transitions | `PageTransition` component exists but NOT used in any page wrapper | Wrap all routes for seamless navigation |
| Button hover effects | Standard `transition-colors` only | Add subtle scale/lift on primary CTAs |
| Card interactions | Static cards without hover states | Add lift effect on hover for interactive cards |
| Form inputs | Basic focus ring only | Add subtle focus animations |
| Tab transitions | Instant content swap | Fade/slide content between tabs |
| List items | Static list rendering | Stagger animation on list load |
| Success feedback | Toast only | Add checkmark animations, pulse effects |
| Progress indicators | Static progress bars | Animate value changes smoothly |
| Number displays | Static numbers | Count-up animations for metrics |
| Sidebar navigation | Static links | Add active indicator slide |

---

## Implementation Roadmap

### Phase 1: Global Page Transitions (High Impact, Low Effort)

**Problem:** Users experience jarring, instant page swaps when navigating.

**Solution:** Wrap all routes with the existing `PageTransition` component.

**Implementation Location:** `src/App.tsx`

The `PageTransition` component already exists but is not being used. Wrapping routes will add smooth fade + slide animations between all pages automatically.

---

### Phase 2: Enhanced Button Component

**Problem:** The base `Button` component has minimal hover feedback.

**Current:** `transition-colors` only changes background color.

**Enhancement:** Add subtle scale transform and shadow elevation on hover for primary actions.

**Implementation Location:** `src/components/ui/button.tsx`

Changes:
- Add `transition-all duration-200` for smooth multi-property transitions
- Add `hover:shadow-md` for primary variant
- Add `active:scale-[0.98]` for tactile click feedback

---

### Phase 3: Card Hover Effects

**Problem:** Cards are static and don't respond to user interaction.

**Solution:** Create an `AnimatedCard` component that adds hover lift effect.

**Implementation Location:** `src/components/ui/animated-card.tsx` (new file)

Features:
- Subtle Y translation on hover (-2px to -4px)
- Shadow elevation increase
- Smooth 200ms transition
- Use for interactive cards (clickable, actionable)

---

### Phase 4: Tab Content Transitions

**Problem:** Tab content swaps instantly without animation.

**Solution:** Create an `AnimatedTabsContent` wrapper component.

**Implementation Location:** `src/components/ui/animated-tabs.tsx` (new file)

Features:
- Fade out current content (150ms)
- Fade in new content (150ms)
- Optional slide direction based on tab index change

---

### Phase 5: List Stagger Animations

**Problem:** Lists render all items instantly, missing the opportunity for visual polish.

**Solution:** Apply `StaggeredList` to key list components.

**Target Components:**
- `ProfessionalGoalsList.tsx` - Goal cards
- `FacilitiesPage.tsx` - Facility cards
- `ScenarioList.tsx` - Scenario items
- `SupplierDashboard.tsx` - Supplier cards

**Pattern:**
```text
<StaggeredList staggerDelay={0.05}>
  {items.map(item => <Card key={item.id}>...</Card>)}
</StaggeredList>
```

---

### Phase 6: Form Input Focus Animations

**Problem:** Input focus is basic ring only.

**Solution:** Enhance the `Input` component with subtle scale/glow on focus.

**Implementation Location:** `src/components/ui/input.tsx`

Changes:
- Add `transition-all duration-200`
- Add `focus:scale-[1.01]` for subtle growth
- Add `focus:shadow-sm` for glow effect

---

### Phase 7: Number Count-Up Animations

**Problem:** Dashboard metrics display instantly, missing satisfying reveal.

**Solution:** Apply the existing `AnimatedCounter` component to key metrics.

**Target Locations:**
- `EmissionsOverview.tsx` - Total emissions
- `MetricsCards.tsx` - All KPI values
- `GoalsDashboard.tsx` - Progress percentages

**Component:** Already exists in `animated-elements.tsx` as `AnimatedCounter`.

---

### Phase 8: Progress Bar Animations

**Problem:** Progress bars jump to values instantly.

**Solution:** The Progress component already has `transition-all` but could be enhanced with spring physics.

**Implementation Location:** Wrap with Framer Motion in usage

---

### Phase 9: Success Micro-Interactions

**Problem:** Form submissions only show toast, missing celebratory feedback.

**Solution:** Integrate `SuccessPulse` and `CardSuccessGlow` after successful actions.

**Target Actions:**
- Goal creation → Confetti + pulse
- Emission entry saved → Card glow
- Approval action completed → Checkmark animation
- Report exported → Success pulse

**Component:** Already exists in `celebration-effects.tsx`.

---

### Phase 10: Sidebar Active State Animation

**Problem:** Active nav item highlight is static.

**Solution:** Add sliding indicator that moves between active items.

**Implementation Location:** `src/components/navigation/AppSidebar.tsx`

Use Framer Motion's `layoutId` prop for automatic layout animations between active states.

---

## New Components to Create

### 1. AnimatedCard
Wrapper for Card with hover effects:
- Hover: translate-y-[-2px], shadow-lg
- Click: scale-[0.99]
- Transition: 200ms ease-out

### 2. AnimatedTabsContent
Wrapper for TabsContent with fade transitions:
- Exit: opacity 0, y 5
- Enter: opacity 1, y 0
- Duration: 150ms

### 3. CountUpNumber
Thin wrapper around AnimatedCounter for easy metric usage:
- Auto-format with commas
- Suffix support (%, tCO2e)
- Duration: 1s default

### 4. SuccessCheckmark
Animated checkmark for form completions:
- SVG path drawing animation
- Green color with pulse
- Auto-hide after 2s

### 5. FloatingLabelInput
Enhanced input with floating label animation:
- Label slides up on focus
- Subtle input scale on focus
- Smooth placeholder transition

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap routes with `PageTransition` |
| `src/components/ui/button.tsx` | Add `active:scale-[0.98]` and enhanced hover |
| `src/components/ui/input.tsx` | Add focus animations |
| `src/components/ui/tabs.tsx` | Add content transition classes |
| `src/pages/GoalsPage.tsx` | Apply StaggeredList to goal cards |
| `src/pages/FacilitiesPage.tsx` | Apply StaggeredList to facility cards |
| `src/pages/DataEntryPage.tsx` | Add SlideIn for wizard steps |
| `src/pages/ReportsPage.tsx` | Add tab content transitions |
| `src/components/Dashboard/MetricsCards.tsx` | Use AnimatedCounter for values |
| `src/components/Dashboard/EmissionsOverview.tsx` | Use AnimatedCounter for totals |
| `src/components/navigation/AppSidebar.tsx` | Add active indicator animation |

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/animated-card.tsx` | Card with hover lift effect |
| `src/components/ui/animated-tabs.tsx` | TabsContent with fade transitions |
| `src/components/ui/count-up.tsx` | Simple count-up number wrapper |
| `src/components/ui/success-checkmark.tsx` | Animated checkmark SVG |

---

## CSS Keyframes to Add (tailwind.config.ts)

New keyframes for enhanced animations:
- `bounce-subtle`: Gentle bounce for attention
- `shake`: Error state feedback
- `checkmark-draw`: SVG path animation
- `number-pop`: Scale pulse for changing numbers

---

## Technical Implementation Notes

### Performance Considerations
- Use `will-change: transform` sparingly
- Prefer `transform` and `opacity` for GPU acceleration
- Use `motion.div` with `layout` prop carefully (can cause reflow)
- Stagger delays should be short (50-100ms) to feel snappy

### Accessibility
- Respect `prefers-reduced-motion` media query
- Add `motion-safe:` prefix to Tailwind animation classes
- Ensure animations don't block user interaction
- Keep animations under 500ms for perceived responsiveness

### Integration Pattern
Components should check for reduced motion preference:
```typescript
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

---

## Priority Order

1. **Immediate (High Impact):** Page transitions, button active states
2. **Short-term:** Card hover effects, tab transitions, list stagger
3. **Medium-term:** Number animations, success feedback
4. **Polish:** Sidebar animations, floating labels, advanced celebrations

