# 9D Fabric Space Specification

## 1. Universal Space Instantiation

The Seshat framework defines a universal semantic space:

```
𝕁 = (σ, ε, δ, κ, χ, λ, τ, ρ, Σ)
```

This document defines the **fabric instantiation** of 𝕁, mapping each dimension to the physical domain of programmable metamaterial cells.

### Cross-Domain Comparison

| Dim | Code | Drone | Fabric |
|-----|------|-------|--------|
| σ | Function signature (async, export, generator) | Behavioral mode (hover, translate, orbit) | Cell mode (rigid, flex, relay, attract, release, transit) |
| ε | Call graph (function → function) | Neighbor graph (drone → drone, k-nearest) | Physical connectivity (cell → cell, magnetic coupling) |
| δ | Data types, mutations, I/O | Sensor readings (position, battery, wind) | Stem extension, strain, temperature, field strength |
| κ | Constraints, invariants, validation | Autonomy level (manual, assisted, auto) | Autonomy level (autonomous, directed, emergency, passive) |
| χ | Architectural layer (route, service, repo) | Formation role (leader, follower, scout) | Structural role (load-bearing, hinge, sensor, relay, reserve) |
| λ | Variable ownership (read, write, own) | Resource ownership (airspace, charging, comm) | Force ownership (absorbing, transmitting, idle) |
| τ | Type annotations, generics | Physical traits (weight, rotor count, payload) | Cell hardware (bare, camera, IMU, flex-joint) |
| ρ | Runtime target (Node, Deno, Bun) | Hardware (Crazyflie, DJI, custom) | Processor variant, magnet class |
| Σ | Semantic intent hash | Mission hash | Composite from neighbors + objective |

## 2. Dimension Definitions

### σ — Cell Behavioral Mode

The behavioral mode determines what a cell is currently doing. This is the primary dispatch key for the catalog.

| Mode | Description | Power Tier | ε Requirement |
|------|-------------|------------|---------------|
| `rigid` | Locked in position, maximum magnetic coupling, structural | 1 | ≥2 neighbors |
| `flex` | Reduced coupling, allows deformation, absorbs impact | 1-2 | ≥1 neighbor |
| `relay-receive` | Accepting an incoming piece from a neighbor | 2 | ≥1 neighbor + 1 incoming |
| `relay-pass` | Handing off a piece to a neighbor | 2 | ≥1 neighbor + 1 outgoing |
| `attract-home` | Pulling into final position, stem adjusting | 2 | ≥2 target neighbors |
| `release` | Decoupling from neighbors, preparing for transit | 2 | ≥1 neighbor |
| `in-transit` | Moving through structure, no stable connections | 3 | 0 (transient) |
| `harvest` | Deployed as energy harvesting organ (sail, fin, antenna) | 1 | ≥1 anchor neighbor |
| `sense` | Active sensor mode (camera, IMU, strain gauge) | 2 | ≥1 neighbor |
| `idle` | Minimum power, reserve pool, waiting for assignment | 1 | 0 |

**Transition Matrix** (rows = from, columns = to, ✓ = valid):

| | rigid | flex | relay-recv | relay-pass | attract | release | transit | harvest | sense | idle |
|---|---|---|---|---|---|---|---|---|---|---|
| **rigid** | - | ✓ | ✓ | ✓ | - | ✓ | - | ✓ | ✓ | - |
| **flex** | ✓ | - | ✓ | ✓ | - | ✓ | - | - | ✓ | - |
| **relay-recv** | ✓ | ✓ | - | ✓ | - | - | - | - | - | - |
| **relay-pass** | ✓ | ✓ | ✓ | - | - | - | - | - | - | - |
| **attract** | ✓ | ✓ | - | - | - | - | - | - | - | - |
| **release** | - | - | - | - | - | - | ✓ | - | - | ✓ |
| **transit** | - | - | - | - | ✓ | - | - | - | - | ✓ |
| **harvest** | ✓ | - | - | - | - | ✓ | - | - | - | - |
| **sense** | ✓ | ✓ | - | - | - | ✓ | - | - | - | - |
| **idle** | - | - | - | - | ✓ | - | ✓ | - | - | - |

**Catalog size for σ**: 10 modes × ~5 parameterizations each ≈ **50 entries**.

### ε — Neighbor Graph (Physical Connectivity)

Unlike the code domain where ε is a call graph, fabric ε is **physical adjacency**.

**Value domain**: Set of (neighbor_uuid, connection_type, coupling_strength) tuples.

| Connection Type | Description | Coupling Range |
|----------------|-------------|----------------|
| `crossbar-crossbar` | Two crossbar edges aligned, high contact area | 0.8 - 1.0 |
| `crossbar-stem` | Crossbar edge meets stem tip | 0.4 - 0.7 |
| `stem-stem` | Two stem tips meeting (polygon center) | 0.3 - 0.6 |
| `lattice-strut` | 45° strut between layers (octagon+square tiling) | 0.5 - 0.8 |

**Properties**:
- ε is **symmetric**: if A is neighbor of B, B is neighbor of A
- ε is **dynamic**: changes as structure reconfigures
- ε is **self-discovered**: cells detect neighbors via magnetic field strength
- ε is **the power grid**: magnetic connections carry current
- ε is **the communication bus**: signals travel through magnetic couplings

**Maximum degree**: A single T-piece has 3 connection points (2 crossbar endpoints + 1 stem tip), so max degree = 3 for direct connections. In assembled structures, effective degree can be higher through polygon grouping.

### δ — Sensor State (Continuous Data)

The real-valued measurements available to each cell.

| Signal | Type | Range | Update Rate |
|--------|------|-------|-------------|
| `stem_extension` | float | 0.0 - 1.0 (normalized) | Continuous (self-reporting) |
| `strain` | float | 0.0 - 1.0 (normalized) | 100 Hz |
| `temperature` | float | -40°C to +85°C | 1 Hz |
| `field_strength` | float | 0.0 - 1.0 (per connection point) | 10 Hz |
| `acceleration` | vec3 | ±16g (if IMU present) | 100 Hz |
| `orientation` | quaternion | (if IMU present) | 100 Hz |
| `ambient_light` | float | 0.0 - 1.0 (if photodiode present) | 1 Hz |

**Key insight**: Stem extension is **free δ** — the compliant mechanism's position IS the measurement. No dedicated sensor needed.

### κ — Autonomy Level

How much agency does this cell have?

| Level | Description | Who Decides σ |
|-------|-------------|--------------|
| `autonomous` | Cell selects own σ based on local δ + ε | Cell itself |
| `directed` | Coordinator assigns σ, cell executes | Coordinator |
| `emergency` | Cell overrides all commands for self-preservation | Cell itself |
| `passive` | Cell is powered down or in deep sleep | Nobody (inert) |

**Default**: `directed`. Cells follow coordinator commands.
**Exception**: `emergency` is always available. A cell detecting imminent damage (extreme strain, temperature) can override to self-protect.
**Degradation**: If communication with coordinator is lost, cell degrades: `directed` → `autonomous` after timeout.

### χ — Structural Role

What function does this cell serve in the larger structure?

| Role | Description | Typical σ | Priority |
|------|-------------|-----------|----------|
| `load-bearing` | Primary structural member, resists compression/tension | rigid | Cannot be removed without replacement |
| `hinge` | Flex point for shape change, controlled deformation | flex | Can be temporarily stiffened |
| `sensor` | Active sensing position (camera, IMU, etc.) | sense | Placement optimized for coverage |
| `relay` | Transit corridor for piece routing | relay-recv/pass | Must remain clear for logistics |
| `reserve` | Spare piece, not currently structural | idle | First to be reassigned |
| `anchor` | Fixed reference point (e.g., where structure meets external surface) | rigid | Highest priority, never removed |
| `harvester` | Energy harvesting position (extended surface) | harvest | Retractable on demand |

**Spatial extension** (for multi-layer structures):
- `outer` — External surface interface
- `strut` — Load transfer between layers
- `inner` — Internal/comfort layer

### λ — Force Ownership

In a force-bearing structure, each cell has a role in the force distribution network.

| State | Description |
|-------|-------------|
| `absorbing` | This cell is the endpoint of an applied force |
| `transmitting` | This cell passes force from a neighbor toward ground/anchor |
| `distributing` | This cell spreads force across multiple neighbors (junction) |
| `idle` | No significant forces passing through this cell |
| `harvesting` | Converting mechanical displacement to electrical energy |

**λ is computed, not assigned**: The force distribution follows from the ε graph topology and the applied loads. λ updates automatically as structure and loads change.

### τ — Cell Hardware Type

Physical capabilities of this specific T-piece.

| Type | Description | Added Components | Weight Multiplier |
|------|-------------|-----------------|-------------------|
| `bare` | Standard T-piece, magnets + MCU only | None | 1.0× |
| `camera` | Includes miniature camera module | Camera, lens | 1.3× |
| `imu` | Includes IMU (accelerometer + gyroscope) | IMU chip | 1.05× |
| `flex-joint` | Enhanced compliant mechanism | Extra flex zones | 1.1× |
| `power` | Extra energy storage | Supercapacitor | 1.4× |
| `comm` | Enhanced communication (BLE/WiFi antenna) | RF module | 1.2× |

**Manufacturing win**: Most cells are `bare`. Specialized cells (camera, IMU, comm) are sprinkled at strategic positions. One manufacturing line for the common case, manual assembly for rare variants.

### ρ — Hardware Target

The specific processor and magnet configuration.

| Field | Options |
|-------|---------|
| `processor` | `esp32c3`, `rp2040`, `attiny85`, `none` (passive cell) |
| `magnet_class` | `N35`, `N42`, `N52` (neodymium grades) |
| `magnet_size` | `2mm`, `3mm`, `5mm` (diameter) |
| `comm_protocol` | `magnetic`, `ble`, `i2c`, `none` |

### Σ — Composite Semantic Hash

Derived from the full 9D vector. Two cells with the same Σ are functionally interchangeable in their current context.

```
Σ = hash(σ, local_ε_pattern, δ_quantized, κ, χ, λ, τ, ρ)
```

Where `local_ε_pattern` is the **topological pattern** of neighbors (not specific UUIDs). This allows equivalent cells in different parts of the structure to share the same catalog entry.

## 3. Fiber Bundle Structure

Some dimensions depend on others:

```
τ(ρ)     — What hardware you can have depends on your processor
σ(τ)     — Some modes require specific hardware (sense requires camera/IMU)
χ(τ)     — Some roles require specific hardware (sensor role requires τ=camera|imu)
λ(ε, σ)  — Force distribution depends on connectivity and current mode
Σ(all)   — Composite depends on everything
```

The fiber bundle is:

```
𝕁_fabric = Σ_{ρ ∈ D_ρ} Σ_{τ ∈ D_τ(ρ)} (D_σ(τ) × D_ε × D_δ × D_κ × D_χ(τ) × D_λ(ε,σ) × D_Σ)
```

## 4. Catalog Size Estimate

| Dimension | |D| | Notes |
|-----------|------|-------|
| σ | 10 | Behavioral modes |
| ε patterns | ~20 | Topological patterns (not specific UUIDs) |
| δ quantized | ~10 | Binned sensor readings |
| κ | 4 | Autonomy levels |
| χ | 7+3 | Roles + spatial positions |
| λ | 5 | Force states |
| τ | 6 | Hardware types |
| ρ | ~12 | Processor × magnet combinations |

**Upper bound**: 10 × 20 × 10 × 4 × 10 × 5 × 6 × 12 = 28,800,000

**Practical catalog** (most combinations are invalid or unreachable):
Estimated **200–800 entries** (comparable to drone domain estimate of 200–1,500).

This is consistent with the compression ratio observed in the code domain: 108,966 entities → 2,571 patterns (42.4×). Physical constraints make the space even smaller.

## 5. Proof of Valid Instantiation

For 𝕁_fabric to be a valid instantiation of the universal space, it must satisfy:

1. **Finite domains**: ✓ All dimension domains are finite and enumerable (see table above)
2. **Well-defined fiber structure**: ✓ Dependencies are acyclic (ρ → τ → σ, χ; ε,σ → λ)
3. **Blast radius property**: ✓ A state change in cell C propagates only to cells in ε-neighborhood of C, with attenuation proportional to graph distance
4. **Catalog completeness**: TBD — requires enumeration of reachable states
5. **Determinism**: ✓ Given (J, κ=directed, command), the next state is uniquely determined
