import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import settingsIcon from '../assets/icons/settings-icon.png'
import exitIcon from '../assets/icons/nav-exit.png'
import WellnessWeatherWidget from '../components/WellnessWeatherWidget'
import HintBubble            from '../components/HintBubble'

const DASHBOARD_HINTS = [
  'Tap any module card to jump straight in. Your cycle, skin, and mood are always one tap away.',
  'Your Phase Guidance card updates automatically as you move through your cycle — set up your cycle in Settings to unlock it.',
  'The Wellness Weather widget adapts your skin-care tips to today\'s UV index and humidity in real time.',
  'Use the rotating Today cards to stay consistent. Each pair changes daily to keep your routine fresh.',
]

import nourishIcon   from '../assets/icons/nav-nourish.png'
import sleepIcon     from '../assets/icons/nav-sleep.png'
import skinIcon      from '../assets/icons/nav-skin.png'
import communityIcon from '../assets/icons/nav-community.png'
import groceryIcon   from '../assets/icons/nav-grocery.png'

function IconMood({ color = '#6B5248', size = 22 }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M230.32,105.666c-7.017-7.196-8.387-18.749-2.104-26.593c7.145-8.922,20.021-9.403,27.784-1.442c7.763-7.96,20.64-7.479,27.784,1.442c6.283,7.845,4.913,19.397-2.104,26.593l-19.952,20.46c-3.14,3.22-8.315,3.22-11.455,0L230.32,105.666z M436.88,313.44l-24.16-50.8l-40.24-84.48c-2.48-5.2-6.32-9.68-11.12-12.88l-21.04-14c-7.52-5.04-17.28-5.36-25.2-0.88l-44.64,25.44c-4.08,2.08-6.88,5.6-8.16,9.68l2.16,2.16c5.04,5.04,12.88,6.16,19.12,2.64l21.68-12.08c5.92-3.28,12.64-5.04,19.44-5.04c9.84,0,19.28,3.6,26.64,10.16l53.092,68.597L340.72,195.28c-7.6-6.72-18.72-8-27.6-3.04l-40.64,22.64C262.32,220.48,256,231.2,256,242.8c0-11.6-6.32-22.32-16.48-27.92l-40.64-22.64c-8.88-4.96-20-3.68-27.6,3.04l-63.731,56.677l53.092-68.597c7.36-6.56,16.8-10.16,26.64-10.16c6.8,0,13.52,1.76,19.44,5.04l21.68,12.08c6.645,3.748,13.659,2.821,21.28-4.8c-1.28-4.08-4.08-7.6-8.16-9.68l-44.64-25.44c-7.92-4.48-17.68-4.16-25.2,0.88l-21.04,14c-4.8,3.2-8.64,7.68-11.12,12.88l-40.24,84.48l-24.16,50.8c-2.08,4.32-3.12,9.04-3.12,13.76V408h88v-8c-8,0-15.44-1.76-22-5.12l-10.88-5.44c-7.84-3.92-11.04-13.52-7.12-21.44l25.28,12.64c4.4,2.24,9.28,3.36,14.24,3.36h46.16c1.52,0,2.96,0.48,4.24,1.28l11.2,7.44c6.32,4.24,14.8,3.36,20.16-2l3.44-3.44c6.24-6.24,6.24-16.32,0-22.56l-16.4-16.4c-2.88-2.88-6.24-5.12-10-6.72l-45.44-19.52c-2.96-1.28-4.88-4.16-4.88-7.44v-47.36c0-2.08,0.8-4.08,2.32-5.6l18.16-18.16c2.08-2.08,5.28-2.88,8.16-1.92l13.92,4.56c3.2,1.12,5.44,4.16,5.44,7.6V256c0,8.8,7.2,16,16,16h8c8.8,0,16-7.2,16-16c0,8.8,7.2,16,16,16h8c8.8,0,16-7.2,16-16v-2.24c0-3.44,2.24-6.48,5.44-7.6l13.92-4.56c2.88-0.96,6.08-0.16,8.16,1.92l18.16,18.16c1.52,1.52,2.32,3.52,2.32,5.6v47.36c0,3.28-1.92,6.16-4.88,7.44l-45.44,19.52c-3.76,1.6-7.12,3.84-10,6.72l-16.4,16.4c-6.24,6.24-6.24,16.32,0,22.56l3.44,3.44c5.36,5.36,13.84,6.24,20.16,2l11.2-7.44c1.28-0.8,2.72-1.28,4.24-1.28h46.16c4.96,0,9.84-1.12,14.24-3.36L392,368c3.92,7.92,0.72,17.52-7.12,21.44L374,394.88c-6.56,3.36-14,5.12-22,5.12v8h88v-80.8C440,322.48,438.96,317.76,436.88,313.44z M368,440h56c8.836,0,16-7.164,16-16h-88C352,432.836,359.164,440,368,440z M88,440h56c8.836,0,16-7.164,16-16H72C72,432.836,79.164,440,88,440z"/>
    </svg>
  )
}

function IconCycle({ color = '#6B5248', size = 22 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <path fill={color} d="M42.89 28.385c.866-4.964 1.013-12.085-2.587-19.319C36.947 2.317 31.43 2.79 31.43 2.79c-6.854-3.082-14.316 3.595-15.717 7.369c-2.02 5.447.683 8.565 2.768 9.684c-.343.509-.867 1.335-.217 2.41c.205.339.618.741 1.432.789c-.26.507-.258 1.05.006 1.499c.283.482.812.754 1.369.906c-.17.679-.149 1.453.332 2.149c.23.335.664.733 1.411.733c.144 0 .276-.015.396-.033c.309.77.939 1.873 2.392 1.873c1.315 0 3.139-.997 5.866-3.199c-.272 4.64-10.369 6.84-10.369 10.57c0 2.702 2.523 3.449 2.523 3.449s-4.185 1.59-6.446 5.729c-.104.092-.216.171-.305.282c-.282.35-.568.912-.541 1.708a11.998 11.998 0 0 0-.571 3.679c0 6.689 5.32 9.613 11.607 9.613h10.27s.699-2.042-.629-9.146c-.062-.325-.108-.633-.156-.941l.008-.004l-.141-.987c-.008-.073-.018-.148-.025-.221c5.624-1.52 11.631-3.796 12.219-6.695c.809-3.985-4.183-12.617-6.022-15.621m-6.587-3.622a7.77 7.77 0 0 0-.156 2.325l-4.459-.295l.043-.035a24 24 0 0 1 1.016-.778c2.123-1.57 3.298-2.717 1.991-7.214c.429-.373.761-.864.983-1.431c.695 1.449 1.364 3.91.582 7.428m-5.205 1.221c-2.88 2.357-4.51 3.184-5.497 3.184c-.937 0-1.297-.742-1.601-1.623c-.085-.243-.24-.31-.43-.31c-.202 0-.443.068-.68.083c-.966-.558-.283-2.117.316-3.017c-.887.074-2.07.188-2.545-.943c.336-.604.565-.986.246-1.371c-.021-.023-.064-.032-.127-.032c-.195 0-.569.09-.923.09c-.304 0-.592-.066-.739-.312c-.697-1.151 1.09-1.449.844-3.607c-.133-1.186-2.345-1.411-2.772-5.726c-.09-.917.698-1.352 1.8-1.352c1.395 0 3.293.695 4.557 1.992c3.278 3.373 5.059 3.951 5.895 3.951c.435 0 .613-.157.613-.157l.018-.01a5.215 5.215 0 0 1-.641-1.444c-.547-2.031.227-3.935 1.73-4.247c.143-.03.287-.044.431-.044c1.377 0 2.786 1.316 3.282 3.156c.496 1.833-.09 3.549-1.313 4.099c1.768 5.476.077 5.562-2.464 7.64M20.279 46.719c.053 0 .082.002.082.002s1.57-.375 2.959.316c-.957-1.068-2.389-.636-2.389-1.013c0-.735 1.158-1.013 1.158-1.013c2.054 0 3.022.979 3.934 1.47v5.88s-4.273 1.386-6.963.197c-.763-.722-1.329-1.855-1.68-3.459c-.497-2.277 2.374-2.38 2.899-2.38M36.783 61h-9.416c-2.488 0-10.607-.621-10.607-8.613c0-.527.041-1.026.104-1.508c1.115 2.951 3.088 3.629 4.656 3.629c2.182 0 3.624-.253 4.564-.541l-.014.426c5.093-.417 8.346-1.471 9.837-2.063c.038.234.071.464.117.709c.847 4.522.843 6.91.759 7.961m11.149-17.192c-.689 3.397-12.399 6.536-20.334 7.881l-.234-4.45c3.391-.839 12.908-3.354 14.534-5.539l.347-.465l-.232-.533c-.908-2.074-6.248-9.193-6.248-9.193l2.416 8.309l-.053.094c-.603 1.066-1.235 2.188-1.721 3.546c-1.707.53-4.99 1.506-8.499 2.299h-.952c-.244 0-.572-.211-.986-.478c-.83-.534-1.967-1.266-3.879-1.266c-1.246 0-1.908.496-2.244.912a2.21 2.21 0 0 0-.426.852c-.17.021-.354.059-.539.101c2.061-2.753 4.906-3.88 5.092-3.951l2.701-1.022l-2.762-.87c-.186-.059-1.814-.626-1.814-2.493c0-1.225 2.17-2.574 4.268-3.879c2.523-1.568 5.344-3.322 5.98-5.821l3.943.261c.856 4.167 4.686 7.002 4.686 7.002s.922-2.014 1.631-5.261c2.387 4.021 5.948 10.892 5.325 13.964m-10.295-.745c.679-1.605 1.547-2.914 2.255-4.348c.508.942.942 1.791 1.204 2.388c-.457.613-1.782 1.293-3.459 1.96"/>
      <path fill={color} d="M31.652 12.844c.242-.245.533-.466.822-.735a2.407 2.407 0 0 0-1.141.302a1.934 1.934 0 0 0-.838.916a2.182 2.182 0 0 0-.107 1.322c.076.356.229.69.432.979c-.166.025-.318.099-.391.246c.246.039.389.146.529.248c.139.108.264.22.371.344a2 2 0 0 1 .277.393c.078.147.131.33.168.587c.209-.113.334-.368.324-.649c-.004-.282-.143-.557-.324-.764a1.247 1.247 0 0 0-.678-.4a1.204 1.204 0 0 0-.158-.014c-.068-.758-.102-1.43.146-1.97c.121-.297.324-.555.568-.805"/>
      <path fill={color} d="M21.748 16.491c-.23.323-.427.608-.678.85a1.472 1.472 0 0 0-.143-.654c-.148-.351-.357-.631-.5-.903c-.16-.266-.262-.507-.295-.778c-.033-.272.025-.582.096-.93a1.225 1.225 0 0 0-.598.847c-.084.401.064.843.254 1.167c.197.331.42.593.625.84c.143.181.257.368.342.586a2.47 2.47 0 0 1-.713.391c.406.266.943.297 1.383.105c.445-.18.773-.523 1.023-.876c.248-.357.424-.735.572-1.108c.168-.366.256-.727.551-1.05c-.486-.077-.9.272-1.178.563c-.296.305-.522.643-.741.95"/>
    </svg>
  )
}

// Phase Guidance cards still use images — module tiles do not
const MODULE_IMAGES = {
  Pilates:    '/images/dashboard/pilates.png',
  'Body Fuel': '/images/dashboard/nourish.png',
  Skin:       '/images/dashboard/skin.png',
  Sleep:      '/images/dashboard/sleep.png',
}

// ─── Daily rotation helpers ───────────────────────────────────────────────────
// Base date = May 20 2026 (day 0). Offset advances by 1 each calendar day.
function getDayOffset() {
  const base = new Date(2026, 4, 20)
  const now  = new Date(); now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((now - base) / 86400000))
}

// Today check-in pool — 5 cards, displayed 2 at a time, step-by-2 to avoid day-over-day repeats
// Day 0: [Mood, Sleep]  Day 1: [Skin, Cycle]  Day 2: [Body Fuel, Mood]  …
const TODAY_POOL = [
  { key: 'mood',    label: 'Mood',      sub: 'How are you feeling today?',   SvgIcon: IconMood,  img: '/images/dashboard/mood.png',    to: '/mood'    },
  { key: 'sleep',   label: 'Sleep',     sub: 'How did you sleep last night?', icon: sleepIcon,    img: '/images/dashboard/sleep.png',   to: '/sleep'   },
  { key: 'skin',    label: 'Skin',      sub: 'How is your skin today?',       icon: skinIcon,     img: '/images/dashboard/skin.png',    to: '/skin'    },
  { key: 'cycle',   label: 'Cycle',     sub: 'Log your cycle today',          SvgIcon: IconCycle, img: '/images/dashboard/Cycle.png',   to: '/cycle'   },
  { key: 'nourish', label: 'Body Fuel', sub: 'Fuel your body today',          icon: nourishIcon,  img: '/images/dashboard/nourish.png', to: '/nourish' },
]

// Phase Guidance rotations — 4 variants picking 3 of 4 phase cards each day.
// Index refers to position in content.cards: 0=Pilates 1=Body Fuel 2=Skin 3=Sleep
// Day 0: [0,2,1] = Pilates, Skin, Body Fuel  (required starting order)
const PHASE_GUIDANCE_ROTATIONS = [
  [0, 2, 1],  // Pilates · Skin · Body Fuel
  [1, 3, 2],  // Body Fuel · Sleep · Skin
  [2, 0, 3],  // Skin · Pilates · Sleep
  [3, 1, 0],  // Sleep · Body Fuel · Pilates
]

// ─── Header icon with nav-bar shimmer ────────────────────────────────────────

function HeaderShimmerIcon({ src }) {
  const maskVal = `url(${src}) no-repeat center / contain`
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 22, height: 22, flexShrink: 0 }}>
      <span style={{
        display: 'block', width: '100%', height: '100%',
        WebkitMask: maskVal, mask: maskVal,
        backgroundColor: '#7A6A65',
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        WebkitMask: maskVal, mask: maskVal,
        background: 'linear-gradient(110deg, transparent 25%, rgba(245,240,225,0.7) 50%, transparent 75%)',
        backgroundSize: '250% 100%',
        animation: 'navShimmer 10s ease-in-out infinite',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
    </span>
  )
}

// ─── Platinum shimmer icon ────────────────────────────────────────────────────
// Two stacked mask-spans: base platinum layer + animated sweep overlay

function ShimmerIcon({ src, delay = 0, size = 22 }) {
  const maskVal = `url(${src}) no-repeat center / contain`
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size, flexShrink: 0 }}>
      {/* Base — platinum silver with soft glow */}
      <span style={{
        position: 'absolute', inset: 0,
        WebkitMask: maskVal, mask: maskVal,
        backgroundColor: '#F0EAE4',
        filter: 'drop-shadow(0 0 4px rgba(240,234,228,0.8))',
      }} />
      {/* Sweep overlay */}
      <span
        className="icon-sweep-el"
        style={{
          position: 'absolute', inset: 0,
          WebkitMask: maskVal, mask: maskVal,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.82) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animationName: 'iconSweep',
          animationDuration: '2.5s',
          animationTimingFunction: 'ease-in-out',
          animationDelay: `${delay}s`,
          animationIterationCount: 'infinite',
        }}
      />
    </span>
  )
}

// ─── Shimmer rim rotating gradient — shared inner div ─────────────────────────

function RimSpin({ duration = '3s', delay = 0 }) {
  return (
    <div
      className="srim-spin-el"
      style={{
        position: 'absolute',
        width: '150%', height: '150%',
        top: '-25%', left: '-25%',
        background: 'conic-gradient(rgba(200,200,215,0.28) 0%, rgba(200,200,215,0.28) 36%, rgba(215,215,238,0.68) 45%, rgba(238,238,255,0.9) 50%, rgba(215,215,238,0.68) 55%, rgba(200,200,215,0.28) 64%, rgba(200,200,215,0.28) 100%)',
        animationName: 'srimRotate',
        animationDuration: duration,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHASE_META = {
  menstrual:  { color: '#D4A0A0', label: 'Menstrual',  days: 5  },
  follicular: { color: '#8FA58C', label: 'Follicular', days: 8  },
  ovulation:  { color: '#D4A0A0', label: 'Ovulation',  days: 3  },
  luteal:     { color: '#C4AFA8', label: 'Luteal',     days: 12 },
}

const PHASE_CONTENT = {
  menstrual: {
    headline: 'Rest & Restore',
    sub: 'Honor your body\'s call to slow down.',
    gradient: 'linear-gradient(135deg, rgba(212,160,160,0.28) 0%, rgba(212,160,160,0.10) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Restorative movement & breathwork', to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Iron-rich foods & warming broths',  to: '/nourish'   },
      { module: 'Skin',      tip: 'Deep hydration & gentle cleansing', to: '/skin'      },
      { module: 'Sleep',     tip: 'Extra rest is healing right now',   to: '/sleep'     },
    ],
  },
  follicular: {
    headline: 'Rise & Begin',
    sub: 'Energy builds. Lean into curiosity.',
    gradient: 'linear-gradient(135deg, rgba(143,165,140,0.38) 0%, rgba(143,165,140,0.12) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Light cardio, barre & core work',       to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Lean proteins & fresh greens',          to: '/nourish'   },
      { module: 'Skin',      tip: 'Exfoliate & brighten — skin is ready',  to: '/skin'      },
      { module: 'Sleep',     tip: 'Consistent sleep fuels your surge',     to: '/sleep'     },
    ],
  },
  ovulation: {
    headline: 'Peak Power',
    sub: 'Radiant and magnetic — your strongest phase.',
    gradient: 'linear-gradient(135deg, rgba(212,160,160,0.28) 0%, rgba(212,160,160,0.10) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'HIIT, strength training & dance',       to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Antioxidants, zinc & whole foods',      to: '/nourish'   },
      { module: 'Skin',      tip: 'Lightweight moisture & SPF',            to: '/skin'      },
      { module: 'Sleep',     tip: 'Recovery sleep after peak output',      to: '/sleep'     },
    ],
  },
  luteal: {
    headline: 'Turn Inward',
    sub: 'Wisdom rises. Slow down and listen.',
    gradient: 'linear-gradient(135deg, rgba(196,175,168,0.38) 0%, rgba(196,175,168,0.12) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Yoga, pilates & low-impact flow',       to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Magnesium, complex carbs & warmth',     to: '/nourish'   },
      { module: 'Skin',      tip: 'Nourishing masks & barrier support',    to: '/skin'      },
      { module: 'Sleep',     tip: 'Wind-down rituals are essential',       to: '/sleep'     },
    ],
  },
}

const MM = (name) => `/images/My%20Modules/${name}.png`

const MODULE_NAV = [
  { key: 'pilates',   label: 'Pilates',   img: MM('Pilates'),   to: '/pilates'   },
  { key: 'cycle',     label: 'Cycle',     img: MM('Cycle'),     to: '/cycle'     },
  { key: 'mood',      label: 'Mood',      img: MM('Mood'),      to: '/mood'      },
  { key: 'sleep',     label: 'Sleep',     icon: sleepIcon,      img: MM('Sleep'),     to: '/sleep'     },
  { key: 'skin',      label: 'Skin',      icon: skinIcon,       img: MM('Skin'),      to: '/skin'      },
  { key: 'grocery',   label: 'Grocery',   icon: groceryIcon,   img: MM('Grocery'),   to: '/grocery'   },
  { key: 'community', label: 'Community', icon: communityIcon, img: MM('Community'), to: '/community' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function anim(delay = 0) {
  return { animation: `dashUp 0.5s ease ${delay}s both` }
}

// ─── Phase Ring SVG ───────────────────────────────────────────────────────────

function PhaseRing({ phase, day, cycleLength }) {
  const cx = 64, cy = 64, r = 52
  const C = 2 * Math.PI * r
  const quarterC = C / 4
  const segments = [
    { key: 'menstrual',  days: 5,  color: PHASE_META.menstrual.color  },
    { key: 'follicular', days: 8,  color: PHASE_META.follicular.color },
    { key: 'ovulation',  days: 3,  color: PHASE_META.ovulation.color  },
    { key: 'luteal',     days: cycleLength - 16, color: PHASE_META.luteal.color },
  ]

  let cumDays = 0
  const GAP = 5

  const dotAngleDeg = day != null ? ((day - 1) / cycleLength) * 360 - 90 : null
  const dotRad = dotAngleDeg != null ? dotAngleDeg * Math.PI / 180 : null
  const dotX = dotRad != null ? cx + r * Math.cos(dotRad) : null
  const dotY = dotRad != null ? cy + r * Math.sin(dotRad) : null

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(59,51,48,0.1)" strokeWidth="5" />
      {segments.map(seg => {
        const dash = Math.max(0, (seg.days / cycleLength) * C - GAP)
        const gap = C - dash
        const offset = quarterC - (cumDays / cycleLength) * C
        const isActive = seg.key === phase
        cumDays += seg.days
        return (
          <circle
            key={seg.key}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={isActive ? 7 : 4}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={isActive ? 0.95 : 0.2}
            style={{ transition: 'opacity 0.4s ease' }}
          />
        )
      })}
      {dotX != null && (
        <circle cx={dotX} cy={dotY} r={4.5} fill="rgba(59,51,48,0.9)"
          style={{ filter: 'drop-shadow(0 0 5px rgba(59,51,48,0.4))' }} />
      )}
      <text x={cx} y={cy - 7} textAnchor="middle" fill="rgba(59,51,48,0.88)"
        fontSize="26" fontFamily="Cinzel, serif">
        {day ?? '--'}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(59,51,48,0.4)"
        fontSize="7.5" fontFamily="Cormorant Garamond, serif" letterSpacing="2">
        {day ? `OF ${cycleLength}` : 'SET UP'}
      </text>
    </svg>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, delay }) {
  return (
    <div className="flex items-center gap-3 px-5 mb-3" style={anim(delay)}>
      <span className="font-cinzel text-[9px] uppercase whitespace-nowrap"
        style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(107,82,72,0.35), transparent)' }} />
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { phase, color } = usePhase()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [weather, setWeather] = useState(null)

  // ── Exit / sign-out ──────────────────────────────────────────────────────────
  const [exiting,        setExiting]        = useState(false)
  const [fadingOut,      setFadingOut]      = useState(false)
  const [showSignOutHint, setShowSignOutHint] = useState(false)
  const videoRef = useRef(null)
  const doneRef  = useRef(false)

  function doSignOut() {
    if (doneRef.current) return
    doneRef.current = true
    supabase.auth.signOut().then(() => navigate('/login', { replace: true }))
  }

  useEffect(() => {
    if (!exiting || !videoRef.current) return
    videoRef.current.muted = true
    videoRef.current.play().catch(() => doSignOut())
    const timer = setTimeout(doSignOut, 5000)
    return () => clearTimeout(timer)
  }, [exiting])

  function handleSignOut() { setExiting(true) }
  function handleVideoEnd() { setFadingOut(true); setTimeout(doSignOut, 650) }

  useEffect(() => {
    function showHint() {
      setShowSignOutHint(true)
      setTimeout(() => setShowSignOutHint(false), 4500)
    }
    const t = setTimeout(showHint, 1800)
    const interval = setInterval(showHint, 8 * 60 * 1000)
    return () => { clearTimeout(t); clearInterval(interval) }
  }, [])

  const cycleLength = profile?.cycle_length ?? 28
  const dayOfCycle = profile?.last_period_date
    ? ((differenceInDays(new Date(), new Date(profile.last_period_date)) % cycleLength) + 1)
    : null

  const content = PHASE_CONTENT[phase] ?? null
  const phaseMeta = PHASE_META[phase] ?? null
  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const activeColor = color ?? '#D4A0A0'

  // ── Daily rotation ───────────────────────────────────────────────────────────
  const dayOffset     = getDayOffset()
  const poolSize      = TODAY_POOL.length
  const todayPair     = [TODAY_POOL[(dayOffset * 2) % poolSize], TODAY_POOL[(dayOffset * 2 + 1) % poolSize]]
  const phaseRotation = PHASE_GUIDANCE_ROTATIONS[dayOffset % PHASE_GUIDANCE_ROTATIONS.length]

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,uv_index,relative_humidity_2m&temperature_unit=fahrenheit&timezone=auto`
          )
          const { current } = await res.json()
          setWeather({
            temp:     Math.round(current.temperature_2m),
            uv:       Math.round(current.uv_index ?? 0),
            humidity: Math.round(current.relative_humidity_2m ?? 58),
          })
        } catch (_) {}
      },
      () => {}
    )
  }, [])

  return (
    <>
    {/* Exit video overlay */}
    {exiting && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: '#140E0C', animation: 'exitFadeIn 0.35s ease forwards' }}>
        <style>{`
          @keyframes exitFadeIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes exitDarkIn  { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        <video ref={videoRef} src="/athena-exit.mp4" playsInline preload="auto"
          onEnded={handleVideoEnd} onError={handleVideoEnd}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )}
    {fadingOut && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 201, backgroundColor: '#140E0C', animation: 'exitDarkIn 0.65s ease forwards', pointerEvents: 'none' }} />
    )}
    <div className="flex-1 min-h-0 pb-nav overflow-y-auto" style={{ backgroundColor: '#F3EAE7' }}>
      <style>{`
        @keyframes dashUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes navShimmer {
          0%, 42%   { background-position: -250% 0; }
          78%, 100% { background-position:  250% 0; }
        }
        @keyframes dashShimmer {
          0%, 42%   { background-position: -250% 0; }
          78%, 100% { background-position:  250% 0; }
        }
        /* Shimmer rim rotation — used by dashboard + wellness widget */
        @keyframes srimRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Icon sweep — left-to-right highlight */
        @keyframes iconSweep {
          0%, 20%   { background-position: -150% 0; }
          80%, 100% { background-position:  250% 0; }
        }
        .module-scroll::-webkit-scrollbar { display: none; }
        .module-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .header-shimmer {
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: dashShimmer 10s ease-in-out infinite;
        }
        /* Reduced-motion overrides */
        @keyframes hintFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .srim-spin-el  { animation: none !important; }
          .icon-sweep-el { animation: none !important; }
          .header-shimmer { animation: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pb-4 max-w-md mx-auto" style={{ ...anim(0), paddingTop: 'calc(2.5rem + env(safe-area-inset-top))' }}>
        <div>
          <p className="font-garamond text-[11px] font-medium tracking-[0.2em] uppercase header-shimmer"
            style={{ backgroundImage: 'linear-gradient(110deg, rgba(112,98,94,0.9) 0%, rgba(112,98,94,0.9) 25%, rgba(188,178,205,0.95) 44%, rgba(232,224,248,1) 50%, rgba(188,178,205,0.95) 56%, rgba(112,98,94,0.9) 75%, rgba(112,98,94,0.9) 100%)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-cinzel text-[21px] font-medium tracking-wide mt-0.5 leading-tight header-shimmer"
            style={{ backgroundImage: 'linear-gradient(110deg, rgba(59,51,48,0.92) 0%, rgba(59,51,48,0.92) 25%, rgba(168,155,185,0.95) 44%, rgba(232,224,248,1) 50%, rgba(168,155,185,0.95) 56%, rgba(59,51,48,0.92) 75%, rgba(59,51,48,0.92) 100%)' }}>
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => navigate('/settings')}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'rgba(196,175,168,0.25)', border: '1px solid #C4AFA8' }}>
            <HeaderShimmerIcon src={settingsIcon} />
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={handleSignOut}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'rgba(196,175,168,0.25)', border: '1px solid #C4AFA8' }}>
              <HeaderShimmerIcon src={exitIcon} />
            </button>
            {showSignOutHint && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                whiteSpace: 'nowrap',
                background: 'rgba(42,32,28,0.82)',
                border: '1px solid rgba(196,133,154,0.32)',
                borderRadius: 8,
                padding: '5px 10px',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'rgba(232,213,176,0.88)',
                pointerEvents: 'none',
                zIndex: 50,
                animation: 'hintFadeIn 0.35s ease forwards',
              }}>
                Remember to sign out
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Phase Hero ── */}
      <div className="px-4 max-w-md mx-auto mb-5" style={anim(0.07)}>
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            backgroundImage: 'url("/images/dashboard/phase-hero.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 18%',
            border: `1px solid ${activeColor}50`,
          }}
        >
          {/* Linen wash — keeps dark text legible over the warm light image */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to right, rgba(242,237,232,0.38) 0%, rgba(242,237,232,0.62) 55%, rgba(242,237,232,0.72) 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 70% at 80% 50%, ${activeColor}14 0%, transparent 65%)`,
          }} />
          <div className="relative flex items-center gap-2 p-5">
            <PhaseRing phase={phase} day={dayOfCycle} cycleLength={cycleLength} />
            <div className="flex-1 min-w-0 pl-1">
              {phaseMeta && (
                <span className="font-cinzel text-[9px] tracking-[0.3em] uppercase px-2 py-1 rounded-full mb-3 inline-block"
                  style={{ background: 'rgba(59,51,48,0.12)', color: '#3B3330' }}>
                  {phaseMeta.label}
                </span>
              )}
              <h2 className="font-cinzel text-[20px] text-brown leading-tight mt-2 mb-1">
                {content?.headline ?? 'Your Journey'}
              </h2>
              <p className="font-garamond text-sm leading-relaxed" style={{ color: '#7A6A65' }}>
                {content?.sub ?? 'Set up your cycle to unlock phase guidance.'}
              </p>
              <button
                onClick={() => navigate(content ? '/cycle' : '/settings')}
                className="flex items-center gap-1 mt-3 font-cinzel text-[9px] tracking-[0.25em] uppercase transition-opacity hover:opacity-100"
                style={{ color: '#3B3330', opacity: 0.85 }}>
                {content ? 'Cycle Guide' : 'Set Up'} <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Modules (horizontal scroll) ── */}
      <SectionHeader title="My Modules" delay={0.12} />
      <div className="module-scroll overflow-x-auto mb-6" style={anim(0.15)}>
        <div className="flex gap-3 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
          {MODULE_NAV.map(({ key, label, icon, img, to }, i) => (
            <button
              key={key}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2"
              style={{ minWidth: '72px' }}
            >
              <div style={{ position: 'relative', width: 72, height: 88, borderRadius: 18, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 18,
                  overflow: 'hidden',
                  backgroundImage: `url("${img}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  {/* Bottom gradient for label legibility */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(30,18,12,0.70) 100%)',
                  }} />
                  {/* Module label pinned to bottom */}
                  <span style={{
                    position: 'absolute', bottom: 7, left: 0, right: 0,
                    textAlign: 'center',
                    fontFamily: 'Cinzel, serif',
                    fontSize: 7.5,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#F5EDE3',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    {label}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Today's Check-ins (daily rotation) ── */}
      <SectionHeader title="Today" delay={0.17} />
      <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto mb-6" style={anim(0.19)}>
        {todayPair.map(({ key, label, sub, icon, SvgIcon, img, to }, i) => (
          <div key={key} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <button
              onClick={() => navigate(to)}
              style={{
                position: 'relative',
                display: 'block', width: '100%',
                ...(img
                  ? { backgroundImage: `url("${img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: '#C4AFA8' }
                ),
                border: 'none', cursor: 'pointer',
                borderRadius: 16, padding: 16, textAlign: 'left',
                minHeight: 120,
              }}
            >
              {img && (
                <div className="absolute inset-0" style={{ borderRadius: 15, background: 'linear-gradient(to top, rgba(30,18,12,0.75) 0%, rgba(30,18,12,0.30) 55%, transparent 100%)' }} />
              )}
              <div className="relative z-10">
                {SvgIcon ? <SvgIcon color="#F0EAE4" size={22} /> : <ShimmerIcon src={icon} delay={i * 0.5} />}
                {img ? (
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(42,28,20,0.55)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 20,
                    padding: '2px 10px',
                    color: '#F5EDE3',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    fontFamily: 'Cinzel, serif',
                    textTransform: 'uppercase',
                    marginBottom: 4, marginTop: 8,
                  }}>{label}</span>
                ) : (
                  <p className="font-cinzel text-[10px] tracking-widest uppercase mb-1 mt-2"
                    style={{ color: '#3B3330' }}>{label}</p>
                )}
                <p className="font-garamond text-xs"
                  style={{ color: img ? '#FFFFFF' : '#7A6A65', textShadow: img ? '0 1px 6px rgba(0,0,0,0.6)' : 'none' }}>{sub}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* ── Phase Guidance (3-card daily rotation) ── */}
      {content && (
        <>
          <SectionHeader title="Phase Guidance" delay={0.21} />
          <div className="module-scroll overflow-x-auto mb-6" style={anim(0.23)}>
            <div className="flex gap-3 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
              {phaseRotation.map(cardIdx => {
                const { module, tip, to } = content.cards[cardIdx]
                const img = MODULE_IMAGES[module]
                return (
                  <button
                    key={module}
                    onClick={() => navigate(to)}
                    className="relative text-left rounded-2xl flex-shrink-0 overflow-hidden"
                    style={{
                      width: '172px', minHeight: '130px',
                      border: `1px solid ${img ? 'rgba(196,175,168,0.35)' : `${activeColor}40`}`,
                      ...(img
                        ? { backgroundImage: `url("${img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: `${activeColor}0e` }
                      ),
                    }}
                  >
                    {img && (
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,18,12,0.75) 0%, rgba(30,18,12,0.32) 55%, transparent 100%)' }} />
                    )}
                    <div className="relative z-10 p-4 flex flex-col h-full">
                      {img ? (
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(42,28,20,0.55)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: 20,
                          padding: '2px 10px',
                          color: '#F5EDE3',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          fontFamily: 'Cinzel, serif',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}>{module}</span>
                      ) : (
                        <p className="font-cinzel text-[10px] tracking-widest uppercase mb-2"
                          style={{ color: activeColor, opacity: 0.9 }}>
                          {module}
                        </p>
                      )}
                      <p className="font-garamond text-sm leading-snug flex-1"
                        style={{ color: '#FFFFFF', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                        {tip}
                      </p>
                      <div className="flex items-center gap-1 mt-3"
                        style={{ color: activeColor, opacity: 0.55 }}>
                        <span className="font-cinzel text-[8px] tracking-widest uppercase">Explore</span>
                        <ChevronRight size={9} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Wellness Weather ── */}
      <SectionHeader title="Wellness" delay={0.26} />
      <div className="px-4 max-w-md mx-auto mb-6" style={anim(0.28)}>
        <WellnessWeatherWidget weather={weather} phase={phase} />
      </div>

    </div>

      <HintBubble hintKey="dashboard" hints={DASHBOARD_HINTS} />
    </>
  )
}
