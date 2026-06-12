import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';
import { OracleIntel } from '../App';

interface RadarData {
  clarity: number; // 0-100 %
  depth: number;   // 0-60 λ
  mythic: number;  // 0-10 rating
}

interface ArchiveCompareChartProps {
  itemA: OracleIntel;
  itemB: OracleIntel;
}

// Deterministic high-fidelity stats calculator for archived oracle entries
export function getIntelStats(item: OracleIntel): RadarData {
  // Use unique seed from query + variant
  const seedStr = (item.userQuery || "archetype") + (item.activeVariant || "original");
  const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base stats corresponding to their selected core variants
  let baseClarity = 90.0;
  let baseDepth = 10.0;
  let baseMythic = 9.0;
  
  switch (item.activeVariant) {
    case 'original':
      baseClarity = 99.4; baseDepth = 12.4; baseMythic = 9.2;
      break;
    case 'abyss':
      baseClarity = 74.8; baseDepth = 34.1; baseMythic = 9.6;
      break;
    case 'chronos':
      baseClarity = 62.1; baseDepth = 51.0; baseMythic = 9.9;
      break;
    case 'aether':
      baseClarity = 88.2; baseDepth = 22.5; baseMythic = 9.5;
      break;
  }
  
  // Add seed-based minor fluctuation to make it unique per item
  const clarityFluc = ((seed % 61) - 30) / 10; // range [-3%, +3%]
  const depthFluc = ((seed % 81) - 40) / 10;   // range [-4λ, +4λ]
  const mythicFluc = ((seed % 11) - 5) / 10;   // range [-0.5, +0.5]
  
  const clarity = Math.max(10, Math.min(100, parseFloat((baseClarity + clarityFluc).toFixed(1))));
  const depth = Math.max(1, Math.min(60, parseFloat((baseDepth + depthFluc).toFixed(1))));
  const mythic = Math.max(1, Math.min(10, parseFloat((baseMythic + mythicFluc).toFixed(1))));
  
  return { clarity, depth, mythic };
}

export const ArchiveCompareChart: React.FC<ArchiveCompareChartProps> = ({ itemA, itemB }) => {
  const statsA = useMemo(() => getIntelStats(itemA), [itemA]);
  const statsB = useMemo(() => getIntelStats(itemB), [itemB]);

  // Dimensions
  const width = 300;
  const height = 190;
  const margin = 30;
  const radius = Math.min(width, height) / 2 - margin;
  const cx = width / 2;
  const cy = height / 2 + 8; // offset slightly for bottom labels

  // D3 Scales to normalize values to [0, radius] range
  const clarityScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
  const depthScale = d3.scaleLinear().domain([0, 60]).range([0, radius]);
  const mythicScale = d3.scaleLinear().domain([0, 10]).range([0, radius]);

  // Variables mapping list
  const variables = [
    { name: 'Clarity', accessor: (d: RadarData) => clarityScale(d.clarity), display: (d: RadarData) => `${d.clarity}%` },
    { name: 'Depth', accessor: (d: RadarData) => depthScale(d.depth), display: (d: RadarData) => `${d.depth} λ` },
    { name: 'Mythic', accessor: (d: RadarData) => mythicScale(d.mythic), display: (d: RadarData) => `${d.mythic}/10` }
  ];

  // Axis angles (3 axes separated by 120 degrees or 2*PI/3)
  const angleScale = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / 3;

  // Compute point coordinates helper helper function
  const getCoordinates = (index: number, value: number) => {
    const angle = angleScale(index);
    return {
      x: cx + Math.cos(angle) * value,
      y: cy + Math.sin(angle) * value
    };
  };

  // Generate SVG polygon points string for Signal A
  const pointsA = useMemo(() => {
    return variables.map((variable, i) => {
      const coord = getCoordinates(i, variable.accessor(statsA));
      return `${coord.x},${coord.y}`;
    }).join(' ');
  }, [statsA]);

  // Generate SVG polygon points string for Signal B
  const pointsB = useMemo(() => {
    return variables.map((variable, i) => {
      const coord = getCoordinates(i, variable.accessor(statsB));
      return `${coord.x},${coord.y}`;
    }).join(' ');
  }, [statsB]);

  // Calculations for variance deltas
  const deltas = useMemo(() => {
    const clarityDelta = statsB.clarity - statsA.clarity;
    const depthDelta = statsB.depth - statsA.depth;
    const mythicDelta = statsB.mythic - statsA.mythic;

    return {
      clarity: {
        raw: clarityDelta,
        percent: statsA.clarity > 0 ? (clarityDelta / statsA.clarity) * 100 : 0,
        text: `${clarityDelta > 0 ? '+' : ''}${clarityDelta.toFixed(1)}%`
      },
      depth: {
        raw: depthDelta,
        percent: statsA.depth > 0 ? (depthDelta / statsA.depth) * 100 : 0,
        text: `${depthDelta > 0 ? '+' : ''}${depthDelta.toFixed(1)} λ`
      },
      mythic: {
        raw: mythicDelta,
        percent: statsA.mythic > 0 ? (mythicDelta / statsA.mythic) * 100 : 0,
        text: `${mythicDelta > 0 ? '+' : ''}${mythicDelta.toFixed(1)}`
      }
    };
  }, [statsA, statsB]);

  // Render back-grid levels (25%, 50%, 75%, 100% outer scale)
  const nestedGrids = [0.25, 0.5, 0.75, 1.0].map((percentage) => {
    const dStr = variables.map((_, i) => {
      const coord = getCoordinates(i, radius * percentage);
      return `${coord.x},${coord.y}`;
    }).join(' ');
    return dStr;
  });

  return (
    <div className="border border-zinc-800/60 bg-zinc-950/80 rounded-xl p-4 flex flex-col gap-4 font-mono relative overflow-hidden">
      {/* Absolute faint sci-fi background details */}
      <div className="absolute top-1.5 right-2 text-[7.5px] text-zinc-600 select-none uppercase tracking-widest font-black">
        COMPARATIVE_SPECTRUM_v402
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest">
          <Layers size={12} className="text-cyan-400 animate-pulse" />
          <span>Oracle Variance Matrix</span>
        </div>
        <p className="text-[8px] text-zinc-500 leading-normal uppercase">
          Mapping divergence indices between source focal beacons
        </p>
      </div>

      {/* Grid of Compare Info */}
      <div className="grid grid-cols-2 gap-3 text-[9px] border-b border-zinc-900/80 pb-3">
        <div className="flex flex-col gap-1 border-r border-zinc-900/60 pr-2">
          <span className="text-zinc-650 font-black text-[7px] tracking-widest uppercase">SIGNAL ALPHA</span>
          <span className="text-cyan-400 font-bold truncate block" title={itemA.name}>
            {itemA.oracleId}
          </span>
          <span className="text-zinc-400 text-[8px] truncate block font-serif italic text-zinc-350">{itemA.name}</span>
        </div>
        <div className="flex flex-col gap-1 pl-1">
          <span className="text-zinc-650 font-black text-[7px] tracking-widest uppercase">SIGNAL BETA</span>
          <span className="text-purple-400 font-bold truncate block" title={itemB.name}>
            {itemB.oracleId}
          </span>
          <span className="text-zinc-400 text-[8px] truncate block font-serif italic text-zinc-350">{itemB.name}</span>
        </div>
      </div>

      {/* Radar SVG container */}
      <div className="w-full flex justify-center items-center h-[190px] relative">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Radial Axis Grid Web */}
          {nestedGrids.map((points, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={points}
              fill="none"
              stroke="#1f1f23"
              strokeWidth="0.8"
              strokeDasharray={idx === 3 ? "2,2" : undefined}
            />
          ))}

          {/* Grid radiating helper lines */}
          {variables.map((_, i) => {
            const axisMax = getCoordinates(i, radius);
            return (
              <line
                key={`axis-line-${i}`}
                x1={cx}
                y1={cy}
                x2={axisMax.x}
                y2={axisMax.y}
                stroke="#18181c"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Area 1: Signal Alpha Polygon */}
          <polygon
            points={pointsA}
            fill="rgba(6, 182, 212, 0.08)"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="4,2"
            className="transition-all duration-500 ease-out"
          />

          {/* Area 2: Signal Beta Polygon */}
          <polygon
            points={pointsB}
            fill="rgba(168, 85, 247, 0.08)"
            stroke="#a855f7"
            strokeWidth="1.8"
            className="transition-all duration-500 ease-out"
          />

          {/* Variables and data nodes markers */}
          {variables.map((variable, i) => {
            const coordA = getCoordinates(i, variable.accessor(statsA));
            const coordB = getCoordinates(i, variable.accessor(statsB));
            const angle = angleScale(i);

            // Shift label outwards
            const labelDist = radius + 15;
            const labelCoord = {
              x: cx + Math.cos(angle) * labelDist,
              y: cy + Math.sin(angle) * labelDist
            };

            let textAnchor = "middle";
            let dy = "3";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            else if (Math.cos(angle) < -0.1) textAnchor = "end";

            if (Math.sin(angle) < -0.9) dy = "-4";
            else if (Math.sin(angle) > 0.9) dy = "11";

            return (
              <g key={`compare-marker-group-${i}`}>
                {/* Node marker dot A */}
                <circle
                  cx={coordA.x}
                  cy={coordA.y}
                  r="3.5"
                  fill="#06b6d4"
                  stroke="#050505"
                  strokeWidth="1"
                  className="transition-all duration-500 ease-out"
                />

                {/* Node marker dot B */}
                <circle
                  cx={coordB.x}
                  cy={coordB.y}
                  r="3.5"
                  fill="#a855f7"
                  stroke="#050505"
                  strokeWidth="1"
                  className="transition-all duration-500 ease-out"
                />

                {/* Outer Axis Indicator Texts */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor={textAnchor}
                  fill="#8e8e93"
                  fontSize="7.5px"
                  dy={dy}
                  className="font-mono tracking-wider font-extrabold uppercase"
                >
                  {variable.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Comparison breakdown & deltas list view */}
      <div className="flex flex-col gap-2 border-t border-zinc-900 pt-3 text-[9px] font-mono">
        <span className="text-[7px] text-zinc-550 uppercase tracking-widest font-bold">Variance Telemetry Feed</span>
        
        <div className="flex flex-col gap-2">
          {/* Clarity metric row */}
          <div className="flex items-center justify-between py-1 px-2.5 bg-zinc-950/40 border border-zinc-900/40 rounded-lg">
            <span className="text-zinc-400 font-semibold tracking-wide uppercase">CLARITY INDEX</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">{statsA.clarity}%</span>
              <span className="text-zinc-600 font-bold">→</span>
              <span className="text-purple-400 font-bold">{statsB.clarity}%</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-0.5 ${
                deltas.clarity.raw > 0 ? 'bg-emerald-950/50 border border-emerald-900/60 text-emerald-400' : 
                deltas.clarity.raw < 0 ? 'bg-red-950/50 border border-red-900/60 text-red-400' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {deltas.clarity.raw > 0 ? <ArrowUpRight size={10} /> : deltas.clarity.raw < 0 ? <ArrowDownRight size={10} /> : null}
                {deltas.clarity.text}
              </span>
            </div>
          </div>

          {/* Depth metric row */}
          <div className="flex items-center justify-between py-1 px-2.5 bg-zinc-950/40 border border-zinc-900/40 rounded-lg">
            <span className="text-zinc-400 font-semibold tracking-wide uppercase">DEPTH GRADIENT</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">{statsA.depth} λ</span>
              <span className="text-zinc-600 font-bold">→</span>
              <span className="text-purple-400 font-bold">{statsB.depth} λ</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-0.5 ${
                deltas.depth.raw > 0 ? 'bg-emerald-950/50 border border-emerald-900/60 text-emerald-400' : 
                deltas.depth.raw < 0 ? 'bg-red-950/50 border border-red-900/60 text-red-400' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {deltas.depth.raw > 0 ? <ArrowUpRight size={10} /> : deltas.depth.raw < 0 ? <ArrowDownRight size={10} /> : null}
                {deltas.depth.text}
              </span>
            </div>
          </div>

          {/* Mythic Rating metric row */}
          <div className="flex items-center justify-between py-1 px-2.5 bg-zinc-950/40 border border-zinc-900/40 rounded-lg">
            <span className="text-zinc-400 font-semibold tracking-wide uppercase">MYTHIC COMPASS</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">{statsA.mythic}/10</span>
              <span className="text-zinc-600 font-bold">→</span>
              <span className="text-purple-400 font-bold">{statsB.mythic}/10</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-0.5 ${
                deltas.mythic.raw > 0 ? 'bg-emerald-950/50 border border-emerald-900/60 text-emerald-400' : 
                deltas.mythic.raw < 0 ? 'bg-red-950/50 border border-red-900/60 text-red-400' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {deltas.mythic.raw > 0 ? <ArrowUpRight size={10} /> : deltas.mythic.raw < 0 ? <ArrowDownRight size={10} /> : null}
                {deltas.mythic.text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
