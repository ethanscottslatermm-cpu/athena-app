import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, ZoomIn, Sun, RotateCcw, Zap, Pause, Play, Download, Trash2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const ROSE = '#D4A0A0'

// ── Grid overlay ──────────────────────────────────────────────────────────────

function GridOverlay() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
      <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
      <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
      <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
      <line x1="48%" y1="50%" x2="52%" y2="50%" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <line x1="50%" y1="48%" x2="50%" y2="52%" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
    </svg>
  )
}

// ── Icon control button ───────────────────────────────────────────────────────

function CtrlBtn({ onClick, active = false, disabled = false, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 42, height: 42, borderRadius: '50%',
        border: `1.5px solid ${active ? ROSE : 'rgba(255,255,255,0.28)'}`,
        background: active ? 'rgba(212,160,160,0.22)' : 'rgba(0,0,0,0.38)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  )
}

// ── Photo detail modal ────────────────────────────────────────────────────────

function PhotoModal({ photo, onClose, onDownload, onDelete }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,10,8,0.94)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <X size={16} color="#fff" strokeWidth={1.5} />
      </button>

      <img
        src={photo.url} alt="Skin photo"
        style={{
          maxWidth: '100%', maxHeight: '68vh',
          borderRadius: 18, objectFit: 'contain',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      />

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{
          fontFamily: 'Cormorant Garamond, serif', fontSize: 13,
          color: 'rgba(255,255,255,0.45)', margin: 0,
        }}>
          {new Date(photo.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <button
          onClick={() => onDownload(photo)}
          style={{
            padding: '8px 18px', borderRadius: 10,
            background: 'rgba(212,160,160,0.15)', border: `1px solid ${ROSE}55`,
            color: ROSE, fontFamily: 'Cinzel, serif', fontSize: 9,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Download size={11} strokeWidth={1.5} /> Save
        </button>

        <button
          onClick={() => onDelete(photo)}
          style={{
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(59,51,48,0.18)', border: '1px solid rgba(196,175,168,0.25)',
            color: '#7A6A65', fontFamily: 'Cinzel, serif', fontSize: 9,
            letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <Trash2 size={11} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SkinMirror() {
  const { user } = useAuth()
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)

  const [permission,      setPermission]      = useState(null)   // null | true | false
  const [facing,          setFacing]          = useState('user') // 'user' | 'environment'
  const [zoom,            setZoom]            = useState(1)
  const [brightness,      setBrightness]      = useState(1)
  const [showGrid,        setShowGrid]        = useState(false)
  const [torch,           setTorch]           = useState(false)
  const [torchSupported,  setTorchSupported]  = useState(false)
  const [frozen,          setFrozen]          = useState(false)
  const [capturing,       setCapturing]       = useState(false)
  const [flashAnim,       setFlashAnim]       = useState(false)
  const [photos,          setPhotos]          = useState([])
  const [selectedPhoto,   setSelectedPhoto]   = useState(null)

  // ── Start camera ─────────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setFrozen(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setPermission(true)
      const caps = stream.getVideoTracks()[0].getCapabilities?.() ?? {}
      setTorchSupported(!!caps.torch)
      setTorch(false)
    } catch {
      setPermission(false)
    }
  }, [facing])

  useEffect(() => {
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [startCamera])

  // ── Load saved photos ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return
    supabase
      .from('skin_photos')
      .select('id, storage_path, public_url, taken_at')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(40)
      .then(({ data }) => {
        if (data?.length) {
          setPhotos(data.map(p => ({
            url:         p.public_url,
            dbId:        p.id,
            storagePath: p.storage_path,
            timestamp:   p.taken_at,
          })))
        }
      })
  }, [user])

  // ── Controls ──────────────────────────────────────────────────────────────────

  async function toggleTorch() {
    if (!torchSupported || !streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    const next = !torch
    try { await track.applyConstraints({ advanced: [{ torch: next }] }); setTorch(next) } catch {}
  }

  function flipCamera() {
    setFacing(f => f === 'user' ? 'environment' : 'user')
    setTorch(false)
  }

  function toggleFreeze() {
    if (!videoRef.current) return
    frozen ? videoRef.current.play() : videoRef.current.pause()
    setFrozen(f => !f)
  }

  // ── Capture ───────────────────────────────────────────────────────────────────

  async function capture() {
    if (!videoRef.current || !canvasRef.current || capturing) return
    setCapturing(true)
    setFlashAnim(true)
    setTimeout(() => setFlashAnim(false), 280)

    const video  = videoRef.current
    const canvas = canvasRef.current
    const vw = video.videoWidth  || 1280
    const vh = video.videoHeight || 960
    canvas.width  = vw
    canvas.height = vh

    const ctx = canvas.getContext('2d')
    ctx.filter = `brightness(${brightness})`

    // Zoom: crop center
    const sw = vw / zoom
    const sh = vh / zoom
    const sx = (vw - sw) / 2
    const sy = (vh - sh) / 2

    if (facing === 'user') {
      ctx.translate(vw, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, vw, vh)

    const dataUrl   = canvas.toDataURL('image/jpeg', 0.92)
    const timestamp = new Date().toISOString()
    const localId   = `local-${Date.now()}`
    const newPhoto  = { url: dataUrl, dbId: null, storagePath: null, timestamp, localId }

    setPhotos(prev => [newPhoto, ...prev])

    if (user) {
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const path = `${user.id}/${Date.now()}.jpg`
        const { error: upErr } = await supabase.storage
          .from('skin-photos')
          .upload(path, blob, { contentType: 'image/jpeg' })

        if (!upErr) {
          const { data: urlData } = supabase.storage.from('skin-photos').getPublicUrl(path)
          const publicUrl = urlData.publicUrl
          const { data: row } = await supabase
            .from('skin_photos')
            .insert({ user_id: user.id, storage_path: path, public_url: publicUrl, taken_at: timestamp })
            .select('id')
            .single()
          setPhotos(prev => prev.map(p =>
            p.localId === localId
              ? { url: publicUrl, dbId: row?.id ?? null, storagePath: path, timestamp }
              : p
          ))
        }
      } catch {}
    }

    setCapturing(false)
  }

  // ── Save to device ────────────────────────────────────────────────────────────

  function downloadPhoto(photo) {
    const link = document.createElement('a')
    const date = new Date(photo.timestamp).toLocaleDateString('en-US').replace(/\//g, '-')
    link.href     = photo.url
    link.download = `skin-${date}.jpg`
    link.target   = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async function deletePhoto(photo) {
    setPhotos(prev => prev.filter(p => (p.localId ?? p.dbId ?? p.url) !== (photo.localId ?? photo.dbId ?? photo.url)))
    setSelectedPhoto(null)
    if (!user) return
    if (photo.storagePath) await supabase.storage.from('skin-photos').remove([photo.storagePath])
    if (photo.dbId)        await supabase.from('skin_photos').delete().eq('id', photo.dbId)
  }

  // ── Permission states ─────────────────────────────────────────────────────────

  if (permission === false) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <Camera size={32} color="rgba(212,160,160,0.4)" strokeWidth={1} style={{ marginBottom: 12 }} />
        <p className="font-cinzel text-[10px] tracking-widest uppercase mb-2" style={{ color: ROSE }}>
          Camera Access Needed
        </p>
        <p className="font-garamond text-sm leading-relaxed" style={{ color: '#7A6A65' }}>
          Allow camera access in your browser settings, then reload the page to use the skin mirror.
        </p>
      </div>
    )
  }

  if (permission === null) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
          Starting camera…
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes shutterFlash { from { opacity: 0.75 } to { opacity: 0 } }
        .sm-scroll::-webkit-scrollbar { display: none }
        .sm-scroll { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Camera viewport ──────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        aspectRatio: '3 / 4', background: '#110D0B',
        border: '1px solid rgba(196,175,168,0.2)',
      }}>
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `${facing === 'user' ? 'scaleX(-1) ' : ''}scale(${zoom})`,
            filter: `brightness(${brightness})`,
            transition: 'transform 0.18s',
          }}
        />

        {showGrid && <GridOverlay />}

        {/* Frozen badge */}
        {frozen && (
          <div style={{
            position: 'absolute', top: 10, left: 12,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
            borderRadius: 7, padding: '3px 9px',
          }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.2em', color: '#fff' }}>
              FROZEN
            </span>
          </div>
        )}

        {/* Shutter flash */}
        {flashAnim && (
          <div style={{
            position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none',
            animation: 'shutterFlash 0.28s ease forwards',
          }} />
        )}

        {/* ── Floating controls (top-right) ── */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Grid */}
          <CtrlBtn onClick={() => setShowGrid(g => !g)} active={showGrid}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="5.33" y1="0" x2="5.33" y2="16" stroke={showGrid ? ROSE : '#fff'} strokeWidth="1.1" />
              <line x1="10.66" y1="0" x2="10.66" y2="16" stroke={showGrid ? ROSE : '#fff'} strokeWidth="1.1" />
              <line x1="0" y1="5.33" x2="16" y2="5.33" stroke={showGrid ? ROSE : '#fff'} strokeWidth="1.1" />
              <line x1="0" y1="10.66" x2="16" y2="10.66" stroke={showGrid ? ROSE : '#fff'} strokeWidth="1.1" />
            </svg>
          </CtrlBtn>

          {/* Torch */}
          <CtrlBtn onClick={toggleTorch} active={torch} disabled={!torchSupported}>
            <Zap size={16} color={torch ? ROSE : '#fff'} strokeWidth={1.5} />
          </CtrlBtn>

          {/* Flip */}
          <CtrlBtn onClick={flipCamera}>
            <RotateCcw size={15} color="#fff" strokeWidth={1.5} />
          </CtrlBtn>

          {/* Freeze */}
          <CtrlBtn onClick={toggleFreeze} active={frozen}>
            {frozen
              ? <Play  size={14} color={ROSE} strokeWidth={1.5} />
              : <Pause size={14} color="#fff" strokeWidth={1.5} />
            }
          </CtrlBtn>
        </div>
      </div>

      {/* ── Sliders ──────────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
        borderRadius: 16, border: '1px solid rgba(196,175,168,0.35)',
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12,
        marginTop: 10,
      }}>
        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ZoomIn size={13} color="#7A6A65" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <input
            type="range" min="1" max="4" step="0.05"
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: ROSE, height: 3 }}
          />
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 8.5, color: '#7A6A65',
            width: 30, textAlign: 'right', flexShrink: 0,
          }}>
            {zoom.toFixed(1)}×
          </span>
        </div>

        {/* Brightness */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sun size={13} color="#7A6A65" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <input
            type="range" min="0.4" max="2.2" step="0.05"
            value={brightness}
            onChange={e => setBrightness(Number(e.target.value))}
            style={{ flex: 1, accentColor: ROSE, height: 3 }}
          />
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 8.5, color: '#7A6A65',
            width: 30, textAlign: 'right', flexShrink: 0,
          }}>
            {Math.round(brightness * 100)}%
          </span>
        </div>
      </div>

      {/* ── Capture button ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6, paddingBottom: 2 }}>
        <button
          onClick={capture}
          disabled={capturing}
          aria-label="Take photo"
          style={{
            position: 'relative', width: 68, height: 68, borderRadius: '50%',
            border: `3px solid ${ROSE}`,
            background: 'rgba(212,160,160,0.1)',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: capturing ? 'rgba(212,160,160,0.45)' : ROSE,
            transition: 'background 0.15s, transform 0.12s',
            transform: capturing ? 'scale(0.88)' : 'scale(1)',
          }} />
        </button>
      </div>

      {/* ── Photo gallery ─────────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="font-cinzel text-[9px] uppercase mb-3" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
            Skin Photos
          </p>
          <div
            className="sm-scroll"
            style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}
          >
            {photos.map((photo, i) => (
              <button
                key={photo.dbId ?? photo.localId ?? i}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  flexShrink: 0, width: 72, height: 96,
                  borderRadius: 12, overflow: 'hidden',
                  border: '1px solid rgba(196,175,168,0.35)',
                  cursor: 'pointer', padding: 0, background: '#1A1410',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <img
                  src={photo.url} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 12 }} />

      {/* ── Photo detail modal ────────────────────────────────────────────── */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDownload={downloadPhoto}
          onDelete={deletePhoto}
        />
      )}
    </>
  )
}
