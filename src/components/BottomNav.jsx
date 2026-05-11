import { motion } from 'framer-motion'
import { Home, Vote, Trophy } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'vote', label: 'Vote', icon: Vote },
  { id: 'results', label: 'Results', icon: Trophy },
]

export default function BottomNav({ screen, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark safe-area-pb z-50">
      <div className="flex">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = screen === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative min-h-[56px]"
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-2 right-2 h-0.5 bg-terracotta rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                size={22}
                className={active ? 'text-terracotta' : 'text-stone-400'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={`text-xs font-medium ${active ? 'text-terracotta' : 'text-stone-400'}`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
