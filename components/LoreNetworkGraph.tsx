import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { LoreTerm } from '../App';
import { RefreshCw, Radio, Zap, Shield, Cpu, HelpCircle } from 'lucide-react';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  term: LoreTerm;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
}

interface LoreNetworkGraphProps {
  terms: LoreTerm[];
  onSelectTerm?: (term: LoreTerm) => void;
  selectedActiveTerm?: LoreTerm | null;
}

export const LoreNetworkGraph: React.FC<LoreNetworkGraphProps> = ({
  terms,
  onSelectTerm,
  selectedActiveTerm
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [chargeStrength, setChargeStrength] = useState<number>(-160);
  const [connectionDensity, setConnectionDensity] = useState<'high' | 'low'>('high');

  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Keep selected node state in sync with parent prop
  useEffect(() => {
    if (selectedActiveTerm) {
      const match = nodes.find(n => n.id === selectedActiveTerm.term);
      if (match) setSelectedNode(match);
    }
  }, [selectedActiveTerm, nodes]);

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 350)
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute connections matching terms
  const buildGraphData = (): { nodes: GraphNode[]; links: GraphLink[] } => {
    // Deep clone to prevent mutating active components
    const graphNodes: GraphNode[] = terms.map((t) => ({
      id: t.term,
      term: t
    }));

    const graphLinks: GraphLink[] = [];

    for (let i = 0; i < terms.length; i++) {
      const termA = terms[i];
      const defLower = termA.definition.toLowerCase();

      // Path 1: Check direct word mentions in definitions (creates high affinity edges)
      for (let j = 0; j < terms.length; j++) {
        if (i === j) continue;
        const termB = terms[j];
        const nameLower = termB.term.toLowerCase();

        if (defLower.includes(nameLower)) {
          graphLinks.push({
            source: termA.term,
            target: termB.term,
            weight: 2
          });
        }
      }

      // Path 2: Check standard categories for clustering (creates looser ambient background ties)
      if (connectionDensity === 'high') {
        for (let j = i + 1; j < terms.length; j++) {
          const termB = terms[j];
          if (termA.category && termB.category && termA.category === termB.category) {
            const alreadyLinked = graphLinks.some(
              (l) =>
                (l.source === termA.term && l.target === termB.term) ||
                (l.source === termB.term && l.target === termA.term)
            );
            if (!alreadyLinked) {
              graphLinks.push({
                source: termA.term,
                target: termB.term,
                weight: 1
              });
            }
          }
        }
      }
    }

    return { nodes: graphNodes, links: graphLinks };
  };

  // Run the force simulation
  useEffect(() => {
    const { nodes: initialNodes, links: initialLinks } = buildGraphData();

    // Prevent fully blank states
    if (initialNodes.length === 0) {
      setNodes([]);
      setLinks([]);
      return;
    }

    // Preserve positions of existing nodes if available to prevent massive visual jumping
    initialNodes.forEach((n) => {
      const existing = nodes.find((oldNode) => oldNode.id === n.id);
      if (existing) {
        n.x = existing.x;
        n.y = existing.y;
        n.vx = existing.vx;
        n.vy = existing.vy;
      } else {
        // Place new nodes slightly spread from the center to assist force convergence
        n.x = dimensions.width / 2 + (Math.random() - 0.5) * 50;
        n.y = dimensions.height / 2 + (Math.random() - 0.5) * 50;
      }
    });

    const simulation = d3
      .forceSimulation<GraphNode>(initialNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(initialLinks)
          .id((d) => d.id)
          .distance((d) => (d.weight === 2 ? 65 : 100))
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(28))
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    simulation.on('tick', () => {
      setNodes([...initialNodes]);
      setLinks([...initialLinks]);
    });

    return () => {
      simulation.stop();
    };
  }, [terms, dimensions.width, dimensions.height, chargeStrength, connectionDensity]);

  // Restart simulation helper
  const reheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  // Helper selectors for typesafety
  const getSourceId = (link: GraphLink): string => {
    return typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
  };

  const getTargetId = (link: GraphLink): string => {
    return typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
  };

  // Mouse drag handlers on nodes
  const handleNodeMouseDown = (e: React.MouseEvent<SVGGElement>, node: GraphNode) => {
    e.preventDefault();
    setDraggedNode(node);
    node.fx = node.x;
    node.fy = node.y;
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedNode || !svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Keep inside bounds
      draggedNode.fx = Math.max(15, Math.min(dimensions.width - 15, x));
      draggedNode.fy = Math.max(15, Math.min(dimensions.height - 15, y));
    };

    const handleMouseUp = () => {
      if (draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        setDraggedNode(null);
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
      }
    };

    if (draggedNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNode, dimensions.width, dimensions.height]);

  // Determine connectedness for highlighted states
  const getConnectedTermNames = (nodeId: string): string[] => {
    const direct: string[] = [];
    links.forEach((l) => {
      const s = getSourceId(l);
      const t = getTargetId(l);
      if (s === nodeId) direct.push(t);
      if (t === nodeId) direct.push(s);
    });
    return [nodeId, ...direct];
  };

  const highlightedGroup = hoveredNode ? getConnectedTermNames(hoveredNode) : [];

  return (
    <div className="w-full h-full flex flex-col bg-[#080607] text-zinc-100 font-mono text-[10px] relative select-none">
      {/* Top dashboard control shelf */}
      <div className="p-3 bg-zinc-950/80 border-b border-zinc-900 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          <span className="text-[8px] font-black tracking-widest text-zinc-400">COAXIAL RESONANCE GRAPH / {nodes.length} NODES</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection Density toggle */}
          <button
            onClick={() => setConnectionDensity(d => d === 'high' ? 'low' : 'high')}
            className={`px-1.5 py-0.5 rounded text-[7px] border font-black transition-all ${
              connectionDensity === 'high'
                ? 'bg-amber-950/30 border-amber-800/40 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle category-based connection clustering lines"
          >
            {connectionDensity === 'high' ? 'DENSITY: HIGH' : 'DENSITY: STRUCTURAL'}
          </button>

          {/* Reset Physics Heat */}
          <button
            onClick={reheatSimulation}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-850 hover:text-amber-400 border border-zinc-800 hover:border-amber-900/30 transition-all flex items-center gap-1 cursor-pointer"
            title="Re-stabilize physics vectors"
          >
            <RefreshCw size={10} className="text-zinc-400 group-hover:text-amber-400" />
            <span className="text-[7.5px] font-bold">RE-HEAT</span>
          </button>
        </div>
      </div>

      {/* Main Physics Area */}
      <div ref={containerRef} className="flex-1 w-full relative bg-[#090708] overflow-hidden">
        {/* Force controls overlay overlay */}
        <div className="absolute top-2 left-3 z-10 flex flex-col gap-1 text-[7px] text-zinc-500 font-bold bg-black/60 p-2 border border-zinc-900/50 rounded pointer-events-auto">
          <span>CHARGE VECTOR STRENGTH:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min="-300"
              max="-50"
              step="10"
              value={chargeStrength}
              onChange={(e) => setChargeStrength(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-850 rounded accent-amber-500 focus:outline-none"
            />
            <span className="text-amber-400">{chargeStrength}</span>
          </div>
          <span className="text-[6.5px] text-zinc-600 mt-1 uppercase">DRAG NODES TO DISTORT STRUCTURE</span>
        </div>

        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-2">
            <Radio size={20} className="text-zinc-700 animate-pulse" />
            <span className="text-zinc-600 font-bold uppercase tracking-widest text-[8px]">AMORPHOUS MATRIX // AWAITING FREQUENCIES</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            id="lore-resonance-svg"
          >
            {/* Ambient grid background pattern pattern */}
            <defs>
              <pattern id="graph-panel-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(245,158,11,0.015)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-panel-grid)" />

            {/* Links / Edges */}
            <g id="links-group">
              {links.map((link, idx) => {
                const sourceNode = typeof link.source === 'string' ? null : (link.source as GraphNode);
                const targetNode = typeof link.target === 'string' ? null : (link.target as GraphNode);

                if (!sourceNode || !targetNode) return null;

                const sId = sourceNode.id;
                const tId = targetNode.id;

                // Connection highlights highlight during node selection or hover
                const isHighlighted = hoveredNode 
                  ? (sId === hoveredNode || tId === hoveredNode)
                  : selectedNode
                  ? (sId === selectedNode.id || tId === selectedNode.id)
                  : false;

                const isDimmed = (hoveredNode && !isHighlighted) || (selectedNode && !isHighlighted);

                return (
                  <line
                    key={`link-${idx}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={
                      isHighlighted 
                        ? (sourceNode.term.source === 'Archival Decryption' || targetNode.term.source === 'Archival Decryption' ? '#f43f5e' : '#f59e0b')
                        : '#3f3f46'
                    }
                    strokeWidth={isHighlighted ? 1.6 : link.weight === 2 ? 1 : 0.6}
                    strokeOpacity={isDimmed ? 0.08 : isHighlighted ? 0.95 : 0.45}
                    strokeDasharray={link.weight === 1 ? "3,3" : undefined}
                    className="transition-all duration-350"
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g id="nodes-group">
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode === node.id;
                const isIncludedInHighlight = hoveredNode ? highlightedGroup.includes(node.id) : true;
                const isDimmed = !isIncludedInHighlight && hoveredNode !== null;

                // Color schemes: Core (Amber), Decrypted (Rose)
                const isDecrypted = node.term.source === 'Archival Decryption';
                const nodeColor = isDecrypted ? '#e11d48' : '#d97706';
                const glowColor = isDecrypted ? 'rgba(244,63,94,0.45)' : 'rgba(245,158,11,0.3)';

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${node.x || 0}, ${node.y || 0})`}
                    className="cursor-pointer group select-none"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    onClick={() => {
                      setSelectedNode(node);
                      if (onSelectTerm) onSelectTerm(node.term);
                    }}
                  >
                    {/* Ring highlight behind selected */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={16}
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth={1.5}
                        strokeDasharray="4,2"
                        className="animate-[spin_8s_linear_infinite]"
                      />
                    )}

                    {/* Nodes sphere circle */}
                    <circle
                      r={isSelected ? 10 : isHovered ? 8.5 : 7}
                      fill={isSelected ? '#0c0a09' : nodeColor}
                      stroke={isSelected ? nodeColor : '#18181b'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      className="transition-all duration-200"
                      style={{
                        filter: isHovered || isSelected ? `drop-shadow(0 0 6px ${glowColor})` : undefined,
                        opacity: isDimmed ? 0.35 : 1
                      }}
                    />

                    {/* Small inner design dot for premium feel */}
                    <circle
                      r={2}
                      fill={isSelected ? nodeColor : '#ffffff'}
                      opacity={isDimmed ? 0.2 : 0.8}
                    />

                    {/* Node text anchor labeled dynamically */}
                    {(isHovered || isSelected || nodes.length < 16) && (
                      <text
                        y={isSelected ? -14 : -11}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : isHovered ? '#f4f4f5' : '#a1a1aa'}
                        fontSize={isSelected ? "8px" : "7px"}
                        fontWeight={isSelected ? "900" : "500"}
                        className="pointer-events-none tracking-widest text-[7px]"
                        style={{
                          opacity: isDimmed ? 0.25 : 1,
                          textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)'
                        }}
                      >
                        {node.id.toUpperCase()}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Absolute context details HUD */}
      <div className="shrink-0 max-h-[140px] bg-[#100c0e]/95 border-t border-amber-900/20 p-3 flex flex-col gap-2 relative">
        <div className="absolute top-0.5 right-3 text-[5.5px] text-zinc-650 tracking-[0.25em] font-bold">NODE_TELEMETRY INTERFACE</div>
        
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black tracking-widest text-[#f59e0b] group flex items-center gap-1">
                  <Cpu size={10} className="text-amber-500" />
                  {selectedNode.term.term.toUpperCase()}
                  <span className="text-[6.5px] text-[#e11d48]/90 font-mono font-medium px-1 py-0.2 ml-2 bg-rose-950/20 border border-rose-900/30 rounded-sm">
                    {selectedNode.term.category.toUpperCase()}
                  </span>
                </span>
                
                <span className="text-[7.5px] text-zinc-500">
                  SOURCE: <span className={selectedNode.term.source === 'Archival Decryption' ? 'text-rose-400 font-bold' : 'text-amber-500/80 font-bold'}>
                    {selectedNode.term.source.toUpperCase()}
                  </span>
                </span>
              </div>
              
              <p className="text-[8.5px] leading-relaxed text-zinc-300 overflow-y-auto max-h-[70px] pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {selectedNode.term.definition}
              </p>

              {selectedNode.term.relicName && (
                <div className="text-[6.5px] text-zinc-500 uppercase flex justify-between items-center pt-1 border-t border-zinc-900/40">
                  <span>UNCOVERED AT RELIC: <span className="text-rose-400 font-bold">{selectedNode.term.relicName}</span></span>
                  <span>ORACLE_ID: <span className="text-zinc-400 font-bold">{selectedNode.term.oracleId}</span></span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4 text-zinc-550 gap-1 select-none">
              <Zap size={13} className="text-zinc-700 animate-pulse" />
              <span className="text-[7.5px] font-bold tracking-widest uppercase">Select an energy node to map its connection frequencies</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
