import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { supabase } from './lib/supabase'
import { rankTapas, computeBadges } from './lib/scoring'
import BottomNav from './components/BottomNav'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import VoteScreen from './screens/VoteScreen'
import TapaDetailScreen from './screens/TapaDetailScreen'
import ResultsScreen from './screens/ResultsScreen'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem('tapas_user')
  )
  const [screen, setScreen] = useState('home')
  const [selectedTapa, setSelectedTapa] = useState(null)

  // Global data for badges (shared across screens)
  const [participants, setParticipants] = useState([])
  const [votes, setVotes] = useState([])

  useEffect(() => {
    if (!currentUser) return
    supabase.from('participants').select('*').then(({ data }) => { if (data) setParticipants(data) })
    supabase.from('votes').select('*').then(({ data }) => { if (data) setVotes(data) })

    const sub = supabase
      .channel('app-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
        setVotes((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new]
          if (payload.eventType === 'UPDATE') return prev.map((v) => v.id === payload.new.id ? payload.new : v)
          if (payload.eventType === 'DELETE') return prev.filter((v) => v.id !== payload.old.id)
          return prev
        })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants' }, (payload) => {
        setParticipants((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [currentUser])

  const ranked = rankTapas(participants, votes)
  const badges = computeBadges(ranked)

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

  function renderScreen() {
    if (screen === 'home') {
      return (
        <HomeScreen
          currentUser={currentUser}
          badges={badges}
          onNavigateTapa={(tapaCreator) => navigate('detail', tapaCreator)}
        />
      )
    }
    if (screen === 'detail') {
      return (
        <TapaDetailScreen
          tapaCreator={selectedTapa}
          currentUser={currentUser}
          badges={badges}
          onBack={() => navigate('home')}
        />
      )
    }
    if (screen === 'vote') {
      return (
        <VoteScreen
          currentUser={currentUser}
          onNavigateTapa={(tapaCreator) => navigate('detail', tapaCreator)}
        />
      )
    }
    if (screen === 'results') {
      return (
        <ResultsScreen
          participants={participants}
          votes={votes}
          onReset={() => {
            setCurrentUser(null)
            setParticipants([])
            setVotes([])
            setScreen('home')
            setSelectedTapa(null)
          }}
        />
      )
    }
    return null
  }

  const navScreen = screen === 'detail' ? 'home' : screen

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
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav screen={navScreen} onNavigate={navigate} />
    </div>
  )
}
