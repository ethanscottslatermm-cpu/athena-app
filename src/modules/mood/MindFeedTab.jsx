import { useState, useEffect, useRef } from 'react'
import { Bookmark } from 'lucide-react'
import { usePhase } from '../../hooks/usePhase'

// ── Breathwork animation ──────────────────────────────────────────────────────

function BreathworkWidget() {
  const [bPhase, setBPhase] = useState('rest')
  const timerRef = useRef(null)

  const SEQUENCE = ['inhale', 'hold-in', 'exhale', 'hold-out']
  const DURATION = 4000

  function start() { setBPhase('inhale') }

  function stop() {
    clearTimeout(timerRef.current)
    setBPhase('rest')
  }

  useEffect(() => {
    if (bPhase === 'rest') return
    timerRef.current = setTimeout(() => {
      const idx  = SEQUENCE.indexOf(bPhase)
      setBPhase(SEQUENCE[(idx + 1) % 4])
    }, DURATION)
    return () => clearTimeout(timerRef.current)
  }, [bPhase])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const expanded = bPhase === 'inhale' || bPhase === 'hold-in'
  const animating = bPhase === 'inhale' || bPhase === 'exhale'
  const scale = bPhase === 'rest' ? 0.65 : expanded ? 1.05 : 0.5

  const LABELS = { rest: '', 'inhale': 'Inhale', 'hold-in': 'Hold', 'exhale': 'Exhale', 'hold-out': 'Hold' }
  const active = bPhase !== 'rest'

  return (
    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <div
        style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
          background: 'rgba(143,165,140,0.22)',
          border: '2px solid rgba(143,165,140,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${scale})`,
          transition: animating ? `transform ${DURATION}ms ease-in-out` : 'transform 0.3s ease',
        }}
      >
        <span className="font-garamond text-xs italic" style={{ color: '#8FA58C' }}>
          {LABELS[bPhase]}
        </span>
      </div>
      <p className="font-garamond text-[11px] mb-2" style={{ color: '#7A6A65' }}>
        {active ? '4 counts each · box breathing' : 'Inhale · Hold · Exhale · Hold · 4 counts each'}
      </p>
      <button
        onClick={active ? stop : start}
        className="font-cinzel text-[8px] tracking-[0.2em] uppercase"
        style={{ color: active ? '#D4A0A0' : '#8FA58C' }}
      >
        {active ? 'stop' : 'begin'}
      </button>
    </div>
  )
}

// ── Feed card ─────────────────────────────────────────────────────────────────

const CARD_SURFACE = {
  reflection:      { background: '#F2EDE8', borderLeft: '3px solid rgba(143,165,140,0.7)', border: '1px solid rgba(196,175,168,0.3)' },
  phase_education: { background: 'rgba(143,165,140,0.16)', border: '1px solid rgba(143,165,140,0.32)' },
  micro_tip:       { background: 'rgba(196,175,168,0.22)', border: '1px solid rgba(196,175,168,0.4)' },
  affirmation:     { background: 'transparent', border: '1px solid rgba(196,175,168,0.28)' },
  breathwork:      { background: '#F2EDE8', border: '1px solid rgba(143,165,140,0.3)' },
}

function FeedCard({ card, onBookmark, bookmarked, animDelay }) {
  const surface = CARD_SURFACE[card.type] || CARD_SURFACE.reflection
  const isAffirmation  = card.type === 'affirmation'
  const isBreathwork   = card.type === 'breathwork'
  const isMicroTip     = card.type === 'micro_tip'
  const isReflection   = card.type === 'reflection'

  return (
    <div
      style={{
        ...surface,
        borderRadius: 16, padding: '16px 16px 14px',
        marginBottom: 10, position: 'relative',
        animation: `feedIn 0.4s ease ${animDelay}ms both`,
      }}
    >
      {/* Bookmark */}
      <button
        onClick={() => onBookmark(card)}
        style={{ position: 'absolute', top: 12, right: 12, color: bookmarked ? '#C9A96E' : '#7A6A65' }}
      >
        <Bookmark size={14} strokeWidth={1.5} fill={bookmarked ? '#C9A96E' : 'none'} />
      </button>

      {/* Tag */}
      <p className="font-cinzel text-[7px] tracking-[0.3em] uppercase mb-2" style={{ color: '#7A6A65' }}>
        {card.tag}
      </p>

      {isAffirmation ? (
        <p
          className="font-garamond text-lg italic leading-relaxed text-center"
          style={{ color: '#C9A96E', padding: '4px 28px 0' }}
        >
          {card.body}
        </p>
      ) : isBreathwork ? (
        <>
          <p className="font-cinzel text-sm font-semibold mb-1.5" style={{ color: '#3B3330' }}>{card.title}</p>
          <p className="font-garamond text-sm leading-relaxed mb-4" style={{ color: '#7A6A65' }}>{card.body}</p>
          <BreathworkWidget />
        </>
      ) : (
        <>
          <p
            className={`font-cinzel text-sm mb-2 ${isMicroTip ? 'font-semibold' : ''}`}
            style={{ color: '#3B3330', paddingRight: 20 }}
          >
            {card.title}
          </p>
          <p
            className={`font-garamond text-sm leading-relaxed ${isReflection ? 'italic' : ''}`}
            style={{ color: '#3B3330' }}
          >
            {card.body}
          </p>
        </>
      )}
    </div>
  )
}

// ── Fallback content when API fails ──────────────────────────────────────────

const FALLBACK = [
  {
    type: 'reflection', tag: 'Reflection', title: 'A moment to arrive',
    body: 'You are here, and that is enough. Take one slow breath and let your shoulders soften.',
  },
  {
    type: 'phase_education', tag: 'Your Body', title: 'Your cycle is speaking',
    body: 'Every phase carries its own intelligence. Your hormones are not working against you — they are guiding you.',
  },
  {
    type: 'micro_tip', tag: 'Wellness', title: 'Micro-nourish',
    body: 'Drink a glass of water slowly, with intention. Small acts of care matter.',
  },
  {
    type: 'affirmation', tag: 'Affirmation', title: '',
    body: 'You are allowed to need rest. You are allowed to take up space.',
  },
  {
    type: 'breathwork', tag: 'Breathe', title: 'Box Breathing',
    body: 'Four counts in, four counts hold, four counts out, four counts hold. Let your nervous system settle.',
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MindFeedTab({ todayEmotions }) {
  const { phase, label: phaseLabel, dayOfCycle } = usePhase()

  const [cards, setCards]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [savedCards, setSavedCards] = useState([])

  useEffect(() => {
    try {
      setSavedCards(JSON.parse(localStorage.getItem('athena_feed_saved') || '[]'))
    } catch {}
  }, [])

  useEffect(() => {
    if (phase) loadFeed()
  }, [phase])

  async function loadFeed() {
    setLoading(true)
    setCards([])
    try {
      const r = await fetch('/.netlify/functions/ai-mind-feed', {
        method: 'POST',
        body: JSON.stringify({
          phase, label: phaseLabel,
          dayOfCycle: dayOfCycle || 1,
          emotions: todayEmotions || [],
        }),
      })
      const d = await r.json()
      setCards(Array.isArray(d.cards) && d.cards.length ? d.cards : FALLBACK)
    } catch {
      setCards(FALLBACK)
    }
    setLoading(false)
  }

  function cardKey(card) { return `${card.type}-${card.title}-${card.body?.slice(0, 20)}` }

  function toggleBookmark(card) {
    setSavedCards(prev => {
      const k = cardKey(card)
      const exists = prev.some(c => cardKey(c) === k)
      const updated = exists ? prev.filter(c => cardKey(c) !== k) : [...prev, card]
      try { localStorage.setItem('athena_feed_saved', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const isBookmarked = card => savedCards.some(c => cardKey(c) === cardKey(card))

  return (
    <>
      <style>{`
        @keyframes feedIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes feedPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.4)', animation: 'feedPulse 1.6s ease-in-out infinite' }}>
            Curating your feed…
          </p>
        </div>
      ) : (
        <>
          {cards.map((card, i) => (
            <FeedCard
              key={cardKey(card) + i}
              card={card}
              animDelay={i * 80}
              onBookmark={toggleBookmark}
              bookmarked={isBookmarked(card)}
            />
          ))}

          {cards.length > 0 && (
            <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
              <button
                onClick={loadFeed}
                className="font-garamond text-sm"
                style={{ color: '#7A6A65', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Refresh Feed
              </button>
            </div>
          )}
        </>
      )}

      {/* Saved reads */}
      {savedCards.length > 0 && (
        <div className="mt-4 mb-4">
          <p className="font-cinzel text-[9px] uppercase mb-4" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
            Saved Reads
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedCards.map((card, i) => (
              <div
                key={i}
                style={{
                  padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(196,175,168,0.15)',
                  border: '1px solid rgba(196,175,168,0.28)',
                }}
              >
                <p className="font-cinzel text-[7px] tracking-[0.25em] uppercase mb-1" style={{ color: '#7A6A65' }}>
                  {card.tag}
                </p>
                <p className="font-garamond text-sm" style={{ color: '#3B3330' }}>
                  {card.title || card.body?.slice(0, 60)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
