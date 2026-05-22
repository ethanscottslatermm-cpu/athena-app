import { useState, useRef, useCallback } from 'react'

const CATEGORIES = ['Produce', 'Proteins', 'Dairy', 'Grains', 'Pantry', 'Other']

const CATEGORY_COLORS = {
  Produce: '#8FA58C',
  Proteins: '#D4A0A0',
  Dairy: '#C4AFA8',
  Grains: '#C9B99B',
  Pantry: '#9B97C4',
  Other: '#7A6A65',
}

function PriceShimmer() {
  return (
    <span style={{
      display: 'inline-block', width: 44, height: 14, borderRadius: 7,
      background: 'linear-gradient(90deg, rgba(196,175,168,0.18) 0%, rgba(196,175,168,0.38) 50%, rgba(196,175,168,0.18) 100%)',
      backgroundSize: '200% 100%',
      animation: 'priceShimmer 1.5s ease-in-out infinite',
      verticalAlign: 'middle',
    }} />
  )
}

function SwipeItem({ item, onDelete, onCheck }) {
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  function handleTouchMove(e) {
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setOffset(Math.max(dx, -76))
  }

  function handleTouchEnd() {
    setSwiping(false)
    setOffset(offset < -50 ? -76 : 0)
  }

  const krogerWins = item.kroger_price != null && item.walmart_price != null && item.kroger_price <= item.walmart_price
  const walmartWins = item.kroger_price != null && item.walmart_price != null && item.walmart_price < item.kroger_price
  const bothLoaded = item.kroger_price != null && item.walmart_price != null

  return (
    <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 1 }}>
      {/* Delete reveal */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 76,
        background: 'rgba(212,120,120,0.85)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: '0 10px 10px 0',
      }}>
        <button
          onClick={() => onDelete(item.id)}
          style={{ color: '#fff', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em',
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px' }}
        >
          REMOVE
        </button>
      </div>

      {/* Item row */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.22s ease',
          background: item.is_checked ? 'rgba(242,237,232,0.5)' : 'rgba(255,255,255,0.52)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        {/* Checkbox */}
        <button
          onClick={() => onCheck(item.id, !item.is_checked)}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            border: `1.5px solid ${item.is_checked ? '#8FA58C' : 'rgba(122,106,101,0.35)'}`,
            background: item.is_checked ? '#8FA58C' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {item.is_checked && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1.5" stroke="#F2EDE8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Name + qty */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#3B3330',
            textDecoration: item.is_checked ? 'line-through' : 'none',
            opacity: item.is_checked ? 0.45 : 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            lineHeight: 1.2, marginBottom: 2,
          }}>
            {item.name}
          </p>
          <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 11, color: '#7A6A65' }}>
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
          </p>
        </div>

        {/* Prices */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          {/* Kroger price */}
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.08em',
              color: '#7A6A65', textTransform: 'uppercase', marginBottom: 2,
            }}>Kroger</p>
            {item.kroger_price == null ? (
              <PriceShimmer />
            ) : (
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontWeight: 600,
                color: '#8FA58C',
                borderBottom: bothLoaded && krogerWins ? '1.5px solid #8FA58C' : 'none',
                paddingBottom: 1,
              }}>
                ${item.kroger_price.toFixed(2)}
                {bothLoaded && krogerWins && (
                  <span style={{ fontSize: 8, marginLeft: 3, color: '#8FA58C', letterSpacing: '0.05em' }}>★</span>
                )}
              </p>
            )}
          </div>

          {/* Walmart price */}
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.08em',
              color: '#7A6A65', textTransform: 'uppercase', marginBottom: 2,
            }}>Walmart</p>
            {item.walmart_price == null ? (
              <PriceShimmer />
            ) : (
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontWeight: 600,
                color: '#C4AFA8',
                borderBottom: bothLoaded && walmartWins ? '1.5px solid #8FA58C' : 'none',
                paddingBottom: 1,
              }}>
                ${item.walmart_price.toFixed(2)}
                {bothLoaded && walmartWins && (
                  <span style={{ fontSize: 8, marginLeft: 3, color: '#8FA58C', letterSpacing: '0.05em' }}>★</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CategorySection({ category, items, onCheck, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const checked = items.filter(i => i.is_checked)
  const unchecked = items.filter(i => !i.is_checked)
  const color = CATEGORY_COLORS[category] ?? '#7A6A65'

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 8px',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#7A6A65', flex: 1, textAlign: 'left' }}>
          {category}
        </span>
        <span style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 10, color: 'rgba(122,106,101,0.55)' }}>
          {unchecked.length}/{items.length}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4l4 4 4-4" stroke="#7A6A65" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>

      {!collapsed && (
        <div>
          {unchecked.map(item => (
            <SwipeItem key={item.id} item={item} onCheck={onCheck} onDelete={onDelete} />
          ))}
          {checked.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {checked.map(item => (
                <SwipeItem key={item.id} item={item} onCheck={onCheck} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyListTab({ items, list, onCheck, onDelete, onBuildList, onInstacart, instacartLoading }) {
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  const totalKroger = items.reduce((s, i) => s + (i.kroger_price ?? 0), 0)
  const totalWalmart = items.reduce((s, i) => s + (i.walmart_price ?? 0), 0)
  const pricesLoaded = items.length > 0 && items.some(i => i.kroger_price != null || i.walmart_price != null)
  const savings = Math.abs(totalKroger - totalWalmart)
  const cheaperStore = totalKroger <= totalWalmart ? 'Kroger' : 'Walmart'

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 280, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', marginBottom: 20,
          background: 'rgba(143,165,140,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8FA58C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic',
          color: '#3B3330', marginBottom: 8 }}>Your list is empty</h3>
        <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13, color: '#7A6A65',
          marginBottom: 24, lineHeight: 1.6 }}>
          Let Athena build a hormone-supportive shopping list tailored to your current phase.
        </p>
        <button
          onClick={onBuildList}
          style={{
            padding: '12px 28px', borderRadius: 24, background: '#8FA58C', border: 'none',
            color: '#F2EDE8', fontFamily: 'Cinzel, serif', fontSize: 10,
            letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 12,
          }}
        >
          Build My Phase List
        </button>
        <button
          onClick={() => onBuildList('manual')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, color: '#7A6A65',
            textDecoration: 'underline', padding: 4,
          }}
        >
          Start from scratch
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes priceShimmer {
          0%,100% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
        }
        @keyframes priceFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ paddingBottom: 8 }}>
        {Object.entries(grouped).map(([cat, catItems]) => (
          <CategorySection
            key={cat}
            category={cat}
            items={catItems}
            onCheck={onCheck}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Footer cost summary */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', marginTop: 8, marginBottom: 8,
        background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,175,168,0.35)', padding: 16,
      }}>
        <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#7A6A65', marginBottom: 12 }}>
          Estimated Total
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: pricesLoaded ? 10 : 0 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 10,
            background: 'rgba(143,165,140,0.08)', border: '1px solid rgba(143,165,140,0.2)' }}>
            <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, color: '#7A6A65',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Kroger</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600,
              color: '#8FA58C' }}>
              {pricesLoaded ? `$${totalKroger.toFixed(2)}` : '—'}
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 10,
            background: 'rgba(196,175,168,0.08)', border: '1px solid rgba(196,175,168,0.2)' }}>
            <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, color: '#7A6A65',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Walmart</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600,
              color: '#C4AFA8' }}>
              {pricesLoaded ? `$${totalWalmart.toFixed(2)}` : '—'}
            </p>
          </div>
        </div>

        {pricesLoaded && savings > 0.01 && (
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontStyle: 'italic',
            color: '#8FA58C', textAlign: 'center', marginBottom: 12 }}>
            Save ${savings.toFixed(2)} at {cheaperStore} today
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => {
              const q = items.slice(0, 8).map(i => encodeURIComponent(i.name)).join('+')
              window.open(`https://www.kroger.com/search?query=${q}`, '_blank')
            }}
            style={{
              flex: 1, padding: '11px 8px', borderRadius: 22,
              background: 'rgba(143,165,140,0.15)', border: '1px solid rgba(143,165,140,0.4)',
              fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#8FA58C', cursor: 'pointer',
            }}
          >
            Send to Kroger
          </button>
          <button
            onClick={onInstacart}
            disabled={instacartLoading}
            style={{
              flex: 1, padding: '11px 8px', borderRadius: 22,
              background: instacartLoading ? 'rgba(196,175,168,0.15)' : 'rgba(59,51,48,0.85)',
              border: 'none',
              fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: instacartLoading ? '#7A6A65' : '#F2EDE8',
              cursor: instacartLoading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {instacartLoading ? (
              <>
                <span style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '1.5px solid rgba(122,106,101,0.4)',
                  borderTopColor: '#7A6A65',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Building…
              </>
            ) : 'Send to Instacart'}
          </button>
        </div>
      </div>
    </>
  )
}
