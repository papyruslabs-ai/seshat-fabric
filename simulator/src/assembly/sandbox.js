/**
 * Assembly Sandbox — orchestrates the interactive assembly experience.
 *
 * Handles:
 * - Click-to-place polygons
 * - Cell selection and inspection
 * - Impact simulation triggering
 * - Route visualization
 * - Mode toggling
 */

import * as THREE from 'three';
import { EpsilonGraph } from './graph.js';
import { AssemblyRenderer } from './renderer.js';
import { simulateImpact, applyImpactResponse } from './impact-sim.js';
import { MODES, MODE_COLORS } from './cell.js';

export class AssemblySandbox {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.threeRenderer = renderer;
    this.graph = new EpsilonGraph();
    this.assemblyRenderer = new AssemblyRenderer(scene);

    // State
    this.params = {
      cbLength: 25,
      cbWidth: 3,
      cbThickness: 2,
      stMinLength: 5,
      stMaxLength: 22,
      stWidth: 2.5,
      magDiameter: 3,
      magDepth: 1.5,
    };

    this.placementType = 'hexagon';
    this.selectedUuid = null;
    this.impactData = null;
    this.routePath = null;
    this.showEdges = true;
    this.showModes = true;
    this.active = false;

    // Raycaster for mouse picking
    this._raycaster = null;
    this._mouse = null;
    this._groundPlane = null;

    this._onClickBound = this._onClick.bind(this);
    this._onRightClickBound = this._onRightClick.bind(this);
  }

  /** Activate the sandbox (called when tab switches to assembly). */
  activate(viewport) {
    this.active = true;
    this._viewport = viewport;

    // Lazy init Three.js picking objects
    if (!this._raycaster) {
      this._raycaster = new THREE.Raycaster();
      this._mouse = new THREE.Vector2();
      this._groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    }

    viewport.addEventListener('click', this._onClickBound);
    viewport.addEventListener('contextmenu', this._onRightClickBound);

    // If empty, seed with one hexagon at origin
    if (this.graph.cells.size === 0) {
      this.graph.createPolygon('hexagon', 0, 0, this.params);
    }

    this._render();
  }

  /** Deactivate when switching away. */
  deactivate() {
    this.active = false;
    if (this._viewport) {
      this._viewport.removeEventListener('click', this._onClickBound);
      this._viewport.removeEventListener('contextmenu', this._onRightClickBound);
    }
    this.assemblyRenderer.dispose();
  }

  /** Re-render the assembly. */
  _render() {
    if (!this.active) return;
    this.assemblyRenderer.render(this.graph, this.params, {
      showEdges: this.showEdges,
      showModes: this.showModes,
      impactData: this.impactData,
      routePath: this.routePath,
      selectedUuid: this.selectedUuid,
    });
  }

  // --- Mouse interaction ---

  _onClick(event) {
    if (event.button !== 0) return; // Left click only
    if (event.shiftKey) {
      this._handleImpactClick(event);
      return;
    }
    this._handlePlaceClick(event);
  }

  _onRightClick(event) {
    // Right click = select cell
    event.preventDefault();
    this._handleSelectClick(event);
  }

  _handlePlaceClick(event) {
    const worldPos = this._getWorldPosition(event);
    if (!worldPos) return;

    // Try to snap to existing structure first
    const snapped = this.graph.snapPolygon(this.placementType, worldPos.x, worldPos.z, this.params);

    if (!snapped) {
      // Place freestanding polygon
      this.graph.createPolygon(this.placementType, worldPos.x, worldPos.z, this.params);
    }

    this.impactData = null; // Clear impact overlay
    this._render();
    this._updateStats();
  }

  _handleSelectClick(event) {
    const worldPos = this._getWorldPosition(event);
    if (!worldPos) return;

    // Find closest cell
    let closestUuid = null;
    let closestDist = Infinity;

    for (const cell of this.graph.cells.values()) {
      const dist = Math.hypot(cell.position.x - worldPos.x, cell.position.z - worldPos.z);
      if (dist < closestDist && dist < this.params.cbLength) {
        closestDist = dist;
        closestUuid = cell.uuid;
      }
    }

    this.selectedUuid = closestUuid;
    this._render();
    this._updateCellInfo();
  }

  _handleImpactClick(event) {
    const worldPos = this._getWorldPosition(event);
    if (!worldPos) return;

    // Find closest cell to impact
    let closestUuid = null;
    let closestDist = Infinity;

    for (const cell of this.graph.cells.values()) {
      const dist = Math.hypot(cell.position.x - worldPos.x, cell.position.z - worldPos.z);
      if (dist < closestDist) {
        closestDist = dist;
        closestUuid = cell.uuid;
      }
    }

    if (closestUuid === null) return;

    // Run impact simulation
    const force = parseFloat(document.getElementById('impact-force')?.value || '5');
    this.impactData = simulateImpact(this.graph, closestUuid, force, this.params);

    // Apply mode changes
    applyImpactResponse(this.graph, closestUuid, this.impactData.summary.totalBlastRadius);

    this._render();
    this._updateImpactInfo();
  }

  _getWorldPosition(event) {
    if (!this._viewport || !this._raycaster) return null;

    const rect = this._viewport.getBoundingClientRect();
    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, this.camera);

    const target = new THREE.Vector3();
    this._raycaster.ray.intersectPlane(this._groundPlane, target);
    return target;
  }

  // --- Public actions ---

  /** Place a polygon at specific coordinates. */
  placePolygon(type, x, z) {
    this.graph.createPolygon(type, x, z, this.params);
    this._render();
    this._updateStats();
  }

  /** Compute and display shortest route between two cells. */
  showRoute(fromUuid, toUuid) {
    this.routePath = this.graph.shortestPath(fromUuid, toUuid);
    this._render();
  }

  /** Clear route display. */
  clearRoute() {
    this.routePath = null;
    this._render();
  }

  /** Clear impact overlay. */
  clearImpact() {
    this.impactData = null;
    // Reset all cells to rigid
    for (const cell of this.graph.cells.values()) {
      cell.sigma = MODES.RIGID;
    }
    this._render();
  }

  /** Reset the entire assembly. */
  reset() {
    this.graph = new EpsilonGraph();
    this.selectedUuid = null;
    this.impactData = null;
    this.routePath = null;
    this.graph.createPolygon('hexagon', 0, 0, this.params);
    this._render();
    this._updateStats();
    this._updateCellInfo();
  }

  /** Toggle cell mode (cycle through common modes). */
  cycleMode(uuid) {
    const cell = this.graph.getCell(uuid);
    if (!cell) return;

    const cycle = [MODES.RIGID, MODES.FLEX, MODES.HARVEST, MODES.SENSE, MODES.IDLE];
    const idx = cycle.indexOf(cell.sigma);
    const next = cycle[(idx + 1) % cycle.length];
    cell.sigma = next;
    this._render();
    this._updateCellInfo();
  }

  // --- UI updates ---

  _updateStats() {
    const stats = this.graph.stats;
    const el = document.getElementById('assembly-stats');
    if (!el) return;

    el.innerHTML = `
      <div class="info-row"><span>Cells:</span><span>${stats.cells}</span></div>
      <div class="info-row"><span>Connections:</span><span>${stats.edges}</span></div>
      <div class="info-row"><span>Polygons:</span><span>${stats.polygons}</span></div>
      <div class="info-row"><span>Modes:</span><span>${Object.entries(stats.modes).map(([m, c]) => `${m}:${c}`).join(', ')}</span></div>
    `;
  }

  _updateCellInfo() {
    const el = document.getElementById('cell-info');
    if (!el) return;

    if (this.selectedUuid === null) {
      el.innerHTML = '<p class="placeholder">Right-click a cell to inspect</p>';
      return;
    }

    const cell = this.graph.getCell(this.selectedUuid);
    if (!cell) return;

    const coord = cell.coordinate;
    el.innerHTML = `
      <div class="info-row"><span>UUID:</span><span>${cell.uuid}</span></div>
      <div class="info-row"><span>σ (mode):</span><span>${coord.sigma}</span></div>
      <div class="info-row"><span>ε (neighbors):</span><span>${coord.epsilon.length}</span></div>
      <div class="info-row"><span>δ (stem):</span><span>${coord.delta.stemExtension.toFixed(2)}</span></div>
      <div class="info-row"><span>κ (autonomy):</span><span>${coord.kappa}</span></div>
      <div class="info-row"><span>χ (role):</span><span>${coord.chi}</span></div>
      <div class="info-row"><span>λ (force):</span><span>${coord.lambda}</span></div>
      <div class="info-row"><span>τ (type):</span><span>${coord.tau}</span></div>
      <div class="info-row"><span>ρ (hw):</span><span>${coord.rho.processor}, ${coord.rho.magnetClass}</span></div>
      <div class="info-row"><span>Polygon:</span><span>${cell.polygonId ?? 'none'}</span></div>
    `;
  }

  _updateImpactInfo() {
    const el = document.getElementById('impact-info');
    if (!el || !this.impactData) return;

    const s = this.impactData.summary;
    el.innerHTML = `
      <div class="info-row"><span>Force:</span><span>${s.impactForce.toFixed(1)} N</span></div>
      <div class="info-row"><span>Cells affected:</span><span>${s.affectedCells}</span></div>
      <div class="info-row"><span>Blast radius:</span><span>${s.totalBlastRadius} hops</span></div>
      <div class="info-row"><span>Energy absorbed:</span><span>${s.totalEnergyAbsorbed.toFixed(1)} μJ</span></div>
      <div class="info-row"><span>Energy harvested:</span><span>${s.totalEnergyHarvested.toFixed(1)} μJ</span></div>
      <div class="info-row"><span>Max displacement:</span><span>${s.maxDisplacement.toFixed(3)} mm</span></div>
    `;
  }
}
