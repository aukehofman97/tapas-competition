import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { TAPAS_HIDDEN } from '../lib/config'

const CATEGORIES = [
  { key: 'taste', label: 'Taste', emoji: '👅' },
  { key: 'presentation', label: 'Presentation', emoji: '🎨' },
  { key: 'originality', label: 'Originality', emoji: '💡' },
  { key: 'texture', label: 'Texture', emoji: '✋' },
  { key: 'authenticity', label: 'Authenticity', emoji: '🇪🇸' },
]

function CategorySlider({ category, value, touched, onChange }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-stone-700">
          {category.emoji} {category.label}
        </span>
        <span
          className={`text-lg font-bold tabular-nums min-w-[2.5rem] text-right transition-colors ${
            touched ? 'text-terracotta' : 'text-stone-300'
          }`}
        >
          {touched ? value : '—'}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-stone-400 mt-1 px-0.5">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}

export default function VoteModal({ tapa, currentUser, existingVote, onClose, onSaved }) {
  const [scores, setScores] = useState({
    taste: existingVote?.taste ?? 5,
    presentation: existingVote?.presentation ?? 5,
    originality: existingVote?.originality ?? 5,
    texture: existingVote?.texture ?? 5,
    authenticity: existingVote?.authenticity ?? 5,
  })
  const [touched, setTouched] = useState({
    taste: true,
    presentation: true,
    originality: true,
    texture: true,
    authenticity: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const allTouched = Object.values(touched).every(Boolean)
  const canSave = allTouched && !saving

  function handleChange(key, value) {
    setScores((prev) => ({ ...prev, [key]: value }))
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('votes').upsert(
      {
        tapa_creator: tapa.name,
        voter_name: currentUser,
        ...scores,
      },
      { onConflict: 'tapa_creator,voter_name' }
    )
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    onSaved()
  }

  const overall = allTouched
    ? (Object.values(scores).reduce((s, v) => s + v, 0) / 5).toFixed(1)
    : null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40 flex items-end"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          className="bg-white w-full rounded-t-3xl px-5 pt-4 pb-10 max-h-[92svh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-cream-dark rounded-full mx-auto mb-5" />

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-red leading-tight">
                {TAPAS_HIDDEN ? <span className="blur-sm select-none">{tapa.tapa_name}</span> : tapa.tapa_name}
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">by {tapa.name}</p>
            </div>
            <button onClick={onClose} className="text-stone-400 p-1 -mr-1">
              <X size={22} />
            </button>
          </div>

          {CATEGORIES.map((cat) => (
            <CategorySlider
              key={cat.key}
              category={cat}
              value={scores[cat.key]}
              touched={touched[cat.key]}
              onChange={(v) => handleChange(cat.key, v)}
            />
          ))}

          {overall && (
            <div className="bg-cream rounded-2xl px-4 py-3 flex justify-between items-center mb-5">
              <span className="text-sm font-semibold text-stone-600">Overall Experience</span>
              <span className="text-xl font-bold text-terracotta tabular-nums">{overall}</span>
            </div>
          )}

          {error && (
            <p className="text-red text-sm mb-3">Something went wrong: {error}</p>
          )}

          <motion.button
            whileTap={canSave ? { scale: 0.97 } : {}}
            onClick={handleSave}
            disabled={!canSave}
            className={`
              w-full rounded-2xl py-4 text-base font-bold transition-colors
              ${canSave
                ? 'bg-terracotta text-white shadow-lg'
                : 'bg-cream-dark text-stone-400 cursor-not-allowed'
              }
            `}
          >
            {saving
              ? 'Saving…'
              : !allTouched
              ? 'Move all sliders to save'
              : existingVote
              ? 'Update vote'
              : 'Save vote'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
