import { useGame } from '../context/GameContext'

interface UIProps {
  showInstructions: boolean
  onStart: () => void
  onReset: () => void
}

export function UI({ showInstructions, onStart, onReset }: UIProps) {
  const { gameState, players, timeLeft } = useGame()

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const humanPlayer = players.find((p) => p.isHuman)

  return (
    <>
      {/* Start/Instructions Screen */}
      {showInstructions && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center p-6 md:p-8 max-w-md mx-4">
            {/* Title */}
            <h1
              className="text-4xl md:text-6xl font-black mb-2 tracking-tighter"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255,0,255,0.5)'
              }}
            >
              NEON ARENA
            </h1>
            <p
              className="text-sm md:text-base text-cyan-300/80 mb-8 tracking-[0.3em] uppercase"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Multiplayer Energy Hunt
            </p>

            {/* Instructions */}
            <div className="space-y-4 mb-8 text-left">
              <div className="bg-white/5 border border-cyan-500/30 rounded-lg p-4">
                <h3
                  className="text-cyan-400 font-bold mb-2 text-sm tracking-wider"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  OBJECTIVE
                </h3>
                <p className="text-white/70 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  Collect glowing energy cubes to score points. Compete against 4 AI players. Highest score after 60 seconds wins!
                </p>
              </div>

              <div className="bg-white/5 border border-fuchsia-500/30 rounded-lg p-4">
                <h3
                  className="text-fuchsia-400 font-bold mb-2 text-sm tracking-wider"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  CONTROLS
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  <span className="text-white/50">Movement</span>
                  <span className="text-white/90">WASD / Arrow Keys</span>
                  <span className="text-white/50">Camera</span>
                  <span className="text-white/90">Click + Drag</span>
                  <span className="text-white/50">Zoom</span>
                  <span className="text-white/90">Scroll Wheel</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={onStart}
              className="relative px-10 py-4 text-lg font-bold tracking-wider uppercase transition-all duration-300 group"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span className="relative z-10 text-black">START GAME</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-sm blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'ended' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-6 md:p-8 max-w-md mx-4">
            <h2
              className="text-3xl md:text-5xl font-black mb-4 tracking-tight"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                color: sortedPlayers[0]?.isHuman ? '#00ffff' : '#ff00ff'
              }}
            >
              {sortedPlayers[0]?.isHuman ? 'VICTORY!' : 'GAME OVER'}
            </h2>

            <p
              className="text-lg text-white/60 mb-6"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {sortedPlayers[0]?.isHuman
                ? 'You dominated the arena!'
                : `${sortedPlayers[0]?.name} wins with ${sortedPlayers[0]?.score} points`}
            </p>

            {/* Final Leaderboard */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <h3
                className="text-white/50 text-xs tracking-widest mb-3"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                FINAL STANDINGS
              </h3>
              <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-2 px-3 rounded"
                    style={{
                      background: player.isHuman ? 'rgba(0,255,255,0.1)' : 'transparent',
                      borderLeft: `3px solid ${player.color}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-white/40 text-sm w-6"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >
                        #{index + 1}
                      </span>
                      <span
                        className={`text-sm ${player.isHuman ? 'text-cyan-300' : 'text-white/70'}`}
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        {player.name}
                      </span>
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        color: player.color
                      }}
                    >
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onReset}
              className="relative px-8 py-3 text-base font-bold tracking-wider uppercase transition-all duration-300 group"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span className="relative z-10 text-black">PLAY AGAIN</span>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-cyan-400 rounded-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-cyan-400 rounded-sm blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
            </button>
          </div>
        </div>
      )}

      {/* In-Game HUD */}
      {gameState === 'playing' && (
        <>
          {/* Timer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div
              className="px-6 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full"
              style={{
                boxShadow: timeLeft <= 10 ? '0 0 20px rgba(255,0,0,0.5)' : '0 0 20px rgba(0,255,255,0.2)'
              }}
            >
              <span
                className={`text-2xl md:text-3xl font-black tracking-wider ${
                  timeLeft <= 10 ? 'text-red-400' : 'text-white'
                }`}
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Player Score */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 md:p-4">
              <p
                className="text-cyan-400/60 text-xs tracking-widest mb-1"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                YOUR SCORE
              </p>
              <p
                className="text-2xl md:text-3xl font-black text-cyan-400"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {humanPlayer?.score || 0}
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 md:p-4 min-w-[140px] md:min-w-[180px]">
              <p
                className="text-white/40 text-xs tracking-widest mb-2"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                LEADERBOARD
              </p>
              <div className="space-y-1">
                {sortedPlayers.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between text-xs md:text-sm"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ background: player.color, boxShadow: `0 0 8px ${player.color}` }}
                      />
                      <span className={player.isHuman ? 'text-cyan-300 font-bold' : 'text-white/70'}>
                        {player.name}
                      </span>
                    </div>
                    <span className="text-white font-bold">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Controls Hint */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 md:hidden">
            <p className="text-white/30 text-xs text-center" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Use on-screen joystick or<br />rotate device to landscape
            </p>
          </div>
        </>
      )}
    </>
  )
}
