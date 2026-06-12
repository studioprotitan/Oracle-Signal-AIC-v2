import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Radar, Skull, RefreshCw, Radio, Shield, 
  Activity, Zap, Crosshair, Cpu, Eye, Compass
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

      {/* Main Grid Radar Arena */}
      <div className="relative w-full aspect-square md:aspect-auto md:h-52 bg-black/80 border border-zinc-900 rounded overflow-hidden flex items-center justify-center">
        {/* Futuristic Grid Overlay background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {/* Dynamic Scan sweep coordinate graphics */}
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
              // Straight horizontal vector track
              <>
                <line x1="10" y1="100" x2="190" y2="100" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="2,5" className="animate-[dash_10s_linear_infinite]" />
                <path d="M 10 100 Q 100 100, 190 100" fill="none" stroke="#0891b2" strokeWidth="0.5" />
              </>
            ) : activeRoute === 'basin' ? (
              // Highly curved sine vector track
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
              // Complex serpentine loops
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
            // Convert polar to cartesian coordinates for SVG plotting
            const angleRad = (bp.angle * Math.PI) / 180;
            // Radius goes from 0% (center) to 100% (r = 95px)
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
                {/* Corruption spread glow circle */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={10 + bp.corruption / 8} 
                  fill={bp.severity === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(168, 85, 247, 0.05)'} 
                  stroke={bp.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(168, 85, 247, 0.1)'} 
                  strokeWidth="0.5"
                  className="animate-pulse"
                />

                {/* Animated ping concentric warning waves */}
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

                {/* Micro visual connecting alignment line to center core */}
                <line 
                  x1="100" 
                  y1="100" 
                  x2={cx} 
                  y2={cy} 
                  stroke={isSelected ? "#ec4899" : bp.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)'} 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2" 
                />

                {/* Core Blip Indicator */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isSelected ? "4.5" : "3"} 
                  fill={bp.severity === 'critical' ? '#ef4444' : bp.severity === 'moderate' ? '#f59e0b' : '#c084fc'} 
                  className="transition-all duration-300"
                />

                {/* Active vector tick markers */}
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

        {/* Ambient Grid overlay and compass bearings absolute markers */}
        <div className="absolute top-2 left-2 text-[6px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
          BEARING: {autoLevelPulse}°
        </div>
        <div className="absolute top-2 right-2 text-[6px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
          RANGE: 4.8KM
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1 items-center bg-black/80 px-1 border border-zinc-805 text-[5px] font-mono text-zinc-400 font-bold uppercase pointer-events-none">
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

      {/* Interactive Detail Panel for selected breach node */}
      <div className="bg-black/50 border border-zinc-900 rounded p-2.5 flex flex-col gap-2 relative min-h-[95px] font-mono text-[7.5px] leading-relaxed">
        <div className="absolute top-1 right-1 flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
        </div>

        {selectedBreach ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center pb-1 border-b border-zinc-800/80">
              <span className="flex items-center gap-1 font-bold text-zinc-300">
                <Crosshair size={10} className="text-[#ec4899] animate-spin-slow" />
                TARGET: <span className="text-white font-black">{selectedBreach.name}</span>
              </span>
              <span className={`text-[7px] px-1 font-black rounded uppercase ${
                selectedBreach.severity === 'critical' 
                  ? "bg-red-950/40 text-red-400 border border-red-910" 
                  : "bg-amber-950/20 text-amber-400 border border-amber-910"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center text-zinc-504 gap-1.5">
            <Radio size={16} className="text-zinc-600 animate-pulse" />
            <p className="font-bold text-[7px] tracking-widest text-zinc-500">NO ACTIVE INTRUSIONS REGISTERED</p>
            <p className="text-[6.5px] text-zinc-600 max-w-[200px]">Freight lines are secure. Increase Local Pressure Coupling tuner to scan deeper rifts.</p>
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
