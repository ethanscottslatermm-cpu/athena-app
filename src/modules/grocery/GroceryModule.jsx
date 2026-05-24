import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { usePhase }   from '../../hooks/usePhase'
import { supabase }   from '../../lib/supabase'
import MyListTab      from './MyListTab'
import BuildTab       from './BuildTab'
import TemplatesTab   from './TemplatesTab'
import HintBubble     from '../../components/HintBubble'

// ── Phase content ─────────────────────────────────────────────────────────────
const PHASE_GROCERY = {
  follicular: {
    headline: 'Feed Your Rise',
    focus:    'Iron-rich foods, complex carbs & anti-inflammatory greens',
  },
  ovulation: {
    headline: 'Fuel Your Peak',
    focus:    'Antioxidants, zinc-rich proteins & vibrant whole foods',
  },
  luteal: {
    headline: 'Nourish the Shift',
    focus:    'Magnesium, complex carbs & warming comfort foods',
  },
  menstrual: {
    headline: 'Restore & Replenish',
    focus:    'Iron-rich foods, warming broths & gentle nourishment',
  },
}

const GROCERY_HINTS = {
  'my-list': [
    'Swipe left on any item to remove it from your list.',
    'Tap the checkbox to mark items as you shop — checked items collect at the bottom of each section.',
    'The ★ mark shows which store has the best price for each item.',
  ],
  build: [
    "Athena's AI builds a 20-item list tuned to your current hormonal phase.",
    'Tap × on any suggested item to remove it before saving — build the list that works for you.',
    'Try typing naturally: "a couple of cans of black beans" and Athena will parse it.',
  ],
  templates: [
    'Load an Athena curated template to start with a phase-aligned baseline.',
    'Save your favourite lists as templates — you can reload them anytime in one tap.',
  ],
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function GroceryRing({ checked, total }) {
  const r = 30, cx = 36, cy = 36, C = 2 * Math.PI * r
  const progress = total > 0 ? checked / total : 0
  const dash = C * Math.min(progress, 1)

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={progress >= 1 ? '#8FA58C' : 'rgba(255,255,255,0.75)'}
        strokeWidth="4.5"
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={C / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="rgba(255,255,255,0.95)"
        fontSize="17" fontFamily="Cinzel, serif">
        {total > 0 ? checked : '—'}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.55)"
        fontSize="8" fontFamily="Cormorant Garamond, serif" letterSpacing="1.2">
        {total > 0 ? `of ${total}` : 'empty'}
      </text>
    </svg>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'my-list',   label: 'My List'   },
  { id: 'build',     label: 'Build'     },
  { id: 'templates', label: 'Templates' },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function GroceryModule() {
  const { user }  = useAuth()
  const phaseData = usePhase()
  const phase     = phaseData?.phase ?? 'follicular'
  const phaseLabel = phaseData?.label ?? 'Follicular'

  const [activeTab,  setActiveTab]  = useState('my-list')
  const [visited,    setVisited]    = useState({ 'my-list': true })
  const [list,       setList]       = useState(null)
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [autoGen,    setAutoGen]    = useState(false)
  const [instacartLoading, setInstacartLoading] = useState(false)
  const [instacartToast,   setInstacartToast]   = useState(false)
  const firstVisitRef = useRef(false)

  // ── Check first visit ─────────────────────────────────────────────────────
  useEffect(() => {
    const seen = localStorage.getItem('athena_grocery_visited')
    if (!seen) {
      localStorage.setItem('athena_grocery_visited', 'true')
      firstVisitRef.current = true
    }
  }, [])

  // ── Load current list + items ─────────────────────────────────────────────
  const refreshList = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: lists } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_template', false)
      .order('created_at', { ascending: false })
      .limit(1)

    const currentList = lists?.[0] ?? null
    setList(currentList)

    if (currentList) {
      const { data: itemData } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('list_id', currentList.id)
        .order('created_at', { ascending: true })
      setItems(itemData ?? [])
    } else {
      setItems([])
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => { refreshList() }, [refreshList])

  // ── Auto-generate on first visit when list empty ──────────────────────────
  useEffect(() => {
    if (!loading && firstVisitRef.current && !list) {
      setAutoGen(true)
      switchTab('build')
    }
  }, [loading, list])

  // ── Progressive pricing fetch ─────────────────────────────────────────────
  const fetchPricing = useCallback(async (newItems) => {
    const unpricedItems = newItems.filter(
      i => i.kroger_price == null || i.walmart_price == null
    )
    if (unpricedItems.length === 0) return

    await Promise.allSettled(
      unpricedItems.map(async (item) => {
        const [krogerRes, walmartRes] = await Promise.allSettled([
          item.kroger_price == null
            ? fetch('/.netlify/functions/kroger-pricing', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName: item.name }),
              }).then(r => r.json())
            : Promise.resolve(null),
          item.walmart_price == null
            ? fetch('/.netlify/functions/walmart-pricing', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName: item.name }),
              }).then(r => r.json())
            : Promise.resolve(null),
        ])

        const updates = {}
        const kroger  = krogerRes.status  === 'fulfilled' ? krogerRes.value  : null
        const walmart  = walmartRes.status === 'fulfilled' ? walmartRes.value : null

        if (kroger?.found  && kroger.price  != null) { updates.kroger_price  = kroger.price;  updates.kroger_product_id  = kroger.productId  }
        if (walmart?.found && walmart.price != null) { updates.walmart_price = walmart.price; updates.walmart_product_id = walmart.productId }

        if (Object.keys(updates).length > 0) {
          await supabase.from('grocery_items').update(updates).eq('id', item.id)
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...updates } : i))
        }
      })
    )
  }, [])

  useEffect(() => {
    if (items.length > 0) fetchPricing(items)
  }, [items.length])

  // ── Helpers ───────────────────────────────────────────────────────────────
  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  async function handleCheck(itemId, checked) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: checked } : i))
    await supabase.from('grocery_items').update({ is_checked: checked }).eq('id', itemId)
  }

  async function handleDelete(itemId) {
    setItems(prev => prev.filter(i => i.id !== itemId))
    await supabase.from('grocery_items').delete().eq('id', itemId)
  }

  async function handleItemsAdded(targetListId) {
    await refreshList()
    switchTab('my-list')
  }

  async function handleLoadTemplate(template) {
    if (!user) return
    // Delete existing items & list, then create fresh from template
    if (list) {
      await supabase.from('grocery_items').delete().eq('list_id', list.id)
      await supabase.from('grocery_lists').delete().eq('id', list.id)
    }
    const { data: newList } = await supabase
      .from('grocery_lists')
      .insert({ user_id: user.id, title: template.title, phase_name: template.phase_name, is_template: false })
      .select().single()

    if (newList && template.items?.length) {
      await supabase.from('grocery_items').insert(
        template.items.map(item => ({
          list_id: newList.id, user_id: user.id,
          name: item.name, category: item.category ?? 'Other',
          quantity: item.quantity ?? 1, unit: item.unit ?? '',
          is_checked: false,
        }))
      )
    }
    await refreshList()
    switchTab('my-list')
  }

  async function handleInstacart() {
    if (items.length === 0) return
    setInstacartLoading(true)
    try {
      const res = await fetch('/.netlify/functions/instacart-cart', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit })),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        throw new Error('No URL returned')
      }
    } catch {
      window.open('https://www.instacart.com', '_blank')
      setInstacartToast(true)
      setTimeout(() => setInstacartToast(false), 4000)
    } finally {
      setInstacartLoading(false)
    }
  }

  const checkedCount = items.filter(i => i.is_checked).length
  const pg = PHASE_GROCERY[phase] ?? PHASE_GROCERY.follicular

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F5E4E1] overflow-hidden">
      <style>{`
        .gr-pane { scrollbar-width: none; }
        .gr-pane::-webkit-scrollbar { display: none; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Instacart fallback toast ─────────────────────────────── */}
      {instacartToast && (
        <div style={{
          position: 'fixed', top: 'max(env(safe-area-inset-top,0px), 56px)', left: '50%',
          transform: 'translateX(-50%)', zIndex: 70, whiteSpace: 'nowrap',
          background: 'rgba(59,51,48,0.88)', backdropFilter: 'blur(12px)',
          padding: '10px 18px', borderRadius: 22,
          fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: '#F2EDE8',
          animation: 'toastIn 0.2s ease',
        }}>
          Instacart link unavailable — opening Instacart for you
        </div>
      )}

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: '12px 16px 0' }}>
        <div style={{
          borderRadius: 20, overflow: 'hidden', position: 'relative',
          minHeight: 148,
          border: '1px solid rgba(255,255,255,0.18)',
        }}>
          {/* Background photo */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/images/dashboard/nourish.png)',
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          {/* Gradient overlay — bottom-heavy for text legibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(59,51,48,0.72) 0%, rgba(59,51,48,0.55) 55%, rgba(59,51,48,0.28) 100%)',
          }} />
          {/* Subtle glass sheen */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 60%)',
          }} />

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 1, padding: '18px 18px 16px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Phase pill */}
              <span style={{
                fontFamily: 'Helvetica Neue, sans-serif', fontSize: 8, letterSpacing: '0.2em',
                textTransform: 'uppercase', padding: '3px 10px', borderRadius: 12,
                background: 'rgba(143,165,140,0.35)', color: '#D4F0D4',
                display: 'inline-block', marginBottom: 10,
              }}>
                {phaseLabel}
              </span>

              {/* Headline */}
              <h2 style={{
                fontFamily: 'EB Garamond, Cormorant Garamond, serif', fontSize: 26,
                fontStyle: 'italic', fontWeight: 500,
                color: 'rgba(255,255,255,0.97)', lineHeight: 1.2,
                marginBottom: 6,
              }}>
                {pg.headline}
              </h2>

              {/* Focus text */}
              <p style={{
                fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12,
                color: 'rgba(255,255,255,0.65)', lineHeight: 1.45, marginBottom: 14,
              }}>
                {pg.focus}
              </p>

              {/* CTA */}
              <button
                onClick={() => switchTab('build')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12,
                  color: '#A8D5A2', padding: 0, letterSpacing: '0.02em',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Build My Phase List
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="#A8D5A2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Progress ring */}
            <div style={{ flexShrink: 0 }}>
              <GroceryRing checked={checkedCount} total={items.length} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Pill switcher ────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: '12px 16px 0' }}>
        <div style={{
          display: 'flex', gap: 4, padding: '4px',
          background: 'rgba(196,175,168,0.2)', borderRadius: 22,
        }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  flex: 1, padding: '7px 2px', borderRadius: 18,
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Cinzel, serif', fontSize: 8,
                  letterSpacing: '0.13em', textTransform: 'uppercase',
                  background: active ? '#8FA58C' : 'transparent',
                  color: active ? '#F2EDE8' : '#7A6A65',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab panes ────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            className="gr-pane pb-nav"
            style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto',
              visibility: activeTab === tab.id ? 'visible' : 'hidden',
              pointerEvents: activeTab === tab.id ? 'auto' : 'none',
              paddingTop: 12, paddingLeft: 16, paddingRight: 16,
            }}
          >
            {visited[tab.id] && (
              <>
                {tab.id === 'my-list' && (
                  <MyListTab
                    items={items}
                    list={list}
                    onCheck={handleCheck}
                    onDelete={handleDelete}
                    onBuildList={(mode) => {
                      if (mode === 'manual') {
                        switchTab('build')
                      } else {
                        switchTab('build')
                      }
                    }}
                    onInstacart={handleInstacart}
                    instacartLoading={instacartLoading}
                  />
                )}
                {tab.id === 'build' && (
                  <BuildTab
                    key={`build-${phase}`}
                    phase={phase}
                    phaseLabel={phaseLabel}
                    listId={list?.id ?? null}
                    onItemsAdded={handleItemsAdded}
                    autoGenerate={autoGen}
                    onAutoGenerateDone={() => setAutoGen(false)}
                  />
                )}
                {tab.id === 'templates' && (
                  <TemplatesTab
                    phase={phase}
                    phaseLabel={phaseLabel}
                    currentItems={items}
                    listId={list?.id ?? null}
                    onLoadTemplate={handleLoadTemplate}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <HintBubble hintKey={`grocery-${activeTab}`} hints={GROCERY_HINTS[activeTab] ?? []} />
    </div>
  )
}
