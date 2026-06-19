import { useState, useEffect } from 'react'

export function useExerciseVideos(muscleId) {
  const [videos, setVideos]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!muscleId) {
      setVideos([])
      setLoading(false)
      setError(null)
      return
    }

    let stale = false
    setLoading(true)
    setError(null)
    setVideos([])

    fetch('/.netlify/functions/youtube-exercise-search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ muscleId }),
    })
      .then(r => r.json())
      .then(data => {
        if (stale) return
        if (data.error) throw new Error(data.error)
        setVideos(data.videos ?? [])
      })
      .catch(err => { if (!stale) setError(err.message) })
      .finally(() => { if (!stale) setLoading(false) })

    return () => { stale = true }
  }, [muscleId])

  return { videos, loading, error }
}
