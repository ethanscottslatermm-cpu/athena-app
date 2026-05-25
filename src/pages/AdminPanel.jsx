import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  ChevronLeft, Users, Activity, Database,
  Sprout, Shield, TrendingUp, AlertCircle,
} from 'lucide-react'

function StatCard({ icon, label, value, sub }) {
  return (
    <div style={{
      background: 'rgba(242,237,232,0.9)',
      border: '1px solid rgba(196,175,168,0.45)',
      borderRadius: 16,
      padding: '14px 16px',
    }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#D4A0A0' }}>{icon}</span>
        <span className="font-cinzel text-[8px] tracking-[0.22em] uppercase" style={{ color: '#7A6A65' }}>{label}</span>
      </div>
      <p className="font-cinzel text-[22px] font-light" style={{ color: '#3B3330' }}>{value ?? '—'}</p>
      {sub && <p className="font-garamond text-xs mt-0.5" style={{ color: '#7A6A65' }}>{sub}</p>}
    </div>
  )
}

function ActionRow({ icon, label, sub, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 text-left"
      style={{ borderBottom: '1px solid rgba(196,175,168,0.3)' }}
    >
      <span style={{ color: danger ? 'rgba(212,160,160,0.7)' : '#D4A0A0' }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-garamond text-sm" style={{ color: danger ? 'rgba(212,160,160,0.85)' : '#3B3330' }}>{label}</p>
        {sub && <p className="font-garamond text-xs mt-0.5" style={{ color: '#7A6A65' }}>{sub}</p>}
      </div>
      <span style={{ color: 'rgba(196,175,168,0.6)', fontSize: 18 }}>›</span>
    </button>
  )
}

export default function AdminPanel() {
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('overview')

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [profilesRes, cycleRes, moodRes, pilatesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, email, created_at, last_period_date, is_admin', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).not('last_period_date', 'is', null),
        supabase.from('mood_entries').select('id', { count: 'exact' }),
        supabase.from('pilates_sessions').select('id', { count: 'exact' }),
      ])

      setStats({
        totalUsers:    profilesRes.count  ?? 0,
        cycleSetup:    cycleRes.count     ?? 0,
        moodEntries:   moodRes.count      ?? 0,
        pilateSessions: pilatesRes.count  ?? 0,
      })

      setUsers((profilesRes.data ?? []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      setLoading(false)
    }
    load()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users',    label: 'Users'    },
    { id: 'tools',    label: 'Tools'    },
  ]

  return (
    <div className="relative h-[100svh] overflow-y-auto" style={{ background: '#F3EAE7' }}>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto">
        <div
          className="flex items-center justify-between h-14 px-3"
          style={{
            background: 'rgba(242,237,232,0.95)',
            borderBottom: '1px solid rgba(196,175,168,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button onClick={() => navigate(-1)} className="p-2" style={{ color: '#D4A0A0' }}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={12} style={{ color: '#D4A0A0' }} />
            <span className="font-cinzel text-[11px] tracking-[0.32em]" style={{ color: '#3B3330' }}>ADMIN</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Tab bar */}
        <div
          className="flex px-4 gap-1"
          style={{ background: 'rgba(242,237,232,0.95)', borderBottom: '1px solid rgba(196,175,168,0.25)', paddingTop: 6, paddingBottom: 6 }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-1.5 rounded-lg font-cinzel text-[8px] tracking-[0.18em] uppercase transition-all"
              style={{
                background: tab === t.id ? 'rgba(212,160,160,0.15)' : 'transparent',
                color: tab === t.id ? '#D4A0A0' : '#7A6A65',
                border: tab === t.id ? '1px solid rgba(212,160,160,0.35)' : '1px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-28 pb-28 px-4 max-w-md mx-auto">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <>
            <p className="font-cinzel text-[8px] tracking-[0.25em] uppercase mb-3" style={{ color: '#7A6A65' }}>
              Platform Stats
            </p>
            {loading ? (
              <p className="font-garamond text-sm text-center py-8" style={{ color: '#7A6A65' }}>Loading…</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard icon={<Users size={14} />}     label="Total Users"      value={stats?.totalUsers}    />
                <StatCard icon={<Activity size={14} />}  label="Cycle Tracked"    value={stats?.cycleSetup}    sub={`of ${stats?.totalUsers}`} />
                <StatCard icon={<TrendingUp size={14} />} label="Mood Entries"    value={stats?.moodEntries}   />
                <StatCard icon={<Database size={14} />}  label="Pilates Sessions" value={stats?.pilateSessions} />
              </div>
            )}

            <p className="font-cinzel text-[8px] tracking-[0.25em] uppercase mb-3" style={{ color: '#7A6A65' }}>
              Quick Actions
            </p>
            <div
              style={{
                background: 'rgba(242,237,232,0.9)',
                border: '1px solid rgba(196,175,168,0.45)',
                borderRadius: 16,
                padding: '0 16px',
              }}
            >
              <ActionRow
                icon={<Sprout size={15} />}
                label="Seed Pilates Data"
                sub="Populate sessions, challenges, and library"
                onClick={() => navigate('/seed')}
              />
              <ActionRow
                icon={<Users size={15} />}
                label="Manage Users"
                sub="View and search all accounts"
                onClick={() => setTab('users')}
              />
              <ActionRow
                icon={<Database size={15} />}
                label="Tools & Utilities"
                sub="Cache, exports, diagnostics"
                onClick={() => setTab('tools')}
              />
            </div>
          </>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <>
            <p className="font-cinzel text-[8px] tracking-[0.25em] uppercase mb-3" style={{ color: '#7A6A65' }}>
              {users.length} Account{users.length !== 1 ? 's' : ''}
            </p>
            {loading ? (
              <p className="font-garamond text-sm text-center py-8" style={{ color: '#7A6A65' }}>Loading…</p>
            ) : (
              <div
                style={{
                  background: 'rgba(242,237,232,0.9)',
                  border: '1px solid rgba(196,175,168,0.45)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {users.map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(196,175,168,0.25)' : 'none' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: u.is_admin ? 'rgba(212,160,160,0.2)' : 'rgba(196,175,168,0.25)', border: u.is_admin ? '1px solid rgba(212,160,160,0.4)' : 'none' }}
                    >
                      <span className="font-cinzel text-[9px]" style={{ color: u.is_admin ? '#D4A0A0' : '#7A6A65' }}>
                        {(u.full_name || u.username || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-garamond text-sm truncate" style={{ color: '#3B3330' }}>
                        {u.full_name || u.username || 'Unnamed'}
                        {u.is_admin && <span className="ml-1.5 font-cinzel text-[7px] tracking-widest" style={{ color: '#D4A0A0' }}>ADMIN</span>}
                      </p>
                      <p className="font-garamond text-xs truncate" style={{ color: '#7A6A65' }}>
                        Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {u.last_period_date && (
                      <span className="font-cinzel text-[7px] tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(143,165,140,0.18)', color: '#8FA58C', border: '1px solid rgba(143,165,140,0.3)' }}>
                        CYCLE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Tools ── */}
        {tab === 'tools' && (
          <>
            <p className="font-cinzel text-[8px] tracking-[0.25em] uppercase mb-3" style={{ color: '#7A6A65' }}>
              Utilities
            </p>
            <div
              style={{
                background: 'rgba(242,237,232,0.9)',
                border: '1px solid rgba(196,175,168,0.45)',
                borderRadius: 16,
                padding: '0 16px',
              }}
            >
              <ActionRow
                icon={<Database size={15} />}
                label="Clear App Cache"
                sub="Remove locally cached data"
                onClick={() => { localStorage.clear(); alert('Cache cleared') }}
              />
              <ActionRow
                icon={<Activity size={15} />}
                label="Check Supabase Connection"
                sub="Ping the database"
                onClick={async () => {
                  const { error } = await supabase.from('profiles').select('id').limit(1)
                  alert(error ? `Error: ${error.message}` : 'Connected ✓')
                }}
              />
              <ActionRow
                icon={<AlertCircle size={15} />}
                label="View App Version"
                sub="Current build info"
                onClick={() => alert('Athena v1.0.0')}
                danger={false}
              />
            </div>
          </>
        )}

      </div>
    </div>
  )
}
