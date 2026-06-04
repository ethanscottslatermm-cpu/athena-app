import BodyMuscleMap from '../../../components/pilates/BodyMuscleMap'
import { focusToMuscles } from '../../../utils/muscleGroupMap'

export default function BodyHeatmap({ completions = [], sessions = [], height = 220 }) {
  const freq = {}
  completions.forEach(c => {
    const s = sessions.find(x => x.id === c.session_id)
    if (s?.focus_area) freq[s.focus_area] = (freq[s.focus_area] || 0) + 1
  })

  const maxF = Math.max(...Object.values(freq), 1)
  const primary   = []
  const secondary = []

  Object.entries(freq).forEach(([area, count]) => {
    const { primary: pm } = focusToMuscles(area)
    if (count / maxF >= 0.4) primary.push(...pm)
    else secondary.push(...pm)
  })

  const hasData = Object.keys(freq).length > 0

  return (
    <div className="flex flex-col items-center gap-3">
      <BodyMuscleMap
        activeMuscles={hasData ? [...new Set(primary)] : []}
        secondaryMuscles={hasData ? [...new Set(secondary)] : []}
        height={height}
        showLegend={false}
      />

      {/* Frequency pills */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
        {hasData
          ? Object.entries(freq)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([area, count]) => (
                <span key={area} className="font-garamond text-[10px] text-brown/50 capitalize">
                  <span style={{ color: '#C4859A' }}>●</span>{' '}
                  {area.replace(/_/g, ' ')} ×{count}
                </span>
              ))
          : (
            <span className="font-garamond text-brown/30 text-xs text-center">
              Complete sessions to see your body focus map
            </span>
          )
        }
      </div>
    </div>
  )
}
