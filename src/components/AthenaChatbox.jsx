import { useState, useEffect, useRef } from 'react'
import { useAthena } from '../hooks/useAthena'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'

const PHASE_DOTS = {
  follicular: '#8FA58C',
  ovulation:  '#C9A86C',
  luteal:     '#E8829A',
  menstrual:  '#7A5A6A',
}

const SUGGESTED = [
  'How should I eat this week?',
  'Why do I feel this way right now?',
  'What should my workout look like?',
  'Tell me about my cycle',
]

function TypewriterText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    if (!text) return
    const tick = () => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1))
        idx.current++
        setTimeout(tick, speed)
      } else {
        onDone?.()
      }
    }
    setTimeout(tick, speed)
  }, [text])

  return <>{displayed}</>
}

export default function AthenaChatbox() {
  const [open, setOpen] = useState(false)
  const { sendMessage, getHistory } = useAthena()
  const { phase, label } = usePhase()
  const { profile } = useProfile()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const dot = PHASE_DOTS[phase] ?? '#C9A86C'

  const [messages,      setMessages]     = useState([])
  const [input,         setInput]        = useState('')
  const [sending,       setSending]      = useState(false)
  const [historyLoaded, setHistLoaded]   = useState(false)
  const [showSuggested, setShowSuggested]= useState(false)
  const [typingId,      setTypingId]     = useState(null)
  const [initialized,   setInitialized]  = useState(false)
  const pendingMessage = useRef(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Listen for external open events (from InsightCard, BriefModal, CycleTracker, etc.)
  useEffect(() => {
    function onOpen(e) {
      if (e.detail?.message) pendingMessage.current = e.detail.message
      setOpen(true)
    }
    window.addEventListener('athena:open', onOpen)
    return () => window.removeEventListener('athena:open', onOpen)
  }, [])

  // Load history the first time the panel opens
  useEffect(() => {
    if (!open || initialized) return
    setInitialized(true)
    getHistory(20).then(history => {
      if (history.length > 0) {
        setMessages(history.map(m => ({ ...m, id: m.created_at })))
        setShowSuggested(false)
      } else {
        setShowSuggested(true)
        generateOpeningMessage()
      }
      setHistLoaded(true)
    })
  }, [open])

  // Fire pending message once history is loaded
  useEffect(() => {
    if (historyLoaded && pendingMessage.current) {
      const msg = pendingMessage.current
      pendingMessage.current = null
      handleSend(msg)
    }
  }, [historyLoaded])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  async function generateOpeningMessage() {
    const opening = await sendMessage(
      `Generate a personalized opening greeting for ${firstName}. Reference her current phase and one specific thing you know about her. End with "What do you need today?"`,
      [],
      'advisor-open'
    )
    if (opening?.message) {
      const id = Date.now().toString()
      setMessages([{ id, role: 'assistant', content: opening.message }])
      setTypingId(id)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text) {
    const msgText = (text ?? input).trim()
    if (!msgText || sending) return
    setInput('')
    setShowSuggested(false)
    const userMsg = { id: Date.now().toString(), role: 'user', content: msgText }
    setMessages(prev => [...prev, userMsg])
    setSending(true)
    const apiHistory = messages.slice(-20).map(m => ({ role: m.role, content: m.content }))
    const data = await sendMessage(msgText, apiHistory, 'advisor')
    setSending(false)
    if (data?.message) {
      const id = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id, role: 'assistant', content: data.message }])
      setTypingId(id)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,108,0.35); }
          50%       { box-shadow: 0 0 0 9px rgba(201,168,108,0); }
        }
        .ac-input::placeholder { color: rgba(196,133,154,0.35); }
        .ac-scroll::-webkit-scrollbar { display: none; }
        .ac-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 64px)',
          left: 0,
          right: 0,
          height: '68vh',
          maxWidth: '28rem',
          margin: '0 auto',
          zIndex: 100,
          background: '#140E0C',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.45)',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 20px 10px',
            borderBottom: '1px solid rgba(201,168,108,0.15)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#C9A86C', fontSize: 11 }}>✦</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A86C' }}>
                  Athena
                </span>
              </div>
              {phase && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.5)' }}>
                    {label} Phase
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(201,168,108,0.5)', fontSize: 22, lineHeight: 1,
                padding: '4px 8px',
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="ac-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {messages.map((msg, i) => {
              const isAthena = msg.role === 'assistant'
              const isFirst  = isAthena && (i === 0 || messages[i - 1]?.role !== 'assistant')
              const isTyping = msg.id === typingId

              return (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: 16,
                    textAlign: isAthena ? 'left' : 'right',
                    animation: 'msgIn 0.3s ease forwards',
                  }}
                >
                  {isFirst && (
                    <span style={{ display: 'block', color: '#C9A86C', fontSize: 8, marginBottom: 3 }}>✦</span>
                  )}
                  <p style={{
                    display: 'inline',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: isAthena ? 'italic' : 'normal',
                    fontSize: isAthena ? 16 : 14,
                    color: isAthena ? '#F2EDE8' : '#C4859A',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {isTyping
                      ? <TypewriterText text={msg.content} onDone={() => setTypingId(null)} />
                      : msg.content
                    }
                  </p>
                </div>
              )
            })}

            {sending && (
              <div style={{ marginBottom: 16 }}>
                <span style={{ display: 'block', color: '#C9A86C', fontSize: 8, marginBottom: 3 }}>✦</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 16, color: 'rgba(242,237,232,0.4)' }}>···</span>
              </div>
            )}

            {showSuggested && messages.length <= 1 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid rgba(201,168,108,0.4)',
                      borderRadius: 20,
                      background: 'transparent',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 11,
                      color: 'rgba(201,168,108,0.8)',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            flexShrink: 0,
            padding: '8px 14px 12px',
            borderTop: '1px solid rgba(196,133,154,0.15)',
            background: 'rgba(20,14,12,0.92)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 8,
              border: '1px solid rgba(196,133,154,0.25)',
              borderRadius: 20,
              padding: '6px 6px 6px 14px',
              background: 'rgba(196,133,154,0.05)',
            }}>
              <textarea
                ref={inputRef}
                className="ac-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Athena anything..."
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14, color: '#F2EDE8',
                  lineHeight: 1.5, maxHeight: 80,
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: input.trim() ? '#C9A86C' : 'rgba(201,168,108,0.15)',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  color: input.trim() ? '#1A0E14' : 'rgba(201,168,108,0.4)',
                  fontSize: 12,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 72px)',
          right: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: open ? '#C9A86C' : 'rgba(20,14,12,0.88)',
          border: `1.5px solid ${open ? '#C9A86C' : 'rgba(201,168,108,0.5)'}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
          fontSize: open ? 22 : 16,
          color: open ? '#1A0E14' : '#C9A86C',
          transition: 'all 0.2s',
          animation: open ? 'none' : 'fabPulse 3s ease-in-out infinite',
          boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}
      >
        {open ? '×' : '✦'}
      </button>
    </>
  )
}
