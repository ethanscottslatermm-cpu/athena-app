import { useState } from 'react'
import { Search, Minus, Plus, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'B'       },
  { id: 'lunch',     label: 'L'       },
  { id: 'dinner',    label: 'D'       },
  { id: 'snack',     label: 'Snack'   },
]

const FALLBACK_FOODS = {
  apple:   { food_name: 'Apple (medium)', calories: 95,  protein_g: 0.5, carbs_g: 25,  fat_g: 0.3, serving_size: 1,   serving_unit: 'medium' },
  chicken: { food_name: 'Chicken Breast', calories: 165, protein_g: 31,  carbs_g: 0,   fat_g: 3.6, serving_size: 100, serving_unit: 'g'      },
  rice:    { food_name: 'White Rice',     calories: 206, protein_g: 4.3, carbs_g: 45,  fat_g: 0.4, serving_size: 1,   serving_unit: 'cup'    },
}

// ── Nutrition label card ──────────────────────────────────────────────────────

function NutritionCard({ food, serving }) {
  const multiplied = (val) => Math.round((val || 0) * serving * 10) / 10

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 18,
      border: '1px solid rgba(196,175,168,0.4)',
      padding: '16px 16px 14px',
      marginBottom: 12,
      animation: 'nrFadeUp 0.3s ease both',
    }}>
      <p className="font-cinzel text-sm font-semibold mb-1" style={{ color: '#3B3330' }}>
        {food.food_name}
      </p>
      <p className="font-garamond text-xs mb-4" style={{ color: '#7A6A65' }}>
        {food.serving_size} {food.serving_unit} per serving
      </p>

      {/* Macro grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
        {[
          { label: 'Cal',     value: Math.round((food.calories || 0) * serving), color: '#3B3330', bg: 'rgba(196,175,168,0.2)' },
          { label: 'Protein', value: `${multiplied(food.protein_g)}g`, color: '#8FA58C',  bg: 'rgba(143,165,140,0.15)' },
          { label: 'Carbs',   value: `${multiplied(food.carbs_g)}g`,   color: '#C9A84C',  bg: 'rgba(201,168,76,0.13)'  },
          { label: 'Fat',     value: `${multiplied(food.fat_g)}g`,     color: '#D4A0A0',  bg: 'rgba(212,160,160,0.15)' },
        ].map(m => (
          <div key={m.label} style={{
            background: m.bg, borderRadius: 10,
            padding: '8px 6px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 700, color: m.color, margin: 0, lineHeight: 1 }}>
              {m.value}
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A6A65', marginTop: 3 }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NourishSearch({ onLogSaved }) {
  const { user } = useAuth()

  const [query,    setQuery]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [serving,  setServing]  = useState(1)
  const [mealType, setMealType] = useState('breakfast')
  const [logging,  setLogging]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setServing(1)
    setSuccess(false)
    try {
      const r = await fetch('/.netlify/functions/ai-nourish', {
        method: 'POST',
        body: JSON.stringify({ type: 'food_search', query: query.trim() }),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setResult(d)
    } catch {
      // Use a simple fallback if query matches
      const key = Object.keys(FALLBACK_FOODS).find(k => query.toLowerCase().includes(k))
      if (key) setResult(FALLBACK_FOODS[key])
      else setError('Couldn\'t find that food. Try a different search.')
    }
    setLoading(false)
  }

  async function handleLog() {
    if (!result || !user) return
    setLogging(true)
    try {
      await supabase.from('food_log').insert({
        user_id:      user.id,
        log_date:     new Date().toISOString().split('T')[0],
        meal_type:    mealType,
        food_name:    result.food_name,
        calories:     Math.round((result.calories  || 0) * serving),
        protein_g:    Math.round((result.protein_g || 0) * serving * 10) / 10,
        carbs_g:      Math.round((result.carbs_g   || 0) * serving * 10) / 10,
        fat_g:        Math.round((result.fat_g     || 0) * serving * 10) / 10,
        serving_size: (result.serving_size || 1) * serving,
        serving_unit: result.serving_unit || 'serving',
      })
      setSuccess(true)
      setTimeout(() => {
        setResult(null)
        setQuery('')
        setSuccess(false)
        onLogSaved()
      }, 900)
    } catch {
      setError('Failed to log. Please try again.')
    }
    setLogging(false)
  }

  return (
    <>
      <style>{`
        @keyframes nrFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex', gap: 8,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          border: '1px solid rgba(196,175,168,0.4)',
          padding: '4px 4px 4px 14px',
          alignItems: 'center',
        }}>
          <Search size={15} color="#7A6A65" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any food…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 15,
              color: '#3B3330', padding: '10px 0',
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              background: '#8FA58C', border: 'none', borderRadius: 10,
              padding: '8px 14px', cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 8,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#F2EDE8',
              opacity: (!query.trim() || loading) ? 0.45 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '…' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <p className="font-garamond text-sm italic mb-3" style={{ color: '#D4A0A0' }}>{error}</p>
      )}

      {loading && (
        <p className="font-garamond text-sm italic mb-4" style={{ color: 'rgba(59,51,48,0.4)', animation: 'nrFadeUp 0.3s ease both' }}>
          Looking up nutrition data…
        </p>
      )}

      {result && !success && (
        <>
          <NutritionCard food={result} serving={serving} />

          {/* Serving stepper */}
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(12px)',
            borderRadius: 16,
            border: '1px solid rgba(196,175,168,0.35)',
            padding: '12px 14px',
            marginBottom: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: '#7A6A65' }}>
              Servings
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setServing(s => Math.max(0.5, +(s - 0.5).toFixed(1)))}
                style={{ background: 'rgba(196,175,168,0.3)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={13} color="#7A6A65" strokeWidth={2} />
              </button>
              <span className="font-cinzel text-sm" style={{ color: '#3B3330', minWidth: 28, textAlign: 'center' }}>
                {serving}
              </span>
              <button
                onClick={() => setServing(s => +(s + 0.5).toFixed(1))}
                style={{ background: 'rgba(196,175,168,0.3)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={13} color="#7A6A65" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Meal type picker */}
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(12px)',
            borderRadius: 16,
            border: '1px solid rgba(196,175,168,0.35)',
            padding: '12px 14px',
            marginBottom: 14,
          }}>
            <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#7A6A65' }}>
              Add to Meal
            </p>
            <div style={{ display: 'flex', gap: 7 }}>
              {MEAL_OPTIONS.map(opt => {
                const active = mealType === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMealType(opt.id)}
                    style={{
                      flex: 1, padding: '7px 4px', borderRadius: 10,
                      border: `1px solid ${active ? '#8FA58C' : 'rgba(196,175,168,0.4)'}`,
                      background: active ? 'rgba(143,165,140,0.2)' : 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'Cinzel, serif', fontSize: 8,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: active ? '#8FA58C' : '#7A6A65',
                      transition: 'all 0.18s',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Log It */}
          <button
            onClick={handleLog}
            disabled={logging}
            style={{
              width: '100%', padding: '14px',
              background: '#8FA58C', border: 'none', borderRadius: 14,
              cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 10,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#F2EDE8',
              opacity: logging ? 0.6 : 1,
              transition: 'opacity 0.2s',
              marginBottom: 24,
            }}
          >
            {logging ? 'Logging…' : 'Log It'}
          </button>
        </>
      )}

      {success && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '32px 0', animation: 'nrFadeUp 0.3s ease both',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(143,165,140,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Check size={22} color="#8FA58C" strokeWidth={2} />
          </div>
          <p className="font-garamond text-sm italic" style={{ color: '#7A6A65' }}>Logged to Today</p>
        </div>
      )}

      {!result && !loading && !error && (
        <div style={{ paddingTop: 24, textAlign: 'center' }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
            Search for any food to see its nutrition breakdown
          </p>
        </div>
      )}
    </>
  )
}
