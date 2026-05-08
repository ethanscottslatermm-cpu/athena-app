import { differenceInDays } from 'date-fns'

export function getCurrentPhase(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null

  const today = new Date()
  const start = new Date(lastPeriodDate)
  const dayOfCycle = (differenceInDays(today, start) % cycleLength) + 1

  if (dayOfCycle >= 1 && dayOfCycle <= 5) return 'menstrual'
  if (dayOfCycle >= 6 && dayOfCycle <= 13) return 'follicular'
  if (dayOfCycle >= 14 && dayOfCycle <= 16) return 'ovulation'
  return 'luteal'
}

export const phaseLabels = {
  menstrual:  'Menstrual',
  follicular: 'Follicular',
  ovulation:  'Ovulation',
  luteal:     'Luteal',
}

export const phaseColors = {
  menstrual:  '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation:  '#C9A86C',
  luteal:     '#6B4F6B',
}

export const phaseDays = {
  menstrual:  '1–5',
  follicular: '6–13',
  ovulation:  '14–16',
  luteal:     '17–28',
}
