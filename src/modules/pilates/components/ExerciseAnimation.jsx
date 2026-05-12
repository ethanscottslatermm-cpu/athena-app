import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const ANIM = {
  core:        '/animations/core.json.json',
  glutes:      '/animations/glutes.json.lottie',
  arms:        '/animations/arms.json.lottie',
  flexibility: '/animations/flexibility.json.lottie',
  recovery:    '/animations/recovery.json.lottie',
  full_body:   '/animations/fullbody.json.lottie',
}

export default function ExerciseAnimation({ focusArea, size = 180, className = '' }) {
  const src = ANIM[focusArea] ?? ANIM.core

  return (
    <DotLottieReact
      src={src}
      loop
      autoplay
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
