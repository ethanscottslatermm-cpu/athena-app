import { useState, useEffect, useRef } from 'react'
import { X, Minus, Plus, Check, RotateCcw, Search } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const SAGE = '#8FA58C'
const ROSE = '#D4A0A0'

const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch'     },
  { id: 'dinner',    label: 'Dinner'    },
  { id: 'snack',     label: 'Snack'     },
]

// ── Macro pill ────────────────────────────────────────────────────────────────

function MacroPill({ label, value, color, bg }) {
  return (
    <div style={{
      flex: 1, background: bg, borderRadius: 10,
      padding: '8px 4px', textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'Cormorant Garamond, serif', fontSize: 16,
        fontWeight: 700, color, margin: 0, lineHeight: 1,
      }}>{value}</p>
      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 6.5,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: '#7A6A65', marginTop: 3,
      }}>{label}</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function FoodScanner({ onClose, onLogSaved, onSearchInstead }) {
  const { user } = useAuth()
  const videoRef   = useRef(null)
  const readerRef  = useRef(null)
  const scannedRef = useRef(false)

  const [status,   setStatus]   = useState('scanning') // scanning | loading | found | not_found | error
  const [food,     setFood]     = useState(null)
  const [serving,  setServing]  = useState(1)
  const [mealType, setMealType] = useState('lunch')
  const [logging,  setLogging]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [torchOn,  setTorchOn]  = useState(false)
  const [stream,   setStream]   = useState(null)

  // ── Start scanner ───────────────────────────────────────────────────────────

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
      if (result && !scannedRef.current) {
        scannedRef.current = true
        // Haptic feedback
        try { navigator.vibrate?.(60) } catch {}
        setStatus('loading')
        await lookupBarcode(result.getText())
      }
    }).then(controls => {
      // Store stream for torch toggle
      const vid = videoRef.current
      if (vid?.srcObject) setStream(vid.srcObject)
    }).catch(() => {})

    return () => {
      try { reader.reset() } catch {}
    }
  }, [])

  // ── Barcode lookup ──────────────────────────────────────────────────────────

  async function lookupBarcode(barcode) {
    try {
      const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()

      if (data.status === 1 && data.product) {
        const p = data.product
        const n = p.nutriments || {}

        // Energy: prefer kcal field, fall back to kJ ÷ 4.184
        const kcal = n['energy-kcal_100g'] ?? n['energy-kcal'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0)

        // Try to parse serving size
        let srvSize = 100
        let srvUnit = 'g'
        if (p.serving_size) {
          const match = p.serving_size.match(/(\d+\.?\d*)\s*([a-zA-Z]+)/)
          if (match) { srvSize = parseFloat(match[1]); srvUnit = match[2].toLowerCase() }
        }

        setFood({
          food_name:  p.product_name || p.abbreviated_product_name || 'Unknown Product',
          brand:      p.brands || '',
          calories:   Math.round(kcal * srvSize / 100),
          protein_g:  Math.round((n['proteins_100g'] || 0) * srvSize / 100 * 10) / 10,
          carbs_g:    Math.round((n['carbohydrates_100g'] || 0) * srvSize / 100 * 10) / 10,
          fat_g:      Math.round((n['fat_100g'] || 0) * srvSize / 100 * 10) / 10,
          serving_size: srvSize,
          serving_unit: srvUnit,
          // per-100g for scaling
          cal_per_100:     Math.round(kcal),
          protein_per_100: Math.round((n['proteins_100g'] || 0) * 10) / 10,
          carbs_per_100:   Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
          fat_per_100:     Math.round((n['fat_100g'] || 0) * 10) / 10,
        })
        setStatus('found')
      } else {
        setStatus('not_found')
      }
    } catch {
      setStatus('error')
    }
  }

  function rescan() {
    scannedRef.current = false
    setFood(null)
    setStatus('scanning')
  }

  // ── Torch ───────────────────────────────────────────────────────────────────

  async function toggleTorch() {
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    const caps  = track.getCapabilities?.() ?? {}
    if (!caps.torch) return
    const next = !torchOn
    try { await track.applyConstraints({ advanced: [{ torch: next }] }); setTorchOn(next) } catch {}
  }

  // ── Log food ────────────────────────────────────────────────────────────────

  async function handleLog() {
    if (!user || !food) return
    setLogging(true)
    const today = new Date().toISOString().split('T')[0]
    const mult  = serving * (food.serving_size / 100)

    await supabase.from('food_logs').insert({
      user_id:     user.id,
      log_date:    today,
      food_name:   food.food_name,
      meal_type:   mealType,
      calories:    Math.round(food.cal_per_100 * mult),
      protein_g:   Math.round(food.protein_per_100 * mult * 10) / 10,
      carbs_g:     Math.round(food.carbs_per_100  * mult * 10) / 10,
      fat_g:       Math.round(food.fat_per_100    * mult * 10) / 10,
      serving_qty: serving,
      serving_unit: food.serving_unit,
    })

    setLogging(false)
    setSuccess(true)
    try { navigator.vibrate?.(40) } catch {}
    setTimeout(() => { onLogSaved?.(); onClose() }, 900)
  }

  // ── Scaled macros for display ────────────────────────────────────────────────

  const mult    = food ? serving * (food.serving_size / 100) : 1
  const cal     = food ? Math.round(food.cal_per_100     * mult) : 0
  const protein = food ? Math.round(food.protein_per_100 * mult * 10) / 10 : 0
  const carbs   = food ? Math.round(food.carbs_per_100   * mult * 10) / 10 : 0
  const fat     = food ? Math.round(food.fat_per_100     * mult * 10) / 10 : 0

  return (
    <>
      <style>{`
        @keyframes scanLine {
          0%,100% { top: 8%; opacity: 0.9; }
          50%      { top: 86%; opacity: 1;  }
        }
        @keyframes resultUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes scannerFadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 110,
        background: '#000',
        animation: 'scannerFadeIn 0.22s ease both',
      }}>

        {/* ── Camera feed ── */}
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* ── Scanning state overlay ── */}
        {status === 'scanning' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Dim surround */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.48)',
            }} />

            {/* Guide box */}
            <div style={{
              position: 'absolute',
              top: '32%', left: '8%', right: '8%',
              height: '20%',
              borderRadius: 14,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.48)',
              border: '2px solid rgba(255,255,255,0.75)',
              overflow: 'hidden',
            }}>
              {/* Animated scan line */}
              <div style={{
                position: 'absolute', left: 0, right: 0,
                height: 2.5,
                background: `linear-gradient(90deg, transparent, ${SAGE}, transparent)`,
                animation: 'scanLine 2s ease-in-out infinite',
              }} />
              {/* Corner marks */}
              {[['0','0','right','bottom'],['0','auto','right','top'],['auto','0','left','bottom'],['auto','auto','left','top']].map(([t,b,br,tl],i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: t !== 'auto' ? t : undefined, bottom: b !== 'auto' ? b : undefined,
                  ...(br === 'right' ? { right: 0 } : { left: 0 }),
                  width: 16, height: 16,
                  borderTop:    tl === 'top'    ? `2px solid ${SAGE}` : 'none',
                  borderBottom: tl === 'bottom' ? `2px solid ${SAGE}` : 'none',
                  borderLeft:   br === 'left'   ? `2px solid ${SAGE}` : 'none',
                  borderRight:  br === 'right'  ? `2px solid ${SAGE}` : 'none',
                }} />
              ))}
            </div>

            <p style={{
              position: 'absolute', bottom: '22%',
              left: 0, right: 0, textAlign: 'center',
              fontFamily: 'Cinzel, serif', fontSize: 10,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
            }}>
              Point at a barcode
            </p>
          </div>
        )}

        {/* ── Loading ── */}
        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
              fontSize: 18, color: 'rgba(255,255,255,0.8)',
            }}>
              Looking up product…
            </p>
          </div>
        )}

        {/* ── Not found ── */}
        {(status === 'not_found' || status === 'error') && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(242,237,232,0.98)',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '28px 20px 48px',
            animation: 'resultUp 0.35s cubic-bezier(0.34,1.15,0.64,1) both',
            textAlign: 'center',
          }}>
            <p className="font-cinzel text-[10px] tracking-widest uppercase mb-2" style={{ color: ROSE }}>
              {status === 'error' ? 'Connection Error' : 'Product Not Found'}
            </p>
            <p className="font-garamond text-sm italic mb-6" style={{ color: '#7A6A65' }}>
              {status === 'error'
                ? 'Check your connection and try again.'
                : 'This barcode isn\'t in our database yet.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={rescan} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: 'rgba(212,160,160,0.12)',
                border: '1px solid rgba(212,160,160,0.35)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: ROSE,
              }}>
                <RotateCcw size={13} strokeWidth={1.5} /> Try Again
              </button>
              <button onClick={onSearchInstead} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: SAGE, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#F2EDE8',
              }}>
                <Search size={13} strokeWidth={1.5} /> Search
              </button>
            </div>
          </div>
        )}

        {/* ── Result card ── */}
        {status === 'found' && food && !success && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(242,237,232,0.98)',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '20px 20px 48px',
            animation: 'resultUp 0.38s cubic-bezier(0.34,1.15,0.64,1) both',
          }}>
            {/* Food name + brand */}
            <p className="font-cinzel text-sm font-semibold mb-0.5" style={{ color: '#3B3330' }}>
              {food.food_name}
            </p>
            {food.brand && (
              <p className="font-garamond text-xs mb-3" style={{ color: '#7A6A65' }}>
                {food.brand} · per {food.serving_size}{food.serving_unit}
              </p>
            )}

            {/* Macro pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <MacroPill label="Cal"     value={cal}       color="#3B3330" bg="rgba(196,175,168,0.22)" />
              <MacroPill label="Protein" value={`${protein}g`} color={SAGE}    bg="rgba(143,165,140,0.15)" />
              <MacroPill label="Carbs"   value={`${carbs}g`}   color="#C9A84C" bg="rgba(201,168,76,0.13)"  />
              <MacroPill label="Fat"     value={`${fat}g`}     color={ROSE}    bg="rgba(212,160,160,0.15)" />
            </div>

            {/* Serving adjuster */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.6)', borderRadius: 12,
              border: '1px solid rgba(196,175,168,0.35)',
              padding: '8px 14px', marginBottom: 12,
            }}>
              <p className="font-cinzel text-[9px] tracking-widest uppercase" style={{ color: '#7A6A65' }}>
                Servings
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => setServing(s => Math.max(0.5, +(s - 0.5).toFixed(1)))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(196,175,168,0.5)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={13} color="#7A6A65" strokeWidth={2} />
                </button>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#3B3330', minWidth: 24, textAlign: 'center' }}>
                  {serving}
                </span>
                <button onClick={() => setServing(s => +(s + 0.5).toFixed(1))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(196,175,168,0.5)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={13} color="#7A6A65" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Meal type */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {MEAL_OPTIONS.map(opt => {
                const active = mealType === opt.id
                return (
                  <button key={opt.id} onClick={() => setMealType(opt.id)} style={{
                    flex: 1, padding: '6px 2px', borderRadius: 9,
                    border: `1px solid ${active ? SAGE : 'rgba(196,175,168,0.4)'}`,
                    background: active ? 'rgba(143,165,140,0.18)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Cinzel, serif', fontSize: 7,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: active ? SAGE : '#7A6A65',
                    transition: 'all 0.16s',
                  }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Log button */}
            <button onClick={handleLog} disabled={logging} style={{
              width: '100%', padding: '14px',
              background: SAGE, border: 'none', borderRadius: 14,
              cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 10,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#F2EDE8',
              opacity: logging ? 0.6 : 1,
              transition: 'opacity 0.18s',
            }}>
              {logging ? 'Logging…' : 'Log It'}
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {success && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(242,237,232,0.98)',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '40px 20px 60px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'resultUp 0.3s ease both',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(143,165,140,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Check size={24} color={SAGE} strokeWidth={2.5} />
            </div>
            <p className="font-garamond text-base italic" style={{ color: '#7A6A65' }}>
              Logged to Today
            </p>
          </div>
        )}

        {/* ── X close button — always visible, large touch target ── */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: `max(env(safe-area-inset-top, 0px), 44px)`,
            right: 16,
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 20,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <X size={22} color="#fff" strokeWidth={2.2} />
        </button>

        {/* ── Rescan button (when result shown) ── */}
        {status === 'found' && !success && (
          <button onClick={rescan} style={{
            position: 'absolute',
            top: `max(env(safe-area-inset-top, 0px), 44px)`,
            left: 16,
            padding: '10px 16px', borderRadius: 22,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.22)',
            cursor: 'pointer', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <RotateCcw size={13} strokeWidth={1.8} color="rgba(255,255,255,0.85)" />
            Rescan
          </button>
        )}
      </div>
    </>
  )
}
