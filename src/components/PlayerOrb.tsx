import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Player, useGame } from '../context/GameContext'

interface PlayerOrbProps {
  player: Player
  isPlaying: boolean
}

export function PlayerOrb({ player, isPlaying }: PlayerOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const trailRef = useRef<THREE.Points>(null!)
  const { updatePlayerPosition, collectItem, collectibles } = useGame()
  const { camera } = useThree()

  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  })

  const velocity = useRef(new THREE.Vector3())
  const position = useRef(new THREE.Vector3(...player.position))
  const trailPositions = useRef<Float32Array>(new Float32Array(300)) // 100 points * 3

  useEffect(() => {
    if (!isPlaying) {
      position.current.set(0, 0.5, 0)
      velocity.current.set(0, 0, 0)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys((prev) => ({ ...prev, forward: true }))
          break
        case 'KeyS':
        case 'ArrowDown':
          setKeys((prev) => ({ ...prev, backward: true }))
          break
        case 'KeyA':
        case 'ArrowLeft':
          setKeys((prev) => ({ ...prev, left: true }))
          break
        case 'KeyD':
        case 'ArrowRight':
          setKeys((prev) => ({ ...prev, right: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys((prev) => ({ ...prev, forward: false }))
          break
        case 'KeyS':
        case 'ArrowDown':
          setKeys((prev) => ({ ...prev, backward: false }))
          break
        case 'KeyA':
        case 'ArrowLeft':
          setKeys((prev) => ({ ...prev, left: false }))
          break
        case 'KeyD':
        case 'ArrowRight':
          setKeys((prev) => ({ ...prev, right: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPlaying])

  useFrame((state, delta) => {
    if (!meshRef.current || !isPlaying) return

    const speed = 15
    const friction = 0.92
    const maxSpeed = 12

    // Get camera direction for relative movement
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0
    cameraDirection.normalize()

    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

    // Apply forces based on keys
    if (keys.forward) {
      velocity.current.add(cameraDirection.multiplyScalar(speed * delta))
    }
    if (keys.backward) {
      velocity.current.add(cameraDirection.multiplyScalar(-speed * delta))
    }
    if (keys.left) {
      velocity.current.add(cameraRight.multiplyScalar(-speed * delta))
    }
    if (keys.right) {
      velocity.current.add(cameraRight.multiplyScalar(speed * delta))
    }

    // Apply friction
    velocity.current.multiplyScalar(friction)

    // Clamp velocity
    if (velocity.current.length() > maxSpeed) {
      velocity.current.normalize().multiplyScalar(maxSpeed)
    }

    // Update position
    position.current.add(velocity.current.clone().multiplyScalar(delta * 60))

    // Keep within bounds
    const bounds = 18
    position.current.x = THREE.MathUtils.clamp(position.current.x, -bounds, bounds)
    position.current.z = THREE.MathUtils.clamp(position.current.z, -bounds, bounds)
    position.current.y = 0.5

    meshRef.current.position.copy(position.current)

    // Update context position
    updatePlayerPosition(player.id, [
      position.current.x,
      position.current.y,
      position.current.z
    ])

    // Update trail
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array
      for (let i = positions.length - 3; i >= 3; i -= 3) {
        positions[i] = positions[i - 3]
        positions[i + 1] = positions[i - 2]
        positions[i + 2] = positions[i - 1]
      }
      positions[0] = position.current.x
      positions[1] = position.current.y
      positions[2] = position.current.z
      trailRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Check collectible collisions
    collectibles.forEach((collectible) => {
      if (collectible.collected) return
      const dist = Math.sqrt(
        Math.pow(position.current.x - collectible.position[0], 2) +
          Math.pow(position.current.z - collectible.position[2], 2)
      )
      if (dist < 1.5) {
        collectItem(collectible.id, player.id)
      }
    })

    // Animate orb
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <group>
      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={trailPositions.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={player.color}
          size={0.15}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Main orb */}
      <mesh ref={meshRef} position={player.position}>
        {/* Core */}
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={player.color}
          emissive={player.color}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow effect - positioned at player location */}
      <pointLight
        position={[position.current.x, position.current.y + 0.5, position.current.z]}
        color={player.color}
        intensity={3}
        distance={8}
      />
    </group>
  )
}
