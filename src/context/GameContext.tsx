import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

export interface Player {
  id: string
  name: string
  color: string
  score: number
  position: [number, number, number]
  isHuman: boolean
}

interface GameContextType {
  gameState: 'idle' | 'playing' | 'ended'
  players: Player[]
  timeLeft: number
  collectibles: Array<{ id: string; position: [number, number, number]; collected: boolean }>
  startGame: () => void
  resetGame: () => void
  updatePlayerScore: (id: string, amount: number) => void
  updatePlayerPosition: (id: string, position: [number, number, number]) => void
  collectItem: (itemId: string, playerId: string) => void
}

const GameContext = createContext<GameContextType | null>(null)

const AI_NAMES = ['NEXUS-7', 'CIPHER_X', 'VOLT.EXE', 'QUANTUM_9', 'BLAZE_AI']
const PLAYER_COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#ff6600', '#00ff66', '#ff0066']

const generateCollectibles = () => {
  const items = []
  for (let i = 0; i < 15; i++) {
    items.push({
      id: `collectible-${i}`,
      position: [
        (Math.random() - 0.5) * 30,
        1,
        (Math.random() - 0.5) * 30
      ] as [number, number, number],
      collected: false
    })
  }
  return items
}

const generatePlayers = (): Player[] => {
  const players: Player[] = [
    {
      id: 'human',
      name: 'YOU',
      color: PLAYER_COLORS[0],
      score: 0,
      position: [0, 0.5, 0],
      isHuman: true
    }
  ]

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const radius = 10
    players.push({
      id: `ai-${i}`,
      name: AI_NAMES[i],
      color: PLAYER_COLORS[i + 1],
      score: 0,
      position: [
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
      ],
      isHuman: false
    })
  }

  return players
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle')
  const [players, setPlayers] = useState<Player[]>(generatePlayers())
  const [timeLeft, setTimeLeft] = useState(60)
  const [collectibles, setCollectibles] = useState(generateCollectibles())
  const timerRef = useRef<number | null>(null)

  const startGame = useCallback(() => {
    setGameState('playing')
    setTimeLeft(60)
    setPlayers(generatePlayers())
    setCollectibles(generateCollectibles())

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('ended')
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameState('idle')
    setTimeLeft(60)
    setPlayers(generatePlayers())
    setCollectibles(generateCollectibles())
  }, [])

  const updatePlayerScore = useCallback((id: string, amount: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, score: p.score + amount } : p))
    )
  }, [])

  const updatePlayerPosition = useCallback((id: string, position: [number, number, number]) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, position } : p))
    )
  }, [])

  const collectItem = useCallback((itemId: string, playerId: string) => {
    setCollectibles((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, collected: true } : c))
    )
    updatePlayerScore(playerId, 100)

    // Respawn collectible after delay
    setTimeout(() => {
      setCollectibles((prev) =>
        prev.map((c) =>
          c.id === itemId
            ? {
                ...c,
                collected: false,
                position: [
                  (Math.random() - 0.5) * 30,
                  1,
                  (Math.random() - 0.5) * 30
                ]
              }
            : c
        )
      )
    }, 3000)
  }, [updatePlayerScore])

  return (
    <GameContext.Provider
      value={{
        gameState,
        players,
        timeLeft,
        collectibles,
        startGame,
        resetGame,
        updatePlayerScore,
        updatePlayerPosition,
        collectItem
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
