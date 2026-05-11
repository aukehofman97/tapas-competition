import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const PARTICIPANTS = [
  'Luis', 'Alejandra', 'Auke', 'Ana', 'Fran',
  'Raquel', 'Maria', 'Mape', 'Ayelen', 'David', 'Andrea', 'Colau',
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
          ¡Bienvenidos! 🇪🇸
        </h1>
        <p className="text-stone-600 mt-2 text-base">
          The ultimate tapas showdown has come to Amsterdam. Register your creation and let the people decide.
        </p>
      </div>

      <section className="mb-6">
        <label
          htmlFor="who-select"
          className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3 block"
        >
          Who are you?
        </label>
        <select
          id="who-select"
          value={selectedName ?? ''}
          onChange={(e) => setSelectedName(e.target.value || null)}
          className="w-full bg-white border border-cream-dark rounded-2xl px-4 py-3.5 text-base text-stone-800 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
        >
          <option value="">Select your name…</option>
          {PARTICIPANTS.map((name) => {
            const taken = registered.includes(name)
            return (
              <option key={name} value={name} disabled={taken}>
                {name}{taken ? ' (taken)' : ''}
              </option>
            )
          })}
        </select>
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
