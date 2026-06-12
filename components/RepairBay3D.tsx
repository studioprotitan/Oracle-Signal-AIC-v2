import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Engine, 
  Scene, 
  Vector3, 
  Color3, 
  Color4, 
  MeshBuilder, 
  StandardMaterial, 
  DynamicTexture, 
  HemisphericLight, 
  PointLight, 
  SpotLight, 
  ArcRotateCamera,
  TransformNode
} from "@babylonjs/core";
import { 
  Play, Pause, RefreshCw, Layers, Shield, Wrench, AlertTriangle, 
  Heart, Activity, Gauge, Navigation, Compass, User, Zap, Database, 
  Wallet, CreditCard, Flame, Skull, ShieldCheck, Check, Server
} from 'lucide-react';
import { RiftIncursionScanner } from './RiftIncursionScanner';

interface Props {
  addLog: (msg: string) => void;
  originalQuery?: string;
  snapToGrid?: 'off' | '15' | '45';
  rippleFrequency?: number;
}

export const RepairBay3D: React.FC<Props> = ({ 
  addLog, 
  originalQuery = "Genesis Relic", 
  snapToGrid = 'off',
  rippleFrequency = 50
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Scrubber value for spatial position along rails (-5 to 5, where 0 is center)
  const [transitScrub, setTransitScrub] = useState<number>(1.5);
  const [autoPatrol, setAutoPatrol] = useState<boolean>(true);
  const [repairStep, setRepairStep] = useState<'idle' | 'scanning' | 'welding' | 'ready'>('idle');
  const [proximityActive, setProximityActive] = useState<boolean>(false);
  const [yawRotation, setYawRotation] = useState<number>(0);

  // Real-time fluctuating core telemetry
  const [hullStress, setHullStress] = useState<number>(42);
  const [cargoResonance, setCargoResonance] = useState<number>(68);
  const [signalFlux, setSignalFlux] = useState<number>(55);
  const [threatLevel, setThreatLevel] = useState<number>(35);

  const [isIntegrityBreachSimulated, setIsIntegrityBreachSimulated] = useState<boolean>(false);

  // New Freight UXI Cockpit route state (Central, Basin, or Siren)
  const [activeRoute, setActiveRoute] = useState<'central' | 'basin' | 'siren'>('central');

  // Gas / Fuel to deploy states (Simulates dynamic Web3 & payment systems)
  const [deployFuel, setDeployFuel] = useState<number>(220); // FL Capacity out of 500
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintStatusText, setMintStatusText] = useState<string>('');
  const [mintTxHash, setMintTxHash] = useState<string>('');
  const [mintProgress, setMintProgress] = useState<number>(0);

  // Stripe direct checkout variables
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [selectedPack, setSelectedPack] = useState<'pocket' | 'standard' | 'reserve'>('standard');
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [stripeSuccessAlert, setStripeSuccessAlert] = useState<boolean>(false);

  // CST Freight Operatives linked to neural nodes
  const [selectedOperativeIndex, setSelectedOperativeIndex] = useState<number>(0);
  const [operatives, setOperatives] = useState([
    {
      name: "CST-ERT Trooper 'FALCON-7'",
      class: "Vanguard Guard",
      sync: 98,
      headset: true,
      status: "LIVE CHANNEL",
      specialty: "High-temperature hull welding, frontline kinetic repelling",
      weapon: "Dual Pulse Sigil Rifle",
      atk: 88,
      def: 74,
      spd: 92,
      pwr: 85
    },
    {
      name: "Witch Trooper 'CORRUPTED SIREN'",
      class: "Echo Siren Mage",
      sync: 87,
      headset: false,
      status: "STBY RESONANCE",
      specialty: "Sub-harmonic rift stabilization, neural field buffer",
      weapon: "Arcane Resonance Repeater",
      atk: 74,
      def: 62,
      spd: 91,
      pwr: 95
    },
    {
      name: "Battle Arcanist 'OGST-04'",
      class: "Rift Pilot Heavy",
      sync: 94,
      headset: true,
      status: "LIVE CHANNEL",
      specialty: "Gravity focal manipulation, magnetic couplings",
      weapon: "Golem Magnetizer Cannon",
      atk: 95,
      def: 86,
      spd: 66,
      pwr: 90
    }
  ]);

  // Simulate real-time neural sync fluctuation & telemetry twitching
  useEffect(() => {
    const handleFlux = setInterval(() => {
      setOperatives(prev => prev.map(op => ({
        ...op,
        sync: Math.max(70, Math.min(100, op.sync + (Math.random() > 0.5 ? 1 : -1)))
      })));

      // Gently fluctuate matrix stress points
      setHullStress(prev => {
        if (isIntegrityBreachSimulated) return Math.round(89 + Math.sin(Date.now() * 0.003) * 3);
        const base = activeRoute === 'basin' ? 58 : activeRoute === 'siren' ? 48 : 34;
        const drift = Math.sin(Date.now() * 0.002) * 4;
        return Math.max(5, Math.min(100, Math.round(base + drift)));
      });

      setCargoResonance(prev => {
        const base = activeRoute === 'basin' ? 84 : activeRoute === 'siren' ? 52 : 65;
        const speedBoost = autoPatrol ? 8 : 0;
        const drift = Math.cos(Date.now() * 0.001) * 3;
        return Math.max(5, Math.min(100, Math.round(base + speedBoost + drift)));
      });

      setSignalFlux(prev => {
        const base = activeRoute === 'siren' ? 91 : activeRoute === 'basin' ? 45 : 32;
        const offsetIntensity = Math.abs(transitScrub) * 4;
        const drift = Math.sin(Date.now() * 0.004) * 5;
        return Math.max(5, Math.min(100, Math.round(base + offsetIntensity + drift)));
      });
    }, 1000);

    return () => clearInterval(handleFlux);
  }, [activeRoute, autoPatrol, transitScrub, isIntegrityBreachSimulated]);

  // Skirmish random events triggering rift rat incursions or signal surges
  const triggerRandomEncounter = () => {
    const increase = Math.floor(Math.random() * 18) + 12; // 12% to 29%
    const nextThreat = Math.min(100, threatLevel + increase);
    setThreatLevel(nextThreat);
    
    const encounters = [
      `SIGNAL BREACH // WARNING: Rift Rat Swarm spotted gnawing main circuit conduit grid! Threat +${increase}%!`,
      `SIGNAL BREACH // WARNING: Localized Rift pressure fracture detected on corridor loop. Tunnel shield leaking. Threat +${increase}%!`,
      `SIGNAL BREACH // ALERT: Biomechanical Oracle corruption spike registered in Cargo Box-C. Threat +${increase}%!`,
      `SIGNAL BREACH // NOTICE: Electro-magnetic signal flux overload in neural transmitter. Threat +${increase}%!`,
      `SIGNAL BREACH // CRITICAL: Temporal shadow anomaly attempting cargo attachment loop! Threat +${increase}%!`
    ];
    const chosen = encounters[Math.floor(Math.random() * encounters.length)];
    addLog(chosen);

    if (nextThreat > 75) {
      addLog("MTD COCKPIT // CRITICAL RIFT RAT BREACH ENGAGED! INITIATE DESTRUCT PURGE FLUX REDIRECTS!");
      setIsIntegrityBreachSimulated(true);
    }
  };

  const resolveThreatState = () => {
    // Initiate purge simulation in state block
    addLog("MTD COCKPIT // INITIATING SECTOR NEURAL SWEEP & COMPRESSION DECAY SHIELDING...");
    setIsMinting(true);
    setMintProgress(0);
    setMintStatusText("CLEANSING CORRUPT BITS");
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setMintProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setIsMinting(false);
        setThreatLevel(5);
        setIsIntegrityBreachSimulated(false);
        addLog("MTD COCKPIT // SECTOR SWEEP SECURED. ALL RIFT INTRUDERS COMPRESSED & LIQUIDATED.");
      }
    }, 150);
  };

  // Gas Mint-to-Deploy logic
  const handleMintToDeploy = () => {
    if (deployFuel >= 500) {
      addLog("GAS API // ERROR: DEPLOY FUEL CAPACITY ALREADY MAXIMIZED.");
      return;
    }
    setIsMinting(true);
    setMintProgress(5);
    setMintStatusText("CALLING WEB3 CONTRACT");
    setMintTxHash(`0x${Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase()}`);
    addLog(`GAS API // BROADCASTING DEPLOY_CHARGES TRANSACTION TO LOCAL CHAIN NODE...`);

    let prog = 5;
    const interval = setInterval(() => {
      prog += 15;
      if (prog >= 45 && prog < 75) {
        setMintStatusText("MINING INTEL GAS");
      } else if (prog >= 75 && prog < 98) {
        setMintStatusText("WRITING DATA STAMP");
      } else if (prog >= 100) {
        clearInterval(interval);
        setIsMinting(false);
        setDeployFuel(prev => Math.min(500, prev + 50));
        addLog(`GAS API // TRANSACTION CONFIRMED ON BLOCK #${Math.floor(100000 + Math.random() * 900000)}. INJECTED +50 FL COCKPIT RESERVES.`);
      }
      setMintProgress(Math.min(100, prog));
    }, 200);
  };

  // Stripe Payment Checkout logic
  const handleStripeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || cardNumber.length < 12 || !cardExpiry || !cardCvc) {
      addLog("STRIPE API // VALIDATION EXCEPTION: INCOMPLETE CARD STRUCT INPUTS. FAILS COCKPIT SECURITY HANDSHAKE.");
      return;
    }

    setPaymentProcessing(true);
    addLog(`STRIPE API // POST SECCONN /V1/CHARGES - PROCESSING CARD THROUGH LIVE STRIPE MERCHANT NODE...`);

    setTimeout(() => {
      setPaymentProcessing(false);
      setShowCheckout(false);
      setStripeSuccessAlert(true);

      const fuelAdded = selectedPack === 'pocket' ? 50 : selectedPack === 'reserve' ? 400 : 200;
      setDeployFuel(prev => Math.min(500, prev + fuelAdded));
      addLog(`STRIPE API // SUCCESSFUL TRANSACTION AUTH #${Math.floor(Math.random()*90000+10000)}. PURCHASED PACK INJECTED +${fuelAdded} FL GAS DEPLOY CHARGES.`);

      // Reset card form inputs
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');

      setTimeout(() => setStripeSuccessAlert(false), 5000);
    }, 2500);
  };

  // Keep values in refs so animation loop can access recent state without rebuilding
  const positionRef = useRef<number>(1.5);
  const patrolRef = useRef<boolean>(true);
  const stepRef = useRef<string>('idle');
  const snapToGridRef = useRef<'off' | '15' | '45'>('off');

  useEffect(() => {
    snapToGridRef.current = snapToGrid;
  }, [snapToGrid]);
  
  // Babylon engine/scene references
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rimLightRef = useRef<PointLight | null>(null);
  const rootNodeRef = useRef<TransformNode | null>(null);
  const holoMaterialRef = useRef<StandardMaterial | null>(null);
  const holoTextureRef = useRef<DynamicTexture | null>(null);
  const glowingRingRef = useRef<any>(null);
  const welderLightRef = useRef<SpotLight | null>(null);
  const sparksRef = useRef<{ mesh: any; vy: number; vx: number; vz: number; life: number }[]>([]);

  useEffect(() => {
    positionRef.current = transitScrub;
  }, [transitScrub]);

  useEffect(() => {
    patrolRef.current = autoPatrol;
  }, [autoPatrol]);

  useEffect(() => {
    stepRef.current = repairStep;
  }, [repairStep]);

  // Adjust Babylon light diffuse/ambient color on active route change in real-time
  useEffect(() => {
    if (rimLightRef.current && sceneRef.current) {
      const nowScene = sceneRef.current;
      if (activeRoute === 'central') {
        rimLightRef.current.diffuse = new Color3(0.0, 0.9, 1.0); // Cyan glow
        rimLightRef.current.intensity = 1.8;
        nowScene.clearColor = new Color4(0.01, 0.02, 0.04, 1.0);
        addLog("SIGNAL COCKPIT // SWITCHING TELEMETRY ROUTINGS TO CENTRAL GAP CONDUIT Z-1.");
      } else if (activeRoute === 'basin') {
        rimLightRef.current.diffuse = new Color3(0.0, 1.0, 0.55); // Bio green/cyan glow
        rimLightRef.current.intensity = 2.4;
        nowScene.clearColor = new Color4(0.0, 0.04, 0.03, 1.0);
        addLog("SIGNAL COCKPIT // ROUTED INTO SUB-OCEANIC COUPLING CHANNELS. STRESS DRIFT ACTIVE.");
      } else if (activeRoute === 'siren') {
        rimLightRef.current.diffuse = new Color3(0.85, 0.15, 1.0); // Deep violet glow
        rimLightRef.current.intensity = 3.0;
        nowScene.clearColor = new Color4(0.03, 0.0, 0.05, 1.0);
        addLog("SIGNAL COCKPIT // CRITICAL ORACLE RESONANCE EXCEEDING SPEC IN VERTEX HORIZON!");
      }
    }
  }, [activeRoute]);

  // Low industrial ambient hum loop - continuous, subtle background noise
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let osc1: OscillatorNode | null = null;
    let osc2: OscillatorNode | null = null;
    let filter: BiquadFilterNode | null = null;
    let gainNode: GainNode | null = null;

    const startHum = () => {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        audioCtx = new AudioCtxClass();
        const now = audioCtx.currentTime;

        osc1 = audioCtx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(46, now);

        osc2 = audioCtx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(46.4, now);

        filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(90, now);

        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.015, now);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
      } catch (err) {
        console.warn("Continuous low hum initial lock bypassed:", err);
      }
    };

    startHum();

    const handleGesture = () => {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("touchstart", handleGesture);

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      try {
        if (osc1) {
          try { osc1.stop(); } catch (err) {}
        }
        if (osc2) {
          try { osc2.stop(); } catch (err) {}
        }
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
      } catch (e) {}
    };
  }, []);

  // Main Babylon JS initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.01, 0.02, 0.04, 1.0); // Dark matte space theme
    sceneRef.current = scene;

    const camera = new ArcRotateCamera(
      "repairBayCamera",
      Math.PI / 4,           // Alpha
      Math.PI / 2.3,         // Beta (overhead angle view)
      9.0,                   // Radius
      new Vector3(0, 0.7, 0), // Target position
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 5.0;
    camera.upperRadiusLimit = 15.0;
    camera.upperBetaLimit = Math.PI / 2.05;

    const hLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
    hLight.intensity = 0.25;
    hLight.groundColor = new Color3(0.01, 0.05, 0.1);
    hLight.diffuse = new Color3(0.2, 0.4, 0.6);

    const rimLight = new PointLight("cyanRimLight", new Vector3(-5, 2, -3), scene);
    rimLight.intensity = 1.8;
    rimLight.diffuse = new Color3(0.0, 0.9, 1.0);
    rimLightRef.current = rimLight;

    const welderLight = new SpotLight(
      "welderBeacon", 
      new Vector3(0, 5.0, 0),        
      new Vector3(0, -1, 0),         
      Math.PI / 3,                   
      6.0,                           
      scene
    );
    welderLight.intensity = 0.6;
    welderLight.diffuse = new Color3(1.0, 0.6, 0.1); 
    welderLightRef.current = welderLight;

    // Metal Ground Grid
    const ground = MeshBuilder.CreateGround("dockGround", { width: 24, height: 16, subdivisions: 4 }, scene);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.07, 0.08, 0.11);
    groundMat.specularColor = new Color3(0.15, 0.2, 0.25);
    groundMat.roughness = 0.85;
    ground.material = groundMat;

    // Glowing Floor Ring (Center coupling capture node)
    const floorRing = MeshBuilder.CreateCylinder("repairZoneRing", {
      diameter: 3.2,
      height: 0.03,
      tessellation: 32
    }, scene);
    floorRing.position.y = 0.01;
    const ringMat = new StandardMaterial("ringMat", scene);
    ringMat.emissiveColor = new Color3(0.0, 0.95, 1.0); 
    ringMat.diffuseColor = new Color3(0, 0.08, 0.12);
    floorRing.material = ringMat;
    glowingRingRef.current = floorRing;

    // Parallel rails
    const rail1 = MeshBuilder.CreateBox("railLeft", { width: 20, height: 0.1, depth: 0.12 }, scene);
    rail1.position.set(0, 0.05, 0.7);
    const rail2 = MeshBuilder.CreateBox("railRight", { width: 20, height: 0.1, depth: 0.12 }, scene);
    rail2.position.set(0, 0.05, -0.7);
    
    const railMat = new StandardMaterial("railMat", scene);
    railMat.diffuseColor = new Color3(0.2, 0.23, 0.26);
    railMat.specularColor = new Color3(0.5, 0.5, 0.5);
    rail1.material = railMat;
    rail2.material = railMat;

    // Steel Girders
    const girder1 = MeshBuilder.CreateBox("girder1", { width: 0.2, height: 5.5, depth: 0.2 }, scene);
    girder1.position.set(-6, 2.75, -4);
    const girder2 = MeshBuilder.CreateBox("girder2", { width: 0.2, height: 5.5, depth: 0.2 }, scene);
    girder2.position.set(6, 2.75, -4);
    const girderCross = MeshBuilder.CreateBox("girderCross", { width: 12.2, height: 0.2, depth: 0.2 }, scene);
    girderCross.position.set(0, 5.4, -4);
    
    const structureMat = new StandardMaterial("structureMat", scene);
    structureMat.diffuseColor = new Color3(0.1, 0.11, 0.15);
    structureMat.specularColor = new Color3(0.03, 0.03, 0.03);
    girder1.material = structureMat;
    girder2.material = structureMat;
    girderCross.material = structureMat;

    // FREIGHT CONTAINER CAR
    const carriageRoot = new TransformNode("carRootNode", scene);
    rootNodeRef.current = carriageRoot;
    carriageRoot.position.y = 0.5; 

    const chassis = MeshBuilder.CreateBox("carChassis", { width: 4.2, height: 0.3, depth: 1.8 }, scene);
    chassis.parent = carriageRoot;
    chassis.position.set(0, -0.15, 0);
    const chassisMat = new StandardMaterial("chassisBlockMat", scene);
    chassisMat.diffuseColor = new Color3(0.12, 0.13, 0.16);
    chassisMat.specularColor = new Color3(0.3, 0.35, 0.4);
    chassis.material = chassisMat;

    const bodyBox = MeshBuilder.CreateBox("carBody", { width: 3.8, height: 1.6, depth: 1.6 }, scene);
    bodyBox.parent = carriageRoot;
    bodyBox.position.set(0, 0.8, 0);
    const bodyMat = new StandardMaterial("bodyBlockMat", scene);
    bodyMat.diffuseColor = new Color3(0.18, 0.21, 0.25); // Heavy armored plating
    bodyMat.specularColor = new Color3(0.15, 0.15, 0.15);
    bodyBox.material = bodyMat;

    const decalCore = MeshBuilder.CreateBox("decalPlate", { width: 1.8, height: 0.5, depth: 1.63 }, scene);
    decalCore.parent = carriageRoot;
    decalCore.position.set(0, 0.8, 0);
    const decalMat = new StandardMaterial("decalBlockMat", scene);
    decalMat.diffuseColor = new Color3(0.03, 0.04, 0.05);
    decalMat.emissiveColor = new Color3(0.0, 0.6, 0.9); // Indigo/Teal Reactor core glow
    decalCore.material = decalMat;

    // Side armor reinforcing bars
    const plateL = MeshBuilder.CreateBox("plateL", { width: 3.9, height: 0.6, depth: 0.15 }, scene);
    plateL.parent = carriageRoot;
    plateL.position.set(0, 0.4, 0.81);
    const plateR = MeshBuilder.CreateBox("plateR", { width: 3.9, height: 0.6, depth: 0.15 }, scene);
    plateR.parent = carriageRoot;
    plateR.position.set(0, 0.4, -0.81);
    
    const armorPlateMat = new StandardMaterial("armorPlateMat", scene);
    armorPlateMat.diffuseColor = new Color3(0.08, 0.09, 0.11);
    armorPlateMat.specularColor = new Color3(0.35, 0.35, 0.35);
    plateL.material = armorPlateMat;
    plateR.material = armorPlateMat;

    // Cylinder wheels
    const wheelPositions = [
      { x: -1.5, z: 0.7 },
      { x: 1.5, z: 0.7 },
      { x: -1.5, z: -0.7 },
      { x: 1.5, z: -0.7 }
    ];
    wheelPositions.forEach((pos, idx) => {
      const wheel = MeshBuilder.CreateCylinder("wheel-" + idx, {
        diameter: 0.48,
        height: 0.15,
        tessellation: 16
      }, scene);
      wheel.parent = carriageRoot;
      wheel.position.set(pos.x, -0.4, pos.z);
      wheel.rotation.x = Math.PI / 2;
      
      const wheelMat = new StandardMaterial("steelWheelMat", scene);
      wheelMat.diffuseColor = new Color3(0.3, 0.3, 0.35);
      wheelMat.specularColor = new Color3(0.7, 0.7, 0.7);
      wheelMat.roughness = 0.15;
      wheel.material = wheelMat;
    });

    // Hologram Floating HUD Card
    const holoPlane = MeshBuilder.CreatePlane("diagnosticHoloCard", {
      width: 3.4,
      height: 1.9
    }, scene);
    holoPlane.parent = carriageRoot;
    holoPlane.position.set(0, 2.3, 0); 
    holoPlane.rotation.x = Math.PI / 15;

    const holoMat = new StandardMaterial("hologramMat", scene);
    holoMat.alpha = 0.0;           
    holoMat.backFaceCulling = false; 
    holoMat.emissiveColor = new Color3(1.0, 1.0, 1.0); 
    holoMat.disableLighting = true; 
    holoPlane.material = holoMat;
    holoMaterialRef.current = holoMat;

    const holoTex = new DynamicTexture("holoCardTexture", { width: 512, height: 288 }, scene, false);
    holoMat.diffuseTexture = holoTex;
    holoMat.emissiveTexture = holoTex;
    holoTextureRef.current = holoTex;

    // Draw function on Dynamic Texture
    const redrawHologramTexture = (proximity: boolean, currentStep: string, offsetValue: number, systemLog: string) => {
      const ctx = holoTex.getContext();
      ctx.clearRect(0, 0, 512, 288);
      
      if (!proximity) {
        ctx.fillStyle = "rgba(4, 7, 12, 0.92)";
        ctx.fillRect(8, 8, 496, 272);
        
        ctx.strokeStyle = "rgba(168, 85, 247, 0.3)"; 
        ctx.lineWidth = 3;
        ctx.strokeRect(12, 12, 488, 264);

        ctx.strokeStyle = "rgba(168, 85, 247, 0.65)";
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath(); ctx.moveTo(8, 25); ctx.lineTo(8, 8); ctx.lineTo(25, 8); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(504, 25); ctx.lineTo(504, 8); ctx.lineTo(487, 8); ctx.stroke();

        ctx.fillStyle = "rgba(244, 63, 94, 0.85)";
        ctx.font = "bold 13px 'JetBrains Mono', Courier, monospace";
        ctx.fillText("▲ COCKPIT SYNC STANDBY // AWAITING POSITION LOCK", 35, 48);

        ctx.fillStyle = "rgba(161, 161, 170, 0.7)";
        ctx.font = "10px 'JetBrains Mono', Courier, monospace";
        ctx.fillText(`TRANSIT SECTOR TRACK OFFSET: ${(offsetValue * 3.5).toFixed(1)}m`, 35, 100);
        ctx.fillText("PROXIMITY RADAR: SCANNING CONDUIT PATHS...", 35, 125);
        ctx.fillText("ALIGN THE COMPOSITE CHASSIS DIRECT INTO NEURAL CAPTURE NODE", 35, 150);

        ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
        ctx.fillRect(35, 175, 442, 25);
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.font = "bold 9px 'JetBrains Mono', Courier, monospace";
        ctx.fillText(`[COCKPIT INTEGRATION GATEWAY UNLOCKED // STANDBY]`, 45, 191);

        holoTex.update();
        return;
      }

      // ACTIVE COCKPIT TEMPLATE
      ctx.fillStyle = "rgba(2, 4, 8, 0.96)";
      ctx.fillRect(8, 8, 496, 272);

      ctx.strokeStyle = "rgba(6, 182, 212, 0.95)";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, 488, 264);

      ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
      ctx.lineWidth = 1;
      for (let i = 20; i < 500; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 12); ctx.lineTo(i, 276); ctx.stroke();
      }

      ctx.fillStyle = "rgba(6, 182, 212, 1.0)";
      ctx.fillRect(12, 12, 488, 30);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 11px 'JetBrains Mono', Courier, monospace";
      ctx.fillText("⚡ FREIGHT COCKPIT ACTIVE // DECI-DIEGETIC RECEPTOR ONLINE", 26, 31);

      ctx.fillStyle = "rgba(6, 182, 212, 1.0)";
      ctx.font = "bold 11px 'JetBrains Mono', Courier, monospace";
      ctx.fillText("● ORACLE COUPLING INTEGRATION // ENERGETIC VECTOR ACQUIRED", 30, 75);

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "10px 'JetBrains Mono', Courier, monospace";
      
      ctx.fillText("CARGO SYSTEM  : Genesis Rift Escort Array [V-IX]", 30, 110);
      ctx.fillText(`ORACLE SIGNALS: REF/${originalQuery.toUpperCase()}`, 30, 130);
      
      let statusString = "SCANNING SYSTEM TELEMETRY...";
      let integrityString = "CALIBRATION ENERGIZED";
      let weldString = "STANDBY - SECURE TO CHARGE";
      let statusColor = "#a855f7";

      if (currentStep === 'welding') {
        statusString = "◆ DIRECT COAXIAL FLUX INJECTING ◆";
        integrityString = "CONSTITUTING SHIELD CARTRIDGE CELL...";
        weldString = "⚡ STABILIZING INTERNAL VOLTAGE CODES...";
        statusColor = "#eab308";
      } else if (currentStep === 'ready') {
        statusString = "✔ SYSTEM DEPLOY READY - SANCTIONED COCKPIT";
        integrityString = "100% NOMINAL INTEL CAPTURED";
        weldString = "✔ DUAL VECTOR ALIGNMENT LOCKED";
        statusColor = "#10b981";
      }

      ctx.fillStyle = statusColor;
      ctx.fillText(`SYSTEM PATHS  : ${statusString}`, 30, 155);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillText(`HULL MATRIX   : ${integrityString}`, 30, 180);
      ctx.fillText(`NEURAL FLUX   : ${weldString}`, 30, 205);

      ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
      ctx.fillRect(20, 225, 472, 34);
      
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 225, 472, 34);

      ctx.fillStyle = "rgba(6, 182, 212, 1.0)";
      ctx.font = "9px 'JetBrains Mono', Courier, monospace";
      ctx.fillText(`LOGISTICS SHIELD: ${systemLog || "INTEGRAL REGISTRY SYNCED ON HIGH FEED."}`, 28, 246);

      holoTex.update();
    };

    redrawHologramTexture(false, 'idle', 1.5, "SYSTEM INITIATED");

    let angleAccumulator = 0;
    let weldBurstTimer = 0;

    const mainLoop = () => {
      const now = performance.now();
      
      if (patrolRef.current) {
        const speedFactor = now / 1400;
        const autoPos = Math.sin(speedFactor) * 3.3;
        let snapPos = autoPos;
        if (snapToGridRef.current === '15') {
          snapPos = Math.round(autoPos / 0.5) * 0.5;
        } else if (snapToGridRef.current === '45') {
          snapPos = Math.round(autoPos / 1.5) * 1.5;
        }
        positionRef.current = snapPos;
        setTransitScrub(snapPos);
      }

      if (carriageRoot) {
        let currentPos = positionRef.current;
        if (snapToGridRef.current === '15') {
          currentPos = Math.round(currentPos / 0.5) * 0.5;
        } else if (snapToGridRef.current === '45') {
          currentPos = Math.round(currentPos / 1.5) * 1.5;
        }
        carriageRoot.position.x = currentPos;
        carriageRoot.position.y = 0.5 + Math.sin(now / 350) * 0.025; // hovering floating suspension
      }

      const wheelRotation = positionRef.current * 2.2;
      carriageRoot.getChildMeshes().forEach(m => {
        if (m.name.startsWith("wheel")) {
          m.rotation.y = wheelRotation;
        }
      });

      const offset = Math.abs(positionRef.current);
      const inProximityRange = offset < 0.65;
      setProximityActive(inProximityRange);

      if (floorRing && floorRing.material) {
        const ringMaterial = floorRing.material as StandardMaterial;
        if (inProximityRange) {
          const pulseIntensity = 0.75 + Math.sin(now / 90) * 0.25;
          ringMaterial.emissiveColor = new Color3(0.0 * pulseIntensity, 0.95 * pulseIntensity, 1.0 * pulseIntensity);
          const ringStretch = 1.0 + Math.sin(now / 150) * 0.03;
          floorRing.scaling.set(ringStretch, 1, ringStretch);
        } else {
          const pulseIntensity = 0.45 + Math.sin(now / 350) * 0.15;
          ringMaterial.emissiveColor = new Color3(0.0 * pulseIntensity, 0.75 * pulseIntensity, 0.85 * pulseIntensity); 
          floorRing.scaling.set(1.0, 1, 1.0);
        }
      }

      if (holoMat) {
        if (inProximityRange) {
          if (holoMat.alpha < 1.0) {
            holoMat.alpha = Math.min(1.0, holoMat.alpha + 0.18);
            holoPlane.scaling.set(1.0 + Math.random() * 0.05, 1.0 + Math.random() * 0.03, 1.0);
          } else {
            holoPlane.scaling.set(1, 1, 1);
          }
        } else {
          if (holoMat.alpha > 0.0) {
            holoMat.alpha = Math.max(0.0, holoMat.alpha - 0.12);
          }
        }
      }

      if (inProximityRange && holoTex) {
        let activeLog = "BAY COUPLING RE-ALIGNMENT VALID...";
        if (stepRef.current === 'welding') {
          activeLog = `ION BURST ENGAGED: ${(Math.random() * 3200).toFixed(0)}kV RESON` + " " + "⚡".repeat(Math.floor(Math.random() * 4));
        } else if (stepRef.current === 'ready') {
          activeLog = "SYSTEM REPAIR COMMITTED NOMINAL. BAY READY.";
        } else {
          if (Math.random() > 0.92) {
            activeLog = "UPDATING CORE CALIBRATION MATRIX LOGS...";
          }
        }
        redrawHologramTexture(true, stepRef.current, offset, activeLog);
      } else if (!inProximityRange && holoTex) {
        redrawHologramTexture(false, 'idle', offset, "OFF-GRID");
      }

      if (welderLight) {
        if (stepRef.current === 'welding') {
          weldBurstTimer += 1;
          const laserFlicker = 1.5 + Math.sin(now / 15) * 1.5;
          welderLight.intensity = laserFlicker;
          welderLight.diffuse = new Color3(1.0, 0.8 + Math.random() * 0.2, 0.2);

          if (sparksRef.current.length < 50 && Math.random() > 0.3) {
            const spark = MeshBuilder.CreateBox("sparkBox", { size: 0.05 }, scene);
            spark.position.set(
              Math.random() * 0.5 - 0.25,
              0.6 + Math.random() * 0.2,
              Math.random() * 0.5 - 0.25
            );
            
            const sMat = new StandardMaterial("sparkMat", scene);
            sMat.emissiveColor = new Color3(1.0, 0.7, 0.0);
            sMat.disableLighting = true;
            spark.material = sMat;

            sparksRef.current.push({
              mesh: spark,
              vy: 0.12 + Math.random() * 0.1,
              vx: (Math.random() - 0.5) * 0.12,
              vz: (Math.random() - 0.5) * 0.12,
              life: 1.0
            });
          }
        } else if (stepRef.current === 'ready') {
          welderLight.intensity = 0.5;
          welderLight.diffuse = new Color3(0.05, 1.0, 0.35);
        } else {
          welderLight.intensity = 0.55;
          welderLight.diffuse = new Color3(1.0, 0.6, 0.1);
        }
      }

      sparksRef.current.forEach((sp, idx) => {
        sp.mesh.position.y += sp.vy;
        sp.mesh.position.x += sp.vx;
        sp.mesh.position.z += sp.vz;
        sp.vy -= 0.007;
        sp.life -= 0.035;
        sp.mesh.scaling.scaleInPlace(0.96);
        
        if (sp.life <= 0) {
          sp.mesh.dispose();
          sparksRef.current.splice(idx, 1);
        }
      });

      if (camera) {
        if (snapToGridRef.current === '15') {
          const rad15 = 15 * Math.PI / 180;
          camera.alpha = Math.round(camera.alpha / rad15) * rad15;
        } else if (snapToGridRef.current === '45') {
          const rad45 = 45 * Math.PI / 180;
          camera.alpha = Math.round(camera.alpha / rad45) * rad45;
        }
      }
      setYawRotation(camera.alpha);

      scene.render();
    };

    engine.runRenderLoop(mainLoop);

    const resizeObserver = new ResizeObserver((entries) => {
      if (engine) engine.resize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      engine.dispose();
      sparksRef.current.forEach(sp => sp.mesh.dispose());
    };
  }, [originalQuery]);

  // Command Action to trigger heavy weld injection sequence
  const startWeldProcedure = () => {
    if (!proximityActive) {
      addLog("MTD COCKPIT // ERROR: FREIGHT CARRIAGE MUST BE CENTERED OVER COUPLING INJECTION NODE");
      return;
    }
    
    setAutoPatrol(false);
    setRepairStep('welding');
    addLog("MTD COCKPIT // ENGAGING THERMO-WELD COUPLER BURST. CALIBRATING STRUCT SIGNALS AT 10.0kV.");
    
    // Play spark audio hiss frequency using client side synth
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        const now = actx.currentTime;
        
        const bufferSize = actx.sampleRate * 2.0; 
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = actx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const noiseFilter = actx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(3500, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(1000, now + 1.8);
        
        const noiseGain = actx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
        
        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(actx.destination);
        
        noiseNode.start(now);
      }
    } catch(e) {
      console.warn("Weld synth failure:", e);
    }

    setTimeout(() => {
      setRepairStep('ready');
      setHullStress(prev => Math.min(10, prev / 5)); // Drastically reduce hull stress
      setCargoResonance(100);
      setSignalFlux(100);
      addLog("MTD COCKPIT // DIRECT RECONSTITUTION NOMINAL. CARGO COUPLERS ENERGIZED & SECURED.");
    }, 2000);
  };

  const resetDockPlatform = () => {
    setRepairStep('idle');
    setAutoPatrol(true);
    addLog("MTD COCKPIT // RE-ENGAGING AUTONOMOUS RAIL TRANSIT CONDUIT PATROL");
  };

  return (
    <div className="w-full bg-[#05080c] text-zinc-100 p-5 md:p-6 relative z-20 min-h-[500px] border-4 border-[#121c24] shadow-[inset_0_0_60px_rgba(0,12,18,0.95)] overflow-hidden font-sans select-none rounded-none">
      
      {/* Heavy Mechanical Rivets in Chassis Corners */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 pointer-events-none" />

      {/* Warning Chevron Border Strips */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[repeating-linear-gradient(45deg,#b37d14,#b37d14_8px,#1e1b15_8px,#1e1b15_16px)] opacity-60 pointer-events-none" />
      
      {/* Worn Copper/Bronze Filigree Inner Border */}
      <div className="absolute inset-1 border border-amber-800/25 pointer-events-none rounded-sm" />

      {/* Main Control Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b-2 border-zinc-800 pb-4 mb-5 gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#0a141e]/80 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] rounded font-black tracking-widest animate-pulse shadow-[inset_0_1px_8px_rgba(6,182,212,0.15)] shrink-0 self-center">
            DECK P-7 // OPERATIVE
          </div>
          <div>
            <h1 className="text-sm font-mono font-black uppercase tracking-[0.25em] text-cyan-100 flex items-center gap-2">
              <Layers size={15} className="text-cyan-400 animate-pulse" />
              ORACLE_BRIDGE // FREIGHT COCKPIT
            </h1>
            <p className="text-[8px] font-mono text-amber-600/80 uppercase tracking-widest mt-0.5 font-bold flex items-center gap-1.5">
              <span>● COCKPIT SYSTEM STATUS: OPERATIONAL</span>
              <span className="text-zinc-650 font-normal">|</span>
              <span className="text-zinc-400">MODEL RECEPTOR REFRACT-V2</span>
            </p>
          </div>
        </div>

        {/* Diegetic Telemetry Readout Grid */}
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-zinc-400 self-start lg:self-center">
          <div className="bg-[#03060a] px-3 py-1.5 border border-zinc-800 flex items-center gap-2 shadow-inner">
            <span className="text-zinc-500 font-bold">RECEPTOR LOCK RANGE:</span>
            <span className={`font-black ${proximityActive ? "text-cyan-400 font-black animate-pulse" : "text-zinc-450"}`}>
              {proximityActive ? "SYNC ENABLED (0.0m)" : `${(transitScrub * 3.5).toFixed(1)}m DISTANT`}
            </span>
          </div>
          <div className="bg-[#03060a] px-3 py-1.5 border border-zinc-805 flex items-center gap-2 shadow-inner">
            <span className="text-zinc-500 font-bold">RADIOMETER:</span>
            <span className="text-amber-500 font-bold">{(yawRotation * (180/Math.PI)).toFixed(0)}° YAW</span>
          </div>
          <div className="bg-[#03060a] px-3 py-1.5 border border-zinc-800 flex items-center gap-2 shadow-inner hidden xl:flex">
            <span className="text-zinc-500 font-bold">CONDUIT CHNL:</span>
            <span className="text-purple-400 font-bold uppercase">{activeRoute}</span>
          </div>
        </div>
      </div>

      {/* Main Structural Cockpit Panel Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10" ref={containerRef}>
        
        {/* ================= LEFT WING CONTROLS (Tension and Resources) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1 select-none">
          
          {/* Module 1: Structural Freight Tension Schematic */}
          <div className="p-4 bg-[#0a0f15] border border-zinc-800 relative flex flex-col gap-3 shadow-[inset_0_1px_8px_rgba(0,0,0,0.8)]">
            {/* Hex Screws */}
            <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute inset-0.5 border border-amber-900/10 pointer-events-none" />

            <div className="flex justify-between items-center text-[10px] pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 uppercase font-mono font-bold text-zinc-350 tracking-wider">
                <Gauge size={12} className="text-cyan-400" />
                Structural Tension Schematic
              </span>
              <span className="text-[7px] font-mono text-zinc-500 font-bold">VLAAD // MTD-9</span>
            </div>

            {/* Train Cargo Structural Schematic SVG Wireframe */}
            <div className="py-2 flex flex-col items-center justify-center bg-black/40 border border-zinc-900 rounded p-2 relative overflow-hidden">
              {/* Teal glowing border overlay pulsing with rippleFrequency as resonance signal */}
              <motion.div 
                key={rippleFrequency}
                className="absolute inset-0 rounded border pointer-events-none z-10"
                animate={{
                  boxShadow: [
                    "0 0 2px rgba(6,182,212,0.15), inset 0 0 2px rgba(6,182,212,0.15)",
                    "0 0 14px rgba(6,182,212,0.7), inset 0 0 10px rgba(6,182,212,0.4)",
                    "0 0 2px rgba(6,182,212,0.15), inset 0 0 2px rgba(6,182,212,0.15)"
                  ],
                  borderColor: [
                    "rgba(6,182,212,0.3)",
                    "rgba(34,211,238,0.85)",
                    "rgba(6,182,212,0.3)"
                  ]
                }}
                transition={{
                  duration: Math.max(0.15, 100 / Math.max(1, rippleFrequency)),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest mb-2 text-center block">
                [ HULL STRUCTURAL DECK FORCE STRESS ]
              </span>
              
              <svg viewBox="0 0 220 80" className="w-full h-16 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                {/* Carriage 1: Reactor Block */}
                <rect 
                  x="10" y="20" width="55" height="36" rx="2" 
                  fill="rgba(10,15,22,0.85)" 
                  stroke={activeRoute === 'siren' ? "#a78bfa" : "#06b6d4"} 
                  strokeWidth="2" 
                  className="transition-colors duration-200" 
                />
                {/* Connector joints */}
                <line x1="65" y1="38" x2="80" y2="38" stroke="#1f2937" strokeWidth="4" />
                <line x1="68" y1="38" x2="77" y2="38" stroke={isIntegrityBreachSimulated ? "#f43f5e" : "#eab308"} strokeWidth="1.5" />
                
                {/* Carriage 2: central cargo */}
                <rect 
                  x="80" y="15" width="65" height="41" rx="3" 
                  fill={isIntegrityBreachSimulated ? "rgba(127,29,29,0.3)" : "rgba(10,15,22,0.8)"} 
                  stroke={isIntegrityBreachSimulated ? "#f43f5e" : "#a855f7"} 
                  strokeWidth="2"
                  className={isIntegrityBreachSimulated ? "animate-pulse" : "transition-colors duration-200"}
                />
                {/* Connector joints */}
                <line x1="145" y1="38" x2="160" y2="38" stroke="#1f2937" strokeWidth="4" />
                
                {/* Carriage 3: Tail plates */}
                <rect 
                  x="160" y="24" width="50" height="32" rx="2" 
                  fill="rgba(10,15,22,0.85)" 
                  stroke={hullStress > 75 ? "#ef4444" : "#eab308"} 
                  strokeWidth="2"
                  className="transition-colors duration-200"
                />

                {/* Localized hot stress labels overlay */}
                <text x="37" y="42" fill="#06b6d4" fontSize="7px" fontWeight="black" fontFamily="monospace" textAnchor="middle">ENG</text>
                <text x="112" y="39" fill={isIntegrityBreachSimulated ? "#f43f5e" : "#c084fc"} fontSize="7px" fontWeight="black" fontFamily="monospace" textAnchor="middle" className="animate-pulse">CRG</text>
                <text x="185" y="43" fill="#eab308" fontSize="7px" fontWeight="black" fontFamily="monospace" textAnchor="middle">SHLD</text>
              </svg>

              <div className="grid grid-cols-3 gap-2 w-full text-center text-[7.5px] font-mono mt-2 border-t border-zinc-900 pt-2">
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">STRESS DET:</span>
                  <span className={`font-black ${isIntegrityBreachSimulated ? "text-red-400 animate-pulse" : "text-cyan-400"}`}>{hullStress}%</span>
                </div>
                <div className="flex flex-col border-x border-zinc-900">
                  <span className="text-zinc-500 font-bold">RESONANCE:</span>
                  <span className="font-black text-purple-400">{cargoResonance}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">SIGNAL FLX:</span>
                  <span className="font-black text-amber-500">{signalFlux}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-mono mt-1 text-[8px] text-zinc-400">
              <span className="text-zinc-500 uppercase tracking-widest text-[7px] font-bold">Localized Tension Strain Dials</span>
              
              {/* Dynamic Readouts with beautiful micro bars */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[7.5px]">
                  <span className="text-zinc-400 uppercase">Structural Stress Rate</span>
                  <span className={`font-bold ${isIntegrityBreachSimulated ? "text-red-400 animate-pulse" : "text-cyan-400"}`}>{hullStress}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-950 rounded-none overflow-hidden border border-zinc-900">
                  <motion.div animate={{ width: `${hullStress}%` }} transition={{ duration: 0.5 }} className={`h-full ${isIntegrityBreachSimulated ? "bg-red-500 animate-pulse" : "bg-cyan-500"}`} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[7.5px]">
                  <span className="text-zinc-400 uppercase">Cargo Resonance Wave</span>
                  <span className="font-bold text-purple-400">{cargoResonance}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-950 rounded-none overflow-hidden border border-zinc-900">
                  <motion.div animate={{ width: `${cargoResonance}%` }} transition={{ duration: 0.5 }} className="h-full bg-purple-500" />
                </div>
              </div>
            </div>

            <p className="text-[6.5px] mt-1 text-zinc-550 leading-normal font-mono uppercase text-left">
              *SYSTEM GENERATED BY THE HULL MANIFOLD DEFLECTOR SYSTEM COUPLING.
            </p>
          </div>

          {/* Module 2: Freight Resource Exchange Console */}
          <div className="p-4 bg-[#0a0f15] border border-zinc-800 relative flex flex-col gap-3 shadow-[inset_0_1px_8px_rgba(0,0,0,0.8)]">
            <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-zinc-700" />
            <div className="absolute inset-0.5 border border-amber-900/10 pointer-events-none" />

            <div className="flex justify-between items-center text-[10px] pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 uppercase font-mono font-bold text-zinc-350 tracking-wider">
                <Database size={12} className="text-yellow-400 animate-pulse" />
                Resource Exchange Console
              </span>
              <span className="text-[6.5px] font-mono text-zinc-500 font-bold">GAS TERMINAL</span>
            </div>

            <div className="flex flex-col gap-2.5 mt-1">
              
              {/* Canister Fluid Graphics */}
              <div className="flex items-center gap-3 bg-black/40 border border-zinc-900 w-full p-2.5 rounded">
                
                {/* SVG glowing canisters */}
                <div className="flex gap-2 shrink-0">
                  <svg width="24" height="42" className="overflow-visible filter drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]">
                    <rect x="2" y="2" width="20" height="38" rx="3" fill="#03060a" stroke="#d97706" strokeWidth="1.5" />
                    {/* Liquid fill */}
                    <rect 
                      x="4" 
                      y={4 + (34 - (deployFuel/500)*34)} 
                      width="16" 
                      height={(deployFuel/500)*34} 
                      rx="1" 
                      fill="url(#amberFuelGrad)" 
                    />
                    <defs>
                      <linearGradient id="amberFuelGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex-1 font-mono">
                  <div className="flex justify-between items-end">
                    <span className="text-[7px] text-zinc-400 uppercase font-black block">RIFT GAS CANISTER:</span>
                    <span className="text-[11px] font-black text-yellow-400 leading-none">
                      {deployFuel} / 500 FL
                    </span>
                  </div>
                  <div className="w-full h-1 bg-zinc-950 mt-1 border border-zinc-900">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500"
                      style={{ width: `${(deployFuel / 500) * 100}%` }}
                    />
                  </div>
                  <span className="text-[6.5px] text-zinc-505 uppercase mt-1 block">MANIFOLD FUEL PUMP PRESSURE: NOMINAL</span>
                </div>
              </div>

              {/* Physical Interface Triggers */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleMintToDeploy}
                  disabled={isMinting || deployFuel >= 500}
                  className="w-full py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-zinc-850 hover:to-zinc-900 text-white font-mono text-[8px] font-black uppercase tracking-widest border border-zinc-800 hover:border-yellow-500/50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                >
                  <Wallet size={11} className="text-yellow-400 animate-pulse" />
                  <span>{isMinting ? "CONFIRMING BLOCK DEPLOY..." : "⚡ Web3 Mint-to-Deploy [+50 FL]"}</span>
                </button>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-yellow-300 font-mono text-[8px] font-black uppercase tracking-widest border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                >
                  <CreditCard size={11} className="text-amber-400" />
                  <span>💳 TOP-UP RESIDUE SHIELDS [STRIPE]</span>
                </button>
              </div>

              {/* Simulated Transaction Log Overlay */}
              {isMinting && (
                <div className="bg-black/90 rounded border border-yellow-500/30 p-2 text-[7.5px] font-mono flex flex-col gap-1 relative z-20">
                  <div className="flex justify-between items-center text-yellow-400 font-bold uppercase font-mono">
                    <span>{mintStatusText}...</span>
                    <span>{mintProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-950 overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${mintProgress}%` }} />
                  </div>
                  {mintTxHash && <span className="text-zinc-500 block truncate leading-none mt-1">HASH: {mintTxHash}</span>}
                </div>
              )}
            </div>
            
            <p className="text-[6.5px] text-zinc-500 leading-normal font-mono uppercase text-left">
              *PHYSICAL GAS PUMPS CONTROLLED VIA LOCAL CRYPTO ROUTER GATEWAY DECK-3.
            </p>
          </div>

        </div>

        {/* ================= CENTER COCKPIT HOLOGRAPHIC EYE (The Freight Core) ================= */}
        <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2 select-none">
          
          {/* Cathedral-scale industrial hologram chamber container */}
          <div className="p-1 border-4 border-zinc-900 bg-[#04070a] relative flex flex-col justify-between rounded-none min-h-[440px] lg:h-[555px] shadow-[inset_0_0_65px_rgba(6,182,212,0.18),0_15px_45px_rgba(0,0,0,1)] transition-all">
            
            {/* Bronze/Worn Bevel Plates in Holograme Edges */}
            <div className="absolute inset-1.5 border border-[#4d3219]/25 pointer-events-none" />
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#8a602d] pointer-events-none" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#8a602d] pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#8a602d] pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#8a602d] pointer-events-none" />

            {/* Simulated Glass Glare Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 to-transparent opacity-40 pointer-events-none z-10" />

            {/* Core Header Ribbon */}
            <div className="absolute top-3 inset-x-3 pointer-events-none z-10 flex justify-between font-mono text-[7.5px] uppercase tracking-wider text-zinc-400 select-none">
              <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2 py-1 rounded-sm border border-zinc-800">
                <span className={`w-1.5 h-1.5 rounded-full ${proximityActive ? "bg-cyan-400 animate-ping" : "bg-purple-500"}`} />
                <span>COGNITIVE HOVER RECON: {proximityActive ? "LOCKED DIRECT ON SIGNAL" : "SEEKING LOCAL CORRIDOR"}</span>
              </div>
              <div className="bg-zinc-950/80 px-2 py-1 rounded-sm border border-zinc-800 text-cyan-400/80">
                ACTIVE RECEPTOR CALIBRATION // 10.0kV DETECTED
              </div>
            </div>

            {/* Babylon Canvas (The Suspended Hologram Assembly) */}
            <div className="w-full h-full relative overflow-hidden bg-black/98 flex-1 rounded-sm border border-zinc-900 mb-1.5">
              <canvas 
                id="babylon_mirror_canvas"
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full outline-none block cursor-grab active:cursor-grabbing z-0"
              />

              {/* Grid calibration crosshair overlay lines */}
              <div className="absolute inset-0 border border-teal-500/10 pointer-events-none flex items-center justify-center z-10">
                <div className="w-full h-[1px] bg-teal-500/5 rotate-45" />
                <div className="w-full h-[1px] bg-teal-500/5 -rotate-45" />
                <div className="absolute w-24 h-24 border border-teal-500/10 rounded-full animate-pulse" />
                <div className="absolute w-48 h-48 border border-teal-500/5 rounded-full" />
              </div>
            </div>

            {/* Interactive Control Deck (Guttered directly at the bottom in the hologram housing) */}
            <div className="relative z-10 bg-zinc-950/90 border border-zinc-850 p-3 rounded-none flex flex-col md:flex-row gap-3 items-center">
              
              {/* Offset Positioner Slider */}
              <div className="flex-1 w-full flex flex-col gap-1.5">
                <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none">
                  <span className="flex items-center gap-1">
                    ⚙️ COUPLING OFFSETS CALIBER
                  </span>
                  <span className="text-cyan-400">{transitScrub === 0 ? "DEAD CALIBRATED (LOCKED)" : `${(transitScrub * 3.5).toFixed(1)}m OFFSET`}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="range"
                    min="-3.5"
                    max="3.5"
                    step="0.05"
                    value={transitScrub}
                    disabled={autoPatrol}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (snapToGrid === '15') {
                        val = Math.round(val / 0.5) * 0.5;
                      } else if (snapToGrid === '45') {
                        val = Math.round(val / 1.5) * 1.5;
                      }
                      setTransitScrub(val);
                    }}
                    className="flex-1 h-1 bg-zinc-900 rounded-none appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                  
                  <button
                    onClick={() => setAutoPatrol(!autoPatrol)}
                    className={`px-2 py-1 rounded-sm text-[7.5px] font-mono font-bold tracking-widest uppercase cursor-pointer border flex items-center gap-1 transition-all ${
                      autoPatrol 
                        ? "bg-purple-950/20 border-purple-500/40 text-purple-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white"
                    }`}
                    title={autoPatrol ? "Pause automatic train movement along rails" : "Resume automative rail track patrol movement"}
                  >
                    {autoPatrol ? (
                      <>
                        <Pause size={8} className="animate-pulse" />
                        <span>AUTO</span>
                      </>
                    ) : (
                      <>
                        <Play size={8} />
                        <span>MANUAL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Weld Deployers */}
              <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                {repairStep === 'weld-locked' || !proximityActive ? (
                  <div className="text-right flex flex-col items-end pr-1">
                    <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">
                      WELD LOCK DETECTOR
                    </span>
                    <span className="text-[7.5px] font-mono text-yellow-500/85 uppercase font-bold tracking-wider flex items-center gap-0.5 mt-0.5 leading-none">
                      <AlertTriangle size={9} className="text-yellow-500 animate-pulse" />
                      ALIGN CENTER ON RING
                    </span>
                  </div>
                ) : (
                  <>
                    {repairStep === 'ready' ? (
                      <button
                        onClick={resetDockPlatform}
                        className="py-1.5 px-3 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-[8.5px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={10} className="animate-spin-slow" />
                        <span>RESET BRIDGE NOMINAL</span>
                      </button>
                    ) : (
                      <button
                        onClick={startWeldProcedure}
                        disabled={repairStep === 'welding'}
                        className="py-1.5 px-3 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-[8.5px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-98 disabled:opacity-45 cursor-pointer animate-pulse"
                      >
                        <Wrench size={10} className={repairStep === 'welding' ? "animate-spin" : ""} />
                        <span>
                          {repairStep === 'welding' ? "WELDING..." : "DEPLOY REPAIR WELD"}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* INTEGRITY BREACH EMERGENCY GRID PANEL */}
            <AnimatePresence>
              {isIntegrityBreachSimulated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.85, 1, 0.85],
                    borderColor: ["rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.95)", "rgba(239, 68, 68, 0.8)"]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 z-30 bg-red-950/40 backdrop-blur-[0.5px] border-4 flex flex-col justify-between p-4 pointer-events-none select-none"
                >
                  <div className="absolute inset-1 border border-dashed border-red-500/25 rounded pointer-events-none" />

                  <span className="relative z-10 flex items-center justify-between font-mono text-[8px] font-black tracking-widest text-red-400 bg-red-950/90 px-2 py-1 border border-red-500/40">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={11} className="text-red-500 animate-bounce" />
                      ALARM LEVEL ENGAGED // CRITICAL BREACH
                    </span>
                    <span className="animate-pulse">RIFT_INFESTATION</span>
                  </span>

                  <div className="relative z-10 flex flex-col items-center justify-center text-center gap-1 self-center my-auto">
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.9, ease: "easeIn" }}
                      className="p-1.5 bg-red-500/20 border border-red-500/50 rounded-full"
                    >
                      <Skull className="text-red-500 w-5 h-5 animate-pulse" />
                    </motion.div>
                    <div className="font-mono font-black text-[9px] text-red-100 uppercase tracking-widest">
                      CHASSIS STRUCTURAL CRACK DETECTED
                    </div>
                    <p className="font-mono text-[7px] max-w-[210px] text-red-300/80 leading-normal lowercase">
                      incursion vectors attacking central cargo unit compartments. deploy sweeps to compress.
                    </p>
                  </div>

                  <div className="relative z-10 flex justify-between font-mono text-[6.5px] text-red-400/80 font-bold uppercase tracking-wider">
                    <span>COCKPIT_ID: SEC_B7</span>
                    <span className="animate-pulse">SWEEP_PURGE_AUTHORIZED</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* ================= RIGHT WING CONTROLS (Radar and Map Atlas) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3 select-none">
          
          {/* Module 3: Rift Incursion Sector Scanner */}
          <RiftIncursionScanner
            threatLevel={threatLevel}
            setThreatLevel={setThreatLevel}
            triggerRandomEncounter={triggerRandomEncounter}
            resolveThreatState={resolveThreatState}
            addLog={addLog}
            activeRoute={activeRoute}
          />

          {/* Module 4: Mystical Transit Oracle Atlas (Signal Corridor Selector) */}
          <div className="p-4 bg-[#0a0f15] border border-zinc-800 relative flex flex-col gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.85)]">
            <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-650" />
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-650" />
            <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-zinc-650" />
            <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-zinc-650" />
            {/* Bronze highlight line */}
            <div className="absolute inset-x-2 bottom-1 h-[1px] bg-amber-600/30" />

            <div className="flex justify-between items-center text-[10px] pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 uppercase font-mono font-bold text-zinc-350 tracking-wider">
                <Compass size={12} className="text-cyan-400 animate-spin-slow" />
                Signal Rail Oracle Atlas
              </span>
              
              {/* Route Select Tabs */}
              <div className="flex bg-zinc-950 p-0.5 rounded-sm border border-zinc-850 gap-0.5 scale-90 origin-right">
                <button
                  onClick={() => setActiveRoute('central')}
                  className={`px-1.5 py-0.5 text-[6.5px] font-bold uppercase rounded-sm cursor-pointer transition-all ${
                    activeRoute === 'central' ? "bg-cyan-500 text-black font-black" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Z-1
                </button>
                <button
                  onClick={() => setActiveRoute('basin')}
                  className={`px-1.5 py-0.5 text-[6.5px] font-bold uppercase rounded-sm cursor-pointer transition-all ${
                    activeRoute === 'basin' ? "bg-emerald-500 text-black font-black" : "text-zinc-505 hover:text-zinc-300"
                  }`}
                >
                  P-9
                </button>
                <button
                  onClick={() => setActiveRoute('siren')}
                  className={`px-1.5 py-0.5 text-[6.5px] font-bold uppercase rounded-sm cursor-pointer transition-all ${
                    activeRoute === 'siren' ? "bg-purple-600 text-white font-black" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  EX-4
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-mono">
              <div className="text-[7.5px] text-zinc-400 uppercase tracking-wide bg-black/60 p-2 rounded border border-zinc-900 flex justify-between">
                <span>Active Track: <strong className="text-white">
                  {activeRoute === 'central' ? "Central Gap" : activeRoute === 'basin' ? "Basin Trench" : "Siren Threshold"}
                </strong></span>
                <span className={`${autoPatrol ? "text-purple-400 font-bold" : "text-amber-505 font-bold"}`}>
                  {autoPatrol ? "PATROLLING_LOOP" : "MANUAL_STBY"}
                </span>
              </div>

              {/* Transit Map Circuit Track Plot */}
              <div className="w-full h-16 flex items-center justify-center relative overflow-hidden bg-black/60 rounded border border-zinc-900">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293706_1px,transparent_1px),linear-gradient(to_bottom,#1f293706_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                <svg viewBox="0 0 400 70" className="w-full h-full relative z-10 px-2 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                  {activeRoute === 'central' ? (
                    <>
                      <line x1="30" y1="35" x2="370" y2="35" stroke="rgba(63,63,70,0.3)" strokeWidth="6" strokeLinecap="round" />
                      <line x1="30" y1="35" x2="370" y2="35" stroke="rgba(39,39,42,0.8)" strokeWidth="4" strokeDasharray="2,4" />
                      <circle cx="30" cy="35" r="3" fill="#09090b" stroke="#00f2fe" strokeWidth="1.5" />
                      <circle cx="150" cy="35" r="3.5" fill="#09090b" stroke="#a78bfa" strokeWidth="1.2" />
                    </>
                  ) : activeRoute === 'basin' ? (
                    <>
                      <path d="M 30 35 Q 110 15, 200 35 T 370 35" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 30 35 Q 110 15, 200 35 T 370 35" fill="none" stroke="rgba(20,20,30,0.9)" strokeWidth="4" strokeDasharray="2,4" />
                      <circle cx="30" cy="35" r="3" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx="150" cy="25" r="3.5" fill="#09090b" stroke="#10b981" strokeWidth="1.2" />
                    </>
                  ) : (
                    <>
                      <path d="M 30 35 C 110 50, 150 10, 200 35 C 250 55, 300 20, 370 35" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 30 35 C 110 50, 150 10, 200 35 C 250 55, 300 20, 370 35" fill="none" stroke="rgba(20,20,30,0.9)" strokeWidth="4" strokeDasharray="3,5" />
                      <circle cx="30" cy="35" r="3" fill="#09090b" stroke="#a78bfa" strokeWidth="1.5" />
                      <circle cx="150" cy="40" r="3.5" fill="#09090b" stroke="#a78bfa" strokeWidth="1.2" />
                    </>
                  )}

                  {/* Station Lock Marker (Center target node 200px) */}
                  <circle 
                    cx="200" 
                    cy="35" 
                    r="4.5" 
                    fill={proximityActive ? "rgba(6,182,212,0.25)" : "#09090b"} 
                    stroke={proximityActive ? "#06b6d4" : "rgba(6,182,212,0.4)"} 
                    strokeWidth="2" 
                    className={proximityActive ? "animate-pulse" : ""}
                  />
                  {proximityActive && <circle cx="200" cy="35" r="7" fill="none" stroke="#06b6d4" strokeWidth="0.5" className="animate-ping" />}

                  {/* Dynamic MTD Chassis position widget tracker */}
                  {(() => {
                    const percent = (transitScrub + 3.5) / 7.0; 
                    const percentLimited = Math.max(0.01, Math.min(0.99, percent));
                    
                    let markerX = 30 + percentLimited * 340;
                    let markerY = 35;
                    
                    if (activeRoute === 'basin') {
                      markerY = 35 - Math.sin(percentLimited * Math.PI) * 15;
                    } else if (activeRoute === 'siren') {
                      markerY = 35 + Math.sin(percentLimited * Math.PI * 2) * 13;
                    }
                    
                    return (
                      <g>
                        <circle cx={markerX} cy={markerY} r="7" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.3)" strokeWidth="0.8" />
                        <rect
                          x={markerX - 4}
                          y={markerY - 4}
                          width="8"
                          height="8"
                          rx="1.5"
                          fill={proximityActive ? "#06b6d4" : "#a855f7"}
                          className="filter drop-shadow-[0_0_4px_rgba(6,182,212,0.6)] animate-pulse"
                        />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[7px] text-zinc-500 uppercase tracking-widest text-center border-t border-zinc-900 pt-2 leading-tight">
                <div className="flex flex-col">
                  <span className="text-zinc-550 font-black">VELOCITY LOG</span>
                  <span className="text-zinc-400 font-bold">{autoPatrol ? "55 KM/H LOOP" : "ZERO COMPRESSION"}</span>
                </div>
                <div className="flex flex-col border-l border-zinc-900">
                  <span className="text-zinc-550 font-black">COUPLING ANCHOR</span>
                  <span className="text-white font-bold">{proximityActive ? "LOCKED IN ALIGN" : "COCKPIT DRIVER SEEK"}</span>
                </div>
              </div>
            </div>

            <p className="text-[6.5px] text-zinc-500 leading-normal font-mono uppercase text-left">
              *MAP COORDINATES SYNCED WITH CORRIDOR RADAR EMISSIONS STAGE-7.
            </p>
          </div>

        </div>

        {/* ================= LOWER TERMINAL ROW: Neural Freight Nodes ================= */}
        <div className="lg:col-span-12 order-4 select-none">
          
          {/* Module 5: Neural Freight Nodes (Operative sync console) */}
          <div className="p-4 bg-[#0a0f15]/90 border border-zinc-800 relative rounded-none flex flex-col gap-3 shadow-[inset_0_1px_10px_rgba(0,18,25,0.7)]">
            <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-zinc-750" />
            <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-zinc-750" />
            <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-zinc-750" />
            <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-zinc-750" />
            <div className="absolute inset-0.5 border border-amber-900/10 pointer-events-none" />

            <div className="flex justify-between items-center pb-2 border-b border-zinc-850 font-mono text-[10px] uppercase tracking-wider">
              <span className="flex items-center gap-2 font-black text-zinc-350">
                <User size={13} className="text-brand-cyan animate-pulse" />
                NEURAL FREIGHT OPERATIVE NODES // DECODER LINK
              </span>
              <span className="text-[7px] text-zinc-500 tracking-widest font-black">RITUAL HEADSET FEED ACTIVE</span>
            </div>

            {/* Neural channel blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
              {operatives.map((op, idx) => {
                const isSelected = selectedOperativeIndex === idx;
                return (
                  <div 
                    key={op.name}
                    onClick={() => setSelectedOperativeIndex(idx)}
                    className={`p-4 relative transition-all duration-300 cursor-pointer flex flex-col justify-between rounded-none border group overflow-hidden ${
                      isSelected 
                        ? "bg-cyan-950/15 border-cyan-500/80 shadow-[inset_0_1px_15px_rgba(6,182,212,0.22),0_4px_20px_rgba(0,0,0,0.8)] scale-[1.01]" 
                        : "bg-[#04060a]/90 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    {/* Corner highlights representing node telemetry slots */}
                    <div className={`absolute top-1 left-1 w-1 h-1 rounded-full ${isSelected ? "bg-cyan-400" : "bg-zinc-800"}`} />
                    <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${isSelected ? "bg-cyan-400" : "bg-zinc-800"}`} />
                    <div className={`absolute bottom-1 right-1 w-1 h-1 rounded-full ${isSelected ? "bg-cyan-400" : "bg-zinc-800"}`} />
                    <div className={`absolute bottom-1 left-1 w-1 h-1 rounded-full ${isSelected ? "bg-cyan-400" : "bg-zinc-800"}`} />

                    {/* Node Header Info */}
                    <div className="flex justify-between items-start font-mono mb-1">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className={`text-[6px] font-black tracking-widest uppercase ${op.headset ? "text-cyan-400" : "text-zinc-550"}`}>
                          // NF_NODE_SLOT_0{idx + 1}
                        </span>
                        <h3 className={`text-[9.5px] font-black uppercase tracking-wide leading-none ${isSelected ? "text-white" : "text-zinc-300"}`}>
                          {op.name.replace("CST-ERT Trooper ", "").replace("Witch Trooper ", "").replace("Battle Arcanist ", "")}
                        </h3>
                        <span className="text-[6.5px] text-zinc-500 font-medium">
                          CLASS: <strong className="text-zinc-400 font-bold">{op.class.toUpperCase()}</strong>
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`text-[6px] px-1 py-[1.5px] rounded-[1.5px] font-black border uppercase tracking-widest ${
                          op.headset 
                            ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/30 animate-pulse" 
                            : "bg-purple-950/20 text-purple-400 border-purple-900/30"
                        }`}>
                          {op.headset ? "SYS_CONNECTED" : "RES_STANDBY"}
                        </span>
                        <span className="text-[5.5px] text-zinc-650 font-bold mt-1 uppercase">RES. {op.pwr} RMS</span>
                      </div>
                    </div>

                    {/* Circular Headset Link Core Architecture */}
                    <div className="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
                      
                      {/* Active Concentric Pulsing Headset Sync Waves */}
                      {op.headset ? (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <motion.div 
                            className="absolute w-28 h-28 rounded-full border border-cyan-500/30"
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: [0.8, 1.35, 1.8], opacity: [0.8, 0.25, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                          />
                          <motion.div 
                            className="absolute w-28 h-28 rounded-full border border-purple-500/20"
                            initial={{ scale: 0.8, opacity: 0.6 }}
                            animate={{ scale: [0.8, 1.2, 1.5], opacity: [0.6, 0.15, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: "easeOut" }}
                          />
                          <motion.div 
                            className="absolute w-28 h-28 rounded-full border border-cyan-400/10"
                            initial={{ scale: 0.8, opacity: 0.4 }}
                            animate={{ scale: [0.8, 1.1, 1.3], opacity: [0.4, 0.08, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, delay: 1.4, ease: "easeOut" }}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <motion.div 
                            className="absolute w-26 h-26 rounded-full border border-purple-950/20"
                            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.15, 0.35] }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                          />
                        </div>
                      )}

                      {/* SVG Ring Rotors & Dials */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
                        {/* Outer calibration ticks */}
                        <circle cx="50" cy="50" r="47" fill="none" stroke={op.headset ? "rgba(6, 182, 212, 0.2)" : "rgba(139, 92, 246, 0.1)"} strokeWidth="0.5" strokeDasharray="1,4" />
                        
                        {/* Interactive Main Rotating Dials */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="43" 
                          fill="none" 
                          stroke={op.headset ? "rgba(6, 182, 212, 0.45)" : "rgba(139, 92, 246, 0.2)"} 
                          strokeWidth="0.8" 
                          strokeDasharray="6,8,30,12" 
                          className={`origin-center ${op.headset ? "animate-[spin_12s_linear_infinite]" : "animate-[spin_24s_linear_infinite]"}`} 
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="39" 
                          fill="none" 
                          stroke={op.headset ? "rgba(6, 182, 212, 0.3)" : "rgba(139, 92, 246, 0.15)"} 
                          strokeWidth="0.6" 
                          strokeDasharray="40,20,10,15" 
                          className="origin-center animate-[spin_10s_linear_infinite_reverse]" 
                        />
                        
                        {/* Solid interior alignment channel */}
                        <circle cx="50" cy="50" r="32" fill="none" stroke={isSelected ? "rgba(6, 182, 212, 0.2)" : "rgba(63, 63, 70, 0.15)"} strokeWidth="1" />

                        {/* Interactive Resonance Signatures (Live Mathematical Waveforms) */}
                        <g opacity={op.headset ? 0.95 : 0.4}>
                          <path 
                            d={op.headset 
                              ? "M 22,50 C 32,32 36,68 50,51 C 64,34 68,68 78,50" 
                              : "M 24,50 C 34,44 38,56 50,51 C 62,45 66,55 76,50"
                            } 
                            fill="none" 
                            stroke={op.headset ? "#22d3ee" : "#a855f7"} 
                            strokeWidth="1.2" 
                            className={op.headset ? "animate-[pulse_1.2s_infinite_ease-in-out]" : ""}
                          />
                        </g>

                        {/* Outer radar sweep vector dot */}
                        {op.headset && (
                          <circle cx="50" cy="7" r="1.5" fill="#22d3ee" className="origin-center animate-[spin_5s_linear_infinite]" />
                        )}
                      </svg>

                      {/* Central Static Info Glass Core */}
                      <div className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center text-center border transition-all duration-300 ${
                        isSelected 
                          ? "bg-zinc-950/90 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                          : "bg-black/85 border-zinc-900"
                      }`}>
                        <span className="text-[5.5px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-0.5">SYNC MATRIX</span>
                        <span className={`font-mono font-black text-sm tracking-tighter leading-none ${
                          op.headset 
                            ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.45)]" 
                            : "text-[#ec4899] drop-shadow-[0_0_6px_rgba(236,72,153,0.25)]"
                        }`}>
                          {op.sync}%
                        </span>
                        <span className={`text-[4.5px] font-black tracking-widest uppercase mt-1 px-1 py-[0.5px] rounded-[1px] ${
                          op.headset ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20" : "bg-purple-950/20 text-purple-400 border border-purple-900/10"
                        }`}>
                          {op.headset ? "CONNECTED" : "DISCONN"}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Data panel for secondary attributes */}
                    <div className="grid grid-cols-2 gap-1 text-[6.5px] font-mono bg-black/60 border border-zinc-900/40 p-2 rounded-[2px]">
                      <div className="flex justify-between border-r border-zinc-900/60 pr-1.5 text-zinc-500">
                        <span>VELOCITY:</span>
                        <strong className="text-zinc-300 font-bold">{op.spd} kn/s</strong>
                      </div>
                      <div className="flex justify-between pl-1.5 text-zinc-500">
                        <span>SIG_WEAP:</span>
                        <strong className="text-purple-400 font-bold truncate max-w-[65px]" title={op.weapon}>
                          {op.weapon.replace("Arcane ", "").replace("Golem ", "").replace("Dual ", "").split(' ')[0]}
                        </strong>
                      </div>
                    </div>

                    {/* Interactive Toggle Switch for sync link */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = [...operatives];
                          updated[idx].headset = !updated[idx].headset;
                          updated[idx].status = updated[idx].headset ? "LIVE CHANNEL" : "STBY RESONANCE";
                          setOperatives(updated);
                          addLog(`COCKPIT // NEURAL HEADSET FOR ${op.name} ${updated[idx].headset ? 'ENABLED' : 'STBY'}`);
                        }}
                        className={`flex-1 py-1 px-2 rounded-sm text-[7.5px] font-mono font-black tracking-widest uppercase transition-all select-none cursor-pointer border flex items-center justify-center gap-1.5 ${
                          op.headset 
                            ? "bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:bg-[#0c2d3a] hover:border-cyan-400 hover:text-white" 
                            : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
                        }`}
                      >
                        <Activity size={9} className={op.headset ? "text-cyan-400 animate-pulse" : "text-zinc-650"} />
                        {op.headset ? "⚡ DECODE STBY COGNITIVE" : "🔌 SYNC NEURAL CHANNEL"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Operative Details panel (tactile deck readouts) */}
            <div className="mt-2 text-zinc-400 bg-black/40 border border-zinc-900/65 p-3 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3 font-mono">
              <div className="flex-1 text-[8.5px]">
                <span className="text-cyan-400 font-black uppercase block mb-1">SELECTED DIRECT STREAM SPECS:</span>
                <p className="text-zinc-400 text-[8px] leading-relaxed">
                  {operatives[selectedOperativeIndex].specialty}. Fitted equipped with anti-corruption <strong className="text-purple-400 font-bold">{operatives[selectedOperativeIndex].weapon}</strong> payload modules.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-4 text-[8px] tracking-wider border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-550 font-bold">ATTACK INTENSITY</span>
                  <span className="font-bold text-white">{operatives[selectedOperativeIndex].atk} PTS</span>
                </div>
                <div className="flex flex-col gap-0.5 border-x border-zinc-900 px-3">
                  <span className="text-zinc-550 font-bold">DEFENSE CAPACITY</span>
                  <span className="font-bold text-white">{operatives[selectedOperativeIndex].def} PTS</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-550 font-bold">NEURAL VOLTAGE</span>
                  <span className="font-bold text-purple-400 animate-pulse">{operatives[selectedOperativeIndex].pwr} RMS</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= STRIPE CHECKOUT MODAL OVERLAY ================= */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-[#070a0f] border-2 border-amber-600/40 rounded-none p-5 font-mono shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col gap-4 text-left relative"
            >
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-600/60" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-600/60" />

              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  <CreditCard size={12} className="text-amber-400 animate-pulse" />
                  Stripe Gas Checkout Terminal
                </span>
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="text-zinc-500 hover:text-white px-2 py-0.5 rounded-none bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[8px] cursor-pointer"
                >
                  DISCONNECT // ✕
                </button>
              </div>

              <form onSubmit={handleStripeCheckout} className="flex flex-col gap-3 text-[9px]">
                <div>
                  <label className="text-zinc-500 uppercase font-black text-[7.5px] block mb-1">Select Shield Cartridge Charge Package</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div 
                      onClick={() => setSelectedPack('pocket')}
                      className={`p-2 border rounded-none cursor-pointer text-center flex flex-col transition-colors ${
                        selectedPack === 'pocket' ? "border-amber-500 bg-amber-950/20 text-amber-200" : "border-zinc-850 hover:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="font-bold text-[8px]">Liton Vial</span>
                      <span className="font-black text-white text-[9px] mt-0.5">+50 FL</span>
                      <span className="text-zinc-500 text-[7px] mt-1">$2.50 USD</span>
                    </div>
                    <div 
                      onClick={() => setSelectedPack('standard')}
                      className={`p-2 border rounded-none cursor-pointer text-center flex flex-col transition-colors ${
                        selectedPack === 'standard' ? "border-amber-500 bg-amber-950/20 text-amber-200" : "border-zinc-855 hover:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="font-bold text-[8px]">Standard</span>
                      <span className="font-black text-white text-[9px] mt-0.5">+200 FL</span>
                      <span className="text-zinc-500 text-[7px] mt-1">$6.99 USD</span>
                    </div>
                    <div 
                      onClick={() => setSelectedPack('reserve')}
                      className={`p-2 border rounded-none cursor-pointer text-center flex flex-col transition-colors ${
                        selectedPack === 'reserve' ? "border-amber-500 bg-amber-950/20 text-amber-200" : "border-zinc-850 hover:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="font-bold text-[8px]">Premium</span>
                      <span className="font-black text-white text-[9px] mt-0.5">+400 FL</span>
                      <span className="text-zinc-500 text-[7px] mt-1">$12.99 USD</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 uppercase font-bold text-[7.5px]">Operator Verification Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SHIP CADET"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="bg-zinc-950 border border-zinc-850 p-2 text-white placeholder-zinc-800 outline-none focus:border-amber-500/50 rounded-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-505 uppercase font-bold text-[7.5px]">Debit Card Number</label>
                  <input 
                    type="text" 
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    maxLength={19}
                    required
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      const matches = val.match(/\d{4,16}/g);
                      const match = (matches && matches[0]) || '';
                      const parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      if (parts.length > 0) {
                        setCardNumber(parts.join(' '));
                      } else {
                        setCardNumber(val);
                      }
                    }}
                    className="bg-zinc-955 border border-zinc-850 p-2 text-white placeholder-zinc-800 outline-none focus:border-amber-500/50 tracking-widest rounded-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500 uppercase font-bold text-[7.5px]">Expiration</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length >= 2) {
                          setCardExpiry(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
                        } else {
                          setCardExpiry(val);
                        }
                      }}
                      className="bg-zinc-950 border border-zinc-850 p-2 text-white placeholder-zinc-805 outline-none focus:border-amber-500/50 rounded-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500 uppercase font-bold text-[7.5px]">CVV Codes</label>
                    <input 
                      type="password" 
                      placeholder="XXX"
                      maxLength={3}
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                      className="bg-zinc-950 border border-zinc-850 p-2 text-white placeholder-zinc-800 outline-none focus:border-amber-500/50 rounded-none"
                    />
                  </div>
                </div>

                <p className="text-[6.5px] text-zinc-650 leading-normal lowercase">
                  *secure, compliance-encrypted merchant loop sandbox. values are mock simulation entries.
                </p>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="mt-1 w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 select-none disabled:opacity-40 cursor-pointer rounded-none shadow"
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw size={11} className="animate-spin" />
                      <span>DECK CHARGING CARD...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={11} />
                      <span>AUTHORIZE MERCHANT SYNC</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STRIPE SUCCESS FEEDBACK PANEL */}
      <AnimatePresence>
        {stripeSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 inset-x-4 z-40 bg-emerald-950/95 border border-emerald-500/40 p-3 rounded-none flex items-center justify-between pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.15)] font-mono text-[8.5px]"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <Check size={11} />
              </div>
              <div>
                <span className="font-bold text-emerald-400 uppercase block">STRIPE MERCHANT AUTH CONFIRMED</span>
                <span className="text-zinc-400 text-[7.5px]">Fuel cartridges filled and pumped directly into the cockpit.</span>
              </div>
            </div>
            <span className="text-zinc-650 font-bold hidden md:inline">STRIPE_STBY STATUS: 200 OK</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
