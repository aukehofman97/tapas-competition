import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star } from 'lucide-react'
import confetti from 'canvas-confetti'
import { supabase } from '../lib/supabase'
import { rankTapas } from '../lib/scoring'
import { TAPAS_HIDDEN } from '../lib/config'
import EditTapaModal from '../components/EditTapaModal'

const BADGE_COLORS = {
  'Most Original': 'bg-olive text-white',
  'Best Presentation': 'bg-yellow text-red',
}

function ScorePill({ score }) {
  return (
    <span className="text-sm font-bold text-terracotta tabular-nums">
      {score > 0 ? score.toFixed(1) : '—'}
    </span>
  )
}

function BadgePills({ badges }) {
  if (!badges?.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {badges.map((b) => (
        <span
          key={b}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[b]}`}
        >
          {b}
        </span>
      ))}
    </div>
  )
}

function TapaName({ name, hidden }) {
  if (!hidden) return <span>{name}</span>
  return (
    <span className="relative inline-block">
      <span className="blur-sm select-none">{name}</span>
    </span>
  )
}

function TapaCard({ tapa, rank, badges, onPress, hidden }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      className="w-full text-left bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:shadow-none transition-shadow"
    >
      <span className="text-base font-bold text-stone-400 w-6 shrink-0 text-center">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 truncate">
          <TapaName name={tapa.tapa_name} hidden={hidden} />
        </p>
        <p className="text-xs text-stone-500 mt-0.5">by {tapa.name}</p>
        {!hidden && <BadgePills badges={badges} />}
      </div>
      <div className="flex flex-col items-end shrink-0">
        <ScorePill score={tapa.score} />
        <span className="text-xs text-stone-400 mt-0.5">
          {tapa.voteCount} {tapa.voteCount === 1 ? 'vote' : 'votes'}
        </span>
      </div>
    </motion.button>
  )
}

function PodiumCard({ tapa, rank, badges, onPress, hidden }) {
  const isFirst = rank === 1
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      className={`
        text-left rounded-3xl p-4 flex flex-col
        ${isFirst
          ? 'bg-terracotta text-white shadow-xl col-span-2'
          : 'bg-white text-stone-800 shadow-md'
        }
      `}
    >
      {isFirst && (
        <Crown size={28} className="text-yellow mb-2" strokeWidth={2} />
      )}
      {!isFirst && (
        <span className="text-xs font-bold text-stone-400 mb-1">#{rank}</span>
      )}
      <p className={`font-bold leading-tight ${isFirst ? 'text-xl' : 'text-sm'}`}>
        <TapaName name={tapa.tapa_name} hidden={hidden} />
      </p>
      <p className={`text-xs mt-0.5 ${isFirst ? 'text-white/70' : 'text-stone-500'}`}>
        by {tapa.name}
      </p>
      {!hidden && <BadgePills badges={badges} />}
      <div className="mt-auto pt-3 flex items-baseline gap-1.5">
        <span className={`font-bold tabular-nums ${isFirst ? 'text-2xl text-yellow' : 'text-lg text-terracotta'}`}>
          {tapa.score > 0 ? tapa.score.toFixed(1) : '—'}
        </span>
        <span className={`text-xs ${isFirst ? 'text-white/60' : 'text-stone-400'}`}>
          / 10 · {tapa.voteCount} {tapa.voteCount === 1 ? 'vote' : 'votes'}
        </span>
      </div>
    </motion.button>
  )
}

export default function HomeScreen({ currentUser, badges = {}, onNavigateTapa }) {
  function isHidden(tapa) { return TAPAS_HIDDEN && tapa.name !== currentUser }
  const [participants, setParticipants] = useState([])
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTapa, setEditingTapa] = useState(null)
  const prevFirstRef = useRef(null)

  useEffect(() => {
    async function loadData() {
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from('participants').select('*'),
        supabase.from('votes').select('*'),
      ])
      if (p) setParticipants(p)
      if (v) setVotes(v)
      setLoading(false)
    }
    loadData()

    const participantsSub = supabase
      .channel('home-participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, (payload) => {
        setParticipants((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new]
          if (payload.eventType === 'DELETE') return prev.filter((p) => p.name !== payload.old.name)
          return prev
        })
      })
      .subscribe()

    const votesSub = supabase
      .channel('home-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
        setVotes((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new]
          if (payload.eventType === 'UPDATE') return prev.map((v) => v.id === payload.new.id ? payload.new : v)
          if (payload.eventType === 'DELETE') return prev.filter((v) => v.id !== payload.old.id)
          return prev
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(participantsSub)
      supabase.removeChannel(votesSub)
    }
  }, [])

  const ranked = rankTapas(participants, votes)

  // Fire confetti only when #1 changes to a new leader (not on initial load)
  const currentFirst = ranked[0]?.name ?? null
  useEffect(() => {
    if (currentFirst && prevFirstRef.current && prevFirstRef.current !== currentFirst) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#C0622A', '#F5C842', '#8B1A1A', '#6B7C3C'] })
    }
    prevFirstRef.current = currentFirst
  }, [currentFirst])

  const podium = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60svh]">
        <div className="w-8 h-8 rounded-full border-4 border-cream-dark border-t-terracotta animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-red leading-tight">Leaderboard 🇪🇸</h1>
        <p className="text-stone-500 text-sm mt-1">
          {TAPAS_HIDDEN
            ? 'Tapa names are hidden until the competition begins 🔒'
            : 'Tap any tapa to see the full breakdown'}
        </p>
      </div>

      {ranked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Star size={48} className="text-cream-dark mb-4" />
          <p className="text-stone-500 text-base font-medium">No tapas registered yet.</p>
          <p className="text-stone-400 text-sm mt-1">Be the first to join!</p>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {podium.map((tapa, i) => (
                <PodiumCard
                  key={tapa.name}
                  tapa={tapa}
                  rank={i + 1}
                  badges={badges[tapa.name]}
                  hidden={isHidden(tapa)}
                  onPress={() => tapa.name === currentUser ? setEditingTapa(tapa) : onNavigateTapa(tapa.name)}
                />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="flex flex-col gap-2">
              {rest.map((tapa, i) => (
                <TapaCard
                  key={tapa.name}
                  tapa={tapa}
                  rank={podium.length + i + 1}
                  badges={badges[tapa.name]}
                  hidden={isHidden(tapa)}
                  onPress={() => tapa.name === currentUser ? setEditingTapa(tapa) : onNavigateTapa(tapa.name)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editingTapa && (
        <EditTapaModal
          currentUser={currentUser}
          currentTapaName={editingTapa.tapa_name}
          onClose={() => setEditingTapa(null)}
          onSaved={(newName) => {
            setParticipants((prev) =>
              prev.map((p) => p.name === currentUser ? { ...p, tapa_name: newName } : p)
            )
            setEditingTapa(null)
          }}
        />
      )}
    </div>
  )
}
