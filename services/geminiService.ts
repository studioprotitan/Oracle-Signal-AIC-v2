/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, GeneratedImage } from "../types";

export const generateFallbackSVG = (query: string): string => {
  const cleanQuery = (query || "ANCIENT RELIC").toUpperCase();
  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%" fill="none" style="background:#020617; font-family: monospace;">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.05)" stroke-width="1"/>
      </pattern>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0e7490" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
      </radialGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#grid)" />
    <circle cx="600" cy="337" r="400" fill="url(#glow)" />
    
    <!-- Outer Rings -->
    <circle cx="600" cy="337" r="280" fill="none" stroke="#0891b2" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="8 6" />
    <circle cx="600" cy="337" r="250" fill="none" stroke="#06b6d4" stroke-width="1" stroke-opacity="0.2" />
    <circle cx="600" cy="337" r="200" fill="none" stroke="#3b82f6" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="400 10 50 15 100 20" />
    
    <!-- Crosshairs and Coordinates -->
    <path d="M 600 50 L 600 625 M 300 337 L 900 337" stroke="rgba(6, 182, 212, 0.15)" stroke-width="0.8" />
    <circle cx="600" cy="337" r="6" fill="#06b6d4" />
    
    <!-- Central Hex Core Relic Structure -->
    <polygon points="600,217 704,277 704,397 600,457 496,397 496,277" fill="none" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.7" stroke-dasharray="10 5" />
    <polygon points="600,237 687,287 687,387 600,437 513,387 513,287" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-opacity="0.5" />
    
    <!-- Orbiting nodes representing interaction zones -->
    <circle cx="687" cy="287" r="8" fill="#f59e0b" stroke="#020617" stroke-width="2" />
    <circle cx="513" cy="387" r="8" fill="#3b82f6" stroke="#020617" stroke-width="2" />
    <circle cx="600" cy="217" r="5" fill="#10b981" />
    
    <!-- Aesthetic UI Text -->
    <text x="600" y="140" text-anchor="middle" fill="#06b6d4" font-size="12" font-weight="bold" letter-spacing="6" opacity="0.8">ARCHIVAL SPECTRAL SCAN</text>
    <text x="600" y="175" text-anchor="middle" fill="#f59e0b" font-size="28" font-weight="900" letter-spacing="4" filter="drop-shadow(0 0 10px rgba(245,158,11,0.35))">${cleanQuery}</text>
    
    <!-- Technical Labels -->
    <text x="100" y="80" fill="rgba(6, 182, 212, 0.4)" font-size="9">SYS.ORIGIN: CONSOLE_ALPHA</text>
    <text x="100" y="100" fill="rgba(6, 182, 212, 0.4)" font-size="9">SECTOR: ARC-770 // WETNESS-88%</text>
    <text x="100" y="120" fill="rgba(6, 182, 212, 0.4)" font-size="9">COORD: 45.9221 / -12.441</text>
    
    <text x="1100" y="80" text-anchor="end" fill="rgba(245, 158, 11, 0.5)" font-size="9">RELIANCE FALLBACK: VE-3 ACTIVE</text>
    <text x="1100" y="100" text-anchor="end" fill="rgba(6, 182, 212, 0.4)" font-size="9">STATUS: COAXIAL RECONSTRUCTION</text>
    <text x="1100" y="120" text-anchor="end" fill="rgba(6, 182, 212, 0.4)" font-size="9">COMPILER: DECK ENGINE PROX</text>
    
    <path d="M 100 135 L 280 135" stroke="rgba(6, 182, 212, 0.2)" stroke-width="1" />
    <path d="M 920 135 L 1100 135" stroke="rgba(245, 158, 11, 0.25)" stroke-width="1" />
    
    <!-- Sub-labels corresponding to coordinates or analysis spots -->
    <g transform="translate(714, 260)">
      <rect width="135" height="34" rx="4" fill="#020617" fill-opacity="0.9" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.6" />
      <text x="10" y="15" fill="#f59e0b" font-size="9" font-weight="bold">NODE A: APERTURE</text>
      <text x="10" y="26" fill="rgba(245, 158, 11, 0.8)" font-size="8">SIG.VIBRATION: 46Hz</text>
    </g>
    
    <g transform="translate(350, 400)">
      <rect width="135" height="34" rx="4" fill="#020617" fill-opacity="0.9" stroke="#3b82f6" stroke-width="1" stroke-opacity="0.6" />
      <text x="10" y="15" fill="#3b82f6" font-size="9" font-weight="bold">NODE B: RESONATOR</text>
      <text x="10" y="26" fill="rgba(59, 130, 246, 0.8)" font-size="8">SWEEP_PULSE: ACTIVE</text>
    </g>
    
    <g transform="translate(714, 405)">
      <rect width="135" height="34" rx="4" fill="#020617" fill-opacity="0.9" stroke="#10b981" stroke-width="1" stroke-opacity="0.6" />
      <text x="10" y="15" fill="#10b981" font-size="9" font-weight="bold">NODE C: WELDER CORE</text>
      <text x="10" y="26" fill="rgba(16, 185, 129, 0.8)" font-size="8">SYS_YIELD: 10kV</text>
    </g>
  </svg>`;
  return btoa(rawSvg);
};

export const generateFallbackAnalysis = (query: string): AnalysisResult => {
  const clean = (query || "Relic").charAt(0).toUpperCase() + (query || "Relic").slice(1);
  return {
    segments: [
      {
        label: `${clean} Aperture Matrix`,
        format: "compact",
        description: `Central optical detector array tracking spectral fluctuations of ${clean} in real-time. Programmed specifically to isolate blue-spectral lightwaves in the flooded archival reservoir.`,
        category: "structure",
        icon: "👁️",
        sourceUrl: "https://en.wikipedia.org/wiki/Aperture",
        sourceName: "Wikipedia",
        bounds: { x: 57, y: 35, width: 14, height: 10 }
      },
      {
        label: `${clean} Quantum Resonator`,
        format: "stats",
        description: `Enforces standard coordinate calibration signals and prevents phase-shift detuning. Perfect locking limits frequencies from drifting into high spectral distortion.`,
        category: "circuit",
        icon: "⚡",
        stats: [
          { label: "Resonant Pitch", value: "46.4 Hz" },
          { label: "Ambient Detune", value: "+1.5 Cents" }
        ],
        sourceUrl: "https://en.wikipedia.org/wiki/Resonator",
        sourceName: "Wikipedia",
        bounds: { x: 30, y: 55, width: 14, height: 10 }
      },
      {
        label: `${clean} Welder Core Catalyst`,
        format: "detailed",
        description: `Active thermo-mechanical welder core. Directs heavy sparks into target micro-gaps to weld relic anomalies and commit changes onto the persistent ledger deck. Requires target alignment in focus zone.`,
        category: "process",
        icon: "⚙️",
        stats: [
          { label: "Voltage Coupled", value: "10.0 kV" },
          { label: "Lock Stability", value: "Grid-Locked" }
        ],
        sourceUrl: "https://en.wikipedia.org/wiki/Arc_welding",
        sourceName: "Wikipedia",
        bounds: { x: 58, y: 56, width: 14, height: 10 }
      }
    ]
  };
};

export const generateInfographic = async (query: string): Promise<GeneratedImage> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Create a gorgeous visual archive relic representing canonic artifact or region themed on: "${query}"
For the visual style, adhere strictly to the GENESIS VERSE: ENIGMATIC GATEWAYS design guidelines:
- Atmospheric mythic-industrial, ritual-mechanical design
- Epic Unreal Engine 5 volumetric lighting with blue-white spectral illumination
- Wet, highly reflective surfaces and noir shadow play referencing a flooded station of Archivists
- Glassmorphic structures, holographic circles, and rotating sigils
- Immersive, sparse in-image text (let symbols, diagrams, and structures convey the narrative)
Never include typical flat infographics. This must look like a high-fidelity 3D rendering or cinematic cinematic game concept art of a mysterious machine, cosmic relic, or ancient mechanical chamber.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    // Extract Image
    let imageBase64: string | undefined;
    let mimeType = 'image/png';

    // The response structure for images in gemini-2.5-flash-image contains multiple parts
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
            imageBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
        }
      }
    }

    if (!imageBase64) {
      throw new Error("No image generated by the model.");
    }

    const groundingUrls: Array<{ title: string; uri: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach(chunk => {
            if (chunk.web) {
                groundingUrls.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri || '#' });
            }
        });
    }

    return {
      base64: imageBase64,
      mimeType,
      groundingUrls
    };

  } catch (error: any) {
    console.warn("Image Generation failed or was blocked by API restrictions. Using beautiful high-fidelity vector blueprint fallback.", error);
    // Graceful fallback to gorgeous interactive blueprint SVG vector image
    return {
      base64: generateFallbackSVG(query),
      mimeType: 'image/svg+xml',
      groundingUrls: [
        { title: "Standard Relic Blueprints", uri: "https://en.wikipedia.org/wiki/Blueprint" },
        { title: "Universal Coordinate Alignment", uri: "https://en.wikipedia.org/wiki/Grid_system" }
      ]
    };
  }
};

export const analyzeImageRegions = async (query: string, imageBase64: string): Promise<AnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Analyze this image about "${query}" and identify 4-6 distinct interesting regions, nodes, or arcane mechanisms to annotate.
Use Google Search to verify physical, astronomical, or mythical lore, and find reputable source URLs (Wikipedia or educational sites).

For each region, identify it as a functional component of this mythic-industrial console or relic.

CRITICAL CONTENT GUIDELINES:
- **IMMERSE AND INFORM:** Do not write simple descriptions. Write 2-3 sentences of evocative, educational, and fictionalized yet fact-grounded explanation. Explain *why* this part matters.
- **ICONS:** "icon" must be a SINGLE valid Emoji that visually represents the segment. Do not leave blank.
- **TONE:** Mythic-industrial, dark terminal archive, atmospheric.

For each segment, choose the BEST format from:
- "compact": Standard card for standard relic zones.
- "stats": Focus on numerical metrics or indicators (e.g. "Rift Frequency", "Wetness Index", "Spectral Yield").
- "detailed": Long-form explanation for the central subject.

Provide this data:
- "label": Name of the mechanism or structure (e.g., "Siren Acoustic Core", "Holo-Reel Reflector").
- "format": "compact" | "stats" | "detailed"
- "description": Rich text (approx 30-50 words).
- "category": "structure" | "relic" | "circuit" | "process" | "gateway"
- "icon": A single relevant emoji (e.g. 👁️, ⚡, ⚙️, 🔮, 🌊).
- "stats": Array of indicators (ONLY for stats/detailed formats) { "label", "value" }
- "sourceUrl": A relevant Wikipedia or educational URL found via search.
- "sourceName": Short name for the source.
- "bounds": { "x": number (0-100), "y": number (0-100), "width": number (0-100), "height": number (0-100) }

Mix formats. Ensure the "bounds" accurately target specific visual hotspots in the active image.

Return as JSON:
{
  "segments": [ ... ]
}

Return ONLY valid JSON.`;

  try {
    // If we are evaluating the fallback SVG, bypass remote ML analysis and immediately generate targeted analytical segments
    if (imageBase64 && imageBase64.startsWith("PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4") || imageBase64.includes("PHN2Zy") || imageBase64 === generateFallbackSVG(query)) {
      return generateFallbackAnalysis(query);
    }

    // Use gemini-3.5-flash as the highly reliable, free, multimodal grounding analysis model
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', 
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: {
          tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as AnalysisResult;

  } catch (error) {
    console.warn("Region analysis failed. Operating dynamic fallback coordinates overlay.", error);
    return generateFallbackAnalysis(query);
  }
};

export const generateFallbackIconSVG = (name: string): string => {
  const cleanName = (name || "RELIC").toUpperCase();
  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" fill="none" style="background:#020617; font-family: monospace;">
    <defs>
      <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#cbd5e1" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#475569" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    
    <!-- Background Glow -->
    <rect width="100%" height="100%" fill="#020617" />
    <circle cx="256" cy="256" r="220" fill="url(#ringGlow)" />
    
    <!-- Outer Arcane Circles -->
    <circle cx="256" cy="256" r="180" fill="none" stroke="#f43f5e" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="12 8" />
    <circle cx="256" cy="256" r="160" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.2" />
    <circle cx="256" cy="256" r="140" fill="none" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="180 30 40 10" />
    
    <!-- Heavy Inner Frame -->
    <polygon points="256,128 367,192 367,320 256,384 145,320 145,192" fill="none" stroke="url(#metalGrad)" stroke-width="4" stroke-opacity="0.8" />
    <polygon points="256,148 349,202 349,310 256,364 163,310 163,202" fill="none" stroke="#ec4899" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="8 4" />
    
    <!-- Central Sigil Star Core -->
    <circle cx="256" cy="256" r="32" fill="#010718" stroke="#38bdf8" stroke-width="2" />
    <path d="M 256 188 L 256 324 M 188 256 L 324 256" stroke="#f43f5e" stroke-width="1.5" stroke-opacity="0.7" />
    <circle cx="256" cy="256" r="8" fill="#38bdf8" />
    
    <text x="256" y="440" text-anchor="middle" fill="#f43f5e" font-size="14" font-weight="900" letter-spacing="4" opacity="0.8">TOKEN RECON</text>
  </svg>`;
  return btoa(rawSvg);
};

export const generateRelicIcon = async (loreFragment: string, artifactName: string): Promise<GeneratedImage> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Create a distinct, enigmatic 1:1 square relic icon, emblem, or coin for an ancient object named "${artifactName}".
Lore snippet for inspiration and detail direction: "${loreFragment}"
Visual requirements:
- Centered representational glyph, device, key, or crystal module
- Symmetrical arcane cybernetic markings and high-contrast lines
- Beautiful epic Unreal Engine 5 volumetric colored lights under dark/wet ambient
- Square composition fit for inventory avatar icon. No frame borders or device borders around it.
- No text embedded within the image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let imageBase64: string | undefined;
    let mimeType = 'image/png';

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
            imageBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
        }
      }
    }

    if (!imageBase64) {
      throw new Error("No relic icon generated by the model.");
    }

    return {
      base64: imageBase64,
      mimeType,
      groundingUrls: []
    };

  } catch (error: any) {
    console.warn("Relic Icon Generation failed or was blocked. Using fallback vector.", error);
    return {
      base64: generateFallbackIconSVG(artifactName),
      mimeType: 'image/svg+xml',
      groundingUrls: []
    };
  }
};

export const expandMythicLore = async (
  loreFragment: string,
  artifactName: string,
  artifactClass: string,
  rarity: string
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!apiKey) {
    // Fail fast gracefully if key missing, triggers fallback logic directly
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a Lead Archaeo-Cryptographer in a top-secret flooded station looking closely at a newly scanned MYTHIC/LEGENDARY artifact named "${artifactName}".
Class: "${artifactClass}"
Rarity: "${rarity}"
Known baseline lore: "${loreFragment}"

Generate a highly detailed, immersive sci-fi decryption report or archaeological dossier.
Use markdown tables or bullets, section headings, and advanced mysterious technical terminology.
Organize it into these sections:
1. ### 🛰️ COAXIAL ANALYTICAL METADATA
2. ### 🏺 ARCANE STRUCTURAL DOSSIER (Origin coordinates, material compilation, estimated epoch)
3. ### 📈 EXPERIMENTAL QUANTUM WAVEFORMS (Frequencies, phase shifts, temporal decay)
4. ### ⚠️ RECONSTRUCTIVE SAFEGUARDS & THREAT LEVELS

Ensure the tone is professional, sterile, but deeply mysterious and chilling. Limit the format to structured, engaging paragraph segments.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("Null generation response");
    return text;
  } catch (error: any) {
    console.warn("Mythic Lore decryption failed, using local matrix engine:", error);
    return `### 🛰️ COAXIAL ANALYTICAL METADATA
- **DECRYPTION HOST**: CORE_NODE_09
- **INTEGRITY INDEX**: 94.62% // DEGRADED
- **TARGET UNIQUE DESIGNATION**: ${artifactName.toUpperCase()}
- **REGISTRY EPOCH**: UNKNOWN [UNRESOLVED PHASE-ALIGNMENT]

### 🏺 ARCANE STRUCTURAL DOSSIER
The artifact cataloged as **${artifactName}** is composed of high-density crystalline composites and sub-atomic structures that diverge from conventional periodic elements. Spectroscopic reading reveals trace amounts of hyper-stable isotopes. Estimated epoch: approximately 4.2 billion cycles before present. Recovery files highlight finding this object within the deep subterranean flooded archival reservoir of Sector ARC-77.

### 📈 EXPERIMENTAL QUANTUM WAVEFORMS
- **Coaxial Resonance Frequency**: 77.21 Hz [Active oscillation sweep]
- **Spectral Deviation**: -0.015% [Indicates minor dimensional shift under scanning stress]
- **Thermal Flux**: Absolute Zero [Object remains at 0K while emitting extreme lightwaves in the infrared spectrum]

### ⚠️ RECONSTRUCTIVE SAFEGUARDS & THREAT LEVELS
- **Containment Vector**: Liquid-argon bath under 5.0 atm.
- **Critical Directive**: Under no standard operation should the resonance frequency exceed 80.0 Hz. Spectral overload risks localized field tearing. Use caution if using active ultrasound sensors.`;
  }
};
