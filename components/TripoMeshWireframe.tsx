/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
*/

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Cpu, RefreshCw, Layers } from 'lucide-react';

interface Props {
  originalQuery: string;
  activeVariant: string;
  addLog: (msg: string) => void;
  snapToGrid?: 'off' | '15' | '45';
}

export const TripoMeshWireframe: React.FC<Props> = ({
  originalQuery,
  activeVariant,
  addLog,
  snapToGrid = 'off',
}) => {
  const [orbitSpeed, setOrbitSpeed] = useState<number>(30);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [meshFormat, setMeshFormat] = useState<'glb' | 'gltf'>('glb');
  const [rotAngle, setRotAngle] = useState<number>(0);
  const [nodeSize, setNodeSize] = useState<number>(4);

  // Animated rotation calculation
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setRotAngle(prev => (prev + orbitSpeed * delta) % 360);
      frameId = requestAnimationFrame(tick);
    };
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [orbitSpeed]);

  const handleCleanup = () => {
    setIsCleaning(true);
    addLog("TRIPO3D // STORM CLEANUP SHADER ENGAGED");
    setTimeout(() => {
      setIsCleaning(false);
      addLog("TRIPO3D // TOPOLOGY OPTIMIZED: 12,450 TRIS REDUCED TO 8,240 TRIS");
    }, 1800);
  };

  const handleDownload = () => {
    const docContent = `TRIPO3D HIGH FIDELITY EXPORT MESH
===================================
Source Relic: ${originalQuery || "Generic Relic"}
Variant: ${activeVariant}
Format: ${meshFormat.toUpperCase()}
Vertex Count: 14,832
Indices: 24,904
Calibration: Arcane Industrial Master v3`;
    
    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `tripo3d_model_${Date.now()}.${meshFormat}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addLog(`TRIPO3D // MESH EXPORT DOWNLOADED: ${meshFormat.toUpperCase()}`);
  };

  // Pre-compiled points for SVG 3D-ish rotation projection (rotating hyper-cube/ring wireframe)
  const renderInteractiveMesh = () => {
    let displayAngle = rotAngle;
    if (snapToGrid === '15') {
      displayAngle = Math.round(rotAngle / 15) * 15;
    } else if (snapToGrid === '45') {
      displayAngle = Math.round(rotAngle / 45) * 45;
    }
    const angleRad = (displayAngle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Dynamic 3D coordinate vertices
    const points3D = [
      { x: -50, y: -50, z: -50 }, { x: 50, y: -50, z: -50 }, 
      { x: 50, y: 50, z: -50 }, { x: -50, y: 50, z: -50 },
      { x: -50, y: -50, z: 50 }, { x: 50, y: -50, z: 50 }, 
      { x: 50, y: 50, z: 50 }, { x: -50, y: 50, z: 50 },
      { x: 0, y: -80, z: 0 }, { x: 0, y: 80, z: 0 } // Apex items
    ];

    // Project points with simple matrix rotation on Y and X axes (fixed slight lock angle for elevation)
    const elevAngle = (25 * Math.PI) / 180;
    const cosE = Math.cos(elevAngle);
    const sinE = Math.sin(elevAngle);

    const projected = points3D.map(p => {
      // Y-axis rotation first
      const x1 = p.x * cos - p.z * sin;
      const z1 = p.x * sin + p.z * cos;
      const y1 = p.y;

      // X-axis elevation tilt
      const y2 = y1 * cosE - z1 * sinE;
      const z2 = y1 * sinE + z1 * cosE;

      // Perspective projection factor
      const dist = 180;
      const factor = dist / (dist + z2);
      
      const screenX = 150 + x1 * factor * 1.5;
      const screenY = 110 + y2 * factor * 1.5;
      return { x: screenX, y: screenY, z: z2 };
    });

    // Outer wiring connections (indices pairs code)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Bottom loop
      [4, 5], [5, 6], [6, 7], [7, 4], // Top loop
      [0, 4], [1, 5], [2, 6], [3, 7], // Pillars
      [8, 0], [8, 1], [8, 4], [8, 5], // Top pyra
      [9, 2], [9, 3], [9, 6], [9, 7]  // Bottom pyra
    ];

    return (
      <svg className="w-full h-full max-h-[200px] md:max-h-[250px]" viewBox="0 0 300 220">
        {/* Ambient Ring coordinate trackers */}
        <circle cx="150" cy="110" r="90" fill="none" stroke="rgba(0, 242, 254, 0.08)" strokeWidth="1" strokeDasharray="5 5" />
        <circle cx="150" cy="110" r="105" fill="none" stroke="rgba(155, 81, 224, 0.05)" strokeWidth="0.5" />
        
        {/* Draw Wireframe Connections lines */}
        {connections.map(([a, b], idx) => {
          const pA = projected[a];
          const pB = projected[b];
          const maxZ = Math.max(pA.z, pB.z);
          // Darken lines according to depth depth
          const opacity = Math.max(0.12, 1 - (maxZ + 50) / 100);
          return (
            <line 
              key={idx}
              x1={pA.x}
              y1={pA.y}
              x2={pB.x}
              y2={pB.y}
              stroke={isCleaning ? "rgba(155, 81, 224, 0.8)" : "rgba(0, 242, 254, 0.55)"}
              strokeWidth={isCleaning ? "0.8" : "0.5"}
              strokeOpacity={opacity}
            />
          );
        })}

        {/* Draw Node Vertices points */}
        {projected.map((p, idx) => {
          const opacity = Math.max(0.2, 1 - (p.z + 50) / 100);
          return (
            <circle 
              key={idx}
              cx={p.x}
              cy={p.y}
              r={nodeSize}
              fill={isCleaning ? "#9b51e0" : "#00f2fe"}
              fillOpacity={opacity}
              stroke="#ffffff"
              strokeWidth="0.5"
              strokeOpacity={opacity * 0.5}
            />
          );
        })}

        {/* Center Target overlay */}
        <circle cx="150" cy="110" r="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative z-20 glass-panel-accent border border-brand-cyan/20 rounded-xl p-4 md:p-6 shadow-[0_0_50px_rgba(0,242,254,0.1)]">
      
      {/* Top Header tracking metadata info */}
      <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5 glow-cyan">
            <Cpu size={12} className="animate-pulse" />
            Tripo3D Mesh Console // Active
          </span>
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
            Modeling relic: {originalQuery || "Archived Item"}
          </span>
        </div>
        
        <div className="text-[8px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
          FPS.60 // RITUAL SPEED
        </div>
      </div>

      {/* Main 3D Orbital Projection Screen */}
      <div className="flex-1 flex flex-col md:flex-row items-center gap-4 py-2 min-h-[220px]">
        
        {/* Orbital Stage */}
        <div className="flex-1 w-full bg-black/60 rounded-lg border border-white/5 relative flex items-center justify-center p-2 min-h-[200px] overflow-hidden group">
          
          {/* Decorative tech HUD elements */}
          <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 pointer-events-none">
            Z-COORD // PROJECTED
          </div>
          <div className="absolute top-2 right-2 text-[8px] font-mono text-zinc-500 pointer-events-none">
            POLYS: {isCleaning ? "8,240 TRIS" : "12,450 TRIS"}
          </div>

          {/* Core Interactive Projection */}
          {renderInteractiveMesh()}

          {/* Scanner horizontal bar sweep during clean */}
          {isCleaning && (
            <motion.div 
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_rgba(155,81,224,0.6)]"
            />
          )}
        </div>

        {/* 3D Operational Calibration Controls */}
        <div className="w-full md:w-[130px] shrink-0 flex flex-col gap-3">
          
          {/* Controller 1: Orbit Speed */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] font-mono text-zinc-400 uppercase tracking-wider">
              <span>Orbit Rotation</span>
              <span>{orbitSpeed}°/s</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="120" 
              value={orbitSpeed}
              onChange={(e) => setOrbitSpeed(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Controller 2: Node Vertex Size */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] font-mono text-zinc-400 uppercase tracking-wider">
              <span>Node Calibration</span>
              <span>{nodeSize}px</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={nodeSize}
              onChange={(e) => setNodeSize(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* File Format Options selector */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1 block">Output Specs</span>
            <div className="grid grid-cols-2 gap-1">
              {(['glb', 'gltf'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setMeshFormat(fmt)}
                  className={`px-1 py-1 rounded text-[8px] font-mono uppercase tracking-widest text-center border font-bold transition-all ${
                    meshFormat === fmt 
                      ? 'bg-brand-cyan/20 border-cyan-400 text-cyan-200' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Cleanup button */}
          <button
            onClick={handleCleanup}
            disabled={isCleaning}
            className="w-full py-1.5 mt-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 hover:border-purple-500/80 text-[8px] font-mono uppercase tracking-[0.2em] rounded text-purple-200 flex items-center justify-center gap-1 transition-all disabled:opacity-40"
          >
            <RefreshCw size={8} className={isCleaning ? "animate-spin" : ""} />
            {isCleaning ? "OPTIMIZING..." : "STORM CLEANUP"}
          </button>
        </div>

      </div>

      {/* Footer trigger to download GLB mesh */}
      <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
          Vertex projection map // nominal
        </span>
        
        <button
          onClick={handleDownload}
          className="px-3 py-1 bg-brand-cyan hover:bg-[#00d8e4] text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded flex items-center gap-1.5 transition-colors"
        >
          <Download size={10} />
          Render & Download .{meshFormat.toUpperCase()}
        </button>
      </div>

    </div>
  );
};
