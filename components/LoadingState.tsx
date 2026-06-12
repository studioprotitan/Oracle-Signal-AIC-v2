/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingPhrases = [
  "Synthesizing visuals...",
  "Rendering atmosphere...",
  "Composing cinematic scene...",
  "Applying artistic grading...",
  "Finalizing render..."
];

interface Fragment {
  type: 'Lore Fragment' | 'Terminal Tip';
  content: string;
}

const loreAndTips: Fragment[] = [
  {
    type: 'Lore Fragment',
    content: "VEO-3 cognitive cores are cooled using liquid helium-4 to maintain absolute signal superconductivity."
  },
  {
    type: 'Terminal Tip',
    content: "Increase the Ripple Frequency to visualize faster phase-shifting across the holographic surface."
  },
  {
    type: 'Lore Fragment',
    content: "The Mythic Rating is determined by evaluating the aesthetic complexity of a signal against the standard deviation of historical artifacts."
  },
  {
    type: 'Terminal Tip',
    content: "Use the Variant Forge radar chart to compare custom variant metrics directly against the original signal base."
  },
  {
    type: 'Lore Fragment',
    content: "TripoMesh Wireframes are formed by projecting multidimensional vertices down to three-dimensional Euclidean layout paths."
  },
  {
    type: 'Terminal Tip',
    content: "Activating the VEO-3 Pulse triggers automated scrub oscillations, driving high-fidelity dynamic telemetry diagnostics."
  },
  {
    type: 'Lore Fragment',
    content: "The 'Abyss' variant operates at 34.1 λ depth, which is close to the absolute safety threshold of standard cognitive filters."
  },
  {
    type: 'Terminal Tip',
    content: "Depth values are measured in Lambda (λ), representing wavelength-matched dimensional displacement."
  },
  {
    type: 'Lore Fragment',
    content: "Standard beacons emit minor harmonic noise at 50 Hz to prevent localized rendering synchronization anomalies."
  },
  {
    type: 'Terminal Tip',
    content: "High Mythic ratings correlate with advanced visual complexity and intricate geometry in reconstructed wireframes."
  },
  {
    type: 'Lore Fragment',
    content: "The Chronos variant represents a temporal-gradient projection, capturing overlapping segments across sequential timelines."
  },
  {
    type: 'Lore Fragment',
    content: "The Aether variant translates high-frequency radio anomalies directly into visible, luminous fields of data."
  }
];

export const LoadingState: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Randomize initial tip/lore fragment on mounting to prevent repetition
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * loreAndTips.length));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loreAndTips.length);
    }, 4500);
    return () => clearInterval(tipTimer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center">
      {/* The Gray Screen / Skeleton Card */}
      <div className="w-full aspect-video bg-zinc-900/40 rounded-xl border border-white/5 relative overflow-hidden shadow-2xl backdrop-blur-sm flex items-center justify-center">
        
        {/* Shimmer/Scan Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Backdrop Center Blur Aura */}
        <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.95, 1.05, 0.95] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl animate-pulse"
             />
        </div>

        {/* Center Loading Terminal Panel */}
        <div className="relative z-10 w-full max-w-md p-6 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-zinc-950/70 border border-zinc-800/40 rounded-xl p-5 backdrop-blur-md shadow-2xl relative"
          >
            {/* Top Bar Accents */}
            <div className="absolute top-2 left-2.5 text-[8px] font-mono text-zinc-600 tracking-widest uppercase">COGNITIVE_CORE_V3</div>
            <div className="absolute top-2 right-2.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[7.5px] font-mono text-cyan-400 uppercase tracking-widest font-bold">ANALYZING</span>
            </div>

            {/* Type Indicator */}
            <div className="text-[9px] font-mono text-zinc-500 tracking-[0.2em] uppercase font-semibold mb-3 flex items-center justify-center gap-1.5 mt-1">
              <span>//</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={loreAndTips[tipIndex]?.type}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-cyan-500/90 font-bold"
                >
                  {loreAndTips[tipIndex]?.type}
                </motion.span>
              </AnimatePresence>
              <span>//</span>
            </div>

            {/* Content Display */}
            <div className="min-h-[56px] flex items-center justify-center px-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="text-zinc-300 font-mono text-[10.5px] md:text-xs leading-relaxed tracking-wide text-center"
                >
                  "{loreAndTips[tipIndex]?.content}"
                </motion.p>
              </AnimatePresence>
            </div>
            
            {/* Loading completion progress bar footer */}
            <div className="mt-4 pt-3 border-t border-zinc-900/60 flex justify-between items-center text-[8px] font-mono text-zinc-500">
              <span className="uppercase tracking-widest">GEMINI OPERATIONAL FEED</span>
              <span className="text-zinc-400 font-bold">IDX: {tipIndex < 9 ? `0${tipIndex + 1}` : tipIndex + 1} // SECURE</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rotating Text */}
      <div className="mt-8 h-8 relative flex justify-center items-center w-full overflow-hidden perspective-500">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 15, opacity: 0, rotateX: 90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -15, opacity: 0, rotateX: -90 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="text-gray-500 font-mono text-xs md:text-sm tracking-[0.2em] uppercase absolute text-center"
          >
            {loadingPhrases[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};