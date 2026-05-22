import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const PHASE_COLORS = {
  follicular: '#8FA58C',
  ovulation: '#D4A0A0',
  luteal: '#C4AFA8',
  menstrual: '#D4A0A0',
}

// Athena curated templates — stored in code so they load instantly without RLS complications
const ATHENA_TEMPLATES = [
  {
    id: 'athena-follicular',
    title: 'Follicular Power Week',
    phase_name: 'follicular',
    is_athena: true,
    created_at: null,
    items: [
      { name: 'Spinach', category: 'Produce', quantity: 2, unit: 'bags' },
      { name: 'Broccoli', category: 'Produce', quantity: 1, unit: 'head' },
      { name: 'Blueberries', category: 'Produce', quantity: 1, unit: 'pint' },
      { name: 'Wild salmon', category: 'Proteins', quantity: 1, unit: 'lbs' },
      { name: 'Eggs', category: 'Proteins', quantity: 12, unit: 'each' },
      { name: 'Tempeh', category: 'Proteins', quantity: 1, unit: 'pack' },
      { name: 'Greek yogurt', category: 'Dairy', quantity: 2, unit: 'cups' },
      { name: 'Quinoa', category: 'Grains', quantity: 1, unit: 'cup dry' },
      { name: 'Brown rice', category: 'Grains', quantity: 1, unit: 'cup dry' },
      { name: 'Flaxseeds', category: 'Pantry', quantity: 1, unit: 'bag' },
      { name: 'Pumpkin seeds', category: 'Pantry', quantity: 1, unit: 'bag' },
      { name: 'Lemon', category: 'Produce', quantity: 4, unit: 'each' },
    ],
  },
  {
    id: 'athena-luteal',
    title: 'Luteal Comfort Foods',
    phase_name: 'luteal',
    is_athena: true,
    created_at: null,
    items: [
      { name: 'Sweet potato', category: 'Produce', quantity: 3, unit: 'each' },
      { name: 'Kale', category: 'Produce', quantity: 1, unit: 'bunch' },
      { name: 'Bananas', category: 'Produce', quantity: 1, unit: 'bunch' },
      { name: 'Dark chocolate 70%', category: 'Pantry', quantity: 2, unit: 'bars' },
      { name: 'Walnuts', category: 'Pantry', quantity: 1, unit: 'bag' },
      { name: 'Chickpeas', category: 'Pantry', quantity: 2, unit: 'cans' },
      { name: 'Lentils', category: 'Pantry', quantity: 1, unit: 'cup dry' },
      { name: 'Oats', category: 'Grains', quantity: 2, unit: 'cups' },
      { name: 'Chicken thighs', category: 'Proteins', quantity: 1.5, unit: 'lbs' },
      { name: 'Magnesium-rich almonds', category: 'Pantry', quantity: 1, unit: 'bag' },
      { name: 'Avocado', category: 'Produce', quantity: 3, unit: 'each' },
      { name: 'Ginger tea', category: 'Pantry', quantity: 1, unit: 'box' },
    ],
  },
  {
    id: 'athena-menstrual',
    title: 'Menstrual Restore List',
    phase_name: 'menstrual',
    is_athena: true,
    created_at: null,
    items: [
      { name: 'Spinach', category: 'Produce', quantity: 2, unit: 'bags' },
      { name: 'Beets', category: 'Produce', quantity: 3, unit: 'each' },
      { name: 'Red meat (grass-fed)', category: 'Proteins', quantity: 1, unit: 'lbs' },
      { name: 'Bone broth', category: 'Pantry', quantity: 2, unit: 'cartons' },
      { name: 'Lentil soup', category: 'Pantry', quantity: 2, unit: 'cans' },
      { name: 'Ginger', category: 'Produce', quantity: 1, unit: 'knob' },
      { name: 'Turmeric', category: 'Pantry', quantity: 1, unit: 'jar' },
      { name: 'Raspberry leaf tea', category: 'Pantry', quantity: 1, unit: 'box' },
      { name: 'Dark cherries', category: 'Produce', quantity: 1, unit: 'bag' },
      { name: 'Coconut milk', category: 'Pantry', quantity: 2, unit: 'cans' },
      { name: 'Vitamin C oranges', category: 'Produce', quantity: 4, unit: 'each' },
      { name: 'Heating pad-friendly oatmeal', category: 'Grains', quantity: 1, unit: 'bag' },
    ],
  },
]

function TemplateCard({ template, onPreview }) {
  const phaseColor = PHASE_COLORS[template.phase_name] ?? '#7A6A65'
  const count = template.items?.length ?? 0
  const date = template.created_at
    ? new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <button
      onClick={() => onPreview(template)}
      style={{
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,175,168,0.35)',
        borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
    >
      {template.is_athena && (
        <span style={{
          fontFamily: 'Helvetica Neue, sans-serif', fontSize: 8, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#8FA58C',
        }}>
          ✦ Athena curated
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic',
          color: '#3B3330', lineHeight: 1.3, flex: 1 }}>
          {template.title}
        </h4>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: 'Helvetica Neue, sans-serif', fontSize: 8, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10,
          background: `${phaseColor}18`, color: phaseColor,
        }}>
          {template.phase_name}
        </span>
        <span style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 11, color: '#7A6A65' }}>
          {count} items
        </span>
        {date && (
          <span style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 11, color: 'rgba(122,106,101,0.5)' }}>
            · {date}
          </span>
        )}
      </div>
    </button>
  )
}

function PreviewSheet({ template, onClose, onLoad }) {
  const phaseColor = PHASE_COLORS[template.phase_name] ?? '#7A6A65'
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(59,51,48,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 430, margin: '0 auto',
        background: '#F2EDE8', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '20px 20px 32px',
        maxHeight: '80svh', overflowY: 'auto',
        animation: 'sheetUp 0.28s ease',
      }}>
        <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(196,175,168,0.5)',
          margin: '0 auto 16px' }} />

        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '3px 10px', borderRadius: 12,
            background: `${phaseColor}18`, color: phaseColor,
          }}>
            {template.phase_name}
          </span>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic',
            color: '#3B3330', marginTop: 10, marginBottom: 4 }}>
            {template.title}
          </h3>
          <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, color: '#7A6A65' }}>
            {template.items?.length ?? 0} items
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          {(template.items ?? []).map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0', borderBottom: '1px solid rgba(196,175,168,0.18)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%',
                background: PHASE_COLORS[template.phase_name] ?? '#7A6A65', flexShrink: 0 }} />
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#3B3330', flex: 1 }}>
                {item.quantity}{item.unit ? ` ${item.unit}` : ''} {item.name}
              </p>
              <span style={{
                fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.08em',
                color: '#7A6A65',
              }}>
                {item.category}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onLoad(template)}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 22, background: '#8FA58C',
            border: 'none', color: '#F2EDE8', fontFamily: 'Cinzel, serif', fontSize: 10,
            letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 10,
          }}
        >
          Load to My List
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 22, background: 'none',
            border: '1px solid rgba(196,175,168,0.4)', color: '#7A6A65',
            fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function TemplatesTab({ phase, phaseLabel, currentItems, listId, onLoadTemplate }) {
  const { user } = useAuth()
  const [userTemplates, setUserTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('saved_list_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUserTemplates(data ?? [])
        setLoading(false)
      })
  }, [user?.id])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSaveTemplate() {
    if (!user || !saveName.trim() || currentItems.length === 0) return
    setSaving(true)
    const { error } = await supabase.from('saved_list_templates').insert({
      user_id: user.id,
      title: saveName.trim(),
      phase_name: phase,
      items: currentItems.map(({ name, category, quantity, unit }) => ({ name, category, quantity, unit })),
    })
    if (!error) {
      const { data } = await supabase
        .from('saved_list_templates').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setUserTemplates(data ?? [])
      setSaveName('')
      setShowSaveForm(false)
      showToast('Template saved')
    }
    setSaving(false)
  }

  async function handleLoadTemplate(template) {
    setPreview(null)
    await onLoadTemplate(template)
    showToast(`"${template.title}" loaded to your list`)
  }

  const allTemplates = [...ATHENA_TEMPLATES, ...userTemplates]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 'max(env(safe-area-inset-top,0px), 56px)', left: '50%',
          transform: 'translateX(-50%)', zIndex: 70,
          background: 'rgba(59,51,48,0.88)', backdropFilter: 'blur(12px)',
          padding: '10px 20px', borderRadius: 22,
          fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#F2EDE8',
          animation: 'priceFadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes priceFadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

      {/* Save current list */}
      {currentItems.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 22,
                background: 'rgba(196,175,168,0.18)', border: '1px solid rgba(196,175,168,0.4)',
                fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#7A6A65', cursor: 'pointer',
              }}
            >
              + Save Current List as Template
            </button>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(196,175,168,0.35)', borderRadius: 16, padding: 16,
            }}>
              <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 11, color: '#7A6A65',
                marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Name your template
              </p>
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
                placeholder="e.g. My Luteal Comfort List"
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 22,
                  border: '1.5px solid rgba(232,196,188,0.5)',
                  background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 15, color: '#3B3330', outline: 'none', marginBottom: 10,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveTemplate} disabled={!saveName.trim() || saving}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 22, background: '#8FA58C',
                    border: 'none', color: '#F2EDE8', fontFamily: 'Cinzel, serif', fontSize: 9,
                    letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>
                  {saving ? '…' : 'Save'}
                </button>
                <button onClick={() => { setShowSaveForm(false); setSaveName('') }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 22, background: 'none',
                    border: '1px solid rgba(196,175,168,0.4)', color: '#7A6A65',
                    fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section label */}
      <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#7A6A65', marginBottom: 12 }}>
        Athena Templates
      </p>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {ATHENA_TEMPLATES.map(t => (
          <TemplateCard key={t.id} template={t} onPreview={setPreview} />
        ))}
      </div>

      {userTemplates.length > 0 && (
        <>
          <p style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#7A6A65', marginBottom: 12, marginTop: 8 }}>
            My Saved Lists
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {userTemplates.map(t => (
              <TemplateCard key={t.id} template={{ ...t, items: t.items ?? [] }} onPreview={setPreview} />
            ))}
          </div>
        </>
      )}

      {!loading && allTemplates.length === ATHENA_TEMPLATES.length && (
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontStyle: 'italic',
          color: 'rgba(122,106,101,0.6)', textAlign: 'center', marginTop: 16 }}>
          Save your first list to build your own template collection.
        </p>
      )}

      {preview && (
        <PreviewSheet
          template={preview}
          onClose={() => setPreview(null)}
          onLoad={handleLoadTemplate}
        />
      )}
    </div>
  )
}
