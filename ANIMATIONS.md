# Athena Dashboard Animation System

## Overview
This document describes the expand/compress animation system implemented for the Athena PWA dashboard. The system provides elegant entrance animations with staggered delays and interactive hover effects that create a polished, responsive UI.

## Animation Files Created

### 1. `/src/lib/animations.js`
Core animation utilities and timing constants.

**Exported Constants:**
- `ANIMATION_TIMINGS`: Contains all animation durations and values
  - `ENTRANCE_DURATION`: 0.4s
  - `ENTRANCE_EASING`: ease
  - `ENTRANCE_SLIDE_DISTANCE`: 8px (upward slide on entrance)
  - `HOVER_TRANSITION`: 0.25s
  - `HOVER_LIFT_DISTANCE`: -3px (upward lift on hover)
  - `COLOR_TRANSITION`: 0.3s (for color changes)

**Exported Functions:**
- `getEntranceDelay(index, step = 40)`: Returns staggered delay in ms
- `getEntranceAnimation(visible, delay)`: Returns entrance animation styles
- `getHoverStyle(isHovered, baseColor)`: Returns hover lift effect styles
- `getStaggeredAnimation(index, visible)`: Returns CSS animation property

### 2. `/src/hooks/useCardAnimation.js`
React hooks for managing card animations.

**Hooks:**
- `useCardAnimation(visible)`: Manages entrance animations with automatic staggering
  - Returns `getAnimation(index)` function
- `useCardHover(baseColor)`: Manages hover state and animations
  - Returns: `isHovered`, `getHoverStyle`, and event handlers

### 3. Updated `/src/components/GlassCard.jsx`
Enhanced with hover lift effects.

**Features:**
- Accepts optional `color` prop for custom shadow colors
- On hover: lifts up (-3px) with expanded shadow
- Smooth 0.25s transition for all state changes
- Accessible mouse event handlers

## Animation Keyframes

### `cardEntranceUp`
Elements fade in and slide up from 8px below:
```
from: opacity 0, translateY(8px)
to: opacity 1, translateY(0)
duration: 0.4s with ease easing
```

### Hover Effects (CSS class `.interactive-card`)
Cards lift and gain shadow on hover:
```
transform: translateY(-3px) on hover
box-shadow: 0 12px 32px rgba(196, 133, 154, 0.3), 0 4px 8px rgba(0, 0, 0, 0.08)
transition: all 0.25s ease
```

## Components Enhanced

### Dashboard.jsx
**Entrance Animations (Staggered by 40ms steps):**
1. Header & greeting (0ms)
2. Phase Hero carousel (70ms)
3. Pilates Studio card (90ms) - now with hover lift
4. Body Map card (110ms) - now with hover lift
5. Module tiles (150ms + staggered)
6. Today's check-in cards (600ms + staggered)
7. Phase Guidance cards (800ms + staggered)
8. Wellness Weather widget (920ms)

**CSS Classes Applied:**
- `.interactive-card`: Applies hover lift and shadow expansion
- Entrance animations: `cardEntranceUp` keyframe with calculated delays

### GlassCard.jsx
**New Features:**
- Accepts `color` prop for theme-aware shadow colors
- Hover state management with useState
- Shadow and border color changes on hover
- Smooth transitions on all property changes

## Design Values

### Timing
- **Entrance slides**: 0.4s with ease easing
- **Hover transitions**: 0.25s for snappy response
- **Color transitions**: 0.3s for smooth accent changes
- **Stagger step**: 40ms between card entrances

### Visual Effects
- **Lift distance**: -3px (translateY)
- **Entrance slide**: 8px from below
- **Shadow on hover**: `0 12px 32px ${color}30, 0 4px 8px rgba(0, 0, 0, 0.08)`
- **Default shadow**: `0 2px 8px rgba(0, 0, 0, 0.04)`

## Usage Examples

### Using Animations in New Components

**Method 1: CSS Classes (Recommended for Static Lists)**
```jsx
<div className="interactive-card" style={{ animation: `cardEntranceUp 0.4s ease ${index * 40}ms both` }}>
  {content}
</div>
```

**Method 2: Using Hooks (For Complex State)**
```jsx
import { useCardAnimation, useCardHover } from '../hooks/useCardAnimation'

function MyCard({ index }) {
  const { getAnimation } = useCardAnimation(true)
  const { isHovered, getHoverStyle, handlers } = useCardHover('#C4859A')

  return (
    <div style={{ ...getAnimation(index), ...getHoverStyle }} {...handlers}>
      {content}
    </div>
  )
}
```

**Method 3: Using GlassCard**
```jsx
import GlassCard from '../components/GlassCard'

<GlassCard color="#C4859A">
  {content}
</GlassCard>
```

## Accessibility Features

### Reduced Motion Support
The dashboard includes `@media (prefers-reduced-motion: reduce)` rules that:
- Disable all entrance animations
- Remove hover transform effects
- Preserve layout and content

Users with motion sensitivity will see instant transitions instead of animations.

## Performance Considerations

- Uses CSS transforms and opacity (hardware-accelerated)
- No layout thrashing or reflows
- Staggered animations prevent browser performance spikes
- Hover effects use `will-change` implicitly through transitions

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with -webkit prefixes where needed)
- Mobile: Touch events handled, hover effects gracefully degrade

## Future Enhancements

1. Add entrance animations for dynamically loaded cards
2. Implement exit/collapse animations for card removal
3. Add phase-aware color customization for shadows
4. Create animation presets (slow, normal, fast)
5. Add gesture-based animations for mobile (swipe, pinch)
