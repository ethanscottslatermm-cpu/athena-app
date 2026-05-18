import GlassCard from '../components/GlassCard'

const circles = [
  { name: 'Pilates Studio',  emoji: '🎯', slug: 'pilates-studio' },
  { name: 'Cycle Support',   emoji: '◯',  slug: 'cycle-support'  },
  { name: 'Mental Wellness', emoji: '☽',  slug: 'mental-wellness'},
  { name: 'Body Fuel',       emoji: '🍽', slug: 'nourish'        },
  { name: 'Glow Up',         emoji: '✿',  slug: 'glow-up'        },
  { name: 'Progress & Wins', emoji: '🏆', slug: 'progress-wins'  },
  { name: 'Life Stages',     emoji: '✦',  slug: 'life-stages'    },
]

export default function Community() {
  return (
    <div className="min-h-screen bg-[#F2EDE8] pb-nav px-4 pt-8 max-w-md mx-auto">
      <h2 className="font-cinzel text-2xl text-brown tracking-widest mb-6">Community</h2>
      <div className="space-y-3">
        {circles.map(c => (
          <GlassCard key={c.slug} className="flex items-center gap-3 cursor-pointer transition-colors">
            <span className="text-2xl">{c.emoji}</span>
            <span className="font-garamond text-brown">{c.name}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
