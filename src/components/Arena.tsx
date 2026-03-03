import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Arena() {
  const gridRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)

  // Create grid shader material
  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#ff00ff') },
        uColor2: { value: new THREE.Color('#00ffff') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * 40.0;

          float lineX = smoothstep(0.0, 0.05, abs(fract(uv.x) - 0.5) - 0.45);
          float lineY = smoothstep(0.0, 0.05, abs(fract(uv.y) - 0.5) - 0.45);
          float grid = 1.0 - min(lineX, lineY);

          float pulse = sin(uTime * 2.0 + length(vUv - 0.5) * 10.0) * 0.5 + 0.5;
          vec3 color = mix(uColor1, uColor2, pulse);

          float dist = length(vUv - 0.5) * 2.0;
          float fade = 1.0 - smoothstep(0.3, 1.0, dist);

          gl_FragColor = vec4(color * grid * fade * 0.5, grid * fade * 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [])

  useFrame((state) => {
    gridMaterial.uniforms.uTime.value = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group>
      {/* Ground plane with grid */}
      <mesh
        ref={gridRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={gridMaterial}
      >
        <planeGeometry args={[60, 60]} />
      </mesh>

      {/* Dark base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#050010" />
      </mesh>

      {/* Arena boundary ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[18, 20, 64]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Corner pillars */}
      {[
        [15, 15],
        [15, -15],
        [-15, 15],
        [-15, -15]
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 6, 8]} />
            <meshStandardMaterial
              color="#1a0030"
              emissive={i % 2 === 0 ? '#ff00ff' : '#00ffff'}
              emissiveIntensity={0.3}
            />
          </mesh>
          <pointLight
            position={[0, 6, 0]}
            color={i % 2 === 0 ? '#ff00ff' : '#00ffff'}
            intensity={2}
            distance={15}
          />
        </group>
      ))}

      {/* Center decoration */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 2.5, 6]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}
