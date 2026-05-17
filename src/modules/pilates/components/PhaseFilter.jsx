const CHIPS = [
  { id: 'all',          key: null,         val: null,           label: 'All' },
  { id: 'beginner',     key: 'difficulty', val: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', key: 'difficulty', val: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     key: 'difficulty', val: 'advanced',     label: 'Advanced' },
  { id: 'core',         key: 'focus',      val: 'core',         label: 'Core' },
  { id: 'glutes',       key: 'focus',      val: 'glutes',       label: 'Glutes' },
  { id: 'full_body',    key: 'focus',      val: 'full_body',    label: 'Full Body' },
  { id: 'recovery',     key: 'focus',      val: 'recovery',     label: 'Recovery' },
  { id: '15min',        key: 'duration',   val: '15',           label: '15 min' },
  { id: '30min',        key: 'duration',   val: '30',           label: '30 min' },
  { id: '45min',        key: 'duration',   val: '45',           label: '45 min' },
]

export default function PhaseFilter({ activeId = 'all', onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2.5 hide-scrollbar">
      {CHIPS.map(chip => {
        const on = activeId === chip.id
        return (
          <button
            key={chip.id}
            onClick={() => onChange(chip)}
            className="shrink-0 font-garamond text-[13px] px-4 rounded-full transition-all"
            style={{
              height: 32,
              background: on ? '#C4859A' : 'rgba(37,34,32,0.06)',
              border: on ? '1px solid rgba(196,133,154,0.9)' : '1px solid rgba(37,34,32,0.15)',
              color: on ? '#F2EDE8' : 'rgba(37,34,32,0.48)',
              fontWeight: on ? 600 : 400,
            }}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
