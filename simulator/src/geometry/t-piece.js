/**
 * T-Piece parametric geometry generator.
 *
 * Generates a Three.js BufferGeometry for a T-piece with:
 * - Crossbar (rectangular solid)
 * - Stem (rectangular solid with accordion flex zone)
 * - Magnet recesses (cylindrical bores at EP_L, EP_R, ST_TIP)
 *
 * All dimensions in millimeters. Geometry centered at crossbar midpoint.
 */

import * as THREE from 'three';

/** Default parameters matching the 25mm "tabletop" preset. */
export const DEFAULTS = {
  cbLength: 25,       // Crossbar length (mm)
  cbWidth: 3,         // Crossbar width (mm)
  cbThickness: 2,     // Crossbar thickness (mm)
  stMinLength: 5,     // Stem minimum length (mm)
  stMaxLength: 22,    // Stem maximum length (mm)
  stWidth: 2.5,       // Stem width (mm)
  magDiameter: 3,     // Magnet recess diameter (mm)
  magDepth: 1.5,      // Magnet recess depth (mm)
  wallMin: 0.8,       // Minimum wall thickness (mm)
  stemExtension: 0.5, // Current stem extension 0-1 (for display)
  flexSegments: 4,    // Number of accordion flex segments
};

export const PRESETS = {
  proof: {
    cbLength: 50, cbWidth: 5, cbThickness: 3,
    stMinLength: 10, stMaxLength: 44, stWidth: 4,
    magDiameter: 5, magDepth: 2, wallMin: 1.0,
    stemExtension: 0.5, flexSegments: 6,
  },
  tabletop: { ...DEFAULTS },
  wearable: {
    cbLength: 12, cbWidth: 2, cbThickness: 1.5,
    stMinLength: 3, stMaxLength: 11, stWidth: 1.8,
    magDiameter: 2, magDepth: 1, wallMin: 0.5,
    stemExtension: 0.5, flexSegments: 3,
  },
  arm: {
    cbLength: 6, cbWidth: 1.2, cbThickness: 1,
    stMinLength: 1.5, stMaxLength: 5.5, stWidth: 1,
    magDiameter: 1.5, magDepth: 0.8, wallMin: 0.4,
    stemExtension: 0.5, flexSegments: 2,
  },
};

/**
 * Build a T-piece mesh group from parameters.
 * Returns a THREE.Group containing the crossbar, stem, flex zone, and magnet recesses.
 */
export function buildTPiece(params = DEFAULTS) {
  const p = { ...DEFAULTS, ...params };
  const group = new THREE.Group();
  group.name = 'TPiece';

  // Scale: we work in mm, Three.js units = mm
  const halfCB = p.cbLength / 2;
  const currentStemLength = p.stMinLength + (p.stMaxLength - p.stMinLength) * p.stemExtension;

  // --- Crossbar ---
  const cbGeo = new THREE.BoxGeometry(p.cbLength, p.cbThickness, p.cbWidth);
  const cbMat = new THREE.MeshStandardMaterial({
    color: 0x4488cc,
    metalness: 0.3,
    roughness: 0.6,
  });
  const crossbar = new THREE.Mesh(cbGeo, cbMat);
  crossbar.name = 'crossbar';
  crossbar.position.set(0, 0, 0);
  group.add(crossbar);

  // --- Stem (rigid section from crossbar to flex zone) ---
  const rigidStemLength = p.stMinLength * 0.3; // 30% of min is always rigid
  const stemGeo = new THREE.BoxGeometry(p.stWidth, rigidStemLength, p.stWidth);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4488cc,
    metalness: 0.3,
    roughness: 0.6,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.name = 'stem-rigid';
  stem.position.set(0, -(p.cbThickness / 2 + rigidStemLength / 2), 0);
  group.add(stem);

  // --- Flex zone (accordion) ---
  const flexLength = currentStemLength - rigidStemLength - rigidStemLength; // between two rigid sections
  if (flexLength > 0) {
    const flexGroup = buildAccordion(p, flexLength);
    flexGroup.name = 'stem-flex';
    flexGroup.position.set(0, -(p.cbThickness / 2 + rigidStemLength + flexLength / 2), 0);
    group.add(flexGroup);
  }

  // --- Stem tip (rigid section at end) ---
  const tipGeo = new THREE.BoxGeometry(p.stWidth, rigidStemLength, p.stWidth);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x4488cc,
    metalness: 0.3,
    roughness: 0.6,
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.name = 'stem-tip';
  tip.position.set(0, -(p.cbThickness / 2 + currentStemLength - rigidStemLength / 2), 0);
  group.add(tip);

  // --- Magnet recesses ---
  const magnetMat = new THREE.MeshStandardMaterial({
    color: 0xcc3333,
    metalness: 0.7,
    roughness: 0.3,
  });

  // EP_L (left endpoint)
  const magGeo = new THREE.CylinderGeometry(p.magDiameter / 2, p.magDiameter / 2, p.magDepth, 16);
  const magL = new THREE.Mesh(magGeo, magnetMat);
  magL.name = 'magnet-EP_L';
  magL.rotation.z = Math.PI / 2;
  magL.position.set(-halfCB + p.magDepth / 2, 0, 0);
  group.add(magL);

  // EP_R (right endpoint)
  const magR = new THREE.Mesh(magGeo.clone(), magnetMat);
  magR.name = 'magnet-EP_R';
  magR.rotation.z = Math.PI / 2;
  magR.position.set(halfCB - p.magDepth / 2, 0, 0);
  group.add(magR);

  // ST_TIP (stem tip)
  const magTip = new THREE.Mesh(magGeo.clone(), magnetMat);
  magTip.name = 'magnet-ST_TIP';
  magTip.position.set(0, -(p.cbThickness / 2 + currentStemLength - p.magDepth / 2), 0);
  group.add(magTip);

  return group;
}

/**
 * Build accordion flex zone geometry.
 * Creates a zigzag pattern that represents the living hinge.
 */
function buildAccordion(params, totalLength) {
  const group = new THREE.Group();
  const segCount = params.flexSegments;
  const segHeight = totalLength / segCount;
  const wallThick = Math.max(params.wallMin, params.stWidth * 0.3);

  const flexMat = new THREE.MeshStandardMaterial({
    color: 0x66aadd,
    metalness: 0.2,
    roughness: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  for (let i = 0; i < segCount; i++) {
    const y = -totalLength / 2 + segHeight * i + segHeight / 2;

    // Outer walls of each accordion segment
    const segGeo = new THREE.BoxGeometry(params.stWidth, segHeight * 0.7, params.stWidth);
    const seg = new THREE.Mesh(segGeo, flexMat);
    seg.position.set(0, y, 0);
    group.add(seg);

    // Connecting thin hinge between segments
    if (i < segCount - 1) {
      const hingeGeo = new THREE.BoxGeometry(wallThick, segHeight * 0.3, params.stWidth);
      const hinge = new THREE.Mesh(hingeGeo, flexMat);
      // Alternate sides for zigzag
      const offset = (i % 2 === 0 ? 1 : -1) * (params.stWidth / 2 - wallThick / 2);
      hinge.position.set(offset, y + segHeight * 0.5, 0);
      group.add(hinge);
    }
  }

  return group;
}

/**
 * Build a polygon preview showing multiple T-pieces assembled.
 * @param {'triangle'|'hexagon'|'square'} type
 * @param {object} params - T-piece parameters
 * @returns THREE.Group
 */
export function buildPolygonPreview(type, params = DEFAULTS) {
  const group = new THREE.Group();
  group.name = `polygon-${type}`;

  const sides = type === 'triangle' ? 3 : type === 'square' ? 4 : 6;
  const angleStep = (2 * Math.PI) / sides;

  // Polygon inscribed radius (center to edge midpoint)
  const inscribedR = params.cbLength / (2 * Math.tan(Math.PI / sides));

  for (let i = 0; i < sides; i++) {
    const angle = angleStep * i + Math.PI / 2; // Start from top

    // Build a T-piece with stem extended to reach center
    const stemTarget = inscribedR;
    const ext = Math.min(1, Math.max(0,
      (stemTarget - params.stMinLength) / (params.stMaxLength - params.stMinLength)
    ));

    const piece = buildTPiece({ ...params, stemExtension: ext });

    // Position: center of crossbar sits on the polygon edge
    // Edge midpoint is at distance inscribedR from center
    piece.position.set(
      inscribedR * Math.cos(angle),
      0,
      inscribedR * Math.sin(angle)
    );

    // Rotate: crossbar tangent to polygon, stem pointing inward
    // The T-piece is built with stem pointing -Y, we need it pointing toward center
    // After Rx(-π/2) lay flat, Rz(θ) maps stem to (sin θ, 0, cos θ) in world
    // Need stem → (-cos α, 0, -sin α), so θ = -(α + π/2)
    piece.rotation.x = -Math.PI / 2; // Lay flat (Y→Z)
    piece.rotation.z = -(angle + Math.PI / 2); // Point stem inward

    group.add(piece);
  }

  return group;
}

/**
 * Compute info metrics for current parameters.
 */
export function computeInfo(params = DEFAULTS) {
  const p = { ...DEFAULTS, ...params };
  const currentStemLength = p.stMinLength + (p.stMaxLength - p.stMinLength) * p.stemExtension;

  // Approximate volume (crossbar + stem, ignoring flex accordion detail)
  const cbVolume = p.cbLength * p.cbWidth * p.cbThickness;
  const stVolume = p.stWidth * p.stWidth * currentStemLength;
  const totalVolume = cbVolume + stVolume; // mm³

  // PETG density: ~1.27 g/cm³ = 0.00127 g/mm³
  const weight = totalVolume * 0.00127;

  const hexInscribedR = p.cbLength * Math.sqrt(3) / 2;
  const stemReaches = p.stMaxLength >= hexInscribedR;

  return {
    volume: `${totalVolume.toFixed(1)} mm³`,
    weight: `${weight.toFixed(2)} g`,
    stemRange: `${p.stMinLength}-${p.stMaxLength} mm`,
    hexRadius: `${hexInscribedR.toFixed(1)} mm`,
    stemReaches: stemReaches ? 'Yes' : `No (need ${hexInscribedR.toFixed(1)}mm)`,
  };
}
