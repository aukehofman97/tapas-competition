import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ResultsScreen({ participants, votes, onReset }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState(null)

  async function handleReset() {
    setResetting(true)
    setError(null)
    const { error: e1 } = await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (e1) { setError(e1.message); setResetting(false); return }
    const { error: e2 } = await supabase.from('participants').delete().neq('name', '')
    if (e2) { setError(e2.message); setResetting(false); return }
    localStorage.removeItem('tapas_user')
    onReset()
  }

  return (
    <>
      <div className="px-4 pt-8 pb-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-red leading-tight">Results</h1>
          <p className="text-stone-500 text-sm mt-1">
            Reset when you're ready for a new competition.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <div className="bg-white rounded-2xl px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">Reset competition</p>
                <p className="text-xs text-stone-500">Clears all participants and votes</p>
              </div>
            </div>
            <p className="text-sm text-stone-500 mb-4 mt-2">
              Permanently deletes all data and returns everyone to the registration screen. This cannot be undone.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowConfirm(true)}
              className="w-full rounded-xl py-3 bg-red/10 text-red font-bold text-sm border border-red/20"
            >
              Reset competition
            </motion.button>
          </div>
        </div>

        {error && (
          <p className="text-red text-sm text-center">{error}</p>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center sm:justify-center p-0 sm:p-6"
            onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl px-5 pt-4 pb-10 sm:pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-cream-dark rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-lg">Are you sure?</p>
                  <p className="text-sm text-stone-500">This will delete everything permanently.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  disabled={resetting}
                  className="w-full rounded-xl py-4 bg-red text-white font-bold text-base disabled:opacity-50"
                >
                  {resetting ? 'Resetting…' : 'Yes, reset everything'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirm(false)}
                  className="w-full rounded-xl py-4 bg-cream-dark text-stone-600 font-semibold text-base"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
