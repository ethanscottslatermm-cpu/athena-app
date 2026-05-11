const GROUPS = [
  { key: 'phase',      options: ['all', 'menstrual', 'follicular', 'ovulation', 'luteal'] },
  { key: 'focus',      options: ['all', 'core', 'glutes', 'arms', 'full_body', 'flexibility', 'recovery'] },
  { key: 'duration',   options: ['all', '15', '30', '45'] },
  { key: 'difficulty', options: ['all', 'beginner', 'intermediate', 'advanced'] },
  { key: 'equipment',  options: ['all', 'mat', 'ring', 'ball', 'bands'] },
]

function chipLabel(key, val) {
  if (val === 'all') return 'All'
  if (key === 'duration') return `${val} min`
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function PhaseFilter({ active = {}, onChange }) {
  return (
    <div className="space-y-1.5 py-2">
      {GROUPS.map(({ key, options }) => (
        <div key={key} className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
          {options.map(opt => {
            const on = (active[key] ?? 'all') === opt
            return (
              <button
                key={opt}
                onClick={() => onChange(key, on && opt !== 'all' ? 'all' : opt)}
                className="shrink-0 font-garamond text-xs px-3 rounded-full transition-all"
                style={{
                  minHeight: 30,
                  background: on ? '#C9A86C' : 'rgba(8,5,4,0.6)',
                  border: on ? '1px solid #C9A86C' : '1px solid rgba(244,239,230,0.18)',
                  color: on ? '#060404' : 'rgba(244,239,230,0.65)',
                  fontWeight: on ? 600 : 400,
                }}
              >
                {chipLabel(key, opt)}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
