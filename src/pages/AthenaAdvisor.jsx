import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
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

export default function AthenaAdvisor() {
  const location = useLocation()
  const { sendMessage, getHistory } = useAthena()
  const { phase, label } = usePhase()
  const { profile } = useProfile()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const dot = PHASE_DOTS[phase] ?? '#C9A86C'

  const [messages,     setMessages]     = useState([])
  const [input,        setInput]        = useState('')
  const [sending,      setSending]      = useState(false)
  const [historyLoaded,setHistLoaded]   = useState(false)
  const [showSuggested,setShowSuggested]= useState(false)
  const [typingId,     setTypingId]     = useState(null)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  // Load history on mount
  useEffect(() => {
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
  }, [])

  // Handle pre-loaded message from navigation state
  useEffect(() => {
    if (location.state?.preloadMessage && historyLoaded) {
      handleSend(location.state.preloadMessage)
    }
  }, [historyLoaded])

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
    <div style={{
      position: 'fixed', inset: 0,
      background: '#140E0C',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .athena-input::placeholder { color: rgba(196,133,154,0.35); }
        .athena-scroll::-webkit-scrollbar { display: none; }
        .athena-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 24px 12px',
        borderBottom: '1px solid rgba(201,168,108,0.15)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ color: '#C9A86C', fontSize: 12 }}>✦</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A86C' }}>
            Athena
          </span>
          <span style={{ color: '#C9A86C', fontSize: 12 }}>✦</span>
        </div>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 12, color: 'rgba(196,133,154,0.6)', textAlign: 'center', margin: 0 }}>
          goddess of wisdom
        </p>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,168,108,0.25), transparent)', marginTop: 10 }} />
        {phase && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.5)' }}>
              {label} Phase
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="athena-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.map((msg, i) => {
          const isAthena   = msg.role === 'assistant'
          const isFirst    = isAthena && (i === 0 || messages[i - 1]?.role !== 'assistant')
          const isTyping   = msg.id === typingId

          return (
            <div
              key={msg.id}
              style={{
                marginBottom: 20,
                textAlign: isAthena ? 'left' : 'right',
                animation: 'msgIn 0.3s ease forwards',
              }}
            >
              {isFirst && (
                <span style={{ display: 'block', color: '#C9A86C', fontSize: 8, marginBottom: 4 }}>✦</span>
              )}
              <p style={{
                display: 'inline',
                fontFamily: isAthena ? 'Cormorant Garamond, serif' : 'Cormorant Garamond, serif',
                fontStyle: isAthena ? 'italic' : 'normal',
                fontSize: isAthena ? 17 : 14,
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
          <div style={{ marginBottom: 20 }}>
            <span style={{ display: 'block', color: '#C9A86C', fontSize: 8, marginBottom: 4 }}>✦</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 17, color: 'rgba(242,237,232,0.4)' }}>
              ···
            </span>
          </div>
        )}

        {/* Suggested prompts */}
        {showSuggested && messages.length <= 1 && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                style={{
                  padding: '7px 14px',
                  border: '1px solid rgba(201,168,108,0.4)',
                  borderRadius: 20,
                  background: 'transparent',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 12,
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
        padding: '10px 16px 12px',
        borderTop: '1px solid rgba(196,133,154,0.15)',
        background: 'rgba(20,14,12,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          border: '1px solid rgba(196,133,154,0.25)',
          borderRadius: 22,
          padding: '8px 8px 8px 16px',
          background: 'rgba(196,133,154,0.05)',
        }}>
          <textarea
            ref={inputRef}
            className="athena-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Athena anything..."
            rows={1}
            style={{
              flex: 1,
              background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 15, color: '#F2EDE8',
              lineHeight: 1.5, maxHeight: 100,
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: input.trim() ? '#C9A86C' : 'rgba(201,168,108,0.15)',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              color: input.trim() ? '#1A0E14' : 'rgba(201,168,108,0.4)',
              fontSize: 14,
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
