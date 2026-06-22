import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { OracleIntel } from '../App';
import { BarChart, Grid, Layers, Sparkles } from 'lucide-react';

interface RarityDistributionChartProps {
  intelHistory: OracleIntel[];
}

interface RarityData {
  full: string;
  name: string;
  count: number;
  color: string;
  glow: string;
}

const CANONICAL_RARITIES = [
  { full: 'MYTHIC UNIQUE', name: 'MYTHIC', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
  { full: 'RELIC CLASS [S-GRADE]', name: 'RELIC [S]', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
  { full: 'FORBIDDEN ARCHETYPE', name: 'FORBIDDEN', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  { full: 'ANOMALOUS LEGENDARY', name: 'LEGEND', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { full: 'PARADOXICAL COSMIC', name: 'COSMIC', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  { full: 'ECOSYSTEM SOVEREIGN', name: 'SOVEREIGN', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { full: 'DEIDENTIFIED PRIMORDIAL', name: 'PRIMORDIAL', color: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' },
  { full: 'ASTRAL NON-EUCLIDEAN [OMEGA LEVEL]', name: 'ASTRAL [Ω]', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' }
];

export const RarityDistributionChart: React.FC<RarityDistributionChartProps> = ({ intelHistory }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group and count the rarities from intel history
  const distributionData = useMemo((): RarityData[] => {
    // Initialize counts
    const counts: Record<string, number> = {};
    CANONICAL_RARITIES.forEach(r => {
      counts[r.full] = 0;
    });

    // Populate counts from the actual user history
    intelHistory.forEach(item => {
      const itemRarity = (item.rarity || '').toUpperCase().trim();
      const matched = CANONICAL_RARITIES.find(r => r.full === itemRarity);
      if (counts[itemRarity] !== undefined) {
        counts[itemRarity] += 1;
      } else if (matched) {
        counts[matched.full] += 1;
      } else {
        // Fallback checks for near matches
        const closeMatch = CANONICAL_RARITIES.find(r => itemRarity.includes(r.name) || r.full.includes(itemRarity));
        if (closeMatch) {
          counts[closeMatch.full] += 1;
        }
      }
    });

    return CANONICAL_RARITIES.map(r => ({
      full: r.full,
      name: r.name,
      count: counts[r.full],
      color: r.color,
      glow: r.glow
    }));
  }, [intelHistory]);

  const maxCount = useMemo(() => {
    const max = d3.max(distributionData, (d: RarityData) => d.count) || 0;
    return max === 0 ? 5 : max; // Default scale height if no items yet
  }, [distributionData]);

  // Dimensions & Padding
  const width = 280;
  const height = 240;
  const margin = { top: 12, right: 35, bottom: 25, left: 85 };
  
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // D3 Scales
  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, chartWidth]);
  }, [maxCount, chartWidth]);

  const yScale = useMemo(() => {
    return d3.scaleBand()
      .domain(distributionData.map(d => d.name))
      .range([0, chartHeight])
      .padding(0.3);
  }, [distributionData, chartHeight]);

  // Overall Statistics computed from distribution layout
  const totalScanned = intelHistory.length;
  const highestGradeCount = distributionData.find(d => d.full === 'MYTHIC UNIQUE')?.count || 0;
  const mostFrequentGradeName = useMemo(() => {
    if (totalScanned === 0) return 'NONE';
    const sorted = [...distributionData].sort((a, b) => b.count - a.count);
    return sorted[0].count > 0 ? sorted[0].name : 'NONE';
  }, [distributionData, totalScanned]);

  return (
    <div id="rarity-distribution-widget" className="mt-4 border border-zinc-900 bg-zinc-950/40 rounded-xl p-4.5 flex flex-col gap-3 font-mono relative overflow-hidden">
      {/* Absolute faint sci-fi styling elements */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-25 select-none pointer-events-none">
        <span className="text-[7px] text-zinc-400">DEC_CORE.NODE_v82</span>
        <div className="w-1 h-1 rounded-full bg-brand-cyan animate-ping" />
      </div>

      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
          <Layers size={11} className="text-purple-400 animate-spin-slow" />
          Rarity Grade Distribution
        </h3>
      </div>

      {/* Main Bar Chart Panel */}
      <div className="w-full flex justify-center items-center py-2 h-[240px] relative">
        {totalScanned === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-zinc-950/80 rounded-lg border border-zinc-900">
            <BarChart size={24} className="text-zinc-650 mb-2 animate-bounce" />
            <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest block">No Archive Data Loaded</span>
            <span className="text-[7.5px] text-zinc-500 uppercase tracking-wide leading-relaxed block mt-1 max-w-[200px]">
              Generate relic signals in the telemetry chamber to populate rarity diagnostics.
            </span>
          </div>
        ) : null}

        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Grid lines (X Axis ticks across chart width) */}
          {Array.from({ length: Math.min(maxCount + 1, 6) }).map((_, i) => {
            const val = Math.round((maxCount / (Math.min(maxCount, 5))) * i);
            if (val > maxCount) return null;
            const xCoord = margin.left + xScale(val);
            return (
              <g key={`x-grid-${i}`} className="opacity-40">
                <line
                  x1={xCoord}
                  y1={margin.top}
                  x2={xCoord}
                  y2={margin.top + chartHeight}
                  stroke="#18181b"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
                <text
                  x={xCoord}
                  y={margin.top + chartHeight + 14}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="7.5px"
                  className="font-mono font-bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* D3 Rendered Bars */}
          {distributionData.map((d, index) => {
            const isHovered = hoveredIndex === index;
            const yCoord = yScale(d.name);
            if (yCoord === undefined) return null;

            const barY = margin.top + yCoord;
            const barHeight = yScale.bandwidth();
            const barWidth = xScale(d.count);

            return (
              <g
                key={`bar-group-${index}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer group"
              >
                {/* Horizontal Guide Background Bar */}
                <rect
                  x={margin.left}
                  y={barY}
                  width={chartWidth}
                  height={barHeight}
                  fill="rgba(255, 255, 255, 0.01)"
                  rx="2"
                />

                {/* Left Y-axis Label */}
                <text
                  x={margin.left - 10}
                  y={barY + barHeight / 2 + 3}
                  textAnchor="end"
                  fill={isHovered ? d.color : "#a1a1aa"}
                  fontSize="8px"
                  className="font-mono font-black tracking-wide uppercase transition-colors duration-200"
                >
                  {d.name}
                </text>

                {/* Actual Data Bar */}
                <rect
                  x={margin.left}
                  y={barY}
                  width={Math.max(barWidth, d.count > 0 ? 3 : 0)}
                  height={barHeight}
                  fill={d.color}
                  rx="2"
                  className="transition-all duration-350 ease-out"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${d.color})` : 'none',
                    opacity: hoveredIndex !== null && !isHovered ? 0.35 : 1,
                  }}
                />

                {/* Count indicator on the right of the bar */}
                {d.count > 0 && (
                  <text
                    x={margin.left + barWidth + 8}
                    y={barY + barHeight / 2 + 3.5}
                    textAnchor="start"
                    fill={isHovered ? d.color : "#d4d4d8"}
                    fontSize="8px"
                    className="font-mono font-extrabold"
                  >
                    {d.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Diagnostic Readings / Metric Info Area */}
      <div className="flex flex-col gap-1 border-t border-zinc-900 pt-3 mt-1 text-[8px] tracking-wide uppercase leading-relaxed text-zinc-500">
        {hoveredIndex !== null ? (
          <div className="flex flex-col gap-0.5 animate-fadeIn">
            <span className="text-[7.5px] text-zinc-550 block font-bold">NODE DIAGNOSTIC DATA</span>
            <div className="flex justify-between items-center text-zinc-300 font-mono mt-0.5">
              <span>{distributionData[hoveredIndex].full}</span>
              <span className="font-extrabold" style={{ color: distributionData[hoveredIndex].color }}>
                {distributionData[hoveredIndex].count} ARCHIVED
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-600 block text-[6.5px]">TOTAL INTEGRITY ENTRIES</span>
              <span className="text-zinc-300 font-black text-[9.5px] tracking-wider block">
                {totalScanned} SIGNALS
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-600 block text-[6.5px]">MOST FREQUENT CLASS</span>
              <span className="text-pink-400 font-black text-[9.5px] tracking-widest block truncate">
                {mostFrequentGradeName}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
