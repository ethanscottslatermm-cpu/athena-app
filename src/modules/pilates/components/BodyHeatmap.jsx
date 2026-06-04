import BodyMuscleMap from '../../../components/pilates/BodyMuscleMap'
import { mapFocusToMuscles } from '../../../utils/muscleGroupMap'

export default function BodyHeatmap({ completions = [], sessions = [] }) {
  const freq = {}
  completions.forEach(c => {
    const s = sessions.find(x => x.id === c.session_id)
    if (s?.focus_area) freq[s.focus_area] = (freq[s.focus_area] || 0) + 1
  })
  const maxF = Math.max(...Object.values(freq), 1)

  const primary = [], secondary = []
  Object.entries(freq).forEach(([area, count]) => {
    const { primary: pm, secondary: sm } = mapFocusToMuscles(area)
    if (count / maxF >= 0.4) primary.push(...pm)
    else secondary.push(...sm)
  })

  const hasData = Object.keys(freq).length > 0

  return (
    <div>
      <BodyMuscleMap
        primaryMuscles={hasData ? [...new Set(primary)] : []}
        secondaryMuscles={hasData ? [...new Set(secondary)] : []}
        height={280}
        showLabels={true}
      />
      {!hasData && (
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'rgba(242,237,232,0.3)', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
          Complete sessions to see your body focus map
        </p>
      )}
    </div>
  )
}
