import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DECORATIVE_MUSCLES = new Set([
  'hand_left', 'hand_right',
  'knee_left', 'knee_right',
  'foot_left', 'foot_right',
])

export function useExerciseData(muscleId) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDecorative, setIsDecorative] = useState(false)

  useEffect(() => {
    if (!muscleId) {
      setExercises([])
      setLoading(false)
      setError(null)
      setIsDecorative(false)
      return
    }

    let stale = false
    setLoading(true)
    setError(null)
    setExercises([])

    ;(async () => {
      try {
        // Query exercise_library left-joined with youtube_video_cache
        const { data, error: queryError } = await supabase
          .from('exercise_library')
          .select(`
            id,
            name,
            equipment,
            sets,
            reps,
            instructions,
            youtube_video_cache (
              id,
              video_id,
              not_found,
              cached_at,
              channel_title
            )
          `)
          .eq('muscle_id', muscleId)

        if (queryError) throw queryError

        if (stale) return

        // Check if decorative
        if (!data || data.length === 0) {
          if (DECORATIVE_MUSCLES.has(muscleId)) {
            setIsDecorative(true)
          }
          setExercises([])
          setLoading(false)
          return
        }

        // Enrich with video data and trigger background lookups for cache misses
        const enriched = data.map((ex) => {
          const videoRow = ex.youtube_video_cache?.[0]
          const needsVideoLookup =
            !videoRow ||
            videoRow.not_found ||
            !videoRow.video_id ||
            (videoRow.cached_at &&
              new Date() - new Date(videoRow.cached_at) >
                180 * 24 * 60 * 60 * 1000)

          return {
            ...ex,
            videoRow,
            needsVideoLookup,
          }
        })

        setExercises(enriched)

        // Background: trigger video lookups for cache misses
        enriched.forEach((ex) => {
          if (ex.needsVideoLookup) {
            triggerVideoLookup(ex.id, ex.name)
          }
        })

        setLoading(false)
      } catch (err) {
        if (!stale) {
          setError(err.message)
          setLoading(false)
        }
      }
    })()

    return () => {
      stale = true
    }
  }, [muscleId])

  const triggerVideoLookup = async (exerciseId, exerciseName) => {
    try {
      const response = await fetch('/.netlify/functions/youtube-exercise-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: exerciseId, exercise_name: exerciseName }),
      })

      if (!response.ok) return

      const result = await response.json()
      if (result.video_id) {
        // Update local state with the new video
        setExercises((prev) =>
          prev.map((ex) =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  videoRow: {
                    video_id: result.video_id,
                    channel_title: result.channel_title,
                    not_found: false,
                    cached_at: new Date().toISOString(),
                  },
                  needsVideoLookup: false,
                }
              : ex
          )
        )
      }
    } catch (err) {
      console.error(`Failed to fetch video for exercise ${exerciseId}:`, err)
    }
  }

  return { exercises, loading, error, isDecorative }
}
