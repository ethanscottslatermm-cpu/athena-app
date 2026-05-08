# ATHENA — Women's Wellness PWA

## Stack
- Framework: React 18 + Vite
- Styling: Tailwind CSS v3 (custom Athena tokens)
- Backend: Supabase (auth, db, realtime, storage)
- Hosting: Netlify (with Netlify Functions for API calls)
- AI: Anthropic API (claude-sonnet-4-6 for features, claude-haiku-4-5 for quick calls)
- PWA: vite-plugin-pwa

## Models
- Primary AI features: claude-sonnet-4-6
- Fast/cheap calls (food search, quick prompts): claude-haiku-4-5-20251001
- Deep analysis (cycle insights, mood correlation): claude-sonnet-4-6

## Architecture
- /src/components — reusable UI components
- /src/modules — feature modules (pilates, cycle, mood, nourish, sleep, skin)
- /src/hooks — custom React hooks (useAuth, useCycle, usePhase, useHaptic)
- /src/lib — supabase client, api helpers
- /src/pages — route-level pages
- /netlify/functions — serverless functions (Anthropic API calls)

## Supabase Project
- URL: [YOUR_SUPABASE_URL]
- Anon Key: [YOUR_ANON_KEY]
- Auth: email/password (Supabase Auth)

## Design Tokens
- Gold: #C9A86C
- Mauve: #6B4F6B
- Dusty Rose: #C49A9A
- Ivory: #F4EFE6
- Sage: #8FAF8A
- Deep Crimson: #8B1A1A
- Font Display: Cinzel (Roman serif)
- Font Body: Cormorant Garamond

## Cycle Phase Logic
- Menstrual: days 1-5
- Follicular: days 6-13
- Ovulation: days 14-16
- Luteal: days 17-28
- Calculated from: profiles.last_period_date + profiles.cycle_length

## Key Patterns
- All Anthropic API calls go through Netlify Functions (never expose key client-side)
- Use Supabase RLS on every table
- Phase-aware components check usePhase() hook before rendering
- Bottom nav: Dashboard | Pilates | Community | Cycle | Mood
- Mobile-first, PWA installable

## Commands
- Dev: npm run dev
- Build: npm run build
- Deploy: git push origin main (Netlify auto-deploys)
