import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'
import { PlayerOrb } from './PlayerOrb'
import { AIPlayer } from './AIPlayer'
import { Collectible } from './Collectible'
import { Arena } from './Arena'

interface GameSceneProps {
  isPlaying: boolean
}

export function GameScene({ isPlaying }: GameSceneProps) {
  const { players, collectibles } = useGame()
  const humanPlayer = players.find((p) => p.isHuman)
  const aiPlayers = players.filter((p) => !p.isHuman)

  return (
    <group>
      <Arena />

      {/* Human player */}
      {humanPlayer && (
        <PlayerOrb
          player={humanPlayer}
          isPlaying={isPlaying}
        />
      )}

      {/* AI players */}
      {aiPlayers.map((player) => (
        <AIPlayer
          key={player.id}
          player={player}
          isPlaying={isPlaying}
        />
      ))}

      {/* Collectibles */}
      {collectibles
        .filter((c) => !c.collected)
        .map((collectible) => (
          <Collectible
            key={collectible.id}
            id={collectible.id}
            position={collectible.position}
          />
        ))}
    </group>
  )
}
