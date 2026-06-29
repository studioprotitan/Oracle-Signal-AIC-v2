import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Terminal, ChevronRight, Activity, Shield, Eye, Radio, Cpu, 
  Layers, Flame, Volume2, VolumeX, Database, Sliders, Check, RotateCw, 
  ArrowRight, Download, Share2, Info, ChevronLeft, HelpCircle, HardDrive,
  Play, Pause
} from 'lucide-react';
import { generateInfographic } from '../services/geminiService';

interface AshPilotForgeViewerProps {
  onBackToConsole: () => void;
  addLog: (msg: string) => void;
  addToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

// Default pre-generated images
const FRONT_VIEW_DEFAULT = '/src/assets/images/ash_pilot_default_1782659219869.jpg';
const BACK_VIEW_DEFAULT = '/src/assets/images/ash_pilot_back_view_1782659234768.jpg';

interface MeshPart {
  id: string;
  name: string;
  status: string;
  integrity: number;
  armorClass: string;
  description: string;
}

export const AshPilotForgeViewer: React.FC<AshPilotForgeViewerProps> = ({ 
  onBackToConsole, 
  addLog,
  addToast
}) => {
  // General viewer states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Rotation and 3D inspection states
  const [rotation, setRotation] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const lastSoundRef = useRef<number>(0);

  // Auto-rotation effect
  useEffect(() => {
    let animationFrameId: number;
    if (autoRotate) {
      const step = () => {
        setRotation((prev) => (prev >= 180 ? -180 : prev + 1));
        animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [autoRotate]);

  // Audio effect trigger for slider interaction
  const playRotateClick = () => {
    const now = Date.now();
    if (now - lastSoundRef.current > 70) {
      playSound('hover');
      lastSoundRef.current = now;
    }
  };

  // Center visual and custom generation states
  const [currentFrontImage, setCurrentFrontImage] = useState<string>(FRONT_VIEW_DEFAULT);
  const [currentBackImage, setCurrentBackImage] = useState<string>(BACK_VIEW_DEFAULT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activePreset, setActivePreset] = useState<string>('amber-escort');
  const [activeView, setActiveView] = useState<'both' | 'front' | 'back'>('both');

  // Head face-morph states
  const [selectedFacePreset, setSelectedFacePreset] = useState<string>('01');
  const facePresets = [
    { id: '01', name: 'Default Escort', desc: 'Standard balanced cybernetic neural mapping.' },
    { id: '02', name: 'Sharp Kinetic', desc: 'Aggressive lines optimized for supersonic G-forces.' },
    { id: '03', name: 'Strong Titanium', desc: 'Reinforced skeletal projection for heavy impacts.' },
    { id: '04', name: 'Soft Aerodynamic', desc: 'Reduced profile to minimize thermal atmospheric drag.' },
    { id: '05', name: 'Overclocked Pulse', desc: 'Maximum synapse frequency projection with high thermal venting.' },
    { id: '06', name: 'Tactical Recon', desc: 'Extended sensory socket array for telemetry capture.' },
    { id: '07', name: 'Mature Carbon', desc: 'Seasoned pilot structural profile, hardened shielding.' },
    { id: '08', name: 'Ethereal Warp', desc: 'Anomalous phase-aligned cranial profile.' },
    { id: '09', name: 'Deep Sea Heavy', desc: 'Pressure-resistant structure for high-density environments.' },
    { id: '10', name: 'Solar Flare', desc: 'Magnetic-shielded thermal absorption node structure.' }
  ];

  // DNA Calibrator values
  const [dnaValues, setDnaValues] = useState({
    cranialWidth: 0.35,
    jawWidth: 0.20,
    cheekDepth: 0.10,
    chinLength: 0.15,
    noseBridge: 0.45,
    noseWidth: 0.30,
    lipFullness: 0.40,
    browHeight: 0.25,
    eyeSize: 0.30,
    eyeSpacing: 0.15
  });

  const [activeSkinTone, setActiveSkinTone] = useState<string>('cyber-amber');
  const skinTones = [
    { id: 'carbon-black', name: 'Obsidian Matte', color: '#18181b', border: 'border-zinc-700' },
    { id: 'cyber-amber', name: 'Anodized Amber', color: '#f59e0b', border: 'border-amber-500' },
    { id: 'cobalt-blue', name: 'Warp Cobalt', color: '#3b82f6', border: 'border-blue-500' },
    { id: 'stealth-grey', name: 'Tactical Slate', color: '#64748b', border: 'border-slate-500' },
    { id: 'void-crimson', name: 'Resonance Crimson', color: '#ef4444', border: 'border-rose-500' },
    { id: 'hologram-cyan', name: 'Glitch Cyan', color: '#06b6d4', border: 'border-cyan-500' }
  ];

  // Visor options
  const [selectedVisor, setSelectedVisor] = useState<string>('03');
  const visorOptions = [
    { id: '01', name: 'Clear Spectrograph', color: 'bg-zinc-300 text-black', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.4)]', rgb: 'rgb(244,244,245)' },
    { id: '02', name: 'Smoke Polarization', color: 'bg-zinc-800 text-zinc-300', glow: 'shadow-[0_0_15px_rgba(30,30,30,0.5)]', rgb: 'rgb(39,39,42)' },
    { id: '03', name: 'Blazing Amber', color: 'bg-amber-500 text-black', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]', rgb: 'rgb(245,158,11)' },
    { id: '04', name: 'Rift Crimson', color: 'bg-rose-600 text-white', glow: 'shadow-[0_0_20px_rgba(225,29,72,0.6)]', rgb: 'rgb(225,29,72)' },
    { id: '05', name: 'Mirrored Chrome', color: 'bg-slate-200 text-zinc-900', glow: 'shadow-[0_0_15px_rgba(226,232,240,0.4)]', rgb: 'rgb(226,232,240)' },
    { id: '06', name: 'Quantum Holo-Visor', color: 'bg-cyan-500 text-black', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.7)]', rgb: 'rgb(6,182,212)' }
  ];

  // Separated Mesh Parts
  const [selectedPartId, setSelectedPartId] = useState<string>('chest');
  const meshParts: MeshPart[] = [
    { id: 'neck', name: 'Neck Shield Guard', status: 'CALIBRATED', integrity: 99.4, armorClass: 'T-9 Carbon', description: 'Thermal-protection collar supporting cognitive neural helmet connection.' },
    { id: 'chest', name: 'Chest Exo-Plate', status: 'OPTIMIZED', integrity: 100.0, armorClass: 'V-2 Titanium Alloy', description: 'Heavy chest armor enclosing the central miniature fusion pulse battery.' },
    { id: 'back', name: 'Back Kinetic Pod', status: 'NOMINAL', integrity: 97.8, armorClass: 'S-Grade Composite', description: 'Houses the twin micro-thruster propellant chambers and telemetry array.' },
    { id: 'shoulders', name: 'Shoulder Pauldrons', status: 'OPTIMIZED', integrity: 99.1, armorClass: 'V-2 Titanium Alloy', description: 'Articulated composite shields deflecting heavy trajectory orbital debris.' },
    { id: 'arms', name: 'Forearm Actuators', status: 'NOMINAL', integrity: 98.4, armorClass: 'T-9 Carbon', description: 'Reinforced servo assemblies providing high mechanical dexterity.' },
    { id: 'gloves', name: 'Haptic Electro-Gloves', status: 'ACTIVE', integrity: 100.0, armorClass: 'Fabric Weave', description: 'Precision interface gloves featuring real-time biometric neural nodes.' },
    { id: 'belt', name: 'Utility Rigging Belt', status: 'SECURED', integrity: 96.5, armorClass: 'Reinforced Polymer', description: 'Anchors auxiliary battery cell links and magnetic weapon clamp couplers.' },
    { id: 'hips', name: 'Hip Trajectory Shunts', status: 'NOMINAL', integrity: 98.0, armorClass: 'S-Grade Composite', description: 'Sideways thrust micro-injectors to assist high-mobility jump-sequences.' },
    { id: 'knees', name: 'Knee Shock Absorbers', status: 'OPTIMIZED', integrity: 99.5, armorClass: 'V-2 Titanium Alloy', description: 'Pneumatic shock dampers designed specifically to cushion 15M jump descents.' },
    { id: 'boots', name: 'Magnetic Grav-Boots', status: 'NOMINAL', integrity: 100.0, armorClass: 'Steel Composite', description: 'Soles embedded with active magnets for stable train hull adherence.' }
  ];

  const selectedPart = meshParts.find(p => p.id === selectedPartId) || meshParts[1];

  // Materials state
  const [activeMaterial, setActiveMaterial] = useState<string>('composite');
  const materials = [
    { id: 'composite', name: 'ARMOR COMPOSITE', spec: 'Density: 4.8 g/cm³', conductivity: 'Non-conductive' },
    { id: 'fabric', name: 'FABRIC WEAVE', spec: 'Friction: Ultra-low', conductivity: 'Thermal Insulator' },
    { id: 'rubber', name: 'RUBBER SEAL', spec: 'Elasticity: 450%', conductivity: 'Hermetic Void Seal' },
    { id: 'alloy', name: 'METAL ALLOY', spec: 'Hardness: 1200 HV', conductivity: 'Super-conductor' },
    { id: 'energy', name: 'ENERGY CORE', spec: 'Output: 1.4 GW', conductivity: 'Plasma Waveform' }
  ];

  // Play retro/cyber synth sound effects
  const playSound = (type: 'hover' | 'click' | 'forge' | 'calibrate') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'calibrate') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, now);
        osc1.frequency.exponentialRampToValueAtTime(165, now + 0.6);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110, now);
        osc2.frequency.exponentialRampToValueAtTime(220, now + 0.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.6);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
      } else if (type === 'forge') {
        // Long energetic sci-fi sequence
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const gain = ctx.createGain();
        const modGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 80;

        mod.type = 'sine';
        mod.frequency.value = 6; // LFO modulation speed

        modGain.gain.setValueAtTime(45, now);
        modGain.gain.exponentialRampToValueAtTime(120, now + 1.5);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        mod.start(now);
        osc.stop(now + 2.0);
        mod.stop(now + 2.0);
      }
    } catch (e) {
      console.warn("Audio failed: ", e);
    }
  };

  // Preset quick config triggers
  const handlePresetChange = (presetId: string) => {
    setActivePreset(presetId);
    playSound('click');
    let pPrompt = '';

    if (presetId === 'amber-escort') {
      setDnaValues({
        cranialWidth: 0.35, jawWidth: 0.20, cheekDepth: 0.10, chinLength: 0.15,
        noseBridge: 0.45, noseWidth: 0.30, lipFullness: 0.40, browHeight: 0.25,
        eyeSize: 0.30, eyeSpacing: 0.15
      });
      setSelectedVisor('03'); // Amber
      setActiveSkinTone('cyber-amber');
      setCurrentFrontImage(FRONT_VIEW_DEFAULT);
      setCurrentBackImage(BACK_VIEW_DEFAULT);
      addLog("PILOT CONFIG // REVERTED TO BLAZING AMBER TRAIN ESCORT DEFAULT");
      addToast("Amber Escort configuration restored.", "info");
    } else if (presetId === 'matte-stealth') {
      setDnaValues({
        cranialWidth: 0.28, jawWidth: 0.15, cheekDepth: 0.35, chinLength: 0.10,
        noseBridge: 0.60, noseWidth: 0.20, lipFullness: 0.25, browHeight: 0.40,
        eyeSize: 0.25, eyeSpacing: 0.20
      });
      setSelectedVisor('02'); // Smoke
      setActiveSkinTone('carbon-black');
      pPrompt = "Sleek tactical stealth pilot standing in hangar. Symmetrical full body power suit with carbon-black composite plates and polarized smoke glass visor, purple neural accent lights, high-mobility jump-thruster gear, volumetric shadows, cinematic concept art, highly detailed.";
      addLog("PILOT CONFIG // APPLYING MATTE STEALTH CONTEXT INJECTOR");
      addToast("Applying Matte Stealth configuration presets...", "info");
      triggerForgeWithPrompt(pPrompt, 'matte-stealth');
    } else if (presetId === 'quantum-holo') {
      setDnaValues({
        cranialWidth: 0.42, jawWidth: 0.30, cheekDepth: 0.05, chinLength: 0.25,
        noseBridge: 0.30, noseWidth: 0.40, lipFullness: 0.50, browHeight: 0.15,
        eyeSize: 0.45, eyeSpacing: 0.10
      });
      setSelectedVisor('06'); // Holographic
      setActiveSkinTone('hologram-cyan');
      pPrompt = "Ethereal warp-pilot standing in high-tech reactor chamber. Glowing neon-cyan and chrome-plated power armor suit, holographic visored tactical HUD, light reflections on titanium plates, energy sparks, 3D render UE5.";
      addLog("PILOT CONFIG // DEPLOYING QUANTUM HOLO-VISOR INJECTOR");
      addToast("Loading Holographic Quantum suit specs...", "info");
      triggerForgeWithPrompt(pPrompt, 'quantum-holo');
    } else if (presetId === 'void-crimson') {
      setDnaValues({
        cranialWidth: 0.50, jawWidth: 0.45, cheekDepth: 0.20, chinLength: 0.30,
        noseBridge: 0.50, noseWidth: 0.35, lipFullness: 0.30, browHeight: 0.35,
        eyeSize: 0.35, eyeSpacing: 0.25
      });
      setSelectedVisor('04'); // Red
      setActiveSkinTone('void-crimson');
      pPrompt = "Symmetrical full body pilot in heavy void-crimson combat suit, blazing ruby chest power core, high-mobility micro-thrusters, dark metal armor plates with neon red circuitry patterns, epic 3D cinematic rendering.";
      addLog("PILOT CONFIG // ENGAGING VOID-CRIMSON TRAJECTORY SCHEMATICS");
      addToast("Deploying Void Crimson tactical specs...", "info");
      triggerForgeWithPrompt(pPrompt, 'void-crimson');
    }
  };

  // Perform DNA calibration updates
  const handleCalibrateDNA = () => {
    playSound('calibrate');
    addLog(`CALIBRATOR // DNA RE-ALIGNMENT: Cranial:${dnaValues.cranialWidth} / Jaw:${dnaValues.jawWidth} / Cheek:${dnaValues.cheekDepth}`);
    addToast("DNA Cranial parameters applied to pilot head mesh.", "success");
  };

  // Trigger Gemini API to generate custom suit
  const triggerForgeWithPrompt = async (promptText: string, presetName?: string) => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    playSound('forge');
    addLog(`FORGE // SENT SYNTHESIS ORDER FOR PILOT SUIT ARTIFACTS`);
    
    try {
      const response = await generateInfographic(promptText);
      if (response && response.base64) {
        const imageUri = response.mimeType === 'image/svg+xml'
          ? `data:image/svg+xml;base64,${response.base64}`
          : `data:${response.mimeType};base64,${response.base64}`;
        
        setCurrentFrontImage(imageUri);
        // Add a nice cybernetic visual modifier or mirrored effect for the back view if a custom one is built
        setCurrentBackImage(imageUri); // In custom, we show the spectacular main visual
        
        addLog(`FORGE // SYNTHESIS COMPLETED SUCCESSFULLY FOR CUSTOM PILOT`);
        addToast(`Successfully synthesized "${presetName || 'custom'} suit" via Moai Forge.`, "success");
      }
    } catch (e: any) {
      addLog(`FORGE ERROR // GEMINI GENERATION INTERRUPTED: ${e.message}`);
      addToast("Holographic synthesis failed. Using offline hardware cache.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomForgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    triggerForgeWithPrompt(customPrompt);
  };

  // Downloader for calibrated blueprints
  const handleDownloadSpecs = () => {
    const specSheet = `ASH-BORN PROTOCOL PILOT REGISTRY
===================================================
DESIGNATION : CST-ERT TRAIN ESCORT PULSE GUNNER
HEIGHT      : 1.80 METERS
SCALE       : RELATIVE 1.00 (AGILITY & MOBILITY)
CREATOR ID  : Moai Forge Station Alpha

[FACE MORPH CALIBRATIONS]
- Face Preset Index   : ${selectedFacePreset}
- Skin Tone Matrix    : ${activeSkinTone.toUpperCase()}
- Visor Optic Shade   : ${visorOptions.find(v => v.id === selectedVisor)?.name || 'UNKNOWN'}

[ASH-BORN DNA STRUCTAL MAP]
- Cranial Width       : ${dnaValues.cranialWidth}
- Jaw Line Profile    : ${dnaValues.jawWidth}
- Cheek Bone Depth    : ${dnaValues.cheekDepth}
- Chin Point Length   : ${dnaValues.chinLength}
- Bridge Alignment    : ${dnaValues.noseBridge}
- Nose Wing Width     : ${dnaValues.noseWidth}
- Oral Fullness       : ${dnaValues.lipFullness}
- Brow Ridge Height   : ${dnaValues.browHeight}
- Eye Pupil Diameter  : ${dnaValues.eyeSize}
- Eye Socket Orbit    : ${dnaValues.eyeSpacing}

[ACTIVE ARMOR HARDWARE SPECS]
- Component Selected  : ${selectedPart.name}
- Fabricated Class    : ${selectedPart.armorClass}
- Integrity Rating    : ${selectedPart.integrity}%
- Structural State    : ${selectedPart.status}
- Material Sub-Type   : ${materials.find(m => m.id === activeMaterial)?.name || 'COMPOSITE'}

===================================================
SIGNATURE ENCRYPTED // MOAI FORGE PROTOCOL BUNDLE`;

    const blob = new Blob([specSheet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `ash_pilot_specs_${selectedFacePreset}_${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addLog("EXPORTER // BLUEPRINT CALIBRATIONS SAVED TO FILE SUCCESSFULLY");
    addToast("Blueprint calibration specs exported.", "success");
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#060405] text-zinc-100 flex flex-col justify-between overflow-x-hidden relative p-4 md:p-6 font-sans select-none">
      
      {/* Scientific Overlay Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/15 via-[#060405] to-black opacity-90 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Header Panel */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playSound('click'); onBackToConsole(); }}
            className="p-2 rounded border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-950/10 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest"
            title="Return to the Main Terminal Console"
          >
            <ChevronLeft size={14} />
            <span>TERMINAL</span>
          </button>
          
          <div className="h-6 w-[1px] bg-zinc-800" />
          
          <div>
            <h1 className="text-sm font-black tracking-[0.25em] text-white uppercase font-sans flex items-center gap-1.5">
              <span className="text-amber-500 animate-pulse">ASH PILOT FORGE</span>
              <span className="text-zinc-650 font-light text-[9px] font-mono tracking-widest">v4.92</span>
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-amber-500/80 uppercase">
              CST-ERT TRAIN ESCORT PULSE CANNON GUNNER COCKPIT
            </p>
          </div>
        </div>

        {/* Diagnostic Metadata Labels */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="px-3 py-1.5 bg-black/60 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400 tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            FORGE DECK SECURE: LINK_F-9
          </div>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              soundEnabled 
                ? 'bg-amber-500/5 border-amber-500/30 text-amber-400' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Cockpit Hum Synthesis"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="font-mono text-[9px] uppercase tracking-wider hidden sm:inline">
              {soundEnabled ? 'SENSORY HUM ON' : 'AUDIO OFF'}
            </span>
          </button>
        </div>
      </header>

      {/* Interactive Main Board Grid */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 my-5">
        
        {/* ======================================= */}
        {/* LEFT COLUMN: Head Morph & DNA Calibrator */}
        {/* ======================================= */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Head Face Morph preset board */}
          <div className="glass-panel border-zinc-800/80 rounded-xl p-4 flex flex-col bg-black/35 relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[7px] font-mono text-zinc-650 uppercase tracking-widest leading-none">
              CALIBRATOR_H
            </div>
            
            <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-200 uppercase border-b border-zinc-800/50 pb-2 mb-3 flex items-center gap-1.5">
              <Eye size={12} className="text-amber-500 animate-pulse" />
              Head Mesh / Face Morph
            </h2>

            {/* Presets grid */}
            <div className="grid grid-cols-5 gap-1.5 mb-3.5">
              {facePresets.map((p) => {
                const isActive = selectedFacePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedFacePreset(p.id);
                      playSound('click');
                      addLog(`FACE PRESET // APPLIED HEAD SYNAPSE GRID [${p.id} - ${p.name.toUpperCase()}]`);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className={`aspect-square rounded border transition-all duration-300 flex flex-col items-center justify-center relative cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'bg-zinc-950/70 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                    title={p.name}
                  >
                    <span className="text-[10px] font-mono tracking-tighter">{p.id}</span>
                    {isActive && (
                      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Morph Description Display */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded p-2 text-[9px] font-mono text-zinc-400">
              <div className="text-[8px] text-zinc-600 uppercase tracking-wider mb-0.5">ACTIVE COGNITIVE CELL</div>
              <div className="text-zinc-100 font-bold uppercase mb-1">
                {facePresets.find(p => p.id === selectedFacePreset)?.name}
              </div>
              <p className="leading-relaxed text-zinc-450 italic">
                "{facePresets.find(p => p.id === selectedFacePreset)?.desc}"
              </p>
            </div>
          </div>

          {/* DNA structural calibrator panel */}
          <div className="glass-panel border-zinc-800/80 rounded-xl p-4 flex flex-col bg-black/35 relative overflow-hidden flex-1 justify-between">
            <div className="absolute top-2 right-3 text-[7px] font-mono text-zinc-650 uppercase tracking-widest leading-none">
              BIOMETRIC_GEN
            </div>
            
            <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-200 uppercase border-b border-zinc-800/50 pb-2 mb-3.5 flex items-center gap-1.5">
              <Sliders size={12} className="text-amber-500" />
              Ash-Born DNA Calibrator
            </h2>

            {/* Swirling DNA / Sliders Grid split layout */}
            <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto no-scrollbar mb-3">
              
              {/* Animated DNA visualizer */}
              <div className="h-10 bg-zinc-950/70 border border-zinc-900 rounded flex items-center justify-center overflow-hidden relative p-1.5 gap-0.5">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-950/10 via-transparent to-amber-950/10 pointer-events-none" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const delay = i * 0.1;
                  const height1 = 12 + Math.sin(i * 0.5) * 8;
                  const height2 = 12 - Math.sin(i * 0.5) * 8;
                  return (
                    <div key={i} className="flex flex-col items-center justify-between h-full w-[2.5px] select-none pointer-events-none">
                      <motion.div 
                        className="w-[2.5px] bg-amber-500 rounded-full"
                        animate={{ height: [height1, height2, height1] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay }}
                      />
                      <div className="w-[1px] h-2 bg-zinc-800" />
                      <motion.div 
                        className="w-[2.5px] bg-cyan-500 rounded-full"
                        animate={{ height: [height2, height1, height2] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Sliders list */}
              <div className="flex flex-col gap-2.5">
                {Object.entries(dnaValues).map(([key, val]) => {
                  const value = val as number;
                  const cleanLabel = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-500">
                        <span>{cleanLabel}</span>
                        <span className="text-amber-500 font-bold font-mono">{value.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.05"
                          max="0.95"
                          step="0.05"
                          value={value}
                          onChange={(e) => {
                            setDnaValues(prev => ({ ...prev, [key]: parseFloat(e.target.value) }));
                          }}
                          onMouseEnter={() => playSound('hover')}
                          className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Skin Tone Palette Swatches */}
              <div className="mt-2.5 border-t border-zinc-900 pt-2.5">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-2">Selected Anodized Skin Tone</span>
                <div className="flex justify-between gap-1">
                  {skinTones.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSkinTone(s.id);
                        playSound('click');
                        addLog(`SKIN SWATCH // APPLIED RE-RESISTANCE TONE SPEC: [${s.name.toUpperCase()}]`);
                      }}
                      onMouseEnter={() => playSound('hover')}
                      className={`w-7 h-7 rounded-md transition-all relative flex items-center justify-center border-2 cursor-pointer ${
                        activeSkinTone === s.id 
                          ? `${s.border} scale-110 shadow-[0_0_8px_var(--tw-border-color)] z-10` 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: s.color }}
                      title={s.name}
                    >
                      {activeSkinTone === s.id && (
                        <Check size={11} className={s.id === 'carbon-black' ? 'text-white' : 'text-zinc-950'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Calibrate applying trigger button */}
            <button
              onClick={handleCalibrateDNA}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-[9px] font-black tracking-[0.2em] rounded-md transition-all flex items-center justify-center gap-1.5 uppercase hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer active:scale-95 shrink-0"
            >
              <Cpu size={12} />
              <span>CALIBRATE & APPLY MESH</span>
            </button>

          </div>

        </section>

        {/* ======================================= */}
        {/* CENTER COLUMN: Pilot Suit Hologram Viewer */}
        {/* ======================================= */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Main Visual Chassis Box */}
          <div className="glass-panel border-zinc-800/80 rounded-xl p-4 flex flex-col bg-black/55 relative overflow-hidden flex-1 justify-between min-h-[420px]">
            
            {/* Scientific details overlay */}
            <div className="absolute top-3 left-4 text-[7px] font-mono text-amber-500 uppercase tracking-[0.25em] pointer-events-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              TOPOGRAPHIC_PILOT_SCAN.ABYSS9
            </div>
            <div className="absolute top-3 right-4 text-[7px] font-mono text-zinc-650 uppercase tracking-widest pointer-events-none">
              SUIT_RELIC // ANCHOR_CY
            </div>

            {/* Corner Bracket Overlays */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/30 pointer-events-none" />

            {/* View Mode controls header */}
            <div className="flex justify-between items-center mt-5 mb-3">
              <div className="flex gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-900 text-[8px] font-mono">
                <button
                  onClick={() => { setActiveView('both'); playSound('click'); }}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${activeView === 'both' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  RELATIVE SCALE (BOTH)
                </button>
                <button
                  onClick={() => { setActiveView('front'); playSound('click'); }}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${activeView === 'front' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  FRONT VIEW
                </button>
                <button
                  onClick={() => { setActiveView('back'); playSound('click'); }}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${activeView === 'back' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  BACK DETAILS
                </button>
              </div>

              <div className="text-[8px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                <span>VISOR HUD APPLIED:</span>
                <span className="text-amber-500 font-bold bg-amber-950/40 border border-amber-900/50 px-1 py-0.2 rounded">
                  {visorOptions.find(v => v.id === selectedVisor)?.name}
                </span>
              </div>
            </div>

            {/* Main Holographic Image display core */}
            <div className="flex-1 bg-zinc-950/70 border border-zinc-900/80 rounded-lg relative overflow-hidden flex items-center justify-center gap-4 p-4 min-h-[300px]">
              
              {isGenerating ? (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
                    <Cpu size={24} className="text-amber-500 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-black text-amber-400 tracking-[0.25em] uppercase animate-pulse">GENERATING HOLO-SPECS...</span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">SYNTHESIZING COAXIAL COMPOSITES VIA GEMINI API</span>
                  </div>
                  <div className="w-48 h-1 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
                    <div className="h-full bg-amber-500 animate-[pulse_1.5s_infinite] w-[75%]" />
                  </div>
                </div>
              ) : null}

              {/* Images container layout based on view state */}
              <div 
                className="w-full h-full flex items-center justify-center gap-6 relative select-none"
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                
                {/* Front view card */}
                {(activeView === 'both' || activeView === 'front') && (
                  <motion.div 
                    layout
                    style={{ 
                      transform: `rotateY(${rotation}deg)`,
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "visible"
                    }}
                    className="relative flex-1 h-full max-h-[360px] rounded-lg border border-zinc-900 overflow-hidden bg-black/40 group flex flex-col justify-between"
                  >
                    <img 
                      src={currentFrontImage} 
                      alt="Ash Pilot suit front render" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Laser scanning beam */}
                    <div className="absolute inset-x-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent animate-scan pointer-events-none" />

                    {/* Visor HUD indicator glowing layer on top */}
                    <div 
                      className="absolute inset-0 pointer-events-none border opacity-45 mix-blend-screen transition-all duration-300"
                      style={{ 
                        boxShadow: `inset 0 0 35px ${visorOptions.find(v => v.id === selectedVisor)?.rgb || 'rgb(245,158,11)'}`,
                        borderColor: visorOptions.find(v => v.id === selectedVisor)?.rgb || 'rgba(245,158,11,0.2)'
                      }} 
                    />

                    {/* Metadata flag */}
                    <div className="absolute bottom-2 left-2 bg-black/85 px-1.5 py-1 rounded border border-zinc-800 text-[6.5px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Activity size={7} className="text-amber-500 animate-pulse" />
                      <span>FRONT_SCALE_1.00</span>
                    </div>
                  </motion.div>
                )}

                {/* Back view card */}
                {(activeView === 'both' || activeView === 'back') && (
                  <motion.div 
                    layout
                    style={{ 
                      transform: `rotateY(${-rotation}deg)`,
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "visible"
                    }}
                    className="relative flex-1 h-full max-h-[360px] rounded-lg border border-zinc-900 overflow-hidden bg-black/40 group flex flex-col justify-between"
                  >
                    <img 
                      src={currentBackImage} 
                      alt="Ash Pilot suit back render" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Laser scanning beam */}
                    <div className="absolute inset-x-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-scan pointer-events-none" />

                    {/* Visor HUD indicator glowing layer on top */}
                    <div 
                      className="absolute inset-0 pointer-events-none border opacity-45 mix-blend-screen transition-all duration-300"
                      style={{ 
                        boxShadow: `inset 0 0 35px ${visorOptions.find(v => v.id === selectedVisor)?.rgb || 'rgb(245,158,11)'}`,
                        borderColor: visorOptions.find(v => v.id === selectedVisor)?.rgb || 'rgba(245,158,11,0.2)'
                      }} 
                    />

                    {/* Metadata flag */}
                    <div className="absolute bottom-2 left-2 bg-black/85 px-1.5 py-1 rounded border border-zinc-800 text-[6.5px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Activity size={7} className="text-cyan-400 animate-pulse" />
                      <span>BACK_PROPULSION_98%</span>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Floating Grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />

            </div>

            {/* 3D Model Manual Rotation Control Slider */}
            <div className="mt-4 bg-zinc-950/80 border border-zinc-900 rounded-lg p-3.5 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-0.5">
                <div className="flex items-center gap-2">
                  <RotateCw 
                    size={13} 
                    className={`text-amber-500 ${autoRotate ? 'animate-spin' : ''}`} 
                    style={{ animationDuration: '6s' }}
                  />
                  <span className="text-[10px] font-mono font-black tracking-widest text-zinc-200 uppercase">
                    Holo-Model Rotation Console
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
                  <span>YAW AXIS:</span>
                  <span className="text-amber-500 font-bold bg-amber-950/40 border border-amber-900/50 px-1.5 py-0.2 rounded font-mono">
                    {rotation > 0 ? `+${rotation}` : rotation}°
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Degree range indicator and Slider input */}
                <div className="flex-1 w-full flex flex-col gap-1.5">
                  <div className="flex justify-between text-[7.5px] font-mono text-zinc-650 px-1">
                    <span>-180° PORT</span>
                    <span>-90°</span>
                    <span className={rotation === 0 ? "text-amber-500 font-bold" : ""}>0° ALIGN</span>
                    <span>+90°</span>
                    <span>+180° STBD</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={rotation}
                      onChange={(e) => {
                        setRotation(parseInt(e.target.value));
                        setAutoRotate(false); // disable auto-orbit on manual drag
                        playRotateClick();
                      }}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Controls: Auto-Orbit Toggle & Reset */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setAutoRotate(!autoRotate);
                      playSound('click');
                      addLog(`ROTATION // ${!autoRotate ? 'ENGAGED AUTOMATIC ORBIT SPEED L-1' : 'HALTED AUTOMATIC ORBIT SYSTEM'}`);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className={`px-3 py-1.5 rounded font-mono text-[9px] tracking-wider uppercase border cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
                      autoRotate
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                        : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                    title="Toggle continuous 360° rotation"
                  >
                    {autoRotate ? <Pause size={10} /> : <Play size={10} />}
                    <span>{autoRotate ? 'PAUSE ORBIT' : 'AUTO ORBIT'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setRotation(0);
                      setAutoRotate(false);
                      playSound('calibrate');
                      addLog("ROTATION // RE-CALIBRATED MODEL YAW TO DIRECT CENTER 0°");
                      addToast("Model rotation reset to 0°", "success");
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="px-2.5 py-1.5 bg-zinc-950/60 border border-zinc-850 hover:border-zinc-700 hover:text-zinc-200 text-zinc-500 rounded font-mono text-[9px] tracking-wider uppercase cursor-pointer transition-all duration-200"
                    title="Reset yaw rotation angle to zero"
                  >
                    <span>RESET</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Linked Image Generator Interface (Forge Input) */}
            <div className="mt-4 border-t border-zinc-800/60 pt-4 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-500 uppercase">
                <span>Forge context presets</span>
                <span>Custom spec prompt linked</span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-1.5 text-[8px] font-mono">
                <button
                  onClick={() => handlePresetChange('amber-escort')}
                  onMouseEnter={() => playSound('hover')}
                  className={`py-1 rounded border transition-all uppercase cursor-pointer ${activePreset === 'amber-escort' ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-950/60 border-zinc-900 text-zinc-450 hover:text-zinc-200'}`}
                >
                  Amber Escort
                </button>
                <button
                  onClick={() => handlePresetChange('matte-stealth')}
                  onMouseEnter={() => playSound('hover')}
                  className={`py-1 rounded border transition-all uppercase cursor-pointer ${activePreset === 'matte-stealth' ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-950/60 border-zinc-900 text-zinc-450 hover:text-zinc-200'}`}
                >
                  Matte Stealth
                </button>
                <button
                  onClick={() => handlePresetChange('quantum-holo')}
                  onMouseEnter={() => playSound('hover')}
                  className={`py-1 rounded border transition-all uppercase cursor-pointer ${activePreset === 'quantum-holo' ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-950/60 border-zinc-900 text-zinc-450 hover:text-zinc-200'}`}
                >
                  Quantum Holo
                </button>
                <button
                  onClick={() => handlePresetChange('void-crimson')}
                  onMouseEnter={() => playSound('hover')}
                  className={`py-1 rounded border transition-all uppercase cursor-pointer ${activePreset === 'void-crimson' ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-950/60 border-zinc-900 text-zinc-450 hover:text-zinc-200'}`}
                >
                  Void Crimson
                </button>
              </div>

              {/* Textarea for custom prompt synthesis */}
              <form onSubmit={handleCustomForgeSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="SPECIFY CUSTOM HOLO-SUIT PROMPT FOR SYNTHESIS..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onMouseEnter={() => playSound('hover')}
                  className="flex-1 bg-zinc-950/90 border border-zinc-850 focus:border-amber-500/40 rounded px-3 py-2 text-[10px] font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none tracking-widest uppercase focus:shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !customPrompt.trim()}
                  className="px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-mono text-[9px] font-black tracking-widest rounded transition-all uppercase hover:shadow-[0_0_12px_rgba(245,158,11,0.35)] cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:hover:shadow-none flex items-center gap-1.5"
                >
                  <Sparkles size={11} className="animate-pulse" />
                  <span>SYNTH</span>
                </button>
              </form>

            </div>

            {/* Bottom panel status indicators */}
            <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-600 uppercase tracking-widest mt-3">
              <span>FORGE DEPTH: LEVEL 4B // CORE TEMPERATURE: STABLE</span>
              <span>RENDER COAXIAL RATIO: 16:9 // METADATA: LOCKED</span>
            </div>

          </div>

        </section>

        {/* ======================================= */}
        {/* RIGHT COLUMN: Mesh Parts & Visor Options */}
        {/* ======================================= */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Separated Mesh Parts grid panel */}
          <div className="glass-panel border-zinc-800/80 rounded-xl p-4 flex flex-col bg-black/35 relative overflow-hidden flex-1 justify-between">
            <div className="absolute top-2 right-3 text-[7px] font-mono text-zinc-650 uppercase tracking-widest leading-none">
              MESH_PARTS
            </div>
            
            <div>
              <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-200 uppercase border-b border-zinc-800/50 pb-2 mb-3 flex items-center gap-1.5">
                <Layers size={12} className="text-amber-500" />
                Separated Mesh Parts
              </h2>

              {/* Mesh list select board */}
              <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar mb-3">
                {meshParts.map((p) => {
                  const isActive = selectedPartId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPartId(p.id);
                        playSound('click');
                        addLog(`MESH SELECTION // DIRECTING DIAGNOSTICS TO: [${p.name.toUpperCase()}]`);
                      }}
                      onMouseEnter={() => playSound('hover')}
                      className={`w-full p-2 text-left rounded border transition-all duration-200 flex justify-between items-center cursor-pointer ${
                        isActive 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                          : 'bg-zinc-950/70 border-zinc-900/60 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase tracking-wide truncate max-w-[140px]">
                        {p.name}
                      </span>
                      <span className="text-[7.5px] font-mono bg-zinc-950 border border-zinc-850 px-1 py-0.2 rounded text-zinc-500">
                        {p.status}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Part Detail Specs card */}
              <div className="bg-zinc-950/60 border border-zinc-900 rounded p-3 text-[9.5px] font-mono text-zinc-400 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[7.5px] text-zinc-600 uppercase border-b border-zinc-900 pb-1.5">
                  <span>Part Details Dashboard</span>
                  <span>{selectedPart.id.toUpperCase()}_CELL</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[8px] uppercase">Active Assembly Name</span>
                  <strong className="text-white text-[10px] uppercase">{selectedPart.name}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase">Armor Composite</span>
                    <span className="text-amber-500 font-bold">{selectedPart.armorClass}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase">Integrity Rating</span>
                    <span className="text-emerald-400 font-bold">{selectedPart.integrity.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-zinc-450 italic mt-1 border-t border-zinc-900/50 pt-1.5 leading-normal">
                  "{selectedPart.description}"
                </p>
              </div>
            </div>

            {/* Quick calibration blueprints export */}
            <div className="mt-3 border-t border-zinc-800/60 pt-3">
              <button
                onClick={handleDownloadSpecs}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-amber-500/25 hover:border-amber-500 text-amber-400 text-[9px] font-mono font-bold tracking-[0.15em] uppercase rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download size={12} />
                <span>EXPORT BLUEPRINT SPEC</span>
              </button>
            </div>

          </div>

          {/* Helmet System & Visor Options */}
          <div className="glass-panel border-zinc-800/80 rounded-xl p-4 flex flex-col bg-black/35 relative overflow-hidden justify-between">
            <div className="absolute top-2 right-3 text-[7px] font-mono text-zinc-650 uppercase tracking-widest leading-none">
              HELMET_SYS
            </div>
            
            <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-200 uppercase border-b border-zinc-800/50 pb-2 mb-3.5 flex items-center gap-1.5">
              <Radio size={12} className="text-amber-500" />
              Visor Shade Option
            </h2>

            {/* Visors list */}
            <div className="flex flex-col gap-2.5 flex-1 justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-1">Select Visor Optic</span>
                <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                  {visorOptions.map((v) => {
                    const isActive = selectedVisor === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVisor(v.id);
                          playSound('click');
                          addLog(`VISOR OPTIC // RE-TUNING TRAJECTORY SHADE: [${v.name.toUpperCase()}]`);
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className={`p-2 rounded text-left border transition-all truncate cursor-pointer ${
                          isActive 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                            : 'bg-zinc-950/70 border-zinc-900 text-zinc-500 hover:text-zinc-200 hover:border-zinc-800'
                        }`}
                        title={v.name}
                      >
                        <span className="text-[7.5px] tracking-tighter mr-1 font-semibold">{v.id}</span>
                        {v.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Material breakdown texture options */}
              <div className="border-t border-zinc-900 pt-3 mt-1 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-500 uppercase">
                  <span>Material Breakdown</span>
                  <span>Core Specs</span>
                </div>
                
                <div className="flex gap-1">
                  {materials.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveMaterial(m.id);
                        playSound('click');
                        addLog(`MATERIAL COMPOSITE // SHIFTED ACTIVE SAMPLE TO [${m.name}]`);
                      }}
                      onMouseEnter={() => playSound('hover')}
                      className={`flex-1 py-1 text-[7px] font-mono border rounded uppercase text-center transition-all cursor-pointer ${
                        activeMaterial === m.id 
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]' 
                          : 'bg-zinc-950/80 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title={`${m.name} // ${m.spec}`}
                    >
                      {m.id.substring(0, 3)}
                    </button>
                  ))}
                </div>

                <div className="bg-zinc-950/50 border border-zinc-900/60 rounded p-2 text-[8.5px] font-mono text-zinc-450 flex justify-between items-center select-none pointer-events-none">
                  <span>SPEC: {materials.find(m => m.id === activeMaterial)?.spec}</span>
                  <span className="text-[7.5px] text-zinc-650">•</span>
                  <span>{materials.find(m => m.id === activeMaterial)?.conductivity}</span>
                </div>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* Footer System labels */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto border-t border-zinc-800/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-mono text-zinc-500 tracking-wider">
        <div className="flex items-center gap-2">
          <span>ASH-BORN PROTOCOL BY MOAI FORGE STATION</span>
          <span className="text-zinc-750">•</span>
          <span>DIAGNOSTICS: COMPLETED SECURE</span>
        </div>
        <div>
          <span>© 2026 MOAI FORGE ARCHIVES. ALL SPEC-BLUEPRINTS LOCKED.</span>
        </div>
      </footer>

    </div>
  );
};
