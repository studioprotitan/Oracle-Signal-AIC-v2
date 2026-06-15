import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Terminal, ChevronRight, Play, Activity, 
  Shield, Compass, Eye, Radio, Cpu, Layers, Flame, Volume2, VolumeX, Database, HelpCircle
} from 'lucide-react';

// @ts-ignore
import heroImage from '@/ChatGPT Image Jun 2, 2026, 11_44_07 AM.png';

interface HeroLandingPageProps {
  onEnter: () => void;
}

export const HeroLandingPage: React.FC<HeroLandingPageProps> = ({ onEnter }) => {
  const [bootProgress, setBootProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'mission' | 'telemetry' | 'systems'>('mission');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Auto-boot sequence progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Soft low-frequency ambient hum synth sequence using Web Audio API on click
  const playSoundEffect = (type: 'enter' | 'hover' | 'ambient') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'enter') {
        // Dramatic explosive sub-spatial bass wave descending ramp
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 1.8);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(130, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 1.5);

        filter.type = 'lowpass';
        filter.Q.value = 8;
        filter.frequency.setValueAtTime(180, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
        filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 1.8);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 2.0);
        osc2.stop(ctx.currentTime + 2.0);
      } else if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'ambient') {
        // Soft wave pulse
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 55;
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }
    } catch (e) {
      console.warn("Audio Context is blocked or unsupported: ", e);
    }
  };

  const handleEnterClick = () => {
    setIsSynthesizing(true);
    playSoundEffect('enter');
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#070506] text-zinc-100 flex flex-col justify-between overflow-x-hidden relative p-4 md:p-8 font-sans select-none">
      
      {/* Absolute Aesthetic Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-[#070506] to-black opacity-85 z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00f0ff] to-purple-600 opacity-60 blur-sm animate-pulse" />
            <div className="relative w-10 h-10 rounded-full bg-black border border-cyan-500/40 flex items-center justify-center">
              <Cpu size={16} className="text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full animate-ping" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.25em] text-white uppercase font-sans">
              GENESIS VERSE //
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-[#00f0ff] uppercase">
              REMIX COGNITIVE INTERFACE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound Controls */}
          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSoundEffect('ambient');
            }}
            className={`p-2 rounded border transition-all text-xs flex items-center gap-2 cursor-pointer ${
              soundEnabled 
                ? 'bg-[#00f0ff]/5 border-cyan-500/30 text-cyan-400' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Sensory Synthesizer Audio Context"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="font-mono text-[9px] uppercase tracking-wider hidden sm:inline">
              {soundEnabled ? 'SENSORY HUM ON' : 'AUDIO OFF'}
            </span>
          </button>

          <div className="px-3 py-1.5 bg-black/60 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400 tracking-widest uppercase hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            SECURE LINK LINK_B-3
          </div>
        </div>
      </header>

      {/* Main Grid Hero Presentation */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 my-6 md:my-12">
        
        {/* Left Column: Descriptive Space Deck */}
        <div className="w-full lg:w-[48%] flex flex-col justify-center text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="font-mono text-[9px] font-extrabold tracking-[0.3em] uppercase bg-purple-950/40 text-purple-400 border border-purple-800/40 px-2 py-0.5 rounded">
              HOLOGRAPHIC COGNITIVE ENGINE
            </span>
            <span className="w-4 h-[1px] bg-purple-500" />
            <span className="text-[9px] font-mono text-zinc-500 tracking-wider">VER 2.0.4.9</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight uppercase"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00f0ff] to-purple-400 font-black">Forge</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6 font-mono tracking-wide max-w-lg"
          >
            Dive into the deep abyssal boundaries of the ancient Forge network. Synthesize recovered cosmic relics, deploy stripe-protective thermal shields, and analyze sub-harmonic resonance vectors of remote spatial rifts.
          </motion.p>

          {/* Tabbed Spec Sheets */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-black/40 border border-zinc-800/80 rounded-xl p-4 mb-6"
          >
            <div className="grid grid-cols-3 gap-1 bg-zinc-950/90 border border-zinc-800/50 p-1 rounded-lg text-[9px] font-mono tracking-widest uppercase mb-3">
              <button 
                onClick={() => { setActiveTab('mission'); playSoundEffect('hover'); }}
                className={`py-1 rounded cursor-pointer transition-all ${activeTab === 'mission' ? 'bg-cyan-500/10 text-[#00f0ff] border border-cyan-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Mission Map
              </button>
              <button 
                onClick={() => { setActiveTab('telemetry'); playSoundEffect('hover'); }}
                className={`py-1 rounded cursor-pointer transition-all ${activeTab === 'telemetry' ? 'bg-cyan-500/10 text-[#00f0ff] border border-cyan-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Cognitive Specs
              </button>
              <button 
                onClick={() => { setActiveTab('systems'); playSoundEffect('hover'); }}
                className={`py-1 rounded cursor-pointer transition-all ${activeTab === 'systems' ? 'bg-cyan-500/10 text-[#00f0ff] border border-cyan-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Sub-Systems
              </button>
            </div>

            <div className="min-h-[105px] font-mono text-[10px] text-zinc-400 leading-relaxed">
              <AnimatePresence mode="wait">
                {activeTab === 'mission' && (
                  <motion.div
                    key="tab-mission"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center text-zinc-500 border-b border-zinc-900 pb-1.5">
                      <span>PROJECT INDEX:</span>
                      <strong className="text-white">ABYSSUM RECONSTRUCTION</strong>
                    </div>
                    <div>
                      The primary diagnostic cockpit tracks the MTD-9 freight transport vectors propagating coordinates across active seismic rifts. Deep scan analysis maps quantum signals to construct reliable orbital corridors.
                    </div>
                  </motion.div>
                )}

                {activeTab === 'telemetry' && (
                  <motion.div
                    key="tab-telemetry"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="grid grid-cols-2 gap-x-4 gap-y-2"
                  >
                    <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-500">
                      <span>CHAMBER PRESSURE:</span>
                      <strong className="text-white">12.44 λ</strong>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-500">
                      <span>SHIELD COUPLING:</span>
                      <strong className="text-cyan-400">STRIPE-98</strong>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-500">
                      <span>COAXIAL RANGE:</span>
                      <strong className="text-white">4.8 KM</strong>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-500">
                      <span>SYSTEM HARMONIC:</span>
                      <strong className="text-purple-400">144.2 Hz</strong>
                    </div>
                    <div className="col-span-2 text-zinc-500 text-[9px] mt-1 italic">
                      Diagnostic telemetry indicates all localized spatial core temperatures are currently in range.
                    </div>
                  </motion.div>
                )}

                {activeTab === 'systems' && (
                  <motion.div
                    key="tab-systems"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="grid grid-cols-2 gap-2 text-[9px] tracking-wider uppercase text-zinc-400"
                  >
                    <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded border border-zinc-905">
                      <Activity size={10} className="text-cyan-400 animate-pulse" />
                      <span>Rift Scanner</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded border border-zinc-905">
                      <Layers size={10} className="text-purple-400" />
                      <span>3D Wireframe</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded border border-zinc-905">
                      <Flame size={10} className="text-rose-400" />
                      <span>Resonance Map</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded border border-zinc-905">
                      <Radio size={10} className="text-[#00f0ff]" />
                      <span>Audio Wave Synth</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Launch Controls */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleEnterClick}
              disabled={isSynthesizing}
              className={`px-8 py-4 uppercase font-mono text-[11px] font-black tracking-[0.2em] rounded-lg transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 cursor-pointer ${
                isSynthesizing 
                  ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800' 
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black border border-transparent shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_35px_rgba(0,240,255,0.45)]'
              }`}
            >
              {isSynthesizing ? (
                <>
                  <Activity size={14} className="animate-pulse text-cyan-400" />
                  <span>INITIALIZING LINK...</span>
                </>
              ) : (
                <>
                  <Terminal size={14} className="group-hover:translate-x-1 transition-transform" />
                  <span>Enter the Console</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                ALL SYSTEMS CLEAR FOR TAKEOFF
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Hero Graphic Framing Container */}
        <div className="w-full lg:w-[48%] flex items-center justify-center relative">
          
          {/* Neon outer ambient glow */}
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-tr from-purple-500/10 to-[#00f0ff]/10 rounded-3xl blur-3xl pointer-events-none" />

          {/* Interactive Scientific Holographic Border Chassis */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative w-full aspect-square max-w-[420px] bg-black/60 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col justify-between overflow-hidden"
            onMouseEnter={() => playSoundEffect('hover')}
          >
            {/* Scientific Grid Chassis Toggles */}
            <div className="absolute top-3 left-4 text-[7px] font-mono text-cyan-400 uppercase tracking-[0.25em] pointer-events-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse" />
              TOPOGRAPHY_SCANNER.ABYSS3
            </div>
            <div className="absolute top-3 right-4 text-[7px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
              FRAME // R_CORE
            </div>

            {/* Corner Bracket Overlays */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />

            {/* Main Holographic Containment Image Slot */}
            <div className="w-full flex-1 bg-zinc-950/75 border border-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center my-6 group">
              
              {/* Image element inlining the base64 or file-copied path */}
              <img 
                src={heroImage} 
                alt="Cognitive Forge Topography" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                referrerPolicy="no-referrer"
              />

              {/* Laser focus visual overlay line sweep */}
              <div className="absolute inset-x-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent animate-scan pointer-events-none" />

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

              {/* Ambient glass glare */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/40 opacity-70 pointer-events-none" />

              {/* Floating metadata tag */}
              <div className="absolute bottom-3 left-3 bg-black/85 px-2 py-1.5 rounded border border-zinc-800 text-[7px] font-mono text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Activity size={8} className="text-cyan-400 animate-pulse" />
                <span>Topographic Wave: Decoded</span>
              </div>
            </div>

            {/* Bottom Status panel */}
            <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>SCAN DEPTH: 144.20 λ</span>
              <span>BOOT_INDEX_CY: {bootProgress}%</span>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto border-t border-zinc-800/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-mono text-zinc-500 tracking-wider">
        <div className="flex items-center gap-2">
          <span>COGNITIVE PLATFORM ACCESS SECURED</span>
          <span className="text-zinc-750">•</span>
          <span>STRIPE SAFE TRANSACTION CODES APPROVED</span>
        </div>
        <div>
          <span>© 2026 ABYSSUM SYSTEMS LTD. ALL RIGHTS SECURED.</span>
        </div>
      </footer>

    </div>
  );
};
