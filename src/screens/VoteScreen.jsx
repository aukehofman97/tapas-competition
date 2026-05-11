import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { tapaScore } from '../lib/scoring'
import VoteModal from '../components/VoteModal'

function TapaVoteCard({ tapa, existingVote, onVote, onViewDetail }) {
  const hasVoted = !!existingVote
  const score = tapaScore(existingVote ? [existingVote] : [])

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
      <button
        onClick={onViewDetail}
        className="flex-1 min-w-0 text-left"
      >
        <p className="font-semibold text-stone-800 truncate">{tapa.tapa_name}</p>
        <p className="text-xs text-stone-500 mt-0.5">by {tapa.name}</p>
        {hasVoted && (
          <p className="text-xs text-olive mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} />
            Your score: {score.toFixed(1)}
          </p>
        )}
      </button>
      <button
        onClick={onVote}
        className={`
          shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors
          ${hasVoted
            ? 'bg-cream-dark text-terracotta border border-terracotta/30'
            : 'bg-terracotta text-white'
          }
        `}
      >
        {hasVoted ? 'Edit' : 'Vote'}
      </button>
      <button onClick={onViewDetail} className="shrink-0 text-stone-300">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default function VoteScreen({ currentUser, onNavigateTapa }) {
  const [participants, setParticipants] = useState([])
  const [myVotes, setMyVotes] = useState([])
  const [allVotes, setAllVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalTapa, setModalTapa] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: v }, { data: av }] = await Promise.all([
        supabase.from('participants').select('*'),
        supabase.from('votes').select('*').eq('voter_name', currentUser),
        supabase.from('votes').select('*'),
      ])
      if (p) setParticipants(p)
      if (v) setMyVotes(v)
      if (av) setAllVotes(av)
      setLoading(false)
    }
    load()
  }, [currentUser])

  const others = participants.filter((p) => p.name !== currentUser)

  function getExistingVote(tapaCreator) {
    return myVotes.find((v) => v.tapa_creator === tapaCreator) ?? null
  }

  function getAvgScore(tapaCreator) {
    const votes = allVotes.filter((v) => v.tapa_creator === tapaCreator)
    return tapaScore(votes)
  }

  async function handleVoteSaved(tapaCreator) {
    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_name', currentUser)
    if (data) setMyVotes(data)
    setModalTapa(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60svh]">
        <div className="w-8 h-8 rounded-full border-4 border-cream-dark border-t-terracotta animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="px-4 pt-8 pb-4">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-red leading-tight">Vote</h1>
          <p className="text-stone-500 text-sm mt-1">
            Rate each tapa across 5 categories — you can edit your vote anytime.
          </p>
        </div>

        {others.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-stone-500 text-base font-medium">No other tapas to vote on yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {others.map((tapa) => (
              <TapaVoteCard
                key={tapa.name}
                tapa={tapa}
                existingVote={getExistingVote(tapa.name)}
                onVote={() => setModalTapa(tapa)}
                onViewDetail={() => onNavigateTapa(tapa.name)}
              />
            ))}
          </div>
        )}
      </div>

      {modalTapa && (
        <VoteModal
          tapa={modalTapa}
          currentUser={currentUser}
          existingVote={getExistingVote(modalTapa.name)}
          onClose={() => setModalTapa(null)}
          onSaved={() => handleVoteSaved(modalTapa.name)}
        />
      )}
    </>
  )
}
