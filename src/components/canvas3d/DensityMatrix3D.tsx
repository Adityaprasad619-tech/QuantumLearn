// src/components/canvas3d/DensityMatrix3D.tsx
import React, { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { ComplexNumber } from '../../types';

interface DensityMatrix3DProps {
  densityMatrix?: ComplexNumber[][];
  numQubits: number;
}

const DensityBar: React.FC<{
  row: number;
  col: number;
  dim: number;
  val: ComplexNumber;
  rowLabel: string;
  colLabel: string;
  onHover: (info: { rowLabel: string; colLabel: string; val: ComplexNumber } | null) => void;
}> = ({ row, col, dim, val, rowLabel, colLabel, onHover }) => {
  const height = Math.max(0.04, val.re * 2);
  const spacing = 0.7;
  const offset = ((dim - 1) * spacing) / 2;
  const x = col * spacing - offset;
  const z = row * spacing - offset;

  const isDiagonal = row === col;
  const color = isDiagonal
    ? '#4F46E5'
    : Math.abs(val.re) > 0.05
    ? '#8B5CF6'
    : '#94A3B8';

  return (
    <group position={[x, height / 2, z]}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover({ rowLabel, colLabel, val });
        }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={[0.45, height, 0.45]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.4}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Value label on top of prominent bars */}
      {Math.abs(val.re) > 0.15 && (
        <Html position={[0, height / 2 + 0.18, 0]} center distanceFactor={8}>
          <div style={{
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '1px 3px',
            borderRadius: '2px',
            border: '1px solid #CBD5E1',
            color: '#1E293B',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            {val.re.toFixed(2)}
          </div>
        </Html>
      )}
    </group>
  );
};

export const DensityMatrix3D: React.FC<DensityMatrix3DProps> = ({
  densityMatrix,
  numQubits
}) => {
  const controlsRef = useRef<any>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ rowLabel: string; colLabel: string; val: ComplexNumber } | null>(null);

  const dim = 1 << numQubits;
  const bitLabels = useMemo(() => {
    return Array.from({ length: dim }, (_, i) => i.toString(2).padStart(numQubits, '0'));
  }, [dim, numQubits]);

  const resetCamera = (preset: 'isometric' | 'top' | 'side') => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    if (preset === 'top') {
      ctrl.object.position.set(0, 5.5, 0.001);
    } else if (preset === 'side') {
      ctrl.object.position.set(5.5, 1.2, 0);
    } else {
      ctrl.object.position.set(3, 3.5, 3.5);
    }
    ctrl.target.set(0, 0, 0);
    ctrl.update();
  };

  if (!densityMatrix || densityMatrix.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666666', fontSize: '13px' }}>
        No density matrix data available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px', background: '#FAFAF8' }}>
      <Canvas camera={{ position: [3, 3.5, 3.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={0.9} />
        <directionalLight position={[-4, 2, -3]} intensity={0.3} />

        {/* Base Grid Plane */}
        <gridHelper args={[dim * 0.9, dim, '#CBD5E1', '#E2E8F0']} position={[0, 0, 0]} />

        {/* 3D Quantum State Bars */}
        {densityMatrix.slice(0, Math.min(8, dim)).map((row, r) =>
          row.slice(0, Math.min(8, dim)).map((val, c) => (
            <DensityBar
              key={`${r}-${c}`}
              row={r}
              col={c}
              dim={Math.min(8, dim)}
              val={val}
              rowLabel={bitLabels[r] || `${r}`}
              colLabel={bitLabels[c] || `${c}`}
              onHover={setHoveredInfo}
            />
          ))
        )}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.8}
          maxDistance={9.0}
        />
      </Canvas>

      {/* Camera Presets */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        display: 'flex',
        gap: '4px',
        background: 'rgba(255, 255, 255, 0.94)',
        padding: '3px 6px',
        borderRadius: '6px',
        border: '1px solid #E2E8F0',
        fontSize: '11px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        zIndex: 10
      }}>
        <button
          onClick={() => resetCamera('isometric')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 600, padding: '2px 6px' }}
        >
          3D Iso
        </button>
        <button
          onClick={() => resetCamera('top')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px 6px' }}
        >
          Top View
        </button>
        <button
          onClick={() => resetCamera('side')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px 6px' }}
        >
          Side View
        </button>
      </div>

      {/* Hover Information Tooltip */}
      {hoveredInfo && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#1E293B',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 10
        }}>
          <div><strong>ρ(|{hoveredInfo.rowLabel}⟩⟨{hoveredInfo.colLabel}|)</strong></div>
          <div style={{ color: '#4F46E5', marginTop: '2px' }}>
            Re = {hoveredInfo.val.re.toFixed(3)}, Im = {hoveredInfo.val.im.toFixed(3)}
          </div>
        </div>
      )}
    </div>
  );
};
