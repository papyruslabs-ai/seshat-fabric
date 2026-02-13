/**
 * Impact simulation — force wave propagation over the ε graph.
 *
 * When an impact hits a cell, it propagates through the connectivity graph
 * with attenuation. Each cell absorbs energy proportional to displacement.
 * Cells with coils harvest a fraction via Faraday's law.
 */

import { MODES } from './cell.js';

/**
 * Simulate an impact event on the graph.
 *
 * @param {EpsilonGraph} graph
 * @param {number} targetUuid - Cell that receives the impact
 * @param {number} force - Impact force in Newtons
 * @param {object} params - { cbLength, magDiameter, magDepth }
 * @returns {ImpactResult}
 */
export function simulateImpact(graph, targetUuid, force, params = {}) {
  const {
    cbLength = 25,
    magnetClass = 'N42',
    attenuationPerHop = 0.7,   // Force retained per hop
    maxHops = 10,
    cellMass = 0.5e-3,         // kg (0.5g)
  } = params;

  // Spring constant from magnetic model (N/m)
  // k ≈ 4C/d₀⁵ where C depends on magnet grade
  const kSpring = magnetClass === 'N52' ? 20000 :
                  magnetClass === 'N42' ? 16200 :
                  magnetClass === 'N35' ? 12000 : 16200;

  const steps = [];
  const cellStates = new Map(); // uuid → { force, displacement, energy, harvested, hop }

  // BFS propagation
  const visited = new Set([targetUuid]);
  const queue = [{ uuid: targetUuid, hop: 0, incomingForce: force }];

  while (queue.length > 0) {
    const { uuid, hop, incomingForce } = queue.shift();
    if (hop > maxHops) continue;

    const cell = graph.getCell(uuid);
    if (!cell) continue;

    // Calculate displacement from force and spring constant
    const displacement = Math.min(incomingForce / kSpring, 2e-3); // Cap at 2mm

    // Energy absorbed (elastic): E = ½kx²
    const energyAbsorbed = 0.5 * kSpring * displacement * displacement;

    // Faraday harvesting: P ≈ (BNAω)²/(2R)
    // Simplified: harvest ~2% of mechanical energy
    const energyHarvested = energyAbsorbed * 0.02;

    // Velocity from displacement (assuming sinusoidal)
    const velocity = displacement * 2 * Math.PI * 100; // 100 Hz impact frequency

    cellStates.set(uuid, {
      force: incomingForce,
      displacement: displacement * 1000, // Convert to mm for display
      energyAbsorbed: energyAbsorbed * 1e6, // Convert to μJ
      energyHarvested: energyHarvested * 1e6,
      velocity,
      hop,
      sigma: cell.sigma,
    });

    steps.push({
      time: hop, // Simplified: 1 hop = 1 time step
      uuid,
      force: incomingForce,
      displacement: displacement * 1000,
    });

    // Propagate to neighbors
    if (incomingForce * attenuationPerHop > 0.01) { // Threshold: 10mN
      for (const [neighborUuid, conn] of cell.epsilon) {
        if (visited.has(neighborUuid)) continue;
        visited.add(neighborUuid);

        const neighborForce = incomingForce * attenuationPerHop * conn.strength;
        queue.push({
          uuid: neighborUuid,
          hop: hop + 1,
          incomingForce: neighborForce,
        });
      }
    }
  }

  // Aggregate results
  let totalAbsorbed = 0;
  let totalHarvested = 0;
  let maxDisplacement = 0;
  let affectedCells = 0;

  for (const state of cellStates.values()) {
    totalAbsorbed += state.energyAbsorbed;
    totalHarvested += state.energyHarvested;
    maxDisplacement = Math.max(maxDisplacement, state.displacement);
    affectedCells++;
  }

  return {
    cellStates,
    steps,
    summary: {
      impactForce: force,
      affectedCells,
      totalBlastRadius: Math.max(...Array.from(cellStates.values()).map(s => s.hop)),
      totalEnergyAbsorbed: totalAbsorbed,    // μJ
      totalEnergyHarvested: totalHarvested,  // μJ
      maxDisplacement,                        // mm
      peakForceAtCenter: force,
      forceAtEdge: force * Math.pow(attenuationPerHop, maxHops),
    },
  };
}

/**
 * Apply impact response to cell modes (pre-rigidification pattern).
 *
 * @param {EpsilonGraph} graph
 * @param {number} centerUuid
 * @param {number} blastRadius - Number of hops
 */
export function applyImpactResponse(graph, centerUuid, blastRadius = 5) {
  const neighborhood = graph.neighborhood(centerUuid, blastRadius + 3);

  for (const [uuid, hops] of neighborhood) {
    const cell = graph.getCell(uuid);
    if (!cell) continue;

    if (hops === 0) {
      // Impact center: flex absorb
      cell.sigma = MODES.FLEX;
      cell.chi = 'load-bearing';
    } else if (hops <= 2) {
      // Inner ring: flex passive (absorb wave)
      cell.sigma = MODES.FLEX;
    } else if (hops <= blastRadius) {
      // Middle ring: rigid high-load (brace)
      cell.sigma = MODES.RIGID;
      cell.chi = 'load-bearing';
    } else {
      // Outer ring: rigid standard (anchor)
      cell.sigma = MODES.RIGID;
    }
  }
}

/**
 * Get color for a cell based on impact force level.
 * Green (low) → Yellow (medium) → Red (high).
 *
 * @param {number} normalizedForce - 0 to 1
 * @returns {number} Three.js color hex
 */
export function impactHeatColor(normalizedForce) {
  const r = Math.min(1, normalizedForce * 2);
  const g = Math.min(1, (1 - normalizedForce) * 2);
  const b = 0.1;

  return (Math.floor(r * 255) << 16) | (Math.floor(g * 255) << 8) | Math.floor(b * 255);
}
