import { useProfile } from './useProfile'

export function useAdmin() {
  const { profile, loading } = useProfile()
  return {
    isAdmin: profile?.is_admin === true,
    loading,
  }
}
