import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function EditTapaModal({ currentUser, currentTapaName, onClose, onSaved }) {
  const [tapaName, setTapaName] = useState(currentTapaName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const canSave = tapaName.trim().length > 0 && tapaName.trim() !== currentTapaName && !saving

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('participants')
      .update({ tapa_name: tapaName.trim() })
      .eq('name', currentUser)
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    onSaved(tapaName.trim())
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center sm:justify-center p-0 sm:p-6"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: '100%', opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl px-5 pt-4 pb-10 sm:pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-cream-dark rounded-full mx-auto mb-5 sm:hidden" />

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-red leading-tight">Edit your tapa</h2>
              <p className="text-sm text-stone-500 mt-0.5">by {currentUser}</p>
            </div>
            <button onClick={onClose} className="text-stone-400 p-1 -mr-1">
              <X size={22} />
            </button>
          </div>

          <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3 block">
            Tapa name
          </label>
          <input
            type="text"
            value={tapaName}
            onChange={(e) => setTapaName(e.target.value)}
            className="w-full bg-white border border-cream-dark rounded-2xl px-4 py-3.5 text-base text-stone-800 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition mb-6"
            autoFocus
          />

          {error && <p className="text-red text-sm mb-3">{error}</p>}

          <motion.button
            whileTap={canSave ? { scale: 0.97 } : {}}
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full rounded-2xl py-4 text-base font-bold transition-colors ${
              canSave
                ? 'bg-terracotta text-white shadow-lg'
                : 'bg-cream-dark text-stone-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving…' : 'Save'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
