export default function BodyHeatmap({ completions = [], sessions = [] }) {
  const freq = {}
  completions.forEach(c => {
    const s = sessions.find(x => x.id === c.session_id)
    if (s?.focus_area) freq[s.focus_area] = (freq[s.focus_area] || 0) + 1
  })
  const maxF = Math.max(...Object.values(freq), 1)

  function glow(area, fallbackArea) {
    const f = freq[area] || 0
    const fb = fallbackArea ? (freq[fallbackArea] || 0) * 0.6 : 0
    const effective = Math.max(f, fb)
    if (effective === 0) return 'rgba(244,239,230,0.06)'
    return `rgba(201,168,108,${Math.min(0.85, 0.15 + (effective / maxF) * 0.7)})`
  }

  const hasData = Object.keys(freq).length > 0

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 220" className="w-20 h-44">
        {/* Head */}
        <ellipse cx="50" cy="14" rx="11" ry="13"
          fill="rgba(244,239,230,0.08)" stroke="rgba(244,239,230,0.12)" strokeWidth="0.8" />
        {/* Neck */}
        <rect x="44" y="26" width="12" height="12" rx="3"
          fill="rgba(244,239,230,0.06)" stroke="rgba(244,239,230,0.1)" strokeWidth="0.8" />
        {/* Core / torso */}
        <rect x="35" y="40" width="30" height="52" rx="8"
          fill={glow('core', 'full_body')}
          stroke="rgba(244,239,230,0.1)" strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}
        />
        {/* Left arm */}
        <rect x="18" y="42" width="14" height="44" rx="6"
          fill={glow('arms', 'full_body')}
          stroke="rgba(244,239,230,0.1)" strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}
        />
        {/* Right arm */}
        <rect x="68" y="42" width="14" height="44" rx="6"
          fill={glow('arms', 'full_body')}
          stroke="rgba(244,239,230,0.1)" strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}
        />
        {/* Hips / glutes */}
        <rect x="33" y="94" width="34" height="30" rx="7"
          fill={glow('glutes', 'full_body')}
          stroke="rgba(244,239,230,0.1)" strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}
        />
        {/* Left leg */}
        <rect x="34" y="126" width="13" height="70" rx="6"
          fill={glow('full_body', 'flexibility')}
          stroke="rgba(244,239,230,0.1)" strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}
        />
        {/* Right leg */}
        <rect x="53" y="126" width="13" height="70" rx="6"
          fill={glow('full_body', 'flexibility')}
          stroke="rgba(244,239,230,0.1)" strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}
        />
        {/* Recovery glow overlay */}
        {(freq['recovery'] || 0) > 0 && (
          <rect x="18" y="40" width="64" height="170" rx="12"
            fill={`rgba(143,175,138,${Math.min(0.2, (freq['recovery'] / maxF) * 0.25)})`}
            style={{ transition: 'fill 0.5s' }}
          />
        )}
      </svg>

      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
        {hasData
          ? Object.entries(freq)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([area, count]) => (
                <span key={area} className="font-garamond text-[10px] text-ivory/50 capitalize">
                  <span style={{ color: '#C9A86C' }}>●</span>{' '}
                  {area.replace(/_/g, ' ')} ×{count}
                </span>
              ))
          : (
            <span className="font-garamond text-ivory/25 text-xs text-center">
              Complete sessions to see your heatmap
            </span>
          )
        }
      </div>
    </div>
  )
}
