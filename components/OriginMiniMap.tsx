import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Target, Radio, RefreshCw, Layers } from 'lucide-react';

interface MapSector {
  id: string;
  name: string;
  sectorCode: string;
  x: number; // percentage coordinate on map X
  y: number; // percentage coordinate on map Y
  color: string;
  glowColor: string;
  coordinates: string;
  anomalyIndex: string;
  spectralNoise: string;
  description: string;
}

const SECTORS: MapSector[] = [
  {
    id: 'forge',
    name: 'Primary Forge Network Blast Chamber',
    sectorCode: 'FORGE-SEC-01',
    x: 20,
    y: 28,
    color: '#06b6d4', // cyan-500
    glowColor: 'rgba(6, 182, 212, 0.5)',
    coordinates: 'RA 12h 45m / Dec -15.4°',
    anomalyIndex: '9.2 λ',
    spectralNoise: 'Extremely Dense // Thermonuclear Trace',
    description: 'Active weapon creation chamber. Temperature levels exceed stellar core averages. Surface marks match deep thermonuclear containment fusion.'
  },
  {
    id: 'nexus',
    name: 'Archivist Sector-09 Central Nexus',
    sectorCode: 'NEXUS-SEC-09',
    x: 52,
    y: 18,
    color: '#a855f7', // purple-500
    glowColor: 'rgba(168, 85, 247, 0.5)',
    coordinates: 'RA 04h 12m / Dec -08.1°',
    anomalyIndex: '6.4 λ',
    spectralNoise: 'Modulated Loop // Encrypted Memory Well',
    description: 'Ancient central registry server hub, buried under centuries of corrupted datashards. Echoes with faint digital warning signals.'
  },
  {
    id: 'basin',
    name: 'Deep Sub-Aqueous Abyssum Basin',
    sectorCode: 'BASIN-SEC-EX',
    x: 82,
    y: 32,
    color: '#3b82f6', // blue-500
    glowColor: 'rgba(59, 130, 246, 0.5)',
    coordinates: 'RA 19h 22m / Dec -33.9°',
    anomalyIndex: '8.8 λ',
    spectralNoise: 'Bioluminescent Peak // Sub-ocean Waves',
    description: 'Crushing deep trench hydrothermal vents. Persistent thermodynamic footprint with bioluminescent crystalline formations.'
  },
  {
    id: 'archives',
    name: 'Outer Ring Chronicle Archives',
    sectorCode: 'RING-SEC-04',
    x: 18,
    y: 72,
    color: '#fbbf24', // yellow-500
    glowColor: 'rgba(251, 191, 36, 0.5)',
    coordinates: 'RA 14h 50m / Dec -18.0°',
    anomalyIndex: '4.7 λ',
    spectralNoise: 'Low Static // Static Gravity Shelving',
    description: 'Gravity-locked archiving vault on the galactic fringe. Contained labeled components initially discarded as raw material slag.'
  },
  {
    id: 'distortion',
    name: 'Temporal Echo Distortion Chamber Z-18',
    sectorCode: 'TIME-SEC-Z18',
    x: 38,
    y: 55,
    color: '#10b981', // emerald-500
    glowColor: 'rgba(16, 185, 129, 0.5)',
    coordinates: 'RA 22h 59m / Dec -41.2°',
    anomalyIndex: '9.9 λ',
    spectralNoise: 'Retrocausal Ripple // Dynamic Loop',
    description: 'Chronal aberration laboratory with loose temporal metrics. Discovered state phase shifted into concurrent forward/backward vectors.'
  },
  {
    id: 'singularity',
    name: 'Aetherial Singularity Rift Horizon',
    sectorCode: 'RIFT-SEC-00',
    x: 85,
    y: 74,
    color: '#ec4899', // pink-500
    glowColor: 'rgba(236, 72, 153, 0.5)',
    coordinates: 'RA 01h 05m / Dec +02.3°',
    anomalyIndex: '10.0 λ',
    spectralNoise: 'Gravitational Distortion // Multiverse Pulse',
    description: 'Boundary boundary plane of the galactic central singularity. Matter here undergoes heavy spatial distortion and coordinate warping.'
  },
  {
    id: 'trench',
    name: 'Fairy Ring Sub-Spatial Trench',
    sectorCode: 'FOLD-SEC-F',
    x: 50,
    y: 84,
    color: '#6366f1', // indigo-500
    glowColor: 'rgba(99, 102, 241, 0.5)',
    coordinates: 'RA 08h 33m / Dec +54.6°',
    anomalyIndex: '5.1 λ',
    spectralNoise: 'Coherent Macro-Signal // Echo-Chord',
    description: 'Sub-spatial dimensional fold lined with synthetic biomes. Emits localized stable magnetic pulses protecting local biosystem stasis.'
  },
  {
    id: 'laboratory',
    name: 'Siren Deep Station Orbital Laboratory',
    sectorCode: 'SIREN-SEC-S',
    x: 68,
    y: 48,
    color: '#f43f5e', // rose-500
    glowColor: 'rgba(244, 63, 94, 0.5)',
    coordinates: 'RA 11h 17m / Dec +12.8°',
    anomalyIndex: '7.5 λ',
    spectralNoise: 'High-Frequency Constant Coordinate Beacon',
    description: 'Abandoned vacuum facility. Reactor meltdown left structures irradiated yet intact, silently transmitting unknown vectors.'
  }
];

interface OriginMiniMapProps {
  currentOrigin: string | undefined;
  addLog: (message: string) => void;
}

export const OriginMiniMap: React.FC<OriginMiniMapProps> = ({ currentOrigin, addLog }) => {
  const [selectedSector, setSelectedSector] = useState<MapSector>(SECTORS[0]);
  const [radialScanAngle, setRadialScanAngle] = useState(0);
  const [isScanningNode, setIsScanningNode] = useState(false);

  // Auto-detect currently loaded relic's origin zone to set selected sector & highlight it
  useEffect(() => {
    if (currentOrigin) {
      const matched = SECTORS.find(
        s => s.name.toLowerCase() === currentOrigin.toLowerCase() ||
             currentOrigin.toLowerCase().includes(s.id)
      );
      if (matched) {
        setSelectedSector(matched);
      }
    }
  }, [currentOrigin]);

  // Continuously rotate radial scan scope overlay line
  useEffect(() => {
    let animationId: number;
    const rotate = () => {
      setRadialScanAngle(prev => (prev + 0.8) % 360);
      animationId = requestAnimationFrame(rotate);
    };
    animationId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleSectorClick = (sector: MapSector) => {
    setSelectedSector(sector);
    addLog(`NAVIGATIONAL RADAR COORDS SHIFTED // TARGET LOCK: [${sector.sectorCode}]`);
  };

  const engageNodePing = () => {
    setIsScanningNode(true);
    addLog(`INITIATED DIRECT MICROWAVE RESONANCE PING ON ${selectedSector.sectorCode}...`);
    
    setTimeout(() => {
      addLog(`PING VECTOR SUCCESS! RTT: 42ms // DECAY PROFILE: ${selectedSector.anomalyIndex}`);
      addLog(`SIGNAL READOUT: "${selectedSector.spectralNoise}"`);
      setIsScanningNode(false);
    }, 1200);
  };

  // Find if sector matches current relic origin
  const isCurrentlyDiscoveredSector = (sector: MapSector) => {
    if (!currentOrigin) return false;
    return sector.name.toLowerCase() === currentOrigin.toLowerCase();
  };

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 flex flex-col gap-3 font-mono relative overflow-hidden mt-4">
      {/* Visual cyber decoration */}
      <div className="absolute top-0 right-0 p-1.5 text-[7px] text-zinc-700 select-none flex items-center gap-1">
        <Target size={8} /> RADAR_MAP_v1.0.4
      </div>

      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400 flex items-center gap-1.5">
          <Compass size={12} className="text-cyan-400 animate-spin-slow" />
          Interactive Sector Radar Map
        </h3>
        {currentOrigin ? (
          <span className="text-[7.5px] bg-[#0c2a30]/60 border border-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-350 animate-pulse tracking-widest uppercase">
            RELIC SIGNAL LOCKED
          </span>
        ) : (
          <span className="text-[7.5px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 tracking-widest uppercase">
            STANDBY MAP MONITOR
          </span>
        )}
      </div>

      {/* Cyber Grid Coordinates Map Screen */}
      <div className="relative w-full h-[180px] bg-black/80 rounded-lg border border-zinc-900/60 overflow-hidden flex items-center justify-center">
        {/* Radar Ring Concentrics */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="absolute border border-dashed border-zinc-650 rounded-full w-[40px] h-[40px]" />
          <div className="absolute border border-dashed border-zinc-650 rounded-full w-[90px] h-[90px]" />
          <div className="absolute border border-dashed border-zinc-650 rounded-full w-[140px] h-[140px]" />
          <div className="absolute border border-zinc-700/80 w-[200%] h-0.5" />
          <div className="absolute border border-zinc-700/80 h-[200%] w-0.5" />
        </div>

        {/* Diagonal sector line divisions */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="absolute border border-[#a1a1aa] w-[200%] h-0.5 rotate-[30deg]" />
          <div className="absolute border border-[#a1a1aa] w-[200%] h-0.5 rotate-[120deg]" />
        </div>

        {/* Sweeping Radar Scanner Line */}
        <div 
          className="absolute origin-center w-full h-full pointer-events-none opacity-[0.12]"
          style={{
            transform: `rotate(${radialScanAngle}deg)`,
            background: 'conic-gradient(from 90deg, transparent 40%, rgba(6, 182, 212, 0.4) 95%, rgba(6, 182, 212, 0.8) 100%)',
            borderRadius: '50%'
          }}
        />

        {/* Sector nodes container */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Subtle connecting mesh lines to look complex */}
          <g opacity="0.15">
            <line x1="20%" y1="28%" x2="52%" y2="18%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="52%" y1="18%" x2="68%" y2="48%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="68%" y1="48%" x2="82%" y2="32%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="82%" y1="32%" x2="85%" y2="74%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="38%" y1="55%" x2="18%" y2="72%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="38%" y1="55%" x2="50%" y2="84%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="50%" y1="84%" x2="85%" y2="74%" stroke="#06b6d4" strokeWidth="0.75" />
            <line x1="20%" y1="28%" x2="38%" y2="55%" stroke="#06b6d4" strokeWidth="0.75" />
          </g>

          {/* Mini coordinate grid scales around margins */}
          <text x="5" y="15" fill="#52525b" fontSize="6" opacity="0.6">LAT 82.203-A</text>
          <text x="5" y="172" fill="#52525b" fontSize="6" opacity="0.6">ALT XW-912.8</text>
          <text x="215" y="15" fill="#52525b" fontSize="6" opacity="0.6">EXP_HORIZON</text>
        </svg>

        {/* Interactive Coordinate Plot Markers */}
        {SECTORS.map((sector) => {
          const isSelected = selectedSector.id === sector.id;
          const isCurrentRelicOrigin = isCurrentlyDiscoveredSector(sector);

          return (
            <button
              key={sector.id}
              onClick={() => handleSectorClick(sector)}
              className="absolute group z-10 cursor-pointer -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-0"
              style={{ left: `${sector.x}%`, top: `${sector.y}%` }}
              title={sector.name}
            >
              {/* Highlight Aura Rings */}
              {isCurrentRelicOrigin && (
                <span className="absolute inline-flex h-6 w-6 -left-1.5 -top-1.5 rounded-full animate-ping opacity-60 pointer-events-none" style={{ backgroundColor: sector.color }} />
              )}
              {isSelected && (
                <div className="absolute inset-[-6px] rounded-full border border-dashed animate-spin-slow" style={{ borderColor: sector.color, opacity: 0.6 }} />
              )}

              {/* Node core dot with halo gradient */}
              <div 
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                  isSelected 
                    ? 'scale-125 border-white border' 
                    : isCurrentRelicOrigin 
                    ? 'scale-110 border-white/50 border' 
                    : 'scale-100 hover:scale-110 border-transparent border'
                }`}
                style={{ 
                  backgroundColor: isCurrentRelicOrigin ? sector.color : isSelected ? sector.color : '#18181b',
                  borderColor: isSelected ? '#ffffff' : isCurrentRelicOrigin ? sector.color : '#3f3f46',
                  boxShadow: isSelected || isCurrentRelicOrigin ? `0 0 10px ${sector.glowColor}` : 'none'
                }}
              >
                {/* Micro inner laser dot */}
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>

              {/* Hover custom tooltips */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[7px] text-zinc-300 font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg pr-1">
                <span className="font-bold underline" style={{ color: sector.color }}>{sector.sectorCode}</span>: {sector.coordinates}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Readout and Telemetry Matrix */}
      <div className="flex flex-col gap-2.5 bg-zinc-950/80 border border-zinc-900 rounded-lg p-3">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <div className="flex items-center gap-1.5">
            <Radio size={10} className="animate-pulse" style={{ color: selectedSector.color }} />
            <span className="text-[10px] font-bold text-white block truncate uppercase tracking-widest" style={{ textShadow: `0 0 5px ${selectedSector.glowColor}` }}>
              {selectedSector.sectorCode}
            </span>
          </div>
          {isCurrentlyDiscoveredSector(selectedSector) ? (
            <span className="text-[6.5px] bg-emerald-950/50 border border-emerald-500/20 px-1 py-0.5 rounded text-emerald-450 uppercase font-bold text-[7px] tracking-wide animate-pulse">
              [DISCOVERY ORIGIN]
            </span>
          ) : (
            <span className="text-[6.5px] bg-zinc-900/50 border border-zinc-900 px-1 py-0.5 rounded text-zinc-500 uppercase font-semibold text-[7px] tracking-wide">
              [PASSIVE MONITOR MONITOR]
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[8px] tracking-wide">
          <div>
            <span className="text-zinc-500 block uppercase font-medium">Designation Name</span>
            <span className="text-zinc-300 block font-semibold truncate uppercase" style={{ color: selectedSector.color }}>{selectedSector.name}</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase font-medium">Co-Chronos Vector</span>
            <span className="text-zinc-300 block font-semibold truncate font-mono">{selectedSector.coordinates}</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase font-medium">Variance Index</span>
            <span className="text-zinc-300 block font-semibold">{selectedSector.anomalyIndex}</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase font-medium">Spectral Signal Profiling</span>
            <span className="text-zinc-300 block font-semibold truncate">{selectedSector.spectralNoise}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-2 rounded text-[7.5px] leading-relaxed text-zinc-400 font-serif italic">
          "{selectedSector.description}"
        </div>

        {/* Dynamic Scan Trigger Button */}
        <button
          onClick={engageNodePing}
          disabled={isScanningNode}
          className={`w-full py-1.5 rounded-md border font-mono text-[8px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isScanningNode 
              ? 'bg-zinc-900 border-zinc-850 text-zinc-650 cursor-wait' 
              : 'bg-zinc-950 hover:bg-zinc-900 text-cyan-350 hover:text-white border-cyan-500/10 hover:border-cyan-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          }`}
          style={{ borderColor: isScanningNode ? undefined : `${selectedSector.color}1e` }}
        >
          {isScanningNode ? (
            <>
              <RefreshCw size={9} className="animate-spin text-zinc-650" />
              <span>TRANSMITTING PING BEAM...</span>
            </>
          ) : (
            <>
              <Layers size={9} style={{ color: selectedSector.color }} />
              <span>ENGAGE DEEP SCAN SEQUENCE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
