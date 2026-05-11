import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { categoryAverages, overallScore } from '../lib/scoring'

const CATEGORIES = [
  { key: 'taste', label: 'Taste', emoji: '👅' },
  { key: 'presentation', label: 'Presentation', emoji: '🎨' },
  { key: 'originality', label: 'Originality', emoji: '💡' },
  { key: 'texture', label: 'Texture', emoji: '✋' },
  { key: 'authenticity', label: 'Authenticity', emoji: '🇪🇸' },
]

const BADGE_COLORS = {
  'Most Original': 'bg-olive text-white',
  'Best Presentation': 'bg-yellow text-red',
}

function CategoryBar({ label, emoji, value }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-stone-600 font-medium">
          {emoji} {label}
        </span>
        <span className="text-sm font-bold text-terracotta tabular-nums">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      </div>
      <div className="h-2.5 bg-cream-dark rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-terracotta rounded-full"
        />
      </div>
    </div>
  )
}

function VoterRow({ vote }) {
  const overall = overallScore(vote)
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-cream-dark last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-700">{vote.voter_name}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {CATEGORIES.map((c) => `${c.label.slice(0, 4)}: ${vote[c.key]}`).join(' · ')}
        </p>
      </div>
      <span className="text-sm font-bold text-terracotta tabular-nums">
        {overall.toFixed(1)}
      </span>
    </div>
  )
}

export default function TapaDetailScreen({ tapaCreator, badges, onBack }) {
  const [tapa, setTapa] = useState(null)
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from('participants').select('*').eq('name', tapaCreator).single(),
        supabase.from('votes').select('*').eq('tapa_creator', tapaCreator),
      ])
      if (p) setTapa(p)
      if (v) setVotes(v)
      setLoading(false)
    }
    load()
  }, [tapaCreator])

  const avgs = categoryAverages(votes)
  const overall = votes.length
    ? votes.reduce((sum, v) => sum + overallScore(v), 0) / votes.length
    : 0
  const tapaBadges = badges?.[tapaCreator] ?? []

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60svh]">
        <div className="w-8 h-8 rounded-full border-4 border-cream-dark border-t-terracotta animate-spin" />
      </div>
    )
  }

  if (!tapa) {
    return (
      <div className="px-4 pt-8">
        <button onClick={onBack} className="flex items-center gap-1 text-terracotta mb-6">
          <ArrowLeft size={18} /> Back
        </button>
        <p className="text-stone-500">Tapa not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-terracotta text-sm font-semibold mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-red leading-tight">
          {tapa.tapa_name}
        </h1>
        <p className="text-stone-500 text-sm mt-1">by {tapa.name}</p>
        {tapaBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tapaBadges.map((b) => (
              <span
                key={b}
                className={`text-xs font-bold px-3 py-1 rounded-full ${BADGE_COLORS[b]}`}
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-terracotta text-white rounded-3xl px-5 py-5 mb-6 flex justify-between items-center">
        <div>
          <p className="text-white/70 text-sm">Overall Experience</p>
          <p className="text-4xl font-bold tabular-nums mt-0.5">
            {votes.length ? overall.toFixed(1) : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-sm">Votes</p>
          <p className="text-3xl font-bold">{votes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl px-4 py-4 mb-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
          Category Breakdown
        </h2>
        {CATEGORIES.map((cat) => (
          <CategoryBar
            key={cat.key}
            label={cat.label}
            emoji={cat.emoji}
            value={avgs[cat.key]}
          />
        ))}
      </div>

      {votes.length > 0 && (
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Voter Breakdown
          </h2>
          {votes.map((v) => (
            <VoterRow key={v.id} vote={v} />
          ))}
        </div>
      )}
    </div>
  )
}
