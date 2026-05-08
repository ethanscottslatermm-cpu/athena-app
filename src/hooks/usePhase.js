import { useMemo } from 'react'
import { useProfile } from './useProfile'
import { getCurrentPhase, phaseLabels, phaseColors, phaseDays } from '../lib/phaseEngine'

export function usePhase() {
  const { profile } = useProfile()

  const phase = useMemo(() => {
    if (!profile?.last_period_date) return null
    return getCurrentPhase(profile.last_period_date, profile.cycle_length)
  }, [profile?.last_period_date, profile?.cycle_length])

  return {
    phase,
    label: phaseLabels[phase] ?? null,
    color: phaseColors[phase] ?? null,
    days:  phaseDays[phase] ?? null,
  }
}
