import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import { Suspense, useState, useCallback } from 'react'
import { GameScene } from './components/GameScene'
import { UI } from './components/UI'
import { GameProvider, useGame } from './context/GameContext'

function AppContent() {
  const { gameState, startGame, resetGame } = useGame()
  const [showInstructions, setShowInstructions] = useState(true)

  const handleStart = useCallback(() => {
    setShowInstructions(false)
    startGame()
  }, [startGame])

  const handleReset = useCallback(() => {
    setShowInstructions(true)
    resetGame()
  }, [resetGame])

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#0a0015] z-0" />

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        className="absolute inset-0 z-5"
        camera={{ position: [0, 15, 20], fov: 60 }}
        shadows
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#0a0015', 20, 80]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 20, 0]} intensity={1} color="#ff00ff" />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff6600" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <GameScene isPlaying={gameState === 'playing'} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={10}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.2}
            enableDamping
            dampingFactor={0.05}
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <UI
        showInstructions={showInstructions}
        onStart={handleStart}
        onReset={handleReset}
      />

      {/* Footer */}
      <footer className="absolute bottom-3 left-0 right-0 z-30 text-center">
        <p className="text-[10px] md:text-xs text-white/30 tracking-widest font-light">
          Requested by <span className="text-cyan-400/50">@Jhordanps</span> · Built by <span className="text-fuchsia-400/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
