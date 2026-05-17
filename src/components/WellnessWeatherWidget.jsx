import { useState } from 'react'
import { Thermometer, Sun, Wind, Droplets, Leaf, Cloud, CloudRain, CloudSun } from 'lucide-react'

// ─── Level helpers ────────────────────────────────────────────────────────────

function uvLevel(uv) {
  if (uv >= 6) return { label: 'High',     color: '#C4859A' }
  if (uv >= 3) return { label: 'Mod',      color: '#C9A84C' }
  return              { label: 'Low',      color: '#8FA58C' }
}

function aqiLevel(aqi) {
  if (aqi >= 101) return { label: 'Poor', color: '#C4859A' }
  if (aqi >= 51)  return { label: 'Fair', color: '#C9A84C' }
  return                 { label: 'Good', color: '#8FA58C' }
}

// ─── 7-Day forecast placeholder ───────────────────────────────────────────────

function buildForecast() {
  const abbr  = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const types = ['sun','partly','cloud','rain','sun','partly','sun']
  const highs = [74, 71, 68, 64, 76, 73, 78]
  const lows  = [58, 55, 52, 50, 60, 57, 61]
  const uvs   = [4, 3, 2, 1, 5, 4, 6]
  const today = new Date().getDay()
  return Array.from({ length: 7 }, (_, i) => ({
    isToday: i === 0,
    day:  i === 0 ? 'TODAY' : abbr[(today + i) % 7],
    type: types[i],
    high: highs[i],
    low:  lows[i],
    uv:   uvs[i],
  }))
}

const FORECAST = buildForecast()

// ─── Skin insights ────────────────────────────────────────────────────────────

function getSkinInsights(data) {
  const ins = []

  if (data.uv >= 6)
    ins.push({ Icon: Sun,      title: 'Very High UV',       text: 'SPF 50+ essential — reapply every 2 hours outdoors.' })
  else if (data.uv >= 3)
    ins.push({ Icon: Sun,      title: 'Moderate UV',        text: 'Wear SPF 30–50, even on partly cloudy days.' })
  else
    ins.push({ Icon: Sun,      title: 'Low UV Today',       text: 'Light daily SPF is still a smart habit.' })

  if (data.humidity < 40)
    ins.push({ Icon: Droplets, title: 'Low Humidity',       text: 'Prioritize barrier cream and hyaluronic serum.' })
  else if (data.humidity > 70)
    ins.push({ Icon: Droplets, title: 'High Humidity',      text: 'Swap heavy cream for a light gel moisturizer.' })
  else
    ins.push({ Icon: Droplets, title: 'Balanced Moisture',  text: 'Ideal conditions for layering actives today.' })

  if (data.aqi >= 101)
    ins.push({ Icon: Wind,     title: 'Poor Air Quality',   text: 'Antioxidant vitamin C serum is essential today.' })
  else if (data.aqi >= 51)
    ins.push({ Icon: Wind,     title: 'Moderate Pollution', text: 'Consider an antioxidant serum for free-radical defense.' })

  if (data.pollen === 'high')
    ins.push({ Icon: Leaf,     title: 'High Pollen',        text: 'Avoid new actives — skin may be reactive.' })
  else if (data.pollen === 'moderate')
    ins.push({ Icon: Leaf,     title: 'Moderate Pollen',    text: 'Watch for redness or sensitivity flare-ups.' })

  return ins.slice(0, 4)
}

// ─── Phase skin label ─────────────────────────────────────────────────────────

const PHASE_SKIN = {
  menstrual:  'Menstrual — skin sensitive, gentle actives only',
  follicular: 'Follicular — resilient phase, light actives safe',
  ovulation:  'Ovulation — radiant & strong, keep SPF-protected',
  luteal:     'Luteal — oilier tendency, focus on balance & barrier',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelDot({ color }) {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: '50%',
      background: color, display: 'inline-block', flexShrink: 0,
    }} />
  )
}

function StatTile({ Icon, label, value, levelColor }) {
  return (
    <div style={{
      background: '#C4AFA8', borderRadius: 12,
      padding: '10px 12px',
      border: '1px solid rgba(196,175,168,0.4)',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Icon size={13} color="#7A6A65" strokeWidth={1.5} />
        {levelColor && <LevelDot color={levelColor} />}
      </div>
      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600,
        color: '#3B3330', margin: 0, lineHeight: 1.1,
      }}>{value}</p>
      <p style={{
        fontFamily: 'Cormorant Garamond, serif', fontSize: 10,
        color: '#7A6A65', letterSpacing: '0.1em',
        textTransform: 'uppercase', margin: 0,
      }}>{label}</p>
    </div>
  )
}

function DayIcon({ type, size = 16 }) {
  const props = { size, color: '#7A6A65', strokeWidth: 1.4 }
  if (type === 'sun')    return <Sun {...props} />
  if (type === 'rain')   return <CloudRain {...props} />
  if (type === 'partly') return <CloudSun {...props} />
  return <Cloud {...props} />
}

// ─── Main widget ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'conditions', label: 'Conditions' },
  { id: 'skin',       label: 'Skin Watch' },
  { id: 'forecast',   label: '7-Day'      },
]

export default function WellnessWeatherWidget({ weather, phase }) {
  const [tab, setTab] = useState('conditions')

  const data = {
    temp:     weather?.temp     ?? 72,
    uv:       weather?.uv       ?? 4,
    humidity: weather?.humidity ?? 58,
    aqi:      42,          // placeholder — swap for live AQI API
    pollen:   'moderate',  // placeholder — swap for pollen API
  }

  const uvLvl     = uvLevel(data.uv)
  const aqiLvl    = aqiLevel(data.aqi)
  const insights  = getSkinInsights(data)
  const skinPhase = PHASE_SKIN[phase] ?? 'Set up your cycle for skin phase insights'

  return (
    <div style={{
      background: '#D6CFC9', borderRadius: 18,
      border: '1px solid rgba(214,207,201,0.6)',
      overflow: 'hidden',
    }}>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 10px 0' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: 20,
              border: 'none',
              background: tab === t.id ? 'rgba(196,175,168,0.7)' : 'transparent',
              color: tab === t.id ? '#3B3330' : '#7A6A65',
              fontFamily: 'Cinzel, serif',
              fontSize: 7.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '10px 10px 14px' }}>

        {/* Conditions */}
        {tab === 'conditions' && (
          <div key="conditions" style={{ animation: 'wTabFade 0.22s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <StatTile Icon={Thermometer} label="Temperature" value={`${data.temp}°F`} />
              <StatTile Icon={Sun}         label="UV Index"    value={`UV ${data.uv}`}   levelColor={uvLvl.color} />
              <StatTile Icon={Wind}        label="Air Quality" value={`AQI ${data.aqi}`} levelColor={aqiLvl.color} />
              <StatTile Icon={Droplets}    label="Humidity"    value={`${data.humidity}%`} />
            </div>
          </div>
        )}

        {/* Skin Watch */}
        {tab === 'skin' && (
          <div key="skin" style={{ animation: 'wTabFade 0.22s ease both' }}>
            {/* Phase chip + label */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 10 }}>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: '#8FA58C',
                background: 'rgba(143,165,140,0.18)', padding: '3px 8px',
                borderRadius: 10, border: '1px solid rgba(143,165,140,0.35)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>Skin Phase</span>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                fontSize: 11, color: '#7A6A65', margin: 0, lineHeight: 1.35,
              }}>{skinPhase}</p>
            </div>

            {/* Insight cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {insights.map(({ Icon, title, text }, i) => (
                <div key={i} style={{
                  background: '#C4AFA8', borderRadius: 11,
                  padding: '9px 12px',
                  border: '1px solid rgba(196,175,168,0.4)',
                  display: 'flex', alignItems: 'flex-start', gap: 9,
                }}>
                  <Icon size={13} color="#C4859A" strokeWidth={1.5}
                    style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{
                      fontFamily: 'Cinzel, serif', fontSize: 8.5,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: '#3B3330', margin: '0 0 2px', fontWeight: 600,
                    }}>{title}</p>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 12, color: '#7A6A65', margin: 0, lineHeight: 1.4,
                    }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day */}
        {tab === 'forecast' && (
          <div key="forecast" style={{ animation: 'wTabFade 0.22s ease both' }}>
            <div style={{ overflowX: 'auto', paddingBottom: 2 }}>
              <div style={{ display: 'flex', gap: 7, width: 'max-content' }}>
                {FORECAST.map((day, i) => {
                  const uLvl = uvLevel(day.uv)
                  return (
                    <div key={i} style={{
                      width: 62, borderRadius: 14,
                      background: day.isToday ? '#C4AFA8' : 'rgba(196,175,168,0.28)',
                      border: day.isToday
                        ? '1px solid rgba(143,165,140,0.55)'
                        : '1px solid rgba(196,175,168,0.35)',
                      padding: '10px 0',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 5,
                    }}>
                      <p style={{
                        fontFamily: 'Cinzel, serif', fontSize: 7,
                        letterSpacing: '0.15em',
                        color: day.isToday ? '#3B3330' : '#7A6A65',
                        margin: 0,
                      }}>{day.day}</p>

                      <DayIcon type={day.type} size={16} />

                      <div style={{ textAlign: 'center' }}>
                        <p style={{
                          fontFamily: 'Cormorant Garamond, serif', fontSize: 13,
                          fontWeight: 600, color: '#3B3330', margin: 0, lineHeight: 1,
                        }}>{day.high}°</p>
                        <p style={{
                          fontFamily: 'Cormorant Garamond, serif', fontSize: 11,
                          color: '#7A6A65', margin: 0,
                        }}>{day.low}°</p>
                      </div>

                      {/* UV badge */}
                      <div style={{
                        padding: '1px 6px', borderRadius: 6,
                        background: uLvl.color + '22',
                        border: `1px solid ${uLvl.color}55`,
                      }}>
                        <p style={{
                          fontFamily: 'Cinzel, serif', fontSize: 7,
                          color: uLvl.color, margin: 0, letterSpacing: '0.05em',
                        }}>UV {day.uv}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes wTabFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
