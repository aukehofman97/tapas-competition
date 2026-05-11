import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const PARTICIPANTS = [
  'Luis', 'Alejandra', 'Auke', 'Ana', 'Fran',
  'Raquel', 'Maria', 'Mape', 'Ayelen', 'David', 'Andrea',
]

export default function OnboardingScreen({ onComplete }) {
  const [registered, setRegistered] = useState([])
  const [selectedName, setSelectedName] = useState(null)
  const [tapaName, setTapaName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('participants')
      .select('name')
      .then(({ data }) => {
        if (data) setRegistered(data.map((r) => r.name))
      })
  }, [])

  const canSubmit = selectedName && tapaName.trim().length > 0 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    const { error: err } = await supabase
      .from('participants')
      .insert({ name: selectedName, tapa_name: tapaName.trim() })
    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }
    localStorage.setItem('tapas_user', selectedName)
    onComplete(selectedName)
  }

  return (
    <div className="min-h-svh bg-cream flex flex-col px-5 pt-12 pb-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-red font-bold leading-tight">
          ¡Bienvenidos!
        </h1>
        <p className="text-stone-600 mt-2 text-base">
          Select your name and register your tapa to join the competition.
        </p>
      </div>

      <section className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
          Who are you?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PARTICIPANTS.map((name) => {
            const taken = registered.includes(name)
            const selected = selectedName === name
            return (
              <motion.button
                key={name}
                whileTap={taken ? {} : { scale: 0.93 }}
                disabled={taken}
                onClick={() => !taken && setSelectedName(name)}
                className={`
                  rounded-2xl py-3 px-2 text-sm font-semibold transition-colors
                  ${taken
                    ? 'bg-cream-dark text-stone-400 cursor-not-allowed'
                    : selected
                    ? 'bg-terracotta text-white shadow-md'
                    : 'bg-white text-stone-700 border border-cream-dark'
                  }
                `}
              >
                {name}
                {taken && (
                  <span className="block text-xs font-normal text-stone-400 leading-tight">
                    taken
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </section>

      <section className="mb-8">
        <label
          htmlFor="tapa-name"
          className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3 block"
        >
          Your tapa name
        </label>
        <input
          id="tapa-name"
          type="text"
          value={tapaName}
          onChange={(e) => setTapaName(e.target.value)}
          placeholder="e.g. Patatas bravas especiales"
          className="w-full bg-white border border-cream-dark rounded-2xl px-4 py-3.5 text-base text-stone-800 placeholder-stone-400 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition"
        />
      </section>

      {error && (
        <p className="text-red text-sm mb-4">Something went wrong: {error}</p>
      )}

      <motion.button
        whileTap={canSubmit ? { scale: 0.97 } : {}}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`
          w-full rounded-2xl py-4 text-base font-bold transition-colors
          ${canSubmit
            ? 'bg-terracotta text-white shadow-lg active:bg-terracotta-dark'
            : 'bg-cream-dark text-stone-400 cursor-not-allowed'
          }
        `}
      >
        {submitting ? 'Registering…' : 'Join the competition'}
      </motion.button>
    </div>
  )
}
