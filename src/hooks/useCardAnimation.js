import { useState, useEffect } from 'react'
import { getEntranceDelay, ANIMATION_TIMINGS } from '../lib/animations'

// Hook to manage entrance animations for cards
export function useCardAnimation(visible = true) {
  const getAnimation = (index) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity ${ANIMATION_TIMINGS.ENTRANCE_DURATION} ${ANIMATION_TIMINGS.ENTRANCE_EASING} ${getEntranceDelay(index)}ms,
                 background ${ANIMATION_TIMINGS.COLOR_TRANSITION},
                 border-color 0.2s,
                 box-shadow ${ANIMATION_TIMINGS.COLOR_TRANSITION}`,
  })

  return { getAnimation }
}

// Hook to manage hover state for interactive lift effect
export function useCardHover(baseColor = '#C4859A') {
  const [isHovered, setIsHovered] = useState(false)

  const getHoverStyle = {
    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
    boxShadow: isHovered
      ? `0 12px 32px ${baseColor}30, 0 4px 8px rgba(0, 0, 0, 0.08)`
      : '0 2px 8px rgba(0, 0, 0, 0.04)',
    borderColor: isHovered ? `${baseColor}40` : `${baseColor}28`,
    transition: `all ${ANIMATION_TIMINGS.HOVER_TRANSITION}`,
  }

  return {
    isHovered,
    getHoverStyle,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  }
}
