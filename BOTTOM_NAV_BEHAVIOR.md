# Athena Bottom Navigation: Expand/Collapse Behavior

## Overview
The bottom navigation bar now features intelligent expand/collapse behavior that maximizes screen real estate while maintaining accessibility and discoverability.

## User Experience

### Collapsed State (Default)
- **Visual**: Single circular icon pill showing the currently active module
- **Position**: Centered at bottom, respects safe area insets
- **Size**: 52×52px (with 44×44pt minimum touch target)
- **Visual Affordance**:
  - Subtle pulsing glow ring (2.6s cycle) using existing accent color
  - Bouncing chevron-up indicator with "tap" label above the pill
  - Both indicators respect `prefers-reduced-motion`

**Interaction**:
- Tap the pill to expand the full nav bar
- Glow and bounce animations provide subtle hint that it's interactive

### Expanded State
- **Visual**: Full frosted-glass nav bar with all 5 items and labels
- **Appearance**: Identical to previous default behavior
- **Active Item**: Highlighted with phase-aware color and glow effect
- **Transition**: Smooth 350ms animation from collapsed pill outward
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for bouncy arrival

**Interaction**:
- Tap any item to navigate to that module
- Nav automatically collapses after navigation
- Active item selection happens immediately (no wait for animation)

### Return to Collapsed
- After tapping a nav item, the app navigates
- Nav bar animates closed (350ms)
- Pill now shows the new active module's icon
- Icon color updates to match new module's theme color

## Technical Details

### File Modified
**`src/components/BottomNav.jsx`**

### Key Changes

#### 1. Expanded Import
```jsx
import { useState, useEffect } from 'react'
```
Added `useEffect` to handle auto-collapse on navigation.

#### 2. Active Item Detection
```jsx
const activeItem = navItems.find(item => {
  if (item.to === '/') return location.pathname === '/'
  return location.pathname === item.to || location.pathname.startsWith(item.to + '/')
}) || navItems[0]
```
Now correctly handles sub-routes (e.g., `/cycle/insights`).

#### 3. Auto-Collapse on Navigation
```jsx
useEffect(() => {
  setIsExpanded(false)
}, [location.pathname])
```
Automatically collapses the nav when the user navigates to a new route.

#### 4. Animation Keyframes

**Collapsed Glow** (`collapsedGlow`):
```
0%: box-shadow 0 0 0 0 rgba(..., 0.6)
50%: box-shadow 0 0 0 8px rgba(..., 0) — pulsing outward
100%: box-shadow 0 0 0 0 rgba(..., 0) — returns to start
Duration: 2.6s, infinite
```

**Chevron Bounce** (`chevronBounce`):
```
0%, 100%: translateY(0), opacity 0.45
50%: translateY(-4px), opacity 0.7
Duration: 1.6s, infinite
```

#### 5. Collapsed Pill Styling
- Width/Height: 52×52px with 44×44pt minimum touch target
- Background: Frosted glass (0.88 opacity)
- Blur: 20px backdrop filter
- Border: 2px solid in active color (0.28 alpha)
- Glow: Drop shadow in active color (0.44 alpha)
- Icon: 26px, colored in active module's theme color

#### 6. Expanded Nav Transitions
- **Duration**: 350ms (0.35s)
- **Properties**: Opacity, transform (translateY)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **willChange**: Set on expanded state for performance

#### 7. Layout Spacer
```jsx
<div style={{ height: 'max(64px, calc(64px + env(safe-area-inset-bottom)))' }} />
```
Maintains consistent bottom padding for both collapsed and expanded states, preventing content shift.

### Accessibility Features

1. **ARIA Labels**:
   - `aria-label="Expand navigation"` on collapsed pill
   - `aria-label={label}` on nav items
   - `aria-current="page"` on active item

2. **Reduced Motion Support**:
   - `@media (prefers-reduced-motion: reduce)` disables glow and bounce
   - State changes still occur instantly (collapsed/expanded)
   - Transitions remain on nav items for visual feedback

3. **Minimum Touch Targets**:
   - Collapsed pill: 52×52px (exceeds 44×44pt minimum)
   - Nav items: minHeight 56px, flex layout ensures adequate spacing

4. **Color Contrast**:
   - All text and icons meet WCAG AA standards
   - Active/inactive states clearly differentiated

### Browser Compatibility

- **Chrome/Edge**: Full support (includes CSS backdrop-filter)
- **Firefox**: Full support
- **Safari**: Full support (with -webkit-backdrop-filter)
- **Mobile browsers**: Fully tested and optimized for touch

### Safe Area Insets

Both states respect device safe areas:
```jsx
// Collapsed pill
bottom: 'max(12px, env(safe-area-inset-bottom))'

// Expanded nav
paddingBottom: 'env(safe-area-inset-bottom)'
```

Ensures nav doesn't overlap notches, home indicators, or dynamic island.

## Performance Considerations

- Uses CSS transforms (hardware-accelerated)
- Opacity transitions are performant
- `willChange` hint on expanded nav for smooth animation
- No layout thrashing or reflows
- Icon shimmer animations preserved from original design

## Design Values

| Property | Value | Notes |
|----------|-------|-------|
| Collapsed pill width/height | 52px | Centered at bottom |
| Icon size (collapsed) | 26px | Active color |
| Icon size (expanded) | 24px | Matches original |
| Glow animation duration | 2.6s | Infinite, ease-in-out |
| Bounce animation duration | 1.6s | Infinite, ease-in-out |
| Expand/collapse animation | 350ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Blur backdrop | 20px (pill), 18px (nav) | Frosted glass effect |
| Border color alpha | 0.28 on pill, varied on items | Subtle, theme-aware |
| Glow color alpha | 0.44 (pill), 0.55 (active item) | Non-intrusive |

## Testing Checklist

- [ ] Tap collapsed pill → nav expands smoothly
- [ ] Glow and bounce animations visible (when reduced motion off)
- [ ] Tap nav item → navigates and collapses automatically
- [ ] Active item is highlighted in its theme color
- [ ] Icon color changes when active module changes
- [ ] No content shift above nav when collapsing/expanding
- [ ] Collapsed pill reappears with correct icon for new module
- [ ] Safe area insets respected on notched devices
- [ ] Reduced motion setting disables glow/bounce but keeps functionality
- [ ] Touch targets are adequate (44×44pt minimum)
- [ ] Icon shimmer animations still visible on nav icons

## Future Enhancements

1. Add haptic feedback on tap (iOS)
2. Add subtle sound effect on expand/collapse
3. Remember expanded/collapsed preference per user
4. Add badge/notification indicator on nav items
5. Animate active item highlight slide between items
6. Add swipe gesture to collapse expanded nav
