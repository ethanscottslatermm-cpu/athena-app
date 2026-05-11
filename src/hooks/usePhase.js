import { useMemo } from 'react'
import { useProfile } from './useProfile'
import { getCurrentPhase, phaseLabels, phaseColors, phaseDays } from '../lib/phaseEngine'

export function usePhase() {
  const { profile } = useProfile()

  const data = useMemo(() => {
    if (!profile?.last_period_date) return null
    return getCurrentPhase(
      profile.last_period_date,
      profile.cycle_length    ?? 28,
      profile.period_duration ?? 5,
    )
  }, [profile?.last_period_date, profile?.cycle_length, profile?.period_duration])

  if (!data) return { phase: null, label: null, color: null, days: null }

  return {
    // Backward-compatible fields used by Dashboard, PhaseBar, etc.
    phase: data.phase,
    label: phaseLabels[data.phase],
    color: data.phaseColor,
    days:  phaseDays[data.phase],
    // Extended fields for CycleTracker
    dayOfCycle:           data.dayOfCycle,
    daysUntilNextPeriod:  data.daysUntilNextPeriod,
    fertileStart:         data.fertileStart,
    fertileEnd:           data.fertileEnd,
    ovulationDay:         data.ovulationDay,
    nextPeriodDate:       data.nextPeriodDate,
    phaseDescription:     data.phaseDescription,
  }
}
