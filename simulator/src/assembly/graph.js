/**
 * EpsilonGraph — the ε connectivity graph for the assembly.
 *
 * This IS the structure. Physical connectivity = data connectivity = power grid.
 * Implemented as an adjacency-list graph over Cell UUIDs.
 */

import { Cell, MODES } from './cell.js';

export class EpsilonGraph {
  constructor() {
    /** @type {Map<number, Cell>} UUID → Cell */
    this.cells = new Map();

    /** @type {Map<number, Polygon>} polygonId → Polygon */
    this.polygons = new Map();

    this._nextPolygonId = 1;
  }

  // --- Cell management ---

  /** Add a cell to the graph. */
  addCell(cell) {
    this.cells.set(cell.uuid, cell);
    return cell;
  }

  /** Remove a cell and all its connections. */
  removeCell(uuid) {
    const cell = this.cells.get(uuid);
    if (!cell) return;

    // Disconnect from all neighbors
    for (const [neighborUuid] of cell.epsilon) {
      const neighbor = this.cells.get(neighborUuid);
      if (neighbor) {
        neighbor.disconnect(uuid);
      }
    }
    cell.epsilon.clear();

    // Remove from polygon
    if (cell.polygonId !== null) {
      const poly = this.polygons.get(cell.polygonId);
      if (poly) {
        poly.cells = poly.cells.filter(c => c.uuid !== uuid);
        if (poly.cells.length === 0) {
          this.polygons.delete(cell.polygonId);
        }
      }
    }

    this.cells.delete(uuid);
  }

  /** Get cell by UUID. */
  getCell(uuid) {
    return this.cells.get(uuid);
  }

  // --- Polygon management ---

  /**
   * Create a polygon at a given position.
   * @param {'triangle'|'hexagon'|'square'} type
   * @param {number} x - Center X (mm)
   * @param {number} z - Center Z (mm)
   * @param {object} params - T-piece parameters (cbLength, etc.)
   * @returns {Polygon}
   */
  createPolygon(type, x, z, params) {
    const sides = type === 'triangle' ? 3 : type === 'square' ? 4 : 6;
    const angleStep = (2 * Math.PI) / sides;
    const inscribedR = params.cbLength / (2 * Math.tan(Math.PI / sides));
    const stemExtension = Math.min(1, Math.max(0,
      (inscribedR - params.stMinLength) / (params.stMaxLength - params.stMinLength)
    ));

    const polygonId = this._nextPolygonId++;
    const polygon = {
      id: polygonId,
      type,
      center: { x, z },
      cells: [],
      sides,
    };

    // Create cells for each edge
    for (let i = 0; i < sides; i++) {
      const angle = angleStep * i + Math.PI / 2; // Start from top
      const cell = new Cell({
        sigma: MODES.RIGID,
        stemExtension,
        chi: 'load-bearing',
      });

      cell.position.x = x + inscribedR * Math.cos(angle);
      cell.position.z = z + inscribedR * Math.sin(angle);
      cell.rotation = angle - Math.PI / 2; // Stem points inward toward center
      cell.polygonId = polygonId;
      cell.slotIndex = i;

      this.addCell(cell);
      polygon.cells.push(cell);
    }

    // Connect adjacent cells within the polygon
    for (let i = 0; i < sides; i++) {
      const current = polygon.cells[i];
      const next = polygon.cells[(i + 1) % sides];

      // Adjacent cells connect EP_R of current to EP_L of next
      current.connect(next, 'EP_R', 'EP_L', 0.9);
    }

    this.polygons.set(polygonId, polygon);
    return polygon;
  }

  /**
   * Try to snap a new polygon adjacent to an existing one.
   * Finds the closest edge and creates a new polygon sharing that edge.
   * @param {'triangle'|'hexagon'|'square'} type
   * @param {number} nearX
   * @param {number} nearZ
   * @param {object} params
   * @returns {Polygon|null}
   */
  snapPolygon(type, nearX, nearZ, params) {
    const snapDist = params.cbLength * 1.5;

    // Find closest unconnected endpoint
    let bestCell = null;
    let bestPoint = null;
    let bestDist = Infinity;

    for (const cell of this.cells.values()) {
      for (const [pointName, cp] of Object.entries(cell.connectionPoints)) {
        if (pointName === 'ST_TIP') continue; // Only snap on crossbar endpoints
        if (cp.connected !== null) continue;   // Already connected

        const worldPos = cell.getConnectionWorldPos(pointName, params.cbLength);
        if (!worldPos) continue;

        const dist = Math.hypot(worldPos.x - nearX, worldPos.z - nearZ);
        if (dist < bestDist && dist < snapDist) {
          bestDist = dist;
          bestCell = cell;
          bestPoint = pointName;
        }
      }
    }

    if (!bestCell) return null;

    // Create new polygon adjacent to the found edge
    const worldPos = bestCell.getConnectionWorldPos(bestPoint, params.cbLength);
    const sides = type === 'triangle' ? 3 : type === 'square' ? 4 : 6;
    const inscribedR = params.cbLength / (2 * Math.tan(Math.PI / sides));

    // Offset from the snap point outward (radial direction from polygon center)
    const outwardAngle = bestCell.rotation + Math.PI / 2; // Local +Z = outward from polygon
    const cx = worldPos.x + inscribedR * 2 * Math.cos(outwardAngle);
    const cz = worldPos.z + inscribedR * 2 * Math.sin(outwardAngle);

    const polygon = this.createPolygon(type, cx, cz, params);

    // Connect shared edges
    this._connectAdjacentPolygons(params.cbLength);

    return polygon;
  }

  /**
   * Auto-connect cells that are close enough to form connections.
   */
  _connectAdjacentPolygons(cbLength) {
    const threshold = cbLength * 0.3; // Connection distance threshold
    const cells = Array.from(this.cells.values());

    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i];
        const b = cells[j];

        // Skip if already connected
        if (a.epsilon.has(b.uuid)) continue;
        // Skip if same polygon
        if (a.polygonId === b.polygonId) continue;

        // Check each pair of unconnected endpoints
        for (const [apName, ap] of Object.entries(a.connectionPoints)) {
          if (ap.connected !== null) continue;
          const aPos = a.getConnectionWorldPos(apName, cbLength);
          if (!aPos) continue;

          for (const [bpName, bp] of Object.entries(b.connectionPoints)) {
            if (bp.connected !== null) continue;
            const bPos = b.getConnectionWorldPos(bpName, cbLength);
            if (!bPos) continue;

            const dist = Math.hypot(aPos.x - bPos.x, aPos.z - bPos.z);
            if (dist < threshold) {
              a.connect(b, apName, bpName, 0.8);
            }
          }
        }
      }
    }
  }

  // --- Graph queries ---

  /** Get all edges as [cellA_uuid, cellB_uuid, connectionInfo] triples. */
  getEdges() {
    const edges = [];
    const seen = new Set();

    for (const cell of this.cells.values()) {
      for (const [neighborUuid, info] of cell.epsilon) {
        const key = Math.min(cell.uuid, neighborUuid) + ':' + Math.max(cell.uuid, neighborUuid);
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([cell.uuid, neighborUuid, info]);
      }
    }

    return edges;
  }

  /** BFS shortest path between two cells. Returns array of UUIDs or null. */
  shortestPath(fromUuid, toUuid) {
    if (fromUuid === toUuid) return [fromUuid];

    const visited = new Set([fromUuid]);
    const queue = [[fromUuid]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      const cell = this.cells.get(current);
      if (!cell) continue;

      for (const [neighborUuid] of cell.epsilon) {
        if (neighborUuid === toUuid) return [...path, neighborUuid];
        if (visited.has(neighborUuid)) continue;
        visited.add(neighborUuid);
        queue.push([...path, neighborUuid]);
      }
    }

    return null; // No path
  }

  /** Get cells within N hops of a source cell. */
  neighborhood(sourceUuid, maxHops) {
    const result = new Map(); // uuid → hop count
    result.set(sourceUuid, 0);
    const queue = [{ uuid: sourceUuid, hops: 0 }];

    while (queue.length > 0) {
      const { uuid, hops } = queue.shift();
      if (hops >= maxHops) continue;

      const cell = this.cells.get(uuid);
      if (!cell) continue;

      for (const [neighborUuid] of cell.epsilon) {
        if (result.has(neighborUuid)) continue;
        result.set(neighborUuid, hops + 1);
        queue.push({ uuid: neighborUuid, hops: hops + 1 });
      }
    }

    return result;
  }

  /** Get summary stats. */
  get stats() {
    let edgeCount = 0;
    for (const cell of this.cells.values()) {
      edgeCount += cell.epsilon.size;
    }

    return {
      cells: this.cells.size,
      edges: edgeCount / 2, // Each edge counted twice
      polygons: this.polygons.size,
      modes: this._modeCounts(),
    };
  }

  _modeCounts() {
    const counts = {};
    for (const cell of this.cells.values()) {
      counts[cell.sigma] = (counts[cell.sigma] || 0) + 1;
    }
    return counts;
  }
}
