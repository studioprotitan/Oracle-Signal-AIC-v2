import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BarChart2, Radio, Sliders, Volume2, AudioLines } from "lucide-react";

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  motionIntensity: number;
  isAwakened?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyserNode,
  motionIntensity,
  isAwakened = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [visualMode, setVisualMode] = useState<"waveform" | "spectrum">("waveform");
  const [rmsVolume, setRmsVolume] = useState<number>(0);
  const [peakAmp, setPeakAmp] = useState<number>(0);

  // Computed live base pitch based on application coordinates
  const livePitch = 50 + motionIntensity * 1.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Allocate data buffer for analyzer
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 256;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // Background clear
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(0, 0, width, height);

      // Cyber grid background lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal grid lines
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw horizontal baseline center line
      ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isAwakened) {
        // Draw deep purple heavy gravity-wave rift resonance background plasma lines
        const pulse = Math.sin(Date.now() * 0.003) * 12 + 12;
        ctx.strokeStyle = "rgba(168, 85, 247, 0.16)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2 - pulse);
        ctx.lineTo(width, height / 2 - pulse);
        ctx.moveTo(0, height / 2 + pulse);
        ctx.lineTo(width, height / 2 + pulse);
        ctx.stroke();

        // Extra vibrating sub-atomic energy grid glow in center
        ctx.fillStyle = "rgba(168, 85, 247, 0.03)";
        ctx.fillRect(0, height / 2 - (pulse + 6), width, (pulse + 6) * 2);
      }

      if (analyserNode) {
        if (visualMode === "waveform") {
          analyserNode.getByteTimeDomainData(dataArray);

          // Calculate real-time stats
          let sumSquares = 0;
          let maxVal = 0;
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128; // -1 to 1
            sumSquares += normalized * normalized;
            if (Math.abs(normalized) > maxVal) {
              maxVal = Math.abs(normalized);
            }
          }
          const rms = Math.sqrt(sumSquares / bufferLength);
          setRmsVolume(rms);
          setPeakAmp(maxVal);

          // Drawing glowing waveform paths
          ctx.beginPath();
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = "#06b6d4"; // Cyber cyan string
          
          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(width, height / 2);
          
          // Outer glow effect
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(6, 182, 212, 0.6)";
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow

          // Secondary subtle outline for depth
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(168, 85, 247, 0.35)"; // neon purple
          x = 0;
          for (let i = 0; i < bufferLength; i++) {
            // slightly offset or distorted
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2 + Math.sin(i * 0.1) * 1.5;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.stroke();
          
        } else {
          // Spectrum Mode
          analyserNode.getByteFrequencyData(dataArray);

          // Calculate RMS based on frequency energy
          let energySum = 0;
          let peak = 0;
          for (let i = 0; i < bufferLength; i++) {
            const normalized = dataArray[i]/ 255.0;
            energySum += normalized;
            if (normalized > peak) {
              peak = normalized;
            }
          }
          setRmsVolume(energySum / bufferLength);
          setPeakAmp(peak);

          const barWidth = (width / bufferLength) * 2.2;
          let barHeight;
          let x = 0;

          // Draw dual side mirrored frequencies
          for (let i = 0; i < bufferLength; i++) {
            // We scale amplitude slightly for display
            barHeight = (dataArray[i] / 255.0) * (height * 0.82);

            if (barHeight > 0) {
              // Create dynamic linear gradient for frequency bars
              const grad = ctx.createLinearGradient(x, height, x, height - barHeight);
              grad.addColorStop(0, "rgba(168, 85, 247, 0.2)"); // purple base
              grad.addColorStop(0.5, "rgba(6, 182, 212, 0.7)"); // cyan middle
              grad.addColorStop(1, "rgba(34, 211, 238, 0.95)"); // light cyan peak

              ctx.fillStyle = grad;
              ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

              // Draw a tiny bright dot on peaks
              ctx.fillStyle = "#22d3ee";
              ctx.fillRect(x, height - barHeight - 1.5, barWidth - 1, 1.5);
            }
            x += barWidth;
          }
        }
      } else {
        // STANDBY MODE / IDLE NOISE (Subtle scanning line simulation)
        setRmsVolume(0);
        setPeakAmp(0);

        const time = Date.now() * 0.0035;
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(113, 113, 122, 0.35)"; // Zinc standby line

        const sliceWidth = width / 120;
        let x = 0;

        for (let i = 0; i < 120; i++) {
          // Dynamic sine wave noise mimicking background static scan
          const noise = Math.sin(i * 0.15 + time) * 3 + Math.cos(i * 0.4 - time * 0.5) * 1.5;
          const y = height / 2 + noise;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        // Overlay status text in the middle of standby
        ctx.fillStyle = "rgba(113, 113, 122, 0.4)";
        ctx.font = '9px ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace';
        ctx.textAlign = "center";
        ctx.fillText("SYNTH DECOUPLING STANDBY // COAXIAL READY", width / 2, height / 2 - 12);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Begin loop
    draw();

    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, visualMode, isAwakened]);

  return (
    <div id="ambient-audio-visualizer" className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3 font-mono">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <AudioLines size={12} className={analyserNode ? "text-cyan-400 animate-pulse" : "text-zinc-500"} />
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Spectral Oscilloscope</span>
        </div>
        
        {/* Toggle Mode Control */}
        <div className="flex bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[8px] font-bold overflow-hidden select-none">
          <button
            type="button"
            onClick={() => setVisualMode("waveform")}
            className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
              visualMode === "waveform" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            WAVEFORM
          </button>
          <button
            type="button"
            onClick={() => setVisualMode("spectrum")}
            className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
              visualMode === "spectrum" 
                ? "bg-purple-500/10 text-purple-450 border border-purple-500/20" 
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            SPECTRUM
          </button>
        </div>
      </div>

      {/* Main Canvas View Frame */}
      <div className="relative h-28 w-full bg-[#030408] rounded-lg border border-zinc-900 overflow-hidden flex flex-col group">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Floating Scan Mode Watermark */}
        <div className="absolute top-2 left-3 text-[7.5px] text-zinc-600 uppercase tracking-widest select-none pointer-events-none">
          MODE: {visualMode} // GRID_SYNC
        </div>

        <AnimatePresence>
          {isAwakened && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-2 right-3 px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 font-mono text-[7px] text-purple-300 font-semibold tracking-widest uppercase flex items-center gap-1.5 animate-pulse select-none pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
              Rift Resonance Layer
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Calibration coordinates in corner */}
        <div className="absolute bottom-2 right-3 text-[7.5px] text-zinc-650 tracking-wider text-right select-none pointer-events-none">
          {analyserNode ? (
            <span className="text-cyan-500/40 font-bold">● COUPLER LIVE</span>
          ) : (
            <span className="text-zinc-600 font-bold">○ OFFLINE STANDBY</span>
          )}
        </div>
      </div>

      {/* Dynamic Telemetry Specs Grid */}
      <div className="grid grid-cols-2 gap-2 text-[8px] tracking-wider select-none">
        
        {/* Pitch Reading */}
        <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-900 flex justify-between items-center">
          <span className="text-zinc-500 uppercase">SYS.PITCH</span>
          <span className={analyserNode ? "text-cyan-400 font-bold" : "text-zinc-600 font-bold"}>
            {analyserNode ? `${livePitch.toFixed(1)} Hz` : "00.0 Hz"}
          </span>
        </div>

        {/* RMS Amplitude Energy */}
        <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-900 flex justify-between items-center">
          <span className="text-zinc-500 uppercase">SIGNAL.RMS</span>
          <span className={analyserNode ? "text-purple-400 font-bold" : "text-zinc-600 font-bold"}>
            {analyserNode ? `${(rmsVolume * 100).toFixed(1)}%` : "00.0%"}
          </span>
        </div>

        {/* Peak Amplitude */}
        <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-900 flex justify-between items-center">
          <span className="text-zinc-500 uppercase">PEAK.COEFF</span>
          <span className={analyserNode ? "text-emerald-450 font-bold" : "text-zinc-600 font-bold"}>
            {analyserNode ? `${peakAmp.toFixed(3)}` : "0.000"}
          </span>
        </div>

        {/* Timbre description based on sliders */}
        <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-900 flex justify-between items-center">
          <span className="text-zinc-500 uppercase">TIMBRE.TYPE</span>
          <span className={analyserNode ? "text-amber-400 font-bold uppercase" : "text-zinc-600 font-bold"}>
            {analyserNode ? (livePitch < 100 ? "SUB_BASS" : "MID_LOW") : "MUTED"}
          </span>
        </div>

      </div>
    </div>
  );
};
