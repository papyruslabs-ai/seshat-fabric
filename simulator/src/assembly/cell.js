/**
 * Cell — runtime state for a single T-piece in the assembly.
 *
 * Each cell holds the full 9D coordinate and its physical position.
 * The behavioral catalog lookup happens here.
 */

let nextUUID = 1;

/** σ modes */
export const MODES = {
  RIGID: 'rigid',
  FLEX: 'flex',
  RELAY_RECV: 'relay-receive',
  RELAY_PASS: 'relay-pass',
  ATTRACT: 'attract-home',
  RELEASE: 'release',
  TRANSIT: 'in-transit',
  HARVEST: 'harvest',
  SENSE: 'sense',
  IDLE: 'idle',
};

/** σ mode colors for visualization */
export const MODE_COLORS = {
  [MODES.RIGID]:      0x4488cc,
  [MODES.FLEX]:       0x66aadd,
  [MODES.RELAY_RECV]: 0x44cc88,
  [MODES.RELAY_PASS]: 0x88cc44,
  [MODES.ATTRACT]:    0xcccc44,
  [MODES.RELEASE]:    0xcc8844,
  [MODES.TRANSIT]:    0xcc4444,
  [MODES.HARVEST]:    0x44cccc,
  [MODES.SENSE]:      0xaa44cc,
  [MODES.IDLE]:       0x555566,
};

/** Valid transitions: mode → Set of reachable modes */
export const TRANSITIONS = {
  [MODES.RIGID]:      new Set([MODES.FLEX, MODES.RELAY_RECV, MODES.RELAY_PASS, MODES.RELEASE, MODES.HARVEST, MODES.SENSE]),
  [MODES.FLEX]:       new Set([MODES.RIGID, MODES.RELAY_RECV, MODES.RELAY_PASS, MODES.RELEASE, MODES.SENSE]),
  [MODES.RELAY_RECV]: new Set([MODES.RIGID, MODES.FLEX, MODES.RELAY_PASS]),
  [MODES.RELAY_PASS]: new Set([MODES.RIGID, MODES.FLEX, MODES.RELAY_RECV]),
  [MODES.ATTRACT]:    new Set([MODES.RIGID, MODES.FLEX]),
  [MODES.RELEASE]:    new Set([MODES.TRANSIT, MODES.IDLE]),
  [MODES.TRANSIT]:    new Set([MODES.ATTRACT, MODES.IDLE]),
  [MODES.HARVEST]:    new Set([MODES.RIGID, MODES.RELEASE]),
  [MODES.SENSE]:      new Set([MODES.RIGID, MODES.FLEX, MODES.RELEASE]),
  [MODES.IDLE]:       new Set([MODES.ATTRACT, MODES.TRANSIT]),
};

export class Cell {
  constructor(options = {}) {
    // UUID
    this.uuid = options.uuid ?? nextUUID++;

    // 9D coordinate
    this.sigma = options.sigma ?? MODES.IDLE;         // σ: behavioral mode
    this.epsilon = new Map();                          // ε: neighbor UUID → connection info
    this.delta = {                                     // δ: sensor state
      stemExtension: options.stemExtension ?? 0.5,
      strain: 0,
      temperature: 25,
      fieldStrength: [0, 0, 0],  // EP_L, EP_R, ST_TIP
    };
    this.kappa = options.kappa ?? 'directed';          // κ: autonomy level
    this.chi = options.chi ?? 'reserve';               // χ: structural role
    this.lambda = 'idle';                              // λ: force ownership (computed)
    this.tau = options.tau ?? 'bare';                   // τ: hardware type
    this.rho = {                                       // ρ: hardware target
      processor: options.processor ?? 'esp32c3',
      magnetClass: options.magnetClass ?? 'N42',
      magnetSize: options.magnetSize ?? 3,
    };

    // Physical state (for rendering)
    this.position = { x: 0, y: 0, z: 0 };             // World position (mm)
    this.rotation = 0;                                  // Rotation around Y axis (radians)
    this.polygonId = null;                              // Which polygon this cell belongs to
    this.slotIndex = -1;                                // Slot within polygon

    // Connection points in local space
    this.connectionPoints = {
      EP_L:   { localX: -1, localZ: 0, connected: null },
      EP_R:   { localX: 1, localZ: 0, connected: null },
      ST_TIP: { localX: 0, localZ: -1, connected: null },
    };
  }

  /** Check if a σ transition is valid. */
  canTransition(newMode) {
    return TRANSITIONS[this.sigma]?.has(newMode) ?? false;
  }

  /** Attempt σ transition. Returns true if successful. */
  transition(newMode) {
    if (!this.canTransition(newMode)) return false;
    this.sigma = newMode;
    return true;
  }

  /** Get world-space position of a connection point. */
  getConnectionWorldPos(pointName, cbLength) {
    const cp = this.connectionPoints[pointName];
    if (!cp) return null;

    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const halfCB = cbLength / 2;
    const stemLen = this.delta.stemExtension * cbLength * 0.866; // normalized to hex inscribed radius

    let lx, lz;
    if (pointName === 'EP_L') {
      lx = -halfCB;
      lz = 0;
    } else if (pointName === 'EP_R') {
      lx = halfCB;
      lz = 0;
    } else {
      lx = 0;
      lz = -stemLen;
    }

    return {
      x: this.position.x + lx * cos - lz * sin,
      z: this.position.z + lx * sin + lz * cos,
    };
  }

  /** Connect to another cell. */
  connect(otherCell, myPoint, theirPoint, strength = 1.0) {
    this.epsilon.set(otherCell.uuid, {
      cellUuid: otherCell.uuid,
      myPoint,
      theirPoint,
      strength,
    });
    this.connectionPoints[myPoint].connected = otherCell.uuid;

    otherCell.epsilon.set(this.uuid, {
      cellUuid: this.uuid,
      myPoint: theirPoint,
      theirPoint: myPoint,
      strength,
    });
    otherCell.connectionPoints[theirPoint].connected = this.uuid;
  }

  /** Disconnect from another cell. */
  disconnect(otherUuid) {
    const conn = this.epsilon.get(otherUuid);
    if (!conn) return;

    this.connectionPoints[conn.myPoint].connected = null;
    this.epsilon.delete(otherUuid);
  }

  /** Get the full 9D coordinate as a plain object. */
  get coordinate() {
    return {
      sigma: this.sigma,
      epsilon: Array.from(this.epsilon.values()),
      delta: { ...this.delta },
      kappa: this.kappa,
      chi: this.chi,
      lambda: this.lambda,
      tau: this.tau,
      rho: { ...this.rho },
    };
  }
}
