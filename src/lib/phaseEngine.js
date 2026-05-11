import { differenceInDays, addDays } from 'date-fns'

export const phaseColors = {
  menstrual:  '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation:  '#C9A86C',
  luteal:     '#6B4F6B',
}

export const phaseLabels = {
  menstrual:  'Menstrual',
  follicular: 'Follicular',
  ovulation:  'Ovulation',
  luteal:     'Luteal',
}

export const phaseDays = {
  menstrual:  '1–5',
  follicular: '6–13',
  ovulation:  '14–16',
  luteal:     '17–28',
}

const phaseDescriptions = {
  menstrual:  'Rest and restore. Honor what your body is releasing.',
  follicular: 'Energy rising. A good time to start and explore.',
  ovulation:  'Peak power. You are magnetic right now.',
  luteal:     'Wind down and turn inward. Nourish yourself.',
}

export function phaseFromDayOfCycle(dayOfCycle, cycleLength = 28, periodDuration = 5) {
  const ovDay = cycleLength - 14
  if (dayOfCycle <= periodDuration) return 'menstrual'
  if (dayOfCycle < ovDay - 1)       return 'follicular'
  if (dayOfCycle <= ovDay + 1)      return 'ovulation'
  return 'luteal'
}

// Day of cycle for any date — handles past and future cycles via modulo
export function getDayOfCycleForDate(date, lastPeriodDate, cycleLength = 28) {
  const diff = differenceInDays(new Date(date), new Date(lastPeriodDate))
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1
}

export function getPhaseForDate(date, lastPeriodDate, cycleLength = 28, periodDuration = 5) {
  const day = getDayOfCycleForDate(date, lastPeriodDate, cycleLength)
  return phaseFromDayOfCycle(day, cycleLength, periodDuration)
}

export function isFertileWindow(date, lastPeriodDate, cycleLength = 28) {
  const day = getDayOfCycleForDate(date, lastPeriodDate, cycleLength)
  const ovDay = cycleLength - 14
  return day >= ovDay - 5 && day <= ovDay + 1
}

export function isOvulationDay(date, lastPeriodDate, cycleLength = 28) {
  return getDayOfCycleForDate(date, lastPeriodDate, cycleLength) === cycleLength - 14
}

// Full phase object for the current date
export function getCurrentPhase(lastPeriodDate, cycleLength = 28, periodDuration = 5) {
  if (!lastPeriodDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(lastPeriodDate)
  start.setHours(0, 0, 0, 0)

  const daysSinceStart  = Math.max(0, differenceInDays(today, start))
  const cyclesSince     = Math.floor(daysSinceStart / cycleLength)
  const dayOfCycle      = (daysSinceStart % cycleLength) + 1
  const phase           = phaseFromDayOfCycle(dayOfCycle, cycleLength, periodDuration)
  const ovDay           = cycleLength - 14

  const currentCycleStart   = addDays(start, cyclesSince * cycleLength)
  const nextPeriodDate      = addDays(currentCycleStart, cycleLength)
  const daysUntilNextPeriod = differenceInDays(nextPeriodDate, today)
  const ovulationDay        = addDays(currentCycleStart, ovDay - 1)
  const fertileStart        = addDays(currentCycleStart, ovDay - 6)
  const fertileEnd          = addDays(currentCycleStart, ovDay)

  return {
    phase,
    dayOfCycle,
    daysUntilNextPeriod,
    fertileStart,
    fertileEnd,
    ovulationDay,
    nextPeriodDate,
    phaseColor:       phaseColors[phase],
    phaseDescription: phaseDescriptions[phase],
  }
}
