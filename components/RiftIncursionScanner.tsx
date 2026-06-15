import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Radar, Skull, RefreshCw, Radio, Shield, 
  Activity, Zap, Crosshair, Cpu, Eye, Compass, Grid
} from 'lucide-react';

interface RiftIncursionScannerProps {
  threatLevel: number;
  setThreatLevel: (val: number) => void;
  triggerRandomEncounter: () => void;
  resolveThreatState: () => void;
  addLog: (msg: string) => void;
  activeRoute: 'central' | 'basin' | 'siren';
}

interface BreachPoint {
  id: string;
  name: string;
  angle: number; // degrees
  radius: number; // percentage from center (0-100)
  type: 'swarm' | 'entropy' | 'fracture' | 'spatial';
  severity: 'low' | 'moderate' | 'critical';
  speed: number; // kn/h
  corruption: number; // percent spread
  desc: string;
}

const STATIC_BREACHES: BreachPoint[] = [
  { id: 'bp1', name: 'SEC-A3 FRONTLINE', angle: 45, radius: 35, type: 'swarm', severity: 'low', speed: 12, corruption: 18, desc: 'Rift Rat gnaw signs detected on auxiliary thermal coupler' },
  { id: 'bp2', name: 'SEC-K9 MID-RAIL', angle: 140, radius: 55, type: 'entropy', severity: 'moderate', speed: 28, corruption: 45, desc: 'Signal decay in signal router; coaxial packet fragmentation' },
  { id: 'bp3', name: 'SEC-D12 VENTURE', angle: 220, radius: 78, type: 'spatial', severity: 'critical', speed: 52, corruption: 88, desc: 'Dimensional gravity rupture; cargo crate #04 experiencing vacuum drag' },
  { id: 'bp4', name: 'SEC-S7 CAB CORE', angle: 310, radius: 22, type: 'fracture', severity: 'moderate', speed: 35, corruption: 54, desc: 'Pressure leak in warp manifold coupling joint' },
  { id: 'bp5', name: 'SEC-F5 REAR DOCK', angle: 95, radius: 85, type: 'swarm', severity: 'critical', speed: 64, corruption: 92, desc: 'Heavy biomechanical swarm nesting in electrical conduit housing' },
  { id: 'bp6', name: 'SEC-X1 OUT-POST', angle: 15, radius: 90, type: 'entropy', severity: 'critical', speed: 78, corruption: 95, desc: 'Absolute temporal bypass detected near sensor relay' },
];

export const RiftIncursionScanner: React.FC<RiftIncursionScannerProps> = ({
  threatLevel,
  setThreatLevel,
  triggerRandomEncounter,
  resolveThreatState,
  addLog,
  activeRoute,
}) => {
  const [selectedBreachId, setSelectedBreachId] = useState<string | null>(null);
  const [autoLevelPulse, setAutoLevelPulse] = useState(0);
  const [scannerViewMode, setScannerViewMode] = useState<'radar' | 'resonance'>('radar');
  const [activeProbeCoord, setActiveProbeCoord] = useState<{ x: number; y: number; resonance: number } | null>(null);

  // Periodic visual ambient ripple
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoLevelPulse((p) => (p + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Determine active breaches based on the physical threat level
  const activeBreaches = useMemo(() => {
    if (threatLevel <= 5) return [];
    if (threatLevel <= 25) return STATIC_BREACHES.slice(0, 1);
    if (threatLevel <= 45) return STATIC_BREACHES.slice(0, 2);
    if (threatLevel <= 65) return STATIC_BREACHES.slice(0, 3);
    if (threatLevel <= 85) return STATIC_BREACHES.slice(0, 4);
    return STATIC_BREACHES;
  }, [threatLevel]);

  // Select the highest-impact breach as a default selection if none, or keep selected if still active
  const selectedBreach = useMemo(() => {
    if (!selectedBreachId) {
      return activeBreaches[0] || null;
    }
    const found = activeBreaches.find(b => b.id === selectedBreachId);
    return found || activeBreaches[0] || null;
  }, [selectedBreachId, activeBreaches]);

  // Handle single spot neutralization (mini interactive sweep)
  const handleSpotClear = (id: string, name: string) => {
    addLog(`RADAR // Localized target pulse fired at node ${name}. Compressing rift fields.`);
    const reduction = Math.floor(Math.random() * 10) + 12; // 12-22% reduction
    setThreatLevel(Math.max(5, threatLevel - reduction));
    setSelectedBreachId(null);
  };

  // Helper colors for resonance heatmap grid cells
  const getCellColors = (resonance: number, isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: 'rgba(6, 182, 212, 0.75)',
        stroke: '#00ffff'
      };
    }
    if (resonance < 30) {
      const pct = resonance / 30;
      return {
        fill: `rgba(49, 46, 129, ${0.15 + pct * 0.25})`, // deep purple-blue
        stroke: `rgba(99, 102, 241, ${0.2 + pct * 0.2})`
      };
    } else if (resonance < 70) {
      const pct = (resonance - 30) / 40;
      return {
        fill: `rgba(168, 85, 247, ${0.4 + pct * 0.25})`, // violet-magenta transition
        stroke: `rgba(216, 180, 254, ${0.45 + pct * 0.25})`
      };
    } else {
      const pct = (resonance - 70) / 30;
      return {
        fill: `rgba(244, 63, 94, ${0.65 + pct * 0.25})`, // high resonance rose-coral
        stroke: `rgba(251, 113, 133, 0.95)`
      };
    }
  };

  return (
    <div className="p-4 bg-[#0a0f15] border border-zinc-800 relative flex flex-col gap-4 shadow-[inset_0_1px_8px_rgba(0,0,0,0.8)]">
      {/* Structural Corner Rivets */}
      <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-700" />
      <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-700" />
      <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-zinc-700" />
      <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-zinc-700" />
      <div className="absolute inset-0.5 border border-amber-900/10 pointer-events-none" />

      {/* Header and Threat Indicator */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
        <span className="flex items-center gap-1.5 uppercase font-mono font-bold text-zinc-350 tracking-wider">
          <Radar size={12} className={threatLevel > 75 ? "text-red-500 animate-spin-slow" : "text-purple-400"} />
          Rift Incursion Scanner
        </span>
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 font-mono text-[7px] font-black tracking-widest rounded border ${
            threatLevel > 75 
              ? "bg-red-950/40 text-red-500 border-red-800/60 animate-pulse" 
              : "bg-purple-950/20 text-purple-400 border-purple-900/40"
          }`}>
            SENSORS ACTIVE
          </span>
          <span className={`font-mono font-black text-[10px] ${
            threatLevel > 75 ? "text-red-500 animate-pulse" : "text-purple-400"
          }`}>
            {threatLevel}% INC
          </span>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-950 border border-zinc-900 font-mono text-[6.5px] tracking-widest uppercase rounded">
        <button
          onClick={() => {
            setScannerViewMode('radar');
            addLog("SCANNER // RADAR VIEW ACTIVE - INTRUSION RADIAL SYSTEM ENGAGED");
          }}
          className={`py-1 rounded text-center cursor-pointer transition-all font-black flex items-center justify-center gap-1.5 ${
            scannerViewMode === 'radar'
              ? 'bg-purple-950/50 text-purple-400 border border-purple-800/50 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <Radar size={8} />
          <span>RADAR INTRUSION</span>
        </button>
        <button
          onClick={() => {
            setScannerViewMode('resonance');
            addLog("SCANNER // RESONANCE MAP ACTIVE - SPECTRAL GRID DEPLOYED");
          }}
          className={`py-1 rounded text-center cursor-pointer transition-all font-black flex items-center justify-center gap-1.5 ${
            scannerViewMode === 'resonance'
              ? 'bg-cyan-950/50 text-cyan-455 border border-cyan-800/50 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <Grid size={8} />
          <span>RESONANCE MAP</span>
        </button>
      </div>

      {/* Main Grid Radar / Resonance Arena */}
      <div className="relative w-full aspect-square md:aspect-auto md:h-52 bg-black/80 border border-zinc-900 rounded overflow-hidden flex items-center justify-center">
        {/* Futuristic Grid Overlay background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {scannerViewMode === 'radar' ? (
          // ================= STANDARD RADAR SCANNER VIEW =================
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] overflow-visible">
            {/* Radar circle frames */}
            <circle cx="100" cy="100" r="95" fill="none" stroke="#312e81" strokeWidth="0.5" strokeDasharray="2,3" />
            <circle cx="100" cy="100" r="75" fill="none" stroke={threatLevel > 75 ? "#7f1d1d" : "#4c1d95"} strokeWidth="0.6" />
            <circle cx="100" cy="100" r="50" fill="none" stroke={threatLevel > 75 ? "#ef4444" : "#6d28d9"} strokeWidth="0.6" strokeDasharray="4,2" />
            <circle cx="100" cy="100" r="25" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
            
            {/* Central Core Signal Anchor */}
            <circle cx="100" cy="100" r="3.5" fill="#a78bfa" className="animate-pulse" />
            <circle cx="100" cy="100" r="8" fill="none" stroke="#d8b4fe" strokeWidth="0.3" opacity="0.5" />

            {/* Crosshairs & Compass ticks */}
            <line x1="100" y1="2" x2="100" y2="198" stroke="#312e81" strokeWidth="0.4" strokeDasharray="3,3" />
            <line x1="2" y1="100" x2="198" y2="100" stroke="#312e81" strokeWidth="0.4" strokeDasharray="3,3" />
            
            {/* Angle sector lines */}
            <line x1="29.29" y1="29.29" x2="170.71" y2="170.71" stroke="#1e1b4b" strokeWidth="0.3" />
            <line x1="170.71" y1="29.29" x2="29.29" y2="170.71" stroke="#1e1b4b" strokeWidth="0.3" />

            {/* TRAIN ESCORT FREIGHT LINE INTRUSION VECTORS (Dynamic visual tracks) */}
            <g opacity="0.65">
              {activeRoute === 'central' ? (
                <>
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="2,5" className="animate-[dash_10s_linear_infinite]" />
                  <path d="M 10 100 Q 100 100, 190 100" fill="none" stroke="#0891b2" strokeWidth="0.5" />
                </>
              ) : activeRoute === 'basin' ? (
                <>
                  <path 
                    d="M 10 50 Q 100 180, 190 50" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1" 
                    strokeDasharray="4,6" 
                    className="animate-[dash_8s_linear_infinite]" 
                  />
                </>
              ) : (
                <>
                  <path 
                    d="M 10 120 Q 50 20, 100 100 T 190 120" 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="1.2" 
                    strokeDasharray="3,4" 
                    className="animate-[dash_6s_linear_infinite]" 
                  />
                </>
              )}
            </g>

            {/* Sweeping laser beam line - continuous rotating scan */}
            <g className="origin-[100px_100px] animate-[spin_4.5s_linear_infinite]">
              {/* Trailing wedge of the radar sweep */}
              <path 
                d="M 100 100 L 100 5 A 95 95 0 0 1 167 33 Z" 
                fill="url(#radarGradient)" 
                opacity="0.3"
              />
              {/* Sharp leading scanner beam */}
              <line x1="100" y1="100" x2="100" y2="5" stroke={threatLevel > 75 ? "#ef4444" : "#a855f7"} strokeWidth="1.5" />
              <circle cx="100" cy="5" r="1.5" fill={threatLevel > 75 ? "#ef4444" : "#c084fc"} />
            </g>

            {/* Dynamic Active Breach Blips */}
            {activeBreaches.map((bp) => {
              const angleRad = (bp.angle * Math.PI) / 180;
              const r = (bp.radius / 100) * 90;
              const cx = 100 + r * Math.cos(angleRad);
              const cy = 100 + r * Math.sin(angleRad);
              const isSelected = selectedBreach?.id === bp.id;

              return (
                <g 
                  key={bp.id} 
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBreachId(bp.id);
                  }}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={10 + bp.corruption / 8} 
                    fill={bp.severity === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(168, 85, 247, 0.05)'} 
                    stroke={bp.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(168, 85, 247, 0.1)'} 
                    strokeWidth="0.5"
                    className="animate-pulse"
                  />

                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="6" 
                    fill="none" 
                    stroke={bp.severity === 'critical' ? '#ef4444' : bp.severity === 'moderate' ? '#f59e0b' : '#c084fc'} 
                    strokeWidth="0.8"
                    opacity="0.8"
                    className="animate-ping"
                  />

                  <line 
                    x1="100" 
                    y1="100" 
                    x2={cx} 
                    y2={cy} 
                    stroke={isSelected ? "#ec4899" : bp.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)'} 
                    strokeWidth="0.5" 
                    strokeDasharray="2,2" 
                  />

                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isSelected ? "4.5" : "3"} 
                    fill={bp.severity === 'critical' ? '#ef4444' : bp.severity === 'moderate' ? '#f59e0b' : '#c084fc'} 
                    className="transition-all duration-300"
                  />

                  {isSelected && (
                    <>
                      <circle cx={cx} cy={cy} r="8" fill="none" stroke="#ec4899" strokeWidth="1" className="animate-[pulse_1s_infinite]" />
                      <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="#ec4899" strokeWidth="0.5" />
                      <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke="#ec4899" strokeWidth="0.5" />
                    </>
                  )}
                </g>
              );
            })}

            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="100%" fy="100%">
                <stop offset="0%" stopColor={threatLevel > 75 ? "rgba(220, 38, 38, 0.45)" : "rgba(124, 58, 237, 0.4)"} />
                <stop offset="50%" stopColor={threatLevel > 75 ? "rgba(220, 38, 38, 0.15)" : "rgba(124, 58, 237, 0.1)"} />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        ) : (
          // ================= NEW RESONANCE HEATMAP GRID VIEW =================
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] overflow-visible select-none">
            {/* Grid Coordinates Underlay Text */}
            <g opacity="0.3" fill="#ffffff" fontFamily="monospace" fontSize="4.5">
              {['A','B','C','D','E','F','G','H','I','J'].map((l, idx) => (
                <text key={l} x="5" y={22 + idx * 17.5} textAnchor="middle">{l}</text>
              ))}
              {[1,2,3,4,5,6,7,8,9,10].map((num, idx) => (
                <text key={num} x={22 + idx * 17.5} y="8" textAnchor="middle">{num}</text>
              ))}
            </g>

            {/* Render 10x10 Resonance Grid */}
            {Array.from({ length: 10 }).map((_, rowIdx) => {
              return Array.from({ length: 10 }).map((__, colIdx) => {
                // Determine absolute visual placement in degrees/coordinates
                const cellX = colIdx * 17.5 + 21;
                const cellY = rowIdx * 17.5 + 21;

                // Center wave resonance
                const distToCenter = Math.sqrt((cellX - 100) ** 2 + (cellY - 100) ** 2);
                const centerContr = Math.sin(distToCenter * 0.12 - autoLevelPulse * 0.08) * (threatLevel / 2) + (threatLevel / 2);

                // Active breach influences on this coordinate
                let breachContr = 0;
                activeBreaches.forEach(bp => {
                  const angleRad = (bp.angle * Math.PI) / 180;
                  const r = (bp.radius / 100) * 90;
                  const bx = 100 + r * Math.cos(angleRad);
                  const by = 100 + r * Math.sin(angleRad);
                  const distToBreach = Math.sqrt((cellX - bx) ** 2 + (cellY - by) ** 2);
                  const intensity = Math.max(0, 100 - distToBreach * 1.5);
                  breachContr += intensity * (bp.corruption / 50);
                });

                // Rail routing tracks resonance boost
                let routeContr = 0;
                if (activeRoute === 'central') {
                  const dist = Math.abs(cellY - 100);
                  routeContr = Math.max(0, 40 - dist * 0.8);
                } else if (activeRoute === 'basin') {
                  const normX = (cellX - 100) / 90;
                  const targetY = 110 + (35 - 110) * (normX ** 2);
                  const dist = Math.abs(cellY - targetY);
                  routeContr = Math.max(0, 40 - dist * 0.8);
                } else {
                  const targetY = 100 + Math.sin((cellX - 10) * 0.045) * 45;
                  const dist = Math.abs(cellY - targetY);
                  routeContr = Math.max(0, 40 - dist * 0.8);
                }

                // Wave Formula integration
                const finalResonance = Math.max(5, Math.min(100, (centerContr * 0.35 + breachContr * 0.85 + routeContr * 0.4)));
                const isSelected = activeProbeCoord?.x === colIdx && activeProbeCoord?.y === rowIdx;
                const colors = getCellColors(finalResonance, isSelected);

                return (
                  <rect
                    key={`${colIdx}-${rowIdx}`}
                    x={cellX - 7.5}
                    y={cellY - 7.5}
                    width="15"
                    height="15"
                    rx="1.5"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? "1" : "0.25"}
                    className="hover:scale-105 hover:opacity-90 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setActiveProbeCoord({ x: colIdx, y: rowIdx, resonance: finalResonance });
                      const colLetter = String.fromCharCode(65 + colIdx);
                      addLog(`RESONANCE PROBE // Coordinate [${colLetter}-${rowIdx + 1}] locked. Amplitude: ${finalResonance.toFixed(1)}% | Harmonic feedback active.`);
                    }}
                  />
                );
              });
            })}

            {/* Overlaid Breach blip warnings so pilot doesn't lose track of target coordinate paths */}
            {activeBreaches.map((bp) => {
              const angleRad = (bp.angle * Math.PI) / 180;
              const r = (bp.radius / 100) * 90;
              const cx = 100 + r * Math.cos(angleRad);
              const cy = 100 + r * Math.sin(angleRad);
              return (
                <circle 
                  key={`breach-over-${bp.id}`}
                  cx={cx} 
                  cy={cy} 
                  r="2.5" 
                  fill="#ffffff" 
                  stroke="#ef4444" 
                  strokeWidth="0.8"
                  className="animate-pulse pointer-events-none" 
                />
              );
            })}
          </svg>
        )}

        {/* Ambient Grid overlay and compass bearings absolute markers */}
        <div className="absolute top-2 left-2 text-[6px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
          BEARING: {autoLevelPulse}°
        </div>
        <div className="absolute top-2 right-2 text-[6px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
          RANGE: 4.8KM
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1 items-center bg-black/80 px-1 border border-zinc-800 text-[5px] font-mono text-zinc-400 font-bold uppercase pointer-events-none">
          <Activity size={8} className="text-cyan-400 animate-pulse" />
          CHAMBER V_SCAN
        </div>

        {/* Threat Banner inside the radar box */}
        <AnimatePresence>
          {threatLevel > 75 && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/50 px-2 py-0.5 rounded text-[7px] text-red-400 font-black tracking-widest uppercase flex items-center gap-1 shadow-md pointer-events-none"
            >
              <Skull size={9} className="animate-bounce" />
              VECTOR INTRUSION CRITICAL
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Detail Panel for selected breach node or active resonance probe */}
      <div className="bg-black/50 border border-zinc-900 rounded p-2.5 flex flex-col gap-2 relative min-h-[95px] font-mono text-[7.5px] leading-relaxed">
        <div className="absolute top-1 right-1 flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-805" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-805" />
        </div>

        {selectedBreach && scannerViewMode === 'radar' ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center pb-1 border-b border-zinc-800/80">
              <span className="flex items-center gap-1 font-bold text-zinc-300">
                <Crosshair size={10} className="text-[#ec4899] animate-spin-slow" />
                TARGET: <span className="text-white font-black">{selectedBreach.name}</span>
              </span>
              <span className={`text-[7px] px-1 font-black rounded uppercase ${
                selectedBreach.severity === 'critical' 
                  ? "bg-red-950/40 text-red-400 border border-red-900/60" 
                  : "bg-amber-950/20 text-amber-400 border border-amber-900/40"
              }`}>
                {selectedBreach.severity} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[7px]">
              <div className="flex justify-between text-zinc-500">
                <span>INTRUSION TYPE:</span>
                <strong className="text-zinc-300 uppercase">{selectedBreach.type}</strong>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>CORRUPTION RATE:</span>
                <strong className="text-red-400 font-bold">{selectedBreach.corruption}%</strong>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>VECTOR VELOCITY:</span>
                <strong className="text-zinc-300 font-semibold">{selectedBreach.speed} KM/H</strong>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>POLAR COORDINATE:</span>
                <strong className="text-zinc-300">({selectedBreach.angle}°, {selectedBreach.radius}%)</strong>
              </div>
            </div>

            <p className="text-[6.5px] text-zinc-400 leading-normal border-l border-purple-500/40 pl-1.5 italic">
              {selectedBreach.desc}
            </p>

            <div className="mt-1 flex justify-end">
              <button
                onClick={() => handleSpotClear(selectedBreach.id, selectedBreach.name)}
                className="py-1 px-2 uppercase rounded bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800 hover:border-[#ec4899] text-[7px] text-purple-300 hover:text-white font-bold transition-all cursor-pointer shadow-md flex items-center gap-1"
              >
                <Zap size={9} className="text-amber-400 animate-pulse" />
                INITIATE LOCAL CLEANSE
              </button>
            </div>
          </div>
        ) : activeProbeCoord ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center pb-1 border-b border-zinc-803">
              <span className="flex items-center gap-1 font-bold text-cyan-400">
                <Compass size={10} className="text-cyan-400 animate-spin-slow" />
                ACTIVE RESONANCE PROBE: <span className="text-white font-black">{String.fromCharCode(65 + activeProbeCoord.x)}-{activeProbeCoord.y + 1}</span>
              </span>
              <span className="text-[7px] px-1 font-black rounded uppercase bg-cyan-950/20 text-cyan-400 border border-cyan-800/40">
                STABLE VECTOR
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[7px]">
              <div className="flex justify-between text-zinc-500">
                <span>DENSITY INDEX:</span>
                <strong className="text-cyan-300 font-bold">{activeProbeCoord.resonance.toFixed(1)}% AMP</strong>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>RESONANCE COEFFICIENT:</span>
                <strong className="text-cyan-200">{(activeProbeCoord.resonance * 8.4 + 200).toFixed(1)} Hz</strong>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>COUPLING STATUS:</span>
                <strong className={`font-semibold ${activeProbeCoord.resonance > 75 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                  {activeProbeCoord.resonance > 70 ? "SATURATED HARMONICS" : "STABLE SCAN STATUS"}
                </strong>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>APPROX RANGE:</span>
                <strong className="text-zinc-300">({(activeProbeCoord.x * 0.4).toFixed(1)}k, {(activeProbeCoord.y * 36).toFixed(0)}°)</strong>
              </div>
            </div>

            <p className="text-[6.5px] text-zinc-400 leading-normal border-l border-cyan-500/40 pl-1.5 italic">
              Probe analysis calculates spatial particle oscillation curves exhibiting {activeProbeCoord.resonance > 70 ? 'extreme peak distortions near nearby dimensional portals.' : 'stable gravitational pressure values.'}
            </p>

            <div className="mt-1 flex justify-end gap-2">
              <button
                onClick={() => {
                  addLog(`COCKPIT // Re-calibrated local spectrum sensors at probe coordinate ${String.fromCharCode(65 + activeProbeCoord.x)}-${activeProbeCoord.y + 1}.`);
                  setActiveProbeCoord(null);
                }}
                className="py-1 px-2 uppercase rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[7px] text-zinc-405 hover:text-white transition-all cursor-pointer shadow-md"
              >
                RELEASE PROBE
              </button>
              <button
                onClick={() => {
                  const reduceVal = Math.floor(Math.random() * 8) + 8; // 8-15
                  setThreatLevel(Math.max(5, threatLevel - reduceVal));
                  setActiveProbeCoord(prev => prev ? { ...prev, resonance: Math.max(5, prev.resonance - 18) } : null);
                  addLog(`RESONANCE PROBE // Injected localizing counter-frequency phase into node ${String.fromCharCode(65 + activeProbeCoord.x)}-${activeProbeCoord.y + 1}. Incursion pressure reduced by ${reduceVal}%.`);
                }}
                className="py-1 px-2 uppercase rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-[#0891b2] hover:border-cyan-400 text-[7px] text-cyan-300 hover:text-white font-bold transition-all cursor-pointer shadow-md flex items-center gap-1"
              >
                <Zap size={9} className="text-cyan-400 animate-pulse" />
                STABILIZE RESONANCE
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center text-zinc-500 gap-1.5">
            <Radio size={16} className="text-zinc-600 animate-pulse" />
            <p className="font-bold text-[7px] tracking-widest text-zinc-500">NO ACTIVE INTRUSIONS REGISTERED</p>
            <p className="text-[6.5px] text-zinc-600 max-w-[200px]">Freight lines are secure. Increase Local Pressure Coupling tuner to scan deeper rifts or select cell coords in Resonance Map.</p>
          </div>
        )}
      </div>

      {/* Slider tuner with pressure metrics */}
      <div className="flex flex-col gap-1.5 font-mono">
        <div className="flex justify-between text-[7px] text-zinc-500 uppercase">
          <span>LOCAL PRESSURE TUNER</span>
          <span className="text-purple-400 font-bold">{threatLevel}k COUPLING</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={threatLevel}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setThreatLevel(val);
            if (val > 75) {
              addLog(`COCKPIT // LOCAL LEVELER OVERRIDE: Tuned corridor storm risk to ${val}% incursion threshold.`);
            }
          }}
          className="w-full h-1 bg-zinc-950 rounded-none appearance-none cursor-pointer accent-purple-500 border border-zinc-900"
        />
      </div>

      {/* Action buttons with physical mechanical look */}
      <div className="flex gap-2">
        <button
          onClick={triggerRandomEncounter}
          className="flex-1 py-1.5 px-1 rounded bg-zinc-950 hover:bg-red-950/20 border border-zinc-800 hover:border-red-500/50 text-[7.5px] text-zinc-400 hover:text-red-300 font-bold uppercase transition-all cursor-pointer shadow-inner flex items-center justify-center gap-1.5"
          title="Trigger a simulated physical Rift Rat incursion or static signal breach log"
        >
          <Radio size={10} className="text-red-400 animate-pulse" />
          TRIGGER BREACH
        </button>
        <button
          onClick={resolveThreatState}
          className="flex-1 py-1.5 px-1 rounded bg-zinc-950 hover:bg-cyan-950/20 border border-zinc-800 hover:border-cyan-500/50 text-[7.5px] text-zinc-400 hover:text-cyan-300 font-bold uppercase transition-all cursor-pointer shadow-inner flex items-center justify-center gap-1.5"
          title="Trigger continuous sweep to purge rift anomalies & reset risk meters"
        >
          <RefreshCw size={10} className="text-cyan-400 animate-spin-slow" />
          SWEEP & PURGE
        </button>
      </div>

      <p className="text-[6.5px] text-zinc-500 leading-normal font-mono uppercase text-left">
        *RADAR SIGNAL EMITTED BY THE CONDUIT DISH LOCATED OVER THE CAB CORE.
      </p>
    </div>
  );
};
