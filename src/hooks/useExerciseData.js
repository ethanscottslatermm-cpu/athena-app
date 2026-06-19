import { useState, useEffect } from 'react'

export function useExerciseData(muscleId) {
  const [exercises, setExercises] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!muscleId) {
      setExercises([])
      setLoading(false)
      setError(null)
      return
    }

    let stale = false
    setLoading(true)
    setError(null)
    setExercises([])

    fetch('/.netlify/functions/workoutx-exercise-search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ muscleId }),
    })
      .then(r => r.json())
      .then(data => {
        if (stale) return
        if (data.error) throw new Error(data.error)
        setExercises(data.exercises ?? [])
      })
      .catch(err => { if (!stale) setError(err.message) })
      .finally(() => { if (!stale) setLoading(false) })

    return () => { stale = true }
  }, [muscleId])

  return { exercises, loading, error }
}
