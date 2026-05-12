import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

const ANIM = {
  core:        '/animations/core.json',
  glutes:      '/animations/glutes.json',
  arms:        '/animations/arms.json',
  flexibility: '/animations/flexibility.json',
  recovery:    '/animations/recovery.json',
  full_body:   '/animations/fullbody.json',
}

export default function ExerciseAnimation({ focusArea, size = 180, className = '' }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const url = ANIM[focusArea] ?? ANIM.core
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
  }, [focusArea])

  if (!data) return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ color: 'rgba(201,168,108,0.3)', fontSize: size * 0.22 }}>✦</span>
    </div>
  )

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
