/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { generateInfographic, analyzeImageRegions, generateRelicIcon, expandMythicLore } from './services/geminiService';
import { GeneratedImage, AnalysisResult, Segment } from './types';
import { AugmentedCanvas } from './components/AugmentedCanvas';
import { VariantRadarChart } from './components/VariantRadarChart';
import { ArchiveCompareChart } from './components/ArchiveCompareChart';
import { LoadingState } from './components/LoadingState';
import { WidgetEngine } from './components/widgets/WidgetEngine';
import { TripoMeshWireframe } from './components/TripoMeshWireframe';
import { RepairBay3D } from './components/RepairBay3D';
import { OriginMiniMap } from './components/OriginMiniMap';
import { AudioVisualizer } from './components/AudioVisualizer';
import { LoreNetworkGraph } from './components/LoreNetworkGraph';
import { HeroLandingPage } from './components/HeroLandingPage';
import { RarityDistributionChart } from './components/RarityDistributionChart';
import { OracleAILogo } from './components/OracleAILogo';
import { AshPilotForgeViewer } from './components/AshPilotForgeViewer';
import { 
  Upload, Sparkles, RefreshCw, Sliders, ArrowUpDown, ChevronRight, Zap, 
  Terminal, ShieldCheck, Eye, EyeOff, Radio, HelpCircle, 
  Download, ShoppingBag, Database, Cpu, ExternalLink, X, FileJson, FileImage, Layers,
  Search, Trash2, History, BookOpen, AlertTriangle, GitCompare, Maximize2, Minimize2, Grid, Box, Magnet,
  Volume2, VolumeX, Flame, Network, Share2, Info, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AppStatus = 'idle' | 'generating' | 'analyzing' | 'complete';

const SUGGESTIONS = [
  "Deep Station Ritual Gateway",
  "Alchemical Battery Core",
  "Fairy Ring Chronometer",
  "Bio-Mechanical Dragon Seal"
];

const ROLLOUT_SUGGESTIONS = [
  "CST-ERT Trooper",
  "Forge Mystic",
  "Battle Mystic",
  "Formula Pilot",
  "Pulse Siren",
  "Horror Witch Reporter"
];

const TERMINAL_LOGS_INITIAL = [
  "INITIALIZE SYSTEM // LEVEL B-3 CHARGED",
  "AWAITING DECODE TARGET SIGNAL...",
  "CINE-REEL MODULE STANDBY"
];

const PROTOTYPE_MODE = true;

export interface OracleIntel {
  name: string;
  class: string;
  rarity: string;
  origin: string;
  oracleId: string;
  hash: string;
  scannedAt: string;
  loreFragment?: string;
  userQuery?: string;
  activeVariant?: string;
  relicIcon?: GeneratedImage;
  isGeneratingIcon?: boolean;
}

export interface LoreTerm {
  term: string;
  definition: string;
  category: string;
  discoveredAt?: string;
  oracleId?: string;
  relicName?: string;
  source: 'Core Standard' | 'Archival Decryption';
}

const DEFAULT_LORE_TERMS: LoreTerm[] = [
  {
    term: "Abyssum",
    definition: "The deep, energetic sub-oceanic rift holding divine remnants of a forgotten epoch, protected by the War Witch Sirens.",
    category: "Geographical Rift",
    source: "Core Standard"
  },
  {
    term: "War Witch Sirens",
    definition: "Ethereal mechanical operators inhabiting the drowned stations of Abyssum, acting as signal conduits and gatekeepers.",
    category: "Entity",
    source: "Core Standard"
  },
  {
    term: "Coaxial Vector",
    definition: "A high-frequency signal alignment beam pathway utilized to penetrate dimensional boundaries and project interactive holograms.",
    category: "Quantum Signal",
    source: "Core Standard"
  },
  {
    term: "MTD-9 Freight",
    definition: "An industrial steam-infused steel transport train of the local Abyssum railway, engineered with heavy thermal shields and local resonance stabilizing coils.",
    category: "Structure",
    source: "Core Standard"
  },
  {
    term: "Resonance Map",
    definition: "A spectral real-time heat overlay identifying localized dimensional density fluctuations and signal rail alignment hot-spots.",
    category: "Navigation Filter",
    source: "Core Standard"
  },
  {
    term: "Tripo-Mesh",
    definition: "A high-density 3D spatial wireframe synthesized from captured optic scans to reconstruct lost material objects or historical relics.",
    category: "Reconstruction Matrix",
    source: "Core Standard"
  },
  {
    term: "Rift Gas Canister",
    definition: "A pressurized sub-marine containment vessel used to store raw gaseous residues harvested from active Abyssum fissures.",
    category: "Storage",
    source: "Core Standard"
  },
  {
    term: "Stripe Shield Protocol",
    definition: "A secure commercial transaction circuit that deploys auxiliary plasma shielding over local freight sectors via standard payment networks.",
    category: "Defensive Safeguards",
    source: "Core Standard"
  },
  {
    term: "Neural Freight Operative",
    definition: "A high-grade human or mechanical pilot linked directly to the train’s steering and defense nodes via quantum headset transducers.",
    category: "Entity Role",
    source: "Core Standard"
  }
];

export const extractLoreTermsFromMarkdown = (text: string, oracleId?: string, relicName?: string): LoreTerm[] => {
  const terms: LoreTerm[] = [];
  if (!text) return terms;
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      // Check bullet points like "- **Term**: Definition"
      const match = trimmed.match(/^[-*]\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (match) {
        terms.push({
          term: match[1].trim(),
          definition: match[2].trim(),
          category: 'Decrypted Spec',
          discoveredAt: new Date().toLocaleTimeString(),
          oracleId,
          relicName,
          source: 'Archival Decryption'
        });
      } else {
        // Fallback to searching for **term** in bullet
        const boldMatch = trimmed.match(/\*\*([^*]+)\*\*/);
        if (boldMatch) {
          const term = boldMatch[1].trim();
          const definition = trimmed.replace(/^[-*]\s*/, '').replace(/\*\*[^*]+\*\*/, '').replace(/^:\s*/, '').trim();
          if (term && definition && term.length > 2 && term.length < 40 && !term.includes('\n')) {
            terms.push({
              term,
              definition,
              category: 'Decrypted Lore',
              discoveredAt: new Date().toLocaleTimeString(),
              oracleId,
              relicName,
              source: 'Archival Decryption'
            });
          }
        }
      }
    } else {
      // Ordinary line, search for double-starred phrases
      const regex = /\*\*([^*]+)\*\*/g;
      let match;
      while ((match = regex.exec(trimmed)) !== null) {
        const term = match[1].trim();
        if (term && term.length > 2 && term.length < 40 && !term.includes('\n') && !term.toUpperCase().includes('DECRYPTION HOST')) {
          // Find context from sentence
          const sentences = trimmed.split(/[.!?]/);
          const containingSentence = sentences.find(s => s.includes(`**${term}**`)) || trimmed;
          const cleanSentence = containingSentence.replace(/\*\*/g, '').trim();
          if (cleanSentence && cleanSentence.length > term.length + 5) {
            terms.push({
              term,
              definition: cleanSentence,
              category: 'Quantum Vector',
              discoveredAt: new Date().toLocaleTimeString(),
              oracleId,
              relicName,
              source: 'Archival Decryption'
            });
          }
        }
      }
    }
  }
  return terms;
};

export function getLoreFragmentByOriginAndSeed(origin: string, seed: number): string {
  const parts: Record<string, { sentence1: string[]; sentence2: string[]; sentence3: string[] }> = {
    'Primary Forge Network Blast Chamber': {
      sentence1: [
        "Found entombed in the supercooled coolant silos of the Primary Forge, this relic remained untouched since the great containment breach.",
        "Recovered from the heart of the Blast Chamber where temperature exceeds stellar levels, its surface bears marks of intense thermonuclear fusion.",
        "Excavated from the sub-circuit cooling reservoirs of the Primary Forge's nuclear furnace, preserved in a state of suspended crystallization.",
        "Discovered welded inside a secondary compression seal chamber after the automatic isolation locks engaged during the great meltdown.",
        "Pulled from the molten slag exhaust pipes of Forge Compartment-7, still radiating an active heat signature of nearly twelve hundred Kelvin."
      ],
      sentence2: [
        "Archival logs hint that the device was forged during the First Cataclysm, destined to guide lost vessels back to harbor.",
        "None who entered the chamber during active cycles ever returned, leaving only this humming artifact as testament.",
        "Damaged blueprints suggest it served as a high-frequency focus crystal for regulating unstable plasma feeds destined for early orbital stations.",
        "Early design transcripts reference this class of device as a thermal ballast node, designed to survive extreme gravitational core collapsed states.",
        "The structural casing is composed of an uncataloged titanium-iridium blend, manifesting anomalous crystal-lattice properties under high-magnification scans."
      ],
      sentence3: [
        "Telemetry detects a dormant micro-frequency pulsing at irregular 0.44-cycle intervals deep within its structural core.",
        "A thermal scan reveals localized heat output that fluctuates in direct synchronization with the console user's bio-signature.",
        "Operator log entry #982 notes: 'The furnace is quiet, yet the core continues to sing in an octave we cannot map.'",
        "Sub-atomic analysis confirms a steady decay of half-life isotopes, confirming its creation predates Sector-09 foundation by solar epochs.",
        "External warning engravings remain legible despite carbonization: 'CAUTION // RIFT RESONANCE CAP LOAD DO NOT VENT CONTAMINATION'."
      ]
    },
    'Archivist Sector-09 Central Nexus': {
      sentence1: [
        "Extracted from deep within the encrypted memory wells of the Sector-09 Central Nexus, this device was buried under centuries of corrupted data logs.",
        "Silent and cold, this unit was found sitting on the master database terminal of a completely abandoned Archivist vault.",
        "Unearthed from the subterranean fiber junction tubes of the Central Nexus, sealed in airtight zero-oxygen nitrogen enclosures.",
        "Retrieved by deep-penetration data probes from the core processing spire of Sector-09 during a routine system diagnostic sweep.",
        "Discovered lodged within the main optical distribution unit of the sector archives, causing a centuries-long localized data loop."
      ],
      sentence2: [
        "Its core still echoes with the faint voices of ancient system operators trying to warn of the coming override.",
        "Strange signal anomalies suggest it has been cataloging the slow decay of the galaxy's outer rim for millennia.",
        "Fragmented datastream registers indicate this block contains key metadata records from a pre-Shattering communication relay network.",
        "The core crystal assembly utilizes high-density optical hologlyphs, retaining information using quantum entanglement states.",
        "Analysis of the data structure reveals a complex multi-layered file system written in an archaic machine dialect of non-standard syntax."
      ],
      sentence3: [
        "Archivist memorandum #401 reports: 'We attempted a deep decapsulation, but the sector nodes rejected the scan parameters with violent feedback.'",
        "System warnings indicate that forcing manual decode routes on this directory may trigger automatic data sanitization countermeasures.",
        "A faint, steady radiation signature of 0.15 millisieverts suggests the presence of a nuclear micro-battery designed for long-duration archival stasis.",
        "Log entries recovered from terminal buffer: 'Sector-09 is blind; the system is running on absolute phantom protocols.'",
        "Diagnostics show high logic gate resonance, suggesting the internal processors are still executing active calculating algorithms."
      ]
    },
    'Deep Sub-Aqueous Abyssum Basin': {
      sentence1: [
        "Retrieved by automated deep-sea submersibles from the pitch-black trenches of the Abyssum Basin, its exterior is encrusted with bioluminescent crystal growths.",
        "Found resting in a hydrothermal vent at the crushing depths of the Basin, the relic was radiating a persistent heat signature.",
        "Dredged from the abyssal silt floors of the sub-oceanic rift zone, covered in deep-sea sediment and fossilized skeletal matter.",
        "Located by sonar mapping inside an underwater basalt cavern system, perfectly preserved in a high-density methane pocket.",
        "Snatched from a geothermal venting fissure near the tectonic boundary where freezing trench water meets boiling under-ocean crust."
      ],
      sentence2: [
        "Local legends speak of an ancient submarine city that vanished overnight, leaving only these pulsing anchors.",
        "The crushing oceanic pressures seem to have had no effect on its delicate crystalline structure.",
        "Acoustic scans reveal that the unit utilizes internal hollow cavities to channel water currents into highly-focused acoustic wave pulses.",
        "Marine engineers suspect the device acted as an oceanic tide stabilization node, mitigating massive undersea earthquake waves.",
        "The exterior plating is constructed from a bio-reactive organic shell compound, responding to changes in surrounding liquid salinity."
      ],
      sentence3: [
        "Sub-surface hydro-telemetry logs record a deep, rhythmic metallic booming sound echoing from the relic coordinates every 128 seconds.",
        "Hydrostatic sensors confirm that its internal chamber pressure remains stabilized at 1,200 atmospheres regardless of external environment.",
        "Warning: Extreme thermal shock risk when handling external containment sleeve without proper sub-zero atmospheric conditioning.",
        "A nearby survey drone recorded abnormal bioluminescent flashing patterns from surrounding fauna prior to final extraction.",
        "Deep diver comment: 'It feels as if the ocean itself is breathing through this metal valve.'"
      ]
    },
    'Outer Ring Chronicle Archives': {
      sentence1: [
        "Sifted from the dusty, gravity-locked shelving units of the Outer Ring Chronicle Archives, it was mislabeled as common industrial scrap.",
        "Discovered inside a sealed obsidian vault within the abandoned archives of the Outer Ring, this relic was hidden purposefully.",
        "Retrieved from a discarded archival container in the low-gravity transit bays of the Outer Ring Chronicle hub.",
        "Sourced from a secret vault hidden behind the main power distribution conduits of the Outer Ring history wing.",
        "Sifted out of the debris fields from an exploded chronicle depository satellite drifting in orbit around the outer gas giants."
      ],
      sentence2: [
        "A single handwritten note attached to its housing warned of severe temporal fractures if ever exposed to open light.",
        "Deciphered sector logs indicate that it holds the only surviving record of the Pre-Shattering epoch.",
        "Historians note the archaic symbols engraved onto its metal band match zero known alphabets in current databases.",
        "The structural casing bears severe micro-meteoroid impacts, indicating it was exposed to raw deep-space vacuum for centuries.",
        "Analysis of its inner mechanical cogwork suggests a mechanical, gear-driven orbital path computer of supreme complexity."
      ],
      sentence3: [
        "The device emits a soft, high-pitched mechanical ticking sound that slows down when approaching strong planetary gravitations.",
        "A micro-engraved label reads: 'CHRONICLER UNIT-4 // PROJECT CHRONOS // RETURN TO ORIGIN STATION IMMEDIATELY'.",
        "Optical spectroscopy scans indicate traces of interstellar mineral compounds that can only originate from dark nebula cores.",
        "System diagnostics show a persistent, tiny electrostatic charge of twenty thousand volts humming over its active surface.",
        "An archival annotation file found next to the device warns: 'Do not connect direct energy couplings; the feedback loop is total.'"
      ]
    },
    'Temporal Echo Distortion Chamber Z-18': {
      sentence1: [
        "Discovered drifting in the chronal suspension fields of Distortion Chamber Z-18, the relic appeared to be existing in multiple timeframes simultaneously.",
        "Found locked in a temporal loop inside Chamber Z-18, retrieving the artifact required exact phase synchronization to prevent causality collapse.",
        "Pulled from the gravity-well center of the Z-18 distortion silo, where the flow of entropy is slowed to near-static levels.",
        "Salvaged from an out-of-phase observation probe that crashed into the quantum compression core of distortion compartment Z-18.",
        "Discovered floating in the zero-induction zone of Chamber Z-18, surrounded by micro-fractures in localized space-time."
      ],
      sentence2: [
        "Scans indicate that its inner mechanism is perpetually winding backwards, as if counting down to a moment that has already passed.",
        "Observers report seeing ghostly afterimages of the object performing movements minutes before they actually occur.",
        "A design anomaly causes light hitting the relic to refract into different spectrum orientations depending on the current minute.",
        "The quantum mechanical core operates on a non-linear variable state machine, bypassing standard thermodynamic entropy decay laws.",
        "Its atomic density fluctuates wildly, shifting between heavy super-dense states and near-weightless atmospheric density structures."
      ],
      sentence3: [
        "Temporal sensors register localized timeline variance of +/- 45 seconds around the immediate perimeter of the relic casing.",
        "Operator log: 'Every time I look at it, the clock on my wrist has skipped a random number of minutes in either direction.'",
        "WARNING // INTERMITTENT CAVITATION FIELD DETECTED // DISCONNECT ALL CHRONO-COUPLERS BEFORE ATTEMPTING FORCE SCAN.",
        "Specialists hypothesize that the relic is a spatial anchor designed to coordinate cross-timeline data handshakes.",
        "The device's heat emission curve graphs as a perfect retro-causal loop, cooling down just before a thermal source is introduced."
      ]
    },
    'Aetherial Singularity Rift Horizon': {
      sentence1: [
        "Pulled from the very edge of the gravitational distortion field at the Singularity Rift Horizon, this relic's atomic structure is highly energized.",
        "Recovered by high-spec tractor beams just before crossing the event horizon of the Aetherial Rift, its metallic body seems warped by immense gravitational tides.",
        "Snatched from a decaying research platform drifting in the strong tidal forces of the Rift Horizon, heavily exposed to ionized cosmic radiation.",
        "Extracted from the gravitational singularity slip-stream of the Core Rift Horizon during space-time stabilization operations.",
        "Found embedded inside a sheared segment of hull plating from a ghost vessel recovered from the outer boundary of the Horizon."
      ],
      sentence2: [
        "Eerie resonance signals suggest that it acts as a transceiver for transmissions originating from the other side of the void.",
        "The surrounding space-time is permanently bent around its chassis, creating a localized gravity lens.",
        "Material scans show the outer matrix structure exists in eleven spatial dimensions, with only 3 fully intersecting our physical universe.",
        "The internal power cells rely on microscopic black hole singularities, generating huge energy yields via Hawking radiation.",
        "The device is coated in an exotic ultra-thin layer of dark matter particles, absorbing over 99.9% of all directed light spectrums."
      ],
      sentence3: [
        "A localized gravitational gradient force of 1.2G is measured at a distance of three inches from the relic's geometric center.",
        "Quantum wave analyzers report high-frequency signal packets written in standard binary format, but repeating negative integers.",
        "Vessel log fragment: 'We crossed the threshold; the horizon is not an empty line, it is a wall of humming metal arrays.'",
        "Caution: Singular signal spike detected in the 4.8 GHz spectrum; shielding fields are heavily advised to avoid interface burnout.",
        "Warning index: G-9 // Gravitational focal point instability detected. Do not mount on standard composite console decks."
      ]
    },
    'Fairy Ring Sub-Spatial Trench': {
      sentence1: [
        "Found buried beneath overgrown synthetic moss at the bottom of the Fairy Ring Trench, this delicate artifact was surrounded by silent micro-signals.",
        "Recovered from a mystical sub-spatial fold in the Fairy Ring trench, the surrounding ecosystem has grown entirely around its pulsing frame.",
        "Unearthed from a subterranean bio-mechanical organic pod buried deep within the soil of the Fairy Ring Trench.",
        "Discovered during survey expeditions in the ancient flora zones of the sub-spatial Fairy Ring fissure.",
        "Pulled from the root cluster of a giant bio-luminescent synthetic redwood tree in the heart of the Fairy Ring Trench."
      ],
      sentence2: [
        "Its faint magnetic pulse has kept the native biome in a state of perfect, uncorrupted biological stasis for generations.",
        "Old scouts claim that standing near the trench reveals faint celestial music coming directly from the device.",
        "The structural lattice is made of a bio-synthetic bone-composite material, indicating an advanced level of genetic biotechnology.",
        "Genetic analysis confirms that the device is running on an integrated network of synthetic nervous pathways instead of copper circuit tracks.",
        "Ancient records map this trench as a sub-spatial coordinate point where early interstellar explorers anchored their initial beacons."
      ],
      sentence3: [
        "A faint bio-electrical current of 44 microamps pulses across the main organic plates in rhythmic waves resembling a heartbeat.",
        "Log entry by Field Botanist: 'The moss surrounding the relic has synthesized a crude copper-alloy shield; it is protecting it.'",
        "Analysis of the audio emissions reveals a deep sub-bass hum matching the resonant frequency of tectonic plates in the sector.",
        "Biological warning: Handling shell structure without sterile isolation gloves may cause temporary nerve tingling effects.",
        "Internal micro-scans reveal hundreds of tiny, synthetic seed pods waiting for a specific solar activation frequency to hatch."
      ]
    },
    'Siren Deep Station Orbital Laboratory': {
      sentence1: [
        "Floating silently in the zero-gravity decay chambers of the abandoned Siren Deep Station, this relic was surrounded by floating crystalline debris.",
        "Recovered from the high-radiation core of the Siren Deep Orbital laboratory, it was the only piece of equipment left undamaged by the reactor meltdown.",
        "Discovered tethered to the main communications satellite dish of the decaying Siren Deep Station, exposed to years of direct solar flares.",
        "Found locked inside a heavy bio-hazard vault in the science deck of the ruined Siren Deep Orbital outpost.",
        "Salvaged from an escape capsule ejected from the Siren Deep complex right before the emergency separation protocol failed."
      ],
      sentence2: [
        "Internal sensors indicate that it is still transmitting high-frequency coordinate data to an unknown point outside the solar system.",
        "The station's final logs contain frantic warnings about a signal from this device that could not be shut off.",
        "Spec sheets imply that the unit was developed during the covert 'Siren Pulse' experiments to tap into pre-decay signal registers.",
        "The internal circuits are constructed from liquid mercury-alloy waveguides, allowing zero-latency signal calculation rates.",
        "Damaged data tapes reveal that the laboratory crew vanished within moments of the relic first reaching active resonant sync states."
      ],
      sentence3: [
        "Telemetry shows an active high-power signal pointing directly at the Sagittarius Arm of our galaxy, sending raw numeric prime sequences.",
        "A radiation warning indicates a high yield of alpha-particle emission from its main power couplers during active visual pulsing.",
        "Terminal entry: 'The signal has eyes. It responded to our scanner pings. It is counting our system registers.'",
        "Warning: Cybernetic feedback alert. Relic communication layers are capable of overwriting connected hardware memory systems.",
        "Internal power readings remain completely maxed out, drawing from an unknown remote zero-point energy tap."
      ]
    }
  };

  const originKey = Object.keys(parts).find(
    k => k.toLowerCase() === origin.toLowerCase()
  ) || 'Primary Forge Network Blast Chamber';

  const entry = parts[originKey];
  const s1 = entry.sentence1[seed % entry.sentence1.length];
  const s2 = entry.sentence2[(seed + 7) % entry.sentence2.length];
  const s3 = entry.sentence3[(seed + 13) % entry.sentence3.length];
  return `${s1} ${s2} ${s3}`;
}

export function generateOracleIntel(query: string, variant: string): OracleIntel {
  const seedStr = (query || "archetype") + variant;
  const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const prefixes = [
    'Apex', 'Void', 'Nebula', 'Chronos', 'Abyssal', 'Aetherial', 'Runic', 'Pristine', 
    'Custodian', 'Genesis', 'Quantum', 'Glitch', 'Obsidian', 'Astral', 'Emanant', 'Hyperion',
    'Syntactic', 'Algorithmic', 'Eldritch', 'Titanium', 'Bismuth', 'Photic', 'Singularity'
  ];
  
  const suffixes = [
    'Aperture', 'Node', 'Hologlyph', 'Beacon', 'Siphon', 'Matrix', 'Monolith', 'Conduit', 
    'Catalyst', 'Transducer', 'Dynamo', 'Core', 'Prism', 'Engram', 'Oscilloscope', 'Reliquary',
    'Inductor', 'Prismatica', 'Sub-Station', 'Aether-Port', 'Hyper-Key', 'Chronometer'
  ];

  const classes = [
    'Extradimensional Signal Anchor [Class S-I]',
    'Quantum Manifestation Module [Class B-XII]',
    'Archaic Industrial Resonator [Class A-IV]',
    'Sub-Atmospheric Gateway Beacon [Class C-II]',
    'Eldritch Chrono-Decay Core [Class EX-9]',
    'Abyssal Resonance Transceiver [Class O-VIII]',
    'Photic Sigil Vector Catalyst [Class P-V]',
    'Hyper-Advanced Transduction Node [Class Ultra-X]'
  ];

  const rarities = [
    'Mythic Unique',
    'Relic Class [S-Grade]',
    'Forbidden Archetype',
    'Anomalous Legendary',
    'Paradoxical Cosmic',
    'Ecosystem Sovereign',
    'Deidentified Primordial',
    'Astral Non-Euclidean [Omega Level]'
  ];

  const origins = [
    'Primary Forge Network Blast Chamber',
    'Archivist Sector-09 Central Nexus',
    'Deep Sub-Aqueous Abyssum Basin',
    'Outer Ring Chronicle Archives',
    'Temporal Echo Distortion Chamber Z-18',
    'Aetherial Singularity Rift Horizon',
    'Fairy Ring Sub-Spatial Trench',
    'Siren Deep Station Orbital Laboratory'
  ];

  const prefix = prefixes[seed % prefixes.length];
  const suffix = suffixes[(seed + 3) % suffixes.length];
  
  let classSelected = classes[seed % classes.length];
  if (variant === 'abyss') classSelected = classes[5];
  else if (variant === 'chronos') classSelected = classes[4];
  else if (variant === 'aether') classSelected = classes[1];
  else if (variant === 'original') classSelected = classes[2];

  const queryLen = query ? query.length : 12;
  const raritySelected = rarities[(seed + queryLen) % rarities.length];

  let originSelected = origins[seed % origins.length];
  if (variant === 'abyss') originSelected = origins[2];
  else if (variant === 'chronos') originSelected = origins[4];
  else if (variant === 'aether') originSelected = origins[5];
  
  const nameBase = query ? query.replace(/[^a-zA-Z0-9 ]/g, '').trim() : 'Genesis Asset';
  const displayParts = nameBase.split(' ');
  const finalName = displayParts.length <= 2 
    ? `${prefix} ${nameBase} ${suffix}`
    : `${prefix} ${displayParts.slice(0, 2).join(' ')} ${suffix}`;

  const oracleId = `ORACLE-AI-${(seed % 9000 + 1000).toString()}`;
  const mockHash = `0x${Array.from({length: 16}, (_, i) => ((seed + i * 7) % 16).toString(16)).join('')}`;
  
  const loreFragment = getLoreFragmentByOriginAndSeed(originSelected, seed);

  return {
    name: finalName.toUpperCase(),
    class: classSelected.toUpperCase(),
    rarity: raritySelected.toUpperCase(),
    origin: originSelected.toUpperCase(),
    oracleId,
    hash: mockHash.toUpperCase(),
    scannedAt: new Date().toISOString(),
    loreFragment
  };
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'terminal' | 'forge-viewer'>('landing');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [data, setData] = useState<{ image: GeneratedImage; analysis: AnalysisResult | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [crtScanline, setCrtScanline] = useState<boolean>(false);
  const [signalOverride, setSignalOverride] = useState<boolean>(false);
  const [gridFloor, setGridFloor] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showTacticalGrid, setShowTacticalGrid] = useState<boolean>(false);
  const [isOrthographic, setIsOrthographic] = useState<boolean>(false);
  const [snapToGrid, setSnapToGrid] = useState<'off' | '15' | '45'>('off');
  const viewportRef = useRef<HTMLDivElement>(null);
  const loggedAnomaliesRef = useRef<Set<string>>(new Set());
  
  // Custom interactive console controls states
  const [motionIntensity, setMotionIntensity] = useState<number>(35);
  const [spectralDistortion, setSpectralDistortion] = useState<number>(20);
  const [frameCount, setFrameCount] = useState<number>(24);
  const [scrubPosition, setScrubPosition] = useState<number>(50);
  const [rippleIntensity, setRippleIntensity] = useState<number>(50);
  const [rippleFrequency, setRippleFrequency] = useState<number>(50);
  const [isAwakened, setIsAwakened] = useState<boolean>(false);
  const [activeVariant, setActiveVariant] = useState<string>('original');
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [divineRolloutOpen, setDivineRolloutOpen] = useState<boolean>(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  
  // Pipeline/Marketplace states
  const [activeTab, setActiveTab] = useState<'monitor' | 'pipeline'>('monitor');
  const [forgeAssetId, setForgeAssetId] = useState<string | null>(null);
  const [isExportingForge, setIsExportingForge] = useState<boolean>(false);
  const [isTripo3dMode, setIsTripo3dMode] = useState<boolean>(false);
  const [isRepairBayMode, setIsRepairBayMode] = useState<boolean>(false);
  const [isCineExporting, setIsCineExporting] = useState<boolean>(false);
  const [showListingModal, setShowListingModal] = useState<boolean>(false);
  const [activeListing, setActiveListing] = useState<{
    price: string;
    supply: string;
    unlockables: string;
    hasUnlockables: boolean;
    txHash: string;
    listedAt: string;
    name: string;
    loreClass: string;
  } | null>(null);

  const [oracleIntel, setOracleIntel] = useState<OracleIntel | null>(null);
  const [isAnomalousEventActive, setIsAnomalousEventActive] = useState<boolean>(false);
  const [isAmbientAtmosphereEnabled, setIsAmbientAtmosphereEnabled] = useState<boolean>(false);
  const [isCoaxialBurstActive, setIsCoaxialBurstActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('oracle_audio_muted');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historySortBy, setHistorySortBy] = useState<string>('date-desc');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [intelHistory, setIntelHistory] = useState<OracleIntel[]>(() => {
    try {
      const saved = localStorage.getItem('oracle_intel_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Decoding states for Mythic Lore Modal
  const [isLoreModalOpen, setIsLoreModalOpen] = useState<boolean>(false);
  const [decodedLoreContent, setDecodedLoreContent] = useState<string>('');
  const [isDecodingLoreRunning, setIsDecodingLoreRunning] = useState<boolean>(false);
  const [isShareCopied, setIsShareCopied] = useState<boolean>(false);

  // Lore Dictionary states
  const [isLoreDictOpen, setIsLoreDictOpen] = useState<boolean>(false);
  const [loreViewMode, setLoreViewMode] = useState<'list' | 'graph'>('list');
  const [loreSearchQuery, setLoreSearchQuery] = useState<string>('');
  const [loreCategoryFilter, setLoreCategoryFilter] = useState<string>('ALL');
  const [loreTerms, setLoreTerms] = useState<LoreTerm[]>(() => {
    try {
      const saved = localStorage.getItem('abyssum_lore_dictionary');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load lore dictionary:", e);
    }
    return DEFAULT_LORE_TERMS;
  });

  const handleDecodeLoreClick = async () => {
    if (!oracleIntel) return;
    
    setIsLoreModalOpen(true);
    setIsDecodingLoreRunning(true);
    setDecodedLoreContent('');
    addLog(`DECRYPT NODE // ENGAGING COAXIAL DECODER MATRIX`);
    
    try {
      const result = await expandMythicLore(
        oracleIntel.loreFragment || "Baseline lore snippet unavailable.",
        oracleIntel.name,
        oracleIntel.class,
        oracleIntel.rarity
      );
      setDecodedLoreContent(result);
      addLog(`DECRYPT METASTABLE // DECRYPTION SEQUENCE COMPLETED`);

      // Parse and extract terminology discovered during Mythic Lore decryptions
      const newTerms = extractLoreTermsFromMarkdown(result, oracleIntel.oracleId, oracleIntel.name);
      if (newTerms.length > 0) {
        setLoreTerms((prev) => {
          const merged = [...prev];
          let introduced = 0;
          for (const nt of newTerms) {
            const index = merged.findIndex(t => t.term.toLowerCase() === nt.term.toLowerCase());
            if (index > -1) {
              if (merged[index].source === 'Core Standard' || merged[index].definition.length < nt.definition.length) {
                merged[index] = {
                  ...merged[index],
                  definition: nt.definition,
                  oracleId: nt.oracleId,
                  relicName: nt.relicName,
                  discoveredAt: nt.discoveredAt || new Date().toLocaleTimeString(),
                  source: 'Archival Decryption'
                };
              }
            } else {
              merged.push(nt);
              introduced++;
            }
          }
          if (introduced > 0) {
            addLog(`GLOSSARY DYNAMIX // REGISTERED ${introduced} DISCOVERED ABYSSUM INTERCEPS`);
          }
          try {
            localStorage.setItem('abyssum_lore_dictionary', JSON.stringify(merged));
          } catch (e) {
            console.error("Failed to persist lore dictionary:", e);
          }
          return merged;
        });
      }
    } catch (err: any) {
      console.error(err);
      addLog(`DECRYPT INTERRUPT // COAXIAL VECTOR DISTORTION ENGAGED`);
      setDecodedLoreContent(`### SIGNAL ABORTED
Failed to decode the deep archive. Please verify that your system authentication is active or retry.`);
    } finally {
      setIsDecodingLoreRunning(false);
    }
  };

  const addIntelToHistory = (intel: OracleIntel) => {
    const enrichedIntel = {
      ...intel,
      userQuery: intel.userQuery || query,
      activeVariant: intel.activeVariant || activeVariant
    };
    setIntelHistory((prev) => {
      const filtered = prev.filter((item) => item.oracleId !== enrichedIntel.oracleId);
      const updated = [enrichedIntel, ...filtered];
      try {
        localStorage.setItem('oracle_intel_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const deleteIntelFromHistory = (oracleId: string) => {
    setIntelHistory((prev) => {
      const updated = prev.filter((item) => item.oracleId !== oracleId);
      try {
        localStorage.setItem('oracle_intel_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addLog(`ORACLE ARCHIVE LOG PURGED [${oracleId}]`);
  };

  const generateCleanLoreText = () => {
    if (!oracleIntel) return "";
    
    // Clean markdown notations from decodedLoreContent
    let cleanedContent = decodedLoreContent
      // Remove ### headings but keep text capitalized and spaced
      .replace(/^###\s*(.*)$/gm, '\n=== $1 ===\n')
      // Remove ## headings but keep text capitalized and spaced
      .replace(/^##\s*(.*)$/gm, '\n=== $1 ===\n')
      // Remove bold markers
      .replace(/\*\*/g, '')
      // Remove bullet points but keep a clean index indentation
      .replace(/^[-*]\s*/gm, ' • ')
      .trim();

    const border = "==================================================";
    const divider = "--------------------------------------------------";
    
    return `${border}
🌌 ABYSSUM SYSTEMS - DECRYPTED MYTHIC LORE 🌌
${border}
IDENTIFIER  : ${oracleIntel.oracleId || "N/A"}
DESIGNATION : ${oracleIntel.name.toUpperCase()}
CLASS       : ${oracleIntel.class.toUpperCase()}
RARITY      : ${oracleIntel.rarity.toUpperCase()}
ORIGIN      : ${oracleIntel.origin.toUpperCase()}
SIG HASH    : ${oracleIntel.hash || "N/A"}
${divider}

${cleanedContent}

${border}
COGNITIVE DECRYPTION FEED LINK SECURED
${border}`;
  };

  const handleShareLore = async () => {
    const text = generateCleanLoreText();
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Decrypted Mythic Lore: ${oracleIntel?.name}`,
          text: text
        });
        addLog(`DECRYPTOR SYSTEM // LORE SCHEMATICS SHARED SUCCESSFULLY`);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        console.log("Navigator.share failed/cancelled, falling back to clipboard", err);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setIsShareCopied(true);
      addLog(`DECRYPTOR SYSTEM // EXPORTED CLEAN SHARABLE LORE TO CLIPBOARD`);
      setTimeout(() => {
        setIsShareCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Clipboard copy failed: ", err);
    }
  };

  const clearIntelHistory = () => {
    setIntelHistory([]);
    try {
      localStorage.removeItem('oracle_intel_history');
    } catch (e) {
      console.error(e);
    }
    addLog("PURGING FULL ARCHIVAL REGISTRY VAULT");
  };

  const restoreIntelAsset = (item: OracleIntel) => {
    const targetQuery = item.userQuery || query || "Ancient Gateway Relic";
    setQuery(targetQuery);
    if (item.activeVariant) {
      setActiveVariant(item.activeVariant);
    }
    commenceSynthesis(targetQuery);
    setShowHistoryDrawer(false);
    addLog(`RESTORED SIGNAL RESONANCE MATRIX FOR: "${targetQuery.toUpperCase()}"`);
  };

  useEffect(() => {
    if (data && query) {
      const intel = generateOracleIntel(query, activeVariant);
      const existingInHistory = intelHistory.find(
        (item) => item.oracleId === intel.oracleId || (item.userQuery === query && item.activeVariant === activeVariant)
      );
      if (existingInHistory) {
        setOracleIntel({
          ...intel,
          relicIcon: existingInHistory.relicIcon,
          isGeneratingIcon: existingInHistory.isGeneratingIcon
        });
      } else {
        setOracleIntel(intel);
      }
    } else {
      setOracleIntel(null);
    }
  }, [data, query, activeVariant, intelHistory]);
  
  // Automatically append high-priority telemetry entries for Anomalous Mythic Events
  useEffect(() => {
    if (oracleIntel && oracleIntel.rarity.toUpperCase().includes('MYTHIC')) {
      setIsAnomalousEventActive(true);
      const id = oracleIntel.oracleId;
      if (!loggedAnomaliesRef.current.has(id)) {
        loggedAnomaliesRef.current.add(id);
        addLog(`⚠️ [HIGH-PRIORITY ALERT] // MYTHIC ANOMALOUS DETECTED [ID: ${id}] // INSTABILITY DETUNING FEED FOR "${oracleIntel.name.toUpperCase()}"`);
      }
    } else {
      setIsAnomalousEventActive(false);
    }
  }, [oracleIntel]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewportRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!viewportRef.current) return;
    if (!document.fullscreenElement) {
      viewportRef.current.requestFullscreen().catch((err: any) => {
        addLog(`ERROR // FULLSCREEN ACTIVATION FAILED: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Cybernetic rune toggles state
  const [runeStates, setRuneStates] = useState<{ [key: string]: boolean }>({
    anchor: true,
    booster: false,
    glitch: false,
    arcane: true
  });

  // Glitch flash visual effect state
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  
  // Drag and drop detector state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Terminal telemetry logs
  const [logs, setLogs] = useState<string[]>(TERMINAL_LOGS_INITIAL);

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error'; duration?: number }[]>([]);
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 8)]);

    // Intercept logs to trigger elegant toast notifications for background operations
    const msgUpper = message.toUpperCase();
    let type: 'success' | 'info' | 'warning' | 'error' = 'info';
    let shouldToast = false;
    let cleanMessage = message;

    if (message.includes('//')) {
      cleanMessage = message.split('//').pop()?.trim() || message;
    } else if (message.includes(':')) {
      cleanMessage = message.split(':').pop()?.trim() || message;
    }

    if (
      msgUpper.includes('SUCCESS') || 
      msgUpper.includes('COMPLETED') || 
      msgUpper.includes('EXPORTED') || 
      msgUpper.includes('DOWNLOADED') ||
      msgUpper.includes('DEPLOYED') ||
      msgUpper.includes('CONSIGNED') ||
      msgUpper.includes('REGISTERED') ||
      msgUpper.includes('LOCKED') ||
      msgUpper.includes('COMPLETE')
    ) {
      type = 'success';
      shouldToast = true;
    } else if (
      msgUpper.includes('ERROR') || 
      msgUpper.includes('FAILED') || 
      msgUpper.includes('FAILURE') ||
      msgUpper.includes('DENIED') ||
      msgUpper.includes('BROKEN')
    ) {
      type = 'error';
      shouldToast = true;
    } else if (
      msgUpper.includes('WARNING') || 
      msgUpper.includes('ALERT') || 
      msgUpper.includes('INTERRUPT') ||
      msgUpper.includes('TIMEOUT') ||
      msgUpper.includes('CORRUPT')
    ) {
      type = 'warning';
      shouldToast = true;
    } else if (
      msgUpper.includes('LISTING STAGED') ||
      msgUpper.includes('COMMENCE') ||
      msgUpper.includes('INITIATING') ||
      msgUpper.includes('CALIPER') ||
      msgUpper.includes('SORT APPLIED') ||
      msgUpper.includes('AUTO-TUNED') ||
      msgUpper.includes('COAXIAL FIELD')
    ) {
      type = 'info';
      shouldToast = true;
    }

    if (shouldToast) {
      // Format clean message for perfect display
      let toastMsg = cleanMessage.replace(/^[^\w\s\[\]\(\)\-\:\/]+/g, '').trim();
      addToast(toastMsg, type);
    }
  };

  // Automated slider movement when scrubbing is styled but user hits "VEO-3 Pulse"
  const [isPlayingPulse, setIsPlayingPulse] = useState<boolean>(false);
  const [pulseModulator, setPulseModulator] = useState<number>(1.0);

  // Auto playback animation when VEO-3 pulse is active
  useEffect(() => {
    if (!isPlayingPulse) return;
    
    let frameId: number;
    let start: number | null = null;
    const duration = 2500; // ms
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1.0);
      
      if (t < 1.0) {
        // High-fidelity physical response model:
        // Rapid rise to maximum peak at t = 0.20, followed by an elegant exponential decay tail back to resting state
        let envelope = 0;
        if (t < 0.20) {
          // Normalize rise phase: 0 to 1
          const risePct = t / 0.20;
          envelope = Math.sin(risePct * Math.PI / 2); // Quick smooth sine surge
        } else {
          // Exponential decay tail: exp(-decayConstant * (t - peakTime))
          // A decay constant of 4.5 ensures a smooth physical taper to zero amplitude by the time t approaches 1.0
          envelope = Math.exp(-4.5 * (t - 0.20));
        }

        // Adjust scrub position dynamically based on physics envelope
        setScrubPosition(Math.floor((envelope * 40) + 50));
        
        // Sync modulator with the visual water ripple translation
        const period = 150 / Math.max(1, rippleFrequency);
        const phase = (timestamp / 1000) * (2 * Math.PI / period);
        
        // Oscillation is damped exponentially by the decay tail envelope
        const multiplier = 1.0 + (Math.sin(phase) * 0.4 * envelope);
        setPulseModulator(multiplier);
        
        frameId = requestAnimationFrame(animate);
      } else {
        setScrubPosition(50);
        setIsPlayingPulse(false);
        setPulseModulator(1.0);
        addLog("PULSE SEQUENCE TERMINATED");
      }
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlayingPulse, rippleFrequency]);

  // Ambient Loop synthesizer references
  const ambientSynthRef = useRef<{
    ctx: AudioContext | null;
    osc1: OscillatorNode | null;
    osc2: OscillatorNode | null;
    filter: BiquadFilterNode | null;
    gainNode: GainNode | null;
    analyser: AnalyserNode | null;
  }>({
    ctx: null,
    osc1: null,
    osc2: null,
    filter: null,
    gainNode: null,
    analyser: null
  });

  const ambientAtmosphereRef = useRef<{
    ctx: AudioContext | null;
    oscSub: OscillatorNode | null;
    oscMod: OscillatorNode | null;
    lfo: OscillatorNode | null;
    lfoGain: GainNode | null;
    filter: BiquadFilterNode | null;
    gainNode: GainNode | null;
    analyser: AnalyserNode | null;
  }>({
    ctx: null,
    oscSub: null,
    oscMod: null,
    lfo: null,
    lfoGain: null,
    filter: null,
    gainNode: null,
    analyser: null
  });

  const startAmbientSynth = (overrideMuted?: boolean) => {
    const activeMute = overrideMuted !== undefined ? overrideMuted : isMuted;
    if (activeMute) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      // Ensure no double creation
      if (ambientSynthRef.current.ctx) {
        if (ambientSynthRef.current.ctx.state === 'suspended') {
          ambientSynthRef.current.ctx.resume();
        }
        return;
      }

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Oscillator 1 - Triangle Wave for a smooth cosmic baseline
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';

      // Oscillator 2 - Sawtooth Wave for harmonizing texturizer
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';

      // Lowpass filter to keep it deep and subtle
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 3.5;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      // Gentle fade in over 1.2 seconds so it doesn't pop or shock
      gainNode.gain.linearRampToValueAtTime(0.015, now + 1.2);

      // Pitch calculation: base frequency mapped to motionIntensity slider
      const baseFreq = 50 + (motionIntensity * 1.5); // Range: ~51.5Hz to ~200Hz
      // Detune and resonance filter cutoff mapped to spectralDistortion slider
      const detuneCents = spectralDistortion * 2; // Up to 200 cents detune
      const filterCutoff = 130 + (spectralDistortion * 5.5); // Range: ~135.5Hz to ~680Hz

      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.frequency.setValueAtTime(baseFreq, now); // Same fundamental pitch
      osc2.detune.setValueAtTime(detuneCents, now); // Detuned by Spectral Distortion

      filter.frequency.setValueAtTime(filterCutoff, now);

      // Node Graph connections
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      ambientSynthRef.current = {
        ctx,
        osc1,
        osc2,
        filter,
        gainNode,
        analyser
      };

      setAnalyserNode(analyser);

      addLog("MONITOR AUDIO // LOOPING RESONANT AMBIENT SYNTH ENGAGED");
    } catch (e) {
      console.warn("Could not activate ambient loop synth:", e);
    }
  };

  const stopAmbientSynth = () => {
    try {
      const { ctx, osc1, osc2, gainNode } = ambientSynthRef.current;
      setAnalyserNode(null);
      if (ctx && ctx.state !== 'closed') {
        const now = ctx.currentTime;
        if (gainNode) {
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(gainNode.gain.value, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.35); // Smooth fade out
        }
        
        // Clear references immediately so subsequent rapid activations/standby calls are fully isolated
        ambientSynthRef.current = { ctx: null, osc1: null, osc2: null, filter: null, gainNode: null, analyser: null };
        
        setTimeout(() => {
          try {
            if (osc1) {
              try { osc1.stop(); } catch (err) {}
            }
            if (osc2) {
              try { osc2.stop(); } catch (err) {}
            }
            if (ctx && ctx.state !== 'closed') {
              ctx.close().catch(() => {});
            }
          } catch (err) {}
        }, 400);
        addLog("MONITOR AUDIO // LOOPING RESONANT AMBIENT SYNTH STANDBY");
      }
    } catch (e) {
      console.warn("Could not stop ambient loop synth:", e);
    }
  };

  const startAmbientAtmosphere = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (ambientAtmosphereRef.current.ctx) {
        if (ambientAtmosphereRef.current.ctx.state === 'suspended') {
          ambientAtmosphereRef.current.ctx.resume();
        }
        return;
      }

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Deep Sub oscillator (sine wave for pure low frequency)
      const oscSub = ctx.createOscillator();
      oscSub.type = 'sine';

      // Texture modulator (triangle wave)
      const oscMod = ctx.createOscillator();
      oscMod.type = 'triangle';

      // Low-frequency filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 4.0;

      // LFO for dynamic rhythmic swelling
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      const lfoGain = ctx.createGain();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 1.5); // Rich deep swell

      // Initial settings based on current oracleIntel rarity
      const score = oracleIntel ? getRarityScoreAndSettings(oracleIntel.rarity).score : 30;
      
      // Map rarity score to frequency parameters
      // Low rarity = ultra-deep slow rumble (~35-45 Hz)
      // High rarity = higher-energy resonant frequency (~70-95 Hz)
      const subFreq = 35 + (score * 0.6); 
      const modFreq = subFreq * 1.5; // Harmonic interval
      const filterCutoff = 80 + (score * 2.5); // ~105Hz to ~330Hz
      const lfoRate = 0.05 + (score * 0.015); // ~0.2Hz to ~1.55Hz pulsing

      oscSub.frequency.setValueAtTime(subFreq, now);
      oscMod.frequency.setValueAtTime(modFreq, now);
      oscMod.detune.setValueAtTime(12, now); // subtle warmth

      lfo.frequency.setValueAtTime(lfoRate, now);
      lfoGain.gain.setValueAtTime(15, now); // modulate filter frequency by 15Hz

      filter.frequency.setValueAtTime(filterCutoff, now);

      // Connect LFO to filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Audio Graph
      oscSub.connect(filter);
      oscMod.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(ctx.destination);

      oscSub.start(now);
      oscMod.start(now);
      lfo.start(now);

      ambientAtmosphereRef.current = {
        ctx,
        oscSub,
        oscMod,
        lfo,
        lfoGain,
        filter,
        gainNode,
        analyser
      };

      addLog(`MONITOR AUDIO // AMBIENT ATMOSPHERE ENGAGED [BASE FREQ: ${subFreq.toFixed(1)} HZ, PULSE: ${lfoRate.toFixed(2)} HZ]`);
    } catch (e) {
      console.warn("Could not activate ambient atmosphere soundscape:", e);
    }
  };

  const stopAmbientAtmosphere = () => {
    try {
      const { ctx, oscSub, oscMod, lfo, gainNode } = ambientAtmosphereRef.current;
      if (ctx && ctx.state !== 'closed') {
        const now = ctx.currentTime;
        if (gainNode) {
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(gainNode.gain.value, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.5); // Smooth fade
        }

        ambientAtmosphereRef.current = {
          ctx: null,
          oscSub: null,
          oscMod: null,
          lfo: null,
          lfoGain: null,
          filter: null,
          gainNode: null,
          analyser: null
        };

        setTimeout(() => {
          try {
            if (oscSub) oscSub.stop();
            if (oscMod) oscMod.stop();
            if (lfo) lfo.stop();
            if (ctx && ctx.state !== 'closed') {
              ctx.close().catch(() => {});
            }
          } catch (err) {}
        }, 600);

        addLog("MONITOR AUDIO // AMBIENT ATMOSPHERE PLACED IN STANDBY");
      }
    } catch (e) {
      console.warn("Could not stop ambient atmosphere soundscape:", e);
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    try {
      localStorage.setItem('oracle_audio_muted', String(nextState));
    } catch {}
    if (nextState) {
      stopAmbientSynth();
      addLog("MONITOR AUDIO // ALL RESONANCE PATHS MUTED");
    } else {
      addLog("MONITOR AUDIO // RESONANCE AUDIO ENGAGED");
      if (data) {
        startAmbientSynth(false);
      }
    }
  };

  const triggerRiftResonanceRumble = (isActivating: boolean) => {
    if (isMuted) return;
    try {
      let ctx = ambientSynthRef.current.ctx;
      let targetAnalyser = ambientSynthRef.current.analyser;
      let createdOwnCtx = false;

      if (!ctx || ctx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        ctx = new AudioContextClass();
        createdOwnCtx = true;
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const startFreq = isActivating ? 38 : 55;
      const endFreq = isActivating ? 64 : 28;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 1.8);

      const oscBeats = ctx.createOscillator();
      oscBeats.type = 'sine';
      oscBeats.frequency.setValueAtTime(startFreq * 1.5, now);
      oscBeats.frequency.exponentialRampToValueAtTime(endFreq * 1.5 - 2, now + 1.8);

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(85, now);
      rumbleFilter.frequency.exponentialRampToValueAtTime(45, now + 1.8);
      rumbleFilter.Q.setValueAtTime(12, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(isActivating ? 0.18 : 0.12, now + 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

      osc.connect(rumbleFilter);
      oscBeats.connect(rumbleFilter);
      rumbleFilter.connect(gainNode);

      if (targetAnalyser && !createdOwnCtx) {
        gainNode.connect(targetAnalyser);
      } else {
        gainNode.connect(ctx.destination);
      }

      osc.start(now);
      oscBeats.start(now);

      const durationMs = 2000;
      osc.stop(now + 2.0);
      oscBeats.stop(now + 2.0);

      if (createdOwnCtx) {
        const localCtx = ctx;
        setTimeout(() => {
          localCtx.close().catch(() => {});
        }, durationMs + 200);
      }
    } catch (e) {
      console.warn("Could not trigger Rift Resonance audio rumble:", e);
    }
  };

  // Trigger when a relic is loaded, clean up on unload/unmount
  useEffect(() => {
    if (data) {
      startAmbientSynth();
    } else {
      stopAmbientSynth();
      stopAmbientAtmosphere();
    }
    return () => {
      stopAmbientSynth();
      stopAmbientAtmosphere();
    };
  }, [data]);

  // Synchronize Ambient Atmosphere soundscape parameters dynamically with the current asset's rarity
  useEffect(() => {
    if (isAmbientAtmosphereEnabled && !isMuted && data) {
      // Start if not already running
      if (!ambientAtmosphereRef.current.ctx) {
        startAmbientAtmosphere();
      } else {
        // Smoothly adjust parameters
        const { ctx, oscSub, oscMod, lfo, filter } = ambientAtmosphereRef.current;
        if (ctx && ctx.state !== 'closed') {
          const now = ctx.currentTime;
          const score = oracleIntel ? getRarityScoreAndSettings(oracleIntel.rarity).score : 30;

          const subFreq = 35 + (score * 0.6);
          const modFreq = subFreq * 1.5;
          const filterCutoff = 80 + (score * 2.5);
          const lfoRate = 0.05 + (score * 0.015);

          if (oscSub) {
            oscSub.frequency.setTargetAtTime(subFreq, now, 0.2);
          }
          if (oscMod) {
            oscMod.frequency.setTargetAtTime(modFreq, now, 0.2);
          }
          if (lfo) {
            lfo.frequency.setTargetAtTime(lfoRate, now, 0.3);
          }
          if (filter) {
            filter.frequency.setTargetAtTime(filterCutoff, now, 0.25);
          }
          addLog(`MONITOR AUDIO // ATMOSPHERE AUTO-TUNED TO RARITY SCORE [${score}%] -> ${subFreq.toFixed(1)} HZ`);
        }
      }
    } else {
      // Stop if running or if data is unloaded
      if (ambientAtmosphereRef.current.ctx) {
        stopAmbientAtmosphere();
      }
    }
  }, [isAmbientAtmosphereEnabled, isMuted, oracleIntel, data]);

  // Handle dynamic mapping adjustments when sliders change
  useEffect(() => {
    const { ctx, osc1, osc2, filter } = ambientSynthRef.current;
    if (ctx && ctx.state !== 'closed') {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const baseFreq = 50 + (motionIntensity * 1.5);
      const detuneCents = spectralDistortion * 2;
      const filterCutoff = 130 + (spectralDistortion * 5.5);

      if (osc1) {
        osc1.frequency.setTargetAtTime(baseFreq, now, 0.1);
      }
      if (osc2) {
        osc2.frequency.setTargetAtTime(baseFreq, now, 0.1);
        osc2.detune.setTargetAtTime(detuneCents, now, 0.1);
      }
      if (filter) {
        filter.frequency.setTargetAtTime(filterCutoff, now, 0.15);
      }
    }
  }, [motionIntensity, spectralDistortion]);

  // Operational Pipeline handlers
  const downloadStill = () => {
    if (!data?.image) return;
    const link = document.createElement('a');
    link.download = `genesis-relic-${activeVariant}-${Date.now()}.png`;
    link.href = `data:${data.image.mimeType};base64,${data.image.base64}`;
    link.click();
    addLog("OPTIC STILL DOWNLOADED SUCCESSFULLY");
    if (oracleIntel) {
      addIntelToHistory(oracleIntel);
      addLog(`ORACLE AI // "${oracleIntel.name}" EXPORT RECORD ADDED`);
    }
  };

  const exportCineReel = () => {
    setIsCineExporting(true);
    addLog("INITIATING CINE-REEL FRAME PACKAGING...");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      addLog(`PACKAGING ENHANCED CINE-FRAMES // PROGRESS: ${progress}%`);
      if (progress >= 100) {
        clearInterval(interval);
        setIsCineExporting(false);
        
        const intelHeader = oracleIntel ? `ORACLE AI INTEL ENTRY [${oracleIntel.oracleId}]\n-----------------------------------------\n- Name: ${oracleIntel.name}\n- Class: ${oracleIntel.class}\n- Rarity: ${oracleIntel.rarity}\n- Origin: ${oracleIntel.origin}\n- Sig Hash: ${oracleIntel.hash}\n- Discovery Lore Snippet: ${oracleIntel.loreFragment || "Unknown"}\n=========================================\n` : '';
        
        const docContent = `GENESIS VERSE // CINE-REEL FRAME REGISTER SHEET\n=========================================\n${intelHeader}Reference Archetype: ${query || "Custom Relic"}\nCine-Reel Output: ${frameCount} Frames\nIntensity: ${motionIntensity}%\nDistortion Tuning: ${spectralDistortion}%\nCalibration ID: M-${Math.random().toString(36).substr(2, 9).toUpperCase()}\nTimestamp: ${new Date().toISOString()}`;
        const blob = new Blob([docContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `cine-reel-manifest-${Date.now()}.txt`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        addLog("CINE-REEL SPEC SHEET DOWNLOADED SUCCESSFULLY");
        if (oracleIntel) {
          addIntelToHistory(oracleIntel);
        }
      }
    }, 500);
  };

  const exportVariantSheet = () => {
    if (!data) return;
    const intelHeader = oracleIntel ? `
======================================================
ORACLE AI INTEL ENTRY [${oracleIntel.oracleId}]
------------------------------------------------------
- NAME: ${oracleIntel.name}
- CLASS: ${oracleIntel.class}
- RARITY: ${oracleIntel.rarity}
- ORIGIN: ${oracleIntel.origin}
- SIG HASH: ${oracleIntel.hash}
- LORE SNIPPET: ${oracleIntel.loreFragment || "Unknown"}
======================================================
` : '';

    const sheet = `GENESIS VERSE // CREATED VARIANT SPEC-matrix SHEET
======================================================
ORIGINAL RESOLENCE ARCHETYPE: ${query || "Interactive Gateway"}
TIMESTAMP: ${new Date().toISOString()}
${intelHeader}
[A] ORIGINAL SIGNAL COMPANION (Primary Matrix)
- Resonance: Original
- Transmission Clarity: 99.4%
- Core Depth Rating: 12.4 λ
- Custom Rune State: [Anchor]
- Render Ratio: 16:9

[B] DEEP ABYSS DEPLOYMENT COMPANION
- Resonance: Deep Abyss
- Transmission Clarity: 74.8%
- Core Depth Rating: 34.1 λ
- Custom Rune State: [Booster]
- Render Ratio: 16:9

[C] CHRONOS DECAY SYSTEM COMPANION
- Resonance: Chronos Decay
- Transmission Clarity: 62.1%
- Core Depth Rating: 51.0 λ
- Custom Rune State: [Glitch]
- Render Ratio: 16:9

[D] AETHER SHIMMER FLUID COMPANION
- Resonance: Aether Shimmer
- Transmission Clarity: 88.2%
- Core Depth Rating: 22.5 λ
- Custom Rune State: [Arcane]
- Render Ratio: 16:9

METADATA SIGNATURE ASSIGNED // ARCHIVIST HUB CONSOLE`;

    const blob = new Blob([sheet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `variant-matrix-sheet-${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addLog("VARIANT METRIC MATRIX SHEET EXPORTED");
    if (oracleIntel) {
      addIntelToHistory(oracleIntel);
    }
  };

  const downloadMetadata = () => {
    if (!data) return;
    const currentIntel = oracleIntel || generateOracleIntel(query, activeVariant);
    const meta = {
      compiler: "Genesis Verse: Augmented Image Console",
      userQuery: query || "Custom Gateways Archetype",
      signatureId: "atonyscott@gmail.com",
      timestamp: new Date().toISOString(),
      activeVariant,
      oracleIntel: currentIntel,
      calibrations: {
        motionIntensity,
        spectralDistortion,
        frameCount,
        scrubPosition,
        runes: runeStates
      },
      forgeDeployment: {
        id: forgeAssetId || "PENDING_REGISTRATION",
        deployed: !!forgeAssetId
      },
      marketListing: activeListing ? {
        status: "LIVE_ON_LEDGER",
        details: activeListing
      } : {
        status: "UNLISTED"
      },
      regionsDetected: data.analysis?.segments || []
    };
    
    const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `genesis-archive-meta-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addLog("METADATA CALIBRATION CONTAINER EXPORTED");
    addLog(`ORACLE AI // "${currentIntel.name}" INTEL ENCODED`);
    addIntelToHistory(currentIntel);
  };

  const exportForgeMtd = () => {
    if (!data) return;
    setIsExportingForge(true);
    addLog("SHUTTLED BUNDLE -> FORGE NETWORK ASSET LAYER...");
    
    setTimeout(() => {
      if (PROTOTYPE_MODE) {
        const generatedId = `F-PROTO-${Math.floor(100000 + Math.random() * 900000)}`;
        setForgeAssetId(generatedId);
        setIsExportingForge(false);
        addLog("EXPORT INTERCEPTED — PROTOTYPE MODE ACTIVE");
        addLog(`FORGE MTD // REGISTRY ID: ${generatedId}`);
      } else {
        const generatedId = `F-${Math.floor(100000 + Math.random() * 900000)}`;
        setForgeAssetId(generatedId);
        setIsExportingForge(false);
        addLog(`FORGE MTD: Asset Deployed // Registry ID: ${generatedId}`);
        addLog("METADATA STAMP & CREATOR IDENTITY SUCCESS-CONSIGNED");
      }
      if (oracleIntel) {
        addIntelToHistory(oracleIntel);
      }
    }, 1800);
  };

  const submitListing = (params: { price: string; currency: string; supply: string; unlockables: string; hasUnlockables: boolean; name: string; loreClass: string }) => {
    const listPriceCombined = `${params.price} $${params.currency}`;
    const generatedHash = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    
    if (PROTOTYPE_MODE) {
      addLog("DEPLOY INTERCEPTED — PROTOTYPE MODE ACTIVE");
      addLog("ABEX-GDEX // LISTING STAGED — AWAITING LIVE KEY AUTHORIZATION");
      setShowListingModal(false);
      return;
    }

    setActiveListing({
      price: listPriceCombined,
      supply: params.supply,
      unlockables: params.unlockables,
      hasUnlockables: params.hasUnlockables,
      txHash: generatedHash,
      listedAt: new Date().toLocaleTimeString(),
      name: params.name,
      loreClass: params.loreClass
    });
    
    setShowListingModal(false);
    addLog(`ABEX-GDEX: CONTRACT DEPLOYED // PRICE: ${listPriceCombined}`);
    addLog(`LISTING REGISTERED ON LEDGER // BLOCK-TX: ${generatedHash.substring(0, 10)}...`);
    if (oracleIntel) {
      addIntelToHistory(oracleIntel);
    }
  };

  // Command handlers
  const processImagePayload = async (imageObj: GeneratedImage, userQuery: string) => {
    setStatus('analyzing');
    addLog("SIGNAL CAPTURED // REGISTERED");
    addLog("AWAITING ANIMATION PULSE...");
    
    try {
      addLog("DECODING TOPOGRAPHY MATRIX...");
      const analysis = await analyzeImageRegions(userQuery, imageObj.base64);
      
      setData({ image: imageObj, analysis });
      setStatus('complete');
      addLog("DECODE COMPLETE // CHANNELS MAP LOADED");
      addLog("RIFT-SIGNAL DETECTED // PROTOCOL NOMINAL");
    } catch (err: any) {
      console.error(err);
      setData({ image: imageObj, analysis: null });
      setStatus('complete');
      setError("Topographic analysis partially failed, but relic loaded successfully.");
      addLog("CRITICAL: REGION SEARCH INTERCEPTED // FALLBACK CHANNELS ACTIVE");
    }
  };

  // Perform Gemini synthesis
  const commenceSynthesis = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setStatus('generating');
    setError(null);
    setFileWarning(null);
    setData(null);
    setActiveSegmentIndex(null);
    setIsAwakened(false);
    setActiveVariant('original');
    
    addLog(`COMMENCE SYNTHESIS FOR: "${searchQuery}"`);
    addLog("INITIATING RITUAL-APERTURE INTENSE LIGHTING SOURCE...");

    try {
      const image = await generateInfographic(searchQuery);
      await processImagePayload(image, searchQuery);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ritual gateway synthesis timed out. Try refining resonance keyword.');
      setStatus('idle');
      addLog("SYNTHESIS FAILURE // RITUAL BROKEN");
    }
  };

  const handleGenerateIconClick = async () => {
    if (!oracleIntel) return;
    
    // Set loading state in local memory
    setOracleIntel(prev => prev ? { ...prev, isGeneratingIcon: true } : null);
    addLog(`COMMENCE RELIC ICON SYNTHESIS FOR: "${oracleIntel.name}"`);
    addLog("HARNESSING SPECTRUM COAXIAL SOURCE VIA GEMINI ENGINE...");

    try {
      const generatedIcon = await generateRelicIcon(
        oracleIntel.loreFragment || "Ancient relic module",
        oracleIntel.name
      );

      setOracleIntel(prev => {
        if (!prev) return null;
        const updated = { ...prev, relicIcon: generatedIcon, isGeneratingIcon: false };
        // Update it in history if it exists too
        setIntelHistory(hPrev => {
          const updatedHistory = hPrev.map(item => item.oracleId === prev.oracleId ? updated : item);
          try {
            localStorage.setItem('oracle_intel_history', JSON.stringify(updatedHistory));
          } catch (e) {
            console.error(e);
          }
          return updatedHistory;
        });
        return updated;
      });

      addLog(`ICON SYNTHESIS METASTABLE // REGISTERED ICON FOR BLOCK: ${oracleIntel.oracleId}`);
    } catch (err: any) {
      console.error(err);
      setOracleIntel(prev => prev ? { ...prev, isGeneratingIcon: false } : null);
      addLog("ICON SYNTHESIS TIMEOUT // ENCOUNTERED ATMOSPHERIC RIFT INTERFERENCE");
    }
  };

  // Process user file drag-and-drop or select
  const processLocalFile = (file: File) => {
    setFileWarning(null);

    // If it's completely outside the image specification, reject it
    if (!file.type.startsWith('image/')) {
      const extension = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      setFileWarning(`CRITICAL SHIELD DENIAL: .${extension} format does not conform to optic constraints.`);
      setError("Specified signal does not conform to image/spectral criteria.");
      addLog(`INTERFACE DENIED // UNRECOGNIZED SIGNATURE: ${file.name}`);
      return;
    }

    // Explicit native formats validated for quantum high-fidelity spectral reconstruction
    const NATIVE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!NATIVE_FORMATS.includes(file.type)) {
      const formatLabel = file.type.split('/')[1]?.toUpperCase() || 'NON-STANDARD';
      setFileWarning(`RECONSTRUCTION DEGRADATION WARNING: [${formatLabel}] format is not natively aligned for spectral decoding.`);
      addLog(`WARNING // NON-ALIGNED CORE RESOLUTION DETECTED FOR: ${file.name}`);
    } else {
      setFileWarning(null);
    }

    setStatus('generating');
    setError(null);
    setData(null);
    setActiveSegmentIndex(null);
    setIsAwakened(false);
    setActiveVariant('original');
    
    addLog(`LOADING LOCAL SIGNAL // FILE: ${file.name}`);
    addLog(`OPTIC SIGNAL REGISTERED // FILE: ${file.name}`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Raw = e.target?.result as string;
        const base64Data = base64Raw.split(',')[1];
        
        const imageObj: GeneratedImage = {
          base64: base64Data,
          mimeType: file.type,
          groundingUrls: []
        };
        
        setData({ image: imageObj, analysis: null });
        
        const fileQuery = file.name.split('.')[0].replace(/[-_]/g, ' ') || "ancient ritual relic";
        await processImagePayload(imageObj, fileQuery);
      } catch (err: any) {
        console.error(err);
        setError("Decoding and parsing local file failed.");
        setStatus('idle');
        addLog("DECODE FAILED // CORRUPT APERTURE FILE");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commenceSynthesis(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    commenceSynthesis(suggestion);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLocalFile(file);
    }
  };

  const playMetallicHum = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const duration = 2.5; // Matches duration of pulse
      const now = ctx.currentTime;
      
      // Low Frequency Oscillator 1 (Warm resonant hum)
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(55, now); // ~A1 fundamental
      
      // Low Frequency Oscillator 2 (Beating detune)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(56.5, now); // Slightly higher for thick beating
      
      // Metallic Ring Exciter
      const oscMetal = ctx.createOscillator();
      oscMetal.type = "sine";
      oscMetal.frequency.setValueAtTime(165, now); // Metallic harmonic overtone
      
      // Lush Synth-Pad Layer (Auditory Feedback for visual distortion)
      const padOsc1 = ctx.createOscillator();
      padOsc1.type = "triangle"; // Warm, fundamental sound wave
      const padOsc2 = ctx.createOscillator();
      padOsc2.type = "sine"; // Harmonic resonance frequency
      const padOsc3 = ctx.createOscillator();
      padOsc3.type = "sine"; // High shimmer tone

      // Calculate base frequency scaled with rippleIntensity state
      const baseFreq = 110 + (rippleIntensity * 1.6); // Mapped frequency range [111.6Hz to 270Hz]
      const midFreq = baseFreq * 1.5;                 // Sweet perfect fifth
      const highFreq = baseFreq * 2.0;                // Octave shimmer

      padOsc1.frequency.setValueAtTime(baseFreq, now);
      padOsc2.frequency.setValueAtTime(midFreq, now);
      padOsc3.frequency.setValueAtTime(highFreq, now);

      // Pitch sweep: Ramp up the frequencies dynamically over the peak visual distortion duration
      const sweepMultiplier = 1.05 + (rippleIntensity / 100) * 0.95; // Higher intensities sweep up to 2x higher
      const peakBase = baseFreq * sweepMultiplier;
      const peakMid = midFreq * sweepMultiplier;
      const peakHigh = highFreq * sweepMultiplier;

      padOsc1.frequency.exponentialRampToValueAtTime(peakBase, now + 1.1);
      padOsc2.frequency.exponentialRampToValueAtTime(peakMid, now + 1.1);
      padOsc3.frequency.exponentialRampToValueAtTime(peakHigh, now + 1.1);

      // Gently drop frequency back down as the visual VEO-3 pulse subsides
      padOsc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, now + duration);
      padOsc2.frequency.exponentialRampToValueAtTime(midFreq * 1.05, now + duration);
      padOsc3.frequency.exponentialRampToValueAtTime(highFreq * 1.05, now + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(130, now); // Low cutoff to keep it deep
      filter.Q.setValueAtTime(5, now); // Resonant Q peak for hollow cabinet sound
      
      // Synth Pad Filter to sweep open alongside intensity increases
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(320, now);
      padFilter.frequency.exponentialRampToValueAtTime(600 + (rippleIntensity * 9.5), now + 1.1);
      padFilter.Q.setValueAtTime(1.8, now);

      const lowCut = ctx.createBiquadFilter();
      lowCut.type = "highpass";
      lowCut.frequency.setValueAtTime(35, now); // Keep speakers safe
      
      const gainOsc1 = ctx.createGain();
      const gainOsc2 = ctx.createGain();
      const gainMetal = ctx.createGain();
      const masterGain = ctx.createGain();
      
      gainOsc1.gain.setValueAtTime(0.55, now);
      gainOsc2.gain.setValueAtTime(0.40, now);
      gainMetal.gain.setValueAtTime(0.12, now);
      
      // Synth Pad discrete balance gains
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(0.03 + (rippleIntensity * 0.0007), now + 0.35); // Louder presence for intense waves
      padGain.gain.exponentialRampToValueAtTime(0.02 + (rippleIntensity * 0.0004), now + 1.1);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.15); // Fast smooth swell
      masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.20); // Decay after onset
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Smooth fade out
      
      // Wire components
      osc1.connect(gainOsc1);
      osc2.connect(gainOsc2);
      oscMetal.connect(gainMetal);
      
      gainOsc1.connect(filter);
      gainOsc2.connect(filter);
      gainMetal.connect(filter);
      
      // Wire Synth Pad
      padOsc1.connect(padGain);
      padOsc2.connect(padGain);
      padOsc3.connect(padGain);
      padGain.connect(padFilter);
      padFilter.connect(lowCut); // Route pad through lowCut for speaker protection

      filter.connect(lowCut);
      lowCut.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      // Trigger schedules
      osc1.start(now);
      osc2.start(now);
      oscMetal.start(now);
      padOsc1.start(now);
      padOsc2.start(now);
      padOsc3.start(now);
      
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      oscMetal.stop(now + duration + 0.1);
      padOsc1.stop(now + duration + 0.1);
      padOsc2.stop(now + duration + 0.1);
      padOsc3.stop(now + duration + 0.1);
    } catch (e) {
      console.warn("Audio Context error on pulse trigger:", e);
    }
  };

  const playRiftSoundEffect = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const duration = 1.8;
      const now = ctx.currentTime;
      
      // Carrier frequency: space tearing swoop
      const carrier = ctx.createOscillator();
      carrier.type = "sawtooth";
      carrier.frequency.setValueAtTime(650, now);
      carrier.frequency.exponentialRampToValueAtTime(75, now + 0.45);
      carrier.frequency.linearRampToValueAtTime(130, now + 1.2);
      
      // Modulator for frequency modulation (FM) to create metallic tear
      const modulator = ctx.createOscillator();
      modulator.type = "sine";
      modulator.frequency.setValueAtTime(260, now);
      modulator.frequency.exponentialRampToValueAtTime(920, now + 0.65);
      
      const modulatorGain = ctx.createGain();
      modulatorGain.gain.setValueAtTime(110, now);
      modulatorGain.gain.exponentialRampToValueAtTime(12, now + 1.25);
      
      // Sub base boom layer for rift stability
      const resonanceBase = ctx.createOscillator();
      resonanceBase.type = "triangle";
      resonanceBase.frequency.setValueAtTime(42, now);
      resonanceBase.frequency.linearRampToValueAtTime(28, now + 1.8);
      
      // Filter for rift sweeping
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.95);
      filter.Q.setValueAtTime(9, now);
      
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(450, now);
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.38, now + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.14, now + 0.85);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      const baseGain = ctx.createGain();
      baseGain.gain.setValueAtTime(0.001, now);
      baseGain.gain.linearRampToValueAtTime(0.42, now + 0.1);
      baseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);
      
      // Connect FM synthesis
      modulator.connect(modulatorGain);
      modulatorGain.connect(carrier.frequency);
      
      // Wire main tear
      carrier.connect(filter);
      filter.connect(masterGain);
      
      // Wire base rumble
      resonanceBase.connect(lowpass);
      lowpass.connect(baseGain);
      baseGain.connect(ctx.destination);
      
      // Connect tear to output
      masterGain.connect(ctx.destination);
      
      // Start/Stop
      carrier.start(now);
      modulator.start(now);
      resonanceBase.start(now);
      
      carrier.stop(now + duration + 0.1);
      modulator.stop(now + duration + 0.1);
      resonanceBase.stop(now + duration + 0.1);
    } catch (e) {
      console.warn("Audio Context error on rift burst:", e);
    }
  };

  const triggerCoaxialBurst = () => {
    if (isCoaxialBurstActive) return;
    setIsCoaxialBurstActive(true);
    addLog("⚡ COAXIAL FIELD INJECTED // HIGH-FREQUENCY COAXIAL BURST RUNNING");
    
    playRiftSoundEffect();
    
    // Temporarily increase deep visual jitter we set isGlitching
    setIsGlitching(true);
    
    setTimeout(() => {
      setIsCoaxialBurstActive(false);
      setIsGlitching(false);
      addLog("✔ COAXIAL FIELD DISSIPATED // TEMPORAL RIFT BALANCED");
    }, 1800);
  };

  const triggerPulse = () => {
    if (!data) return;
    setIsPlayingPulse(true);
    setIsGlitching(true);
    addLog("VEO-3 PULSE SEQUENCE INITIATED");
    playMetallicHum();
    
    setTimeout(() => {
      setIsGlitching(false);
    }, 1200);
  };

  const toggleRune = (rune: string) => {
    setRuneStates(prev => {
      const next = { ...prev, [rune]: !prev[rune] };
      addLog(`RUNE MODIFIED: [${rune.toUpperCase()}] -> ${next[rune] ? 'ONLINE' : 'OFFLINE'}`);
      return next;
    });
  };

  const handleReset = () => {
    setData(null);
    setStatus('idle');
    setQuery('');
    setError(null);
    setFileWarning(null);
    setIsAwakened(false);
    setActiveVariant('original');
    setActiveSegmentIndex(null);
    setLogs(TERMINAL_LOGS_INITIAL);
  };

  // Drag-and-drop body triggers
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLocalFile(file);
    }
  };

  // Define curated variant stats for the Variant Forge
  const getVariantStats = (variant: string) => {
    switch (variant) {
      case 'original':
        return { clarity: "99.4%", depth: "12.4 λ", mythic: "9.2/10" };
      case 'abyss':
        return { clarity: "74.8%", depth: "34.1 λ", mythic: "9.6/10" };
      case 'chronos':
        return { clarity: "62.1%", depth: "51.0 λ", mythic: "9.9/10" };
      case 'aether':
        return { clarity: "88.2%", depth: "22.5 λ", mythic: "9.5/10" };
      default:
        return { clarity: "90%", depth: "10 λ", mythic: "9.0/10" };
    }
  };

  // Define helper to get proportional rarity score and speed settings for heartbeat
  const getRarityScoreAndSettings = (rarityStr?: string) => {
    if (!rarityStr) return { score: 10, duration: 2.2, bpm: 27, hz: 0.45 };
    
    const r = rarityStr.toUpperCase();
    let score = 20;

    if (r.includes('MYTHIC')) {
      score = 100;
    } else if (r.includes('OMEGA') || r.includes('NON-EUCLIDEAN') || r.includes('ASTRAL')) {
      score = 90;
    } else if (r.includes('FORBIDDEN') || r.includes('ARCHETYPE')) {
      score = 80;
    } else if (r.includes('S-GRADE')) {
      score = 70;
    } else if (r.includes('PARADOXICAL') || r.includes('COSMIC')) {
      score = 60;
    } else if (r.includes('PRIMORDIAL')) {
      score = 50;
    } else if (r.includes('SOVEREIGN')) {
      score = 40;
    } else if (r.includes('LEGENDARY') || r.includes('ANOMALOUS')) {
      score = 30;
    }

    // Proportional formula: duration decreases linearly down to 0.35s at score 100
    // At score 10 (or idle helper), duration is 2.2s
    // At score 100, duration is Math.max(0.35, 2.2 - (score / 100) * 1.85) = 0.35s
    const duration = Math.max(0.35, 2.2 - (score / 100) * 1.85);
    const bpm = Math.round(60 / duration);
    const hz = parseFloat((1 / duration).toFixed(2));

    return { score, duration, bpm, hz };
  };

  return (
    <div 
      className={`h-screen w-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden flex flex-col relative transition-transform duration-300 ${
        isGlitching ? 'scale-[0.99] rotate-[0.2deg] filter brightness-125' : 'scale-100'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Cinematic Ambient Background Fog */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00f2fe]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#9b51e0]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-blue-950/5 rounded-full blur-[160px] pointer-events-none" />
      </div>

      {/* Viewport CRT Scanline & Granular Noise Layer */}
      {crtScanline && (
        <>
          <div 
            className="crt-analog-noise transition-all duration-75" 
            style={{
              opacity: (0.015 + (rippleIntensity / 100) * 0.075) * (isPlayingPulse ? pulseModulator : 1.0)
            }}
          />
          <div 
            className="crt-line-sweeper transition-all duration-75" 
            style={{
              opacity: isPlayingPulse ? 0.15 + (pulseModulator * 0.15) : 0.25
            }}
          />
        </>
      )}

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-cyan-400 m-4 rounded-2xl"
          >
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <div className="absolute inset-0 border-2 border-brand-cyan rounded-full rotate-clockwise" />
              <div className="absolute inset-4 border border-dashed border-purple-500 rounded-full rotate-counter" />
              <Upload className="w-16 h-16 text-cyan-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-serif glow-cyan mb-2">ENGAGE CHAMBER INTAKE</h3>
            <p className="text-gray-400 font-mono tracking-widest text-xs uppercase text-center max-w-sm">
              Release signal file to capture visual topography onto the console.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentScreen === 'landing' ? (
          <HeroLandingPage 
            key="landing-page" 
            onEnter={() => {
              setCurrentScreen('forge-viewer');
              addLog("SYSTEM // NEURAL COMM LINK INITIALIZED. ACCESS DIRECTLY GRANTED.");
            }} 
          />
        ) : currentScreen === 'forge-viewer' ? (
          <AshPilotForgeViewer
            key="forge-viewer-screen"
            onBackToConsole={() => {
              setCurrentScreen('terminal');
              addLog("SYSTEM // SWITCHING TO MAIN TERMINAL SCANNER CONSOLE.");
            }}
            addLog={addLog}
            addToast={addToast}
          />
        ) : (
          <motion.div 
            key="console-viewport"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full h-full flex flex-col p-4 md:p-6 overflow-hidden"
          >
        
        {/* Main Terminal Bar Header */}
        <header className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-4 gap-3">
          <div className="flex items-center gap-3">
            {/* Oracle Signal High-Tech Abstract Logo */}
            <motion.div 
              className="relative group shrink-0 cursor-pointer"
              animate={{
                scale: [1, 1.06 + (getRarityScoreAndSettings(oracleIntel?.rarity).score / 100) * 0.08, 0.98, 1.08 + (getRarityScoreAndSettings(oracleIntel?.rarity).score / 100) * 0.1, 1],
                filter: isAnomalousEventActive ? [
                  "drop-shadow(0 0 4px rgba(239,68,68,0.25))",
                  "drop-shadow(0 0 20px rgba(239,68,68,0.9))",
                  "drop-shadow(0 0 6px rgba(239,68,68,0.4))",
                  "drop-shadow(0 0 28px rgba(239,68,68,1.0))",
                  "drop-shadow(0 0 4px rgba(239,68,68,0.25))"
                ] : oracleIntel ? [
                  "drop-shadow(0 0 3px rgba(6,182,212,0.2))",
                  "drop-shadow(0 0 14px rgba(6,182,212,0.7))",
                  "drop-shadow(0 0 5px rgba(168,85,247,0.3))",
                  "drop-shadow(0 0 18px rgba(168,85,247,0.85))",
                  "drop-shadow(0 0 3px rgba(6,182,212,0.2))"
                ] : [
                  "drop-shadow(0 0 3px rgba(168,85,247,0.15))",
                  "drop-shadow(0 0 8px rgba(168,85,247,0.4))",
                  "drop-shadow(0 0 4px rgba(99,102,241,0.2))",
                  "drop-shadow(0 0 10px rgba(99,102,241,0.5))",
                  "drop-shadow(0 0 3px rgba(168,85,247,0.15))"
                ]
              }}
              transition={{
                duration: getRarityScoreAndSettings(oracleIntel?.rarity).duration,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.28, 0.45, 1]
              }}
              onClick={() => {
                if (oracleIntel) {
                  const element = document.getElementById('anomalous-event-card') || document.getElementById('intel-details-panel');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    addLog("🎯 LOGO QUICKNAV // REDIRECTING TO ANALYTICAL VIEWPORT");
                  }
                }
              }}
            >
              {/* Pulsing backdrop ring of light */}
              <motion.div 
                className={`absolute -inset-1 rounded-full bg-gradient-to-r filter blur-sm group-hover:opacity-100 transition-opacity duration-500 ${
                  isAnomalousEventActive 
                    ? "from-red-600 via-rose-500 to-amber-500 opacity-95 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                    : oracleIntel
                      ? "from-cyan-500 via-purple-500 to-indigo-500 opacity-80"
                      : "from-purple-600/60 via-cyan-500/50 to-indigo-600/60 opacity-50"
                }`}
                animate={{
                  opacity: isAnomalousEventActive ? [0.8, 1, 0.8, 1, 0.8] : oracleIntel ? [0.6, 0.9, 0.6, 0.9, 0.6] : [0.4, 0.6, 0.4, 0.6, 0.4],
                  scale: isAnomalousEventActive ? [1, 1.25, 1.05, 1.32, 1] : oracleIntel ? [1, 1.15, 1.02, 1.2, 1] : [1, 1.08, 1.0, 1.12, 1]
                }}
                transition={{
                  duration: getRarityScoreAndSettings(oracleIntel?.rarity).duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.28, 0.45, 1]
                }}
              />
              <div className={`relative w-11 h-11 rounded-full overflow-hidden bg-black flex items-center justify-center transition-all duration-300 ${
                isAnomalousEventActive 
                  ? "border-2 border-red-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" 
                  : oracleIntel
                    ? "border-2 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              }`}>
                <img 
                  src="/src/assets/images/oracle_signal_logo_1781038362760.png" 
                  alt="Oracle Signal Logo" 
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    oracleIntel ? "scale-105 saturate-125 brightness-110" : "group-hover:scale-110"
                  }`}
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Micro tech overlay indicators with anomalous threat reactivity */}
              <div className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-black animate-ping transition-colors duration-300 ${
                isAnomalousEventActive ? "bg-red-500" : oracleIntel ? "bg-cyan-400" : "bg-purple-500"
              }`} />
              <div className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-black transition-colors duration-300 ${
                isAnomalousEventActive ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : oracleIntel ? "bg-cyan-400 shadow-[0_0_4px_#22d3ee]" : "bg-purple-500"
              }`} />
            </motion.div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm animate-pulse" />
                <h1 className="text-lg font-serif font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                  GENESIS VERSE //
                </h1>
                <span className="text-xs font-mono font-medium text-gray-400 tracking-[0.3em] uppercase">
                  Augmented Image Console
                </span>
              </div>
              
              {/* Context/Siren status log text */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] text-purple-400 font-mono font-bold tracking-wider uppercase">
                  ORACLE SIGNAL NODE
                </span>
                <span className="text-zinc-650 font-mono text-[9px]">•</span>
                <span className="text-[10px] text-zinc-500 font-mono font-semibold tracking-wider flex items-center gap-1">
                  STATUS:
                  <span className="text-brand-cyan glow-cyan uppercase font-bold">
                    {status === 'complete' ? 'Rift-Signal Detected' : status === 'analyzing' ? 'Awaiting Animation Signal' : 'Awaiting Siren Input…'}
                  </span>
                </span>
                <span className="text-zinc-650 font-mono text-[9px]">•</span>
                <span className="text-[10px] text-zinc-500 font-mono font-semibold tracking-wider">
                  {isAwakened ? 'Guardian Protocol Online' : 'Cine-Reel Mode Enabled'}
                </span>
                {oracleIntel && (
                  <>
                    <span className="text-zinc-650 font-mono text-[9px]">•</span>
                    <span className="text-[10px] text-zinc-500 font-mono font-semibold tracking-wider flex items-center gap-1">
                      HEARTBEAT:
                      <span className={`${isAnomalousEventActive ? "text-red-400 glow-red animate-ping" : "text-brand-cyan glow-cyan"} uppercase font-bold`}>
                        {getRarityScoreAndSettings(oracleIntel.rarity).bpm} BPM ({getRarityScoreAndSettings(oracleIntel.rarity).hz} Hz)
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Master Audio Mute/Unmute Toggle */}
            <button
              onClick={toggleMute}
              className={`px-3 py-1.5 rounded font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 cursor-pointer transition-all duration-200 border ${
                isMuted 
                  ? "bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-950/40 hover:border-red-500/50" 
                  : "bg-zinc-950/80 border-purple-500/20 text-purple-300 hover:bg-purple-950/20 hover:border-purple-500/40"
              }`}
              title={isMuted ? "Unmute VEO-3 resonance hum & pulse" : "Mute VEO-3 resonance hum & pulse"}
            >
              {isMuted ? (
                <>
                  <VolumeX size={12} className="text-red-400 animate-pulse" />
                  <span>Resonance [Muted]</span>
                </>
              ) : (
                <>
                  <Volume2 size={12} className="text-purple-400" />
                  <span>Resonance [Live]</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsLoreDictOpen(true);
                addLog("ACCESSING ABYSSUM LORE GLOSSARY");
              }}
              className={`px-3 py-1.5 rounded font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 cursor-pointer transition-all duration-200 border ${
                isLoreDictOpen
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-black"
                  : "bg-zinc-950/80 border-amber-900/20 text-amber-500/80 hover:text-amber-400 hover:border-amber-500/35 hover:bg-amber-950/20"
              }`}
              title="Open Abyssum Lore Glossary"
            >
              <BookOpen size={12} className={isLoreDictOpen ? "text-amber-400 animate-pulse" : "text-amber-500/70"} />
              <span>Lore Glossary</span>
            </button>

            <button
              onClick={() => {
                setCurrentScreen('forge-viewer');
                addLog("ACCESSING ACTIVE ASH PILOT FORGE COCKPIT");
              }}
              className="px-3 py-1.5 bg-zinc-950/80 border border-amber-500/20 text-amber-500/90 hover:text-amber-400 hover:border-amber-500/45 hover:bg-amber-950/15 rounded font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 cursor-pointer transition-all duration-200"
              title="Switch to Ash Pilot Forge Cockpit"
            >
              <Flame size={12} className="text-amber-500 animate-pulse" />
              <span>Forge Cockpit</span>
            </button>

            <div className="px-3 py-1.5 bg-zinc-950/85 border border-brand-cyan/20 rounded font-mono text-[9px] text-zinc-400 tracking-[0.2em] flex items-center gap-1.5 uppercase">
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-pulse" />
              GENESIS REGISTRY
            </div>
            {status !== 'idle' && (
              <button 
                onClick={handleReset} 
                className="px-4 py-1.5 bg-black/50 hover:bg-zinc-900 border border-white/10 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300 rounded-md flex items-center gap-2 transition-all hover:border-cyan-500/50 hover:text-white"
              >
                <RefreshCw size={11} className="animate-spin-slow" /> New Scan Target
              </button>
            )}
          </div>
        </header>

        {/* Master Console Container */}
        <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row gap-5 overflow-hidden">
          
          {/* ==========================================
              LEFT COLUMN: Control Rig (25% - 30%)
             ========================================== */}
          <div className="w-full lg:w-[28%] flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-1 no-scrollbar shrink-0">
            
            {/* Image Intake Chamber (Idle & Small Active Layout) */}
            <div className={`glass-panel rounded-xl p-5 flex flex-col relative shrink-0 ${divineRolloutOpen ? 'z-30 overflow-visible' : 'z-10 overflow-hidden'}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Image Intake Chamber
                </h2>
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>

              {/* EXPLICIT SPECTRAL DECODING FILE VALIDATION BANNERS */}
              {fileWarning && (
                <div className="mb-4 p-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-lg text-[9.5px] font-mono leading-relaxed text-amber-300 flex items-start gap-2 shadow-inner animate-pulse">
                  <AlertTriangle size={15} className="shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-400 uppercase tracking-wider text-[10px] mb-0.5">Optic Interface Warning</span>
                    {fileWarning}
                  </div>
                </div>
              )}

              {/* RITUAL APERTURE CIRCULAR DROP ZONE */}
              {(status === 'idle' || !data) ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-zinc-800 rounded-lg hover:border-cyan-500/50 transition-colors group/aperture relative">
                  
                  {/* Glowing Ritual Rings overlay */}
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4 cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="absolute inset-0 rounded-full border border-dashed border-zinc-700/60 rotate-clockwise group-hover/aperture:border-cyan-500/40" />
                    <div className="absolute inset-2 rounded-full border border-zinc-800/80 rotate-counter group-hover/aperture:border-purple-500/40" />
                    <div className="absolute inset-4 rounded-full bg-zinc-950/90 border border-white/5 flex items-center justify-center group-hover/aperture:border-cyan-500/30">
                      <Upload className="w-7 h-7 text-zinc-500 group-hover/aperture:text-brand-cyan group-hover/aperture:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-mono font-medium tracking-wider text-gray-300">
                      DRAG RELIC IMAGE OR CLICK
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
                      Accepts standard optic file formats
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="w-12 h-12 rounded border border-white/10 overflow-hidden relative shrink-0">
                    <img 
                      src={`data:${data.image.mimeType};base64,${data.image.base64}`} 
                      alt="Thumbnail relic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest truncate">
                      SIGNAL CAPTURED
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500 truncate">
                      {data.image.mimeType} // {Math.round(data.image.base64.length / 1024)} KB
                    </p>
                    {/* Re-upload interface */}
                    <label className="text-[8px] font-mono text-purple-400 hover:text-white cursor-pointer uppercase tracking-wider block mt-0.5">
                      Change optic file
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Siren Resonance Synthesizer (Creation input prompt) */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                    Create / Forge Divine Element:
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Ritual Gate in a Flooded Cave"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                    />
                    <button 
                      type="submit" 
                      disabled={!query.trim() || status === 'generating'}
                      className="absolute right-1.5 top-1.5 text-zinc-500 hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                  
                  {status === 'idle' && (
                    <div className="flex flex-wrap gap-1.5 mt-2 items-center relative">
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSuggestionClick(s)}
                          className="px-2 py-0.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 text-[9px] font-mono text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                        >
                          + {s}
                        </button>
                      ))}

                      {/* Divine rollout menu toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDivineRolloutOpen(!divineRolloutOpen)}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 transition-all border cursor-pointer ${
                            divineRolloutOpen 
                              ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]" 
                              : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-cyan-500/30"
                          }`}
                        >
                          <span>More Presets</span>
                          <span className="text-[7px] transition-transform duration-200 inline-block" style={{ transform: divineRolloutOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                        </button>

                        <AnimatePresence>
                          {divineRolloutOpen && (
                            <>
                              {/* Backdrop click closer handler */}
                              <div 
                                className="fixed inset-0 z-40 cursor-default" 
                                onClick={() => setDivineRolloutOpen(false)} 
                              />
                              
                              <motion.div 
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 15, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="fixed right-6 top-[160px] md:top-[180px] w-56 bg-zinc-950/95 border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] z-50 py-2.5 font-mono text-[9px] flex flex-col gap-0.5 overflow-hidden"
                              >
                                <div className="px-3 py-1 text-[7.5px] text-cyan-400 font-bold uppercase tracking-wider border-b border-cyan-500/20 mb-1 select-none flex items-center justify-between">
                                  <span>DIVINE RECONSTRUCT PRESETS</span>
                                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                </div>
                                {ROLLOUT_SUGGESTIONS.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      handleSuggestionClick(s);
                                      setDivineRolloutOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/20 hover:text-cyan-300 text-zinc-400 flex items-center justify-between transition-colors border-0 bg-transparent cursor-pointer"
                                  >
                                    <span>{s}</span>
                                    <span className="text-zinc-650 hover:text-cyan-400 text-[8px] font-bold">FORGE // +</span>
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </form>
              </div>

            </div>

            {/* Animation Pulse Engine */}
            <div className={`glass-panel rounded-xl p-5 flex flex-col relative transition-opacity shrink-0 ${!data ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2">
                  <Sliders size={12} className="text-cyan-400" />
                  Animation Pulse Engine
                </h2>
                <span className="text-[9px] font-mono text-zinc-500">SYS.VEO</span>
              </div>

              {/* Sliders Pack */}
              <div className="flex flex-col gap-4">
                
                {/* Sliders 1: Intensity */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400 uppercase tracking-wider">Motion Intensity</span>
                    <span className="text-brand-cyan">{motionIntensity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={motionIntensity}
                    onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Sliders 2: Spectral Distortion */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400 uppercase tracking-wider">Spectral Distortion</span>
                    <span className="text-purple-450">{spectralDistortion}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={spectralDistortion}
                    onChange={(e) => setSpectralDistortion(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>

                {/* Sliders 3: Frame Rate */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400 uppercase tracking-wider">Cine-Reel Frames</span>
                    <span className="text-zinc-100">{frameCount} FPS</span>
                  </div>
                  <input 
                    type="range" 
                    min="12" 
                    max="60" 
                    value={frameCount}
                    onChange={(e) => setFrameCount(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Sliders 4: Ripple Controls */}
                <div className="flex flex-col gap-3">
                  {/* Ripple Intensity */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400 uppercase tracking-wider">Ripple Intensity</span>
                      <span className="text-cyan-400">{rippleIntensity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      id="ripple-intensity-slider"
                      value={rippleIntensity}
                      onChange={(e) => setRippleIntensity(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 mt-0.5">
                      <span className="uppercase tracking-wider">Displacement Depth</span>
                      <span 
                        className={`transition-all duration-75 ${isPlayingPulse ? "text-cyan-300 font-bold glow-cyan" : "text-zinc-400"}`}
                        style={isPlayingPulse ? { transform: `scale(${0.9 + pulseModulator * 0.1})`, transformOrigin: 'right center', display: 'inline-block' } : undefined}
                      >
                        {(rippleIntensity * 0.08 * pulseModulator).toFixed(2)} nm
                      </span>
                    </div>
                  </div>

                  {/* Ripple Frequency */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400 uppercase tracking-wider">Ripple Frequency</span>
                      <span className="text-cyan-400">{rippleFrequency} Hz</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      id="ripple-frequency-slider"
                      value={rippleFrequency}
                      onChange={(e) => setRippleFrequency(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 mt-0.5">
                      <span className="uppercase tracking-wider">Oscillation Rate</span>
                      <span className="text-zinc-400">{(150 / Math.max(1, rippleFrequency)).toFixed(2)} s/cycle</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Runic Mechanical Toggles Switches */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <motion.button 
                  onClick={() => toggleRune('anchor')} 
                  whileHover="hover"
                  initial="rest"
                  className={`px-3 py-2 rounded-lg border font-mono text-[9px] text-left uppercase tracking-wider transition-all flex items-center justify-between relative overflow-hidden cursor-pointer ${
                    runeStates['anchor'] 
                      ? 'border-cyan-500/50 bg-cyan-950/10 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.1)]' 
                      : 'border-zinc-800 bg-black/60 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {/* Floating Aura */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0, scale: 0.6, y: 15, x: 10 },
                      hover: { opacity: 0.4, scale: 1.4, y: [0, -10, 0], x: [0, 5, 0] }
                    }}
                    transition={{
                      rest: { duration: 0.3 },
                      hover: {
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                        y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                        x: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }
                    }}
                    className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-cyan-500/40 blur-md pointer-events-none"
                  />
                  {/* Glowing background fade */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0 },
                      hover: { opacity: 0.15 }
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-cyan-500/30 pointer-events-none"
                  />
                  <span className="relative z-10">Chrono Anchor</span>
                  <span className="text-[10px] relative z-10">{runeStates['anchor'] ? '☼' : '☾'}</span>
                </motion.button>

                <motion.button 
                  onClick={() => toggleRune('booster')} 
                  whileHover="hover"
                  initial="rest"
                  className={`px-3 py-2 rounded-lg border font-mono text-[9px] text-left uppercase tracking-wider transition-all flex items-center justify-between relative overflow-hidden cursor-pointer ${
                    runeStates['booster'] 
                      ? 'border-purple-500/50 bg-purple-950/10 text-purple-300 shadow-[0_0_10px_rgba(155,81,224,0.1)]' 
                      : 'border-zinc-800 bg-black/60 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {/* Floating Aura */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0, scale: 0.6, y: 15, x: 10 },
                      hover: { opacity: 0.4, scale: 1.4, y: [0, -10, 0], x: [0, 5, 0] }
                    }}
                    transition={{
                      rest: { duration: 0.3 },
                      hover: {
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                        y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                        x: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }
                    }}
                    className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-purple-500/40 blur-md pointer-events-none"
                  />
                  {/* Glowing background fade */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0 },
                      hover: { opacity: 0.15 }
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-purple-500/30 pointer-events-none"
                  />
                  <span className="relative z-10">Rift Booster</span>
                  <span className="text-[10px] relative z-10">{runeStates['booster'] ? '⌬' : '⏧'}</span>
                </motion.button>

                <motion.button 
                  onClick={() => toggleRune('glitch')} 
                  whileHover="hover"
                  initial="rest"
                  className={`px-3 py-2 rounded-lg border font-mono text-[9px] text-left uppercase tracking-wider transition-all flex items-center justify-between relative overflow-hidden cursor-pointer ${
                    runeStates['glitch'] 
                      ? 'border-cyan-500/50 bg-cyan-950/10 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.1)]' 
                      : 'border-zinc-800 bg-black/60 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {/* Floating Aura */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0, scale: 0.6, y: 15, x: 10 },
                      hover: { opacity: 0.4, scale: 1.4, y: [0, -10, 0], x: [0, 5, 0] }
                    }}
                    transition={{
                      rest: { duration: 0.3 },
                      hover: {
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                        y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                        x: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }
                    }}
                    className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-cyan-500/40 blur-md pointer-events-none"
                  />
                  {/* Glowing background fade */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0 },
                      hover: { opacity: 0.15 }
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-cyan-500/30 pointer-events-none"
                  />
                  <span className="relative z-10">Glitch Synth</span>
                  <span className="text-[10px] relative z-10">{runeStates['glitch'] ? '֎' : '⊛'}</span>
                </motion.button>

                <motion.button 
                  onClick={() => toggleRune('arcane')} 
                  whileHover="hover"
                  initial="rest"
                  className={`px-3 py-2 rounded-lg border font-mono text-[9px] text-left uppercase tracking-wider transition-all flex items-center justify-between relative overflow-hidden cursor-pointer ${
                    runeStates['arcane'] 
                      ? 'border-purple-500/50 bg-purple-950/10 text-purple-300 shadow-[0_0_10px_rgba(155,81,224,0.1)]' 
                      : 'border-zinc-800 bg-black/60 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {/* Floating Aura */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0, scale: 0.6, y: 15, x: 10 },
                      hover: { opacity: 0.4, scale: 1.4, y: [0, -10, 0], x: [0, 5, 0] }
                    }}
                    transition={{
                      rest: { duration: 0.3 },
                      hover: {
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                        y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                        x: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }
                    }}
                    className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-purple-500/40 blur-md pointer-events-none"
                  />
                  {/* Glowing background fade */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0 },
                      hover: { opacity: 0.15 }
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-purple-500/30 pointer-events-none"
                  />
                  <span className="relative z-10">Emanant Filter</span>
                  <span className="text-[10px] relative z-10">{runeStates['arcane'] ? '☬' : '☫'}</span>
                </motion.button>
              </div>

              {/* VEO-3 Pulse Big Glowing Button */}
              <button 
                onClick={triggerPulse}
                disabled={isPlayingPulse}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-cyan-500/20 hover:from-cyan-500/35 hover:via-purple-600/35 hover:to-cyan-500/35 border border-cyan-400/30 text-xs font-mono font-bold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 hover:border-cyan-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-cyan-100 flex items-center justify-center gap-2"
              >
                <Zap size={13} className={isPlayingPulse ? "animate-bounce" : "animate-pulse"} />
                {isPlayingPulse ? "PULSING RELIC..." : "AWAITING VEO-3 PULSE"}
              </button>

              {/* High-Frequency Coaxial Burst Button */}
              <button 
                onClick={triggerCoaxialBurst}
                disabled={isCoaxialBurstActive || !data}
                className={`mt-2.5 w-full py-2.5 border text-xs font-mono font-bold uppercase tracking-[0.15em] rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer ${
                  isCoaxialBurstActive 
                    ? "bg-rose-950/45 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)] animate-pulse" 
                    : "bg-black/60 hover:bg-rose-950/20 border-zinc-800 hover:border-rose-500/50 text-zinc-400 hover:text-rose-300"
                }`}
              >
                <Flame size={13} className={isCoaxialBurstActive ? "animate-bounce text-rose-450" : "text-zinc-550 group-hover:text-rose-400"} />
                {isCoaxialBurstActive ? "COAXIAL BURST RUNNING..." : "HIGH-FREQUENCY COAXIAL BURST"}
              </button>

              {/* Real-time Audio Waveform Spectral Oscilloscope */}
              <AudioVisualizer analyserNode={analyserNode} motionIntensity={motionIntensity} isAwakened={isAwakened} />

            </div>

          </div>

          {/* ==========================================
              CENTER COLUMN: Preview & Scruber (47%)
             ========================================== */}
          <div className="flex-1 flex flex-col justify-between items-center overflow-hidden">
            
            {/* Viewport Core Frame */}
            <div 
              ref={viewportRef}
              className={`w-full flex-1 flex flex-col justify-center items-center relative overflow-hidden transition-all duration-300 ${
                isFullscreen 
                  ? 'bg-zinc-950 text-white w-screen h-screen p-6 md:p-12 z-50 rounded-none' 
                  : 'bg-gradient-to-br from-[#12161b] via-[#0b0d10] to-[#050607] border-2 border-[#54402a]/65 shadow-[inset_0_4px_24px_rgba(0,0,0,0.95),0_15px_45px_rgba(0,0,0,0.9)] p-4 md:p-6 rounded-lg'
              } ${signalOverride ? 'chromatic-aberration-active font-mono' : ''}`}
            >
              {/* Subtle metallic linear pattern overlay for brushed steel feel */}
              {!isFullscreen && (
                <>
                  {/* Horizontally brushed steel simulation */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none mix-blend-overlay opacity-90 z-0" />
                  {/* Subtle steel-grain noise or faint radial glow highlight in center */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
                  
                  {/* Industrial Brushed Bronze / Brass Corner Brackets & Mounting Rivets */}
                  {/* Top-Left Bracket */}
                  <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none border-t border-l border-[#c5a059]/40 rounded-tl-sm flex items-center justify-center z-10">
                    <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-650 border border-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
                      <div className="w-[3px] h-[0.5px] bg-zinc-950" />
                    </div>
                  </div>
                  {/* Top-Right Bracket */}
                  <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t border-r border-[#c5a059]/40 rounded-tr-sm flex items-center justify-center z-10">
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-650 border border-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
                      <div className="w-[3px] h-[0.5px] bg-zinc-950 rotate-45" />
                    </div>
                  </div>
                  {/* Bottom-Left Bracket */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b border-l border-[#c5a059]/40 rounded-bl-sm flex items-center justify-center z-10">
                    <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-650 border border-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
                      <div className="w-[3px] h-[0.5px] bg-zinc-950 -rotate-45" />
                    </div>
                  </div>
                  {/* Bottom-Right Bracket */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none border-b border-r border-[#c5a059]/40 rounded-br-sm flex items-center justify-center z-10">
                    <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-650 border border-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
                      <div className="w-[3px] h-[0.5px] bg-zinc-950 rotate-90" />
                    </div>
                  </div>
                  
                  {/* Heavy Beveled Metallic Edge Line Highlights */}
                  <div className="absolute inset-x-8 top-[1px] h-[1px] bg-gradient-to-r from-transparent via-[#c5a059]/25 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-x-8 bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-[#c5a059]/25 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-y-8 left-[1px] w-[1px] bg-gradient-to-b from-transparent via-[#c5a059]/25 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-y-8 right-[1px] w-[1px] bg-gradient-to-b from-transparent via-[#c5a059]/25 to-transparent pointer-events-none z-10" />
                  
                  {/* Steel Plate Engraving Text */}
                  <div className="absolute bottom-1 right-8 text-[5.5px] font-mono text-stone-600/70 tracking-widest uppercase pointer-events-none select-none z-10">
                    SPEC-MODEL: MTD-9 FREIGHT // STEEL PATENT CHASSIS
                  </div>
                  <div className="absolute bottom-1 left-8 text-[5.5px] font-mono text-stone-600/70 tracking-widest uppercase pointer-events-none select-none z-10">
                    CONDUIT_STABILIZER: ACTIVE
                  </div>
                </>
              )}
              
              {/* Absolute View Toggle Header Bar */}
              {data && (status === 'complete' || status === 'analyzing') && (
                <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center bg-black/85 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg shadow-lg">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping" />
                    Viewport Coordinate System
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-950 p-0.5 rounded border border-zinc-805 gap-1">
                      <button
                        onClick={() => {
                          setIsRepairBayMode(false);
                          setIsTripo3dMode(false);
                        }}
                        className={`px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded text-center transition-all cursor-pointer font-bold ${
                          (!isRepairBayMode && !isTripo3dMode)
                            ? 'bg-brand-cyan text-black' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        2D Hologram View
                      </button>
                      <button
                        onClick={() => {
                          setIsRepairBayMode(false);
                          setIsTripo3dMode(true);
                          addLog("INITIALIZING 3D WIREFRAME MESH IN VIEWPORT");
                          if (PROTOTYPE_MODE) {
                            addLog("MESH QUEUE STAGED — TRIPO GATEWAY OFFLINE IN PROTOTYPE MODE");
                          }
                        }}
                        className={`px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded text-center transition-all cursor-pointer font-bold ${
                          (!isRepairBayMode && isTripo3dMode)
                            ? 'bg-purple-600 text-white' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        3D Tripo-Mesh
                      </button>
                      <button
                        onClick={() => {
                          setIsRepairBayMode(true);
                          addLog("LAUNCHING MTD TRAIN ESCORT SYSTEM PREVIEW");
                        }}
                        className={`px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded text-center transition-all cursor-pointer font-bold ${
                          isRepairBayMode
                            ? 'bg-emerald-600 text-white animate-pulse' 
                            : 'text-zinc-500 hover:text-emerald-450'
                        }`}
                      >
                        🚂 MTD Train Escort
                      </button>
                    </div>



                    {/* Toggle Resonance Map heat overlay */}
                    <button
                      onClick={() => {
                        const newState = !showHeatmap;
                        setShowHeatmap(newState);
                        addLog(`RESONANCE FIELD // HEATMAP FILTER ${newState ? 'ENGAGED' : 'STANDBY'}`);
                      }}
                      title={showHeatmap ? "Deactivate Resonance Heatmap Overlay" : "Activate Resonance Heatmap Overlay"}
                      className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all text-[8px] font-mono uppercase tracking-widest font-bold cursor-pointer h-[24px] border ${
                        showHeatmap 
                          ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.35)] font-black' 
                          : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-455 border-zinc-805 hover:border-zinc-705'
                      }`}
                    >
                      <Flame size={11} className={showHeatmap ? "text-rose-400 animate-pulse" : "text-zinc-500"} />
                      <span>Resonance Map</span>
                    </button>

                    {/* Fullscreen API Toggle Button */}
                    <button
                      onClick={toggleFullscreen}
                      title={isFullscreen ? "Exit Immersive Fullscreen" : "Enter Immersive Fullscreen"}
                      className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-brand-cyan border border-zinc-800 hover:border-brand-cyan/40 rounded flex items-center gap-1.5 transition-all text-[8px] font-mono uppercase tracking-widest font-bold cursor-pointer h-[24px]"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 size={11} className="text-brand-cyan animate-pulse" />
                          <span className="hidden sm:inline">Exit</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 size={11} className="hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Fullscreen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div 
                    key="idle-view"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 border border-zinc-800 rounded-full rotate-clockwise" />
                      <div className="absolute inset-3 border border-dashed border-zinc-700/50 rotate-counter" />
                      <svg className="w-24 h-24 text-zinc-800 absolute rotate-counter" viewBox="0 0 100 100">
                        <polygon points="50,15 80,68 20,68" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </svg>
                      <Radio className="w-8 h-8 text-zinc-500 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-serif text-white tracking-widest uppercase mb-1">Awaiting Hologram Core</h3>
                    <p className="text-zinc-500 text-xs font-mono tracking-widest max-w-[320px]">
                      Capture an image optic or synthesize a divine gateway to forge holographic interactive regions.
                    </p>
                  </motion.div>
                )}

                {status === 'generating' && (
                  <motion.div 
                    key="generating-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col items-center justify-center"
                  >
                    <LoadingState />
                  </motion.div>
                )}

                {(status === 'analyzing' || status === 'complete') && data && (
                  <motion.div 
                    key={isRepairBayMode ? "repair-bay-view" : isTripo3dMode ? "tripo-view" : "canvas-view"}
                    initial={{ opacity: 0, scale: 0.15, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.85, rotate: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 14,
                      mass: 1.1,
                      opacity: { duration: 0.5, ease: "easeOut" }
                    }}
                    className="w-full h-full flex flex-col justify-center relative select-none origin-center"
                  >
                    {isRepairBayMode ? (
                      <div className="w-full h-full overflow-y-auto no-scrollbar pt-[84px] pb-6 px-1 flex justify-center">
                        <RepairBay3D 
                          addLog={addLog}
                          originalQuery={query}
                          snapToGrid={snapToGrid}
                          rippleFrequency={rippleFrequency}
                          isCoaxialBurstActive={isCoaxialBurstActive}
                        />
                      </div>
                    ) : isTripo3dMode ? (
                      <div className="w-full h-full overflow-y-auto no-scrollbar pt-[84px] pb-6 px-1 flex justify-center">
                        <TripoMeshWireframe 
                          originalQuery={query}
                          activeVariant={activeVariant}
                          addLog={addLog}
                          snapToGrid={snapToGrid}
                        />
                      </div>
                    ) : (
                      <AugmentedCanvas 
                        image={data.image}
                        analysis={data.analysis}
                        isScanning={status === 'analyzing'}
                        motionIntensity={motionIntensity}
                        spectralDistortion={spectralDistortion}
                        frameCount={frameCount}
                        scrubPosition={scrubPosition}
                        isAwakened={isAwakened}
                        activeVariant={activeVariant}
                        runeStates={runeStates}
                        activeSegmentIndex={activeSegmentIndex}
                        setActiveSegmentIndex={setActiveSegmentIndex}
                        rippleIntensity={rippleIntensity}
                        rippleFrequency={rippleFrequency}
                        gridFloor={gridFloor} 
                        isOrthographic={isOrthographic}
                        showHeatmap={showHeatmap}
                        showTacticalGrid={showTacticalGrid}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Optional CRT Scanline Overlay Effect */}
              {crtScanline && (
                <>
                  {/* CSS scanline background stripe pattern */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-25 scanlines transition-all duration-75" 
                    style={{
                      opacity: isPlayingPulse ? 0.25 + (pulseModulator * 0.25) : 0.35
                    }}
                  />
                  {/* Scanning phosphor horizontal active beam */}
                  <div 
                    className="absolute inset-x-0 pointer-events-none z-25 crt-moving-bar transition-all duration-75" 
                    style={{
                      opacity: isPlayingPulse ? 0.5 + (pulseModulator * 0.5) : 1.0
                    }}
                  />
                </>
              )}

            </div>

            {/* Holo-Reel Scrubbing Timeline Bar */}
            <div className={`w-full max-w-[620px] bg-black/40 border border-white/5 rounded-lg p-3 md:p-4 mt-6 ${!data ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex justify-between items-center text-[9px] font-mono mb-2 text-zinc-500">
                <span className="tracking-widest">HOLO-REEL VIEWPORT // SCRUB TIMELINE RING</span>
                <span>COORD // {scrubPosition}.00° / 360°</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-zinc-500">00:00</span>
                
                {/* Timeline slide indicator scrubber */}
                <div className="flex-1 relative flex items-center">
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={scrubPosition}
                    onChange={(e) => setScrubPosition(parseInt(e.target.value))}
                    disabled={isPlayingPulse}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-brand-cyan/80 disabled:opacity-50"
                  />
                  
                  {/* Subtle ticked bars overlay */}
                  <div className="absolute left-1/4 w-[1px] h-1.5 bg-zinc-800 -top-0.5" />
                  <div className="absolute left-2/4 w-[1px] h-1.5 bg-zinc-800 -top-0.5" />
                  <div className="absolute left-3/4 w-[1px] h-1.5 bg-zinc-800 -top-0.5" />
                </div>
                
                <span className="text-[10px] font-mono text-zinc-300 tracking-widest">{Math.floor(frameCount * (scrubPosition / 100))} FRAMES</span>
              </div>
            </div>

          </div>

          {/* ==========================================
              RIGHT COLUMN: Sub-System Control and Asset Deployment (Tabbed)
             ========================================== */}
          <div className="w-full lg:w-[28%] flex flex-col gap-4 overflow-y-auto pl-0 lg:pl-1 no-scrollbar shrink-0">
            
            {/* High-Tech Tab Selection Box */}
            <div className={`p-1 bg-black/60 border border-white/5 rounded-lg flex items-center gap-1 ${!data ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <button
                onClick={() => setActiveTab('monitor')}
                className={`flex-1 py-1.5 text-[9px] font-mono tracking-widest text-center uppercase font-bold rounded cursor-pointer transition-all ${
                  activeTab === 'monitor'
                    ? 'bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 glow-cyan font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ⚙️ Monitor Nodes
              </button>
              <button
                onClick={() => {
                  setActiveTab('pipeline');
                  addLog("ENGAGING CREATOR PRODUCTION PIPELINE");
                }}
                className={`flex-1 py-1.5 text-[9px] font-mono tracking-widest text-center uppercase font-bold rounded cursor-pointer transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-purple-950/30 border border-purple-500/20 text-purple-450 glow-purple font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                🚀 Asset Pipeline
              </button>
              
              <button
                onClick={() => {
                  setShowHistoryDrawer(true);
                  addLog("OPENING ORACLE INTEL HISTORY VAULT");
                }}
                className={`px-2 py-1.5 text-[9px] font-mono tracking-widest text-center uppercase font-bold rounded border transition-all cursor-pointer flex items-center gap-1 ${
                  showHistoryDrawer 
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-black' 
                    : 'border-zinc-805 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
                title="View Saved Intel Log History"
              >
                <History size={11} className="animate-spin-slow" />
                <span>ARCHIVE ({intelHistory.length})</span>
              </button>
            </div>

            {activeTab === 'monitor' ? (
              <>
                {/* Visual Alert Notification that flashes when Anomalous Event is active */}
                {isAnomalousEventActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="mb-3 shrink-0"
                  >
                    <div 
                      onClick={() => {
                        const element = document.getElementById('anomalous-event-card');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          addLog("NAVIGATING TO ANOMALOUS EVENT DETAILS");
                        }
                      }}
                      className="cursor-pointer bg-red-950/20 hover:bg-red-950/30 border-2 border-red-500/80 rounded-xl p-3 flex items-center justify-between gap-3 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-405 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <div className="font-mono text-left">
                          <div className="text-[9.5px] font-black tracking-wider text-red-100 uppercase flex items-center gap-1">
                            <AlertTriangle size={10} className="text-red-400" />
                            ANOMALOUS OVERLOAD DETECTED
                          </div>
                          <div className="text-[7px] text-zinc-400 uppercase tracking-wide mt-0.5">
                            CLICK TO VIEW DETAILED SCAN DOSSIER
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[7px] font-mono font-bold text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded bg-red-950/40 group-hover:bg-red-500 group-hover:text-black transition-all uppercase tracking-wider">
                        JUMP TO INFO ▲
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Anomalous Event notification card for Mythic rarity */}
                {oracleIntel && oracleIntel.rarity.toUpperCase().includes('MYTHIC') && (
                  <motion.div
                    id="anomalous-event-card"
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: 0,
                      boxShadow: [
                        "0 0 10px rgba(244,63,94,0.15)",
                        "0 0 25px rgba(244,63,94,0.45)",
                        "0 0 10px rgba(244,63,94,0.15)"
                      ]
                    }}
                    transition={{
                      y: { type: "spring", stiffness: 100, damping: 15 },
                      scale: { duration: 0.3, ease: "easeOut" },
                      boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="glass-panel border-rose-500/35 bg-rose-950/15 rounded-xl p-4.5 flex flex-col relative overflow-hidden shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                  >
                    {/* Pulsing scanning red glow lines inside the event card */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-rose-500 animate-[pulse_1.5s_infinite] opacity-60 pointer-events-none" />
                    <div className="absolute right-[-15px] bottom-[-15px] w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-rose-500/20 pb-2.5 mb-3">
                      <div className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </div>
                      <h3 className="text-[10px] font-mono font-black tracking-[0.25em] text-rose-400 uppercase flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-rose-400 animate-pulse" />
                        Anomalous Event Detected
                      </h3>
                      <span className="ml-auto text-[7px] font-mono text-rose-500/80 bg-rose-950/40 border border-rose-900/40 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                        CRITICAL LEVEL SSS
                      </span>
                    </div>

                    <p className="text-[9.5px] font-serif italic text-zinc-300 leading-relaxed mb-3">
                      "A localized breach in the signal matrix has emerged. Direct coaxial feedback indicates an item of Mythic Unique alignment is presently overloading standard sensor parameters."
                    </p>

                    <div className="bg-rose-950/20 border border-rose-500/10 rounded p-2 text-[8.5px] font-mono flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="text-zinc-550 uppercase text-[7px] tracking-wider">ANOMALY DESIGNATE</span>
                        <span className="font-bold text-rose-350">{oracleIntel.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="text-zinc-550 uppercase text-[7px] tracking-wider">RESONANCE ID</span>
                        <span className="bg-rose-950/40 border border-rose-900/40 text-rose-400 px-1 py-0.2 rounded text-[7.5px] font-bold">{oracleIntel.oracleId}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="text-zinc-550 uppercase text-[7px] tracking-wider">DIMENSIONAL SPREAD</span>
                        <span className="text-rose-300 font-bold tracking-widest text-[7.5px]">CLASSIFIED / HIGH ENERGY</span>
                      </div>
                    </div>

                    {/* Action trigger to expand/decode Mythic Lore */}
                    <button
                      onClick={handleDecodeLoreClick}
                      className="mt-3 py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-400 text-rose-300 font-mono text-[8px] font-black tracking-widest uppercase rounded flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] cursor-pointer"
                    >
                      <BookOpen size={11} className="text-rose-400" />
                      <span>DECRYPT MYTHIC DOSSIER</span>
                    </button>

                    <div className="mt-3 flex justify-between items-center text-[7px] font-mono text-rose-550">
                      <span className="uppercase tracking-[0.1em]">AMPLITUDE DETECT: BYPASS INHIBITOR</span>
                      <span className="animate-pulse font-black text-rose-400 tracking-wider">▲ TELEMETRY DEGRADED</span>
                    </div>
                  </motion.div>
                )}

                {/* Activation Event Panel */}
                <div className={`glass-panel border-purple-500/20 rounded-xl p-5 flex flex-col relative overflow-hidden shrink-0 ${!data ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <div className="absolute bottom-[-20px] right-[-20px] w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-gray-400 border-b border-white/10 pb-3 mb-4 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
                    Activation Event Panel
                  </h2>

                  <p className="text-[10px] text-zinc-400 font-mono leading-relaxed mb-4">
                    Triggers hidden signal layers, rift-energy maps, or ancient oracle-glyphs. Channels full power into the scanner nodes.
                  </p>

                  {/* Massive Awaken Layer Button */}
                  <button
                    onClick={() => {
                      const nextState = !isAwakened;
                      setIsAwakened(nextState);
                      addLog(nextState ? "AWAKEN LAYER APERTURE ENGAGED" : "DE-ACTIVATED SPECTRAL OVERLAY");
                      triggerRiftResonanceRumble(nextState);
                    }}
                    className={`w-full py-4.5 rounded-xl font-serif font-bold text-center tracking-[0.25em] transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer active:scale-95 ${
                      isAwakened 
                        ? 'bg-brand-cyan/20 border-brand-cyan text-cyan-200 box-glow-cyan' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-indigo-500/40 hover:text-white'
                    }`}
                  >
                    <span className="text-sm glow-cyan uppercase">{isAwakened ? "▲ AWAKEN PROTOCOL LIVE" : "▼ AWAKEN LAYER"}</span>
                    <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                      {isAwakened ? "COSMIC OVERLAYS FULLY RENDERED" : "TRIGGER SECRETS REVEAL PROTOCOL"}
                    </span>
                  </button>

                  {/* Simulate Anomalous Event Button */}
                  <button
                    onClick={() => {
                      if (isAnomalousEventActive) {
                        setOracleIntel(null);
                        setIsAnomalousEventActive(false);
                        addLog(`🧹 [CLEARED SYSTEM] // ANOMALOUS MATRIX OVERLOAD PURGED`);
                      } else {
                        // Generate a random Mythic oracle intel to trigger the anomaly
                        const fakeMythicIntel: OracleIntel = {
                          oracleId: `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
                          name: "Void-Beacon Singularity Root",
                          class: "Extradimensional Signal Anchor [Class S-I]",
                          rarity: "Mythic Unique Anomaly",
                          origin: "Temporal Echo Distortion Chamber Z-18",
                          hash: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                          scannedAt: new Date().toLocaleTimeString(),
                          loreFragment: "A localized resonance rift has shattered standard sensory boundaries. Extradimensional signal decay is cascading into the auxiliary fuel rods.",
                          isGeneratingIcon: false,
                          userQuery: query || "Void Beacon",
                          activeVariant: activeVariant
                        };
                        setOracleIntel(fakeMythicIntel);
                        setIsAnomalousEventActive(true);
                        addLog(`⚠️ [SIMULATION ALERT] // TRIGGERED SIMULATED ANOMALOUS EVENT // DETECTING COSMIC RIFT OVERLOAD`);
                      }
                    }}
                    className={`mt-3 w-full py-2.5 rounded-xl text-center px-3 font-mono text-[8.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95 ${
                      isAnomalousEventActive
                        ? 'bg-rose-950/20 border-rose-500/50 text-rose-300 animate-pulse hover:bg-rose-900/30'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-rose-500/40 hover:text-rose-300'
                    }`}
                  >
                    <AlertTriangle size={11} className={isAnomalousEventActive ? "text-rose-400 animate-bounce" : "text-zinc-500"} />
                    <span>{isAnomalousEventActive ? "🧹 PURGE ANOMALOUS EVENT" : "⚡ TRIGGER ANOMALOUS EVENT"}</span>
                  </button>

                  {/* CRT Scanline Toggle Switch */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders size={10} className="text-purple-450 animate-pulse" />
                        CRT Scanline Overlay
                      </span>
                      {/* Interactive toggle switch custom element */}
                      <button
                        onClick={() => {
                          const nextState = !crtScanline;
                          setCrtScanline(nextState);
                          addLog(`MONITOR EFFECT: CRT SCANLINE ${nextState ? "ENGAGED" : "OFFLINE"}`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-zinc-800 transition-colors duration-200 ease-in-out focus:outline-none ${
                          crtScanline ? 'bg-cyan-950/40 border-cyan-400/50' : 'bg-zinc-950'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out mt-[2px] ${
                            crtScanline ? 'translate-x-[18px] bg-cyan-450 glow-cyan' : 'translate-x-[2px] bg-zinc-650'
                          }`}
                        />
                      </button>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide leading-relaxed">
                      Enables high-definition CRT scan beams & phosphor-dot styling overlays on the rendering viewport.
                    </span>
                  </div>

                  {/* Signal Frequency Override Toggle Switch */}
                  <div className="mt-3.5 pt-3.5 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Radio size={10} className="text-rose-500 animate-pulse" />
                        Signal Override Frequency
                      </span>
                      {/* Interactive toggle switch custom element */}
                      <button
                        onClick={() => {
                          const nextState = !signalOverride;
                          setSignalOverride(nextState);
                          addLog(`MONITOR EFFECT: SIGNAL STABILITY OVERRIDE ${nextState ? "ENGAGED" : "OFFLINE"}`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-zinc-800 transition-colors duration-200 ease-in-out focus:outline-none ${
                          signalOverride ? 'bg-rose-950/40 border-rose-400/50' : 'bg-zinc-950'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out mt-[2px] ${
                            signalOverride ? 'translate-x-[18px] bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]' : 'translate-x-[2px] bg-zinc-650'
                          }`}
                        />
                      </button>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide leading-relaxed">
                      Forces the spectral viewport into a metastable state, generating a rhythmic chromatic aberration drift and signal instability.
                    </span>
                  </div>

                  {/* Ambient Atmosphere Toggle Switch */}
                  <div className="mt-3.5 pt-3.5 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Terminal size={10} className="text-cyan-400 animate-pulse" />
                        Ambient Atmosphere
                      </span>
                      {/* Interactive toggle switch custom element */}
                      <button
                        onClick={() => {
                          const nextState = !isAmbientAtmosphereEnabled;
                          setIsAmbientAtmosphereEnabled(nextState);
                          addLog(`MONITOR AUDIO // AMBIENT ATMOSPHERE SYSTEM: [${nextState ? "ENGAGED" : "OFFLINE"}]`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-zinc-800 transition-colors duration-200 ease-in-out focus:outline-none ${
                          isAmbientAtmosphereEnabled ? 'bg-cyan-950/40 border-cyan-400/50' : 'bg-zinc-950'
                        }`}
                        title="Toggle Low-Frequency Dynamic Soundscape"
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out mt-[2px] ${
                            isAmbientAtmosphereEnabled ? 'translate-x-[18px] bg-cyan-450 glow-cyan' : 'translate-x-[2px] bg-zinc-650'
                          }`}
                        />
                      </button>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide leading-relaxed">
                      Generates dynamic low-frequency sonic waves that modulate rhythmically based on the scanned Oracle's rarity score {oracleIntel ? `(${getRarityScoreAndSettings(oracleIntel.rarity).score}%)` : ""}.
                    </span>
                  </div>

                  {/* Real-time Tactical Grid Toggle Switch */}
                  <div className="mt-3.5 pt-3.5 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity size={10} className="text-emerald-400 animate-pulse" />
                        Tactical Grid Overlay
                      </span>
                      {/* Interactive toggle switch custom element */}
                      <button
                        onClick={() => {
                          const nextState = !showTacticalGrid;
                          setShowTacticalGrid(nextState);
                          addLog(`MONITOR EFFECT: TACTICAL GRID OVERLAY [${nextState ? "ENGAGED" : "OFFLINE"}]`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-zinc-800 transition-colors duration-200 ease-in-out focus:outline-none ${
                          showTacticalGrid ? 'bg-emerald-950/40 border-emerald-400/50' : 'bg-zinc-950'
                        }`}
                        title="Toggle Real-Time Tactical Grid Overlay"
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out mt-[2px] ${
                            showTacticalGrid ? 'translate-x-[18px] bg-emerald-450 glow-emerald shadow-[0_0_10px_rgba(52,211,153,0.7)]' : 'translate-x-[2px] bg-zinc-650'
                          }`}
                        />
                      </button>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide leading-relaxed">
                      Projects a real-time HUD grid matrix complete with yaw/pitch coordinates and multiple fluctuating energy flux tracking indicators.
                    </span>
                  </div>
                </div>

                {/* Variant Forge Grid */}
                <div className={`glass-panel rounded-xl p-5 flex flex-col relative overflow-hidden shrink-0 ${!data ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                    <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2">
                      <Sparkles size={12} className="text-brand-cyan" />
                      Variant Forge Grid
                    </h2>
                    <span className="text-[9px] font-mono text-zinc-500">FORGE.V2</span>
                  </div>

                  {/* 4 Variant Items Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'original', name: 'Original Signal', spec: 'Default Raw' },
                      { id: 'abyss', name: 'Deep Abyss', spec: 'Spectral Bleu' },
                      { id: 'chronos', name: 'Chronos Decay', spec: 'Crystalline Copper' },
                      { id: 'aether', name: 'Aether Shimmer', spec: 'Emanant Burst' }
                    ].map(v => {
                      const isActive = activeVariant === v.id;
                      const vStats = getVariantStats(v.id);
                      
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setActiveVariant(v.id);
                            addLog(`CONVERTING SIGNAL CORE TARGET TO: [${v.name.toUpperCase()}]`);
                            addLog(`VARIANT LOCK: ${v.name}`);
                          }}
                          className={`group/tile px-3 py-2 text-left rounded-lg border font-mono transition-all flex flex-col relative overflow-hidden hover:bg-zinc-950 ${
                            isActive 
                              ? 'border-brand-cyan bg-[#0a2027]/30 text-white' 
                              : 'border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {/* Visual breath effect dot inside item */}
                          <span className="text-[10px] font-semibold text-zinc-200 group-hover/tile:text-cyan-400 truncate w-full">
                            {v.name}
                          </span>
                          <span className="text-[8px] text-zinc-600 truncate uppercase mt-0.5">{v.spec}</span>
                          
                          {/* Hover stats metadata readout */}
                          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg p-1.5 flex flex-col justify-center pointer-events-none border border-brand-cyan/20">
                            <div className="flex justify-between text-[7.5px] font-mono text-zinc-400">
                              <span>CLARITY:</span> <span className="text-brand-cyan">{vStats.clarity}</span>
                            </div>
                            <div className="flex justify-between text-[7.5px] font-mono text-zinc-400 mt-0.5">
                              <span>DEPTH:</span> <span className="text-purple-450">{vStats.depth}</span>
                            </div>
                            <div className="flex justify-between text-[7.5px] font-mono text-zinc-400 mt-0.5">
                              <span>MYTHIC:</span> <span className="text-white">{vStats.mythic}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* D3 Radar Chart Variance Visualizer */}
                  <VariantRadarChart activeVariant={activeVariant} />
                </div>

                {/* D3 Rarity Grade Distribution Chart */}
                <div className={!data ? 'opacity-40 pointer-events-none' : 'opacity-100'}>
                  <RarityDistributionChart intelHistory={intelHistory} />
                </div>

                {/* Interactive Origin Zone Mini-Map */}
                <div className={!data ? 'opacity-40 pointer-events-none' : 'opacity-100'}>
                  <OriginMiniMap currentOrigin={oracleIntel?.origin} addLog={addLog} />
                </div>

                {/* Active Annotation Details panel or Terminal Log Feed */}
                <div className="glass-panel rounded-xl p-5 flex flex-col relative overflow-hidden flex-1 min-h-[160px]">
                  
                  <AnimatePresence mode="wait">
                    {activeSegmentIndex !== null && data?.analysis?.segments ? (
                      <motion.div 
                        key="annotation-detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full"
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                            <Zap size={11} /> Selected Archive Node
                          </span>
                          <button 
                            onClick={() => setActiveSegmentIndex(null)}
                            className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase"
                          >
                            [CLOSE]
                          </button>
                        </div>
                        
                        {/* Render corresponding widget details */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                          <WidgetEngine segment={data.analysis.segments[activeSegmentIndex]} />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="telemetry-logs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col h-full"
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Terminal size={11} className="text-zinc-500" />
                            Aperture Telemetry Feed
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>
                        
                        {/* Live streaming terminal feed */}
                        <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[9px] text-zinc-500 flex flex-col gap-1.5 leading-normal select-none pr-1">
                          {logs.map((log, index) => (
                            <div 
                              key={index} 
                              className={`${index === 0 ? 'text-zinc-300' : ''} border-l border-zinc-850 pl-2 py-0.5`}
                            >
                              {log}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </>
            ) : (
              /* PRO-PRODUCTION ASSET PIPELINE CONTROLLERS */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 flex-1 h-full"
              >
                {/* Oracle AI Intel Entry Panel */}
                {oracleIntel && (
                  <div id="intel-details-panel" className="glass-panel border-cyan-500/10 rounded-xl p-4 flex flex-col relative overflow-hidden bg-cyan-950/5">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                      <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-350 uppercase flex items-center gap-1.5 animate-pulse">
                        <Radio size={11} className="text-cyan-400" />
                        Oracle AI Intel Entry
                      </h2>
                      <span className="text-[8px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded font-black">{oracleIntel.oracleId}</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex gap-4 items-start pb-1">
                        {/* Interactive Relic Icon Slot with Mythic Particle Reactivity */}
                        <div className={`w-18 h-18 shrink-0 relative rounded-lg bg-zinc-950/80 overflow-hidden group flex items-center justify-center transition-all duration-500 ${
                          oracleIntel && oracleIntel.rarity.toUpperCase().includes('MYTHIC')
                            ? "border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            : "border border-zinc-800"
                        }`}>
                          {oracleIntel && oracleIntel.rarity.toUpperCase().includes('MYTHIC') && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                              {/* Sparkling border overlay */}
                              <div className="absolute inset-0 border border-amber-500/40 shadow-[inset_0_0_8px_rgba(245,158,11,0.2)] rounded-lg" />
                              {/* Concentrated radial backdrop glow */}
                              <div className="absolute inset-0 bg-gradient-to-t from-rose-600/10 via-amber-500/5 to-transparent blend-screen opacity-70" />
                              {/* Floating tiny sparks */}
                              {Array.from({ length: 12 }).map((_, i) => {
                                const delay = i * 0.16;
                                const duration = 1.4 + (i % 3) * 0.35;
                                const left = `${5 + (i * 19) % 90}%`;
                                const size = 1.2 + (i % 3) * 0.8;
                                return (
                                  <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                                    style={{
                                      left,
                                      bottom: '-4px',
                                      width: size,
                                      height: size,
                                      boxShadow: '0 0 5px rgba(245,158,11,0.85)',
                                    }}
                                    animate={{
                                      y: [-10, -78],
                                      x: [0, (i % 2 === 0 ? 8 : -8) * ((i % 3) + 1)],
                                      opacity: [0, 0.9, 0.35, 0],
                                      scale: [0.8, 1.2, 0.6]
                                    }}
                                    transition={{
                                      duration,
                                      repeat: Infinity,
                                      delay,
                                      ease: "easeOut",
                                    }}
                                  />
                                );
                              })}
                              {/* Sparkling status indicator stars */}
                              {Array.from({ length: 4 }).map((_, i) => {
                                const delay = i * 0.42;
                                const top = `${15 + (i * 23) % 70}%`;
                                const left = `${15 + (i * 19) % 70}%`;
                                return (
                                  <motion.div
                                    key={`star-${i}`}
                                    className="absolute text-[8px] text-amber-300 font-mono select-none"
                                    style={{ top, left }}
                                    animate={{
                                      scale: [0, 1.35, 0],
                                      opacity: [0, 0.85, 0],
                                      rotate: [0, 180]
                                    }}
                                    transition={{
                                      duration: 1.6,
                                      repeat: Infinity,
                                      delay,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    ✦
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}

                          {oracleIntel.relicIcon ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={oracleIntel.relicIcon.mimeType === 'image/svg+xml' 
                                  ? `data:image/svg+xml;base64,${oracleIntel.relicIcon.base64}` 
                                  : `data:${oracleIntel.relicIcon.mimeType};base64,${oracleIntel.relicIcon.base64}`} 
                                alt="Generated Relic Icon" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none group-hover:border-cyan-400/40" />
                            </div>
                          ) : oracleIntel.isGeneratingIcon ? (
                            <div className="flex flex-col items-center justify-center gap-1 text-center p-1">
                              <div className="w-4 h-4 border border-t-transparent border-cyan-400 rounded-full animate-spin" />
                              <span className="text-[6.5px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">FORGING...</span>
                            </div>
                          ) : (
                            <button
                              onClick={handleGenerateIconClick}
                              className="w-full h-full flex flex-col items-center justify-center p-1 text-zinc-500 hover:text-cyan-400 bg-black/20 hover:bg-cyan-950/15 transition-all group/btn cursor-pointer"
                              title="Synthesize Relic Icon"
                            >
                              <Flame size={18} className="text-zinc-650 group-hover/btn:text-cyan-400 group-hover/btn:scale-110 transition-transform animate-pulse" />
                              <span className="text-[6.5px] font-mono uppercase tracking-[0.1em] text-zinc-650 group-hover/btn:text-cyan-400 font-bold mt-1 text-center">SYNTH ICON</span>
                            </button>
                          )}
                        </div>

                        {/* Designation and Core fields */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div>
                            <span className="text-[7.5px] font-mono text-zinc-500 block uppercase tracking-wider">Asset Designation</span>
                            <span className="text-xs font-serif font-bold text-white tracking-wide block truncate">{oracleIntel.name}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[7.5px] font-mono text-zinc-500 block uppercase tracking-wider">Artifact Class</span>
                              <span className="text-[9px] font-mono font-semibold text-zinc-300 truncate block">{oracleIntel.class}</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] font-mono text-zinc-500 block uppercase tracking-wider">Signal Rarity</span>
                              <span className="text-[9px] font-mono font-semibold text-brand-cyan truncate block">
                                {oracleIntel.rarity}
                                <span className="text-[7.5px] text-zinc-500 ml-1 block mt-0.5">
                                  Score: <span className="text-brand-cyan font-bold">{getRarityScoreAndSettings(oracleIntel.rarity).score}%</span>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[7.5px] font-mono text-zinc-500 block uppercase tracking-wider">Origin Coordinate</span>
                        <span className="text-[9px] font-mono text-zinc-400 block truncate">{oracleIntel.origin}</span>
                      </div>

                      {oracleIntel.loreFragment && (
                        <div className="bg-zinc-950/40 border border-zinc-900/50 p-2 rounded">
                          <span className="text-[7.5px] font-mono text-zinc-500 block uppercase tracking-wider mb-0.5">Discovery Lore Fragment</span>
                          <p className="text-[9px] font-serif italic text-zinc-350 leading-relaxed">
                            "{oracleIntel.loreFragment}"
                          </p>
                        </div>
                      )}
                      
                      <div className="border-t border-zinc-900 pt-2 flex justify-between items-center text-[7.5px] font-mono text-zinc-600 uppercase">
                        <span>SIG_HASH: {oracleIntel.hash.substring(0, 10)}...</span>
                        <span>SCANNED: PRESENT REALITY</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Panel 1: Forge MTD Placement Layer */}
                <div className="glass-panel rounded-xl p-4 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                    <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase flex items-center gap-2">
                      <Database size={11} className="text-cyan-400" />
                      Forge Network MTD
                    </h2>
                    <span className="text-[8px] font-mono text-zinc-600">SYS.FORGE</span>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded border border-white/5 mb-3 text-[9px] font-mono">
                    <span className="text-zinc-500">REGISTRY CODE:</span>
                    {forgeAssetId ? (
                      <span className="text-brand-cyan font-bold block glow-cyan">{forgeAssetId}</span>
                    ) : (
                      <span className="text-red-400/80 italic uppercase">Unregistered</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={exportForgeMtd}
                      disabled={isExportingForge}
                      className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-cyan-500/20 hover:border-cyan-400/50 text-[10px] uppercase font-mono font-bold tracking-widest text-cyan-200 rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <RefreshCw size={11} className={isExportingForge ? "animate-spin" : ""} />
                      {isExportingForge ? "REGISTERING BUNDLE..." : "EXPORT → FORGE MTD"}
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsTripo3dMode(!isTripo3dMode);
                        addLog(!isTripo3dMode ? "ACTIVATING TRIPO3D WIREFRAME SYSTEM" : "RETURNING TO 2D SCANNER MODE");
                        if (!isTripo3dMode && PROTOTYPE_MODE) {
                          addLog("MESH QUEUE STAGED — TRIPO GATEWAY OFFLINE IN PROTOTYPE MODE");
                        }
                      }}
                      className={`w-full py-2 bg-zinc-955/20 border text-[10px] uppercase font-mono font-bold tracking-widest rounded flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isTripo3dMode 
                          ? 'bg-purple-950/40 border-purple-500 text-purple-200 glow-purple' 
                          : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <Cpu size={11} />
                      {isTripo3dMode ? "FORGE MTD# → 2D VIEW" : "FORGE MTD# → TRIPO3D"}
                    </button>
                  </div>
                </div>

                {/* Panel 2: ABEX-GDEX Marketplace Deployment */}
                <div className="glass-panel border-purple-500/10 rounded-xl p-4 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                    <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase flex items-center gap-2">
                      <ShoppingBag size={11} className="text-purple-400" />
                      ABEX–GDEX Token Registry
                    </h2>
                    <span className="text-[8px] font-mono text-zinc-600">LEDGER.S3</span>
                  </div>

                  {activeListing ? (
                    <div className="bg-purple-950/10 border border-purple-500/30 rounded p-2.5 flex flex-col gap-1.5 mb-3">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-200 truncate font-semibold uppercase">{activeListing.name}</span>
                        <span className="text-purple-400 font-bold">{activeListing.price}</span>
                      </div>
                      <div className="text-[8px] font-mono text-zinc-500 tracking-wider truncate uppercase">
                        TXHASH // {activeListing.txHash}
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-green-400 bg-green-950/40 px-1.5 py-0.5 rounded border border-green-500/20 mt-1">
                        <span>● LIQUIDITY LISTING ACTIVE</span>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); addLog("OPENING EXTERNAL DIRECTORY..."); }}
                          className="text-white hover:underline flex items-center gap-0.5 font-bold"
                        >
                          VIEW <ExternalLink size={7} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-950/40 border border-white/5 text-[9px] font-mono text-zinc-500 p-2.5 rounded text-center leading-normal mb-3">
                      ASSET LIQUIDITY UNLINKED // NO ACTIVE TRANSACTION LISTINGS DETECTED ON LEDGER.
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!forgeAssetId) {
                        const tempId = PROTOTYPE_MODE ? `F-PROTO-${Math.floor(100000 + Math.random() * 900000)}` : `F-${Math.floor(100000 + Math.random() * 900000)}`;
                        setForgeAssetId(tempId);
                        addLog(`AUTO-FORGING INTERIM REGULATION SETS: ID: ${tempId}`);
                      }
                      setShowListingModal(true);
                      addLog("LISTING PROTOCOL ACCESSED");
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600/30 to-cyan-500/35 hover:from-purple-600/45 hover:to-cyan-500/45 border border-purple-450 text-[10px] font-mono font-bold uppercase tracking-widest rounded text-white flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
                  >
                    <ShoppingBag size={11} />
                    LIST ON ABEX-GDEX
                  </button>
                </div>

                {/* Panel 3: Digital Capture Export Grid */}
                <div className="glass-panel rounded-xl p-4 flex flex-col relative overflow-hidden flex-1">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3 shrink-0">
                    <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase flex items-center gap-2">
                      <Layers size={11} className="text-zinc-500" />
                      Optic Master Exporter
                    </h2>
                    <span className="text-[8px] font-mono text-zinc-600">DOWNLOAD</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <button
                      onClick={downloadStill}
                      className="group/btn p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-cyan-500/30 text-left transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <FileImage size={13} className="text-zinc-500 group-hover/btn:text-cyan-400 group-hover/btn:scale-110 transition-all" />
                      <div className="mt-2">
                        <div className="text-[9px] font-mono font-bold text-zinc-300 uppercase group-hover/btn:text-cyan-300">Capture Still</div>
                        <div className="text-[7px] font-mono text-zinc-600 uppercase mt-0.5">Render PNG Frame</div>
                      </div>
                    </button>

                    <button
                      onClick={exportCineReel}
                      disabled={isCineExporting}
                      className="group/btn p-2 rounded-lg bg-zinc-950/60 border border-zinc-805 hover:border-purple-500/30 text-left transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <Layers size={13} className={`${isCineExporting ? "animate-spin text-purple-400" : "text-zinc-500 group-hover/btn:text-purple-400"} transition-all`} />
                      <div className="mt-2">
                        <div className="text-[9px] font-mono font-bold text-zinc-300 uppercase group-hover/btn:text-purple-300">
                          {isCineExporting ? "Splicing..." : "Cine-Reel"}
                        </div>
                        <div className="text-[7px] font-mono text-zinc-600 uppercase mt-0.5">Sequence Specs</div>
                      </div>
                    </button>

                    <button
                      onClick={exportVariantSheet}
                      className="group/btn p-2 rounded-lg bg-zinc-950/60 border border-zinc-801 hover:border-cyan-500/30 text-left transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <Layers size={13} className="text-zinc-500 group-hover/btn:text-cyan-400 group-hover/btn:scale-110 transition-all" />
                      <div className="mt-2">
                        <div className="text-[9px] font-mono font-bold text-zinc-300 uppercase group-hover/btn:text-cyan-300">Variant Sheet</div>
                        <div className="text-[7px] font-mono text-zinc-600 uppercase mt-0.5">Comparative Data</div>
                      </div>
                    </button>

                    <button
                      onClick={downloadMetadata}
                      className="group/btn p-2 rounded-lg bg-zinc-950/60 border border-zinc-802 hover:border-purple-500/30 text-left transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <FileJson size={13} className="text-zinc-500 group-hover/btn:text-purple-400 group-hover/btn:scale-110 transition-all" />
                      <div className="mt-2">
                        <div className="text-[9px] font-mono font-bold text-zinc-300 uppercase group-hover/btn:text-purple-300">Export Metadata</div>
                        <div className="text-[7px] font-mono text-zinc-600 uppercase mt-0.5">Calibrations JSON</div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </div>

        {/* ABEX-GDEX Listing Modal Glass Frame Overlay */}
        {showListingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#050505] border border-brand-cyan/35 rounded-xl p-6 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative">
              
              <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600">ABEX-GDEX REGISTRY v3.1</div>
              <button 
                onClick={() => setShowListingModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3 mb-4 mt-2 flex items-center gap-2">
                <ShoppingBag className="text-cyan-400" size={16} />
                ABEX–GDEX Listing Protocol
              </h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                submitListing({
                  price: formData.get('price') as string || '25.0',
                  currency: formData.get('currency') as string || 'ABX',
                  supply: formData.get('supply') as string || 'Rare 1/1 Single Edition',
                  unlockables: formData.get('unlockables') as string || '',
                  hasUnlockables: !!formData.get('hasUnlockables'),
                  name: formData.get('name') as string || 'Gateway Relic',
                  loreClass: formData.get('loreClass') as string || 'Arcane Industrial Gateway (Class A-3)'
                });
              }} className="flex flex-col gap-4 text-xs font-mono select-none">
                
                {/* Core Name */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Asset Registry Name</span>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={oracleIntel ? oracleIntel.name : `${query || 'Ancient Gateway Relic'} — ${activeVariant.toUpperCase()}`}
                    className="bg-zinc-950 border border-zinc-900 rounded p-2 text-white font-mono text-xs focus:border-cyan-500/50 focus:outline-none w-full"
                    required
                  />
                </div>

                {/* Read-only metadata specs */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 border border-zinc-900 p-2.5 rounded text-[10px] text-zinc-400">
                  <div>
                    <span className="text-zinc-600 block text-[8px] uppercase">Creator ID</span>
                    <span className="text-zinc-300 truncate font-bold block">atonyscott@gmail.com</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block text-[8px] uppercase">Forge MTD Registry</span>
                    <span className="text-brand-cyan font-bold block">{forgeAssetId || "AUTO-GENERATING ID"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Listing Price</span>
                    <div className="flex bg-zinc-955 border border-zinc-900 rounded overflow-hidden">
                      <input 
                        type="number" 
                        name="price"
                        step="0.01"
                        defaultValue="15.00"
                        className="bg-transparent flex-1 p-2 text-white font-mono text-xs focus:outline-none w-full"
                        required
                      />
                      <select name="currency" className="bg-zinc-900 text-[9px] uppercase text-zinc-300 px-2 select-none border-l border-zinc-800">
                        <option value="ABX">ABX</option>
                        <option value="GDX">GDX</option>
                        <option value="GEM">GEM</option>
                      </select>
                    </div>
                  </div>

                  {/* Supply limit */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Rarity / Supply Type</span>
                    <select name="supply" className="bg-zinc-950 border border-zinc-900 rounded p-2 text-white text-xs select-none">
                      <option value="Rare 1/1 Single Edition">Rare 1/1 Exclusive</option>
                      <option value="Limited Series (100 Nodes)">Limited Series (100)</option>
                      <option value="Epic Cohort (250 Units)">Epic Cohort (250)</option>
                      <option value="Standard Open Circulation">Open Circulation</option>
                    </select>
                  </div>
                </div>

                {/* Lore classification */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Lore Descriptor</span>
                  <select name="loreClass" className="bg-zinc-950 border border-zinc-900 rounded p-2 text-zinc-300 text-xs select-none">
                    <option value="Arcane Industrial Gateway (Class A-3)">Arcane Industrial Gateway</option>
                    <option value="Mythic Core Transference Battery">Mythic Energy Battery</option>
                    <option value="Ecosystem Seal of Ancient Archivist">Ecosystem Seal</option>
                    <option value="Sub-Atmospheric Gateway Beacon">Gateway Beacon</option>
                  </select>
                </div>

                {/* Unlockable digital elements toggle slider */}
                <div className="bg-zinc-950 border border-zinc-900 rounded p-2.5 flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    name="hasUnlockables" 
                    id="hasUnlockables"
                    defaultChecked={true}
                    className="mt-1 cursor-pointer accent-brand-cyan"
                  />
                  <div className="flex-1">
                    <label htmlFor="hasUnlockables" className="text-[9px] text-zinc-300 uppercase tracking-wider font-bold cursor-pointer">
                      Attach Divine Calibration Files
                    </label>
                    <input 
                      type="text" 
                      name="unlockables"
                      defaultValue="Includes high-res VEO-3 pulse specs and custom simulation sound parameters."
                      className="mt-1.5 w-full bg-zinc-900 text-[10px] text-zinc-400 p-1.5 rounded focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Deploy Listing Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold uppercase tracking-[0.2em] rounded-lg transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,242,254,0.2)] cursor-pointer"
                >
                  CONFIRM & DEPLOY ON ABEX–GDEX
                </button>

              </form>
            </div>
          </div>
        )}

        {/* MYTHIC LORE DECRYPTION MODAL */}
        {isLoreModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#0a0507] border border-rose-500/35 rounded-xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.2)] relative max-h-[85vh] flex flex-col overflow-hidden">
              
              <div className="absolute top-2 left-2 text-[8px] font-mono text-rose-500/60 uppercase tracking-widest animate-pulse">
                SYS.DECRYPTOR // NODE ALPHA COAXIAL ACTIVE
              </div>
              
              <button 
                onClick={() => {
                  setIsLoreModalOpen(false);
                  setIsDecodingLoreRunning(false);
                }}
                className="absolute top-4 right-4 text-rose-400 hover:text-white transition-colors cursor-pointer border border-rose-950/40 p-1 rounded-md hover:bg-rose-950/25 bg-transparent"
                title="Power Down Decrypter"
              >
                <X size={15} />
              </button>

              <div className="mt-3.5 mb-5 border-b border-rose-500/20 pb-4">
                <h3 className="text-sm font-mono font-black uppercase tracking-[0.25em] text-rose-400 flex items-center gap-2.5">
                  <Flame className="text-rose-500 animate-pulse" size={18} />
                  Mythic Lore Decryption Hub
                </h3>
                <div className="flex gap-4 mt-2 items-center text-[8px] font-mono text-zinc-500">
                  <span>DESIGNATION: <span className="text-zinc-300 font-bold">{oracleIntel?.name}</span></span>
                  <span>•</span>
                  <span>CLASS: <span className="text-zinc-350 font-bold">{oracleIntel?.class}</span></span>
                  <span>•</span>
                  <span>STATUS: <span className="text-rose-400 font-black animate-pulse">STABLE</span></span>
                </div>
              </div>

              {/* Decrypted Content Area */}
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar select-text bg-black/60 border border-rose-955/40 rounded-lg p-4 font-mono text-zinc-350">
                {isDecodingLoreRunning ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-rose-500/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-rose-500 animate-spin" />
                      <Flame size={20} className="text-rose-500 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono font-black text-rose-400 tracking-[0.2em] uppercase animate-pulse">DECRYPTING ARCHIVAL SIGNAL...</span>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">HARNESSING ENERGETIC SPECTRUM COAXIAL WAVEFORMS</span>
                    </div>
                    <div className="w-56 h-1 bg-zinc-950 rounded overflow-hidden border border-rose-950/40 mt-1">
                      <div className="h-full bg-rose-500 animate-[pulse_1s_infinite] w-[65%]" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left select-text">
                    {decodedLoreContent.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith('###')) {
                        const headingText = trimmed.replace(/^###\s*/, '');
                        return (
                          <h4 key={idx} className="text-[10px] font-mono font-bold text-rose-400 tracking-wider uppercase border-b border-rose-950/50 pb-1 mt-5 mb-2.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-rose-500 inline-block" />
                            {headingText}
                          </h4>
                        );
                      }
                      if (trimmed.startsWith('##')) {
                        const headingText = trimmed.replace(/^##\s*/, '');
                        return (
                          <h3 key={idx} className="text-xs font-serif font-bold text-rose-300 tracking-widest uppercase mt-6 mb-3 border-b border-rose-500/20 pb-1.5">
                            {headingText}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                        const bulletText = trimmed.replace(/^[-*]\s*/, '');
                        const parts = bulletText.split('**');
                        return (
                          <div key={idx} className="flex gap-2 pl-2 text-[9px] font-mono text-zinc-300 leading-relaxed mb-2">
                            <span className="text-rose-550 select-none">•</span>
                            <span>
                              {parts.map((part, pIdx) => {
                                if (pIdx % 2 === 1) {
                                  return (
                                    <strong key={pIdx} className="text-rose-300 font-bold uppercase tracking-wider bg-rose-950/30 px-1 py-0.2 rounded">
                                      {part}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                            </span>
                          </div>
                        );
                      }
                      if (trimmed === '') {
                        return <div key={idx} className="h-2" />;
                      }
                      
                      const parts = line.split('**');
                      return (
                        <p key={idx} className="text-[9.5px] font-mono text-zinc-400 leading-relaxed mb-3">
                          {parts.map((part, pIdx) => {
                            if (pIdx % 2 === 1) {
                              return (
                                <strong key={pIdx} className="text-rose-300 font-bold bg-rose-950/20 px-1 py-0.2 rounded">
                                  {part}
                                </strong>
                              );
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(decodedLoreContent);
                    addLog(`DECRYPTOR SYSTEM // EXPORTED COAXIAL SCHEMATICS TO CLIPBOARD`);
                  }}
                  disabled={isDecodingLoreRunning || !decodedLoreContent}
                  className="flex-1 py-2 px-3.5 bg-zinc-950 border border-rose-900/35 hover:border-rose-500 text-rose-300 hover:text-rose-200 font-mono text-[8.5px] font-black tracking-widest uppercase rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none hover:shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                >
                  <Cpu size={12} className="text-rose-400" />
                  <span>EXPORT DECRYPT TO CLIPBOARD</span>
                </button>

                <button
                  onClick={handleShareLore}
                  disabled={isDecodingLoreRunning || !decodedLoreContent}
                  className={`flex-1 py-2 px-3.5 border font-mono text-[8.5px] font-black tracking-widest uppercase rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] ${
                    isShareCopied 
                      ? "bg-rose-900/30 border-rose-450 text-white" 
                      : "bg-[#0c0608] border-rose-500/40 hover:border-rose-400 text-rose-400 hover:text-rose-200"
                  }`}
                  title="Generate a clean formatted plain-text and copy/share it outside"
                >
                  <Share2 size={11} className={isShareCopied ? "animate-bounce text-rose-300" : "text-rose-400 animate-pulse"} />
                  <span>{isShareCopied ? "LORE COPIED!" : "SHARE CLEAN LORE"}</span>
                </button>
                
                {!isDecodingLoreRunning && decodedLoreContent && (
                  <button
                    onClick={() => {
                      setIsLoreDictOpen(true);
                      addLog("COAXIAL GLOSSARY REDIRECT ENGAGED");
                    }}
                    className="py-2 px-3.5 bg-zinc-950 border border-amber-900/45 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-mono text-[8.5px] font-black tracking-widest uppercase rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                  >
                    <BookOpen size={11} className="text-amber-400 animate-pulse" />
                    <span>VIEW DICTIONARY</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsLoreModalOpen(false);
                    setIsDecodingLoreRunning(false);
                  }}
                  className="py-2 px-5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/40 hover:border-rose-400 text-rose-300 font-mono text-[9px] font-black tracking-widest uppercase rounded transition-all cursor-pointer"
                >
                  DISMISS
                </button>
              </div>

            </div>
          </div>
        )}

        {/* LORE DICTIONARY SIDEBAR DRAWER */}
        {(() => {
          const filteredTerms = loreTerms.filter((term) => {
            if (loreCategoryFilter === 'CORE' && term.source !== 'Core Standard') return false;
            if (loreCategoryFilter === 'DECRYPTED' && term.source !== 'Archival Decryption') return false;
            
            if (loreSearchQuery) {
              const q = loreSearchQuery.toLowerCase();
              return (
                term.term.toLowerCase().includes(q) ||
                term.definition.toLowerCase().includes(q) ||
                (term.category && term.category.toLowerCase().includes(q)) ||
                (term.relicName && term.relicName.toLowerCase().includes(q))
              );
            }
            return true;
          });

          return (
            <AnimatePresence>
              {isLoreDictOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.55 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLoreDictOpen(false)}
                    className="fixed inset-0 bg-black z-40"
                  />
                  {/* Sidebar Content */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 24, stiffness: 210 }}
                    className={`fixed right-0 top-0 bottom-0 w-full ${
                      loreViewMode === 'graph' ? 'sm:w-[780px]' : 'sm:w-[420px]'
                    } bg-[#0c090a] border-l border-amber-900/30 z-50 flex flex-col shadow-[inset_4px_0_24px_rgba(0,0,0,0.95),-8px_0_35px_rgba(0,0,0,0.8)] transition-all duration-300`}
                  >
                    {/* Brushed steel subtle overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay opacity-80" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(197,160,89,0.02)_0%,transparent_80%)] pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-6 border-b border-amber-900/20 bg-gradient-to-b from-[#120d0f] to-[#0c090a] shrink-0">
                      <div className="absolute top-2 left-6 text-[7px] font-mono text-amber-500/40 uppercase tracking-widest leading-none">
                        DSD-DECODER MATRIX // LORE STORAGE
                      </div>
                      <button
                        onClick={() => setIsLoreDictOpen(false)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer border border-zinc-800 p-1 rounded-md hover:bg-zinc-900/50 bg-black/40"
                      >
                        <X size={15} />
                      </button>

                      <div className="mt-2 flex items-center gap-2.5">
                        <BookOpen className="text-amber-500 animate-[pulse_2s_infinite]" size={18} />
                        <h3 className="text-sm font-mono font-black uppercase tracking-[0.2em] text-amber-400">
                          Abyssum Lore Dictionary
                        </h3>
                      </div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1 tracking-wider">
                        Secured Signal Relic Lexicon & Archival Decryptions
                      </p>
                    </div>

                    {/* Search & Tabs */}
                    <div className="p-4 border-b border-zinc-900 bg-[#080607]/80 shrink-0 space-y-3">
                      {/* View mode toggle tabs */}
                      <div className="flex gap-1.5 p-0.5 bg-zinc-950 rounded border border-zinc-900">
                        <button
                          onClick={() => {
                            setLoreViewMode('list');
                            addLog("DICTIONARY VIEW // LIST INDEX ACTIVE");
                          }}
                          className={`flex-1 text-[8.5px] font-mono py-1 rounded tracking-widest text-center cursor-pointer transition-all font-black flex items-center justify-center gap-1 ${
                            loreViewMode === 'list'
                              ? 'bg-amber-550/20 text-amber-400 border border-amber-500/20'
                              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                          }`}
                        >
                          <BookOpen size={10} />
                          <span>ALPHABETICAL INDEX</span>
                        </button>
                        <button
                          onClick={() => {
                            setLoreViewMode('graph');
                            addLog("DICTIONARY VIEW // COAXIAL GRAPH DIAGRAM ENGAGED");
                          }}
                          className={`flex-1 text-[8.5px] font-mono py-1 rounded tracking-widest text-center cursor-pointer transition-all font-black flex items-center justify-center gap-1 ${
                            loreViewMode === 'graph'
                              ? 'bg-amber-550/20 text-amber-400 border border-amber-500/20'
                              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                          }`}
                        >
                          <Network size={10} className={loreViewMode === 'graph' ? 'animate-pulse' : ''} />
                          <span>RESONANCE GRAPH</span>
                        </button>
                      </div>

                      {/* Search box */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-550" />
                        <input
                          type="text"
                          placeholder="Search glossary terms or formulas..."
                          value={loreSearchQuery}
                          onChange={(e) => setLoreSearchQuery(e.target.value)}
                          className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-amber-500/40 rounded-md py-2 pl-9 pr-4 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none transition-all focus:shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                        />
                        {loreSearchQuery && (
                          <button 
                            onClick={() => setLoreSearchQuery('')}
                            className="absolute right-3 top-2.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>

                      {/* Filter buttons */}
                      <div className="flex gap-1.5 p-0.5 bg-zinc-950 rounded border border-zinc-900">
                        {['ALL', 'CORE', 'DECRYPTED'].map((filter) => {
                          const count = loreTerms.filter(t => {
                            if (filter === 'ALL') return true;
                            if (filter === 'CORE') return t.source === 'Core Standard';
                            if (filter === 'DECRYPTED') return t.source === 'Archival Decryption';
                            return true;
                          }).length;
                          return (
                            <button
                              key={filter}
                              onClick={() => setLoreCategoryFilter(filter)}
                              className={`flex-1 text-[8px] font-mono py-1 rounded tracking-widest text-center cursor-pointer transition-all font-black ${
                                loreCategoryFilter === filter
                                  ? 'bg-amber-550/20 text-amber-400 border border-amber-500/20'
                                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                              }`}
                            >
                              {filter} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Term List or Connections Network Graph */}
                    <div className="flex-1 min-h-0 flex flex-col bg-[#0a0708]">
                      {loreViewMode === 'graph' ? (
                        <div className="flex-1 min-h-0">
                          <LoreNetworkGraph 
                            terms={filteredTerms} 
                          />
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                          {filteredTerms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                              <div className="p-3 rounded-full bg-zinc-950 border border-zinc-900">
                                <BookOpen size={18} className="text-zinc-650" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block tracking-widest">No matching frequencies</span>
                                <p className="text-[8px] font-mono text-zinc-600 max-w-[240px] leading-relaxed uppercase">
                                  No dictionary terms match your criteria. Decrypt more Mythic dossiers to unlock mysterious Abyssum records.
                                </p>
                              </div>
                            </div>
                          ) : (
                            filteredTerms.map((t, idx) => (
                              <div 
                                key={idx}
                                className={`group relative p-3.5 rounded-lg border transition-all duration-300 ${
                                  t.source === 'Archival Decryption'
                                    ? 'bg-[#100609]/60 hover:bg-[#150a0e]/80 border-rose-950/40 hover:border-rose-500/30 shadow-[0_2px_8px_rgba(244,63,94,0.03)]'
                                    : 'bg-zinc-950/60 hover:bg-zinc-950 border-zinc-900/50 hover:border-amber-950/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                                }`}
                              >
                                {/* Term Category Indicator */}
                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                  <span className="text-[10px] font-serif font-black text-zinc-200 tracking-wide">
                                    {t.term}
                                  </span>
                                  <span className={`text-[6.5px] font-mono font-black border uppercase px-1 py-0.2 rounded-sm tracking-wider flex items-center gap-1 ${
                                    t.source === 'Archival Decryption'
                                      ? 'bg-rose-950/30 text-rose-400 border-rose-900/30'
                                      : 'bg-amber-950/30 text-amber-400 border-amber-905/30'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      t.source === 'Archival Decryption' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                                    }`} />
                                    {t.category || (t.source === 'Archival Decryption' ? 'Decrypted Specs' : 'Core Term')}
                                  </span>
                                </div>

                                {/* Definition Text */}
                                <p className="text-[9.5px] font-mono text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                  {t.definition}
                                </p>

                                {/* Metadata Footer if Decrypted */}
                                {t.source === 'Archival Decryption' && (
                                  <div className="mt-2.5 pt-2 border-t border-rose-950/20 flex flex-col gap-0.5 text-[7px] font-mono text-zinc-550">
                                    <div className="flex justify-between">
                                      <span>DECRYPT TARGET: <span className="text-zinc-400 font-bold">{t.relicName}</span></span>
                                      <span>ID: <span className="text-rose-400/80">{t.oracleId}</span></span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>SOURCE PATH: SECTOR_R_DECRYPTION</span>
                                      <span>DISCOVERED: <span className="text-zinc-400">{t.discoveredAt}</span></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 border-t border-zinc-950 bg-black/60 shrink-0 text-center font-mono text-[7px] text-zinc-650 uppercase tracking-widest leading-none">
                      COAXIAL_SYNTAX_VERSION: v3.12-GLOS // SECURE SECTOR CHASSIS
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          );
        })()}

        {/* Sliding history drawer portal panel */}
        <AnimatePresence>
          {showHistoryDrawer && (
            <>
              {/* Backdrop backdrop shadow click container dismissal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistoryDrawer(false)}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 cursor-pointer"
              />

              {/* Physical drawer sliding container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#06080c] border-l border-cyan-500/20 shadow-[-10px_0_30px_rgba(0,0,0,0.9)] z-50 flex flex-col overflow-hidden text-zinc-300"
              >
                {/* Header detail */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/80 relative">
                  <div className="absolute top-1 left-4 text-[7px] font-mono text-zinc-650 uppercase tracking-[0.3em]">
                    SECURE ORACLE DATABASE CORE
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <History size={15} className="text-cyan-400 animate-pulse" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">
                      Oracle Intel Vault
                    </h3>
                    <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-900/50 px-1.5 py-0.5 rounded font-black">
                      {intelHistory.length} ENTRIES
                    </span>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Search & Purge bar controls */}
                <div className="p-4 bg-zinc-950/40 border-b border-white/5 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={13} className="absolute left-3 top-2.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="FILTER BY DESIGNATE, CLASS OR RARITY..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-850 rounded px-9 py-2 text-[10px] font-mono focus:outline-none focus:border-cyan-500/50 placeholder:text-zinc-600 block uppercase text-white"
                      />
                      {historySearch && (
                        <button
                          onClick={() => setHistorySearch('')}
                          className="absolute right-3 top-2.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase"
                        >
                          [clear]
                        </button>
                      )}
                    </div>

                    <div className="relative shrink-0 flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-850 rounded px-2">
                      <ArrowUpDown size={11} className="text-cyan-500/80" />
                      <select
                        value={historySortBy}
                        onChange={(e) => {
                          setHistorySortBy(e.target.value);
                          addLog(`ARCHIVE SYSTEM // INTELLIGENCE ARCHIVE SORT APPLIED: [${e.target.value.toUpperCase()}]`);
                        }}
                        className="bg-transparent text-cyan-400 hover:text-cyan-300 text-[9px] font-mono focus:outline-none uppercase cursor-pointer py-1.5 h-full transition-all border-none outline-none pr-1"
                        title="Sort Saved History Records"
                      >
                        <option value="date-desc" className="bg-[#06080c] text-zinc-300">Date: Newest</option>
                        <option value="date-asc" className="bg-[#06080c] text-zinc-300">Date: Oldest</option>
                        <option value="rarity-desc" className="bg-[#06080c] text-zinc-300">Rarity: Highest</option>
                        <option value="rarity-asc" className="bg-[#06080c] text-zinc-300">Rarity: Lowest</option>
                        <option value="class-asc" className="bg-[#06080c] text-zinc-300">Class: A-Z</option>
                        <option value="class-desc" className="bg-[#06080c] text-zinc-300">Class: Z-A</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono">
                    <span className="text-zinc-500 uppercase tracking-widest">
                      ACTIVE REGULATION CLASSIFICATIONS
                    </span>
                    {intelHistory.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to purge the Oracle Archives?")) {
                            clearIntelHistory();
                          }
                        }}
                        className="text-red-400/80 hover:text-red-400 uppercase tracking-wider flex items-center gap-1 font-bold cursor-pointer hover:underline border-0 bg-transparent"
                      >
                        <Trash2 size={10} />
                        Purge Registry Vault
                      </button>
                    )}
                  </div>

                  {/* Explicit custom Compare Signals controls strip */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                    <button
                      onClick={() => {
                        const newMode = !isCompareMode;
                        setIsCompareMode(newMode);
                        if (!newMode) {
                          setCompareSelection([]);
                        }
                        addLog(newMode ? "ACTIVE // INITIATING COMPARATIVE VARIANCE SPECTRUM" : "DISCONNECT // REGISTER COMPARISON DECAY");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[9px] font-mono font-bold tracking-widest cursor-pointer transition-all ${
                        isCompareMode 
                          ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.25)]' 
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <GitCompare size={12} className={isCompareMode ? "animate-spin" : ""} />
                      <span>{isCompareMode ? "COMPARE ACTIVE" : "COMPARE SIGNALS"}</span>
                    </button>

                    {isCompareMode && (
                      <div className="flex items-center gap-2 text-[8px] font-mono">
                        <span className="text-zinc-500">CHANNELS:</span>
                        <span className={`px-1.5 py-0.5 rounded font-black ${
                          compareSelection.length === 2 ? 'bg-purple-950 text-purple-300 border border-purple-900/50' : 'bg-zinc-900 text-zinc-455'
                        }`}>
                          {compareSelection.length} / 2
                        </span>
                        {compareSelection.length > 0 && (
                          <button
                            onClick={() => {
                              setCompareSelection([]);
                              addLog("RESET COMPARE CHANNELS");
                            }}
                            className="text-zinc-500 hover:text-zinc-300 underline uppercase cursor-pointer"
                          >
                            [reset]
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items collection view */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
                  {(() => {
                    const filtered = intelHistory.filter((item) => {
                      const searchLower = historySearch.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(searchLower) ||
                        item.class.toLowerCase().includes(searchLower) ||
                        item.rarity.toLowerCase().includes(searchLower) ||
                        item.origin.toLowerCase().includes(searchLower) ||
                        item.oracleId.toLowerCase().includes(searchLower) ||
                        (item.loreFragment && item.loreFragment.toLowerCase().includes(searchLower))
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60 my-auto">
                          <BookOpen className="w-10 h-10 text-zinc-750 mb-2 animate-bounce" />
                          <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                            No Chronicles Catalogued
                          </div>
                          <p className="text-[8px] font-mono text-zinc-600 max-w-[280px] leading-relaxed mt-1 uppercase">
                            Export your synthesized gate assets as Calibration Metadata, Cine-Reels or Variant Sheets to record Oracle intel.
                          </p>
                        </div>
                      );
                    }

                    const itemA = compareSelection[0] ? filtered.find(it => it.oracleId === compareSelection[0]) || intelHistory.find(it => it.oracleId === compareSelection[0]) : null;
                    const itemB = compareSelection[1] ? filtered.find(it => it.oracleId === compareSelection[1]) || intelHistory.find(it => it.oracleId === compareSelection[1]) : null;

                    const sortedFiltered = [...filtered].sort((a, b) => {
                      if (historySortBy === 'date-desc') {
                        return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
                      }
                      if (historySortBy === 'date-asc') {
                        return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
                      }
                      if (historySortBy === 'rarity-desc') {
                        const scoreA = getRarityScoreAndSettings(a.rarity).score;
                        const scoreB = getRarityScoreAndSettings(b.rarity).score;
                        if (scoreA !== scoreB) {
                          return scoreB - scoreA;
                        }
                        return a.name.localeCompare(b.name);
                      }
                      if (historySortBy === 'rarity-asc') {
                        const scoreA = getRarityScoreAndSettings(a.rarity).score;
                        const scoreB = getRarityScoreAndSettings(b.rarity).score;
                        if (scoreA !== scoreB) {
                          return scoreA - scoreB;
                        }
                        return a.name.localeCompare(b.name);
                      }
                      if (historySortBy === 'class-asc') {
                        const cmp = a.class.localeCompare(b.class);
                        if (cmp !== 0) return cmp;
                        return a.name.localeCompare(b.name);
                      }
                      if (historySortBy === 'class-desc') {
                        const cmp = b.class.localeCompare(a.class);
                        if (cmp !== 0) return cmp;
                        return a.name.localeCompare(b.name);
                      }
                      return 0;
                    });

                    return (
                      <>
                        {isCompareMode && itemA && itemB && (
                          <div className="mb-4 shrink-0 transition-all duration-300">
                            <ArchiveCompareChart itemA={itemA} itemB={itemB} />
                            
                            {/* Action CTA Row */}
                            <div className="mt-2.5 flex gap-2">
                              <button
                                onClick={() => restoreIntelAsset(itemA)}
                                className="flex-1 py-1.5 px-2.5 bg-cyan-950/20 hover:bg-cyan-950/50 border border-cyan-500/20 text-[8px] font-mono font-bold tracking-widest text-[#06b6d4] rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <Sparkles size={10} />
                                <span>LOAD CHANNEL ALPHA</span>
                              </button>
                              <button
                                onClick={() => restoreIntelAsset(itemB)}
                                className="flex-1 py-1.5 px-2.5 bg-purple-950/20 hover:bg-purple-950/50 border border-purple-500/20 text-[8px] font-mono font-bold tracking-widest text-purple-300 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <Sparkles size={10} />
                                <span>LOAD CHANNEL BETA</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <AnimatePresence mode="popLayout" initial={false}>
                          {sortedFiltered.map((item, index) => {
                            const selectedIdx = compareSelection.indexOf(item.oracleId);
                            const isAlpha = selectedIdx === 0;
                            const isBeta = selectedIdx === 1;

                            return (
                              <motion.div
                                key={item.oracleId + '-' + index}
                                initial={{ opacity: 0, x: 40, scale: 0.97, skewX: -4 }}
                                animate={{ 
                                  opacity: [0, 0.4, 0.15, 0.85, 0.3, 1],
                                  x: 0,
                                  scale: 1,
                                  skewX: 0
                                }}
                                exit={{ 
                                  opacity: 0, 
                                  x: -40, 
                                  scale: 0.95,
                                  transition: { duration: 0.2, ease: "easeIn" } 
                                }}
                                layout
                                transition={{ 
                                  duration: 0.5,
                                  ease: "easeInOut",
                                  delay: Math.min(index * 0.04, 0.3),
                                  opacity: {
                                    times: [0, 0.12, 0.24, 0.36, 0.48, 1],
                                    duration: 0.45
                                  },
                                  layout: {
                                    type: "spring",
                                    stiffness: 220,
                                    damping: 24
                                  }
                                }}
                                className={`group/item relative rounded-xl p-4 transition-all flex flex-col gap-2.5 overflow-hidden border ${
                                  isAlpha ? 'bg-[#06151b]/40 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]' :
                                  isBeta ? 'bg-[#10031c]/40 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)]' :
                                  'bg-zinc-950/60 border-zinc-900/40 hover:border-cyan-500/20 hover:bg-[#070b10]'
                                }`}
                              >
                                {/* Holographic Signal Scan Line */}
                                <motion.div 
                                  className={`absolute left-0 right-0 h-[2px] z-10 pointer-events-none ${
                                    isAlpha ? 'bg-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.8)]' :
                                    isBeta ? 'bg-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.8)]' :
                                    'bg-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                                  }`}
                                  initial={{ top: "-10%" }}
                                  animate={{ top: "110%" }}
                                  transition={{ duration: 0.6, ease: "linear", delay: Math.min(index * 0.04, 0.3) }}
                                />

                                {/* Item glow overlay */}
                                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-xl pointer-events-none ${
                                  isAlpha ? 'bg-cyan-500/[0.04]' :
                                  isBeta ? 'bg-purple-500/[0.04]' :
                                  'bg-cyan-500/[0.02] group-hover/item:bg-cyan-500/[0.04]'
                                }`} />
                                
                                <div className="flex justify-between items-start border-b border-white/5 pb-1.5">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[6.5px] font-mono text-zinc-550 uppercase">
                                        REGISTER DIRECTORY // {item.oracleId}
                                      </span>
                                      {isAlpha && (
                                        <span className="text-[6.5px] font-mono px-1 py-0.5 bg-cyan-950/80 border border-cyan-800 text-cyan-400 rounded font-black tracking-widest">
                                          ALPHA
                                        </span>
                                      )}
                                      {isBeta && (
                                        <span className="text-[6.5px] font-mono px-1 py-0.5 bg-purple-950/80 border border-purple-800 text-purple-400 rounded font-black tracking-widest">
                                          BETA
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`text-[11px] font-serif font-bold tracking-wide truncate pr-3 transition-colors uppercase ${
                                      isAlpha ? 'text-cyan-300' :
                                      isBeta ? 'text-purple-300' :
                                      'text-white group-hover/item:text-cyan-300'
                                    }`}>
                                      {item.name}
                                    </h4>
                                  </div>
                                  <button
                                    onClick={() => deleteIntelFromHistory(item.oracleId)}
                                    className="text-zinc-600 hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-all cursor-pointer opacity-0 group-hover/item:opacity-100 border-0 bg-transparent"
                                    title="Delete Record"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                                  <div>
                                    <span className="text-zinc-600 block uppercase tracking-wider text-[6.5px]">
                                      Artifact Classification
                                    </span>
                                    <span className="text-zinc-400 truncate block font-bold">
                                      {item.class}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-600 block uppercase tracking-wider text-[6.5px]">
                                      Signal Rarity
                                    </span>
                                    <span className="text-brand-cyan truncate block font-bold">
                                      {item.rarity}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[8px] font-mono">
                                  <span className="text-zinc-600 block uppercase tracking-wider text-[6.5px]">
                                    Coordinate Origin Zone
                                  </span>
                                  <span className="text-zinc-500 block truncate font-medium">
                                    {item.origin}
                                  </span>
                                </div>

                                {item.loreFragment && (
                                  <div className="text-[8px] font-mono bg-zinc-950/20 border border-zinc-900/40 p-1.5 rounded">
                                    <span className="text-zinc-650 block uppercase tracking-wider text-[6.5px] mb-0.5">
                                      Lore Snippet
                                    </span>
                                    <p className="text-zinc-400 font-serif italic leading-relaxed">
                                      "{item.loreFragment}"
                                    </p>
                                  </div>
                                )}

                                <div className="border-t border-zinc-900/60 pt-2 flex items-center justify-between text-[7px] font-mono text-zinc-500 shrink-0">
                                  <span className="truncate max-w-[170px] uppercase">
                                    SIG: {item.hash.substring(0, 14)}...
                                  </span>
                                  <span className="text-zinc-600 uppercase">
                                    STAMP: {new Date(item.scannedAt).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Custom selection state or load trigger */}
                                {isCompareMode ? (
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const prev = compareSelection;
                                        if (prev.includes(item.oracleId)) {
                                          setCompareSelection(prev.filter(id => id !== item.oracleId));
                                          addLog(`DE-ASSIGNED COMPARE CODECHANNEL: [${item.oracleId}]`);
                                        } else {
                                          if (prev.length >= 2) {
                                            setCompareSelection([prev[1], item.oracleId]);
                                            addLog(`ROTATED COMPARE BUFFER: ASSIGNED [${item.oracleId}]`);
                                          } else {
                                            setCompareSelection([...prev, item.oracleId]);
                                            addLog(`ASSIGNED COMPARE DECODER: [${item.oracleId}]`);
                                          }
                                        }
                                      }}
                                      className={`flex-1 py-1 px-2.5 text-[8px] font-mono font-bold tracking-widest rounded flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                        isAlpha ? 'bg-cyan-950/40 border-cyan-500/55 text-cyan-200 shadow-[inset_0_0_6px_rgba(6,182,212,0.2)]' :
                                        isBeta ? 'bg-purple-950/40 border-purple-500/55 text-purple-200 shadow-[inset_0_0_6px_rgba(168,85,247,0.2)]' :
                                        'bg-zinc-950 border-zinc-850 text-zinc-500 hover:border-zinc-700 hover:text-white'
                                      }`}
                                    >
                                      {isAlpha && <Zap size={10} className="text-cyan-400 animate-pulse" />}
                                      {isBeta && <Zap size={10} className="text-purple-400 animate-pulse" />}
                                      <span>
                                        {isAlpha ? "ALPHA BEACON // ASSIGNED" :
                                         isBeta ? "BETA BEACON // ASSIGNED" :
                                         "ASSIGN BEACON FOR COMPARE"}
                                      </span>
                                    </button>
                                  </div>
                                ) : (
                                  /* Load / Restore CTA */
                                  <div className="mt-1 flex items-center gap-1.5 opacity-80 group-hover/item:opacity-100">
                                    <button
                                      onClick={() => restoreIntelAsset(item)}
                                      className="flex-1 py-1 px-2.5 bg-cyan-950/20 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-400/50 text-[8px] font-mono font-bold tracking-widest text-cyan-300 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      title="Re-synthesize this asset dynamically"
                                    >
                                      <Sparkles size={10} />
                                      <span>LOAD RESONANCE CHANNEL</span>
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </>
                    );
                  })()}
                </div>

                {/* Footer status bar */}
                <div className="p-3 bg-zinc-950 border-t border-white/5 flex justify-between items-center text-[7.5px] font-mono text-zinc-600 uppercase shrink-0">
                  <span>VAULT CONSOLE v3.1 ACTIVE</span>
                  <span>STANDBY SECURE NETWORK</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Global Error Notice overlay */}
        {error && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-red-950/90 border border-red-500 px-6 py-2.5 rounded-lg flex items-center gap-3 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono text-red-200">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-xs font-mono text-white/50 hover:text-white ml-4 uppercase"
            >
              [dismiss]
            </button>
          </div>
        )}

        {/* Floating Toast Notification Stack */}
        <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-2 max-w-sm pointer-events-none">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => {
              let icon = <Info size={11} className="text-cyan-400" />;
              let borderColor = "border-cyan-500/30";
              let glowColor = "shadow-[0_0_12px_rgba(6,182,212,0.12)]";
              let textColor = "text-cyan-300";
              let bg = "bg-black/90";

              if (toast.type === 'success') {
                icon = <ShieldCheck size={11} className="text-emerald-400" />;
                borderColor = "border-emerald-500/30";
                glowColor = "shadow-[0_0_12px_rgba(16,185,129,0.12)]";
                textColor = "text-emerald-300";
                bg = "bg-black/90";
              } else if (toast.type === 'warning') {
                icon = <AlertTriangle size={11} className="text-amber-400" />;
                borderColor = "border-amber-500/30";
                glowColor = "shadow-[0_0_12px_rgba(245,158,11,0.12)]";
                textColor = "text-amber-300";
                bg = "bg-black/90";
              } else if (toast.type === 'error') {
                icon = <X size={11} className="text-rose-400" />;
                borderColor = "border-rose-500/30";
                glowColor = "shadow-[0_0_12px_rgba(244,63,94,0.12)]";
                textColor = "text-rose-300";
                bg = "bg-black/90";
              }

              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.15 } }}
                  className={`pointer-events-auto flex items-start gap-2 px-2.5 py-2 ${bg} backdrop-blur-md border ${borderColor} rounded shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${glowColor} font-mono w-[260px] text-[8.5px] uppercase leading-tight tracking-wider select-none`}
                >
                  <div className="mt-[2px] shrink-0">{icon}</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[6px] text-zinc-500 font-bold tracking-widest pb-0.5 border-b border-zinc-850/65 mb-1.5">
                      <span>SYSTEM TRANSMISSION</span>
                      <span className={toast.type === 'success' ? 'text-emerald-500' : toast.type === 'warning' ? 'text-amber-500' : toast.type === 'error' ? 'text-rose-500' : 'text-cyan-500'}>{toast.type}</span>
                    </div>
                    <span className={textColor}>{toast.message}</span>
                  </div>
                  <button
                    onClick={() => {
                      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                    }}
                    className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 ml-1.5 cursor-pointer"
                  >
                    <X size={9} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
