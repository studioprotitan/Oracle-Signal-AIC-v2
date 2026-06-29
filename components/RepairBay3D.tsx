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
  TransformNode,
  SceneLoader
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { 
  Play, Pause, RefreshCw, Layers, Shield, Wrench, AlertTriangle, 
  Heart, Activity, Gauge, Navigation, Compass, User, Zap, Database, 
  Wallet, CreditCard, Flame, Skull, ShieldCheck, Check, Server,
  ZoomIn, ZoomOut, RotateCw, Maximize2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Info, X
} from 'lucide-react';
import { RiftIncursionScanner } from './RiftIncursionScanner';
import { glbLoaderService } from '../services/glbLoaderService';

export interface ComponentStructureData {
  id: string;
  name: string;
  material: string;
  integrity: number;
  status: 'Stable' | 'Degraded';
  notes: string;
  resonance: string;
  meshNamePattern: string;
}

export const MODEL_COMPONENTS_DATA: ComponentStructureData[] = [
  {
    id: 'fuselage',
    name: 'Stealth Fuselage Chassis',
    material: 'Carbon-Composite Titanium Matrix',
    integrity: 98,
    status: 'Stable',
    notes: 'Central fuselage engineered with multi-layered carbon fiber and uncataloged titanium matrix. Demonstrates zero structural fatigue.',
    resonance: '14.2 Hz (Damped)',
    meshNamePattern: 'stealthFuselage'
  },
  {
    id: 'canopy',
    name: 'Canopy Shield & Sensor Array',
    material: 'Coaxial Blue Laser Glass Polymer',
    integrity: 74,
    status: 'Degraded',
    notes: 'Cockpit glass with integrated blue quantum sensory receiver. Micro-meteoroid impacts detected. Refraction efficiency degraded by 8.4%.',
    resonance: '412.5 Hz (Excited)',
    meshNamePattern: 'stealthCanopy'
  },
  {
    id: 'left_wing',
    name: 'Left Swept Wing',
    material: 'Aero-Carbon Composite Plating',
    integrity: 94,
    status: 'Stable',
    notes: 'Swept wing housing hydraulic steering stabilizers. Airfoil and leading edges are completely intact. Stress loads nominal.',
    resonance: '84.8 Hz',
    meshNamePattern: 'stealthLeftWing'
  },
  {
    id: 'left_winglet',
    name: 'Left Wing Stabilizer Trim',
    material: 'Mag-Gold Core Alloy',
    integrity: 92,
    status: 'Stable',
    notes: 'Wingtip stabilizer with gold alloy trim that acts as a magnetic field sink. Flux levels stabilized.',
    resonance: '124.0 Hz',
    meshNamePattern: 'stealthLeftWinglet'
  },
  {
    id: 'right_wing',
    name: 'Right Swept Wing',
    material: 'Aero-Carbon Composite Plating',
    integrity: 68,
    status: 'Degraded',
    notes: 'Right aerodynamic stabilizer plate. Ultrasonic scans detect interior hairline fractures along secondary stress-bearing spar.',
    resonance: '102.4 Hz (Unstable)',
    meshNamePattern: 'stealthRightWing'
  },
  {
    id: 'right_winglet',
    name: 'Right Wing Stabilizer Trim',
    material: 'Mag-Gold Core Alloy',
    integrity: 95,
    status: 'Stable',
    notes: 'Starboard wingtip gold stabilizer trim. Boundary condition interfaces are nominal.',
    resonance: '124.0 Hz',
    meshNamePattern: 'stealthRightWinglet'
  },
  {
    id: 'left_intake',
    name: 'Left Engine Air Intake',
    material: 'Thermal Absorption Ceramic Alloy',
    integrity: 96,
    status: 'Stable',
    notes: 'High-speed cooling intake scoop. Filters free of space dust. Flow parameters optimized.',
    resonance: '220.5 Hz',
    meshNamePattern: 'airIntake_-1'
  },
  {
    id: 'right_intake',
    name: 'Right Engine Air Intake',
    material: 'Thermal Absorption Ceramic Alloy',
    integrity: 97,
    status: 'Stable',
    notes: 'Starboard cooling intake scoop. Aerodynamic flow matches port counterpart.',
    resonance: '220.5 Hz',
    meshNamePattern: 'airIntake_1'
  },
  {
    id: 'left_engine',
    name: 'Left Vector Plasma Thruster',
    material: 'Single-Crystal Superalloy SC-16',
    integrity: 91,
    status: 'Stable',
    notes: 'Port-side main engine. High-temperature ceramic casing shows zero fatigue. Pressure chambers are clear.',
    resonance: '1,850 Hz',
    meshNamePattern: 'thrusterEngine_-1'
  },
  {
    id: 'right_engine',
    name: 'Right Vector Plasma Thruster',
    material: 'Single-Crystal Superalloy SC-16',
    integrity: 52,
    status: 'Degraded',
    notes: 'Starboard main nozzle. Dynamic thermal scans reveal localized erosion of the internal chamber throat lining. Immediate calibration advised.',
    resonance: '1,720 Hz (Fluctuating)',
    meshNamePattern: 'thrusterEngine_1'
  },
  {
    id: 'sensor_needle',
    name: 'Tactile Sensor Scan Needle',
    material: 'Hyper-Conductive Gold-Ir Alloy',
    integrity: 99,
    status: 'Stable',
    notes: 'Long-range scan receiver. Zero alignment drift. Quantum signal reception is fully aligned.',
    resonance: '12.4 kHz',
    meshNamePattern: 'sensorNeedle'
  },
  {
    id: 'sensor_node',
    name: 'Glowing Sensor Orb Node',
    material: 'Coaxial Blue Refractive Glass',
    integrity: 94,
    status: 'Stable',
    notes: 'Optical scanner sphere. Multi-spectral sensors firing at peak frequency. No dead pixels detected.',
    resonance: '840.0 THz',
    meshNamePattern: 'sensorNode'
  },
  {
    id: 'internal_core',
    name: 'Internal Stealth Vector Core',
    material: 'Wireframe Abyssum Hypermatrix',
    integrity: 90,
    status: 'Stable',
    notes: 'Core diagnostic mesh visible in Exploded View. Quantum coherence holds at 90.4%. Harmonic shielding active.',
    resonance: '0.44 Hz (Rhythmic)',
    meshNamePattern: 'internalCoreDiagBox'
  },
  {
    id: 'plasma_reactor',
    name: 'Amber Thruster Plasma Reactor',
    material: 'Concentrated Thermoplastic Plasma',
    integrity: 88,
    status: 'Stable',
    notes: 'Exhaust combustion core reactor. Plasma density stable at 1.44 Mega-Abyss/sec.',
    resonance: '8.8 kHz',
    meshNamePattern: 'internalCoreReactorSphere'
  }
];

interface Props {
  addLog: (msg: string) => void;
  originalQuery?: string;
  snapToGrid?: 'off' | '15' | '45';
  rippleFrequency?: number;
  isCoaxialBurstActive?: boolean;
}

export const RepairBay3D: React.FC<Props> = ({ 
  addLog, 
  originalQuery = "Genesis Relic", 
  snapToGrid = 'off',
  rippleFrequency = 50,
  isCoaxialBurstActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCoaxialBurstActiveRef = useRef<boolean>(false);

  useEffect(() => {
    isCoaxialBurstActiveRef.current = !!isCoaxialBurstActive;
  }, [isCoaxialBurstActive]);
  
  // Customizable Lance Forge state variables
  const [isLanceModalOpen, setIsLanceModalOpen] = useState<boolean>(false);
  const [lanceTipLength, setLanceTipLength] = useState<number>(1.4);
  const [lanceGlowColor, setLanceGlowColor] = useState<string>("#a855f7"); // Purple/magenta default
  const [lanceRingCount, setLanceRingCount] = useState<number>(2);
  const [lanceExpansion, setLanceExpansion] = useState<number>(1.0);
  const [lancePositionMode, setLancePositionMode] = useState<'train' | 'ring'>('train');
  const [lancePowerLevel, setLancePowerLevel] = useState<number>(85);
  const [isLanceBuilt, setIsLanceBuilt] = useState<boolean>(false);

  // New Upgrade Refs for complex geometry and animation
  const steamRef = useRef<{ mesh: any; vy: number; vx: number; vz: number; life: number; size: number }[]>([]);
  const fanBladesRef = useRef<any[]>([]);
  const repairArmsRef = useRef<{ base: any; lowerArm: any; upperArm: any; toolHead: any; angleOffset: number }[]>([]);
  const couplingGearsRef = useRef<any[]>([]);
  const observerNodeRef = useRef<any>(null);
  const abexConduitsRef = useRef<any[]>([]);
  const gantryTrolleyRef = useRef<any>(null);
  const hydraulicLockersRef = useRef<{ sleeve: any; piston: any; clamp: any; angle: number; currentExtension: number }[]>([]);

  // Custom Lance References
  const lanceRootRef = useRef<any>(null);
  const lanceRingsRef = useRef<any[]>([]);

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

  // New visual Tab & 3D Stage states for Field Unit Inspection
  const [activeDeskTab, setActiveDeskTab] = useState<'hologram' | 'inspection'>('hologram');
  const [loadedModelName, setLoadedModelName] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'cst-mvp' | 'forge' | null>(null);
  const [currentLightPreset, setCurrentLightPreset] = useState<'flood' | 'excitation' | 'lowglow'>('flood');
  const [currentCameraPreset, setCurrentCameraPreset] = useState<'orbit' | 'head' | 'chassis' | 'bottom'>('orbit');
  const [isDroneInspectOn, setIsDroneInspectOn] = useState<boolean>(false);

  // Cockpit 3D model preloading and selection
  const [cockpitModel, setCockpitModel] = useState<'train' | 'infiltrator'>('train');
  const [isInfiltratorPreloaded, setIsInfiltratorPreloaded] = useState<boolean>(false);
  const [selectedGlbPath, setSelectedGlbPath] = useState<string>("commander-antonio-coldstone-a.glb");
  const selectedGlbPathRef = useRef<string>("commander-antonio-coldstone-a.glb");
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const [activeAnimationName, setActiveAnimationName] = useState<string | null>(null);

  useEffect(() => {
    selectedGlbPathRef.current = selectedGlbPath;
    if (sceneRef.current) {
      addLog(`GLB SYSTEM // INITIATING LOAD FOR SCHEMATIC: ${selectedGlbPath.toUpperCase()}`);
      glbLoaderService.preLoadModel(sceneRef.current, selectedGlbPath).then((success) => {
        setIsInfiltratorPreloaded(true);
        addLog(`GLB SYSTEM // SCHEMATIC PRE-LOADED AND READY: ${selectedGlbPath.toUpperCase()}`);
        if (cockpitModel === 'infiltrator' && typeof (window as any).__rebuildCockpitMesh === 'function') {
          (window as any).__rebuildCockpitMesh();
        }
      }).catch(err => {
        console.error("GLB SYSTEM // Preload failed:", err);
      });
    }
  }, [selectedGlbPath, cockpitModel]);
  const cockpitModelRef = useRef<'train' | 'infiltrator'>('train');
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);
  const isExplodedViewRef = useRef<boolean>(false);

  useEffect(() => {
    isExplodedViewRef.current = isExplodedView;
  }, [isExplodedView]);

  // 3D Surface Measurement State & References
  const [isMeasureMode, setIsMeasureMode] = useState<boolean>(false);
  const isMeasureModeRef = useRef<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ p1: Vector3 | null, p2: Vector3 | null }>({ p1: null, p2: null });
  const measurePointsRef = useRef<{ p1: Vector3 | null, p2: Vector3 | null }>({ p1: null, p2: null });
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);

  // 3D Component Selection & Sidebar states
  const [selectedComponent, setSelectedComponent] = useState<ComponentStructureData | null>(MODEL_COMPONENTS_DATA[0]);
  const [isComponentSidebarOpen, setIsComponentSidebarOpen] = useState<boolean>(true);

  const measureP1MeshRef = useRef<any>(null);
  const measureP2MeshRef = useRef<any>(null);
  const measureLineMeshRef = useRef<any>(null);

  const clearMeasurementSilent = () => {
    if (measureP1MeshRef.current) {
      measureP1MeshRef.current.dispose();
      measureP1MeshRef.current = null;
    }
    if (measureP2MeshRef.current) {
      measureP2MeshRef.current.dispose();
      measureP2MeshRef.current = null;
    }
    if (measureLineMeshRef.current) {
      measureLineMeshRef.current.dispose();
      measureLineMeshRef.current = null;
    }
    setMeasurePoints({ p1: null, p2: null });
    setMeasureDistance(null);
  };

  const handleClearMeasurement = () => {
    clearMeasurementSilent();
    addLog("STRUCT DIAG // SURFACE CALIPER CLEARED AND RESET TO NOMINAL");
  };

  const playAnimation = (name: string) => {
    if (!sceneRef.current) return;
    const groups = sceneRef.current.animationGroups;
    if (groups) {
      groups.forEach(g => {
        if (g.name === name) {
          g.start(true); // Loop it
          setActiveAnimationName(name);
          addLog(`ANIMATION ENGINE // PLAYING SEQUENCE: [${name.replace("infiltrator_", "").toUpperCase()}]`);
        } else {
          g.stop();
        }
      });
    }
  };

  const stopAllAnimations = () => {
    if (!sceneRef.current) return;
    const groups = sceneRef.current.animationGroups;
    if (groups) {
      groups.forEach(g => g.stop());
    }
    setActiveAnimationName(null);
    addLog(`ANIMATION ENGINE // ALL SEQUENCES HALTED`);
  };

  useEffect(() => {
    isMeasureModeRef.current = isMeasureMode;
    if (!isMeasureMode) {
      clearMeasurementSilent();
    }
  }, [isMeasureMode]);

  useEffect(() => {
    measurePointsRef.current = measurePoints;
  }, [measurePoints]);

  // 3D Camera Controls State and Reference
  const mainCameraRef = useRef<ArcRotateCamera | null>(null);
  const [isAutoOrbitOn, setIsAutoOrbitOn] = useState<boolean>(true);
  const isAutoOrbitOnRef = useRef<boolean>(true);

  useEffect(() => {
    isAutoOrbitOnRef.current = isAutoOrbitOn;
  }, [isAutoOrbitOn]);

  useEffect(() => {
    cockpitModelRef.current = cockpitModel;
  }, [cockpitModel]);

  // Camera Adjustment Handlers
  const handleZoomIn = () => {
    if (mainCameraRef.current) {
      const cam = mainCameraRef.current;
      cam.radius = Math.max(cam.lowerRadiusLimit || 3.0, cam.radius - 0.8);
      addLog(`CAM CONTROLS // ZOOMED IN: DEPTH [${cam.radius.toFixed(1)}m]`);
    }
  };

  const handleZoomOut = () => {
    if (mainCameraRef.current) {
      const cam = mainCameraRef.current;
      cam.radius = Math.min(cam.upperRadiusLimit || 15.0, cam.radius + 0.8);
      addLog(`CAM CONTROLS // ZOOMED OUT: DEPTH [${cam.radius.toFixed(1)}m]`);
    }
  };

  const handleOrbitLeft = () => {
    if (mainCameraRef.current) {
      setIsAutoOrbitOn(false);
      const cam = mainCameraRef.current;
      cam.alpha -= 0.25;
      addLog(`CAM CONTROLS // ROTATED PORT AXIS: ANGLE [${(cam.alpha * 180 / Math.PI).toFixed(0)}°]`);
    }
  };

  const handleOrbitRight = () => {
    if (mainCameraRef.current) {
      setIsAutoOrbitOn(false);
      const cam = mainCameraRef.current;
      cam.alpha += 0.25;
      addLog(`CAM CONTROLS // ROTATED STARBOARD AXIS: ANGLE [${(cam.alpha * 180 / Math.PI).toFixed(0)}°]`);
    }
  };

  const handleOrbitUp = () => {
    if (mainCameraRef.current) {
      setIsAutoOrbitOn(false);
      const cam = mainCameraRef.current;
      cam.beta = Math.max(0.1, cam.beta - 0.15);
      addLog(`CAM CONTROLS // PITCHED ELEVATION UP: ANGLE [${(cam.beta * 180 / Math.PI).toFixed(0)}°]`);
    }
  };

  const handleOrbitDown = () => {
    if (mainCameraRef.current) {
      setIsAutoOrbitOn(false);
      const cam = mainCameraRef.current;
      cam.beta = Math.min((cam.upperBetaLimit || Math.PI / 2.05), cam.beta + 0.15);
      addLog(`CAM CONTROLS // PITCHED ELEVATION DOWN: ANGLE [${(cam.beta * 180 / Math.PI).toFixed(0)}°]`);
    }
  };

  const handleResetCamera = () => {
    if (mainCameraRef.current) {
      const cam = mainCameraRef.current;
      cam.alpha = Math.PI / 4;
      cam.beta = Math.PI / 2.3;
      cam.radius = 9.0;
      cam.target.set(0, 0.7, 0);
      setIsAutoOrbitOn(false);
      addLog("CAM CONTROLS // CAMERA CHASSIS CALIBRATED TO ORIGINAL GEOMETRY");
    }
  };

  // Refs and support states for terminal
  const inspectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const inspectionEngineRef = useRef<any>(null);
  const inspectionSceneRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pressedKeys, setPressedKeys] = useState<{ [key: string]: boolean }>({});

  // Keyboard monitoring effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDeskTab !== 'inspection') return;
      const key = e.key.toLowerCase();
      setPressedKeys(prev => ({ ...prev, [key]: true }));

      let action = '';
      if (key === 'w' || key === 's') action = 'WALK DIRECTION VECTORS INJECTED';
      else if (key === 'a' || key === 'd') action = 'STRAFE COMPENSATOR ENGAGED';
      else if (key === ' ') action = 'EMERGENCY JUMP BOOST FIRED';
      else if (key === 'f') action = 'ARMED FIST OVERDRIVE ENERGIZED';
      else if (key === 'g') action = 'WEAPON FIRE CYCLED (S -> M -> F)';
      else if (key === 'e') action = 'CONTEXT INTERACTION DEPLOYED';
      else if (key === 'q') action = 'OSU AGILITY BOOST ENGAGED';
      else if (key === 'x') action = 'OPERATIVE LOADOUT DEPLOYED';
      else if (key === 'tab') {
        e.preventDefault();
        action = 'CONTROLLER MATRIX TOGGLED';
      }

      if (action) {
        addLog(`INSPECTOR KEYS // COMMAND [${key.toUpperCase()}]: ${action}`);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setPressedKeys(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeDeskTab]);

  // File drop event brokers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.glb')) {
        (window as any).__lastUploadedGlbFile = file;
        setLoadedModelName(file.name);
        setActivePreset(null);
        addLog(`INSPECTOR TERMINAL // REGISTERED USER UPLOAD: [${file.name}]`);
      } else {
        addLog(`INSPECTOR TERMINAL // ERROR: SUPPORTED FILE TYPE MUST BE .glb`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.glb')) {
        (window as any).__lastUploadedGlbFile = file;
        setLoadedModelName(file.name);
        setActivePreset(null);
        addLog(`INSPECTOR TERMINAL // REGISTERED USER BROWSE: [${file.name}]`);
      } else {
        addLog(`INSPECTOR TERMINAL // ERROR: SUPPORTED FILE TYPE MUST BE .glb`);
      }
    }
  };

  // Render loop and scene setup for the Field Unit Inspection Terminal
  useEffect(() => {
    if (activeDeskTab !== 'inspection') return;
    if (!activePreset && !loadedModelName) return;
    if (!inspectionCanvasRef.current) return;

    const engine = new Engine(inspectionCanvasRef.current, true);
    inspectionEngineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.01, 0.02, 0.04, 1.0);
    inspectionSceneRef.current = scene;

    // Camera setup
    const camera = new ArcRotateCamera(
      "inspectorCamera",
      Math.PI / 4,
      Math.PI / 2.3,
      6.0,
      new Vector3(0, 0.5, 0),
      scene
    );
    camera.attachControl(inspectionCanvasRef.current, true);
    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 15.0;

    // Lights
    const mainLight = new HemisphericLight("inspectorHLight", new Vector3(0, 1, 0), scene);
    mainLight.intensity = currentLightPreset === 'flood' ? 1.0 : currentLightPreset === 'excitation' ? 0.45 : 0.2;
    mainLight.groundColor = new Color3(0.02, 0.04, 0.08);

    const directLight = new PointLight("inspectorPLight", new Vector3(3, 4, 3), scene);
    directLight.intensity = currentLightPreset === 'flood' ? 1.5 : currentLightPreset === 'excitation' ? 2.5 : 0.5;
    directLight.diffuse = currentLightPreset === 'excitation' ? new Color3(1.0, 0.0, 0.5) : new Color3(1.0, 1.0, 1.0);

    const rimLight = new PointLight("inspectorRim", new Vector3(-3, 2, -3), scene);
    rimLight.intensity = currentLightPreset === 'excitation' ? 3.0 : 0.8;
    rimLight.diffuse = currentLightPreset === 'excitation' ? new Color3(0.0, 1.0, 1.0) : new Color3(0.09, 0.45, 0.9);

    // Apply camera presets
    if (currentCameraPreset === 'orbit') {
      camera.setPosition(new Vector3(4, 3, 4));
      camera.setTarget(new Vector3(0, 0.5, 0));
    } else if (currentCameraPreset === 'head') {
      camera.setPosition(new Vector3(0, 1.2, 2.2));
      camera.setTarget(new Vector3(0, 1.0, 0));
    } else if (currentCameraPreset === 'chassis') {
      camera.setPosition(new Vector3(2.5, 0.6, 2.5));
      camera.setTarget(new Vector3(0, 0.5, 0));
    } else if (currentCameraPreset === 'bottom') {
      camera.setPosition(new Vector3(3, -0.4, 3));
      camera.setTarget(new Vector3(0, -0.1, 0));
    }

    // Build grid on ground
    const gridGround = MeshBuilder.CreateGround("inspectorGround", { width: 12, height: 12 }, scene);
    const groundMat = new StandardMaterial("inspectorGroundMat", scene);
    groundMat.diffuseColor = new Color3(0.03, 0.05, 0.08);
    groundMat.specularColor = new Color3(0.1, 0.1, 0.1);
    gridGround.material = groundMat;

    // Create glowing neon floor lines
    const ringTorus = MeshBuilder.CreateTorus("glowTorus", { diameter: 4.0, thickness: 0.04, tessellation: 32 }, scene);
    ringTorus.position.y = 0.01;
    const ringMat = new StandardMaterial("ringMat", scene);
    ringMat.emissiveColor = new Color3(0.0, 0.9, 1.0);
    ringTorus.material = ringMat;

    // Create procedural meshes based on preset
    let modelRoot: any = null;
    let customAnimation: () => void = () => {};

    if (activePreset === 'cst-mvp') {
      modelRoot = new TransformNode("cstRoot", scene);
      
      const body = MeshBuilder.CreateCylinder("cstBody", { height: 1.0, diameter: 0.7, tessellation: 12 }, scene);
      body.parent = modelRoot;
      body.position.y = 0.6;
      const metalMat = new StandardMaterial("metalMat", scene);
      metalMat.diffuseColor = new Color3(0.15, 0.18, 0.22);
      metalMat.specularColor = new Color3(0.8, 0.85, 0.9);
      body.material = metalMat;

      const head = MeshBuilder.CreateSphere("cstHead", { diameter: 0.5 }, scene);
      head.parent = modelRoot;
      head.position.y = 1.35;
      const headMat = new StandardMaterial("headMat", scene);
      headMat.diffuseColor = new Color3(0.08, 0.10, 0.14);
      headMat.emissiveColor = new Color3(0.0, 0.8, 1.0);
      head.material = headMat;

      const orbitRing1 = MeshBuilder.CreateTorus("orbitTorus1", { diameter: 1.2, thickness: 0.03, tessellation: 24 }, scene);
      orbitRing1.parent = modelRoot;
      orbitRing1.position.y = 0.6;
      const ring1Mat = new StandardMaterial("ring1Mat", scene);
      ring1Mat.emissiveColor = new Color3(1.0, 0.0, 0.5);
      orbitRing1.material = ring1Mat;

      customAnimation = () => {
        const t = performance.now() * 0.0025;
        modelRoot.position.y = 0.2 + Math.sin(t * 1.5) * 0.12; 
        orbitRing1.rotation.x = t;
        orbitRing1.rotation.y = t * 0.7;
        body.rotation.y = t * 0.4;
      };

    } else if (activePreset === 'forge') {
      modelRoot = new TransformNode("forgeRoot", scene);

      const generator = MeshBuilder.CreateBox("generatorBox", { size: 0.8 }, scene);
      generator.parent = modelRoot;
      generator.position.y = 0.5;
      const boxMat = new StandardMaterial("boxMat", scene);
      boxMat.diffuseColor = new Color3(0.25, 0.15, 0.08);
      boxMat.specularColor = new Color3(0.6, 0.4, 0.2);
      generator.material = boxMat;

      const innerCore = MeshBuilder.CreateSphere("innerCore", { diameter: 0.4 }, scene);
      innerCore.parent = modelRoot;
      innerCore.position.y = 0.5;
      const coreMat = new StandardMaterial("coreMat", scene);
      coreMat.emissiveColor = new Color3(1.0, 0.5, 0.0);
      innerCore.material = coreMat;

      const pylonL = MeshBuilder.CreateBox("pylonL", { width: 0.15, height: 1.2, depth: 0.3 }, scene);
      pylonL.parent = modelRoot;
      pylonL.position.set(-0.6, 0.6, 0);
      const pylonMat = new StandardMaterial("pylonMat", scene);
      pylonMat.diffuseColor = new Color3(0.12, 0.12, 0.13);
      pylonL.material = pylonMat;

      const pylonR = MeshBuilder.CreateBox("pylonR", { width: 0.15, height: 1.2, depth: 0.3 }, scene);
      pylonR.parent = modelRoot;
      pylonR.position.set(0.6, 0.6, 0);
      pylonR.material = pylonMat;

      customAnimation = () => {
        const t = performance.now() * 0.0025;
        modelRoot.rotation.y = t * 0.6;
        generator.rotation.x = Math.sin(t) * 0.15;
        innerCore.scaling.setAll(1.0 + Math.sin(t * 4) * 0.12);
      };

    } else if (loadedModelName) {
      const cachedFile = (window as any).__lastUploadedGlbFile;
      if (cachedFile) {
        try {
          const fileUrl = URL.createObjectURL(cachedFile);
          SceneLoader.Append("", fileUrl, scene, (loadedScene) => {
            loadedScene.meshes.forEach(mesh => {
              if (!mesh.parent) {
                mesh.position.set(0, 0, 0);
              }
            });
            addLog(`INSPECTOR GLTF // LOADED USER MODEL [${cachedFile.name}] SUCCESSFULLY`);
          }, null, (_scene, message) => {
            addLog(`INSPECTOR GLTF // LOAD ERROR: ${message || 'Unsupported format'}`);
          }, ".glb");
        } catch (e: any) {
          addLog(`INSPECTOR GLTF // ERROR: ${e.message}`);
        }
      } else {
        modelRoot = MeshBuilder.CreateTorusKnot("demoKnot", { radius: 0.4, tube: 0.12 }, scene);
        modelRoot.position.y = 0.6;
        const fallbackMat = new StandardMaterial("fallbackMat", scene);
        fallbackMat.emissiveColor = new Color3(0.0, 1.0, 0.5);
        modelRoot.material = fallbackMat;
        customAnimation = () => {
          modelRoot.rotation.y += 0.01;
        };
      }
    }

    // Hover sweeping scanning rings if toggle is ON
    let droneRing: any = null;
    if (isDroneInspectOn) {
      droneRing = MeshBuilder.CreateTorus("droneRing", { diameter: 2.2, thickness: 0.02, tessellation: 24 }, scene);
      droneRing.position.y = 0.5;
      const droneMat = new StandardMaterial("droneMat", scene);
      droneMat.emissiveColor = new Color3(0.0, 1.0, 0.0);
      droneRing.material = droneMat;
    }

    engine.runRenderLoop(() => {
      if (customAnimation) customAnimation();
      if (droneRing) {
        const scanT = performance.now() * 0.003;
        droneRing.position.y = 0.5 + Math.sin(scanT * 2.0) * 0.6;
        droneRing.rotation.y = scanT * 0.5;
      }
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [activeDeskTab, activePreset, loadedModelName, currentLightPreset, currentCameraPreset, isDroneInspectOn]);

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

  // Dynamic 3D Lance Construction & Calibration logic
  const applyLanceConstruction = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 1. Dispose old lance assemblies and orbit rings if any exist
    if (lanceRootRef.current) {
      lanceRootRef.current.dispose();
      lanceRootRef.current = null;
      lanceRingsRef.current = [];
    }

    if (!isLanceBuilt) return;

    // 2. Create high-fidelity custom Lance root node
    const lanceRoot = new TransformNode("lanceModuleRoot", scene);
    lanceRootRef.current = lanceRoot;

    // Parent to carriage (train) or couple in central ring
    if (lancePositionMode === 'train' && rootNodeRef.current) {
      lanceRoot.parent = rootNodeRef.current;
      // Affix directly onto the roof panel of the freight train
      lanceRoot.position.set(0, 1.6, 0);
      lanceRoot.rotation.set(0, 0, Math.PI / 2); // horizontal forward vector
    } else {
      // Float symmetrically within the mystical coupling ring matrix
      lanceRoot.position.set(0, 1.25, 0);
      lanceRoot.rotation.set(0, 0, 0); // vertical alignment
    }

    // Material setups: procedural gold, metallic silver, emissive energy core
    const silverMetalMat = new StandardMaterial("lanceSilverMat", scene);
    silverMetalMat.diffuseColor = new Color3(0.24, 0.26, 0.32);
    silverMetalMat.specularColor = new Color3(0.72, 0.75, 0.85);
    silverMetalMat.roughness = 0.22;

    const goldTrimMat = new StandardMaterial("lanceGoldMat", scene);
    goldTrimMat.diffuseColor = new Color3(0.68, 0.48, 0.12);
    goldTrimMat.specularColor = new Color3(0.85, 0.75, 0.3);
    goldTrimMat.emissiveColor = new Color3(0.12, 0.08, 0.02);

    const glowColorObj = Color3.FromHexString(lanceGlowColor);
    const emitterEnergyMat = new StandardMaterial("lanceGlowEnergyMat", scene);
    emitterEnergyMat.emissiveColor = glowColorObj;
    emitterEnergyMat.diffuseColor = new Color3(0.01, 0.01, 0.01);
    emitterEnergyMat.disableLighting = true;

    // A. Base Coupling collar joint
    const baseCollar = MeshBuilder.CreateCylinder("lanceBaseCollar", {
      diameter: 0.35,
      height: 0.42,
      tessellation: 16
    }, scene);
    baseCollar.parent = lanceRoot;
    baseCollar.position.y = -0.65;
    baseCollar.material = goldTrimMat;

    // B. Textured main staff cylinder shaft
    const hiltShaft = MeshBuilder.CreateCylinder("lanceHiltShaft", {
      diameter: 0.15,
      height: 1.1,
      tessellation: 16
    }, scene);
    hiltShaft.parent = lanceRoot;
    hiltShaft.position.y = 0.05;
    hiltShaft.material = silverMetalMat;

    // Small gold rings along the hilt shaft to create detailed profile silhouette
    for (let h = -0.4; h <= 0.4; h += 0.2) {
      const ringDet = MeshBuilder.CreateCylinder(`hiltRing_${h}`, {
        diameter: 0.2,
        height: 0.04,
        tessellation: 12
      }, scene);
      ringDet.parent = lanceRoot;
      ringDet.position.y = h + 0.05;
      ringDet.material = goldTrimMat;
    }

    // C. Core Central Chamber (Housing the floating crystalline orb)
    const powerChamber = MeshBuilder.CreateCylinder("lancePowerChamber", {
      diameterTop: 0.38,
      diameterBottom: 0.38,
      height: 0.52,
      tessellation: 16
    }, scene);
    powerChamber.parent = lanceRoot;
    powerChamber.position.y = 0.85;
    powerChamber.material = silverMetalMat;

    // The inner floating catalyst core crystal
    const crystalCore = MeshBuilder.CreateSphere("lanceCrystalCore", {
      diameter: 0.24,
      segments: 8
    }, scene);
    crystalCore.parent = lanceRoot;
    crystalCore.position.y = 0.85;
    crystalCore.scaling.set(1.0, 1.4, 1.0); // prismatic crystal
    crystalCore.material = emitterEnergyMat;

    // Chamber protective support guards (four black struts)
    const darkShieldMat = new StandardMaterial("darkShieldMat", scene);
    darkShieldMat.diffuseColor = new Color3(0.04, 0.04, 0.06);
    
    for (let r = 0; r < 4; r++) {
      const guardStrut = MeshBuilder.CreateBox(`guardStrut_${r}`, {
        width: 0.04,
        height: 0.54,
        depth: 0.4
      }, scene);
      guardStrut.parent = lanceRoot;
      guardStrut.position.y = 0.85;
      guardStrut.rotation.y = (r * Math.PI) / 4;
      guardStrut.material = darkShieldMat;
    }

    // D. Outer Magnetic Rails & Stabilizer brackets
    for (let s = 0; s < 3; s++) {
      const angle = (s * Math.PI * 2) / 3;
      const radius = 0.32 * lanceExpansion;

      const stabPylon = MeshBuilder.CreateBox(`stabPylon_${s}`, {
        width: 0.05,
        height: 0.82,
        depth: 0.04
      }, scene);
      stabPylon.parent = lanceRoot;
      stabPylon.position.set(Math.cos(angle) * radius * 0.75, 0.85, Math.sin(angle) * radius * 0.75);
      stabPylon.rotation.y = -angle;
      stabPylon.material = goldTrimMat;

      // Miniature flux capacitors
      const magnetNode = MeshBuilder.CreateTorus(`magnetNode_${s}`, {
        diameter: 0.22,
        thickness: 0.05,
        tessellation: 12
      }, scene);
      magnetNode.parent = lanceRoot;
      magnetNode.position.set(Math.cos(angle) * radius * 1.25, 0.85, Math.sin(angle) * radius * 1.25);
      magnetNode.rotation.y = -angle;
      magnetNode.material = emitterEnergyMat;
    }

    // E. Symmetrically orbiting concentration halos
    const spawnedRings: any[] = [];
    for (let r = 0; r < lanceRingCount; r++) {
      const ringScale = (0.55 + r * 0.35) * lanceExpansion;
      const ringTorus = MeshBuilder.CreateTorus(`lanceOrbitRing_${r}`, {
        diameter: ringScale * 1.4,
        thickness: 0.04,
        tessellation: 20
      }, scene);
      ringTorus.parent = lanceRoot;
      ringTorus.position.y = 0.85;
      ringTorus.rotation.x = (Math.PI / 6) * (r + 1);
      ringTorus.material = emitterEnergyMat;
      spawnedRings.push(ringTorus);
    }
    lanceRingsRef.current = spawnedRings;

    // F. Tip Cap & Needle sharp conic Lance head
    const tipBaseCollar = MeshBuilder.CreateCylinder("lanceTipBaseCollar", {
      diameterTop: 0.16,
      diameterBottom: 0.35,
      height: 0.25,
      tessellation: 16
    }, scene);
    tipBaseCollar.parent = lanceRoot;
    tipBaseCollar.position.y = 1.2;
    tipBaseCollar.material = goldTrimMat;

    // Extended Needle metal tip
    const steelTipCone = MeshBuilder.CreateCylinder("lanceSteelTip", {
      diameterTop: 0.0,
      diameterBottom: 0.18,
      height: lanceTipLength,
      tessellation: 16
    }, scene);
    steelTipCone.parent = lanceRoot;
    steelTipCone.position.y = 1.2 + (lanceTipLength / 2);
    steelTipCone.material = silverMetalMat;

    // Concentrated discharge helix loop around base
    const dischargeHelix = MeshBuilder.CreateCylinder("dischargeHelix", {
      diameterTop: 0.08,
      diameterBottom: 0.22,
      height: 0.42,
      tessellation: 12
    }, scene);
    dischargeHelix.parent = lanceRoot;
    dischargeHelix.position.y = 1.34;
    dischargeHelix.material = emitterEnergyMat;

    addLog(`MODULE_FORGE // COMPLETED RE-CALIBRATED CONSTRUCTION OF Modular Light-Lance [LEVEL ${lancePowerLevel}%]`);
  };

  useEffect(() => {
    applyLanceConstruction();
  }, [lanceTipLength, lanceGlowColor, lanceRingCount, lanceExpansion, lancePositionMode, isLanceBuilt, activeRoute]);

  // Adjust Babylon light diffuse/ambient color on active route change in real-time
  useEffect(() => {
    if (rimLightRef.current && sceneRef.current) {
      const nowScene = sceneRef.current;
      let totemColor = new Color3(0.0, 0.9, 1.0); // Central (Cyan)
      
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
        totemColor = new Color3(0.0, 1.0, 0.55);
      } else if (activeRoute === 'siren') {
        rimLightRef.current.diffuse = new Color3(0.85, 0.15, 1.0); // Deep violet glow
        rimLightRef.current.intensity = 3.0;
        nowScene.clearColor = new Color4(0.03, 0.0, 0.05, 1.0);
        addLog("SIGNAL COCKPIT // CRITICAL ORACLE RESONANCE EXCEEDING SPEC IN VERTEX HORIZON!");
        totemColor = new Color3(0.85, 0.15, 1.0);
      }

      // Dynamically re-color the Oracle Monolith rings if they exist
      abexConduitsRef.current.forEach(totemTorus => {
        if (totemTorus && totemTorus.material) {
          (totemTorus.material as StandardMaterial).emissiveColor = totemColor;
        }
      });
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

    // Pre-load the selected GLB asset via glbLoaderService
    glbLoaderService.preLoadModel(scene, selectedGlbPathRef.current).then((success) => {
      setIsInfiltratorPreloaded(true);
      addLog(`GLB SYSTEM // PRE-LOAD SEQUENCE COMPLETED: ${selectedGlbPathRef.current.toUpperCase()} [STATUS: READY]`);
    }).catch(err => {
      console.error("GLB SYSTEM // Preload failed:", err);
    });

    const camera = new ArcRotateCamera(
      "repairBayCamera",
      Math.PI / 4,           // Alpha
      Math.PI / 2.3,         // Beta (overhead angle view)
      9.0,                   // Radius
      new Vector3(0, 0.7, 0), // Target position
      scene
    );
    mainCameraRef.current = camera;
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 5.0;
    camera.upperRadiusLimit = 15.0;
    camera.upperBetaLimit = Math.PI / 2.05;

    // Set up pointer down event for model surface measurement picking
    scene.onPointerDown = (evt, pickResult) => {
      if (evt.button !== 0) return; // Left click only
      
      if (isMeasureModeRef.current) {
        if (pickResult && pickResult.hit && pickResult.pickedPoint) {
          const point = pickResult.pickedPoint;
          const currentPoints = measurePointsRef.current;

          if (!currentPoints.p1 || (currentPoints.p1 && currentPoints.p2)) {
            // Setting the first point - dispose old structures
            if (measureP1MeshRef.current) {
              measureP1MeshRef.current.dispose();
              measureP1MeshRef.current = null;
            }
            if (measureP2MeshRef.current) {
              measureP2MeshRef.current.dispose();
              measureP2MeshRef.current = null;
            }
            if (measureLineMeshRef.current) {
              measureLineMeshRef.current.dispose();
              measureLineMeshRef.current = null;
            }

            // Generate point A anchor visual sphere
            const sphere1 = MeshBuilder.CreateSphere("measure_anchor_p1", { diameter: 0.14 }, scene);
            sphere1.position.copyFrom(point);
            const mat1 = new StandardMaterial("measure_anchor_p1_mat", scene);
            mat1.emissiveColor = new Color3(0.0, 1.0, 0.85); // Neon cyan
            mat1.disableLighting = true;
            sphere1.material = mat1;
            measureP1MeshRef.current = sphere1;

            setMeasurePoints({ p1: point, p2: null });
            setMeasureDistance(null);
            addLog(`STRUCT DIAG // CALIPER POINT A DEPLOYED AT [X: ${point.x.toFixed(2)}, Y: ${point.y.toFixed(2)}, Z: ${point.z.toFixed(2)}]`);
          } else {
            // Setting the second point - dispose old second point/line
            if (measureP2MeshRef.current) {
              measureP2MeshRef.current.dispose();
              measureP2MeshRef.current = null;
            }
            if (measureLineMeshRef.current) {
              measureLineMeshRef.current.dispose();
              measureLineMeshRef.current = null;
            }

            // Generate point B anchor visual sphere
            const sphere2 = MeshBuilder.CreateSphere("measure_anchor_p2", { diameter: 0.14 }, scene);
            sphere2.position.copyFrom(point);
            const mat2 = new StandardMaterial("measure_anchor_p2_mat", scene);
            mat2.emissiveColor = new Color3(1.0, 0.15, 0.55); // Neon pink
            mat2.disableLighting = true;
            sphere2.material = mat2;
            measureP2MeshRef.current = sphere2;

            // Generate connect line
            const line = MeshBuilder.CreateLines("measure_span_line", { points: [currentPoints.p1, point] }, scene);
            line.color = new Color3(0.0, 0.9, 1.0); // Bright cyan connector line
            measureLineMeshRef.current = line;

            const dist = Vector3.Distance(currentPoints.p1, point);
            const auDist = dist * 5.4; // 1 unit = 5.4 Abyssum Units

            setMeasurePoints({ p1: currentPoints.p1, p2: point });
            setMeasureDistance(auDist);
            addLog(`STRUCT DIAG // CALIPER POINT B DEPLOYED AT [X: ${point.x.toFixed(2)}, Y: ${point.y.toFixed(2)}, Z: ${point.z.toFixed(2)}]`);
            addLog(`STRUCT DIAG // ESTIMATED SPAN CORE: [${auDist.toFixed(2)} AU]`);
          }
        }
      } else {
        // Component selection mode (Measure mode is OFF)
        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
          const pickedMesh = pickResult.pickedMesh;
          const pickedName = pickedMesh.name;
          
          // Try to find the matching component in our data
          const matched = MODEL_COMPONENTS_DATA.find(comp => 
            pickedName.toLowerCase().includes(comp.meshNamePattern.toLowerCase()) || 
            comp.meshNamePattern.toLowerCase().includes(pickedName.toLowerCase())
          );
          
          if (matched) {
            setSelectedComponent(matched);
            setIsComponentSidebarOpen(true);
            addLog(`STRUCT DIAG // LOCKED DETECTOR CHANNELS ON COMPONENT: [${matched.name.toUpperCase()}]`);
            
            // Flash mesh briefly as visual feedback!
            const originalMaterial = pickedMesh.material;
            if (originalMaterial && 'emissiveColor' in originalMaterial) {
              const standardMat = originalMaterial as StandardMaterial;
              const origEmissive = standardMat.emissiveColor.clone();
              
              // Set to bright highlight
              standardMat.emissiveColor = new Color3(0, 1, 1);
              
              // Reset after 250ms
              setTimeout(() => {
                standardMat.emissiveColor = origEmissive;
              }, 250);
            }
          } else {
            // Check if it's part of the procedural cockpit model or other meshes
            const cleanMeshName = pickedName.replace('infiltrator_', '').replace('_primitive', '').toUpperCase();
            if (cleanMeshName && !cleanMeshName.includes('GROUND') && !cleanMeshName.includes('LIGHT') && !cleanMeshName.includes('PLANE')) {
              const generated: ComponentStructureData = {
                id: pickedName,
                name: cleanMeshName,
                material: 'Carbon-Silicon Crystal Alloy',
                integrity: Math.floor(Math.random() * 20) + 80, // 80 to 100
                status: Math.random() > 0.15 ? 'Stable' : 'Degraded',
                notes: `Procedural scanner lock achieved for sub-assembly '${pickedName}'. Resonance frequency stable.`,
                resonance: `${(Math.random() * 300 + 40).toFixed(1)} Hz`,
                meshNamePattern: pickedName
              };
              setSelectedComponent(generated);
              setIsComponentSidebarOpen(true);
              addLog(`STRUCT DIAG // LOCKED DETECTOR CHANNELS ON COMPONENT: [${cleanMeshName}]`);
            }
          }
        }
      }
    };

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

    // 1. FLOOR PLATING (The ground is broken up into layered structural plates)
    const ground = MeshBuilder.CreateGround("dockGroundBase", { width: 24, height: 16, subdivisions: 2 }, scene);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.04, 0.05, 0.07);
    groundMat.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;

    // Create 12 raised industrial metal deck plates
    const plateMetalMat = new StandardMaterial("plateMetalMat", scene);
    plateMetalMat.diffuseColor = new Color3(0.09, 0.11, 0.14);
    plateMetalMat.specularColor = new Color3(0.35, 0.38, 0.42);
    plateMetalMat.roughness = 0.6;

    for (let x = -10; x <= 10; x += 4) {
      for (let z = -6; z <= 6; z += 4) {
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; // Leave center for the coupling pit
        const deckPlate = MeshBuilder.CreateBox(`deckPlate_${x}_${z}`, {
          width: 3.8,
          height: 0.02,
          depth: 3.8
        }, scene);
        deckPlate.position.set(x, 0.01, z);
        deckPlate.material = plateMetalMat;
      }
    }

    // 2. COUPLING MECHANICAL PIT (Beneath the glowing ring - Extends deep under)
    const pitVoid = MeshBuilder.CreateCylinder("pitVoid", {
      diameter: 3.3,
      height: 1.8,
      tessellation: 24
    }, scene);
    pitVoid.position.set(0, -0.9, 0);
    const pitMat = new StandardMaterial("pitMat", scene);
    pitMat.diffuseColor = new Color3(0.015, 0.015, 0.02);
    pitMat.specularColor = new Color3(0.05, 0.05, 0.05);
    pitVoid.material = pitMat;

    // Sub-floor mechanical structural support rib-rings descending downwards
    const ribMat = new StandardMaterial("pitRibMat", scene);
    ribMat.diffuseColor = new Color3(0.06, 0.07, 0.09);
    ribMat.specularColor = new Color3(0.2, 0.22, 0.25);
    ribMat.roughness = 0.5;

    for (let rIdx = 1; rIdx <= 4; rIdx++) {
      const ribRing = MeshBuilder.CreateTorus(`pitSupportRib_${rIdx}`, {
        diameter: 3.25,
        thickness: 0.08,
        tessellation: 20
      }, scene);
      ribRing.position.set(0, -0.35 * rIdx, 0);
      ribRing.material = ribMat;
    }

    // Create giant interface gears inside pit with detailed physical gear teeth meshes
    const gearMainMat = new StandardMaterial("gearMainMat", scene);
    gearMainMat.diffuseColor = new Color3(0.22, 0.24, 0.28);
    gearMainMat.specularColor = new Color3(0.65, 0.68, 0.72);
    gearMainMat.roughness = 0.25;

    const gearL = MeshBuilder.CreateCylinder("mechanicalGearL", {
      diameter: 1.6,
      height: 0.16,
      tessellation: 16
    }, scene);
    gearL.position.set(-0.62, -0.32, 0);
    gearL.material = gearMainMat;

    const gearR = MeshBuilder.CreateCylinder("mechanicalGearR", {
      diameter: 1.6,
      height: 0.16,
      tessellation: 16
    }, scene);
    gearR.position.set(0.62, -0.28, 0);
    gearR.material = gearMainMat;

    // Helper functions inside the block to construct radial gear teeth to mesh correctly
    const teethCount = 14;
    const teethMat = new StandardMaterial("teethMat", scene);
    teethMat.diffuseColor = new Color3(0.14, 0.15, 0.18);
    teethMat.specularColor = new Color3(0.5, 0.52, 0.55);
    teethMat.roughness = 0.35;

    for (let i = 0; i < teethCount; i++) {
      const angleL = (i * 2 * Math.PI) / teethCount;
      const toothL = MeshBuilder.CreateBox(`toothL_${i}`, {
        width: 0.15,
        height: 0.16,
        depth: 0.25
      }, scene);
      toothL.parent = gearL;
      toothL.position.set(Math.cos(angleL) * 0.8, 0, Math.sin(angleL) * 0.8);
      toothL.rotation.y = -angleL;
      toothL.material = teethMat;

      // Rotate right gear teeth offset to model interlocking
      const angleR = (i * 2 * Math.PI) / teethCount + (Math.PI / teethCount);
      const toothR = MeshBuilder.CreateBox(`toothR_${i}`, {
        width: 0.15,
        height: 0.16,
        depth: 0.25
      }, scene);
      toothR.parent = gearR;
      toothR.position.set(Math.cos(angleR) * 0.8, 0, Math.sin(angleR) * 0.8);
      toothR.rotation.y = -angleR;
      toothR.material = teethMat;
    }

    couplingGearsRef.current = [gearL, gearR];

    // Glowing Floor Ring (Center coupling capture node)
    const floorRing = MeshBuilder.CreateCylinder("repairZoneRing", {
      diameter: 3.2,
      height: 0.04,
      tessellation: 40
    }, scene);
    floorRing.position.y = 0.02;
    const ringMat = new StandardMaterial("ringMat", scene);
    ringMat.emissiveColor = new Color3(0.0, 0.95, 1.0); 
    ringMat.diffuseColor = new Color3(0, 0.08, 0.12);
    floorRing.material = ringMat;
    glowingRingRef.current = floorRing;

    // 4 Symmetrical Hydraulic Locking Clamps surrounding the repair zone ring
    const hydraulicSleeveMat = new StandardMaterial("hydroSleeveMat", scene);
    hydraulicSleeveMat.diffuseColor = new Color3(0.2, 0.22, 0.26);
    hydraulicSleeveMat.specularColor = new Color3(0.5, 0.55, 0.6);

    const hydraulicPistonMat = new StandardMaterial("hydroPistonMat", scene);
    hydraulicPistonMat.diffuseColor = new Color3(0.6, 0.62, 0.65);
    hydraulicPistonMat.specularColor = new Color3(0.9, 0.92, 0.96);
    hydraulicPistonMat.roughness = 0.1;

    const hydraulicClawMat = new StandardMaterial("hydroClawMat", scene);
    hydraulicClawMat.diffuseColor = new Color3(0.08, 0.09, 0.12);
    hydraulicClawMat.specularColor = new Color3(0.3, 0.32, 0.35);

    hydraulicLockersRef.current = [];

    const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    angles.forEach((lockAngle, aIdx) => {
      // Create structural sleeve anchor housing
      const sleeveBox = MeshBuilder.CreateBox(`hydroSleeve_${aIdx}`, {
        width: 0.35,
        height: 0.22,
        depth: 0.7
      }, scene);
      sleeveBox.material = hydraulicSleeveMat;
      
      // Position sleeve far outside center ring
      const sleeveRadius = 2.3;
      sleeveBox.position.set(Math.cos(lockAngle) * sleeveRadius, 0.11, Math.sin(lockAngle) * sleeveRadius);
      // Face towards center origin (0, 0, 0)
      sleeveBox.rotation.y = -lockAngle;

      // Sliding inner metal cylinder piston
      const pistonCyl = MeshBuilder.CreateCylinder(`hydroPiston_${aIdx}`, {
        diameter: 0.16,
        height: 0.65,
        tessellation: 12
      }, scene);
      pistonCyl.material = hydraulicPistonMat;
      // Cylinder default is vertical: rotate 90 deg so it can lie flat
      pistonCyl.rotation.x = Math.PI / 2;
      
      const pistonCompRoot = new TransformNode(`hydroPistonRoot_${aIdx}`, scene);
      pistonCompRoot.position.set(Math.cos(lockAngle) * (sleeveRadius - 0.25), 0.11, Math.sin(lockAngle) * (sleeveRadius - 0.25));
      pistonCompRoot.rotation.y = -lockAngle;
      pistonCyl.parent = pistonCompRoot;
      pistonCyl.position.set(0, 0, -0.15); // slide offset inside parent root space

      // Locking latch claw wedge at the inner end of the piston shaft
      const clawWedge = MeshBuilder.CreateBox(`hydroClaw_${aIdx}`, {
        width: 0.28,
        height: 0.18,
        depth: 0.22
      }, scene);
      clawWedge.material = hydraulicClawMat;
      clawWedge.parent = pistonCompRoot;
      clawWedge.position.set(0, 0, -0.42); // sits in front of piston tip

      // Push to animated references
      hydraulicLockersRef.current.push({
        sleeve: sleeveBox,
        piston: pistonCompRoot,
        clamp: clawWedge,
        angle: lockAngle,
        currentExtension: 0
      });
    });

    // 3. SECURED RAILS & SUPPORT SLEEPERS
    const rail1 = MeshBuilder.CreateBox("railLeft", { width: 22, height: 0.08, depth: 0.08 }, scene);
    rail1.position.set(0, 0.08, 0.7);
    const rail2 = MeshBuilder.CreateBox("railRight", { width: 22, height: 0.08, depth: 0.08 }, scene);
    rail2.position.set(0, 0.08, -0.7);
    
    const railMat = new StandardMaterial("railMat", scene);
    railMat.diffuseColor = new Color3(0.25, 0.28, 0.32);
    railMat.specularColor = new Color3(0.7, 0.75, 0.8);
    rail1.material = railMat;
    rail2.material = railMat;

    // Layout rail sleepers every 1.2 meters
    const sleeperMat = new StandardMaterial("sleeperMat", scene);
    sleeperMat.diffuseColor = new Color3(0.12, 0.14, 0.18);
    sleeperMat.specularColor = new Color3(0.2, 0.2, 0.2);
    for (let x = -10.5; x <= 10.5; x += 1.2) {
      const sleeper = MeshBuilder.CreateBox(`sleeper_${x}`, { width: 0.24, height: 0.04, depth: 1.8 }, scene);
      sleeper.position.set(x, 0.02, 0);
      sleeper.material = sleeperMat;

      // Miniature bolts on rail fasteners
      const bL = MeshBuilder.CreateBox(`boltL_${x}`, { size: 0.04 }, scene);
      bL.position.set(x, 0.06, 0.7);
      bL.material = railMat;

      const bR = MeshBuilder.CreateBox(`boltR_${x}`, { size: 0.04 }, scene);
      bR.position.set(x, 0.06, -0.7);
      bR.material = railMat;
    }

    // 4. OVERHEAD GANTRY CRANE STRUCTURE & VERTICAL SUPPORT RIGS
    const columnPowerMat = new StandardMaterial("columnPowerMat", scene);
    columnPowerMat.diffuseColor = new Color3(0.1, 0.12, 0.16);
    columnPowerMat.specularColor = new Color3(0.3, 0.3, 0.3);

    // 4 massive support columns at corners of the bay
    const colCoords = [
      { x: -8.5, z: 5.2 },
      { x: 8.5, z: 5.2 },
      { x: -8.5, z: -5.2 },
      { x: 8.5, z: -5.2 }
    ];
    colCoords.forEach((coord, i) => {
      const col = MeshBuilder.CreateBox(`col_${i}`, { width: 0.5, height: 6.2, depth: 0.5 }, scene);
      col.position.set(coord.x, 3.1, coord.z);
      col.material = columnPowerMat;

      // Vertical support braces
      const brace = MeshBuilder.CreateBox(`colBrace_${i}`, { width: 0.6, height: 0.2, depth: 0.6 }, scene);
      brace.position.set(coord.x, 6.0, coord.z);
      brace.material = columnPowerMat;
    });

    // Overhead Runway Tracks running horizontally
    const runwayL = MeshBuilder.CreateBox("runwayL", { width: 22, height: 0.3, depth: 0.3 }, scene);
    runwayL.position.set(0, 5.9, 5.2);
    runwayL.material = columnPowerMat;

    const runwayR = MeshBuilder.CreateBox("runwayR", { width: 22, height: 0.3, depth: 0.3 }, scene);
    runwayR.position.set(0, 5.9, -5.2);
    runwayR.material = columnPowerMat;

    // The traversable Gantry Crane beam
    const gantryBeam = MeshBuilder.CreateBox("overarchingGantryBeam", { width: 0.6, height: 0.4, depth: 10.6 }, scene);
    gantryBeam.position.set(0, 6.1, 0);
    gantryBeam.material = columnPowerMat;

    // Crane Trolley block (Will slide real-time along with Train movement!)
    const gantryTrolley = MeshBuilder.CreateBox("gantryTrolleyNode", { width: 1.5, height: 0.5, depth: 1.5 }, scene);
    gantryTrolley.parent = gantryBeam;
    gantryTrolley.position.set(0, -0.3, 0);
    const trolleyMat = new StandardMaterial("trolleyMat", scene);
    trolleyMat.diffuseColor = new Color3(0.2, 0.15, 0.05); // Industrial yellow
    trolleyMat.specularColor = new Color3(0.6, 0.5, 0.2);
    gantryTrolley.material = trolleyMat;
    gantryTrolleyRef.current = gantryBeam; // Saved so animation loop updates its horizontal position!

    // Overhead industrial cables hanging from runway girders
    const runwayCable = MeshBuilder.CreateBox("runwayCableTrack", { width: 22, height: 0.05, depth: 0.05 }, scene);
    runwayCable.position.set(0, 5.7, 5.15);
    const cableDarkMat = new StandardMaterial("cableDarkMat", scene);
    cableDarkMat.diffuseColor = new Color3(0.05, 0.05, 0.05);
    cableDarkMat.specularColor = new Color3(0.1, 0.1, 0.1);
    runwayCable.material = cableDarkMat;

    // 5. INDUSTRIAL REAR DOCK WALLS (Immersive Dieselpunk Cathedral Cage)
    const wallPlates = MeshBuilder.CreateBox("dockRearWall", { width: 22, height: 6.5, depth: 0.15 }, scene);
    wallPlates.position.set(0, 3.25, -5.5);
    const wallPlateMat = new StandardMaterial("wallPlateMat", scene);
    wallPlateMat.diffuseColor = new Color3(0.05, 0.06, 0.08);
    wallPlateMat.specularColor = new Color3(0.1, 0.1, 0.1);
    wallPlates.material = wallPlateMat;

    // Vertical wall ribs
    for (let x = -9; x <= 9; x += 4.5) {
      const wallPillar = MeshBuilder.CreateBox(`wallPillar_${x}`, { width: 0.35, height: 6.5, depth: 0.25 }, scene);
      wallPillar.position.set(x, 3.25, -5.35);
      wallPillar.material = columnPowerMat;

      // Wall junction control boxes
      if (x % 9 === 0) {
        const juncBox = MeshBuilder.CreateBox(`junctionBox_${x}`, { width: 0.6, height: 0.8, depth: 0.3 }, scene);
        juncBox.position.set(x, 2.0, -5.15);
        const juncMat = new StandardMaterial("juncMat", scene);
        juncMat.diffuseColor = new Color3(0.25, 0.08, 0.08); // Emergency red
        juncMat.emissiveColor = new Color3(0.08, 0.02, 0.02);
        juncBox.material = juncMat;
      }
    }

    // 6. ARTICULATED MANIPULATOR ROBOT REPAIR ARMS (Constructed symmetrically with idle motion links)
    const manipulatorArmCoords = [
      { x: -2.8, z: 2.8, yOffset: 0.0 },
      { x: 2.8, z: -2.8, yOffset: 2.0 },
      { x: -1.2, z: -3.2, yOffset: 4.0 }
    ];
    const armList: any[] = [];
    manipulatorArmCoords.forEach((coord, idx) => {
      const armRoot = new TransformNode(`armRoot_${idx}`, scene);
      armRoot.position.set(coord.x, 0.1, coord.z);

      // Hydraulic anchor turntable turntable
      const armBase = MeshBuilder.CreateCylinder(`armBase_${idx}`, { diameter: 0.6, height: 0.25 }, scene);
      armBase.parent = armRoot;
      armBase.position.y = 0.1;
      armBase.material = trolleyMat;

      // Lower segment arm cylinder
      const lowerArm = MeshBuilder.CreateCylinder(`lowerArm_${idx}`, { diameter: 0.14, height: 1.4 }, scene);
      lowerArm.parent = armRoot;
      lowerArm.position.set(0, 0.8, 0);
      lowerArm.rotation.x = Math.PI / 10;
      lowerArm.material = columnPowerMat;

      // Mid joint sphere pivot
      const armJoint = MeshBuilder.CreateSphere(`armJoint_${idx}`, { diameter: 0.22 }, scene);
      armJoint.parent = armRoot;
      armJoint.position.set(0, 1.4, 0.2);
      armJoint.material = railMat;

      // Upper segment arm cylinder
      const upperArm = MeshBuilder.CreateCylinder(`upperArm_${idx}`, { diameter: 0.1, height: 1.0 }, scene);
      upperArm.parent = armRoot;
      upperArm.position.set(0, 1.8, 0.0);
      upperArm.rotation.x = -Math.PI / 5;
      upperArm.material = columnPowerMat;

      // Welder / plasma cutter head
      const toolHead = MeshBuilder.CreateBox(`toolHead_${idx}`, { width: 0.15, height: 0.3, depth: 0.15 }, scene);
      toolHead.parent = armRoot;
      toolHead.position.set(0, 2.2, -0.3);
      toolHead.material = trolleyMat;

      const nozzleGlow = MeshBuilder.CreateSphere(`toolNozzle_${idx}`, { diameter: 0.08 }, scene);
      nozzleGlow.parent = toolHead;
      nozzleGlow.position.y = -0.16;
      const nozzleMat = new StandardMaterial("nozzleMat", scene);
      nozzleMat.emissiveColor = new Color3(1.0, 0.4, 0.0);
      nozzleGlow.material = nozzleMat;

      armList.push({
        base: armRoot,
        lowerArm: lowerArm,
        upperArm: upperArm,
        toolHead: toolHead,
        angleOffset: coord.yOffset
      });
    });
    repairArmsRef.current = armList;

    // 7. ABYSSUM INTERACTIVE ORACLE TOTEMS (Monolithic pylons bounding the coupling zone)
    const totemPlacements = [
      { angle: 0, r: 2.3 },
      { angle: (Math.PI * 2) / 3, r: 2.3 },
      { angle: (Math.PI * 4) / 3, r: 2.3 }
    ];
    const totemsArray: any[] = [];
    totemPlacements.forEach((place, idx) => {
      const tx = Math.cos(place.angle) * place.r;
      const tz = Math.sin(place.angle) * place.r;
      
      const pylon = MeshBuilder.CreateBox(`oracleTotem_${idx}`, { width: 0.35, height: 2.2, depth: 0.22 }, scene);
      pylon.position.set(tx, 1.1, tz);
      
      const obsidianMat = new StandardMaterial("obsidianMat", scene);
      obsidianMat.diffuseColor = new Color3(0.04, 0.05, 0.05);
      obsidianMat.specularColor = new Color3(0.6, 0.6, 0.6);
      pylon.material = obsidianMat;

      // Floating rune band around each totem pylon
      const floatingTorus = MeshBuilder.CreateTorus(`totemTorus_${idx}`, { diameter: 0.55, thickness: 0.04, tessellation: 16 }, scene);
      floatingTorus.position.set(tx, 1.6, tz);
      
      // Dynamic route color mapped to the floating rings via abexConduitsRef array
      const ringGlowMat = new StandardMaterial(`totemGlowMat_${idx}`, scene);
      ringGlowMat.emissiveColor = new Color3(0.0, 0.9, 1.0); // Starts cyan
      floatingTorus.material = ringGlowMat;
      totemsArray.push(floatingTorus);
    });
    abexConduitsRef.current = totemsArray;

    // 8. MOAI OBSERVER SENTINEL NODE (Hovering overhead diagnostic scanner drone)
    const observerBase = new TransformNode("observerDroneRoot", scene);
    observerBase.position.set(0, 4.8, -1.8);
    
    const eyeBall = MeshBuilder.CreateSphere("observerSphericalEye", { diameter: 0.4 }, scene);
    eyeBall.parent = observerBase;
    
    const darkChromeMat = new StandardMaterial("darkChromeMat", scene);
    darkChromeMat.diffuseColor = new Color3(0.12, 0.12, 0.15);
    darkChromeMat.specularColor = new Color3(0.9, 0.9, 0.9);
    eyeBall.material = darkChromeMat;

    const holographicLens = MeshBuilder.CreateSphere("lensPupil", { diameter: 0.2 }, scene);
    holographicLens.parent = eyeBall;
    holographicLens.position.set(0, -0.06, 0.18);
    
    const lensMat = new StandardMaterial("lensMat", scene);
    lensMat.emissiveColor = new Color3(0.0, 0.85, 1.0); 
    lensMat.disableLighting = true;
    holographicLens.material = lensMat;
    observerNodeRef.current = observerBase;

    // =========================================================================
    // 9. HIGH-DENSITY UPGRADED FREIGHT TRAIN MECHANICAL ASSEMBLY
    // =========================================================================
    const carriageRoot = new TransformNode("carRootNode", scene);
    rootNodeRef.current = carriageRoot;
    carriageRoot.position.y = 0.5; 

    const buildCockpitMesh = () => {
      // Clear previous chassis meshes except the hologram card
      carriageRoot.getChildren().forEach((child) => {
        if (
          child.name !== "diagnosticHoloCard" && 
          child.name !== "diagnosticHoloCard_child" && 
          child.name !== "diagnosticHoloCard_child_child"
        ) {
          child.dispose();
        }
      });
      fanBladesRef.current = [];

      if (cockpitModelRef.current === 'train') {
        // Heavy Main Armored Under-carriage Chassis frame
        const chassis = MeshBuilder.CreateBox("carChassis", { width: 4.2, height: 0.35, depth: 1.84 }, scene);
        chassis.parent = carriageRoot;
        chassis.position.set(0, -0.15, 0);
        const chassisMat = new StandardMaterial("chassisBlockMat", scene);
        chassisMat.diffuseColor = new Color3(0.12, 0.14, 0.17);
        chassisMat.specularColor = new Color3(0.4, 0.45, 0.5);
        chassis.material = chassisMat;

        // Primary Armored Cargo Tank Carriage body
        const bodyBox = MeshBuilder.CreateBox("carBody", { width: 3.8, height: 1.5, depth: 1.6 }, scene);
        bodyBox.parent = carriageRoot;
        bodyBox.position.set(0, 0.75, 0);
        const bodyMat = new StandardMaterial("bodyBlockMat", scene);
        bodyMat.diffuseColor = new Color3(0.15, 0.17, 0.22); // Armored steel
        bodyMat.specularColor = new Color3(0.2, 0.2, 0.22);
        bodyBox.material = bodyMat;

        // Glowing core reactor slot (The decal central capsule)
        const decalCore = MeshBuilder.CreateBox("decalPlate", { width: 1.85, height: 0.45, depth: 1.63 }, scene);
        decalCore.parent = carriageRoot;
        decalCore.position.set(0, 0.75, 0);
        const decalMat = new StandardMaterial("decalBlockMat", scene);
        decalMat.diffuseColor = new Color3(0.02, 0.03, 0.04);
        decalMat.emissiveColor = new Color3(0.0, 0.7, 1.0); // Indigo/Teal Reactor core glow
        decalCore.material = decalMat;

        // High-Tech Internal Diagnostic Powertrain Core (visible only during Exploded View)
        const coreDiag = MeshBuilder.CreateBox("internalCoreDiagBox", { width: 1.6, height: 0.8, depth: 1.0 }, scene);
        coreDiag.parent = carriageRoot;
        coreDiag.position.set(0, 0.75, 0);
        const coreDiagMat = new StandardMaterial("internalCoreDiagBoxMat", scene);
        coreDiagMat.diffuseColor = new Color3(0.0, 0.5, 0.85);
        coreDiagMat.emissiveColor = new Color3(0.0, 0.8, 1.0);
        coreDiagMat.wireframe = true;
        coreDiag.material = coreDiagMat;
        coreDiag.visibility = 0; // Animates with explodedLerp in the render loop

        const coreReactor = MeshBuilder.CreateSphere("internalCoreReactorSphere", { diameter: 0.5 }, scene);
        coreReactor.parent = carriageRoot;
        coreReactor.position.set(0, 0.75, 0);
        const coreReactorMat = new StandardMaterial("internalCoreReactorMat", scene);
        coreReactorMat.emissiveColor = new Color3(1.0, 0.15, 0.5); // Intense pinkish-magenta reactor core
        coreReactorMat.disableLighting = true;
        coreReactor.material = coreReactorMat;
        coreReactor.visibility = 0;

        // A. THERMAL SHIELD PANELING (Raised modular layered armor panels on body sides & roof top)
        const shieldPlateMat = new StandardMaterial("shieldPlateMat", scene);
        shieldPlateMat.diffuseColor = new Color3(0.26, 0.28, 0.32); // Steel slate shield plates
        shieldPlateMat.specularColor = new Color3(0.75, 0.6, 0.25); // Gold/bronze metallic trim highlights

        // Roof thermal panels
        const roofShield1 = MeshBuilder.CreateBox("roofShieldAngleL", { width: 1.6, height: 0.1, depth: 0.8 }, scene);
        roofShield1.parent = carriageRoot;
        roofShield1.position.set(-0.8, 1.55, 0.4);
        roofShield1.rotation.z = Math.PI / 18; // Slight angle shield tilt
        roofShield1.material = shieldPlateMat;

        const roofShield2 = MeshBuilder.CreateBox("roofShieldAngleR", { width: 1.6, height: 0.1, depth: 0.8 }, scene);
        roofShield2.parent = carriageRoot;
        roofShield2.position.set(0.8, 1.55, -0.4);
        roofShield2.rotation.z = -Math.PI / 18;
        roofShield2.material = shieldPlateMat;

        // B. ROTATING COOLING FANS
        const fanBladesArray: any[] = [];
        const fanSides = [0.81, -0.81];
        fanSides.forEach((zSide, fIdx) => {
          // Fan Shroud Outer casing Ring
          const fanHous = MeshBuilder.CreateCylinder(`coolingFanHousing_${fIdx}`, {
            diameter: 0.6,
            height: 0.06,
            tessellation: 16
          }, scene);
          fanHous.parent = carriageRoot;
          fanHous.position.set(0, 0.75, zSide);
          fanHous.rotation.x = Math.PI / 2;
          fanHous.material = columnPowerMat;

          // Center spinning blade hub spinner
          const bladeHub = MeshBuilder.CreateCylinder(`bladeHub_${fIdx}`, {
            diameter: 0.15,
            height: 0.08,
            tessellation: 8
          }, scene);
          bladeHub.parent = carriageRoot;
          bladeHub.position.set(0, 0.75, zSide * 1.05);
          bladeHub.rotation.x = Math.PI / 2;
          bladeHub.material = shieldPlateMat;

          // 4 interior mechanical fan blades
          const linkRoot = new TransformNode(`fanLinkRoot_${fIdx}`, scene);
          linkRoot.parent = carriageRoot;
          linkRoot.position.set(0, 0.75, zSide * 1.05);
          linkRoot.rotation.z = 0; // Rotates real-time in the animation loop!

          for (let b = 0; b < 4; b++) {
            const blade = MeshBuilder.CreateBox(`fanBlade_${fIdx}_${b}`, {
              width: 0.06,
              height: 0.22,
              depth: 0.01
            }, scene);
            blade.parent = linkRoot;
            blade.position.y = 0.12; 
            blade.rotation.z = (b * Math.PI) / 2;
            blade.rotation.y = Math.PI / 8; // Slit angle pitch
            
            const darkMetalMat = new StandardMaterial("darkMetalMat", scene);
            darkMetalMat.diffuseColor = new Color3(0.08, 0.08, 0.09);
            blade.material = darkMetalMat;
          }
          fanBladesArray.push(linkRoot);
        });
        fanBladesRef.current = fanBladesArray;

        // C. STEAM-VENT VALVE EXHAUST PIPES
        const exhaustMat = new StandardMaterial("exhaustMat", scene);
        exhaustMat.diffuseColor = new Color3(0.12, 0.12, 0.15);
        exhaustMat.specularColor = new Color3(0.4, 0.4, 0.4);

        const pipeLeft = MeshBuilder.CreateCylinder("exhaustLeft", { diameter: 0.12, height: 0.4, tessellation: 8 }, scene);
        pipeLeft.parent = carriageRoot;
        pipeLeft.position.set(-1.6, 1.6, 0.45);
        pipeLeft.rotation.z = -Math.PI / 8; // Angled back exhaust pipes
        pipeLeft.material = exhaustMat;

        const pipeRight = MeshBuilder.CreateCylinder("exhaustRight", { diameter: 0.12, height: 0.4, tessellation: 8 }, scene);
        pipeRight.parent = carriageRoot;
        pipeRight.position.set(-1.6, 1.6, -0.45);
        pipeRight.rotation.z = -Math.PI / 8;
        pipeRight.material = exhaustMat;

        // Heavy reinforced Side armor plates
        const plateL = MeshBuilder.CreateBox("plateL", { width: 3.9, height: 0.6, depth: 0.15 }, scene);
        plateL.parent = carriageRoot;
        plateL.position.set(0, 0.4, 0.81);
        const plateR = MeshBuilder.CreateBox("plateR", { width: 3.9, height: 0.6, depth: 0.15 }, scene);
        plateR.parent = carriageRoot;
        plateR.position.set(0, 0.4, -0.81);
        
        plateL.material = shieldPlateMat;
        plateR.material = shieldPlateMat;

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
      } else {
        // Instantiate the pre-loaded GLB model
        const infiltrator = glbLoaderService.instantiateModel(scene, selectedGlbPathRef.current, carriageRoot);
        infiltrator.position.set(0, 0.05, 0);
        infiltrator.scaling.set(1.5, 1.5, 1.5);

        // Auto-play / Scan for animations
        setTimeout(() => {
          if (scene && scene.animationGroups && scene.animationGroups.length > 0) {
            scene.animationGroups.forEach(g => g.stop());
            const animNames = scene.animationGroups.map(g => g.name);
            setAvailableAnimations(animNames);
            const idleAnim = scene.animationGroups.find(g => g.name.toLowerCase().includes("idle"));
            if (idleAnim) {
              idleAnim.start(true);
              setActiveAnimationName(idleAnim.name);
              addLog(`ANIMATION ENGINE // AUTO-PLAYED LOOP: [${idleAnim.name.toUpperCase()}]`);
            } else {
              scene.animationGroups[0].start(true);
              setActiveAnimationName(scene.animationGroups[0].name);
              addLog(`ANIMATION ENGINE // AUTO-PLAYED LOOP: [${scene.animationGroups[0].name.toUpperCase()}]`);
            }
          } else {
            setAvailableAnimations([]);
            setActiveAnimationName(null);
          }
        }, 120);

        // High-Tech Internal Stealth Vector Core (visible only during Exploded View)
        const coreDiag = MeshBuilder.CreateBox("internalCoreDiagBox", { width: 0.6, height: 0.4, depth: 1.1 }, scene);
        coreDiag.parent = carriageRoot;
        coreDiag.position.set(0, 0.15, -0.2);
        const coreDiagMat = new StandardMaterial("internalCoreDiagBoxMat", scene);
        coreDiagMat.diffuseColor = new Color3(0.4, 0.05, 0.95);
        coreDiagMat.emissiveColor = new Color3(0.65, 0.2, 1.0);
        coreDiagMat.wireframe = true;
        coreDiag.material = coreDiagMat;
        coreDiag.visibility = 0;

        const coreReactor = MeshBuilder.CreateSphere("internalCoreReactorSphere", { diameter: 0.26 }, scene);
        coreReactor.parent = carriageRoot;
        coreReactor.position.set(0, 0.15, -0.2);
        const coreReactorMat = new StandardMaterial("internalCoreReactorMat", scene);
        coreReactorMat.emissiveColor = new Color3(1.0, 0.35, 0.0); // Amber thruster plasma core
        coreReactorMat.disableLighting = true;
        coreReactor.material = coreReactorMat;
        coreReactor.visibility = 0;
      }
    };

    buildCockpitMesh();
    (window as any).__rebuildCockpitMesh = buildCockpitMesh;

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
      
      if (cockpitModelRef.current === 'infiltrator') {
        ctx.fillText("CARGO SYSTEM  : Stealth Infiltrator X2-A [PRELOADED GLB]", 30, 110);
      } else {
        ctx.fillText("CARGO SYSTEM  : Genesis Rift Escort Array [V-IX]", 30, 110);
      }
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
    let explodedLerp = 0.0;

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

        // 1. ROTATE FAN BLADES RELATIVE TO MOVEMENT + BASE ROTATION HUM
        fanBladesRef.current.forEach((fanLink, fIdx) => {
          if (fanLink && !fanLink.isDisposed()) {
            const spinVelocity = 0.12 + Math.abs(positionRef.current - positionRef.current) * 0.2;
            fanLink.rotation.z += (fIdx % 2 === 0 ? spinVelocity : -spinVelocity);
          }
        });

        // 2. PROCEDURAL STEAM-VENT EXHAUST PUFF PARTICLES (Emit from the two angled exhausts)
        if (scene && Math.random() > 0.72) {
          const isLeft = Math.random() > 0.5;
          const sx = carriageRoot.position.x - 1.6;
          const sy = carriageRoot.position.y + 1.25;
          const sz = carriageRoot.position.z + (isLeft ? 0.45 : -0.45);

          const steamCloud = MeshBuilder.CreateSphere("steamVentCloud", {
            diameter: 0.1,
            segments: 4
          }, scene);
          steamCloud.position.set(sx, sy, sz);

          const steamMat = new StandardMaterial("proceduralSteamMat", scene);
          steamMat.diffuseColor = new Color3(0.65, 0.68, 0.75);
          steamMat.emissiveColor = new Color3(0.02, 0.02, 0.03);
          steamMat.alpha = 0.45;
          steamMat.disableLighting = true;
          steamCloud.material = steamMat;

          steamRef.current.push({
            mesh: steamCloud,
            vy: 0.015 + Math.random() * 0.012,
            vx: -0.01 - Math.random() * 0.01, // backward puff force
            vz: (Math.random() - 0.5) * 0.01,
            life: 1.0,
            size: 0.1
          });
        }

        // 3. EXPLODED VIEW COMPONENT DISPLACEMENT & DIAGNOSTIC INTERNALS
        if (isExplodedViewRef.current) {
          explodedLerp = Math.min(1.0, explodedLerp + 0.045);
        } else {
          explodedLerp = Math.max(0.0, explodedLerp - 0.045);
        }

        if (cockpitModelRef.current === 'train') {
          const chassis = scene.getMeshByName("carChassis");
          if (chassis) chassis.position.y = -0.15 - explodedLerp * 0.7;

          const plateL = scene.getMeshByName("plateL");
          if (plateL) plateL.position.z = 0.81 + explodedLerp * 0.9;

          const plateR = scene.getMeshByName("plateR");
          if (plateR) plateR.position.z = -0.81 - explodedLerp * 0.9;

          const roofShield1 = scene.getMeshByName("roofShieldAngleL");
          if (roofShield1) {
            roofShield1.position.y = 1.55 + explodedLerp * 0.8;
            roofShield1.position.x = -0.8 - explodedLerp * 0.4;
          }

          const roofShield2 = scene.getMeshByName("roofShieldAngleR");
          if (roofShield2) {
            roofShield2.position.y = 1.55 + explodedLerp * 0.8;
            roofShield2.position.x = 0.8 + explodedLerp * 0.4;
          }

          const pipeLeft = scene.getMeshByName("exhaustLeft");
          if (pipeLeft) {
            pipeLeft.position.y = 1.6 + explodedLerp * 0.6;
            pipeLeft.position.x = -1.6 - explodedLerp * 0.3;
          }

          const pipeRight = scene.getMeshByName("exhaustRight");
          if (pipeRight) {
            pipeRight.position.y = 1.6 + explodedLerp * 0.6;
            pipeRight.position.x = -1.6 - explodedLerp * 0.3;
          }

          const wheel0 = scene.getMeshByName("wheel-0");
          if (wheel0) wheel0.position.set(-1.5 - explodedLerp * 0.5, -0.4 - explodedLerp * 0.3, 0.7 + explodedLerp * 0.4);
          const wheel1 = scene.getMeshByName("wheel-1");
          if (wheel1) wheel1.position.set(1.5 + explodedLerp * 0.5, -0.4 - explodedLerp * 0.3, 0.7 + explodedLerp * 0.4);
          const wheel2 = scene.getMeshByName("wheel-2");
          if (wheel2) wheel2.position.set(-1.5 - explodedLerp * 0.5, -0.4 - explodedLerp * 0.3, -0.7 - explodedLerp * 0.4);
          const wheel3 = scene.getMeshByName("wheel-3");
          if (wheel3) wheel3.position.set(1.5 + explodedLerp * 0.5, -0.4 - explodedLerp * 0.3, -0.7 - explodedLerp * 0.4);

          const fanHous0 = scene.getMeshByName("coolingFanHousing_0");
          if (fanHous0) fanHous0.position.z = 0.81 + explodedLerp * 0.8;
          const bladeHub0 = scene.getMeshByName("bladeHub_0");
          if (bladeHub0) bladeHub0.position.z = 0.81 * 1.05 + explodedLerp * 0.8;
          const fanLink0 = scene.getTransformNodeByName("fanLinkRoot_0");
          if (fanLink0) fanLink0.position.z = 0.81 * 1.05 + explodedLerp * 0.8;

          const fanHous1 = scene.getMeshByName("coolingFanHousing_1");
          if (fanHous1) fanHous1.position.z = -0.81 - explodedLerp * 0.8;
          const bladeHub1 = scene.getMeshByName("bladeHub_1");
          if (bladeHub1) bladeHub1.position.z = -0.81 * 1.05 - explodedLerp * 0.8;
          const fanLink1 = scene.getTransformNodeByName("fanLinkRoot_1");
          if (fanLink1) fanLink1.position.z = -0.81 * 1.05 - explodedLerp * 0.8;
        } else {
          const leftWing = scene.getMeshByName("stealthLeftWing");
          if (leftWing) leftWing.position.x = -0.6 - explodedLerp * 0.8;

          const rightWing = scene.getMeshByName("stealthRightWing");
          if (rightWing) rightWing.position.x = 0.6 + explodedLerp * 0.8;

          const leftWinglet = scene.getMeshByName("stealthLeftWinglet");
          if (leftWinglet) leftWinglet.position.x = -0.5 - explodedLerp * 0.4;

          const rightWinglet = scene.getMeshByName("stealthRightWinglet");
          if (rightWinglet) rightWinglet.position.x = 0.5 + explodedLerp * 0.4;

          const canopy = scene.getMeshByName("stealthCanopy");
          if (canopy) {
            canopy.position.y = 0.25 + explodedLerp * 0.8;
            canopy.position.z = 0.1 + explodedLerp * 0.4;
          }

          const intakeLeft = scene.getMeshByName("airIntake_-1");
          if (intakeLeft) intakeLeft.position.x = -0.18 - explodedLerp * 0.4;

          const intakeRight = scene.getMeshByName("airIntake_1");
          if (intakeRight) intakeRight.position.x = 0.18 + explodedLerp * 0.4;

          const engineLeft = scene.getMeshByName("thrusterEngine_-1");
          if (engineLeft) {
            engineLeft.position.z = -0.7 - explodedLerp * 0.8;
            engineLeft.position.x = -0.14 - explodedLerp * 0.3;
          }

          const engineRight = scene.getMeshByName("thrusterEngine_1");
          if (engineRight) {
            engineRight.position.z = -0.7 - explodedLerp * 0.8;
            engineRight.position.x = 0.14 + explodedLerp * 0.3;
          }

          const sensorNeedle = scene.getMeshByName("sensorNeedle");
          if (sensorNeedle) sensorNeedle.position.z = 0.85 + explodedLerp * 0.9;

          // Support generic GLB model children displacement as a fallback
          const glbRoot = scene.getTransformNodeByName(`glb_root_${selectedGlbPathRef.current}`);
          if (glbRoot) {
            glbRoot.getChildMeshes().forEach((mesh) => {
              if (mesh.name !== "internalCoreDiagBox" && mesh.name !== "internalCoreReactorSphere") {
                if (!mesh.metadata?.defaultPosition) {
                  if (!mesh.metadata) mesh.metadata = {};
                  mesh.metadata.defaultPosition = mesh.position.clone();
                }
                const defPos = mesh.metadata.defaultPosition;
                const dir = defPos.normalizeToNew();
                mesh.position.set(
                  defPos.x + dir.x * explodedLerp * 0.8,
                  defPos.y + dir.y * explodedLerp * 0.8,
                  defPos.z + dir.z * explodedLerp * 0.8
                );
              }
            });
          }
        }

        // Animate high-tech core overlay visibility and pulse
        const coreBox = scene.getMeshByName("internalCoreDiagBox");
        const coreSphere = scene.getMeshByName("internalCoreReactorSphere");
        if (coreBox) {
          coreBox.visibility = explodedLerp;
          coreBox.rotation.y = now / 1200;
          coreBox.rotation.x = now / 1800;
        }
        if (coreSphere) {
          coreSphere.visibility = explodedLerp;
          const scalePulse = 1.0 + Math.sin(now / 150) * 0.12;
          coreSphere.scaling.set(scalePulse, scalePulse, scalePulse);
        }
      }

      // Update and fade steam particles smoothly
      steamRef.current.forEach((sp, sIdx) => {
        sp.mesh.position.y += sp.vy;
        sp.mesh.position.x += sp.vx;
        sp.mesh.position.z += sp.vz;
        sp.life -= 0.025; // Particle decay
        sp.size += 0.025; // Expand as it rises
        sp.mesh.scaling.set(sp.size / 0.1, sp.size / 0.1, sp.size / 0.1);
        
        if (sp.mesh.material) {
          (sp.mesh.material as StandardMaterial).alpha = sp.life * 0.45;
        }

        if (sp.life <= 0) {
          sp.mesh.dispose();
          steamRef.current.splice(sIdx, 1);
        }
      });

      // 3. ARTICULATED ROBOT REPAIR ARMS IDLE WIGGLE & ACTIVE SEEK
      repairArmsRef.current.forEach((arm, armIdx) => {
        if (arm.base && !arm.base.isDisposed()) {
          const pulseSpeed = now * 0.0015 + arm.angleOffset;
          // Hover and trace sinusoidal rhythm
          arm.base.rotation.y = Math.sin(pulseSpeed) * 0.18;
          arm.lowerArm.rotation.x = Math.PI / 10 + Math.sin(pulseSpeed * 0.7) * 0.06;
          arm.upperArm.rotation.x = -Math.PI / 5 + Math.cos(pulseSpeed * 0.8) * 0.05;
          
          if (arm.toolHead) {
            arm.toolHead.rotation.y = Math.sin(pulseSpeed * 1.2) * 0.12;
          }
        }
      });

      // 4. ROTATE PIT COG GEARS IN SUB-FLOOR MATRIX (Spin faster during coaxial burst!)
      const gearSpinSpeed = isCoaxialBurstActiveRef.current ? 0.14 : 0.012;
      couplingGearsRef.current.forEach((gear, gIdx) => {
        if (gear && !gear.isDisposed()) {
          gear.rotation.y += (gIdx % 2 === 0 ? gearSpinSpeed : -gearSpinSpeed);
        }
      });

      // 5. OBSERVER SENTINEL EYE SWAY & HOVER
      if (observerNodeRef.current && !observerNodeRef.current.isDisposed()) {
        observerNodeRef.current.position.y = 4.8 + Math.sin(now / 480) * 0.18;
        observerNodeRef.current.rotation.y = Math.cos(now / 1200) * 0.25;
        observerNodeRef.current.rotation.z = Math.sin(now / 950) * 0.05;
      }

      // 6. OVERHEAD GANTRY CRANE ALIGNMENT (Follows Train along Runway rails)
      if (gantryTrolleyRef.current && !gantryTrolleyRef.current.isDisposed() && carriageRoot) {
        gantryTrolleyRef.current.position.x = carriageRoot.position.x;
      }

      // 7. MONOLITH OVERLAY COUPLER SPIN
      abexConduitsRef.current.forEach((ringTorus, rIdx) => {
        if (ringTorus && !ringTorus.isDisposed()) {
          ringTorus.rotation.y = now * 0.0015 + rIdx;
          ringTorus.position.y = 1.6 + Math.sin(now / 320 + rIdx) * 0.05;
        }
      });

      // 8. LANCE ORBITING CONCENTRATION RINGS SPIN
      if (lanceRingsRef.current && lanceRingsRef.current.length > 0) {
        lanceRingsRef.current.forEach((ring, idx) => {
          if (ring && !ring.isDisposed()) {
            const orbit = now * 0.0022;
            ring.rotation.y = orbit * (idx % 2 === 0 ? 1 : -1);
            ring.rotation.x = Math.sin(orbit * 0.4) * 0.25;
            const stretch = 1.0 + Math.sin(orbit + idx) * 0.04;
            ring.scaling.set(stretch, 1.0, stretch);
          }
        });
      }

      // 9. ANIMATE HYDRAULIC LOCKING MECHANISMS SURROUNDING CENTRAL COUPLING RING
      const offset = Math.abs(positionRef.current);
      const inProximityRange = offset < 0.65;

      if (hydraulicLockersRef.current && hydraulicLockersRef.current.length > 0) {
        hydraulicLockersRef.current.forEach(locker => {
          const targetExtension = inProximityRange ? 0.42 : 0.0;
          // Smoothly interpolate currentExtension toward targetExtension
          locker.currentExtension += (targetExtension - locker.currentExtension) * 0.12;
          
          const currentR = 2.3 - 0.25 - locker.currentExtension;
          if (locker.piston && !locker.piston.isDisposed()) {
            locker.piston.position.set(
              Math.cos(locker.angle) * currentR,
              0.11,
              Math.sin(locker.angle) * currentR
            );
          }
        });
      }

      if (carriageRoot) {
        const wheelRotation = positionRef.current * 2.2;
        carriageRoot.getChildMeshes().forEach(m => {
          if (m.name.startsWith("wheel")) {
            m.rotation.y = wheelRotation;
          }
        });
      }

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
        if (isAutoOrbitOnRef.current) {
          camera.alpha += 0.0035;
        }

        if (isCoaxialBurstActiveRef.current) {
          const shake = 0.09;
          camera.target.x = 0 + (Math.random() - 0.5) * shake;
          camera.target.y = 0.7 + (Math.random() - 0.5) * shake;
          camera.target.z = 0 + (Math.random() - 0.5) * shake;
        } else {
          camera.target.x += (0 - camera.target.x) * 0.15;
          camera.target.y += (0.7 - camera.target.y) * 0.15;
          camera.target.z += (0 - camera.target.z) * 0.15;
        }

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

    // Initial construction of the customizable weapon lance upon scene ready
    setTimeout(() => {
      applyLanceConstruction();
    }, 120);

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
      steamRef.current.forEach(sp => {
        if (sp.mesh) sp.mesh.dispose();
      });
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
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-mono font-black uppercase tracking-[0.25em] text-cyan-100 flex items-center gap-2">
              <Layers size={15} className="text-cyan-400 animate-pulse" />
              ORACLE_BRIDGE // FREIGHT COCKPIT
            </h1>
            <p className="text-[8px] font-mono text-amber-600/80 uppercase tracking-widest mt-0.5 font-bold flex items-center gap-1.5 leading-none">
              <span>● COCKPIT SYSTEM STATUS: OPERATIONAL</span>
              <span className="text-zinc-650 font-normal">|</span>
              <span className="text-zinc-400">MODEL RECEPTOR REFRACT-V2</span>
            </p>
            {/* Immersive Diegetic Workspace Selector Tabs */}
            <div className="flex items-center gap-2 mt-2 select-none">
              <button
                type="button"
                onClick={() => {
                  setActiveDeskTab('hologram');
                  addLog("MTD COCKPIT // SWITCHING TELEMETRY STREAM TO DECK MONITOR ASSEMBLY");
                }}
                className={`px-3 py-1 text-[8px] font-mono font-black tracking-widest uppercase border cursor-pointer transition-all duration-300 ${
                  activeDeskTab === 'hologram'
                    ? "bg-[#0c1d2e]/90 border-cyan-500/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "bg-[#03060a]/90 border-zinc-800 text-zinc-500 hover:text-zinc-350 hover:border-zinc-700"
                }`}
              >
                🛰️ DECK MONITOR (HOVER COCKPIT)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDeskTab('inspection');
                  addLog("MTD COCKPIT // ALIGNING FREQUENCY CONDUITS TO FIELD UNIT INSPECTOR GATE");
                }}
                className={`px-3 py-1 text-[8px] font-mono font-black tracking-widest uppercase border cursor-pointer transition-all duration-300 ${
                  activeDeskTab === 'inspection'
                    ? "bg-[#251a0b]/90 border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    : "bg-[#03060a]/90 border-zinc-800 text-zinc-500 hover:text-zinc-350 hover:border-zinc-700"
                }`}
              >
                🔬 FIELD UNIT INSPECTION MODULE
              </button>
            </div>
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

      {/* Dynamic Tab Panel Switching */}
      {activeDeskTab === 'hologram' ? (
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

              {/* Floating Camera Interactive HUD Controls */}
              <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 p-2 bg-black/85 backdrop-blur-sm border border-zinc-800 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.8)] text-zinc-300 w-[150px] font-mono pointer-events-auto">
                <div className="flex items-center justify-between text-[7px] font-black tracking-widest text-zinc-500 uppercase pb-1 border-b border-zinc-800">
                  <span>🛰️ CAM COCKPIT</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoOrbitOn ? "bg-purple-400 animate-pulse" : "bg-zinc-650"}`} />
                </div>

                {/* Auto Orbit Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoOrbitOn(!isAutoOrbitOn);
                    addLog(`CAM CONTROLS // AUTO ORBIT SYSTEM: [${!isAutoOrbitOn ? "ENGAGED" : "SUSPENDED"}]`);
                  }}
                  className={`w-full py-1 px-1.5 text-[7px] font-black uppercase border rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isAutoOrbitOn
                      ? "bg-purple-950/40 border-purple-500/60 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                      : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Toggle continuous camera rotation around chassis"
                >
                  <RotateCw size={8} className={isAutoOrbitOn ? "animate-spin" : ""} />
                  <span>{isAutoOrbitOn ? "AUTO-ORBIT: ON" : "AUTO-ORBIT: OFF"}</span>
                </button>

                {/* Exploded View Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExplodedView(!isExplodedView);
                    addLog(`STRUCT DIAG // EXPLODED STRUCTURAL MATRIX: [${!isExplodedView ? "EXPANDED FOR INSPECTION" : "COLLAPSED TO NOMINAL"}]`);
                  }}
                  className={`w-full py-1 px-1.5 text-[7px] font-black uppercase border rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isExplodedView
                      ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                      : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Toggle Exploded View to inspect internal components and power core structures"
                >
                  <Wrench size={8} className={isExplodedView ? "animate-pulse text-cyan-400" : ""} />
                  <span>{isExplodedView ? "EXPLODED: ON" : "EXPLODED: OFF"}</span>
                </button>

                {/* Directional Pad */}
                <div className="flex flex-col items-center gap-1 my-0.5">
                  <div className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider">// ORBIT ANGLE</div>
                  
                  {/* Up button */}
                  <button
                    type="button"
                    onClick={handleOrbitUp}
                    className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm text-zinc-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                    title="Tilt Camera Up"
                  >
                    <ChevronUp size={10} />
                  </button>

                  {/* Left & Right row */}
                  <div className="flex items-center gap-2 w-full justify-between px-1">
                    <button
                      type="button"
                      onClick={handleOrbitLeft}
                      className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm text-zinc-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                      title="Orbit Left"
                    >
                      <ChevronLeft size={10} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResetCamera}
                      className="px-1.5 py-1 bg-zinc-950 hover:bg-cyan-950/30 border border-zinc-800 hover:border-cyan-800 text-[6.5px] font-black uppercase text-zinc-400 hover:text-cyan-400 rounded-sm cursor-pointer transition-all active:scale-95"
                      title="Reset Camera view to default"
                    >
                      RESET
                    </button>

                    <button
                      type="button"
                      onClick={handleOrbitRight}
                      className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm text-zinc-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                      title="Orbit Right"
                    >
                      <ChevronRight size={10} />
                    </button>
                  </div>

                  {/* Down button */}
                  <button
                    type="button"
                    onClick={handleOrbitDown}
                    className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm text-zinc-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                    title="Tilt Camera Down"
                  >
                    <ChevronDown size={10} />
                  </button>
                </div>

                {/* Zoom block */}
                <div className="flex flex-col gap-1 border-t border-zinc-800 pt-1.5">
                  <div className="text-[6.5px] font-bold text-zinc-550 uppercase tracking-wider text-center">// LENS APERTURE</div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="flex-1 py-1 px-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm flex items-center justify-center gap-1 text-zinc-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                      title="Zoom In"
                    >
                      <ZoomIn size={9} />
                      <span className="text-[6.5px] font-bold uppercase">ZOOM +</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="flex-1 py-1 px-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-sm flex items-center justify-center gap-1 text-zinc-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                      title="Zoom Out"
                    >
                      <ZoomOut size={9} />
                      <span className="text-[6.5px] font-bold uppercase">ZOOM -</span>
                    </button>
                  </div>

                  {/* Dedicated full-width Reset View button */}
                  <button
                    type="button"
                    onClick={handleResetCamera}
                    className="w-full mt-1.5 py-1 px-1.5 bg-cyan-950/20 hover:bg-cyan-900/30 border border-cyan-900/60 hover:border-cyan-500/80 rounded-sm flex items-center justify-center gap-1.5 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all active:scale-95 text-[7px] font-black uppercase font-mono"
                    title="Reset camera orbit and zoom controls to default starting viewport"
                  >
                    <RefreshCw size={8} />
                    <span>RESET VIEWPORT</span>
                  </button>
                </div>
              </div>

              {/* Floating Caliper Measurement HUD Panel */}
              <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 p-2 bg-black/85 backdrop-blur-sm border border-zinc-800 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.8)] text-zinc-300 w-[165px] font-mono pointer-events-auto select-none">
                <div className="flex items-center justify-between text-[7px] font-black tracking-widest text-zinc-500 uppercase pb-1 border-b border-zinc-800">
                  <span>📐 SURFACE CALIPER</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isMeasureMode ? "bg-cyan-400 animate-pulse" : "bg-zinc-650"}`} />
                </div>

                {/* Mode toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMeasureMode(!isMeasureMode);
                    addLog(`CALIPER SYSTEM // MEASUREMENT MODE: [${!isMeasureMode ? "ENABLED - CLICK MODEL TO MEASURE" : "DISABLED"}]`);
                  }}
                  className={`w-full py-1 px-1.5 text-[7px] font-black uppercase border rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isMeasureMode
                      ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                      : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Toggle Measurement Mode. When enabled, click two points on the model to calculate 3D distance."
                >
                  <Compass size={8} className={isMeasureMode ? "animate-spin text-cyan-400" : ""} />
                  <span>{isMeasureMode ? "MEASURE MODE: ON" : "MEASURE MODE: OFF"}</span>
                </button>

                {/* Coordinates & Instructions */}
                <div className="flex flex-col gap-1 text-[6.5px] leading-tight text-zinc-400 bg-zinc-950/50 p-1 border border-zinc-900 rounded-sm">
                  {isMeasureMode ? (
                    <div className="text-cyan-400/90 text-center font-bold animate-pulse py-0.5 border-b border-zinc-900 mb-1">
                      🎯 CLICK SURFACE TO PICK
                    </div>
                  ) : (
                    <div className="text-zinc-500 text-center py-0.5 border-b border-zinc-900 mb-1">
                      STANDBY FOR SIGNAL
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-zinc-500">POINT A:</span>
                    <span className={measurePoints.p1 ? "text-cyan-400" : "text-zinc-600"}>
                      {measurePoints.p1 
                        ? `${measurePoints.p1.x.toFixed(1)}, ${measurePoints.p1.y.toFixed(1)}, ${measurePoints.p1.z.toFixed(1)}`
                        : "NOT LOCKED"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">POINT B:</span>
                    <span className={measurePoints.p2 ? "text-pink-400" : "text-zinc-600"}>
                      {measurePoints.p2 
                        ? `${measurePoints.p2.x.toFixed(1)}, ${measurePoints.p2.y.toFixed(1)}, ${measurePoints.p2.z.toFixed(1)}`
                        : "NOT LOCKED"}
                    </span>
                  </div>
                </div>

                {/* Computed Distance Output block */}
                <div className="flex flex-col gap-0.5 border-t border-zinc-800 pt-1">
                  <div className="text-[6px] font-bold text-zinc-550 uppercase tracking-wider text-center">// ESTIMATED SPAN</div>
                  <div className="flex items-center justify-center py-1 bg-cyan-950/20 border border-cyan-950 rounded-sm">
                    {measureDistance !== null ? (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-cyan-300 tracking-wider">
                          {measureDistance.toFixed(2)} AU
                        </span>
                        <span className="text-[5px] text-zinc-500 uppercase tracking-widest mt-0.5">
                          Abyssum Units
                        </span>
                      </div>
                    ) : (
                      <span className="text-[7px] text-zinc-600 uppercase tracking-widest font-bold">
                        -- AU
                      </span>
                    )}
                  </div>
                  
                  {/* Clear Measurement Button */}
                  <button
                    type="button"
                    onClick={handleClearMeasurement}
                    disabled={!measurePoints.p1 && !measurePoints.p2}
                    className={`w-full mt-1 py-1 px-1 rounded-sm flex items-center justify-center gap-1.5 transition-all text-[6.5px] font-bold uppercase ${
                      measurePoints.p1 || measurePoints.p2
                        ? "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer active:scale-95"
                        : "bg-zinc-950 border border-zinc-950 text-zinc-650 cursor-not-allowed"
                    }`}
                    title="Clear current surface measurement and visual anchors"
                  >
                    <RefreshCw size={7} />
                    <span>CLEAR ANCHORS</span>
                  </button>
                </div>
              </div>

              {/* Component Spectrometry Scanner Sidebar Overlay */}
              {isComponentSidebarOpen && (
                <div className="absolute top-14 right-3 bottom-3 w-[270px] bg-black/92 backdrop-blur-md border border-zinc-800 rounded-sm flex flex-col z-20 shadow-[0_12px_36px_rgba(0,0,0,0.92)] overflow-hidden pointer-events-auto font-mono text-left">
                  {/* Sidebar Header */}
                  <div className="bg-zinc-950 px-2.5 py-2 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[8px] font-black tracking-widest text-cyan-400">
                      <Activity size={9} className="text-cyan-400 animate-pulse" />
                      <span>COMPONENT SPECTROMETRY</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsComponentSidebarOpen(false)} 
                      className="text-zinc-500 hover:text-white p-0.5 cursor-pointer transition-colors"
                      title="Collapse Sidebar"
                    >
                      <X size={9} />
                    </button>
                  </div>

                  {/* Components List */}
                  <div className="bg-zinc-950/40 text-[6.5px] font-bold text-zinc-500 uppercase tracking-widest px-2.5 pt-2 pb-1 border-b border-zinc-900 flex justify-between">
                    <span>// DETECTED MODULES</span>
                    <span className="text-[5.5px] text-zinc-650 tracking-normal">// CLICK 3D MESH OR NAME</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-zinc-900/60 bg-zinc-950/20 max-h-[175px] lg:max-h-[220px]">
                    {MODEL_COMPONENTS_DATA.map((comp) => {
                      const isSelected = selectedComponent?.id === comp.id;
                      return (
                        <div 
                          key={comp.id}
                          onClick={() => {
                            setSelectedComponent(comp);
                            addLog(`STRUCT DIAG // LOCK ON COMPONENT: [${comp.name.toUpperCase()}]`);
                          }}
                          className={`px-2.5 py-1.5 flex items-center justify-between text-[7.5px] cursor-pointer transition-all duration-150 border-l ${
                            isSelected 
                              ? "bg-cyan-950/30 border-l-cyan-400 text-cyan-200 shadow-[inset_3px_0_12px_rgba(6,182,212,0.05)]" 
                              : "hover:bg-zinc-900/40 border-l-transparent text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="truncate max-w-[170px] uppercase font-bold">{comp.name}</span>
                          <div className="flex items-center gap-1 flex-shrink-0 font-bold">
                            <span className={`text-[6.5px] ${comp.status === 'Stable' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                              {comp.status}
                            </span>
                            {comp.status === 'Stable' ? (
                              <ShieldCheck size={8} className="text-emerald-400" />
                            ) : (
                              <AlertTriangle size={8} className="text-amber-400 animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Component Details Panel */}
                  {selectedComponent && (
                    <div className="p-2.5 border-t border-zinc-800 bg-[#020509]/95 flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                      <div>
                        <div className="text-[6px] text-zinc-500 tracking-wider uppercase font-bold mb-0.5">// READOUT SOURCE FILE</div>
                        <h4 className="text-[9.5px] font-black uppercase text-white tracking-wide leading-tight">{selectedComponent.name}</h4>
                      </div>

                      {/* Integrity bar */}
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center text-[7px] font-bold text-zinc-400 uppercase">
                          <span>Structural Integrity:</span>
                          <span className={selectedComponent.status === 'Stable' ? 'text-emerald-400' : 'text-amber-400 animate-pulse font-black'}>
                            {selectedComponent.integrity}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-zinc-900 border border-zinc-800 rounded-none overflow-hidden relative mt-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedComponent.integrity}%` }}
                            transition={{ duration: 0.4 }}
                            className={`h-full ${
                              selectedComponent.status === 'Stable' 
                                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-col gap-1 bg-zinc-950/75 p-1.5 border border-zinc-900 rounded-sm">
                        <div className="flex justify-between text-[6.5px] font-bold">
                          <span className="text-zinc-500 uppercase">Material Composition:</span>
                          <span className="text-zinc-300 uppercase text-right max-w-[120px] truncate" title={selectedComponent.material}>
                            {selectedComponent.material}
                          </span>
                        </div>
                        <div className="flex justify-between text-[6.5px] font-bold">
                          <span className="text-zinc-500 uppercase">Resonance Signature:</span>
                          <span className="text-cyan-400 text-right font-black">{selectedComponent.resonance}</span>
                        </div>
                      </div>

                      {/* Description notes */}
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="text-[6px] text-zinc-500 tracking-wider uppercase font-bold">// DAMAGE ANALYSIS</div>
                        <p className="text-[7px] text-zinc-300 leading-normal bg-zinc-950/30 p-1.5 border border-dashed border-zinc-900/80 rounded-sm uppercase text-left flex-1">
                          {selectedComponent.notes}
                        </p>
                      </div>

                      {/* Internal Core Exploded View Reminder */}
                      {(selectedComponent.id === 'internal_core' || selectedComponent.id === 'plasma_reactor') && !isExplodedView && (
                        <div className="text-[6.5px] text-amber-500 animate-pulse font-bold border border-amber-900/30 bg-amber-950/15 p-1 text-center uppercase tracking-wider rounded-sm">
                          ⚠️ ACTIVATE EXPLODED VIEW TO LOCATE INTERNAL CORE MESH
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sidebar Trigger Button (when closed) */}
              {!isComponentSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsComponentSidebarOpen(true)}
                  className="absolute top-14 right-3 z-20 px-2 py-1.5 bg-black/92 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-800 text-zinc-300 hover:text-cyan-400 font-mono text-[7px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg transition-all active:scale-95 cursor-pointer rounded-sm"
                  title="Open Component Spectrometry Scanner"
                >
                  <Activity size={8} className="animate-pulse text-cyan-400" />
                  <span>🛰️ COMPONENT SCANNER</span>
                </button>
              )}
            </div>

            {/* Interactive Control Deck (Guttered directly at the bottom in the hologram housing) */}
            <div className="relative z-10 bg-zinc-950/90 border border-zinc-850 p-3 rounded-none flex flex-col gap-3">
              {/* Row 1: Calibration and Deployment */}
              <div className="flex flex-col md:flex-row gap-3 items-center w-full">
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
                <div className="w-full md:w-auto shrink-0 flex items-center justify-end gap-2.5">
                  {/* Dynamic 3D Model Sleeve Switcher */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextModel = cockpitModel === 'train' ? 'infiltrator' : 'train';
                      setCockpitModel(nextModel);
                      addLog(`GLB SYSTEM // SWITCHING ACTIVE CHASSIS SCHEMATIC TO: [${nextModel.toUpperCase()}]`);
                      
                      // Trigger dynamic rebuild of the cockpit 3D meshes
                      if (typeof (window as any).__rebuildCockpitMesh === 'function') {
                        setTimeout(() => {
                          (window as any).__rebuildCockpitMesh();
                        }, 10);
                      }
                    }}
                    className={`py-1.5 px-3 font-mono text-[8.5px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1 transition-all active:scale-98 cursor-pointer ${
                      cockpitModel === 'infiltrator'
                        ? "bg-purple-950/40 border border-purple-500/60 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                        : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-350"
                    }`}
                    title="Switch between the heavy Freight Cargo Chassis and the high-fidelity preloaded Stealth Infiltrator X2-A model"
                  >
                    <Layers size={10} className={cockpitModel === 'infiltrator' ? "animate-pulse text-purple-400" : "text-zinc-500"} />
                    <span>
                      {cockpitModel === 'infiltrator' ? "🛰️ STEALTH INFILTRATOR" : "🛰️ DEF CARGO ARRAY"}
                    </span>
                  </button>

                  {/* Exploded View Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExplodedView(!isExplodedView);
                      addLog(`STRUCT DIAG // EXPLODED STRUCTURAL MATRIX: [${!isExplodedView ? "EXPANDED FOR INSPECTION" : "COLLAPSED TO NOMINAL"}]`);
                    }}
                    className={`py-1.5 px-3 font-mono text-[8.5px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer ${
                      isExplodedView
                        ? "bg-cyan-950/40 border border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                        : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-350"
                    }`}
                    title="Toggle Exploded View to inspect internal components and power core structures"
                  >
                    <Wrench size={10} className={isExplodedView ? "animate-pulse text-cyan-400" : "text-zinc-500"} />
                    <span>
                      {isExplodedView ? "💥 EXPLODED: ON" : "💥 EXPLODED VIEW"}
                    </span>
                  </button>

                  {/* Custom Coaxial Lance Forge trigger */}
                  <button
                    onClick={() => setIsLanceModalOpen(true)}
                    className="py-1.5 px-3 bg-amber-950/20 hover:bg-amber-950/45 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-mono text-[8.5px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1 transition-all shadow-[0_0_12px_rgba(245,158,11,0.12)] active:scale-98 cursor-pointer"
                  >
                    <Flame size={10} className="animate-pulse text-amber-400" />
                    <span>LANCE FORGE</span>
                  </button>

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

              {/* Row 2: GLB Model & Animation Controller (Displayed when Stealth Infiltrator / GLB Model view is selected) */}
              {cockpitModel === 'infiltrator' && (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-2.5 border-t border-zinc-900/60 w-full animate-fade-in">
                  {/* Model Selector */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                      3D MODEL SCHEMATIC SOURCE
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedGlbPath("commander-antonio-coldstone-a.glb")}
                        className={`py-1 px-2 font-mono text-[7.5px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                          selectedGlbPath === "commander-antonio-coldstone-a.glb"
                            ? "bg-purple-950/35 border border-purple-500/50 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                            : "bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        🎖️ COMMANDER COLDSTONE
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGlbPath("jump-sequence.glb")}
                        className={`py-1 px-2 font-mono text-[7.5px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                          selectedGlbPath === "jump-sequence.glb"
                            ? "bg-cyan-950/35 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                            : "bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        🤸 JUMP SEQUENCE
                      </button>
                    </div>
                  </div>

                  {/* Animation List */}
                  <div className="flex-1 w-full flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                      <span>ACTIVE ANIMATION LOOPS</span>
                      {activeAnimationName ? (
                        <span className="text-purple-450 font-bold animate-pulse">
                          PLAYING: {activeAnimationName.replace("infiltrator_", "")}
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-bold">ANIMATION LOOPS HALTED</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {availableAnimations.length > 0 ? (
                        <>
                          {availableAnimations.map((anim) => {
                            const displayName = anim.replace("infiltrator_", "");
                            const isActive = activeAnimationName === anim;
                            return (
                              <button
                                key={anim}
                                type="button"
                                onClick={() => playAnimation(anim)}
                                className={`py-1 px-1.5 font-mono text-[7px] uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-purple-500/20 border border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                                    : "bg-zinc-900/80 hover:bg-zinc-850/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {displayName}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={stopAllAnimations}
                            className="py-1 px-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 hover:border-red-500/50 text-red-300 font-mono text-[7px] uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                            title="Stop all animation groups"
                          >
                            ⏹️ HALT
                          </button>
                        </>
                      ) : (
                        <span className="text-[7px] font-mono text-zinc-500 uppercase italic">
                          // NO INHERENT SKELETON ANIMATIONS DETECTED IN FALLBACK GRAPHICS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
      ) : (
        /* ================= FIELD UNIT INSPECTION MODULE ================= */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10 font-mono text-zinc-300">
          
          {/* LEFT WING - KEYCAP PROTOCOLS LIST */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-4 bg-[#0a0f15]/95 border border-zinc-800 relative flex flex-col gap-3 min-h-[400px] shadow-[inset_0_1px_8px_rgba(0,0,0,0.8)]">
              {/* Corner rivets */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />

              <div className="border-b border-zinc-805 pb-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">ASM CONSTRUCT KEYS</span>
                <span className="text-[7.5px] text-zinc-650 font-bold">MODE: CALIBRATE</span>
              </div>

              {/* Description banner */}
              <div className="bg-amber-955/20 border border-amber-800/10 p-2.5 text-[8.5px] leading-relaxed text-amber-500/80 uppercase">
                INTELLIGENT TELEMETRY KEYBOARD MONITOR ACTIVE. PRESS PHYSICAL KEYS ON YOUR SYSTEM CONTROLLER TO ENGAGE TRANSMISSION DECK STREAMS.
              </div>

              {/* Dynamic Keys list */}
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { key: 'W/S', label: 'WALK EXP VECTOR', active: pressedKeys['w'] || pressedKeys['s'] },
                  { key: 'A/D', label: 'STRAFE VECTOR', active: pressedKeys['a'] || pressedKeys['d'] },
                  { key: 'SPACE', label: 'GRAVITY JUMP', active: pressedKeys[' '] },
                  { key: 'F', label: 'CLOSE QUARTERS FIST', active: pressedKeys['f'] },
                  { key: 'G', label: 'CYCLE WEAPONS M/F', active: pressedKeys['g'] },
                  { key: 'E', label: 'DEXTERITY INTERACT', active: pressedKeys['e'] },
                  { key: 'Q', label: 'OSU BOOST SHIELD', active: pressedKeys['q'] },
                  { key: 'X', label: 'TACTICAL RE-ARM', active: pressedKeys['x'] },
                  { key: 'TAB', label: 'CONTROLLER SWAP', active: pressedKeys['tab'] },
                ].map((caps) => (
                  <div
                    key={caps.key}
                    className={`flex items-center justify-between border p-1 px-2 text-[8.5px] uppercase transition-all duration-300 ${
                      caps.active
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                        : "bg-black/40 border-zinc-900/60 text-zinc-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 font-bold border text-[8px] rounded-none ${
                        caps.active ? "bg-amber-500 text-black font-black border-amber-300" : "bg-[#0b1219] border-zinc-800 text-zinc-405"
                      }`}>
                        {caps.key}
                      </span>
                      <span className="font-bold tracking-wider">{caps.label}</span>
                    </div>
                    <span className={`text-[7px] font-black ${caps.active ? "text-amber-400 animate-pulse" : "text-zinc-650"}`}>
                      {caps.active ? "ENGAGED" : "STBY"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COCKPIT - STAGE INSIGHT / FILE UPLOAD OR GLB CONTAINER */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`min-h-[400px] border-2 border-dashed relative flex flex-col items-center justify-center p-6 text-center select-none transition-all duration-300 overflow-hidden ${
                isDragging 
                  ? "border-amber-400 bg-amber-955/25" 
                  : (activePreset || loadedModelName)
                    ? "border-zinc-850 bg-[#020509]"
                    : "border-zinc-800/80 bg-[#04080e]/95"
              }`}
            >
              {/* Corner status markers */}
              <div className="absolute top-2 left-2 text-[8px] font-bold text-zinc-650 uppercase tracking-widest bg-black/45 px-1.5 py-0.5 border border-zinc-900/60">
                STG: 07 // {activePreset ? `${activePreset.toUpperCase()} ACTIVE` : loadedModelName ? "USER GLB" : "INITIAL_DISC"}
              </div>
              <div className="absolute top-2 right-2 text-[8.5px] font-mono text-amber-500 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                INTEGRATED CHG UNIT
              </div>

              {!(activePreset || loadedModelName) ? (
                // Dashboard drop target, matching the image perfectly!
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center max-w-sm cursor-pointer p-6 hover:bg-black/30 transition duration-300 pointer-events-auto"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".glb" 
                    className="hidden" 
                  />
                  {/* Glowing Arrow icon in line-styled modern layout */}
                  <div className="w-14 h-14 rounded-full border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:border-amber-500/40 transition duration-300 bg-zinc-950/60 shadow-[0_0_15px_rgba(0,0,0,0.6)] mb-4">
                    <span className="text-3xl font-black">↑</span>
                  </div>

                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    Drop operative.glb here
                  </h2>
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mt-1.5">
                    or <span className="text-amber-500 underline underline-offset-4 hover:text-amber-400">click to browse</span>
                  </p>

                  <div className="mt-8 border-t border-zinc-900 pt-4 w-full">
                    <span className="text-[7.5px] text-zinc-550 uppercase block tracking-widest mb-3 font-bold">SWITCH DIRECT INJECT PRESET MODEL</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePreset('cst-mvp');
                          addLog("INSPECTOR TERMINAL // CHOSEN PRESET OPERATIVE: CST MVP GROUP 01");
                        }}
                        className="p-2 bg-[#020509]/95 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 text-[8.5px] font-black uppercase tracking-wider cursor-pointer transition-colors duration-200"
                      >
                        🧬 CST MVP GROUP 01
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePreset('forge');
                          addLog("INSPECTOR TERMINAL // CHOSEN PRESET OPERATIVE: FORGE NET VIEWER");
                        }}
                        className="p-2 bg-[#020509]/95 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 text-[8.5px] font-black uppercase tracking-wider cursor-pointer transition-colors duration-200"
                      >
                        ⚙️ FORGE NET VIEWER
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // 3D Babylon stage representation with scanner HUD
                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  <canvas ref={inspectionCanvasRef} className="absolute inset-0 w-full h-full outline-none block" />
                  
                  {/* Subtle 3D Grid Overlay Layer and Camera calibration readouts */}
                  <div className="absolute bottom-3 left-3 bg-black/75 border border-zinc-900 p-2.5 text-[8px] flex flex-col gap-1 tracking-wider text-zinc-400 pointer-events-none">
                    <div className="flex justify-between gap-4">
                      <span>ANGLE MATRIX alpha:</span>
                      <strong className="text-cyan-400 font-bold">45.00°</strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>LIGHT POWER flux:</span>
                      <strong className="text-amber-500 font-bold">144.50 LW</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT WING - ACTIONS & RIG CHASSIS CONTROLS */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-4 bg-[#0a0f15]/95 border border-zinc-800 relative flex flex-col gap-3.5 min-h-[400px] shadow-[inset_0_1px_8px_rgba(0,0,0,0.8)]">
              {/* Corner rivets */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />

              <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">// ACTIONS & CHASSIS RIG</span>
                <span className="text-[7.5px] text-zinc-650 font-bold">SYS: ENERGIZED</span>
              </div>

              {/* Light Rig Controls */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-zinc-550 uppercase tracking-widest">// LIGHT CONFIGURATION RIG</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'flood', label: 'Flood Light' },
                    { id: 'excitation', label: 'Chroma Light' },
                    { id: 'lowglow', label: 'Low Shadows' },
                  ].map((light) => (
                    <button
                      key={light.id}
                      type="button"
                      onClick={() => {
                        setCurrentLightPreset(light.id as any);
                        addLog(`RIG INTERACTION // LIGHT PRESET REGISTERED: [${light.label.toUpperCase()}]`);
                      }}
                      className={`p-1.5 text-[7.5px] font-bold uppercase border cursor-pointer transition-colors duration-150 ${
                        currentLightPreset === light.id
                          ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-300"
                          : "bg-black/50 border-zinc-900 text-zinc-550 hover:text-zinc-350"
                      }`}
                    >
                      {light.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Preset Positioners */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-zinc-550 uppercase tracking-widest">// CAMERA ALIGNMENT PORT</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'orbit', label: 'PERSPECT ORBIT' },
                    { id: 'head', label: 'HEAD RECEPTOR' },
                    { id: 'chassis', label: 'CHASSIS SHELL' },
                    { id: 'bottom', label: 'BASE STACK' },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => {
                        setCurrentCameraPreset(cam.id as any);
                        addLog(`RIG INTERACTION // CAMERA AXIS SWUNG TO: [${cam.label}]`);
                      }}
                      className={`p-1.5 text-[7.5px] font-bold uppercase border cursor-pointer transition-colors duration-150 ${
                        currentCameraPreset === cam.id
                          ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-300"
                          : "bg-black/50 border-zinc-900 text-zinc-550 hover:text-zinc-350"
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drone Scan modes */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-zinc-550 uppercase tracking-widest">// AUTOMATED SCANNING DECK</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDroneInspectOn(!isDroneInspectOn);
                    addLog(`RIG INTERACTION // SWEEP LASER OVERLAY: [${!isDroneInspectOn ? "ENGAGED" : "HALTED"}]`);
                  }}
                  className={`w-full p-2 text-[8px] font-black uppercase border cursor-pointer transition-colors duration-155 ${
                    isDroneInspectOn
                      ? "bg-teal-905/30 border-teal-500 text-teal-300 shadow-[inset_0_1px_8px_rgba(20,184,166,0.15)] font-black"
                      : "bg-black/55 border-zinc-900 text-zinc-550 hover:text-zinc-300"
                  }`}
                >
                  📡 {isDroneInspectOn ? "DRONE INSPECT [ACTIVE]" : "DRONE INSPECT [IDLE]"}
                </button>
              </div>

              {/* Return or load new anchors */}
              <div className="mt-auto border-t border-zinc-900 pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset(null);
                    setLoadedModelName(null);
                    (window as any).__lastUploadedGlbFile = null;
                    addLog("INSPECTOR TERMINAL // CHASSIS CONSTRUCTIONS DISCHARGED");
                  }}
                  disabled={!(activePreset || loadedModelName)}
                  className={`w-full py-2.5 text-[8.5px] font-black uppercase tracking-wider border cursor-pointer transition-all duration-300 ${
                    (activePreset || loadedModelName)
                      ? "bg-amber-955/30 border-amber-600/60 text-amber-200 hover:bg-amber-955/50 hover:border-amber-500"
                      : "bg-zinc-950/20 border-zinc-900 text-zinc-700 cursor-not-allowed"
                  }`}
                >
                  🧬 CHOOSE DIFFERENT UNIT
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDeskTab('hologram');
                    addLog("MTD COCKPIT // REDIRECTED TO COCKPIT HOVER BRIDGE ASSEMBLY");
                  }}
                  className="w-full py-2.5 bg-[#0e1620] hover:bg-[#142030] border border-cyan-800/40 hover:border-cyan-500/60 text-cyan-300 text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-colors duration-200"
                >
                  ⚙️ RETURN TO BRIDGE SYSTEM
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

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

      {/* ================= COAXIAL LANCE CONSTRUCT FORGE POP-UP ================= */}
      <AnimatePresence>
        {isLanceModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
          >
            <motion.div 
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="w-full max-w-lg bg-[#04080c] border-2 border-amber-500/40 p-4 rounded-none shadow-[0_0_50px_rgba(245,158,11,0.22)] flex flex-col gap-3 relative max-h-[96%] overflow-y-auto"
            >
              {/* Corner brackets */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-amber-500/50 pointer-events-none" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-amber-500/50 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-amber-500/50 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-amber-500/50 pointer-events-none" />

              {/* Modal Header */}
              <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <div>
                    <span className="font-mono text-[9.5px] font-black uppercase text-amber-400 tracking-widest block leading-none">
                      COAXIAL LANCE CONSTRUCT FORGE
                    </span>
                    <span className="text-[6px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                      DECI-DIEGETIC WEAPON MANUFACTORY // PILOT INTEGRATION
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLanceModalOpen(false)}
                  className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 border border-zinc-850 cursor-pointer font-mono text-[9px]"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-amber-950/15 border border-amber-500/15 p-2 rounded-none flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[8px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLanceBuilt ? "bg-amber-400 animate-ping" : "bg-zinc-700"}`} />
                  <span className="font-bold text-amber-300 uppercase">
                    Status: {isLanceBuilt ? "CONSTRUCT INTEGRATED" : "BLUEPRINT STANDBY"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLanceBuilt(!isLanceBuilt)}
                  className={`px-2 py-0.5 font-mono text-[7px] uppercase font-black tracking-widest cursor-pointer transition-colors ${
                    isLanceBuilt 
                      ? "bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-300"
                      : "bg-amber-500 hover:bg-amber-400 text-black border border-transparent"
                  }`}
                >
                  {isLanceBuilt ? "✖ DISMANTLE" : "⚡ ASSEMBLE"}
                </button>
              </div>

              {/* Customizer workspace */}
              {isLanceBuilt ? (
                <div className="flex flex-col gap-3">
                  
                  {/* Position mode selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400 font-mono text-[7.5px] uppercase font-bold tracking-wider">
                      Position Alignment Anchor
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setLancePositionMode('train')}
                        className={`py-1.5 font-mono text-[7.5px] font-bold uppercase tracking-widest border transition-all ${
                          lancePositionMode === 'train' 
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                            : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        Parent onto Train
                      </button>
                      <button
                        onClick={() => setLancePositionMode('dock')}
                        className={`py-1.5 font-mono text-[7.5px] font-bold uppercase tracking-widest border transition-all ${
                          lancePositionMode === 'dock' 
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                            : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        Float In Central Dock
                      </button>
                    </div>
                  </div>

                  {/* Iron needle length slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-[7.5px] uppercase font-bold tracking-wider text-zinc-400">
                      <span>Iron Needle Length</span>
                      <span className="text-amber-400">{lanceTipLength.toFixed(2)}m</span>
                    </div>
                    <input 
                      type="range"
                      min="0.3"
                      max="1.6"
                      step="0.05"
                      value={lanceTipLength}
                      onChange={(e) => setLanceTipLength(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-950 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Glow color selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400 font-mono text-[7.5px] uppercase font-bold tracking-wider">
                      Core Glow Color Theme
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[
                        { name: 'cyan', color: '#06b6d4' },
                        { name: 'amber', color: '#f59e0b' },
                        { name: 'emerald', color: '#10b981' },
                        { name: 'violet', color: '#a855f7' },
                        { name: 'crimson', color: '#ef4444' },
                      ].map(item => (
                        <button
                          key={item.color}
                          onClick={() => setLanceGlowColor(item.color)}
                          style={{ borderColor: lanceGlowColor === item.color ? item.color : 'transparent' }}
                          className="flex-1 py-1 rounded-sm border hover:scale-105 active:scale-95 transition-all text-[6.5px] font-mono text-center block bg-zinc-950"
                        >
                          <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 align-middle animate-pulse" style={{ backgroundColor: item.color }} />
                          <span className="text-zinc-400 align-middle">{item.name.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ring Count and Expansion multipliers */}
                  <div className="grid grid-cols-2 gap-3 mt-0.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-400 font-mono text-[7.5px] uppercase font-bold">Convergence Rings</label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setLanceRingCount(prev => Math.max(0, prev - 1))}
                          className="w-5 h-5 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold"
                        >
                          -
                        </button>
                        <span className="flex-1 font-mono text-center text-amber-400 text-[9px] font-bold">{lanceRingCount}</span>
                        <button
                          onClick={() => setLanceRingCount(prev => Math.min(5, prev + 1))}
                          className="w-5 h-5 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[7.5px] uppercase font-bold text-zinc-400">
                        <span>Magnetic Gap</span>
                        <span className="text-amber-400">{lanceExpansion.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={lanceExpansion}
                        onChange={(e) => setLanceExpansion(parseFloat(e.target.value))}
                        className="w-full h-4 bg-transparent accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Dynamic Power Alignment gauge */}
                  <div className="flex flex-col gap-1 border-t border-zinc-850/60 pt-2">
                    <div className="flex justify-between text-[6.5px] font-mono uppercase tracking-widest text-[#a855f7] leading-none mb-1 font-bold">
                      <span>Plasma Power Calibration</span>
                      <span>Level: {lancePowerLevel}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-950/80 rounded-none overflow-hidden relative border border-zinc-850">
                      <div className="absolute h-full bg-[#a855f7]" style={{ width: `${lancePowerLevel}%` }} />
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-zinc-850 p-4">
                  <Database className="w-6 h-6 text-zinc-700 animate-pulse" />
                  <div>
                    <span className="font-mono text-[8px] font-bold text-zinc-400 uppercase block">NO ACTIVE SPECIFICATIONS DETECTED</span>
                    <span className="font-mono text-[6px] text-zinc-500 block max-w-sm mt-1 leading-normal">
                      Click Assemble above to manifest the modular Lance within the local digital calibration space. Once constructed, you are free to customize its geometric vectors in real-time.
                    </span>
                  </div>
                </div>
              )}

              {/* Close controls */}
              <button
                onClick={() => setIsLanceModalOpen(false)}
                className="mt-1 w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-[8px] font-black uppercase tracking-widest rounded-none shadow flex items-center justify-center gap-1.5"
              >
                <span>Commit & Close Forge Controls</span>
              </button>
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
