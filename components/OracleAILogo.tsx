import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface OracleAILogoProps {
  isAnomalousEventActive: boolean;
  rarity?: string;
  className?: string;
  onClick?: () => void;
}

export const OracleAILogo: React.FC<OracleAILogoProps> = ({
  isAnomalousEventActive,
  rarity,
  className = "w-11 h-11",
  onClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const hoverRef = useRef<boolean>(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 44;
    const height = 44;
    const cx = width / 2;
    const cy = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define colors and parameters based on states
    let colorPrimary = "#c084fc"; // purple-400
    let colorSecondary = "#22d3ee"; // cyan-400
    let colorAccent = "#6366f1"; // indigo-500
    let baseSpeed = 1.0;
    let particleCount = 4;

    if (isAnomalousEventActive) {
      colorPrimary = "#ef4444"; // red-500
      colorSecondary = "#f59e0b"; // amber-500
      colorAccent = "#ec4899"; // pink-500
      baseSpeed = 3.2;
      particleCount = 6;
    } else if (rarity) {
      colorPrimary = "#06b6d4"; // cyan-500
      colorSecondary = "#a855f7"; // purple-500
      colorAccent = "#e9d5ff"; // light purple
      baseSpeed = 1.6;
    }

    // Add Definitions: Gradients and Glow Filters
    const defs = svg.append("defs");

    // Glow filter
    const glow = defs.append("filter")
      .attr("id", "logo-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    glow.append("feGaussianBlur")
      .attr("stdDeviation", "1.5")
      .attr("result", "blur");

    glow.append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", d => d);

    // Core gradient
    const coreGrad = defs.append("radialGradient")
      .attr("id", "core-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    coreGrad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorSecondary)
      .attr("stop-opacity", 1.0);

    coreGrad.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", colorPrimary)
      .attr("stop-opacity", 0.6);

    coreGrad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorAccent)
      .attr("stop-opacity", 0.0);

    // Group containers for layered rendering
    const staticGroup = svg.append("g");
    const animatedGroup = svg.append("g");
    const connectionsGroup = animatedGroup.append("g").attr("class", "connections");
    const particlesGroup = animatedGroup.append("g").attr("class", "particles");

    // 1. Draw Static Outer Compass Rings
    staticGroup.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 20)
      .attr("fill", "none")
      .attr("stroke", colorPrimary)
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.25);

    const outerRingTicks = staticGroup.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 18)
      .attr("fill", "none")
      .attr("stroke", colorSecondary)
      .attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "1, 5")
      .attr("stroke-opacity", 0.4);

    const innerRing = staticGroup.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", colorAccent)
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "4, 4")
      .attr("stroke-opacity", 0.35);

    // 2. Core Central Oracle Node (Pulsing Diamond)
    const corePulsingGroup = animatedGroup.append("g");

    // Backdrop radial glow sphere
    const glowSphere = corePulsingGroup.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 7)
      .attr("fill", "url(#core-gradient)")
      .attr("filter", "url(#logo-glow)");

    // Core central diamond shape
    const diamondPath = d3.path();
    diamondPath.moveTo(cx, cy - 4.5);
    diamondPath.lineTo(cx + 4.5, cy);
    diamondPath.lineTo(cx, cy + 4.5);
    diamondPath.lineTo(cx - 4.5, cy);
    diamondPath.closePath();

    const coreDiamond = corePulsingGroup.append("path")
      .attr("d", diamondPath.toString())
      .attr("fill", colorSecondary)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.75)
      .attr("filter", "url(#logo-glow)");

    // 3. Set Up Orbiting Particle Data
    interface Particle {
      id: number;
      radius: number;
      baseAngle: number;
      orbitRadius: number;
      speedModifier: number;
      size: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      radius: i % 2 === 0 ? 15 : 11, // Alternate orbit radii
      baseAngle: (i * (2 * Math.PI)) / particleCount,
      orbitRadius: i % 2 === 0 ? 15 : 11,
      speedModifier: (i % 2 === 0 ? 1 : -0.8) * (1.0 + (i * 0.15)),
      size: i % 2 === 0 ? 1.5 : 1.1
    }));

    // Draw particle elements
    const particleNodes = particlesGroup.selectAll("circle")
      .data(particles)
      .enter()
      .append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => d.id % 2 === 0 ? colorSecondary : colorPrimary)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.3)
      .attr("filter", "url(#logo-glow)");

    // Draw connection lines to central core
    const connectionLines = connectionsGroup.selectAll("line")
      .data(particles)
      .enter()
      .append("line")
      .attr("stroke", colorSecondary)
      .attr("stroke-width", 0.3)
      .attr("stroke-opacity", 0.25)
      .attr("stroke-dasharray", "1, 2");

    // 4. Timer-driven Animation Loop
    const timer = d3.timer((elapsed) => {
      const activeSpeed = hoverRef.current ? baseSpeed * 2.5 : baseSpeed;
      const angleOffset = (elapsed * 0.001 * activeSpeed);

      // Core pulsing size calculations
      const pulseFactor = Math.sin(elapsed * 0.003 * activeSpeed) * 0.15 + 1.0;
      glowSphere.attr("transform", `translate(${cx}, ${cy}) scale(${pulseFactor}) translate(${-cx}, ${-cy})`);
      coreDiamond.attr("transform", `translate(${cx}, ${cy}) scale(${pulseFactor * 1.1}) rotate(${elapsed * 0.02 * activeSpeed}) translate(${-cx}, ${-cy})`);

      // Rotate static outer compass markings
      outerRingTicks.attr("transform", `rotate(${elapsed * 0.015 * activeSpeed}, ${cx}, ${cy})`);
      innerRing.attr("transform", `rotate(${-elapsed * 0.025 * activeSpeed}, ${cx}, ${cy})`);

      // Compute particle coordinates & update visual elements
      particleNodes.each(function(d) {
        const theta = d.baseAngle + (angleOffset * d.speedModifier);
        const px = cx + d.orbitRadius * Math.cos(theta);
        const py = cy + d.orbitRadius * Math.sin(theta);

        d3.select(this)
          .attr("cx", px)
          .attr("cy", py)
          .attr("r", hoverRef.current ? d.size * 1.5 : d.size);
      });

      connectionLines.each(function(d) {
        const theta = d.baseAngle + (angleOffset * d.speedModifier);
        const px = cx + d.orbitRadius * Math.cos(theta);
        const py = cy + d.orbitRadius * Math.sin(theta);

        d3.select(this)
          .attr("x1", cx)
          .attr("y1", cy)
          .attr("x2", px)
          .attr("y2", py)
          .attr("stroke", hoverRef.current ? colorPrimary : colorSecondary)
          .attr("stroke-opacity", hoverRef.current ? 0.5 : 0.25);
      });
    });

    // Clean up timer on unmount
    return () => {
      timer.stop();
    };
  }, [isAnomalousEventActive, rarity]);

  const handleMouseEnter = () => {
    hoverRef.current = true;
  };

  const handleMouseLeave = () => {
    hoverRef.current = false;
  };

  return (
    <svg
      id="d3-oracle-ai-logo"
      ref={svgRef}
      className={`${className} transition-all duration-300 transform select-none hover:scale-110`}
      viewBox="0 0 44 44"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};
