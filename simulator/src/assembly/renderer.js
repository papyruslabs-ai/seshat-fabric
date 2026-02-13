/**
 * Assembly Renderer — 2D top-down view of the structure.
 *
 * Renders cells as T-shapes, connections as lines (the ε graph),
 * and overlays for impact visualization, routing, and mode coloring.
 */

import * as THREE from 'three';
import { MODE_COLORS } from './cell.js';
import { impactHeatColor } from './impact-sim.js';

export class AssemblyRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'assembly';
    scene.add(this.group);

    // Sub-groups for layered rendering
    this.gridLayer = new THREE.Group();
    this.edgeLayer = new THREE.Group();
    this.cellLayer = new THREE.Group();
    this.overlayLayer = new THREE.Group();
    this.labelLayer = new THREE.Group();

    this.group.add(this.gridLayer);
    this.group.add(this.edgeLayer);
    this.group.add(this.cellLayer);
    this.group.add(this.overlayLayer);
    this.group.add(this.labelLayer);

    // Track meshes for cleanup
    this._cellMeshes = new Map();  // uuid → THREE.Group
    this._edgeMeshes = [];
    this._overlayMeshes = [];

    // Shared materials
    this._edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x4aff8a,
      transparent: true,
      opacity: 0.6,
    });

    this._highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
    });
  }

  /**
   * Full render pass — rebuild all visuals from graph state.
   * @param {EpsilonGraph} graph
   * @param {object} params - T-piece params (cbLength, etc.)
   * @param {object} options - { showEdges, showModes, impactData, routePath, selectedUuid }
   */
  render(graph, params, options = {}) {
    const {
      showEdges = true,
      showModes = true,
      impactData = null,
      routePath = null,
      selectedUuid = null,
    } = options;

    this._clearAll();

    // Render cells
    for (const cell of graph.cells.values()) {
      const cellGroup = this._renderCell(cell, params, {
        showModes,
        impactData,
        isSelected: cell.uuid === selectedUuid,
        isOnRoute: routePath?.includes(cell.uuid),
      });
      this.cellLayer.add(cellGroup);
      this._cellMeshes.set(cell.uuid, cellGroup);
    }

    // Render edges (ε graph)
    if (showEdges) {
      const edges = graph.getEdges();
      for (const [uuidA, uuidB, info] of edges) {
        const cellA = graph.getCell(uuidA);
        const cellB = graph.getCell(uuidB);
        if (!cellA || !cellB) continue;

        const line = this._renderEdge(cellA, cellB, info, params);
        this.edgeLayer.add(line);
        this._edgeMeshes.push(line);
      }
    }

    // Render route path overlay
    if (routePath && routePath.length > 1) {
      this._renderRoute(graph, routePath, params);
    }

    // Render impact overlay
    if (impactData) {
      this._renderImpactOverlay(graph, impactData, params);
    }
  }

  /**
   * Render a single cell as a simplified T-shape in 2D (top-down).
   */
  _renderCell(cell, params, options = {}) {
    const group = new THREE.Group();
    group.name = `cell-${cell.uuid}`;

    const halfCB = params.cbLength / 2;
    const stemLen = cell.delta.stemExtension *
      (params.stMaxLength - params.stMinLength) + params.stMinLength;

    // Determine color
    let color;
    if (options.impactData) {
      const state = options.impactData.cellStates.get(cell.uuid);
      if (state) {
        const maxForce = options.impactData.summary.impactForce;
        color = impactHeatColor(state.force / maxForce);
      } else {
        color = 0x222233;
      }
    } else if (options.showModes) {
      color = MODE_COLORS[cell.sigma] || 0x555566;
    } else {
      color = 0x4488cc;
    }

    const material = new THREE.MeshBasicMaterial({ color });

    // Crossbar (flat rectangle in XZ plane)
    const cbGeo = new THREE.BoxGeometry(params.cbLength, 1, params.cbWidth);
    const crossbar = new THREE.Mesh(cbGeo, material);
    crossbar.position.y = 0.5;
    group.add(crossbar);

    // Stem (thin rectangle extending from center)
    const stGeo = new THREE.BoxGeometry(params.stWidth, 1, stemLen);
    const stem = new THREE.Mesh(stGeo, material.clone());
    stem.material.opacity = 0.7;
    stem.material.transparent = true;
    stem.position.set(0, 0.5, -stemLen / 2);
    group.add(stem);

    // Magnet indicators (small spheres at connection points)
    const magGeo = new THREE.SphereGeometry(params.magDiameter / 2, 8, 8);
    const magMat = new THREE.MeshBasicMaterial({ color: 0xcc3333 });

    const magL = new THREE.Mesh(magGeo, magMat);
    magL.position.set(-halfCB, 1, 0);
    group.add(magL);

    const magR = new THREE.Mesh(magGeo, magMat);
    magR.position.set(halfCB, 1, 0);
    group.add(magR);

    const magTip = new THREE.Mesh(magGeo, magMat.clone());
    magTip.material.color.setHex(0xcc6633);
    magTip.position.set(0, 1, -stemLen);
    group.add(magTip);

    // Selection highlight
    if (options.isSelected) {
      const highlightGeo = new THREE.RingGeometry(
        Math.max(halfCB, stemLen) * 0.8,
        Math.max(halfCB, stemLen) * 1.0,
        16
      );
      const highlight = new THREE.Mesh(highlightGeo, this._highlightMaterial);
      highlight.rotation.x = -Math.PI / 2;
      highlight.position.y = 0.1;
      group.add(highlight);
    }

    // Route highlight
    if (options.isOnRoute) {
      const routeGeo = new THREE.BoxGeometry(params.cbLength * 1.2, 0.5, params.cbWidth * 1.2);
      const routeMat = new THREE.MeshBasicMaterial({
        color: 0x44ccff,
        transparent: true,
        opacity: 0.3,
      });
      const routeHighlight = new THREE.Mesh(routeGeo, routeMat);
      routeHighlight.position.y = 0.2;
      group.add(routeHighlight);
    }

    // Position and rotate in world space
    group.position.set(cell.position.x, 0, cell.position.z);
    group.rotation.y = -cell.rotation;

    return group;
  }

  /**
   * Render an ε edge as a line between two cells.
   */
  _renderEdge(cellA, cellB, info, params) {
    const posA = cellA.getConnectionWorldPos(info.myPoint || 'EP_R', params.cbLength);
    const posB = cellB.getConnectionWorldPos(info.theirPoint || 'EP_L', params.cbLength);

    if (!posA || !posB) {
      // Fallback to cell centers
      const points = [
        new THREE.Vector3(cellA.position.x, 2, cellA.position.z),
        new THREE.Vector3(cellB.position.x, 2, cellB.position.z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geo, this._edgeMaterial);
    }

    const points = [
      new THREE.Vector3(posA.x, 2, posA.z),
      new THREE.Vector3(posB.x, 2, posB.z),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);

    // Vary opacity by connection strength
    const mat = this._edgeMaterial.clone();
    mat.opacity = 0.3 + (info.strength || 0.8) * 0.5;

    return new THREE.Line(geo, mat);
  }

  /**
   * Render route path as a highlighted polyline.
   */
  _renderRoute(graph, routePath, params) {
    const points = routePath.map(uuid => {
      const cell = graph.getCell(uuid);
      return new THREE.Vector3(cell.position.x, 3, cell.position.z);
    }).filter(Boolean);

    if (points.length < 2) return;

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffaa00,
      linewidth: 3,
    });
    const line = new THREE.Line(geo, mat);
    this.overlayLayer.add(line);
    this._overlayMeshes.push(line);
  }

  /**
   * Render impact heatmap overlay.
   */
  _renderImpactOverlay(graph, impactData, params) {
    const maxForce = impactData.summary.impactForce;

    for (const [uuid, state] of impactData.cellStates) {
      const cell = graph.getCell(uuid);
      if (!cell) continue;

      // Concentric ring showing force level
      const normalizedForce = state.force / maxForce;
      const radius = params.cbLength * 0.6 * (1 + state.displacement);
      const ringGeo = new THREE.RingGeometry(radius * 0.8, radius, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: impactHeatColor(normalizedForce),
        transparent: true,
        opacity: 0.4 * normalizedForce,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(cell.position.x, 0.05, cell.position.z);
      this.overlayLayer.add(ring);
      this._overlayMeshes.push(ring);
    }
  }

  /** Clear all rendered objects. */
  _clearAll() {
    for (const [, mesh] of this._cellMeshes) {
      this._disposeGroup(mesh);
      this.cellLayer.remove(mesh);
    }
    this._cellMeshes.clear();

    for (const mesh of this._edgeMeshes) {
      mesh.geometry.dispose();
      if (mesh.material.dispose) mesh.material.dispose();
      this.edgeLayer.remove(mesh);
    }
    this._edgeMeshes = [];

    for (const mesh of this._overlayMeshes) {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material?.dispose) mesh.material.dispose();
      this.overlayLayer.remove(mesh);
    }
    this._overlayMeshes = [];
  }

  _disposeGroup(group) {
    group.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else if (child.material?.dispose) {
          child.material.dispose();
        }
      }
    });
  }

  /** Remove everything from scene. */
  dispose() {
    this._clearAll();
    this.scene.remove(this.group);
  }
}
