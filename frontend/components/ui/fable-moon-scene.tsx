// fable-moon-scene.tsx
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralMoonTextures } from './lunar-texture';

interface MoonSceneProps {
  scrollProgress?: number;
  mousePos?: { x: number; y: number };
  introProgress?: number; // 0 to 1 during GSAP entrance
  isMobile?: boolean;
}

// 1. Moon Mesh with Procedural Craters and Subtle Atmosphere Rim
function Moon({ introProgress = 1, isMobile = false }: { introProgress: number; isMobile: boolean }) {
  const moonRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const textures = useMemo(() => {
    return createProceduralMoonTextures();
  }, []);

  // Responsive radius
  const moonRadius = isMobile ? 2.1 : 2.7;

  // Custom atmosphere glow shader for soft lunar rim
  const atmosphereShader = useMemo(() => {
    return {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.88, 0.88, 0.92, intensity * 0.38);
        }
      `,
    };
  }, []);

  useFrame((state, delta) => {
    // Subtle breathing/floating oscillation
    if (moonRef.current) {
      moonRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.06;
    }
  });

  return (
    <group scale={introProgress}>
      {/* Primary Moon Sphere */}
      <mesh ref={moonRef} castShadow receiveShadow>
        <sphereGeometry args={[moonRadius, 64, 64]} />
        <meshStandardMaterial
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={0.07}
          roughness={0.92}
          metalness={0.06}
          color="#d4d4d8"
        />
      </mesh>

      {/* Atmospheric Rim Glow (Faint greyscale halo) */}
      <mesh ref={atmosphereRef} scale={1.045}>
        <sphereGeometry args={[moonRadius, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereShader.vertexShader}
          fragmentShader={atmosphereShader.fragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// 2. Ambient Dust-Particle Ring around the Moon
function DustRing({ introProgress = 1, isMobile = false }: { introProgress: number; isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = isMobile ? 1200 : 2600;

  const { positions, colors, opacities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const op = new Float32Array(particleCount);

    const innerR = isMobile ? 2.9 : 3.8;
    const outerR = isMobile ? 4.4 : 5.8;

    for (let i = 0; i < particleCount; i++) {
      const radius = innerR + Math.random() * (outerR - innerR);
      const angle = Math.random() * Math.PI * 2;
      // Slight vertical spread
      const height = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.55);

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // Greyscale dust variation with occasional bright specs
      const brightness = 0.4 + Math.random() * 0.55;
      col[i * 3] = brightness;
      col[i * 3 + 1] = brightness;
      col[i * 3 + 2] = brightness * 1.05;

      op[i] = 0.3 + Math.random() * 0.65;
    }

    return { positions: pos, colors: col, opacities: op };
  }, [particleCount, isMobile]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <points
      ref={pointsRef}
      rotation={[Math.PI * 0.16, 0, Math.PI * 0.06]}
      scale={Math.max(0.01, introProgress)}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.035 : 0.045}
        vertexColors
        transparent
        opacity={0.75 * introProgress}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 3. Orbiting Asteroid Chunks
function OrbitingAsteroids({ isMobile = false }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = isMobile ? 12 : 24;

  const asteroids = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const radius = 3.6 + Math.random() * 2.8;
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const speed = 0.12 + Math.random() * 0.18;
      const size = 0.05 + Math.random() * 0.12;
      const yOffset = (Math.random() - 0.5) * 1.2;
      const rotSpeed = {
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
      };
      return { radius, angle, speed, size, yOffset, rotSpeed };
    });
  }, [count]);

  const asteroidRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    asteroids.forEach((ast, idx) => {
      const mesh = asteroidRefs.current[idx];
      if (mesh) {
        const currentAngle = ast.angle + t * ast.speed;
        mesh.position.x = Math.cos(currentAngle) * ast.radius;
        mesh.position.z = Math.sin(currentAngle) * ast.radius;
        mesh.position.y = ast.yOffset + Math.sin(t * 0.8 + idx) * 0.15;

        mesh.rotation.x += ast.rotSpeed.x * delta;
        mesh.rotation.y += ast.rotSpeed.y * delta;
        mesh.rotation.z += ast.rotSpeed.z * delta;
      }
    });
  });

  return (
    <group ref={groupRef} rotation={[Math.PI * 0.12, 0, -Math.PI * 0.04]}>
      {asteroids.map((ast, idx) => (
        <mesh
          key={idx}
          ref={(el) => (asteroidRefs.current[idx] = el)}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[ast.size, 0]} />
          <meshStandardMaterial
            color="#a1a1aa"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// 4. Multi-depth Starfield with Mouse & Scroll Parallax
function CosmicStarfield({
  mousePos = { x: 0, y: 0 },
  scrollProgress = 0,
}: {
  mousePos: { x: number; y: number };
  scrollProgress: number;
}) {
  const layer1Ref = useRef<THREE.Points>(null);
  const layer2Ref = useRef<THREE.Points>(null);
  const layer3Ref = useRef<THREE.Points>(null);

  // Generate 3 layers of stars
  const { layer1, layer2, layer3 } = useMemo(() => {
    const genStars = (count: number, minR: number, maxR: number, sizeMultiplier: number) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = minR + Math.random() * (maxR - minR);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        // Subtly cold / neutral white stars with occasional hint of warmth
        const choice = Math.random();
        if (choice < 0.75) {
          col[i * 3] = 0.88 + Math.random() * 0.12;
          col[i * 3 + 1] = 0.9 + Math.random() * 0.1;
          col[i * 3 + 2] = 1.0;
        } else if (choice < 0.9) {
          col[i * 3] = 1.0;
          col[i * 3 + 1] = 0.85;
          col[i * 3 + 2] = 0.75;
        } else {
          col[i * 3] = 0.7;
          col[i * 3 + 1] = 0.75;
          col[i * 3 + 2] = 0.85;
        }
      }
      return { pos, col };
    };

    return {
      layer1: genStars(2200, 45, 90, 1),
      layer2: genStars(1100, 25, 45, 1.4),
      layer3: genStars(400, 12, 25, 2),
    };
  }, []);

  useFrame((_, delta) => {
    const mx = mousePos.x * 0.08;
    const my = mousePos.y * 0.08;

    if (layer1Ref.current) {
      layer1Ref.current.rotation.y += delta * 0.008;
      layer1Ref.current.position.x = -mx * 0.5;
      layer1Ref.current.position.y = my * 0.5 + scrollProgress * 2;
    }
    if (layer2Ref.current) {
      layer2Ref.current.rotation.y += delta * 0.015;
      layer2Ref.current.position.x = -mx * 1.0;
      layer2Ref.current.position.y = my * 1.0 + scrollProgress * 3.5;
    }
    if (layer3Ref.current) {
      layer3Ref.current.rotation.y += delta * 0.025;
      layer3Ref.current.position.x = -mx * 1.8;
      layer3Ref.current.position.y = my * 1.8 + scrollProgress * 5.0;
    }
  });

  return (
    <group>
      {/* Distant dense starfield */}
      <points ref={layer1Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layer1.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[layer1.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Mid layer */}
      <points ref={layer2Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layer2.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[layer2.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          opacity={0.78}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Foreground twinkling specs */}
      <points ref={layer3Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layer3.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[layer3.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.13}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// 5. Scene Camera & Lighting Controller
function SceneController({
  scrollProgress = 0,
  introProgress = 1,
  isMobile = false,
}: {
  scrollProgress: number;
  introProgress: number;
  isMobile: boolean;
}) {
  const { camera } = useThree();

  useFrame(() => {
    // Camera gently adjusts on scroll
    const baseZ = isMobile ? 8.2 : 7.0;
    const targetZ = baseZ + scrollProgress * 1.6;
    const targetY = 0.1 - scrollProgress * 0.8;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
  });

  return (
    <>
      {/* Lighting: Strong directional keylight from top-right + subtle cool rim light */}
      <ambientLight intensity={0.12} color="#ffffff" />
      <directionalLight
        position={[8, 6, 6]}
        intensity={2.2}
        color="#ffffff"
        castShadow
      />
      {/* Soft fill light */}
      <directionalLight
        position={[-6, -4, 3]}
        intensity={0.25}
        color="#818cf8"
      />
      {/* Rim light from behind */}
      <directionalLight
        position={[-2, 5, -6]}
        intensity={0.4}
        color="#e4e4e7"
      />
    </>
  );
}

// Main Canvas Export
export function FableMoonScene({
  scrollProgress = 0,
  mousePos = { x: 0, y: 0 },
  introProgress = 1,
}: MoonSceneProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0.1, isMobile ? 8.2 : 7.0], fov: 48 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneController
          scrollProgress={scrollProgress}
          introProgress={introProgress}
          isMobile={isMobile}
        />

        {/* The interactive Moon: OrbitControls handles idle spin + toy globe drag & release seamlessly */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.65}
          rotateSpeed={0.7}
          dampingFactor={0.06}
          makeDefault
        />

        <CosmicStarfield mousePos={mousePos} scrollProgress={scrollProgress} />

        <group
          position={[0, isMobile ? 0.3 : 0, 0]}
          scale={1 - scrollProgress * 0.18}
        >
          <Moon introProgress={introProgress} isMobile={isMobile} />
          <DustRing introProgress={introProgress} isMobile={isMobile} />
          <OrbitingAsteroids isMobile={isMobile} />
        </group>
      </Canvas>
    </div>
  );
}
