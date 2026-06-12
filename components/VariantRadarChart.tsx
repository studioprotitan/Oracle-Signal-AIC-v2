import React, { useMemo } from 'react';
import * as d3 from 'd3';

interface RadarData {
  clarity: number; // 0-100 %
  depth: number;   // 0-60 λ
  mythic: number;  // 0-10 rating
}

interface VariantRadarChartProps {
  activeVariant: string;
}

export const VariantRadarChart: React.FC<VariantRadarChartProps> = ({ activeVariant }) => {
  // Hardcoded curated stats to match getVariantStats in main App
  const baseStats: RadarData = { clarity: 99.4, depth: 12.4, mythic: 9.2 };

  const currentStats = useMemo((): RadarData => {
    switch (activeVariant) {
      case 'original':
        return { clarity: 99.4, depth: 12.4, mythic: 9.2 };
      case 'abyss':
        return { clarity: 74.8, depth: 34.1, mythic: 9.6 };
      case 'chronos':
        return { clarity: 62.1, depth: 51.0, mythic: 9.9 };
      case 'aether':
        return { clarity: 88.2, depth: 22.5, mythic: 9.5 };
      default:
        return { clarity: 90.0, depth: 10.0, mythic: 9.0 };
    }
  }, [activeVariant]);

  // Dimensions
  const width = 280;
  const height = 180;
  const margin = 25;
  const radius = Math.min(width, height) / 2 - margin;
  const cx = width / 2;
  const cy = height / 2 + 5; // offset slightly for bottom labels

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
  // Axis 0: -90 degrees (Clarity / top)
  // Axis 1: 30 degrees (Depth / bottom-right)
  // Axis 2: 150 degrees (Mythic / bottom-left)
  const angleScale = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / 3;

  // Compute point coordinates-helper helper function
  const getCoordinates = (index: number, value: number) => {
    const angle = angleScale(index);
    return {
      x: cx + Math.cos(angle) * value,
      y: cy + Math.sin(angle) * value
    };
  };

  // Generate SVG polygon points string
  const basePoints = useMemo(() => {
    return variables.map((variable, i) => {
      const coord = getCoordinates(i, variable.accessor(baseStats));
      return `${coord.x},${coord.y}`;
    }).join(' ');
  }, [baseStats]);

  const currentPoints = useMemo(() => {
    return variables.map((variable, i) => {
      const coord = getCoordinates(i, variable.accessor(currentStats));
      return `${coord.x},${coord.y}`;
    }).join(' ');
  }, [currentStats]);

  // Calculations for Telemetry logs
  const varianceText = useMemo(() => {
    if (activeVariant === 'original') return 'Synchronous alignment with base beacon';
    const cellPct = ((currentStats.clarity - baseStats.clarity) / baseStats.clarity) * 100;
    const depthPct = ((currentStats.depth - baseStats.depth) / baseStats.depth) * 100;
    const mythicPct = ((currentStats.mythic - baseStats.mythic) / baseStats.mythic) * 100;
    return `Variance: Depth: ${depthPct > 0 ? '+' : ''}${depthPct.toFixed(1)}%, Clarity: ${cellPct.toFixed(1)}%`;
  }, [activeVariant, currentStats]);

  // Render back-grid levels (25%, 50%, 75%, 100% outer scale)
  const nestedGrids = [0.25, 0.5, 0.75, 1.0].map((percentage) => {
    const dStr = variables.map((_, i) => {
      const coord = getCoordinates(i, radius * percentage);
      return `${coord.x},${coord.y}`;
    }).join(' ');
    return dStr;
  });

  return (
    <div id="variant-forge-radar-cell" className="mt-4 border border-zinc-900 bg-zinc-950/40 rounded-lg p-3 flex flex-col gap-3 font-mono relative overflow-hidden">
      {/* Absolute faint sci-fi background details */}
      <div className="absolute top-0 right-0 p-1 text-[8px] text-zinc-700 select-none">
        GRID_COMPARE_MODULE_v381
      </div>
      
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
        <span className="text-zinc-500">Multivariant Radar Index</span>
        <span className="text-cyan-400 text-[9px] animate-pulse">{activeVariant.toUpperCase()} FOCUS</span>
      </div>

      <div className="w-full flex justify-center items-center h-[180px]">
        <svg width={width} height={height} className="overflow-visible">
          {/* Radial Axis Grid Web */}
          {nestedGrids.map((points, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={points}
              fill="none"
              stroke="#27272a"
              strokeWidth="0.75"
              strokeDasharray={idx === 3 ? "2,2" : undefined}
            />
          ))}

          {/* Core Radiating Axis Lines */}
          {variables.map((_, i) => {
            const axisMax = getCoordinates(i, radius);
            return (
              <line
                key={`axis-line-${i}`}
                x1={cx}
                y1={cy}
                x2={axisMax.x}
                y2={axisMax.y}
                stroke="#18181b"
                strokeWidth="1"
              />
            );
          })}

          {/* Area 1: Base Signal / Original Reference */}
          <polygon
            points={basePoints}
            fill="rgba(113, 113, 122, 0.04)"
            stroke="rgba(113, 113, 122, 0.4)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          {/* Area 2: Current Active Variant Overlay */}
          <polygon
            points={currentPoints}
            fill="rgba(6, 182, 212, 0.12)"
            stroke="#06b6d4"
            strokeWidth="1.5"
            className="transition-all duration-500 ease-out"
          />

          {/* Key Markers with values */}
          {variables.map((variable, i) => {
            const baseCoord = getCoordinates(i, variable.accessor(baseStats));
            const activeCoord = getCoordinates(i, variable.accessor(currentStats));
            const angle = angleScale(i);

            // Calculate label coordinates shifted outward beyond radius
            const labelDist = radius + 15;
            const labelCoord = {
              x: cx + Math.cos(angle) * labelDist,
              y: cy + Math.sin(angle) * labelDist
            };

            // String position adjustments
            let textAnchor = "middle";
            let dy = "3";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            else if (Math.cos(angle) < -0.1) textAnchor = "end";

            if (Math.sin(angle) < -0.9) dy = "-4";
            else if (Math.sin(angle) > 0.9) dy = "10";

            return (
              <g key={`marker-group-${i}`}>
                {/* Base dot */}
                <circle
                  cx={baseCoord.x}
                  cy={baseCoord.y}
                  r="2.5"
                  fill="#71717a"
                  className="transition-all duration-500 ease-out"
                />

                {/* Active dot */}
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r="3.5"
                  fill="#22d3ee"
                  className="transition-all duration-500 ease-out"
                />

                {/* Label metadata */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor={textAnchor}
                  fill="#a1a1aa"
                  fontSize="8px"
                  dy={dy}
                  className="font-mono tracking-wider font-extrabold"
                >
                  {variable.name.toUpperCase()}
                  <tspan className="text-cyan-400 font-bold" dx="4">
                    {variable.display(currentStats)}
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Telemetry log output beneath */}
      <div className="flex flex-col gap-0.5 border-t border-zinc-900 pt-2.5">
        <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest block font-bold">Telemetry Feedback Output</span>
        <span className="text-[8.5px] text-zinc-350 tracking-wide font-mono block uppercase truncate select-none leading-snug">
          {varianceText}
        </span>
      </div>
    </div>
  );
};
