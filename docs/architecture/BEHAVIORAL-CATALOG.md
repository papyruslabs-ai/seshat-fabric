# Behavioral Catalog — Cell Modes and Transitions

## 1. Catalog Structure

Every cell behavior is a catalog entry. At runtime, the cell (or coordinator) looks up the entry by the cell's current 9D coordinate, and the entry specifies the output — actuator commands, timing, power settings.

```
CatalogEntry {
  id: string                    // Unique entry identifier
  σ_mode: string                // Primary behavioral mode
  preconditions: {              // Must be true to enter this behavior
    ε_min_neighbors: number     // Minimum connected neighbors
    ε_max_neighbors: number     // Maximum (for safety)
    δ_ranges: {...}             // Sensor values within range
    κ_required: string[]        // Allowed autonomy levels
    τ_required: string[]        // Required hardware types (empty = any)
  }
  actions: {                    // What the cell does in this mode
    magnets: MagnetCommand[]    // Per-connection-point magnet state
    stem: StemCommand           // Stem extension target
    power_tier: 1 | 2 | 3      // Power consumption tier
    comm: CommCommand           // What to report to coordinator/neighbors
    duration: number | null     // How long this mode lasts (null = indefinite)
  }
  postconditions: {             // Guaranteed state after execution
    ε_delta: string             // How connectivity changes
    σ_next: string[]            // Valid next modes
  }
  verification: {               // How to confirm correct execution
    check: string               // What to measure
    tolerance: number           // Acceptable deviation
  }
}
```

## 2. Mode Specifications

### 2.1 RIGID

**Purpose**: Structural integrity. Maximum coupling. This is the "default" mode for load-bearing cells.

```
Entry: rigid.standard
  preconditions:
    ε_min_neighbors: 2
    δ.strain < 0.8 (not about to fail)
  actions:
    magnets: all ON at maximum
    stem: locked at current extension
    power_tier: 1
    comm: report strain every 1s
  postconditions:
    ε_delta: none (stable)
    σ_next: [flex, relay-recv, relay-pass, release, harvest, sense]
```

```
Entry: rigid.high-load
  preconditions:
    ε_min_neighbors: 3
    δ.strain >= 0.5
  actions:
    magnets: all ON at maximum
    stem: locked, reinforced coupling
    power_tier: 2 (active strain monitoring)
    comm: report strain every 100ms (elevated reporting)
  postconditions:
    ε_delta: none
    σ_next: [flex, release] (limited transitions under load)
```

### 2.2 FLEX

**Purpose**: Controlled deformation. Absorb displacement without breaking connections.

```
Entry: flex.passive
  preconditions:
    ε_min_neighbors: 1
  actions:
    magnets: reduced coupling (50-80%)
    stem: unlocked, free to extend/compress within range
    power_tier: 1
    comm: report displacement delta
  postconditions:
    ε_delta: neighbors may shift position
    σ_next: [rigid, relay-recv, relay-pass, release, sense]
```

```
Entry: flex.absorb
  preconditions:
    ε_min_neighbors: 1
    δ.acceleration > threshold (impact detected)
  actions:
    magnets: graduated coupling (stiff center, soft edges)
    stem: actively damping (resist extension proportional to velocity)
    power_tier: 2 (active control)
    comm: broadcast impact event to ε neighbors
  postconditions:
    ε_delta: may lose weak connections
    σ_next: [rigid, flex.passive]
```

### 2.3 RELAY-RECEIVE

**Purpose**: Accept an incoming T-piece from an adjacent cell.

```
Entry: relay-receive.standard
  preconditions:
    ε_min_neighbors: 1
    χ = relay (this cell is designated as transit corridor)
    incoming piece UUID known
  actions:
    magnets: attract on receiving face, hold on structural faces
    stem: adjust to create pathway
    power_tier: 2
    comm: signal ready to upstream cell
    duration: until piece arrives or timeout (500ms)
  postconditions:
    ε_delta: +1 transient neighbor (the piece in transit)
    σ_next: [relay-pass, rigid] (pass it along or absorb it)
```

### 2.4 RELAY-PASS

**Purpose**: Hand off a transit piece to the next cell in the route.

```
Entry: relay-pass.standard
  preconditions:
    ε: has piece to pass
    downstream cell in relay-receive mode
  actions:
    magnets: release on passing face, pulse on opposite face (push)
    stem: adjust to guide piece toward downstream
    power_tier: 2
    comm: signal handoff to downstream cell
    duration: until piece clears or timeout (500ms)
  postconditions:
    ε_delta: -1 transient neighbor
    σ_next: [rigid, relay-recv, flex]
```

### 2.5 ATTRACT-HOME

**Purpose**: Pull into final assembly position. This is the "last mile" of piece routing.

```
Entry: attract-home.polygon
  preconditions:
    ε: at least 2 target neighbors within range
    assigned position coordinates known
  actions:
    magnets: maximum attract on all connection points
    stem: extending toward center (for polygon assembly)
    power_tier: 2
    comm: report progress to coordinator
    duration: until stable (strain < threshold) or timeout
  postconditions:
    ε_delta: +N neighbors (full polygon connections)
    σ_next: [rigid, flex]
  verification:
    check: stem_extension matches expected value ± 5%
    tolerance: 0.05
```

### 2.6 RELEASE

**Purpose**: Decouple from current position, prepare for transit or reassignment.

```
Entry: release.graceful
  preconditions:
    ε_min_neighbors: 1
    no critical load (λ ≠ absorbing with strain > 0.5)
  actions:
    magnets: sequential release (one connection at a time to prevent sudden collapse)
    stem: retract to minimum
    power_tier: 2
    comm: notify neighbors of impending departure
    duration: 200ms per connection
  postconditions:
    ε_delta: all connections released
    σ_next: [transit, idle]
```

```
Entry: release.emergency
  preconditions:
    δ.strain > 0.9 OR δ.temperature > 80°C
    κ = emergency (auto-triggered)
  actions:
    magnets: all OFF immediately
    stem: retract
    power_tier: 3 (rapid)
    comm: broadcast damage alert
    duration: immediate
  postconditions:
    ε_delta: all connections severed
    σ_next: [transit, idle]
```

### 2.7 IN-TRANSIT

**Purpose**: Moving through the structure. No stable connections.

```
Entry: transit.guided
  preconditions:
    ε: 0 stable connections
    route plan assigned
  actions:
    magnets: passive (attracted by relay cells along route)
    stem: retracted (minimum profile for travel)
    power_tier: 1 (passive — being moved by others)
    comm: report position to coordinator
  postconditions:
    ε_delta: transient contacts only
    σ_next: [attract-home, idle]
```

### 2.8 HARVEST

**Purpose**: Deployed as energy harvesting structure.

```
Entry: harvest.sail
  preconditions:
    ε_min_neighbors: 1 (anchor point)
    χ = harvester
    wind/vibration above threshold
  actions:
    magnets: anchor connection maximum, extension connections minimal (flexible)
    stem: extended to maximum (maximize surface area)
    power_tier: 1 (net energy positive)
    comm: report energy harvested
  postconditions:
    ε_delta: stable anchor
    σ_next: [rigid, release] (retract when done)
```

### 2.9 SENSE

**Purpose**: Active sensor mode.

```
Entry: sense.camera
  preconditions:
    τ = camera
    ε_min_neighbors: 1
  actions:
    magnets: hold position stable
    stem: locked (vibration isolation)
    power_tier: 2
    comm: stream sensor data to coordinator
  postconditions:
    ε_delta: none
    σ_next: [rigid, flex, release]
```

```
Entry: sense.imu
  preconditions:
    τ = imu
    ε_min_neighbors: 1
  actions:
    magnets: hold position
    stem: locked
    power_tier: 2
    comm: stream acceleration + orientation
  postconditions:
    ε_delta: none
    σ_next: [rigid, flex, release]
```

### 2.10 IDLE

**Purpose**: Minimum power. Reserve pool. Waiting for assignment.

```
Entry: idle.sleep
  preconditions: none (always valid)
  actions:
    magnets: all OFF
    stem: retracted
    power_tier: 1 (deep sleep)
    comm: listen for wake signal only
    duration: indefinite
  postconditions:
    ε_delta: none
    σ_next: [attract-home, transit]
```

## 3. Compatibility Matrix

Can two adjacent cells be in these modes simultaneously?

| Cell A \ Cell B | rigid | flex | relay-r | relay-p | attract | release | transit | harvest | sense | idle |
|-----------------|-------|------|---------|---------|---------|---------|---------|---------|-------|------|
| **rigid** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ | - |
| **flex** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | ✓ | - |
| **relay-r** | ✓ | ✓ | - | ✓* | - | - | ✓* | - | - | - |
| **relay-p** | ✓ | ✓ | ✓* | - | - | - | - | - | - | - |
| **attract** | ✓ | ✓ | - | - | - | - | - | - | - | - |
| **release** | ✓ | ✓ | - | - | - | - | - | - | - | - |
| **transit** | - | - | ✓* | - | - | - | - | - | - | - |
| **harvest** | ✓ | - | - | - | - | - | - | ✓ | - | - |
| **sense** | ✓ | ✓ | - | - | - | - | - | - | ✓ | - |
| **idle** | - | - | - | - | - | - | - | - | - | ✓ |

`✓*` = Required pair (relay-recv expects relay-pass or transit on adjacent cell)

## 4. Macro Behaviors

Complex behaviors emerge from coordinated mode assignments across multiple cells.

### 4.1 Shape Morph
```
For each cell in deficit_region:
  coordinator assigns: attract-home with target position
For each cell in surplus_region:
  coordinator assigns: release → transit (routed to deficit_region)
For relay path between regions:
  coordinator assigns: relay-recv/relay-pass in sequence
```

### 4.2 Impact Response
```
On impact detection (δ.acceleration spike):
  Impact cell: flex.absorb
  1-hop neighbors: flex.passive (absorb wave)
  2-hop neighbors: rigid.high-load (brace)
  3+ hop neighbors: rigid.standard (unaffected)
  Harvester cells (if any): λ = harvesting (capture energy)
```

### 4.3 Locomotion (Amoeboid)
```
Leading edge cells: attract-home (building forward)
Trailing edge cells: release → transit → attract-home (recycling to front)
Body cells: rigid (structural)
Relay corridor: relay-recv/relay-pass (piece routing)
Contact cells: flex (ground interface)
```

### 4.4 Harvesting Organ Deployment
```
Reserve cells: transit → attract-home (position as organ)
Organ cells: harvest.sail / harvest.solar
Anchor cells: rigid (hold organ to body)
On retract command: release → transit → idle (back to reserve)
```

## 5. Catalog Growth Strategy

| Phase | Entries | Source |
|-------|---------|--------|
| Seed | ~30 | Hand-authored from this document |
| Expand | ~100 | Parameterized variants (different strain thresholds, timing) |
| Simulate | ~200 | Generated from simulator runs, validated in virtual environment |
| Calibrate | ~300-500 | Refined with physical prototype measurements |
| Optimize | ~500-800 | Pruned for efficiency, merged equivalent entries |

The catalog is the safety case. Every behavior the structure can exhibit maps to a finite, verified catalog entry. No emergent behavior outside the catalog.
