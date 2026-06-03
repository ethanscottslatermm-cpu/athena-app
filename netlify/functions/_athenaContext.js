// Shared context builder — not a direct HTTP endpoint (underscore prefix)
const { createClient } = require('@supabase/supabase-js')

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function getDayOfCycle(lastPeriodDate, cycleLength) {
  const diff = Math.floor((Date.now() - new Date(lastPeriodDate).getTime()) / 86400000)
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1
}

function getPhase(dayOfCycle, cycleLength, periodDuration) {
  const ovDay = cycleLength - 14
  if (dayOfCycle <= periodDuration) return 'menstrual'
  if (dayOfCycle < ovDay) return 'follicular'
  if (dayOfCycle <= ovDay + 2) return 'ovulation'
  return 'luteal'
}

function getDayOfPhase(dayOfCycle, phase, cycleLength, periodDuration) {
  const ovDay = cycleLength - 14
  switch (phase) {
    case 'menstrual':  return dayOfCycle
    case 'follicular': return dayOfCycle - periodDuration
    case 'ovulation':  return dayOfCycle - ovDay + 1
    case 'luteal':     return dayOfCycle - (ovDay + 2)
    default: return 1
  }
}

function parseSleepHours(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let hours = (wh + wm / 60) - (bh + bm / 60)
  if (hours < 0) hours += 24
  return Math.round(hours * 10) / 10
}

async function buildContext(userId) {
  const supabase = getSupabase()

  // Check cache first
  const { data: cached } = await supabase
    .from('athena_context_cache')
    .select('context_json, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.context_json
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  // Parallel fetch all data
  const [profileRes, symptomsRes, cyclesRes, foodRes, sleepRes, completionsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('symptoms').select('*').eq('user_id', userId).gte('logged_date', thirtyDaysAgo).order('logged_date', { ascending: false }),
    supabase.from('cycles').select('*').eq('user_id', userId).order('start_date', { ascending: false }).limit(5),
    supabase.from('food_log').select('*').eq('user_id', userId).gte('log_date', thirtyDaysAgo).order('log_date', { ascending: false }),
    supabase.from('sleep_logs').select('*').eq('user_id', userId).gte('log_date', thirtyDaysAgo).order('log_date', { ascending: false }),
    supabase.from('session_completions').select('*').eq('user_id', userId).gte('completed_at', new Date(Date.now() - 30 * 86400000).toISOString()).order('completed_at', { ascending: false }),
  ])

  const profile = profileRes.data ?? {}
  const symptoms = symptomsRes.data ?? []
  const cycles = cyclesRes.data ?? []
  const foodLogs = foodRes.data ?? []
  const sleepLogs = sleepRes.data ?? []
  const completions = completionsRes.data ?? []

  // ── Cycle context ─────────────────────────────────────────────────────────
  const cycleLength    = profile.cycle_length ?? 28
  const periodDuration = profile.period_duration ?? 5
  const lastPeriodDate = profile.last_period_date

  let cycleCtx = {
    currentPhase: 'follicular',
    dayOfPhase: 1,
    dayOfCycle: 1,
    cycleLength,
    periodExpectedIn: null,
    lastThreeCycleLengths: [],
    symptomsLoggedThisPhase: [],
  }

  if (lastPeriodDate) {
    const dayOfCycle = getDayOfCycle(lastPeriodDate, cycleLength)
    const phase = getPhase(dayOfCycle, cycleLength, periodDuration)
    const dayOfPhase = Math.max(1, getDayOfPhase(dayOfCycle, phase, cycleLength, periodDuration))
    const daysUntilNext = cycleLength - dayOfCycle

    // Last 3 cycle lengths from completed cycles
    const completeCycles = cycles.filter(c => c.start_date && c.end_date)
    const cycleLengths = completeCycles.slice(0, 3).map(c => {
      const diff = Math.floor((new Date(c.end_date) - new Date(c.start_date)) / 86400000) + 1
      return diff
    })

    // Symptoms logged in current phase (last 7 days)
    const recentSymptoms = []
    symptoms.slice(0, 7).forEach(s => {
      if (s.cramps)             recentSymptoms.push('cramps')
      if (s.bloating)           recentSymptoms.push('bloating')
      if (s.headache)           recentSymptoms.push('headache')
      if (s.fatigue)            recentSymptoms.push('fatigue')
      if (s.breast_tenderness)  recentSymptoms.push('breast tenderness')
    })

    cycleCtx = {
      currentPhase: phase,
      dayOfPhase,
      dayOfCycle,
      cycleLength,
      periodExpectedIn: daysUntilNext,
      lastThreeCycleLengths: cycleLengths,
      symptomsLoggedThisPhase: [...new Set(recentSymptoms)],
    }
  }

  // ── Nourish context ───────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = foodLogs.filter(f => f.log_date === today)
  const todayMacros = todayLogs.reduce((acc, f) => ({
    protein:  acc.protein  + (f.protein_g ?? 0),
    carbs:    acc.carbs    + (f.carbs_g   ?? 0),
    fat:      acc.fat      + (f.fat_g     ?? 0),
    calories: acc.calories + (f.calories  ?? 0),
  }), { protein: 0, carbs: 0, fat: 0, calories: 0 })

  // Weekly averages (group by day)
  const byDay = {}
  foodLogs.forEach(f => {
    if (!byDay[f.log_date]) byDay[f.log_date] = { protein: 0, carbs: 0, fat: 0, calories: 0 }
    byDay[f.log_date].protein  += f.protein_g ?? 0
    byDay[f.log_date].carbs    += f.carbs_g   ?? 0
    byDay[f.log_date].fat      += f.fat_g     ?? 0
    byDay[f.log_date].calories += f.calories  ?? 0
  })
  const days = Object.values(byDay)
  const weeklyAverages = days.length > 0 ? {
    protein:  Math.round(days.reduce((a, d) => a + d.protein,  0) / days.length),
    carbs:    Math.round(days.reduce((a, d) => a + d.carbs,    0) / days.length),
    fat:      Math.round(days.reduce((a, d) => a + d.fat,      0) / days.length),
    calories: Math.round(days.reduce((a, d) => a + d.calories, 0) / days.length),
  } : { protein: 0, carbs: 0, fat: 0, calories: 0 }

  const proteinGoal = 100
  const last7Days = Object.entries(byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
  const proteinStreak = last7Days.reduce((streak, [, d]) => {
    if (d.protein >= proteinGoal) return streak + 1
    return streak
  }, 0)

  const recentFoods = foodLogs.slice(0, 10).map(f => f.food_name).filter(Boolean)

  const nourishCtx = {
    todayMacros,
    weeklyAverages,
    ironLow: weeklyAverages.calories > 0 && recentFoods.filter(f =>
      /spinach|lentil|bean|beef|tofu|pumpkin/i.test(f)
    ).length < 2,
    magnesiumLow: weeklyAverages.calories > 0 && recentFoods.filter(f =>
      /almond|cashew|dark chocolate|avocado|banana|spinach/i.test(f)
    ).length < 2,
    proteinStreak,
    recentFoods,
  }

  // ── Sleep context ─────────────────────────────────────────────────────────
  const lastNight = sleepLogs[0]
  const lastNightHours = lastNight
    ? parseSleepHours(lastNight.bedtime, lastNight.wake_time)
    : null

  const sleepWithHours = sleepLogs
    .map(s => parseSleepHours(s.bedtime, s.wake_time))
    .filter(h => h !== null && h > 0 && h < 16)

  const weeklyAvgSleep = sleepWithHours.length > 0
    ? Math.round(sleepWithHours.slice(0, 7).reduce((a, b) => a + b, 0) / Math.min(7, sleepWithHours.length) * 10) / 10
    : null

  let weeklyTrend = 'stable'
  if (sleepWithHours.length >= 6) {
    const recent  = sleepWithHours.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const earlier = sleepWithHours.slice(3, 6).reduce((a, b) => a + b, 0) / 3
    if (recent > earlier + 0.3) weeklyTrend = 'improving'
    else if (recent < earlier - 0.3) weeklyTrend = 'declining'
  }

  const sleepCtx = {
    lastNightHours,
    weeklyAverage: weeklyAvgSleep,
    weeklyTrend,
    deepSleepPercent: null,
  }

  // ── Pilates context ───────────────────────────────────────────────────────
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 86400000

  const sessionsThisWeek = completions.filter(c =>
    new Date(c.completed_at).getTime() > sevenDaysAgo
  ).length

  const lastCompletion = completions[0]
  const lastSessionDaysAgo = lastCompletion
    ? Math.floor((now - new Date(lastCompletion.completed_at).getTime()) / 86400000)
    : null

  const pilatesCtx = {
    lastSessionDaysAgo,
    sessionsThisWeek,
    lastSessionFeedback: lastCompletion?.feeling ?? null,
    currentProgram: null,
    consistencyStreak: sessionsThisWeek,
  }

  // ── Pattern detection ─────────────────────────────────────────────────────
  // Headaches in luteal: headache logged in luteal phase 2+ of last 3 cycles
  const lutealHeadacheCycles = cycles.slice(0, 3).filter(c => {
    const cycleSym = symptoms.filter(s =>
      s.logged_date >= c.start_date &&
      s.headache &&
      s.phase_at_time === 'luteal'
    )
    return cycleSym.length > 0
  }).length

  // Energy crash: feeling 'drained' in luteal 3+ completions
  const lutealDrained = completions.filter(c =>
    c.energy_after === 'Drained'
  ).length

  // Sleep debt: weekly avg under 6h
  const sleepDebt = weeklyAvgSleep !== null && weeklyAvgSleep < 6

  const patterns = {
    headachesInLuteal:    lutealHeadacheCycles >= 2,
    energyCrashPattern:   lutealDrained >= 3,
    sleepDebtAccumulated: sleepDebt,
    highStressIndicators: symptoms.filter(s => s.fatigue || s.headache).length > 10,
  }

  // ── Assemble ──────────────────────────────────────────────────────────────
  const ctx = {
    user: {
      name:          profile.full_name?.split(' ')[0] ?? 'there',
      age:           profile.age ?? null,
      goals:         profile.preferences?.goals ?? [],
      joinedDaysAgo: profile.created_at
        ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
        : null,
    },
    cycle:   cycleCtx,
    nourish: nourishCtx,
    sleep:   sleepCtx,
    pilates: pilatesCtx,
    patterns,
  }

  // Upsert cache
  await supabase.from('athena_context_cache').upsert({
    user_id:      userId,
    context_json: ctx,
    generated_at: new Date().toISOString(),
    expires_at:   new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
  }, { onConflict: 'user_id' })

  return ctx
}

module.exports = { buildContext }
