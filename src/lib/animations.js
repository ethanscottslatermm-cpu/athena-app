// ─── Athena Animation System ──────────────────────────────────────────────────
// Fade-in entrance animations with staggered delays + interactive hover lift effect

export const ANIMATION_TIMINGS = {
  ENTRANCE_DURATION: '0.4s',
  ENTRANCE_EASING: 'ease',
  ENTRANCE_SLIDE_DISTANCE: '8px',
  HOVER_TRANSITION: '0.25s',
  HOVER_LIFT_DISTANCE: '-3px',
  COLOR_TRANSITION: '0.3s',
}

// Staggered entrance delays (ms)
export const getEntranceDelay = (index, step = 40) => index * step

// Fade-in entrance animation: slides up from 8px below while fading in
export const getEntranceAnimation = (visible = true, delay = 0) => {
  const delayMs = typeof delay === 'number' ? delay : 0
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${ANIMATION_TIMINGS.ENTRANCE_SLIDE_DISTANCE})`,
    transition: `opacity ${ANIMATION_TIMINGS.ENTRANCE_DURATION} ${ANIMATION_TIMINGS.ENTRANCE_EASING} ${delayMs}ms,
                 background ${ANIMATION_TIMINGS.COLOR_TRANSITION},
                 border-color 0.2s,
                 box-shadow ${ANIMATION_TIMINGS.COLOR_TRANSITION}`,
  }
}

// Hover lift effect: card lifts up with shadow expansion
export const getHoverStyle = (isHovered, baseColor = '#C4859A') => {
  const shadowColor = baseColor || '#C4859A'
  return {
    transform: isHovered ? `translateY(${ANIMATION_TIMINGS.HOVER_LIFT_DISTANCE})` : 'translateY(0)',
    boxShadow: isHovered
      ? `0 12px 32px ${shadowColor}30, 0 4px 8px rgba(0, 0, 0, 0.08)`
      : '0 2px 8px rgba(0, 0, 0, 0.04)',
    borderColor: isHovered ? `${shadowColor}40` : `${shadowColor}28`,
    transition: `all ${ANIMATION_TIMINGS.HOVER_TRANSITION}`,
  }
}

// Global animation keyframes to inject into styles
export const ANIMATION_KEYFRAMES = `
  @keyframes cardEntranceUp {
    from {
      opacity: 0;
      transform: translateY(${ANIMATION_TIMINGS.ENTRANCE_SLIDE_DISTANCE});
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardHoverLift {
    from {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    to {
      transform: translateY(${ANIMATION_TIMINGS.HOVER_LIFT_DISTANCE});
      box-shadow: 0 12px 32px rgba(196, 133, 154, 0.3), 0 4px 8px rgba(0, 0, 0, 0.08);
    }
  }
`

// Generate staggered animation style for cards
export const getStaggeredAnimation = (index, visible = true) => {
  const delay = getEntranceDelay(index)
  return {
    animation: visible ? `cardEntranceUp ${ANIMATION_TIMINGS.ENTRANCE_DURATION} ${ANIMATION_TIMINGS.ENTRANCE_EASING} ${delay}ms both` : 'none',
  }
}
