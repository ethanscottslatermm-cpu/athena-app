import { useState, useEffect } from 'react'
import { useAuth }   from '../hooks/useAuth'
import { supabase }  from '../lib/supabase'

const gold      = '#C9A86C'
const mutedText = 'rgba(242,237,232,0.45)'
const linen     = '#F2EDE8'
const fontSerif = "'Cormorant Garamond', serif"
const fontSans  = "'Tenor Sans', sans-serif"

export default function LogWorkoutModal({
  isOpen,
  onClose,
  muscleId            = null,
  muscleName          = '',
  prefillExerciseName = '',
}) {
  const { user } = useAuth()

  const [exerciseName, setExerciseName] = useState('')
  const [sets,         setSets]         = useState('')
  const [reps,         setReps]         = useState('')
  const [weightKg,     setWeightKg]     = useState('')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)

  // Sync prefill when a video title is passed in
  useEffect(() => {
    setExerciseName(prefillExerciseName)
  }, [prefillExerciseName])

  // Reset saved state each time the modal opens
  useEffect(() => {
    if (isOpen) setSaved(false)
  }, [isOpen])

  const reset = () => {
    setExerciseName('')
    setSets('')
    setReps('')
    setWeightKg('')
  }

  const handleSave = async () => {
    if (!user || !exerciseName.trim() || saving) return
    setSaving(true)

    await supabase.from('muscle_workouts').insert({
      user_id:       user.id,
      muscle_id:     muscleId ?? null,
      exercise_name: exerciseName.trim(),
      sets:          sets    ? parseInt(sets,    10)  : null,
      reps:          reps    ? parseInt(reps,    10)  : null,
      weight_kg:     weightKg ? parseFloat(weightKg) : null,
      logged_at:     new Date().toISOString().slice(0, 10),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      onClose()
      reset()
      setSaved(false)
    }, 800)
  }

  if (!isOpen) return null

  const inputStyle = {
    width:        '100%',
    background:   'rgba(255,255,255,0.06)',
    border:       '1px solid rgba(201,168,108,0.2)',
    borderRadius: 10,
    color:        linen,
    fontFamily:   fontSerif,
    fontSize:     15,
    padding:      '10px 12px',
    outline:      'none',
    boxSizing:    'border-box',
    WebkitAppearance: 'none',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:             'fixed',
        inset:                0,
        zIndex:               300,
        background:           'rgba(20,10,24,0.7)',
        backdropFilter:       'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display:              'flex',
        alignItems:           'flex-end',
        justifyContent:       'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:                '100%',
          maxWidth:             480,
          background:           'rgba(20,8,28,0.97)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius:         '20px 20px 0 0',
          border:               '1px solid rgba(201,168,108,0.18)',
          borderBottom:         'none',
          padding:              '0 1.25rem 2.5rem',
        }}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(201,168,108,0.2)', margin: '12px auto 1.25rem' }} />

        {/* Title */}
        <p style={{ fontFamily: fontSerif, fontSize: 21, color: linen, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          Log Workout
        </p>
        {muscleName && (
          <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, margin: '0 0 1.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {muscleName}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            style={inputStyle}
            placeholder="Exercise name"
            value={exerciseName}
            onChange={e => setExerciseName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="number"
              inputMode="numeric"
              placeholder="Sets"
              min="1"
              value={sets}
              onChange={e => setSets(e.target.value)}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="number"
              inputMode="numeric"
              placeholder="Reps"
              min="1"
              value={reps}
              onChange={e => setReps(e.target.value)}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="number"
              inputMode="decimal"
              placeholder="kg"
              min="0"
              step="0.5"
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!exerciseName.trim() || saving}
          style={{
            marginTop:     '1.25rem',
            width:         '100%',
            padding:       '13px',
            background:    saved
              ? 'rgba(143,175,138,0.2)'
              : 'linear-gradient(135deg, #C9A86C, #A07B4C)',
            borderRadius:  12,
            color:         saved ? '#8FAF8A' : '#140A18',
            fontFamily:    fontSans,
            fontSize:      13,
            letterSpacing: '0.08em',
            border:        saved ? '1px solid rgba(143,175,138,0.4)' : 'none',
            cursor:        'pointer',
            opacity:       (!exerciseName.trim() || saving) ? 0.5 : 1,
            transition:    'all 0.3s ease',
          }}
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Workout'}
        </button>
      </div>
    </div>
  )
}
