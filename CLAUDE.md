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
- Background (linen): #F2EDE8
- Rose (accent/CTA): #C4859A
- Surface (mist/card): #C4AFA8
- Sage: #8FA58C
- Brown (text primary): #3B3330
- Taupe (text secondary): #7A6A65
- Greige (nav bar): #8A7E78
- Mist (conditions card): #D6CFC9
- Font Display: Cinzel (Roman serif)
- Font Body: Cormorant Garamond

## Active Session (light mode) — screen-local tokens
The Active Session player (`src/modules/pilates/ActiveSession.jsx`) is the ONLY
light-themed screen in the app. It intentionally departs from the palette above
for workout focus and legibility while moving. Do not apply these anywhere else.
- Screen background (soft blush): #F2E8E8
- Card background (white): #FFFFFF
- Primary text (deep plum-brown): #2E1F26
- Accent / secondary (muted mauve-rose): #8B5A6B
- Muted text (dusty taupe): #9B8288
- Progress bar: #8B5A6B
- Next button (muted teal): #5F7D82
- Fonts unchanged: Cinzel headers, Cormorant Garamond body/cues

This screen is a REUSABLE TEMPLATE — every session renders through it. Structure,
styling and spacing are identical across sessions; only video, exercise name,
sets/reps, cue text and the exercise queue come from data.

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
