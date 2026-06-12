import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { AnalysisResult } from '../types';

interface Props {
  analysis?: AnalysisResult | null;
  activeVariant: string;
  rippleIntensity: number;
  spectralDistortion: number;
}

interface HeatPoint {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  intensity: number;
  radius: number;
}

export const ResonanceHeatmap: React.FC<Props> = ({
  analysis,
  activeVariant,
  rippleIntensity,
  spectralDistortion
}) => {
  const [phase, setPhase] = useState(0);

  // Soft oscillation update loop to make heatmap field pulsate in real-time
  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    const update = (time: number) => {
      if (time - lastTime > 40) { // Limit to ~24fps for superior CPU frame balance
        setPhase(prev => (prev + 0.05) % (2 * Math.PI));
        lastTime = time;
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute points list based on image analysis segments
  const points = useMemo<HeatPoint[]>(() => {
    const list: HeatPoint[] = [];

    if (analysis?.segments && analysis.segments.length > 0) {
      analysis.segments.forEach((segment, idx) => {
        // Calculate bbox center as core signal peak
        const cx = segment.bounds.x + segment.bounds.width / 2;
        const cy = segment.bounds.y + segment.bounds.height / 2;
        
        list.push({
          x: cx,
          y: cy,
          intensity: 0.95 + idx * 0.05,
          radius: Math.max(14, Math.min(24, (segment.bounds.width + segment.bounds.height) / 2))
        });

        // Add 3-point satellite circle cluster surrounding every major node center
        const count = 3;
        for (let k = 0; k < count; k++) {
          const angle = (k * 2 * Math.PI) / count + idx * 0.75;
          const dist = 8 + (idx % 2 === 0 ? 3 : 5);
          list.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            intensity: 0.5 + 0.1 * k,
            radius: 8 + k * 2
          });
        }
      });

      // Extra atmospheric sensor signals
      list.push({ x: 20, y: 35, intensity: 0.35, radius: 18 });
      list.push({ x: 80, y: 70, intensity: 0.4, radius: 22 });
    } else {
      // High-precision fallback clusters when idle or pre-search
      list.push({ x: 30, y: 35, intensity: 0.85, radius: 20 });
      list.push({ x: 75, y: 60, intensity: 0.95, radius: 25 });
      list.push({ x: 50, y: 25, intensity: 0.65, radius: 15 });
      list.push({ x: 15, y: 75, intensity: 0.55, radius: 18 });
      list.push({ x: 85, y: 20, intensity: 0.5, radius: 20 });
    }

    return list;
  }, [analysis]);

  // Dimensions of grid sampling
  const n = 45; // Columns
  const m = 30; // Rows

  const { contoursData, fillScale, strokeColor, maxIntensity } = useMemo(() => {
    const gridValues = new Array<number>(n * m).fill(0);

    // Compute continuous field density grid using Radial Basis Functions
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        // Map grid cell index to the 100x100 percent space
        const gx = (i / (n - 1)) * 100;
        const gy = (j / (m - 1)) * 100;

        let totalIntensity = 0;
        points.forEach((p, idx) => {
          const dx = gx - p.x;
          const dy = gy - p.y;
          const distSq = dx * dx + dy * dy;

          // Modulator waves based on phase
          const waveSeed = phase + idx * 1.33;
          const ampWave = Math.sin(waveSeed) * 0.15 * (rippleIntensity / 50);
          const radWave = Math.cos(waveSeed) * 0.1 * (spectralDistortion / 50);

          const currentIntensity = p.intensity * (1 + ampWave);
          const currentRadius = p.radius * (1 + radWave);

          const factor = Math.exp(-distSq / (2 * currentRadius * currentRadius));
          totalIntensity += currentIntensity * factor;
        });

        const cellIndex = j * n + i;
        gridValues[cellIndex] = totalIntensity;
      }
    }

    const maxVal = d3.max(gridValues) || 0.1;
    const levelsCount = 10;
    const step = maxVal / levelsCount;
    const thresholds = Array.from({ length: levelsCount }, (_, index) => (index + 1) * step);

    // Generate ISO contour intervals
    const contourGenerator = d3.contours()
      .size([n, m])
      .thresholds(thresholds);

    const contours = contourGenerator(gridValues);

    // Beautiful variant color scales conforming to visual theme
    const fill = (() => {
      switch (activeVariant) {
        case 'abyss':
          return d3.scaleLinear<string>()
            .domain([0, maxVal * 0.35, maxVal * 0.7, maxVal])
            .range([
              "rgba(8, 47, 73, 0.02)",
              "rgba(14, 116, 144, 0.12)",
              "rgba(13, 148, 136, 0.3)",
              "rgba(34, 197, 94, 0.48)"
            ]);
        case 'chronos':
          return d3.scaleLinear<string>()
            .domain([0, maxVal * 0.35, maxVal * 0.7, maxVal])
            .range([
              "rgba(69, 10, 10, 0.02)",
              "rgba(154, 52, 18, 0.12)",
              "rgba(180, 83, 9, 0.3)",
              "rgba(234, 179, 8, 0.48)"
            ]);
        case 'aether':
          return d3.scaleLinear<string>()
            .domain([0, maxVal * 0.35, maxVal * 0.7, maxVal])
            .range([
              "rgba(88, 28, 135, 0.02)",
              "rgba(190, 24, 74, 0.12)",
              "rgba(219, 39, 119, 0.3)",
              "rgba(245, 158, 11, 0.48)"
            ]);
        default: // original
          return d3.scaleLinear<string>()
            .domain([0, maxVal * 0.35, maxVal * 0.7, maxVal])
            .range([
              "rgba(15, 23, 42, 0.02)",
              "rgba(147, 51, 234, 0.15)",
              "rgba(219, 39, 119, 0.28)",
              "rgba(6, 182, 212, 0.5)"
            ]);
      }
    })();

    const border = (() => {
      switch (activeVariant) {
        case 'abyss': return "rgba(34, 197, 94, 0.35)";
        case 'chronos': return "rgba(245, 158, 11, 0.35)";
        case 'aether': return "rgba(251, 113, 133, 0.35)";
        default: return "rgba(6, 182, 212, 0.4)";
      }
    })();

    return {
      contoursData: contours,
      fillScale: fill,
      strokeColor: border,
      maxIntensity: maxVal
    };
  }, [points, phase, activeVariant, rippleIntensity, spectralDistortion]);

  // Scaled Projection setup for SVG space mapping
  const pathGenerator = useMemo(() => {
    const scaleX = 100 / n;
    const scaleY = 100 / m;
    const projection = d3.geoTransform({
      point: function(x, y) {
        this.stream.point(x * scaleX, y * scaleY);
      }
    });
    return d3.geoPath().projection(projection);
  }, [n, m]);

  return (
    <div className="absolute inset-0 pointer-events-none z-19 overflow-hidden rounded-lg">
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full opacity-75"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle composite glow filters for premium resonance layout */}
          <filter id="resonanceGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Contour Patches */}
        <g filter="url(#resonanceGlow)">
          {contoursData.map((contour, idx) => {
            const dStr = pathGenerator(contour);
            if (!dStr) return null;
            return (
              <path
                key={idx}
                d={dStr}
                fill={fillScale(contour.value)}
                stroke={strokeColor}
                strokeWidth={0.25}
                strokeDasharray={contour.value > maxIntensity * 0.65 ? "none" : "0.5, 0.5"}
                className="transition-all duration-300 ease-out"
                style={{
                  fillRule: "evenodd"
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
