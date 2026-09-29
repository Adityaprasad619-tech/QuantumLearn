// src/components/canvas3d/BlochSphereScene.tsx
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { QubitState } from '../../types';
import { soundEffects } from '../../audio/soundEffects';
import { QubitFlashCard } from './QubitFlashCard';

interface BlochSphereSceneProps {
  qubitState: QubitState;
  onStateChange?: (theta: number, phi: number) => void;
  showProjections?: boolean;
  showTrajectory?: boolean;
  trajectoryHistory?: [number, number, number][];
  showFlashCard?: boolean;
}

// Landmark point definition
interface LandmarkPoint {
  label: string;
  sublabel: string;
  theta: number;
  phi: number;
  pos: [number, number, number]; // Three.js: [X, Y, Z] where Y is vertical
  color: string;
}

const LANDMARKS: LandmarkPoint[] = [
  { label: '|0⟩', sublabel: '+Z (Ground)', theta: 0, phi: 0, pos: [0, 1.05, 0], color: '#4F46E5' },
  { label: '|1⟩', sublabel: '-Z (Excited)', theta: Math.PI, phi: 0, pos: [0, -1.05, 0], color: '#4F46E5' },
  { label: '|+⟩', sublabel: '+X (Superposition)', theta: Math.PI / 2, phi: 0, pos: [1.05, 0, 0], color: '#0EA5E9' },
  { label: '|-⟩', sublabel: '-X (Superposition)', theta: Math.PI / 2, phi: Math.PI, pos: [-1.05, 0, 0], color: '#0EA5E9' },
  { label: '|+i⟩', sublabel: '+Y (Circular)', theta: Math.PI / 2, phi: Math.PI / 2, pos: [0, 0, 1.05], color: '#7C3AED' },
  { label: '|-i⟩', sublabel: '-Y (Circular)', theta: Math.PI / 2, phi: (3 * Math.PI) / 2, pos: [0, 0, -1.05], color: '#7C3AED' }
];

// Sub-component: The Animated State Vector Arrow
const AnimatedStateVector: React.FC<{
  targetTheta: number;
  targetPhi: number;
  targetR: number;
  purity: number;
  onUpdateCurrentPos?: (pos: THREE.Vector3) => void;
}> = ({ targetTheta, targetPhi, targetR, purity, onUpdateCurrentPos }) => {
  const currentTheta = useRef(targetTheta);
  const currentPhi = useRef(targetPhi);
  const currentR = useRef(targetR);

  const shaftRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const beadRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Smooth spherical interpolation
    const lerpSpeed = Math.min(1, delta * 9);

    currentTheta.current += (targetTheta - currentTheta.current) * lerpSpeed;

    // Handle phi wrap-around shortest arc
    let diffPhi = targetPhi - currentPhi.current;
    while (diffPhi > Math.PI) diffPhi -= 2 * Math.PI;
    while (diffPhi < -Math.PI) diffPhi += 2 * Math.PI;
    currentPhi.current += diffPhi * lerpSpeed;

    currentR.current += (targetR - currentR.current) * lerpSpeed;

    const t = currentTheta.current;
    const p = currentPhi.current;
    const r = Math.max(0.01, Math.min(1.0, currentR.current));

    // Three coordinates: X = r*sin(t)*cos(p), Y = r*cos(t), Z = r*sin(t)*sin(p)
    const tipX = r * Math.sin(t) * Math.cos(p);
    const tipY = r * Math.cos(t);
    const tipZ = r * Math.sin(t) * Math.sin(p);
    const tipPos = new THREE.Vector3(tipX, tipY, tipZ);

    if (onUpdateCurrentPos) {
      onUpdateCurrentPos(tipPos);
    }

    // Position the tip bead and glow
    if (beadRef.current) {
      beadRef.current.position.set(tipX, tipY, tipZ);
    }
    if (glowRef.current) {
      glowRef.current.position.set(tipX, tipY, tipZ);
    }

    // Position and orient the cylinder shaft
    if (shaftRef.current) {
      const halfPos = tipPos.clone().multiplyScalar(0.5);
      shaftRef.current.position.copy(halfPos);
      const len = tipPos.length();
      shaftRef.current.scale.set(1, Math.max(0.01, len), 1);
      shaftRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tipPos.clone().normalize());
    }

    // Position and orient the cone arrowhead
    if (coneRef.current) {
      const coneOffset = tipPos.clone().multiplyScalar(0.92);
      coneRef.current.position.copy(coneOffset);
      coneRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tipPos.clone().normalize());
    }
  });

  const arrowColor = purity < 0.95 ? '#D97706' : '#4F46E5';

  return (
    <group>
      {/* Cylinder shaft */}
      <mesh ref={shaftRef}>
        <cylinderGeometry args={[0.024, 0.024, 1, 16]} />
        <meshStandardMaterial
          color={arrowColor}
          roughness={0.2}
          metalness={0.7}
          emissive={arrowColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Cone arrowhead */}
      <mesh ref={coneRef}>
        <coneGeometry args={[0.075, 0.18, 16]} />
        <meshStandardMaterial
          color={arrowColor}
          roughness={0.15}
          metalness={0.8}
          emissive={arrowColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Tip bead */}
      <mesh ref={beadRef}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#F59E0B"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Outer pulsing glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial
          color="#818CF8"
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
};

// Sub-component: Coordinate Grid with Latitudes & Longitudes
const CoordinateGrid: React.FC = () => {
  // Equator
  const equatorLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#64748B', linewidth: 2, transparent: true, opacity: 0.8 });
    return new THREE.Line(geo, mat);
  }, []);

  // Latitudes (+45 deg, -45 deg)
  const lat45Top = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = Math.cos(Math.PI / 4);
    const y = Math.sin(Math.PI / 4);
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color: '#94A3B8', dashSize: 0.04, gapSize: 0.04, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, []);

  const lat45Bottom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = Math.cos(Math.PI / 4);
    const y = -Math.sin(Math.PI / 4);
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color: '#94A3B8', dashSize: 0.04, gapSize: 0.04, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, []);

  // Meridians (XZ and YZ)
  const meridianXZ = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#CBD5E1', transparent: true, opacity: 0.6 });
    return new THREE.Line(geo, mat);
  }, []);

  const meridianYZ = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(0, Math.sin(a), Math.cos(a)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#CBD5E1', transparent: true, opacity: 0.6 });
    return new THREE.Line(geo, mat);
  }, []);

  return (
    <group>
      <primitive object={equatorLine} />
      <primitive object={lat45Top} />
      <primitive object={lat45Bottom} />
      <primitive object={meridianXZ} />
      <primitive object={meridianYZ} />
    </group>
  );
};

// Sub-component: Coordinate Axes with Bold Colors & Arrows
const CoordinateAxes: React.FC = () => {
  return (
    <group>
      {/* Z Axis (Vertical) - Royal Indigo */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 2.7, 16]} />
        <meshStandardMaterial color="#4F46E5" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* +Z Arrow */}
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.04, 0.1, 16]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>

      {/* X Axis (Front-Back) - Sky Blue */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 2.7, 16]} />
        <meshStandardMaterial color="#0EA5E9" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* +X Arrow */}
      <mesh position={[1.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.1, 16]} />
        <meshStandardMaterial color="#0EA5E9" />
      </mesh>

      {/* Y Axis (Right-Left) - Violet */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 2.7, 16]} />
        <meshStandardMaterial color="#7C3AED" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* +Y Arrow */}
      <mesh position={[0, 0, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.1, 16]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
    </group>
  );
};

// Sub-component: Clickable Landmark Points on the Sphere
const LandmarkPins: React.FC<{
  onSelect: (theta: number, phi: number) => void;
}> = ({ onSelect }) => {
  return (
    <group>
      {LANDMARKS.map((lm) => (
        <group key={lm.label} position={lm.pos}>
          {/* Clickable 3D marker sphere */}
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playGateClick();
              onSelect(lm.theta, lm.phi);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color={lm.color}
              emissive={lm.color}
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>

          {/* HTML Label Badge */}
          <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.94)',
              border: `1.5px solid ${lm.color}`,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              color: '#0F172A',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}>
              {lm.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

// Sub-component: Interactive Equatorial Ring with Tick Marks
const EquatorialTicks: React.FC<{
  onSelect: (theta: number, phi: number) => void;
}> = ({ onSelect }) => {
  const ticks = [
    { phi: 0, label: '0°' },
    { phi: Math.PI / 4, label: '45°' },
    { phi: Math.PI / 2, label: '90°' },
    { phi: (3 * Math.PI) / 4, label: '135°' },
    { phi: Math.PI, label: '180°' },
    { phi: (5 * Math.PI) / 4, label: '225°' },
    { phi: (3 * Math.PI) / 2, label: '270°' },
    { phi: (7 * Math.PI) / 4, label: '315°' }
  ];

  return (
    <group>
      {ticks.map((t) => {
        const x = Math.cos(t.phi);
        const z = Math.sin(t.phi);
        return (
          <mesh
            key={t.label}
            position={[x, 0, z]}
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playGateClick();
              onSelect(Math.PI / 2, t.phi);
            }}
          >
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#94A3B8" />
          </mesh>
        );
      })}
    </group>
  );
};

// Main Scene Inside Canvas
const SceneContent: React.FC<{
  qubitState: QubitState;
  onSelectState: (theta: number, phi: number) => void;
  showProjections: boolean;
  showTrajectory: boolean;
  trajectoryHistory?: [number, number, number][];
}> = ({
  qubitState,
  onSelectState,
  showProjections,
  showTrajectory,
  trajectoryHistory = []
}) => {
  const [currentTipPos, setCurrentTipPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 1, 0));

  const targetR = qubitState.bloch.purity > 0.98
    ? 1.0
    : Math.sqrt(qubitState.bloch.x ** 2 + qubitState.bloch.y ** 2 + qubitState.bloch.z ** 2);

  // Surface click handler: click anywhere on the sphere to set the state!
  const handleSphereClick = (e: any) => {
    e.stopPropagation();
    if (!e.point) return;
    const pt = e.point.clone().normalize();
    // Invert mapping:
    // Three.X = sin(theta)*cos(phi)
    // Three.Y = cos(theta)
    // Three.Z = sin(theta)*sin(phi)
    const newTheta = Math.acos(Math.max(-1, Math.min(1, pt.y)));
    let newPhi = Math.atan2(pt.z, pt.x);
    if (newPhi < 0) newPhi += 2 * Math.PI;

    soundEffects.playGateClick();
    onSelectState(newTheta, newPhi);
  };

  const trailLine = useMemo(() => {
    if (trajectoryHistory.length < 2) return null;
    const pts = trajectoryHistory.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#EC4899', linewidth: 3, transparent: true, opacity: 0.85 });
    return new THREE.Line(geo, mat);
  }, [trajectoryHistory]);

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 6]} intensity={1.0} />
      <directionalLight position={[-5, -4, -4]} intensity={0.4} />

      {/* Main Glass Sphere with click-to-pick capability */}
      <mesh
        onClick={handleSphereClick}
        onPointerOver={() => { document.body.style.cursor = 'crosshair'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#F8FAFC"
          transmission={0.88}
          opacity={0.32}
          transparent
          roughness={0.12}
          metalness={0.05}
          ior={1.25}
          thickness={0.4}
        />
      </mesh>

      {/* Coordinate Rings & Cartesian Axes */}
      <CoordinateGrid />
      <CoordinateAxes />

      {/* Clickable Landmark Pins */}
      <LandmarkPins onSelect={onSelectState} />
      <EquatorialTicks onSelect={onSelectState} />

      {/* Animated State Vector Arrow with zero quaternion singularity */}
      <AnimatedStateVector
        targetTheta={qubitState.bloch.theta}
        targetPhi={qubitState.bloch.phi}
        targetR={targetR}
        purity={qubitState.bloch.purity}
        onUpdateCurrentPos={setCurrentTipPos}
      />

      {/* Projection Lines to Z Axis and XY Plane */}
      {showProjections && (
        <group>
          {/* Vertical drop line to vertical axis */}
          <line>
            <bufferGeometry
              attach="geometry"
              {...new THREE.BufferGeometry().setFromPoints([
                currentTipPos,
                new THREE.Vector3(0, currentTipPos.y, 0)
              ])}
            />
            <lineBasicMaterial attach="material" color="#6366F1" transparent opacity={0.65} />
          </line>
          {/* Horizontal drop line to equatorial plane */}
          <line>
            <bufferGeometry
              attach="geometry"
              {...new THREE.BufferGeometry().setFromPoints([
                currentTipPos,
                new THREE.Vector3(currentTipPos.x, 0, currentTipPos.z)
              ])}
            />
            <lineBasicMaterial attach="material" color="#0EA5E9" transparent opacity={0.65} />
          </line>
        </group>
      )}

      {/* Trajectory Ribbon */}
      {showTrajectory && trailLine && <primitive object={trailLine} />}
    </>
  );
};

export const BlochSphereScene: React.FC<BlochSphereSceneProps> = ({
  qubitState,
  onStateChange,
  showProjections = true,
  showTrajectory = true,
  trajectoryHistory = [],
  showFlashCard = false
}) => {
  const controlsRef = useRef<any>(null);
  const [flashCardOpen, setFlashCardOpen] = useState<boolean>(true);

  const handleSelectState = (theta: number, phi: number) => {
    if (onStateChange) {
      onStateChange(theta, phi);
    }
  };

  const resetCamera = (preset: 'isometric' | 'top' | 'front' | 'side' | 'bottom') => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;

    switch (preset) {
      case 'top':
        ctrl.object.position.set(0, 3.6, 0.001);
        break;
      case 'bottom':
        ctrl.object.position.set(0, -3.6, 0.001);
        break;
      case 'front':
        ctrl.object.position.set(3.6, 0, 0);
        break;
      case 'side':
        ctrl.object.position.set(0, 0, 3.6);
        break;
      case 'isometric':
      default:
        ctrl.object.position.set(2.5, 2.0, 2.5);
        break;
    }
    ctrl.target.set(0, 0, 0);
    ctrl.update();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100%',
      background: '#FAFAF8',
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* 3D CANVAS AREA (COMPLETE 3D VIEW - NOTHING COVERING SPHERE) */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <Canvas
          camera={{ position: [2.5, 2.0, 2.5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <SceneContent
            qubitState={qubitState}
            onSelectState={handleSelectState}
            showProjections={showProjections}
            showTrajectory={showTrajectory}
            trajectoryHistory={trajectoryHistory}
          />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={1.6}
            maxDistance={6.0}
          />
        </Canvas>

        {/* 3D Camera Preset Orientation Toolbar (Bottom Left) */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          zIndex: 10
        }}>
          <button
            onClick={() => resetCamera('isometric')}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600
            }}
            title="Isometric perspective view"
          >
            3D Iso
          </button>
          <button
            onClick={() => resetCamera('top')}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="View from Top (|0⟩ North Pole)"
          >
            Top (|0⟩)
          </button>
          <button
            onClick={() => resetCamera('front')}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="View from Front (|+⟩ Equator)"
          >
            Front (|+⟩)
          </button>
          <button
            onClick={() => resetCamera('side')}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="View from Side (|+i⟩ Equator)"
          >
            Side (|+i⟩)
          </button>
          <button
            onClick={() => resetCamera('bottom')}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              color: '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="View from Bottom (|1⟩ South Pole)"
          >
            Bottom (|1⟩)
          </button>
        </div>

        {/* Side Flashcard Toggle Control (Top Right) */}
        {showFlashCard && (
          <button
            onClick={() => setFlashCardOpen(!flashCardOpen)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              zIndex: 10,
              transition: 'all 0.15s ease'
            }}
            title={flashCardOpen ? 'Hide Flash Card (Full 3D View)' : 'Show State Flash Card'}
          >
            <span>📇 Flash Card</span>
            <span style={{ fontSize: '9px', color: '#64748B' }}>{flashCardOpen ? '✕' : '▸'}</span>
          </button>
        )}
      </div>

      {/* DEDICATED FLASH CARD ON THE SIDE (NOT ABOVE SPHERE) */}
      {showFlashCard && flashCardOpen && (
        <div style={{
          width: '270px',
          flexShrink: 0,
          borderLeft: '1px solid #E2E8F0',
          background: '#FFFFFF',
          padding: '12px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          <QubitFlashCard
            qubitState={qubitState}
            onSelectState={handleSelectState}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};
