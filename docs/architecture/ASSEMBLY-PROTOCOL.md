# Assembly Protocol

## 1. Overview

Assembly is the core operation of Seshat Fabric. Every structural change — building, reconfiguring, repairing, locomoting — is expressed as a sequence of assembly operations on individual T-pieces.

The protocol has three layers:

```
Layer 3: Coordinator (global planning)     ← Knows desired shape, computes routes
Layer 2: Relay corridor (local logistics)  ← Moves pieces along computed routes
Layer 1: Cell (atomic operations)          ← Executes single-step commands
```

## 2. Cell Commands (Layer 1)

Each cell understands exactly 6 atomic commands:

| Command | Bytes | Description |
|---------|-------|-------------|
| `LOCK(strength)` | 2 | Set all magnets to given coupling strength (0-255) |
| `RELEASE(face)` | 2 | Decouple specific connection point (EP_L=0, EP_R=1, ST_TIP=2) |
| `ATTRACT(face)` | 2 | Activate specific connection point to attract incoming piece |
| `FLEX(target)` | 2 | Set stem to target extension (0-255 normalized) |
| `REPORT()` | 1 | Send current δ (strain, extension, temperature) to coordinator |
| `SLEEP()` | 1 | Enter deep sleep until wake signal |

Total command vocabulary: 6 commands, 1-2 bytes each.

This is the **entire instruction set** for a cell. Every complex behavior decomposes into sequences of these 6 commands.

## 3. Piece Addressing

### UUID Scheme

Each T-piece has a 16-bit UUID (65,536 unique addresses). For structures up to ~60,000 cells, this is sufficient.

```
UUID format: [batch_id:4][serial:12]
  batch_id: manufacturing batch (0-15)
  serial: sequential within batch (0-4095)
```

### Position Addressing

The coordinator maintains a mapping: UUID → position in the ε graph.

Position is expressed as a **graph coordinate**, not a Cartesian coordinate:

```
Position = (polygon_id, slot_in_polygon)
  polygon_id: which polygon this piece belongs to (hexagon 7, triangle 3, etc.)
  slot_in_polygon: which edge of the polygon (0-5 for hexagon, 0-2 for triangle)
```

### Route Addressing

A route is a sequence of cells from source to destination:

```
Route = [cell_uuid_1, cell_uuid_2, ..., cell_uuid_n]
```

Each cell in the route will execute relay-receive then relay-pass as the transit piece passes through.

## 4. Assembly Operations (Layer 2)

### 4.1 Build Polygon

Assemble a new polygon from pieces in the reserve pool.

```
Input: polygon_type (triangle|hexagon|square|octagon), position, piece_uuids[]
Output: polygon formed at position, all pieces in rigid mode

Procedure:
  1. Coordinator selects N pieces from reserve pool
  2. For each piece:
     a. Compute route from reserve pool to target slot
     b. Set up relay corridor (assign relay-recv/relay-pass to cells along route)
     c. Command piece: RELEASE → transit along route → ATTRACT at destination
     d. Command piece: FLEX(target_extension) to match polygon geometry
     e. Command piece: LOCK(255) when in position
  3. Verify: all pieces report correct δ.stem_extension ± tolerance
  4. Assign σ = rigid to all pieces in polygon
```

### 4.2 Disassemble Polygon

Return pieces from a polygon to the reserve pool.

```
Input: polygon_id
Output: all pieces in reserve pool, polygon removed from ε graph

Procedure:
  1. Verify no critical loads on polygon (λ check)
  2. For each piece in polygon (sequential, outside-in):
     a. Command piece: FLEX(0) (retract stem)
     b. Command piece: RELEASE(all faces)
     c. Compute route to reserve pool
     d. Set up relay corridor
     e. Command piece: transit along route to reserve
     f. Command piece: SLEEP()
  3. Update ε graph: remove polygon
```

### 4.3 Route Piece

Move a single piece from position A to position B through the structure.

```
Input: piece_uuid, destination_position
Output: piece at new position, ε graph updated

Procedure:
  1. Compute shortest path through ε graph (BFS on relay-capable cells)
  2. Pre-check: all cells along path can enter relay mode (χ = relay or not load-bearing)
  3. Set up relay corridor:
     For i = 0 to path.length - 1:
       Command path[i]: σ = relay-receive
       Command path[i]: ATTRACT(face toward path[i-1])
  4. Release piece at origin:
     Command piece: RELEASE(all faces)
     Command piece: σ = in-transit
  5. Sequential handoff:
     For each cell in path:
       Wait for arrival (δ.field_strength > threshold on receiving face)
       Command cell: σ = relay-pass
       Command next_cell: σ = relay-receive (if not already)
  6. Arrive at destination:
     Command piece: σ = attract-home
     Command piece: FLEX(target_extension)
     Command piece: LOCK(255)
  7. Tear down relay corridor:
     For each cell in path:
       Command cell: σ = rigid (return to structural mode)
```

### 4.4 Shape Morph

Transform structure from shape A to shape B without full disassembly.

```
Input: current_shape (ε graph), target_shape (ε graph)
Output: structure in target_shape

Procedure:
  1. Diff: identify surplus cells (in current, not in target) and deficit positions (in target, not in current)
  2. Match: assign each surplus cell to a deficit position (minimum total routing distance, Hungarian algorithm)
  3. Order: topological sort — move outer pieces first to avoid structural collapse
  4. For each (surplus_cell, deficit_position) pair:
     a. Verify surplus_cell is not load-bearing (or transfer load first)
     b. Route piece from surplus position to deficit position (§4.3)
  5. Verify final ε graph matches target_shape
```

### 4.5 Self-Heal

Detect and repair structural damage.

```
Input: damage event (detected by δ anomaly)
Output: structure restored

Procedure:
  1. Detect: cell reports δ.strain > threshold or communication lost
  2. Diagnose:
     a. If cell responsive: command REPORT(), assess damage severity
     b. If cell unresponsive: infer from neighbors' ε (missing connection)
  3. Classify:
     a. DISCONNECTED: cell displaced but functional → route back to position
     b. DAMAGED: cell responding but δ abnormal → eject, replace
     c. LOST: cell not responding → mark as lost, route replacement
  4. Repair:
     a. For DISCONNECTED: attract-home at original position
     b. For DAMAGED/LOST:
        i.   Command neighbors to release connection to damaged cell
        ii.  If damaged cell responsive: route to reserve pool, mark for inspection
        iii. Select replacement from reserve pool
        iv.  Route replacement to vacant position (§4.3)
  5. Verify: ε graph matches pre-damage state
```

## 5. Routing Algorithm (Layer 3)

### Shortest Path

BFS on the ε graph, with weights:

```
weight(cell) = {
  1     if χ = relay (designated corridor)
  2     if χ = reserve (idle, can be temporarily repurposed)
  5     if χ = hinge or sensor (prefer not to disrupt)
  ∞     if χ = load-bearing or anchor (never route through)
}
```

### Corridor Capacity

A relay corridor is a single-lane path. Two pieces cannot pass through the same cell simultaneously.

For multiple simultaneous routes:
- **Non-overlapping paths**: compute independently, execute in parallel
- **Overlapping paths**: serialize at shared cells, or reroute one path

### Route Caching

Common routes (e.g., reserve pool → each edge of structure) can be precomputed and cached. Update cache when ε graph changes.

## 6. Coordinator Protocol

### Message Format

Coordinator → Cell messages:

```
Header (2 bytes):
  [target_uuid: 16 bits]

Payload (1-4 bytes):
  [command: 3 bits][args: 5-29 bits]
```

Maximum message size: 6 bytes.

### Broadcast

For mass commands (e.g., "all cells in polygon 7: LOCK(255)"):

```
Broadcast header (3 bytes):
  [0xFFFF (broadcast marker)][polygon_id: 8 bits]

Payload (1-4 bytes):
  [command: 3 bits][args: 5-29 bits]
```

### Communication Rate

Through-magnetic communication at ~1 kbps per hop:
- 6-byte message = 48 bits = 48ms per hop
- 10-hop route: 480ms for a command to reach destination
- With pipelining (send next command before first arrives): effective latency ~50ms

For time-critical operations (impact response):
- Use BLE gateway cell for parallel broadcast: ~5ms latency to all cells
- Reserve BLE for emergencies and global state changes

## 7. Safety Invariants

### Structural Safety

1. **No unsupported load-bearing cell removal**: Before removing a cell, verify that remaining cells can support the load. Compute load redistribution path.
2. **Minimum connectivity**: Every non-reserve cell must maintain ≥1 ε connection at all times during reconfiguration.
3. **Relay corridor isolation**: During piece transit, relay cells are temporarily non-structural. Ensure no load path depends on relay corridor cells.

### Communication Safety

4. **Heartbeat**: Every cell sends a heartbeat to at least one neighbor every 5 seconds. Three missed heartbeats → declared lost.
5. **Coordinator watchdog**: If coordinator is unreachable for 30 seconds, all cells degrade to κ = autonomous and enter rigid mode (fail-safe).

### Power Safety

6. **Low-power lockdown**: If supercapacitor drops below 10%, cell enters Tier 1 only. No active reconfiguration.
7. **Thermal shutdown**: If δ.temperature > 70°C, cell enters rigid mode and alerts coordinator. At 80°C, magnets begin to degrade.
