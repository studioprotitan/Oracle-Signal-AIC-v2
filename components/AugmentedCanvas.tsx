/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState } from 'react';
import { GeneratedImage, AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ResonanceHeatmap } from './ResonanceHeatmap';

const warpVariants = {
  initial: {
    scale: 0.1,
    rotate: -180,
    opacity: 0,
    filter: 'blur(30px) brightness(4) saturate(2.5) contrast(1.8)',
    borderRadius: '100%',
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    filter: 'blur(0px) brightness(1) saturate(1) contrast(1)',
    borderRadius: '0%',
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 16,
      mass: 0.9,
      filter: { duration: 0.75, ease: 'easeOut' },
      borderRadius: { duration: 0.95, ease: 'easeInOut' }
    }
  },
  exit: {
    scale: 2.5,
    rotate: 180,
    opacity: 0,
    filter: 'blur(40px) brightness(0.2) saturate(0.2) contrast(3)',
    borderRadius: '100%',
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    }
  }
};

interface Props {
  image: GeneratedImage;
  analysis?: AnalysisResult | null;
  isScanning?: boolean;
  motionIntensity: number;
  spectralDistortion: number;
  frameCount: number;
  scrubPosition: number;
  isAwakened: boolean;
  activeVariant: string; // 'original' | 'abyss' | 'chronos' | 'aether'
  runeStates: { [key: string]: boolean };
  activeSegmentIndex: number | null;
  setActiveSegmentIndex: (index: number | null) => void;
  rippleIntensity: number;
  rippleFrequency: number;
  gridFloor?: boolean;
  isOrthographic?: boolean;
  showHeatmap?: boolean;
  showTacticalGrid?: boolean;
}

export const AugmentedCanvas: React.FC<Props> = ({
  image,
  analysis,
  isScanning = false,
  motionIntensity,
  spectralDistortion,
  frameCount,
  scrubPosition,
  isAwakened,
  activeVariant,
  runeStates,
  activeSegmentIndex,
  setActiveSegmentIndex,
  rippleIntensity,
  rippleFrequency,
  gridFloor = false,
  isOrthographic = false,
  showHeatmap = false,
  showTacticalGrid = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<{ id: number }[]>([]);

  // Dynamic tactical colors for real-time overlays
  const getTacticalColor = () => {
    switch (activeVariant) {
      case 'abyss': return 'rgba(6, 182, 212, ';     // Cyan
      case 'chronos': return 'rgba(168, 85, 247, ';   // Purple
      case 'aether': return 'rgba(245, 158, 11, ';    // Amber
      default: return 'rgba(16, 185, 129, ';          // Emerald Green
    }
  };

  // Dynamic portal accent colors for the warp vortex overlay
  const getPortalColor = (type: 'ring' | 'accent' | 'glow') => {
    switch (activeVariant) {
      case 'abyss':
        if (type === 'ring') return '#06b6d4';     // Cyan
        if (type === 'accent') return '#3b82f6';   // Blue
        return '#0891b2';                          // Teal
      case 'chronos':
        if (type === 'ring') return '#8b5cf6';     // Purple
        if (type === 'accent') return '#f59e0b';   // Amber
        return '#a78bfa';                          // Light violet
      case 'aether':
        if (type === 'ring') return '#fbc02d';     // Gold
        if (type === 'accent') return '#ef4444';   // Red/Rose
        return '#f59e0b';                          // Warm Amber
      default:
        if (type === 'ring') return '#22d3ee';     // Brighter cyan
        if (type === 'accent') return '#a855f7';   // Purple
        return '#06b6d4';                          // Cyan
    }
  };

  // Compute dynamic filters based on console parameters and active variant selection
  const getFilterStyle = () => {
    let filterString = '';
    
    // Original filters base on sliders
    const blurVal = (spectralDistortion / 100) * 4;
    const hueVal = (spectralDistortion / 100) * 180;
    const contrastVal = 1 + (motionIntensity / 100) * 0.5;
    
    switch (activeVariant) {
      case 'abyss': // Cold high contrast blue-cyan
        filterString = `hue-rotate(190deg) saturate(1.8) contrast(1.4) brightness(0.95)`;
        break;
      case 'chronos': // Entropic copper
        filterString = `sepia(0.85) contrast(1.1) saturate(1.3) hue-rotate(-15deg)`;
        break;
      case 'aether': // Glowing solar-flare
        filterString = `brightness(1.2) contrast(1.3) saturate(1.7) hue-rotate(25deg)`;
        break;
      default: // Original signal
        filterString = `brightness(1) contrast(${contrastVal})`;
        if (runeStates['arcane']) {
          filterString += ' saturate(1.6)';
        }
        if (runeStates['glitch']) {
          filterString += ` hue-rotate(${hueVal}deg) blur(${blurVal * 0.1}px)`;
        }
        break;
    }
    
    if (isAwakened) {
      filterString += ' saturate(1.2) contrast(1.1)';
    }
    
    return filterString;
  };

  // Determine motion transformation parameters based on timeline scrubbing slide
  const getTransformStyle = () => {
    if (isOrthographic) {
      return 'perspective(none) rotateX(0deg) scale(1) translateX(0px) translateY(0px) skewX(0deg)';
    }
    const intensityFactor = motionIntensity / 100;
    
    // Parallax timeline offset calculation
    const translateX = ((scrubPosition - 50) / 100) * 15 * intensityFactor;
    const translateY = (Math.sin((scrubPosition / 100) * Math.PI) * 8) * intensityFactor;
    const scale = 1 + (motionIntensity / 500) + (Math.cos((scrubPosition / 100) * Math.PI) * 0.02 * intensityFactor);
    const skew = runeStates['glitch'] ? ((scrubPosition - 50) / 100) * 2 : 0;

    return `perspective(800px) scale(${scale}) translateX(${translateX}px) translateY(${translateY}px) skewX(${skew}deg)`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
      
      {/* Dynamic Measurements Frame */}
      <div className="relative w-full max-w-[650px] aspect-video flex flex-col group rounded-xl">
        
        {/* Holographic Target Sights and Corners */}
        <div className="absolute top-2 left-2 z-10 text-cyan-400 font-mono text-[8px] tracking-widest pointer-events-none opacity-60">
          SEC.09 // RAD_STATION
        </div>
        <div className="absolute top-2 right-2 z-10 text-cyan-400 font-mono text-[8px] tracking-widest pointer-events-none opacity-60">
          VEO_PULSE // FPS.{Math.round(frameCount)}
        </div>
        
        {/* Technical crosshairs */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 rounded-br-sm pointer-events-none" />

        {/* Master Screen Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-lg border border-white/10 bg-black overflow-hidden"
        >
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none z-20 opacity-35" />
          
          {/* Noise overlay for active distortion */}
          {runeStates['glitch'] && (
            <div className="absolute inset-0 bg-white/[0.02] mix-blend-overlay pointer-events-none z-20 glitch-overlay" />
          )}

          {/* Warp Portal Animate Presence of Core Image with integrated vortex ring */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${image.base64.substring(0, 50)}_${activeVariant}`}
              variants={warpVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.img 
                src={`data:${image.mimeType};base64,${image.base64}`} 
                alt="Relic Hologram"
                className="w-full h-full object-cover"
                style={{
                  filter: getFilterStyle(),
                  transform: getTransformStyle(),
                }}
              />

              {/* Dynamic portal speed-line & vortex rings overlay during warp phases */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                initial={{ opacity: 0, scale: 0.1, rotate: 0 }}
                animate={{ 
                  opacity: [0, 1, 0, 0], 
                  scale: [0.1, 1.4, 2.2, 2.5],
                  rotate: [0, 180, 360, 480],
                }}
                exit={{
                  opacity: [0, 1, 0],
                  scale: [1.0, 2.5, 3.5],
                  rotate: [0, -180, -360],
                }}
                transition={{ 
                  duration: 0.95,
                  ease: "easeOut"
                }}
              >
                <svg className="w-80 h-80 opacity-70" viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={getPortalColor('glow')} stopOpacity="0" />
                      <stop offset="70%" stopColor={getPortalColor('ring')} stopOpacity="0.75" />
                      <stop offset="95%" stopColor={getPortalColor('accent')} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={getPortalColor('accent')} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Outer spinning warp ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="none" 
                    stroke="url(#portalGlow)" 
                    strokeWidth="3.5" 
                    strokeDasharray="20 6 12 10" 
                  />
                  {/* Secondary inner glowing orbit ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="26" 
                    fill="none" 
                    stroke={getPortalColor('accent')} 
                    strokeWidth="1.2" 
                    strokeDasharray="6 4 10 6"
                    opacity="0.8"
                  />
                  {/* Singularity core point */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="4" 
                    fill={getPortalColor('ring')} 
                    opacity="0.9" 
                  />
                  {/* Spatial coordinate rays projecting outwards */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 38 * Math.cos((i * Math.PI) / 4)}
                      y2={50 + 38 * Math.sin((i * Math.PI) / 4)}
                      stroke={getPortalColor('ring')}
                      strokeWidth="0.6"
                      strokeDasharray="2 6"
                      opacity="0.6"
                    />
                  ))}
                </svg>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Holographic Resonance Heatmap Overlay Layer via D3 */}
          <AnimatePresence>
            {showHeatmap && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 pointer-events-none z-19"
              >
                <ResonanceHeatmap 
                  analysis={analysis} 
                  activeVariant={activeVariant}
                  rippleIntensity={rippleIntensity}
                  spectralDistortion={spectralDistortion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Togglable Topography Grid Floor Bed (Calibration Matrix) */}
          <AnimatePresence>
            {gridFloor && (
              <motion.div 
                initial={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-end"
                style={{
                  perspective: isOrthographic ? 'none' : '600px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 3D alignment grid bed */}
                <div 
                  className={isOrthographic ? "w-full h-full relative" : "w-full h-[60%] origin-top relative border-t border-cyan-500/30"}
                  style={{
                    transform: isOrthographic ? 'rotateX(0deg) translateY(0px)' : 'rotateX(75deg) translateY(-2px)',
                    backgroundImage: `
                      linear-gradient(${activeVariant === 'abyss' ? 'rgba(6,182,212,0.14)' : activeVariant === 'chronos' ? 'rgba(168,85,247,0.14)' : 'rgba(6,182,212,0.18)'} 1px, transparent 1px),
                      linear-gradient(90deg, ${activeVariant === 'abyss' ? 'rgba(6,182,212,0.14)' : activeVariant === 'chronos' ? 'rgba(168,85,247,0.14)' : 'rgba(6,182,212,0.18)'} 1px, transparent 1px)
                    `,
                    backgroundSize: isOrthographic ? '24px 24px' : '24px 20px',
                    backgroundColor: isOrthographic ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.45)'
                  }}
                >
                  {/* Grid base shade fade */}
                  <div className={isOrthographic ? "absolute inset-0 bg-transparent" : "absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"} />
                  
                  {/* Sweep Scanning laser radar line */}
                  <motion.div 
                    className="absolute inset-x-0 h-[1.5px]"
                    style={{
                      background: activeVariant === 'chronos' 
                        ? 'linear-gradient(90deg, transparent, rgba(168,85,247,0.85), transparent)' 
                        : 'linear-gradient(90deg, transparent, rgba(6,182,212,0.85), transparent)',
                      boxShadow: activeVariant === 'chronos' 
                        ? '0 0 8px rgba(168,85,247,0.6)' 
                        : '0 0 8px rgba(6,182,212,0.6)'
                    }}
                    animate={{
                      top: ['0%', '100%', '0%']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                {/* Left side telemetry metrics */}
                <div className={`absolute left-1.5 bottom-[8%] w-[1.5px] bg-[#06b6d4]/10 flex flex-col justify-between py-1.5 text-[5px] text-[#06b6d4]/40 font-mono select-none ${isOrthographic ? 'top-[8%]' : 'top-[40%]'}`}>
                  <span>TR_Z_1</span>
                  <span>TR_Z_2</span>
                  <span>TR_Z_3</span>
                  <span>TR_Z_4</span>
                </div>

                {/* Right side telemetry metrics */}
                <div className={`absolute right-1.5 bottom-[8%] w-[1.5px] bg-[#06b6d4]/10 flex flex-col justify-between py-1.5 text-[5px] text-[#06b6d4]/40 font-mono select-none ${isOrthographic ? 'top-[8%]' : 'top-[40%]'}`}>
                  <span>+2.0M</span>
                  <span>+1.0M</span>
                  <span>0.0M</span>
                  <span>-1.0M</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time Tactical Grid Overlay */}
          <AnimatePresence>
            {showTacticalGrid && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 pointer-events-none z-18 select-none"
              >
                {/* 5x5 Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-70">
                  <div className="absolute inset-x-0 h-[1px]" style={{ top: '20%', backgroundColor: getTacticalColor() + '0.15)' }} />
                  <div className="absolute inset-x-0 h-[1px]" style={{ top: '40%', backgroundColor: getTacticalColor() + '0.15)' }} />
                  <div className="absolute inset-x-0 h-[1px]" style={{ top: '60%', backgroundColor: getTacticalColor() + '0.15)' }} />
                  <div className="absolute inset-x-0 h-[1px]" style={{ top: '80%', backgroundColor: getTacticalColor() + '0.15)' }} />

                  <div className="absolute inset-y-0 w-[1px]" style={{ left: '20%', backgroundColor: getTacticalColor() + '0.15)' }} />
                  <div className="absolute inset-y-0 w-[1px]" style={{ left: '40%', backgroundColor: getTacticalColor() + '0.15)' }} />
                  <div className="absolute inset-y-0 w-[1px]" style={{ left: '60%', backgroundColor: getTacticalColor() + '0.15)' }} />
                  <div className="absolute inset-y-0 w-[1px]" style={{ left: '80%', backgroundColor: getTacticalColor() + '0.15)' }} />
                </div>

                {/* Grid Intersection Labels & Outer HUD Scales */}
                <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none font-mono text-[7px]" style={{ color: getTacticalColor() + '0.5)' }}>
                  {/* Top scale */}
                  <div className="flex justify-between px-8">
                    <span>X_GRID_A: 104.2</span>
                    <span>X_GRID_B: 208.4</span>
                    <span>X_GRID_C: 312.6</span>
                    <span>X_GRID_D: 416.8</span>
                  </div>
                  {/* Bottom scale */}
                  <div className="flex justify-between px-8">
                    <span>YAW_LOCK_01: {Math.sin(frameCount * 0.02).toFixed(4)}</span>
                    <span>BEARING: 147.25°</span>
                    <span>GRID_REF: S-550</span>
                    <span>E_FIELD: SECURE</span>
                  </div>
                </div>

                {/* Yaw/Pitch crosshairs at intersections */}
                {[
                  { x: '20%', y: '20%', label: 'A1' },
                  { x: '40%', y: '20%', label: 'A2' },
                  { x: '60%', y: '20%', label: 'A3' },
                  { x: '80%', y: '20%', label: 'A4' },
                  { x: '20%', y: '40%', label: 'B1' },
                  { x: '80%', y: '40%', label: 'B4' },
                  { x: '20%', y: '60%', label: 'C1' },
                  { x: '80%', y: '60%', label: 'C4' },
                  { x: '20%', y: '80%', label: 'D1' },
                  { x: '40%', y: '80%', label: 'D2' },
                  { x: '60%', y: '80%', label: 'D3' },
                  { x: '80%', y: '80%', label: 'D4' },
                ].map((pt, i) => (
                  <div 
                    key={i} 
                    className="absolute font-mono text-[6px]" 
                    style={{ 
                      left: pt.x, 
                      top: pt.y, 
                      transform: 'translate(-50%, -50%)',
                      color: getTacticalColor() + '0.35)'
                    }}
                  >
                    <span>+</span>
                    <span className="ml-1 opacity-50">{pt.label}</span>
                  </div>
                ))}

                {/* Real-time Dynamic Energy Flux Points */}
                {[
                  {
                    name: 'FLUX_ALPHA',
                    x: 32,
                    y: 38,
                    color: activeVariant === 'abyss' ? 'text-cyan-400' : activeVariant === 'chronos' ? 'text-purple-400' : activeVariant === 'aether' ? 'text-amber-500' : 'text-emerald-400',
                    border: activeVariant === 'abyss' ? 'border-cyan-500/40' : activeVariant === 'chronos' ? 'border-purple-500/40' : activeVariant === 'aether' ? 'border-amber-500/40' : 'border-emerald-500/40',
                    bg: activeVariant === 'abyss' ? 'bg-cyan-950/85' : activeVariant === 'chronos' ? 'bg-purple-950/85' : activeVariant === 'aether' ? 'bg-amber-950/85' : 'bg-emerald-950/85',
                    val: () => (Math.sin(frameCount * 0.05) * 15 + 85).toFixed(1) + '%',
                    getCoords: () => `X: ${(120 + Math.sin(frameCount * 0.01) * 1.5).toFixed(1)}, Y: ${(340 + Math.cos(frameCount * 0.01) * 1.5).toFixed(1)}`,
                    barCount: 5
                  },
                  {
                    name: 'FLUX_BETA',
                    x: 68,
                    y: 28,
                    color: activeVariant === 'abyss' ? 'text-cyan-400' : activeVariant === 'chronos' ? 'text-purple-400' : activeVariant === 'aether' ? 'text-amber-500' : 'text-emerald-400',
                    border: activeVariant === 'abyss' ? 'border-cyan-500/40' : activeVariant === 'chronos' ? 'border-purple-500/40' : activeVariant === 'aether' ? 'border-amber-500/40' : 'border-emerald-500/40',
                    bg: activeVariant === 'abyss' ? 'bg-cyan-950/85' : activeVariant === 'chronos' ? 'bg-purple-950/85' : activeVariant === 'aether' ? 'bg-amber-950/85' : 'bg-emerald-950/85',
                    val: () => (Math.cos(frameCount * 0.08) * 12 + 64).toFixed(1) + ' MW',
                    getCoords: () => `X: ${(542 + Math.cos(frameCount * 0.012) * 2).toFixed(1)}, Y: ${(184 + Math.sin(frameCount * 0.012) * 2).toFixed(1)}`,
                    barCount: 4
                  },
                  {
                    name: 'FLUX_GAMMA',
                    x: 48,
                    y: 72,
                    color: activeVariant === 'abyss' ? 'text-cyan-400' : activeVariant === 'chronos' ? 'text-purple-400' : activeVariant === 'aether' ? 'text-amber-500' : 'text-emerald-400',
                    border: activeVariant === 'abyss' ? 'border-cyan-500/40' : activeVariant === 'chronos' ? 'border-purple-500/40' : activeVariant === 'aether' ? 'border-amber-500/40' : 'border-emerald-500/40',
                    bg: activeVariant === 'abyss' ? 'bg-cyan-950/85' : activeVariant === 'chronos' ? 'bg-purple-950/85' : activeVariant === 'aether' ? 'bg-amber-950/85' : 'bg-emerald-950/85',
                    val: () => (Math.sin(frameCount * 0.03 + 1.2) * 8 + 42).toFixed(2) + ' kJs',
                    getCoords: () => `X: ${(310 + Math.sin(frameCount * 0.008) * 1.2).toFixed(1)}, Y: ${(615 + Math.cos(frameCount * 0.008) * 1.2).toFixed(1)}`,
                    barCount: 3
                  }
                ].map((flux, idx) => {
                  const valStr = flux.val();
                  const coordsStr = flux.getCoords();
                  return (
                    <div 
                      key={idx} 
                      className="absolute pointer-events-none"
                      style={{ left: `${flux.x}%`, top: `${flux.y}%` }}
                    >
                      {/* Pulsing focal target point */}
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-40 animate-pulse" style={{ backgroundColor: getTacticalColor() + '0.6)' }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: getTacticalColor() + '0.9)' }} />
                        
                        {/* Target reticle borders */}
                        <div className="absolute w-3 h-3 border border-dashed rounded-full animate-spin-slow" style={{ borderColor: getTacticalColor() + '0.7)' }} />
                      </div>

                      {/* Floating HUD Panel Card */}
                      <div 
                        className={`absolute left-4 top-[-20px] ${flux.bg} border ${flux.border} rounded p-1.5 font-mono text-[7px] leading-tight min-w-[85px] shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                        style={{ color: getTacticalColor() + '0.9)' }}
                      >
                        <div className="font-bold border-b border-white/5 pb-0.5 mb-0.5 flex justify-between items-center">
                          <span>{flux.name}</span>
                          <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
                        </div>
                        <div>{coordsStr}</div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span>VAL:</span>
                          <span className="font-bold">{valStr}</span>
                        </div>
                        <div className="mt-0.5 opacity-85 text-[6px] tracking-tight">
                          {Array.from({ length: 8 }).map((_, bIdx) => (
                            <span key={bIdx}>{bIdx < flux.barCount ? '▰' : '▱'}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activation Event: Awaken Layer holographic symbols */}
          <AnimatePresence>
            {isAwakened && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-t from-cyan-950/20 via-transparent to-purple-950/25 flex items-center justify-center overflow-hidden"
              >
                {/* Floating holographic grids and runes */}
                <div className="absolute inset-0 border border-brand-cyan/20 m-6 flex items-center justify-center">
                  <div className="w-[1px] h-full bg-brand-cyan/15 absolute left-1/3" />
                  <div className="w-[1px] h-full bg-brand-cyan/15 absolute left-2/3" />
                  <div className="h-[1px] w-full bg-brand-cyan/15 absolute top-1/3" />
                  <div className="h-[1px] w-full bg-brand-cyan/15 absolute top-2/3" />
                </div>
                
                {/* Abstract Glowing Compass in center */}
                <svg className="w-48 h-48 text-brand-cyan/20 absolute rotate-clockwise" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.75" />
                  <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                
                <svg className="w-40 h-40 text-purple-400/25 absolute rotate-counter" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 2" />
                  <polygon points="50,15 80,68 20,68" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                {/* Rift energy particles floating upwards */}
                <span className="absolute bottom-4 left-6 text-[9px] font-mono text-cyan-400/70 tracking-widest glow-cyan">
                  ⚡ PROTOCOL ACTIVE // ENERGY SOURCE DETECTED
                </span>
                <span className="absolute top-4 right-6 text-[9px] font-mono text-purple-400/70 tracking-widest glow-purple">
                  RIFT_COORDINATES // 47.9 λ
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCANNING & DECODING SCANNER SCREEN */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isScanning ? 1 : 0,
              pointerEvents: isScanning ? "auto" : "none"
            }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            {/* Rotating scanner rings group with scale-up entrance */}
            <motion.div 
              animate={{ 
                scale: isScanning ? 1 : 0.85,
                opacity: isScanning ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className="relative w-44 h-44 flex items-center justify-center"
            >
              {/* Outer Pulsing Glow Ring */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-cyan-500/10"
                animate={isScanning ? { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] } : { scale: 1, opacity: 0 }}
                transition={{ repeat: isScanning ? Infinity : 0, duration: 3, ease: "easeInOut" }}
              />

              {/* Outer Clockwise Rotating Ring */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-cyan-500/45 border-t-cyan-300 border-b-cyan-350"
                animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
                transition={{ 
                  repeat: isScanning ? Infinity : 0, 
                  duration: 6, 
                  ease: isScanning ? "linear" : "easeOut" 
                }}
              />

              {/* Expanding Radar Wave Pulse */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                animate={isScanning ? { scale: [0.9, 1.35], opacity: [0.8, 0] } : { scale: 0.9, opacity: 0 }}
                transition={{ repeat: isScanning ? Infinity : 0, duration: 1.8, ease: "easeOut" }}
              />

              {/* Inner Counter-Clockwise Dashed Ring */}
              <motion.div 
                className="absolute inset-2.5 rounded-full border-2 border-dashed border-purple-500/40"
                animate={isScanning ? { rotate: -360 } : { rotate: 0 }}
                transition={{ 
                  repeat: isScanning ? Infinity : 0, 
                  duration: 4.5, 
                  ease: isScanning ? "linear" : "easeOut" 
                }}
              />

              {/* Scanning Text Container with subtle heartbeat */}
              <motion.div 
                className="absolute inset-7 rounded-full border border-cyan-400/40 flex items-center justify-center text-[10px] font-mono tracking-[0.25em] text-cyan-200 bg-cyan-950/20"
                animate={isScanning ? { scale: [0.96, 1.04, 0.96], opacity: [0.8, 1, 0.8] } : { scale: 0.96, opacity: 0 }}
                transition={{ repeat: isScanning ? Infinity : 0, duration: 2, ease: "easeInOut" }}
              >
                SCANNING
              </motion.div>

              {/* Glowing Core Dot */}
              <motion.div 
                className="w-3.5 h-3.5 bg-white rounded-full box-glow-cyan shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                animate={isScanning ? { scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] } : { scale: 1, opacity: 0 }}
                transition={{ repeat: isScanning ? Infinity : 0, duration: 1.2, ease: "easeInOut" }}
              />
            </motion.div>
            
            <motion.p 
              animate={{ 
                y: isScanning ? 0 : 12, 
                opacity: isScanning ? 1 : 0 
              }}
              transition={{ delay: isScanning ? 0.15 : 0, duration: 0.35, ease: "easeOut" }}
              className="mt-8 text-xs font-mono text-zinc-450 uppercase tracking-[0.3em] text-center glow-cyan max-w-[320px] leading-relaxed"
            >
              DECODING VISUAL TOPOGRAPHY FEY MATRIX...
            </motion.p>
          </motion.div>

          {/* Resonance Ping Effect in Viewport Center */}
          <div className="absolute inset-0 pointer-events-none z-21 flex items-center justify-center overflow-hidden">
            <AnimatePresence>
              {pings.map((ping) => {
                let ring1Style = "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]";
                let ring2Style = "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
                let ring3Style = "border-cyan-300/30";

                if (activeVariant === 'abyss') {
                  ring1Style = "border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.4)]";
                  ring2Style = "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
                  ring3Style = "border-teal-300/30";
                } else if (activeVariant === 'chronos') {
                  ring1Style = "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]";
                  ring2Style = "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
                  ring3Style = "border-purple-400/30";
                } else if (activeVariant === 'aether') {
                  ring1Style = "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]";
                  ring2Style = "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                  ring3Style = "border-amber-300/30";
                }

                return (
                  <React.Fragment key={ping.id}>
                    {/* Ring 1 - inner fast */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0.9 }}
                      animate={{ scale: 2.8, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      onAnimationComplete={() => {
                        // Remove completed ping when it finishes
                        setPings(prev => prev.filter(p => p.id !== ping.id));
                      }}
                      className={`absolute w-20 h-20 rounded-full border ${ring1Style}`}
                    />
                    
                    {/* Ring 2 - middle slightly delayed */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0.7 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
                      className={`absolute w-20 h-20 rounded-full border-2 ${ring2Style}`}
                    />

                    {/* Ring 3 - outer tracking circle */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0.4 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 1.7, delay: 0.3, ease: "easeOut" }}
                      className={`absolute w-20 h-20 rounded-full border border-dashed ${ring3Style}`}
                    />
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Interactive Hitbox Regions */}
          {!isScanning && analysis?.segments && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {analysis.segments.map((segment, index) => {
                const isActive = activeSegmentIndex === index;
                
                return (
                  <button
                    key={index}
                    style={{
                      left: `${segment.bounds.x}%`,
                      top: `${segment.bounds.y}%`,
                      width: `${segment.bounds.width}%`,
                      height: `${segment.bounds.height}%`,
                    }}
                    onClick={() => {
                      setActiveSegmentIndex(isActive ? null : index);
                      setPings(prev => [...prev, { id: Date.now() + Math.random() }]);
                    }}
                    className="absolute z-20 group/node pointer-events-auto cursor-pointer focus:outline-none"
                  >
                    {/* Ring highlight surrounding the spot */}
                    <div 
                      className={`w-full h-full border rounded transition-all duration-300 ${
                        isActive 
                          ? 'border-brand-cyan bg-brand-cyan/10 ring-4 ring-brand-cyan/20 box-glow-cyan' 
                          : 'border-white/10 hover:border-brand-cyan/50 hover:bg-white/5'
                      }`}
                    >
                      {/* Anchor pulsing widget dot */}
                      <div className="absolute -top-1.5 -left-1.5 flex items-center justify-center w-3 z-30">
                        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-sm" />
                      </div>

                      {/* Floating node label */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/85 border border-white/10 rounded font-mono text-[9px] text-gray-400 shadow group-hover/node:text-brand-cyan transition-colors max-w-[120px] truncate">
                        {segment.icon} {segment.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* WET SURFACE WATER REFLECTION MATRIX (Cinematic layout requirement) */}
        <div className="absolute h-1/4 w-full left-0 right-0 top-full mt-0.5 pointer-events-none z-10 overflow-hidden">
          {/* Flipped and blurred source image trailing the warping effects */}
          <div className="w-full h-[400%] relative origin-top scale-y-[-1]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${image.base64.substring(0, 50)}_${activeVariant}_reflect`}
                variants={warpVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <motion.img 
                  src={`data:${image.mimeType};base64,${image.base64}`} 
                  alt="Reflective Surface" 
                  className="w-full h-full object-cover opacity-15 filter blur-sm grayscale"
                  style={{
                    filter: getFilterStyle(),
                    transform: getTransformStyle(),
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Ripples layer */}
          <div 
            className="absolute inset-0 water-ripples opacity-25" 
            style={{ 
              animationDuration: `${(150 / Math.max(1, rippleFrequency)).toFixed(2)}s` 
            }}
          />
          {/* Bottom darken to fade out reflection */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>
        
      </div>
    </div>
  );
};
