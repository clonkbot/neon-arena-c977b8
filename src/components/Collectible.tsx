import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CollectibleProps {
  id: string
  position: [number, number, number]
}

export function Collectible({ id, position }: CollectibleProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const outerRef = useRef<THREE.Mesh>(null!)

  const randomOffset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime + randomOffset.current

    // Float up and down
    groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.3

    // Rotate
    if (innerRef.current) {
      innerRef.current.rotation.x = time * 2
      innerRef.current.rotation.y = time * 3
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = -time * 1.5
      outerRef.current.rotation.z = time * 2
    }

    // Pulse scale
    const scale = 1 + Math.sin(time * 4) * 0.15
    groupRef.current.scale.setScalar(scale)
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Inner crystal */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffff00"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer frame */}
      <mesh ref={outerRef}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff6600"
          emissiveIntensity={1}
          wireframe
        />
      </mesh>

      {/* Particle ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.8, 16]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight color="#ffaa00" intensity={2} distance={5} />
    </group>
  )
}
