import MuscleMap, { focusGroupsToMuscleIds } from '../../../components/MuscleMap'
import { mapFocusToMuscles } from '../../../utils/muscleGroupMap'

export default function BodyHeatmap({ completions = [], sessions = [] }) {
  const freq = {}
  completions.forEach(c => {
    const s = sessions.find(x => x.id === c.session_id)
    if (s?.focus_area) freq[s.focus_area] = (freq[s.focus_area] || 0) + 1
  })

  const hasData = Object.keys(freq).length > 0
  const maxF = Math.max(...Object.values(freq), 1)

  const tally = {}
  Object.entries(freq).forEach(([area, count]) => {
    const { primary, secondary } = mapFocusToMuscles(area)
    const ids = focusGroupsToMuscleIds([...primary, ...secondary])
    ids.forEach(id => {
      tally[id] = Math.max(tally[id] ?? 0, count / maxF)
    })
  })

  const muscleIds = Object.keys(tally)
  const opacityMap = {}
  muscleIds.forEach(id => { opacityMap[id] = Math.max(0.12, tally[id]) })

  return (
    <div>
      <div style={{ width: 196, margin: '0 auto' }}>
        <MuscleMap
          mode="overview"
          activeMuscles={hasData ? muscleIds : []}
          opacityMap={hasData ? opacityMap : {}}
          size="lg"
          showOutline={true}
        />
      </div>
      {!hasData && (
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'rgba(242,237,232,0.3)', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
          Complete sessions to see your body focus map
        </p>
      )}
    </div>
  )
}
