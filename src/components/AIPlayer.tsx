import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player, useGame } from '../context/GameContext'

interface AIPlayerProps {
  player: Player
  isPlaying: boolean
}

export function AIPlayer({ player, isPlaying }: AIPlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const trailRef = useRef<THREE.Points>(null!)
  const { updatePlayerPosition, collectItem, collectibles } = useGame()

  const velocity = useRef(new THREE.Vector3())
  const position = useRef(new THREE.Vector3(...player.position))
  const targetCollectible = useRef<string | null>(null)
  const randomOffset = useRef(Math.random() * Math.PI * 2)
  const trailPositions = useRef<Float32Array>(new Float32Array(150)) // 50 points * 3

  useEffect(() => {
    if (!isPlaying) {
      const angle = Math.random() * Math.PI * 2
      const radius = 10
      position.current.set(
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
      )
      velocity.current.set(0, 0, 0)
    }
  }, [isPlaying])

  useFrame((state, delta) => {
    if (!meshRef.current || !isPlaying) return

    const speed = 6 + Math.sin(state.clock.elapsedTime + randomOffset.current) * 2
    const friction = 0.95
    const maxSpeed = 8

    // Find nearest uncollected collectible
    let nearestDist = Infinity
    let nearestCollectible: { id: string; position: [number, number, number]; collected: boolean } | null = null

    collectibles.forEach((c) => {
      if (c.collected) return
      const dist = Math.sqrt(
        Math.pow(position.current.x - c.position[0], 2) +
          Math.pow(position.current.z - c.position[2], 2)
      )
      if (dist < nearestDist) {
        nearestDist = dist
        nearestCollectible = c
      }
    })

    if (nearestCollectible !== null) {
      const nc = nearestCollectible as { position: [number, number, number] }
      const target = new THREE.Vector3(
        nc.position[0],
        0.5,
        nc.position[2]
      )

      // Add some randomness to movement
      const wobble = new THREE.Vector3(
        Math.sin(state.clock.elapsedTime * 3 + randomOffset.current) * 0.3,
        0,
        Math.cos(state.clock.elapsedTime * 2 + randomOffset.current) * 0.3
      )

      const direction = target.sub(position.current).normalize().add(wobble).normalize()
      velocity.current.add(direction.multiplyScalar(speed * delta))
    } else {
      // Wander if no collectibles
      const wanderAngle = state.clock.elapsedTime * 0.5 + randomOffset.current
      const wanderDir = new THREE.Vector3(
        Math.cos(wanderAngle),
        0,
        Math.sin(wanderAngle)
      )
      velocity.current.add(wanderDir.multiplyScalar(speed * delta * 0.5))
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
    const bounds = 17
    if (Math.abs(position.current.x) > bounds) {
      position.current.x = Math.sign(position.current.x) * bounds
      velocity.current.x *= -0.5
    }
    if (Math.abs(position.current.z) > bounds) {
      position.current.z = Math.sign(position.current.z) * bounds
      velocity.current.z *= -0.5
    }
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
      if (dist < 1.2) {
        collectItem(collectible.id, player.id)
      }
    })

    // Animate orb
    const scale = 0.8 + Math.sin(state.clock.elapsedTime * 4 + randomOffset.current) * 0.1
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <group>
      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={trailPositions.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={player.color}
          size={0.1}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Main orb */}
      <mesh ref={meshRef} position={player.position}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial
          color={player.color}
          emissive={player.color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Light */}
      <pointLight
        position={[position.current.x, position.current.y + 0.5, position.current.z]}
        color={player.color}
        intensity={2}
        distance={6}
      />
    </group>
  )
}
