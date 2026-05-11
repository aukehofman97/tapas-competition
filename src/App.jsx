import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav from './components/BottomNav'
import OnboardingScreen from './screens/OnboardingScreen'

const PLACEHOLDER_SCREENS = {
  home: 'HomeScreen',
  vote: 'VoteScreen',
  results: 'ResultsScreen',
}

function PlaceholderScreen({ name }) {
  return (
    <div className="flex-1 flex items-center justify-center text-stone-400 text-lg font-semibold">
      {name} — coming soon
    </div>
  )
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem('tapas_user')
  )
  const [screen, setScreen] = useState('home')
  const [selectedTapa, setSelectedTapa] = useState(null)

  function navigate(newScreen, tapa = null) {
    setScreen(newScreen)
    setSelectedTapa(tapa)
  }

  function handleOnboardingComplete(name) {
    setCurrentUser(name)
  }

  if (!currentUser) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="flex flex-col min-h-svh bg-cream">
      <main className="flex-1 pb-[68px] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="min-h-full"
          >
            <PlaceholderScreen name={PLACEHOLDER_SCREENS[screen]} />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav screen={screen} onNavigate={navigate} />
    </div>
  )
}
