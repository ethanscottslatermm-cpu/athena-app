import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setProfile(null); setLoading(false); return }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [user, authLoading])

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return { profile, loading, updateProfile }
}
