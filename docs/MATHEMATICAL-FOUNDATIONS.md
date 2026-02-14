# Seshat Fabric: Mathematical Foundations

**A Formal Framework for Self-Aware Programmable Matter**

Version 0.1 — February 2026

---

## 0. Abstract

This document establishes the mathematical foundations for Seshat Fabric — a programmable metamaterial built from identical T-shaped cells that connect magnetically to form reconfigurable 2D and 3D structures. Each cell carries a microcontroller, knows its own 9-dimensional coordinate, and can change its behavior, move other cells through the structure, and participate in collective sensing.

We show that the same 9-dimensional coordinate system (JSTF-T) that describes semantic structure in source code also describes the state of a physical programmable material, and that this is not coincidence but a consequence of both systems being instances of a common abstract structure — an **Abstract Seshat System**. Theorems proved at the abstract level apply to both domains.

The document is organized as follows:
- **Sections 1–3**: The physical primitives (T-piece geometry, connection types, fabric graph)
- **Sections 4–5**: The 9D coordinate space and behavioral catalog (fabric instantiation)
- **Sections 6–8**: Dynamics, self-awareness, and energy (key physical theorems)
- **Section 9**: The universality result (Abstract Seshat Systems)
- **Section 10**: Implications, predictions, and open questions

**Companion document**: [DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md) extends this framework by showing that the fabric's capabilities emerge not from any single static configuration but from continuous *flows* between configurations, and that the fabric's intelligence is a continuous sensorimotor loop coupling the fabric to its human operator — not a conversational interface. Results in Sections 6–8 below describe the physics of individual configurations; Dynamic Cognition describes the physics of *transitions between* configurations.

---

## 1. The T-Piece: A Universal Cell

### 1.1 Geometric Definition

**Definition 1.1 (T-Piece).** A T-piece is a rigid body parameterized by a dimension vector **p** ∈ ℝ⁸:

```
p = (L_cb, W_cb, H_cb, L_st_min, L_st_max, W_st, D_mag, D_mag_depth)
```

where:
- `L_cb` = crossbar length (mm)
- `W_cb` = crossbar width (mm)
- `H_cb` = crossbar thickness / height (mm), forming a **square cross-section** with W_cb
- `L_st_min`, `L_st_max` = stem length range (mm)
- `W_st` = stem width (mm)
- `D_mag` = magnet diameter (mm)
- `D_mag_depth` = magnet recess depth (mm)

The body consists of two rectangular solids joined at a right angle:
1. **Crossbar**: an elongated bar of dimensions `L_cb × W_cb × H_cb`, centered at the origin with its long axis along the local X-axis.
2. **Stem**: a variable-length bar extending from the crossbar center in the local −Y direction, with a compliant mechanism (accordion living hinge) allowing extension from `L_st_min` to `L_st_max`.

**Convention.** The crossbar cross-section is **square** (W_cb = H_cb). This is a design choice with deep consequences: it gives the crossbar four distinct faces, three of which are available for inter-cell connections.

### 1.2 Connection Zones

**Definition 1.2 (Connection Zone).** A connection zone is a region on the T-piece surface equipped with a magnetic element (permanent magnet, electromagnet, or magnetic strip) capable of forming a bond with a compatible zone on another T-piece.

Each T-piece has **six** connection zones, divided into two types:

#### Point Connections (Magnetic Dipoles)

| Zone | Location | Type | Role |
|------|----------|------|------|
| **EP_L** | Left end of crossbar (−X face) | Cylindrical permanent magnet | Intra-polygon: connects to EP_R of adjacent cell |
| **EP_R** | Right end of crossbar (+X face) | Cylindrical permanent magnet | Intra-polygon: connects to EP_L of adjacent cell |
| **ST_TIP** | End of stem (−Y extremity) | Cylindrical permanent magnet | Radial: reaches toward polygon center or neighboring structures |

#### Face Connections (Magnetic Strips)

| Zone | Location | Type | Role |
|------|----------|------|------|
| **F_TOP** | Top face of crossbar (+Y face) | Magnetic strip, length ≈ L_cb | Inter-polygon: bonds assembled polygons to each other |
| **F_LEFT** | Left face of crossbar (−Z face) | Magnetic strip, length ≈ L_cb | 3D assembly: out-of-plane connections |
| **F_RIGHT** | Right face of crossbar (+Z face) | Magnetic strip, length ≈ L_cb | 3D assembly: out-of-plane connections |

The **bottom face** (−Y, where the stem attaches) has no connection zone.

**Definition 1.3 (Connection Zone Set).** The connection zone set of a T-piece is:

```
Z = Z_point ∪ Z_face = {EP_L, EP_R, ST_TIP} ∪ {F_TOP, F_LEFT, F_RIGHT}
```

This decomposition is functionally significant:

- **Z_point** zones form polygon edges. EP_L of cell *i* bonds to EP_R of cell *i+1* (mod *n*) to create an *n*-sided polygon.
- **Z_face** zones connect assembled polygons. F_TOP bonds polygon-to-polygon in the primary assembly plane. F_LEFT and F_RIGHT enable out-of-plane bonds for 3D structures.
- **ST_TIP** is hybrid — it participates in both intra-polygon structure (reaching toward the polygon center) and inter-polygon connections (bridging between structures in the stem direction).

### 1.3 Connection Compatibility

**Definition 1.4 (Compatible Pair).** Two connection zones z₁ ∈ T₁ and z₂ ∈ T₂ are compatible, written z₁ ⋈ z₂, if:

1. **Type match**: Both are point zones, or both are face zones.
2. **Polarity alignment**: Their magnetic polarities are complementary (N→S alignment produces attraction).
3. **Geometric feasibility**: Their surface normals are approximately anti-parallel (within tolerance angle θ_max ≈ 15°) and their surfaces are within bonding distance d_bond.

**Definition 1.5 (Bond).** A bond is a realized connection between two compatible zones:

```
b = (T₁, z₁, T₂, z₂, s)
```

where s ∈ [0, 1] is the bond strength (1 = full contact, 0 = no bond). For point connections, strength is determined by gap distance via the dipole force law. For face connections, strength depends on overlap area and gap distance.

**Definition 1.6 (Bond Force — Point Connection).**

For two identical cylindrical magnets of remanence B_r, diameter D, height h, at center-to-center distance d:

```
m = B_r · π(D/2)²h / μ₀              (magnetic moment, A·m²)
F(d) = (3μ₀ / 2π) · m² / d⁴          (axial force, N)
k(d) = 4 · (3μ₀ / 2π) · m² / d⁵      (spring constant, N/m)
```

where μ₀ = 4π × 10⁻⁷ T·m/A.

**Definition 1.7 (Bond Force — Face Connection).**

For a magnetic strip of length L, width w, remanence B_r, at gap distance g with overlap length L_overlap:

```
F_face ≈ (B_r² · w · L_overlap) / (2μ₀) · f(g/w)
```

where f(g/w) is a dimensionless function that decays with the gap-to-width ratio. Face connections provide both **normal force** (resistance to separation) and **shear force** (resistance to sliding), unlike point connections which primarily resist normal separation.

### 1.4 The Separation of Concerns

The six connection zones create a clean **separation of structural roles**:

```
Polygon formation:     EP_L ←→ EP_R    (chains of cells form polygon edges)
Polygon-to-polygon:    F_TOP ←→ F_TOP  (assembled polygons tile together)
3D assembly:           F_LEFT, F_RIGHT  (layers stack, structures branch)
Radial / bridging:     ST_TIP ←→ ST_TIP or ST_TIP ←→ F_*
```

**Lemma 1.1 (Polygon Closure).** For an *n*-sided regular polygon formed by *n* T-pieces:

```
L_cb = 2 · R_inscribed · tan(π/n)
```

where R_inscribed is the inscribed radius (center to edge midpoint). The stem must reach at least R_inscribed for the stem tips to meet at the polygon center:

```
L_st_max ≥ R_inscribed = L_cb / (2 · tan(π/n))
```

For a hexagon (n=6): R_inscribed = L_cb · √3/2 ≈ 0.866 · L_cb.

**Lemma 1.2 (Maximum Valence).** A single T-piece can simultaneously bond with at most **6 other cells** (one per connection zone). In practice, a cell in a polygon uses 2 zones for EP bonds and has 4 remaining zones for inter-polygon, 3D, and radial connections.

---

## 2. The Fabric: A Labeled 3D Graph

### 2.1 Formal Definition

**Definition 2.1 (Fabric).** A fabric is a tuple:

```
F = (V, E, J, Φ)
```

where:
- **V** is a finite set of cells, each a T-piece with a unique identifier (UUID ∈ ℕ₁₆, i.e., 16-bit addressing supports up to 65,536 cells).
- **E** ⊂ V × V × Z × Z × ℝ₊ is a set of bonds: each edge (v₁, v₂, z₁, z₂, s) records which cells are connected, through which zones, with what strength.
- **J**: V → 𝕁 assigns a 9-dimensional coordinate to each cell (see Section 4).
- **Φ**: V → ℝ³ × SO(3) assigns a position and orientation (a rigid-body pose) to each cell in physical space.

The fabric's state at time *t* is the full tuple F(t) = (V(t), E(t), J(t), Φ(t)). Unlike static systems, **all four components can change over time**: cells can be added or removed (V), bonds can form or break (E), coordinates can be updated (J), and cells can move (Φ).

### 2.2 The Epsilon Graph

**Definition 2.2 (ε-Graph).** The epsilon graph of a fabric F is the undirected multigraph:

```
G_ε = (V, E_ε)
```

where E_ε is the projection of E onto V × V (ignoring zone labels and strength). Two cells are ε-adjacent if they share at least one bond.

This is the fabric's primary structural representation. It encodes:
- **Physical connectivity**: who can push/pull whom
- **Communication topology**: who can signal whom (via magnetic field modulation)
- **Power grid**: who can share harvested energy with whom
- **Routing graph**: paths for magnetic peristalsis (cell transport)

**Proposition 2.1.** The ε-graph of a fabric is:
- **Undirected** (bonds are symmetric)
- **Bounded degree**: Δ(G_ε) ≤ 6 (each cell has at most 6 connection zones)
- **Locally planar** within a single polygon layer, but **globally non-planar** when 3D assembly creates out-of-plane edges through F_LEFT and F_RIGHT zones
- **Dynamic**: edges appear (bond formation) and disappear (bond breaking) as the fabric reconfigures

### 2.3 Hierarchical Structure

The fabric has a natural hierarchy:

```
Cell → Polygon → Patch → Structure
```

**Definition 2.3 (Polygon).** A polygon P_n is a set of *n* cells {c₁, ..., c_n} connected in a cycle via EP bonds:

```
EP_R(c_i) ⋈ EP_L(c_{i+1 mod n})  for all i ∈ {1, ..., n}
```

forming a regular *n*-gon with crossbars as edges and stems pointing toward the center.

**Definition 2.4 (Patch).** A patch is a connected set of polygons bonded via face connections (F_TOP, F_LEFT, F_RIGHT) and/or stem connections (ST_TIP). A single-layer patch is a tiling of the plane by polygons; a multi-layer patch is a 3D structure.

**Definition 2.5 (Structure).** A structure is the maximal connected component of the ε-graph. A fabric may contain multiple disjoint structures (and free cells).

### 2.4 Tiling Theory

For single-layer patches, the fabric implements **edge-to-edge tilings** of the Euclidean plane.

**Theorem 2.1 (Achievable Tilings).** With identical T-pieces of crossbar length L_cb, the fabric can realize:

| Tiling | Polygon | Cells/polygon | Vertex config |
|--------|---------|---------------|---------------|
| Triangular | Triangle (n=3) | 3 | 3.3.3.3.3.3 |
| Square | Square (n=4) | 4 | 4.4.4.4 |
| Hexagonal | Hexagon (n=6) | 6 | 6.6.6 |
| Truncated square | Octagon+Square (n=8,4) | 8+4 | 4.8.8 |

*Proof sketch.* Each tiling is realizable if the polygon closure condition (Lemma 1.1) is satisfied and if adjacent polygons can bond via face connections. The face connections along shared edges provide the inter-polygon bonds. □

For 3D structures, the fabric can form:
- **Prisms**: polygon patch + perpendicular walls (via F_LEFT/F_RIGHT bonds)
- **Tubes**: polygon patch bent into a cylinder
- **Closed polyhedra**: with sufficient cell count and appropriate face bonding
- **Branching structures**: multiple patches meeting at angles

---

## 3. The Physical Basis: Electromagnetism

The fabric's capabilities rest on well-established electromagnetic phenomena. This section identifies the specific physical principles that are elevated to **first-class mathematical objects** in the framework.

### 3.1 Magnetic Dipole Interaction (Bonding)

Every connection zone contains a permanent magnet (or electromagnet) that can be modeled as a magnetic dipole with moment **m**. The interaction energy between two dipoles determines bond strength:

```
U(r, m₁, m₂) = (μ₀/4π) · [3(m₁·r̂)(m₂·r̂) - m₁·m₂] / r³
```

**Role in the framework:** This is the ε dimension — the physical basis of connectivity. Bond strength is not binary (connected/disconnected) but continuous, determined by distance and alignment.

### 3.2 Faraday's Law (Energy Harvesting)

A changing magnetic flux through a coil induces an EMF:

```
ε = -N · dΦ_B/dt
```

When cells experience mechanical impact, vibration, or neighbor magnetic state changes, the flux through embedded coils changes, generating electrical energy.

**Role in the framework:** This is the energy source for the δ dimension (sensors require power) and enables the τ = harvest hardware type. It couples mechanical events (impact, vibration) to electrical energy — the fabric literally gains energy when struck.

**Harvesting power per cell during impact:**

```
P_harvest = (B_r · N · A · ω)² / (2R)
```

where N = coil turns, A = coil area, ω = vibration frequency, R = coil resistance. For a 5mm N42 magnet with a 30-turn coil at 100 Hz: P_harvest ≈ 0.35 mW.

### 3.3 Lorentz Force / Eddy Currents (Damping)

Conductive elements moving through a magnetic field experience a braking force:

```
F_brake = σ · v × B · (v × B) · Volume
```

**Role in the framework:** Provides passive damping during impact absorption without requiring active control. Cells near an impact site naturally resist rapid displacement.

### 3.4 Electromagnetic Induction (Communication)

Two adjacent coils can communicate via magnetic field modulation:

```
V_receive = M · dI_transmit/dt
```

where M is the mutual inductance between neighboring coils.

**Role in the framework:** This is how cells transmit their 9D coordinates and receive commands. The ε-graph IS the communication network — physical connectivity and data connectivity are the same thing.

**Channel capacity:** ~1 kbps per bond (sufficient for 6-byte command packets at 50ms intervals).

### 3.5 Hall Effect (Sensing)

A current-carrying conductor in a magnetic field develops a transverse voltage:

```
V_H = (I · B) / (n · e · t)
```

**Role in the framework:** Hall effect sensors at connection zones measure the local magnetic field vector. This provides:
- **Neighbor presence detection**: a nearby magnet produces a measurable field
- **Distance estimation**: field strength ∝ 1/r³ for a dipole
- **Orientation sensing**: the field vector indicates the neighbor's relative orientation

This is the physical basis of the δ dimension's `fieldStrength` component — each cell can sense the magnetic field at each of its connection zones.

### 3.6 Switchable Magnetism (Actuation)

The fabric's ability to reconfigure depends on **switchable magnetic connections**:

1. **Shape Memory Alloy (SMA)**: A NiTi wire heated above its transition temperature (~70°C) contracts, physically separating a permanent magnet from the bonding surface. Strong hold (permanent magnet), slow release (~100ms).

2. **Electromagnet**: A coil whose field can be reversed to repel a neighboring permanent magnet. Weak hold, fast switching (~1ms).

3. **Hybrid**: Permanent magnet for passive hold + electromagnet for active override. The effective force is:

```
F_hybrid(d) = F_permanent(d) + F_electromagnet(d, I)
```

where I is the coil current. At I = 0, the permanent magnet holds (strong, zero power). To release, current is applied to generate an opposing field: F_electromagnet(d, I_release) ≈ −F_permanent(d). This requires power only during transitions, not during hold — combining the energy efficiency of SMA with the speed of electromagnets, at the cost of additional hardware per connection zone.

**Role in the framework:** This is the physical actuator behind σ transitions. When a cell transitions from RIGID to RELEASE, it activates its switchable mechanism to break bonds. The σ dimension's transition speed is bounded by the switching physics:

| Mechanism | Hold strength | Release time | Hold power | Release power |
|-----------|--------------|--------------|------------|---------------|
| SMA | Strong (permanent magnet) | ~100 ms | 0 mW | ~50 mW (heating) |
| Electromagnet | Weak (~30% of permanent) | ~1 ms | ~15 mW (continuous) | ~15 mW |
| Hybrid | Strong (permanent magnet) | ~5 ms | 0 mW | ~20 mW (coil pulse) |

---

## 4. The 9D Coordinate Space

### 4.1 The Universal Claim

The same 9-dimensional coordinate system that describes semantic structure in source code (JSTF-T, see *JSTF-T Mathematical Foundations v0.2*) also describes the state of a physical cell in the fabric. This section defines the fabric instantiation of each dimension.

**Definition 4.1 (Fabric Coordinate Space).** The fabric coordinate space is:

```
𝕁_fabric = Σ_f × E_f × Δ_f × K_f × X_f × Λ_f × T_f × P_f × S_f
```

where each factor is defined below. A cell's coordinate **j** ∈ 𝕁_fabric determines its behavior.

### 4.2 Dimension Definitions

#### σ (Sigma): Behavioral Mode

```
Σ_f = {rigid, flex, relay-recv, relay-pass, attract, release, transit, harvest, sense, idle}
```

The σ dimension determines **what the cell is currently doing**. It is the fabric analog of a function's structural signature (async, exported, generator, etc.) — it classifies the entity's behavioral type.

| Mode | Physical behavior | Magnetic state | Power tier |
|------|-------------------|----------------|------------|
| rigid | All bonds locked, structure load-bearing | All zones active, maximum strength | 1 (standby) |
| flex | Stem compliant, absorbs displacement | Point zones active, stem unlocked | 1 |
| relay-recv | Accepting an incoming cell at ST_TIP | ST_TIP set to attract | 2 (active) |
| relay-pass | Releasing a cell from ST_TIP to neighbor | ST_TIP releasing, neighbor ST_TIP attracting | 2 |
| attract | Actively pulling a free cell toward this zone | Selected zone(s) at maximum attraction | 2 |
| release | Breaking bonds to become free or to free a neighbor | Selected zone(s) deactivated | 2 |
| transit | Cell is free and being moved through the structure | No active bonds (moved by neighbors) | 3 (high) |
| harvest | Coil circuit closed, harvesting vibration/impact energy | Passive magnets only, coil generating | 1 |
| sense | Sensors active, reporting measurements | Passive magnets, sensors powered | 2 |
| idle | Minimum power, waiting for commands | Passive magnets only | 0 (sleep) |

**Definition 4.2 (σ Transition Graph).** The valid transitions between modes form a directed graph T_σ = (Σ_f, →) where → is the set of permitted transitions (see Section 6.1 for the full transition matrix).

#### ε (Epsilon): Connectivity

```
E_f(v) = { (u, z_v, z_u, s) : v is bonded to u through zones z_v, z_u with strength s }
```

The ε dimension is the cell's **local view of the ε-graph**: who is connected to me, through which zones, and how strongly. This is the fabric analog of a function's call graph adjacency — it records who interacts with whom.

**Key property:** ε is both **data** (the cell knows its neighbors) and **infrastructure** (ε IS the communication channel, power grid, and force transmission path). In the code domain, the call graph is similarly dual: it represents both dependency relationships and the flow paths for data and control.

#### δ (Delta): Sensor State

```
Δ_f = ℝ × ℝ × ℝ × ℝ⁶
```

Components:
- `stemExtension` ∈ [0, 1]: current stem length as fraction of range
- `strain` ∈ ℝ: mechanical strain at the stem hinge (measured by flex sensor)
- `temperature` ∈ ℝ: local temperature (°C)
- `fieldStrength` ∈ ℝ⁶: magnetic field magnitude at each of the 6 connection zones

The δ dimension captures **what the cell currently measures**. It is the fabric analog of data flow patterns in code (inputs, mutations, outputs) — it records the cell's interface with its environment.

**Note:** The field strength vector at 6 zones provides rich information: it encodes neighbor presence, approximate distance, and relative orientation. Two adjacent cells can estimate their relative pose from field measurements alone (see Section 7).

#### κ (Kappa): Autonomy Level

```
K_f = {autonomous, directed, emergency, passive}
```

- **autonomous**: cell makes its own σ decisions based on local measurements
- **directed**: cell follows commands from a coordinator
- **emergency**: cell overrides all commands to protect structural integrity
- **passive**: cell accepts any command without validation

The κ dimension determines **how much agency the cell has**. It is the fabric analog of constraint severity (security constraints, performance requirements) — it limits what actions are permitted.

#### χ (Chi): Structural Role

```
X_f = {load-bearing, hinge, sensor, relay, reserve, anchor}
```

- **load-bearing**: cell is part of the primary structure, removal would cause collapse
- **hinge**: cell connects two rigid sub-structures at a flexible joint
- **sensor**: cell's primary value is its sensing capability, not structural
- **relay**: cell exists to transport other cells (transit corridor)
- **reserve**: cell is available for reassignment
- **anchor**: cell is bonded to an external surface (e.g., a ferromagnetic wall)

The χ dimension determines **the cell's role in the collective**. It is the fabric analog of contextual layer (route vs. controller vs. service) — it describes where the entity fits in the system architecture.

#### λ (Lambda): Force Ownership

```
Λ_f = {absorbing, transmitting, distributing, generating, idle}
```

- **absorbing**: cell is the terminal sink for mechanical force (dissipating energy)
- **transmitting**: cell passes force through to neighbors (rigid chain)
- **distributing**: cell splits incoming force among multiple neighbors
- **generating**: cell is the source of force (e.g., initiating a shape change)
- **idle**: no force flowing through this cell

The λ dimension tracks **force flow through the structure**. It is the fabric analog of module ownership / control flow — who "owns" the current computation.

**Critical dependency:** λ is determined by (σ, ε). A cell in RIGID mode with 4 neighbors distributes; a FLEX cell with 2 neighbors transmits. This is a fiber over the (σ, ε) base (see Section 4.3).

#### τ (Tau): Hardware Type

```
T_f = {bare, camera, imu, flex-joint, solar, comm, multi}
```

- **bare**: standard T-piece, magnets + microcontroller only
- **camera**: equipped with a micro camera (surface cell for external perception)
- **imu**: equipped with accelerometer + gyroscope (orientation sensing)
- **flex-joint**: enhanced compliant mechanism (greater flex range)
- **solar**: equipped with photovoltaic cell on a face
- **comm**: equipped with long-range radio (BLE/LoRa) for external communication
- **multi**: combination of the above

The τ dimension records **what hardware the cell carries**. It is the fabric analog of type annotations (TypeScript types, Rust lifetimes) — it constrains what operations are statically possible.

**Critical dependency:** τ constrains σ. A cell with τ = bare cannot enter σ = sense (no sensors to activate). A cell with τ = camera cannot enter σ = transit (too valuable to move). The valid σ modes are a function of τ.

#### ρ (Rho): Platform / Material

```
P_f = (processor, magnet_class, magnet_size, material)
```

- **processor** ∈ {esp32c3, rp2040, attiny85}: determines computational capability, power draw, and communication options
- **magnet_class** ∈ {N35, N42, N52}: determines bond strength and temperature tolerance
- **magnet_size**: determines force curves
- **material** ∈ {PETG, nylon, TPU}: determines mechanical properties

The ρ dimension records **the physical platform**. It is the fabric analog of runtime/framework requirements (React hooks → must be React, Prisma queries → must have Prisma) — it defines what execution environment the entity requires.

**Critical dependency:** ρ constrains τ. An ESP32-C3 can drive BLE communication; an ATtiny85 cannot. N52 magnets provide stronger bonds but have lower temperature tolerance.

#### Σ_composite: Semantic Hash

```
S_f = hash(σ, ε_summary, δ_summary, κ, χ, λ, τ, ρ)
```

A composite hash over the other 8 dimensions, used for quick equality checks and catalog lookup. Two cells with the same Σ are behaviorally identical (though their physical positions may differ).

### 4.3 Fiber Bundle Structure

**Definition 4.3 (Fiber Bundle).** The coordinate space 𝕁_fabric is not a simple product — it has the structure of a **fiber bundle** where some dimensions depend on others.

```
                    ┌─────────┐
                    │    ρ    │  Platform (constrains τ)
                    └────┬────┘
                         │ constrains
                    ┌────▼────┐
                    │    τ    │  Hardware (constrains σ)
                    └────┬────┘
                         │ constrains
              ┌──────────▼──────────┐
              │     σ       ε       │  Base space: mode × connectivity
              └──┬─────────────┬────┘
                 │ determines  │ determines
            ┌────▼────┐   ┌───▼────┐
            │    λ    │   │   χ    │  Derived dimensions
            └─────────┘   └────────┘
```

The dependency chain is:

```
ρ ──constrains──→ τ ──constrains──→ σ
                                    │
                              (σ, ε) ──determines──→ λ
                              (σ, ε) ──determines──→ χ (partially; χ also depends on global context)
```

**Theorem 4.1 (Identical Fiber Structure).** The dependency structure of 𝕁_fabric is isomorphic to the dependency structure of 𝕁_code (the code-domain JSTF-T):

| Dependency | Code domain | Fabric domain |
|------------|-------------|---------------|
| ρ constrains τ | Runtime constrains type annotations | Processor constrains hardware options |
| τ constrains σ | Types constrain function signature | Hardware constrains behavioral modes |
| (σ, ε) → λ | Signature + call graph → ownership | Mode + connectivity → force ownership |
| (σ, ε) → χ | Signature + graph → context/layer | Mode + connectivity → structural role |

*Proof.* Both dependency structures are instances of the abstract dependency DAG defined in Section 9. The fiber bundle structure arises from the same abstract property: **an entity's capabilities (τ, σ) are constrained by its platform (ρ), and its role in the collective (λ, χ) is determined by its capabilities and connections (σ, ε).** □

### 4.4 Valid Coordinate Subspace

Not all points in the full product space 𝕁_fabric are physically realizable.

**Definition 4.4 (Valid Coordinate).** A coordinate **j** = (σ, ε, δ, κ, χ, λ, τ, ρ, Σ) is valid if:

1. **Platform compatibility**: σ ∈ Σ_valid(τ, ρ) (the mode is supported by the hardware and processor)
2. **Connectivity consistency**: ε matches the actual bonds in E (no phantom neighbors)
3. **Sensor consistency**: δ values are within physical ranges given τ (no camera data without τ ∋ camera)
4. **Force consistency**: λ is consistent with (σ, ε) per the force flow rules
5. **Hash consistency**: Σ = hash(σ, ..., ρ)

**Definition 4.5 (Configuration).** A configuration of a fabric F is an assignment J: V → 𝕁_fabric such that J(v) is valid for all v ∈ V, and all ε dimensions are mutually consistent (if v lists u as a neighbor, then u lists v).

---

## 5. The Behavioral Catalog

### 5.1 Definition

**Definition 5.1 (Behavioral Catalog).** The behavioral catalog is a function:

```
C: 𝕁_fabric → Behavior
```

that maps each valid coordinate to a concrete behavioral specification: what the cell does on each tick, how it responds to sensor inputs, which σ transitions it will initiate or accept.

**Theorem 5.1 (Catalog Finiteness).** The behavioral catalog is finite:

```
|Im(C)| ≤ |Σ_f| × 2^(max_degree) × |K_f| × |X_f| × |Λ_f| × |T_f|
```

Since many combinations are physically invalid, the actual catalog size is much smaller:

```
|Im(C)| ≈ 200–800 (empirically estimated from constraint analysis)
```

*Proof sketch.* σ has 10 values, ε is summarized by degree (0–6) and zone pattern (bounded), κ has 4 values, χ has 6, λ has 5, τ has 7. The product is ~58,800, but validity constraints eliminate ≥97% of combinations. □

### 5.2 Catalog Structure

The catalog entries are organized by σ mode, since σ is the primary behavioral discriminant:

**Definition 5.2 (Catalog Entry).** Each entry specifies:

```
CatalogEntry = {
  coordinate:    𝕁_fabric,         -- the input coordinate
  preconditions: Set<Predicate>,   -- what must be true to enter this state
  tick_action:   Action,           -- what to do each cycle
  transitions:   Set<(Trigger, σ_new)>,  -- what triggers a mode change
  postconditions: Set<Predicate>,  -- what must be true after action
  power_tier:    {0, 1, 2, 3},    -- energy cost class
  verification:  Predicate,        -- runtime check that behavior is correct
}
```

### 5.3 Macro Behaviors

Individual cell behaviors compose into **macro behaviors** — collective actions that emerge from coordinated σ transitions across multiple cells.

**Definition 5.3 (Macro Behavior).** A macro behavior M is a sequence of configurations:

```
M = (J₀, J₁, ..., J_k)
```

where each J_{i+1} differs from J_i only in cells that undergo σ transitions, and each transition is valid.

Key macro behaviors:
- **Shape morphing**: a coordinated sequence of (release → transit → attract) transitions that moves cells from one arrangement to another
- **Impact response**: a wave of (rigid → flex → rigid) transitions spreading outward from an impact site
- **Magnetic peristalsis**: a sequence of (relay-recv → relay-pass) transitions along a path that moves a free cell
- **Harvesting organ deployment**: cells at the surface transition to (harvest + flex) to form energy-collecting structures

---

## 6. Dynamics

### 6.1 σ Transition Matrix

**Definition 6.1 (Transition Matrix).** The σ transition relation → is defined by the following adjacency matrix, where ✓ indicates a valid transition:

```
FROM →→→ TO:   rigid  flex  r-rcv  r-pas  attrct  relse  trnst  harvst  sense  idle
rigid           ·      ✓     ✓      ✓      ·       ✓      ·      ✓       ✓      ·
flex            ✓      ·     ✓      ✓      ·       ✓      ·      ·       ✓      ·
relay-recv      ✓      ✓     ·      ✓      ·       ·      ·      ·       ·      ·
relay-pass      ✓      ✓     ✓      ·      ·       ·      ·      ·       ·      ·
attract         ✓      ✓     ·      ·      ·       ·      ·      ·       ·      ·
release         ·      ·     ·      ·      ·       ·      ✓      ·       ·      ✓
transit         ·      ·     ·      ·      ✓       ·      ·      ·       ·      ✓
harvest         ✓      ·     ·      ·      ·       ✓      ·      ·       ·      ·
sense           ✓      ✓     ·      ·      ·       ✓      ·      ·       ·      ·
idle            ·      ·     ·      ·      ✓       ·      ✓      ·       ·      ·
```

**Invariant 6.1 (No Stranded Cells).** A cell in σ = transit (free, no bonds) must have a reachable path to σ ∈ {attract, idle}. The fabric must never leave a cell permanently in transit with no cell willing to accept it.

**Invariant 6.2 (Structural Safety).** A cell with χ = load-bearing cannot transition to σ = release unless all structures it supports have alternative load paths.

### 6.2 Magnetic Peristalsis

**Definition 6.2 (Peristalsis Path).** A peristalsis path is an ordered sequence of cells P = (c₁, c₂, ..., c_k) in the ε-graph such that:

1. c₁ holds the cell to be transported (via ST_TIP bond)
2. Each c_i can enter σ = relay-recv or relay-pass
3. c_k is the destination (enters σ = attract)

The transport proceeds by a **traveling wave** of σ transitions:

```
Time 0:  c₁ = relay-pass,  c₂ = relay-recv,  c₃...c_k = rigid
Time 1:  c₁ = rigid,       c₂ = relay-pass,  c₃ = relay-recv,  c₄...c_k = rigid
Time 2:  c₁ = rigid,       c₂ = rigid,       c₃ = relay-pass,  c₄ = relay-recv, ...
...
Time k-1: c₁...c_{k-2} = rigid,  c_{k-1} = relay-pass,  c_k = attract
```

**Theorem 6.1 (Peristalsis Throughput).** The transport rate is:

```
Θ = 1 / τ_hop   cells per second
```

where τ_hop is the time for one relay handoff. For SMA-based switching:

```
τ_hop ≈ 12 ms    →    Θ ≈ 80 cells/second
```

For electromagnetic switching:

```
τ_hop ≈ 2 ms     →    Θ ≈ 500 cells/second
```

**Theorem 6.2 (Reachability).** Let F be a fabric whose ε-graph G_ε is connected. For any two cells v_source, v_target ∈ V, if there exists a path P = (v_source, ..., v_target) in G_ε such that all intermediate cells can enter relay mode (their τ and κ permit it), then the cell at v_source can be transported to v_target.

*Proof.* The peristalsis wave (Definition 6.2) provides a constructive transport protocol. Existence of the path guarantees a sequence of valid σ transitions. The intermediate cells temporarily enter relay modes, then return to their prior modes after the transported cell passes. □

**Corollary 6.1 (Transport Time).** The transport time is O(d(v_source, v_target) · τ_hop), where d is the graph distance in G_ε.

### 6.3 Impact Propagation

**Definition 6.3 (Impact Event).** An impact event is a triple (v_impact, F_impact, t_impact) where v_impact is the cell struck, F_impact is the applied force (N), and t_impact is the time of impact.

**Theorem 6.3 (Wave Propagation).** An impact at cell v propagates through the ε-graph as a mechanical wave with velocity:

```
v_wave = √(k_bond / m_cell) · L_cell
```

where k_bond is the bond spring constant, m_cell is the cell mass, and L_cell is the characteristic cell spacing.

For 25mm cells with 5mm N42 magnets: v_wave ≈ 34 m/s.

**Theorem 6.4 (Attenuation).** The force experienced by a cell at graph distance h from the impact site is:

```
F(h) = F_impact · α^h
```

where α ∈ (0, 1) is the per-hop attenuation factor. For magnetic bonds: α ≈ 0.7.

*Proof sketch.* Each bond acts as a spring-damper system. The transfer function from input force to output force has magnitude |H(ω)| < 1 for the relevant frequency range, giving geometric attenuation with hop count. □

**Theorem 6.5 (Blast Radius).** The set of cells significantly affected by an impact at v is bounded:

```
|Affected(v, F_impact)| ≤ |B_h*(v)|
```

where B_h*(v) is the h*-hop ball around v in G_ε, and h* = ⌈log(F_impact / F_threshold) / log(1/α)⌉.

For F_impact = 10N and F_threshold = 0.1N: h* ≈ 13 hops. This is the **fabric analog of Theorem 9.4 in the code domain** (which states: *incremental re-analysis after a local code edit has cost O(|affected(e)| × h), where affected(e) is the set of entities reachable within h hops of the edit site*) — local changes have bounded propagation in both domains.

### 6.4 Impact Response Protocol

The fabric actively responds to impact through a **graduated stiffness profile**:

```
Phase 1 (0–1ms):    Cells at h ≤ 2 → σ = flex     (absorb initial shock)
Phase 2 (1–5ms):    Cells at 2 < h ≤ 5 → σ = rigid (contain spread)
Phase 3 (5–50ms):   Cells at h ≤ 2 with strain < threshold → σ = rigid  (re-stiffen)
Phase 4 (ongoing):  Cells at h ≤ 2 with strain ≥ threshold → remain flex (crumple zone)
```

This implements a **programmable crumple zone**: the fabric is rigid everywhere except where it needs to absorb energy, and the crumple zone location and size are determined dynamically based on the impact location and force.

**Theorem 6.6 (Energy Absorption).** The total energy absorbed by a fabric patch of radius R cells is:

```
E_total = E_elastic + E_breaking + E_harvest + E_kinetic
```

where:
- E_elastic = Σ_{h=0}^{R} n(h) · ½k · x(h)²  (spring compression at each hop)
- E_breaking ≈ n_broken · E_bond  (bonds that exceed their strength)
- E_harvest = Σ_{h=0}^{R} n(h) · P_harvest · Δt  (Faraday harvesting)
- E_kinetic = Σ_{h=0}^{R} n(h) · ½m · v(h)²  (cell displacement)

For a 20-cell radius patch with a 10N impact: E_total ≈ 515 mJ.

---

## 7. Self-Awareness in 3D Space

### 7.1 Three Layers of Awareness

The fabric achieves spatial self-awareness through three complementary mechanisms, each providing different information at different costs:

**Layer 1: Topological Awareness (every cell, always on)**

Every cell knows its ε-neighborhood: who is connected through which zones with what strength. This requires no sensors beyond the magnetic field measurements already present at each connection zone.

From topology alone, a cell knows:
- Its degree (number of neighbors)
- Which zones are occupied
- Whether it is on the boundary (has unconnected zones) or interior
- Its polygon membership (cycle detection in EP bonds)

**Layer 2: Geometric Reconstruction (every cell, computed from topology + geometry)**

Given the T-piece geometry (known, parameterized by **p**) and the bond topology (known from ε), the relative position and orientation of any two connected cells can be computed:

**Definition 7.1 (Relative Pose).** For two bonded cells (v₁, v₂, z₁, z₂, s), the relative pose is:

```
T_{v₁→v₂} = Φ(v₂)⁻¹ · Φ(v₁) ∈ SE(3)
```

This can be computed from the connection zone geometry alone: if z₁ = EP_R and z₂ = EP_L, the relative pose is determined by the crossbar endpoint positions and the required alignment for bonding.

**Theorem 7.1 (Local Shape Reconstruction).** For any connected subgraph S ⊂ G_ε, the physical embedding Φ restricted to S can be reconstructed (up to a global rigid transformation) from:
1. The ε-graph topology of S
2. The connection zone labels of each bond
3. The T-piece geometry parameters **p**

*Proof.* Fix one cell v₀ as the origin: Φ(v₀) = (0, I). For any cell v connected to v₀ via bond (v₀, v, z₀, z_v, s), the relative pose T_{v₀→v} is determined by (z₀, z_v, **p**). By induction along any spanning tree of S, every cell's pose can be computed. The result is unique up to the choice of origin and orientation (a global rigid transformation). □

**Corollary 7.1.** Any connected fabric can compute its own 3D shape without any absolute position sensors, using only its topology and the known cell geometry.

**Note:** This reconstruction assumes rigid bonds. In practice, bonds have some compliance, introducing error (see Theorem 7.2).

**Layer 3: Absolute Localization (sensor cells only, sparse)**

A subset of cells V_sensor ⊂ V have hardware that provides absolute spatial information:

- **τ = imu**: Accelerometer + gyroscope → gravity direction (absolute "up") and angular velocity
- **τ = camera**: Micro camera → visual features, object recognition, optical flow

**Definition 7.2 (Sensor Density).** The sensor density of a fabric is:

```
ρ_sensor = |V_sensor| / |V|
```

The minimum useful sensor density depends on the required accuracy and the topology diameter.

### 7.2 Reconstruction Accuracy

**Theorem 7.2 (Reconstruction Error Bound).** Let v be a cell at graph distance h from the nearest sensor cell v_s ∈ V_sensor. The position error in the reconstructed pose Φ̂(v) satisfies:

```
‖Φ̂(v) - Φ(v)‖ ≤ h · ε_local · L_cell + O(h² · ε_local²)
```

where ε_local is the per-bond angular error (radians) due to bond compliance, and L_cell is the characteristic cell spacing.

*Proof sketch.* The reconstruction chains relative transforms from v_s to v along a shortest path of length h. Each transform introduces angular error ε_local, which at distance L_cell produces positional error ε_local · L_cell. Errors accumulate approximately linearly for small ε_local (the quadratic term accounts for error compounding). □

**Corollary 7.2 (Sensor Density Requirement).** To maintain position accuracy better than δ_max across the fabric, the sensor cells must be spaced no more than h_max hops apart, where:

```
h_max = δ_max / (ε_local · L_cell)
```

For δ_max = 5mm, ε_local = 0.01 rad, L_cell = 25mm: h_max = 20 hops. With hexagonal tiling, this means ~1 sensor cell per ~1,200 cells (sensor density < 0.1%).

### 7.3 External Perception

Cells with τ = camera provide **external awareness** — perception of the environment beyond the fabric itself.

**Definition 7.3 (Visual Field).** The visual field of a camera cell v is a cone in the direction of the camera's normal vector (typically the face normal of the zone carrying the camera), with opening angle determined by the camera optics.

**Theorem 7.3 (Coverage).** For a convex fabric surface with camera cells placed at density ρ_camera, the fraction of the external sphere covered is:

```
f_coverage ≈ min(1, ρ_camera · Ω_camera / (4π))
```

where Ω_camera is the solid angle of each camera's field of view.

This gives the fabric **omnidirectional vision** when sufficient camera cells are distributed across its surface — it can see in every direction simultaneously, with resolution determined by camera density.

### 7.4 Information Flow

Sensor data flows through the ε-graph from sensor cells to all other cells (and to any coordinator):

**Definition 7.4 (Information Propagation Speed).** The maximum information propagation speed through the fabric is:

```
v_info = L_cell / τ_comm
```

where τ_comm is the per-hop communication latency. For inductive coupling at 1 kbps with 6-byte packets: τ_comm ≈ 50ms, giving v_info ≈ 0.5 m/s for 25mm cells.

**Theorem 7.4 (Awareness Latency).** The time for a sensor measurement at cell v_s to reach a cell at graph distance h is:

```
t_awareness = h · τ_comm
```

For a fabric with diameter D_graph hops: t_awareness_max = D_graph · τ_comm. A 100-cell diameter fabric at 50ms/hop has maximum awareness latency of 5 seconds.

**Implication:** The fabric has **finite awareness speed**. Its self-model is always slightly stale, with staleness proportional to graph distance from the nearest sensor. Fast-moving events (impacts) propagate mechanically faster than informationally — the fabric physically responds to impacts before it "knows" about them in the information-processing sense.

---

## 8. Energy Framework

### 8.1 Power Tiers as Complexity Classes

Each σ mode belongs to a power tier, and each tier has a characteristic power draw:

| Tier | Modes | Power draw | Self-sustaining? |
|------|-------|------------|------------------|
| 0 (sleep) | idle | ~5 μW | Always (leakage only) |
| 1 (standby) | rigid, flex, harvest | ~40 μW | Yes, outdoors (solar) |
| 2 (active) | relay-*, attract, release, sense | ~25 mW | No (stored energy) |
| 3 (high) | transit (neighbors), rapid reconfig | ~80 mW | No (burst from supercap) |

**Analogy to computational complexity classes:** Power tiers in the fabric are analogous to computational complexity classes in the code domain. Tier 0 is "free" (like O(1) computation), Tier 1 is sustainable (like polynomial time), Tier 2 requires resources (like NP problems requiring witnesses), and Tier 3 is burst-limited (like PSPACE problems requiring exponential resources for bounded time).

### 8.2 Energy Harvesting

**Definition 8.1 (Harvesting Model).** The total harvestable power for a cell is:

```
P_total = P_solar + P_vibration + P_impact
```

where:
- P_solar = A_exposed · G_irradiance · η_solar  (photovoltaic, continuous)
- P_vibration = (D_mag/5)·(L_cb/25)·10⁻³ mW  (ambient vibration, continuous, tiny)
- P_impact = (B_r · N · A_coil · ω)² / (2R)  (Faraday, during impact events only)

**Theorem 8.1 (Energy Balance).** A cell at power tier T is self-sustaining if and only if:

```
P_total ≥ P_tier(T)
```

For typical configurations (25mm cell, N42 magnets, outdoor sunny):
- Tier 0-1: self-sustaining (P_solar ≈ 2 mW >> P_tier1 ≈ 40 μW)
- Tier 2-3: requires stored energy (P_tier2 ≈ 25 mW >> P_solar ≈ 2 mW)

### 8.3 Stored Energy and Operational Budgets

**Definition 8.2 (Supercapacitor Budget).** Each cell carries a supercapacitor of capacitance C_cap, storing energy:

```
E_stored = ½ · C_cap · V²
```

The operational duration at tier T is:

```
t_operation(T) = E_stored / P_tier(T)
```

For C_cap = 100 mF, V = 3.3V: E_stored ≈ 545 mJ, giving:
- Tier 2 endurance: ~22 seconds
- Tier 3 endurance: ~5 seconds

**Theorem 8.2 (Recharge Time).** The time to recharge from Tier 1 surplus is:

```
t_recharge = E_stored / (P_total - P_tier1)
```

For solar-powered recharge outdoors: t_recharge ≈ 280 seconds (~4.7 minutes).

**Implication:** The fabric can perform active operations (cell transport, shape change, sensing) in **bursts** lasting seconds, with **recovery periods** lasting minutes. This duty cycle is sufficient for most use cases (impact response, slow shape morphing, periodic environmental sensing) but constrains rapid continuous reconfiguration.

---

## 9. The Universality Result

### 9.1 Abstract Seshat Systems

We now formalize the claim that the 9D coordinate framework is not specific to either source code or programmable matter, but describes a universal structure shared by all systems of interacting entities with heterogeneous state.

**Definition 9.1 (Abstract Seshat System).** An Abstract Seshat System is a tuple:

```
S = (V, G, D, C, T, F)
```

where:

1. **V** is a finite set of **entities**.
2. **G** = (V, E) is a graph (directed or undirected) over V, called the **interaction graph**.
3. **D** = D₁ × D₂ × ... × D_n is a **product state space** of n ≥ 2 orthogonal dimensions, where each D_i is a finite or compact set.
4. **C**: D → Behavior is a **behavioral catalog** mapping coordinates to behaviors, with |Im(C)| finite.
5. **T** ⊂ D₁ × D₁ is a **transition relation** on the primary dimension (σ-equivalent).
6. **F**: {D₁ × D₂ × ... × D_n} → PowerSet(constraints) is a **fiber structure** defining dependency relations among dimensions: some dimensions constrain or determine others.

Subject to the following axioms:

**Axiom A1 (Finite Catalog).** The behavioral catalog C has finite image:
```
|Im(C)| < ∞
```
Entities with the same coordinate behave identically.

**Axiom A2 (Local Propagation).** There exists a constant h ∈ ℕ such that: if the coordinate of entity v changes at time t, then only entities u with d_G(v, u) ≤ h can be affected by time t + τ, where τ is the minimum propagation delay.

**Axiom A3 (Compositionality).** If the interaction graph G has connected components G₁, G₂ with V₁ ∩ V₂ = ∅ and E(V₁, V₂) = ∅, then the behavior of entities in V₁ is independent of the coordinates of entities in V₂.

**Axiom A4 (Incremental Re-analysis).** When a single entity v changes its coordinate, the cost of updating all affected entities' derived dimensions is:
```
Cost(update) = O(|B_h(v)| · h)
```
where B_h(v) is the h-hop neighborhood of v. Crucially, this is O(1) in |V| — it does not depend on the total system size.

**Axiom A5 (Fiber Structure).** The dimension space D has a partial order ≤_dep among dimensions:
```
D_i ≤_dep D_j  iff  the valid values of D_j depend on the value of D_i
```
This partial order is a DAG (no circular dependencies).

**Axiom A6 (Dimensional Orthogonality).** Subject to the fiber constraints (A5), dimensions are orthogonal: changing D_i while holding all other independent dimensions fixed produces a valid coordinate, and the behavioral change is attributable to D_i alone.

### 9.2 The 9-Dimensional Instantiation

**Claim 9.1.** For both the code domain and the fabric domain, n = 9 dimensions suffice, with the following universal roles:

| # | Symbol | Universal role | Description |
|---|--------|----------------|-------------|
| 1 | σ | **Identity** | What kind of entity is this? What is its behavioral type? |
| 2 | ε | **Connectivity** | Who does this entity interact with? |
| 3 | δ | **State** | What data does this entity hold or sense? |
| 4 | κ | **Constraints** | What limits this entity's actions? |
| 5 | χ | **Context** | What is this entity's role in the larger system? |
| 6 | λ | **Ownership** | Who controls the flow passing through this entity? |
| 7 | τ | **Capability** | What can this entity do (structurally/statically)? |
| 8 | ρ | **Platform** | What substrate does this entity run on? |
| 9 | Σ | **Composite** | What is this entity's overall fingerprint? |

**Conjecture 9.1 (Sufficiency).** These 9 dimensions are **sufficient** to describe the state of any entity in any system that satisfies Axioms A1–A6. That is, any additional dimension D₁₀ that one might propose is either:
- Redundant (expressible as a function of the existing 9), or
- A refinement of an existing dimension (a sub-dimension of one of the 9)

We do not claim these 9 are **minimal** (some systems may not need all 9), but we conjecture they are sufficient for any system of interacting entities with heterogeneous state.

### 9.3 Code-Seshat as a Model

**Proposition 9.1.** The JSTF-T framework for source code analysis constitutes a model of an Abstract Seshat System:

| Component | Code-Seshat instantiation |
|-----------|--------------------------|
| V | Functions, classes, modules, hooks (code entities) |
| G | Call graph + import graph + data flow graph |
| D | σ = signature structure, ε = call adjacency, δ = data flow, κ = constraints, χ = layer/exposure, λ = module ownership, τ = type annotations, ρ = runtime/framework, Σ = semantic hash |
| C | ~2,500 behavioral patterns (code patterns catalog) |
| T | Refactoring operations that change σ (e.g., sync → async) |
| F | ρ constrains τ (React → hooks), τ constrains σ (types restrict signatures), (σ,ε) → λ, (σ,ε) → χ |

**Verification of axioms:**
- **A1**: The code pattern catalog is finite (empirically ~2,500 entries). ✓
- **A2**: Changing one function affects callers/callees within h hops (Theorem 9.4 of *Mathematical Formalization of Seshat*: local edit → bounded blast radius). ✓
- **A3**: Independent modules don't interact. ✓
- **A4**: Incremental re-analysis cost is O(|affected| × h), not O(|codebase|). ✓
- **A5**: ρ ≤_dep τ ≤_dep σ, (σ,ε) ≤_dep λ, (σ,ε) ≤_dep χ. ✓
- **A6**: Changing σ (e.g., making a function async) while holding ε fixed produces a valid coordinate with attributable behavioral change. ✓

### 9.4 Fabric-Seshat as a Model

**Proposition 9.2.** The Seshat Fabric framework constitutes a model of an Abstract Seshat System:

| Component | Fabric-Seshat instantiation |
|-----------|----------------------------|
| V | T-piece cells with UUIDs |
| G | ε-graph (physical bonds) |
| D | σ = behavioral mode, ε = physical adjacency, δ = sensor state, κ = autonomy, χ = structural role, λ = force ownership, τ = hardware type, ρ = processor/material, Σ = composite hash |
| C | ~200–800 behavioral catalog entries |
| T | σ transition matrix (Section 6.1) |
| F | ρ constrains τ (ESP32 → BLE capable), τ constrains σ (no camera → no sense mode), (σ,ε) → λ, (σ,ε) → χ |

**Verification of axioms:**
- **A1**: The behavioral catalog is finite (~200–800 entries, Theorem 5.1). ✓
- **A2**: Impact propagation attenuates geometrically (Theorem 6.4), σ transitions propagate through ε-neighbors only. ✓
- **A3**: Disconnected fabric components are physically independent. ✓
- **A4**: Changing one cell's σ requires updating only its ε-neighborhood. ✓
- **A5**: ρ ≤_dep τ ≤_dep σ, (σ,ε) ≤_dep λ, (σ,ε) ≤_dep χ. ✓
- **A6**: Changing σ (e.g., rigid → flex) while holding ε fixed produces a valid coordinate with attributable behavioral change. ✓

### 9.5 The Structural Correspondence

**Theorem 9.1 (Universality).** Code-Seshat and Fabric-Seshat are both models of the Abstract Seshat System axioms A1–A6, with isomorphic fiber structures.

*Proof.* Propositions 9.1 and 9.2 verify all axioms for both models. The fiber structure isomorphism follows from the identical dependency DAG:

```
ρ → τ → σ ←── (σ,ε) → λ
                       → χ
```

This DAG is the same in both models (Theorem 4.1). □

**Corollary 9.1 (Theorem Transfer).** Any theorem proved from Axioms A1–A6 alone (without reference to domain-specific details) applies to **both** models. In particular:

1. **Blast radius theorem** (from A2): Local changes have bounded propagation in both code and fabric.
2. **Incremental re-analysis** (from A4): Re-analyzing after a local change is O(1) in system size, in both domains.
3. **Compositional independence** (from A3): Disjoint subsystems can be analyzed independently.
4. **Catalog-based reasoning** (from A1): The behavior of any entity is determined by its coordinate, regardless of system size.

### 9.6 What the Universality Does NOT Claim

To be precise about the boundaries of this result:

1. **Not claiming the value domains are the same.** Code σ = "async exported function" is very different from fabric σ = "rigid mode." The universality is at the level of **roles**, not values.

2. **Not claiming 9 is the unique correct number.** Some systems might need only 7 dimensions (e.g., simple cellular automata without hardware heterogeneity). Others might need refinements. The claim is that these 9 are sufficient for both known domains.

3. **Not claiming all structured systems are Seshat systems.** Systems without finite behavioral catalogs (e.g., continuous dynamical systems with infinite attractors) or without local propagation (e.g., systems with global coupling) may not satisfy the axioms.

4. **Not claiming the two domains are "the same."** Code is abstract, discrete, and deterministic. Fabric is physical, continuous, and probabilistic. They share structural properties, not ontological identity.

---

## 10. Implications, Predictions, and Open Questions

### 10.1 Physical Predictions

The framework makes testable predictions about fabric behavior:

**Prediction 10.1 (Minimum Sensor Density).** A fabric of N cells requires at most N / h_max² sensor cells for full 3D shape reconstruction at accuracy δ_max, where h_max is given by Theorem 7.2. For 25mm cells at 5mm accuracy: ~0.08% sensor density.

**Prediction 10.2 (Impact Response Time).** The fabric's mechanical response to impact is faster than its informational response. The mechanical wave reaches all cells within radius R in time R · L_cell / v_wave, while the informational awareness takes R · τ_comm. For 25mm cells: mechanical ≈ 0.7ms/hop vs. informational ≈ 50ms/hop. The fabric is a factor of ~70× faster at physically responding than at "knowing" what happened.

**Prediction 10.3 (Reconfiguration Duty Cycle).** A solar-powered fabric outdoors can perform active reconfiguration (Tier 2+) for approximately 22 seconds, then must recharge for approximately 280 seconds. This yields a duty cycle of ~7% for active operations.

**Prediction 10.4 (3D Structure Rigidity).** A 3D fabric structure using all three face connection types (F_TOP, F_LEFT, F_RIGHT) has at most 6 bonds per cell. By the Maxwell counting criterion for structural rigidity in 3D (6 constraints per node needed for rigidity), a fully-bonded fabric is exactly at the rigidity threshold. Internal cells with degree 6 are rigid; boundary cells with lower degree require additional support.

**Prediction 10.5 (Dynamic Load Exceeds Static Capacity).** A 5-layer fabric surface at 12mm cells will support a 104 kg moving load (running operator) at speeds up to 5 m/s with a safety factor >2×, while the same surface fails under static loading of equivalent mass. This follows from the Persistence Axiom (see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md), Theorem 1.2): each cell bears the load for only ~4ms per footfall contact, and the support surface pre-positions ahead of the load using muscle prediction with ~80ms lead time. The structure need never exist as a complete static bridge.

### 10.2 Capability Bounds

**Bound 10.1 (Maximum Structure Size).** With 16-bit addressing: |V| ≤ 65,536 cells. For 25mm cells, this allows structures up to ~6.4m × 6.4m as a single flat sheet, or ~40cm × 40cm × 40cm as a solid cube.

**Bound 10.2 (Communication Diameter).** For a fabric to maintain awareness latency below T_max: the ε-graph diameter must satisfy D ≤ T_max / τ_comm. At τ_comm = 50ms and T_max = 5s: D ≤ 100 hops.

**Bound 10.3 (Transport Speed).** Maximum sustained cell transport speed: v_transport = L_cell / τ_hop. For electromagnetic switching: ~12.5 m/s. For SMA: ~2.1 m/s.

**Bound 10.4 (Coilgun Acceleration).** A pre-configured runway of n cells, each contributing energy E_cell to a projectile of mass m, achieves exit velocity v = √(2nE_cell / m). A 20-cell runway at 25mm scale launches a 0.1g pellet at ~40 m/s; a 50-cell runway reaches ~65 m/s. Pre-configuration eliminates the sense-decide-act bottleneck — each cell fires on a timer set before launch.

**Bound 10.5 (Ballistic Self-Deployment).** A fabric can intentionally sever a subgraph of cells, accelerate the packet along an internal runway (Bound 10.4), and eject it ballistically. The packet carries its own ε-graph topology and reassembles at the landing site via the standard connection protocol (Section 2.3). This constitutes *fabric mitosis* — reproduction by fission.

> **Note.** These bounds are the tip of the iceberg. The cell primitives (coils, magnets, Hall sensors, MCUs, compliant stems) collectively yield **11 emergent capabilities** requiring zero additional hardware — including phased-array radio, echolocation, programmable metamaterial properties, distributed computing, and more. The full catalog with scaling analysis is in the companion document [**Emergent Capabilities**](./EMERGENT-CAPABILITIES.md).

### 10.3 Open Questions

**Q1 (Optimal Tiling).** For a given application (e.g., impact absorption, locomotion, shape change), which polygon tiling minimizes the number of cells while maintaining structural integrity? The hexagonal tiling minimizes cell count for area coverage, but the triangular tiling provides maximum rigidity.

**Q2 (Distributed vs. Centralized Control).** The framework supports both κ = autonomous (each cell decides) and κ = directed (coordinator decides). What is the optimal κ distribution for various tasks? Impact response may favor autonomous (faster), while shape morphing may favor directed (coordinated).

**Q3 (Catalog Completeness).** Is the behavioral catalog (Section 5) complete — does it cover all useful behaviors? Or will new macro behaviors emerge that require new catalog entries?

**Q4 (Formal Verification of Safety Invariants).** Can the structural safety invariants (Invariant 6.1, 6.2) be formally verified for all reachable configurations? This is equivalent to model-checking the σ transition system — tractable for small fabrics, but potentially intractable for large ones.

**Q5 (Universality: Other Domains).** Do other structured systems (e.g., biological cell networks, electronic circuit layouts, organizational hierarchies, swarm robotics) also satisfy the Abstract Seshat System axioms? If so, the 9D framework may extend beyond code and matter.

**Q6 (Minimum Dimensionality).** Are all 9 dimensions truly independent, or can some be derived from others? In particular, is Σ (composite hash) a true dimension or merely a derived quantity? If we treat Σ as derived, is 8 sufficient?

**Q7 (Operator-Fabric Coupling).** The Dynamic Cognition framework (see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md)) proposes that a body-worn lattice of ~12,000 cells can detect operator muscle activation ~80ms before limb movement via aggregate magnetomyography. Can consumer-grade Hall sensors (SS49E, DRV5053) achieve the required ~10-100 pT sensitivity through statistical aggregation across 1,000+ sensors? If so, the prediction window enables pre-positioning of support surfaces for dynamic load bearing — transforming the fabric from a static structure that cannot carry body weight into a dynamic flow that can.

**Q8 (Flows vs. Configurations).** This document analyzes the fabric's properties at fixed configurations. The Dynamic Cognition framework shows that capabilities emerge from continuous *flows between* configurations (dismantling coilgun, traveling stiffness wave, running-on-wing flight). How should the Behavioral Catalog (Section 5) be extended to describe macro-behaviors as flows rather than sequences of discrete configurations?

---

## Appendix A: Notation Reference

| Symbol | Meaning |
|--------|---------|
| V | Set of cells (entities) |
| E | Set of bonds (edges) |
| G_ε | The epsilon graph (connectivity graph) |
| 𝕁 | The 9D coordinate space |
| J(v) | The coordinate of cell v |
| Φ(v) | The physical pose (position + orientation) of cell v |
| Z | Connection zone set {EP_L, EP_R, ST_TIP, F_TOP, F_LEFT, F_RIGHT} |
| σ, ε, δ, κ, χ, λ, τ, ρ, Σ | The 9 dimensions |
| B_h(v) | The h-hop ball around v in G_ε |
| d_G(u,v) | Graph distance between u and v |
| SE(3) | The group of rigid-body transformations in 3D |
| SO(3) | The group of 3D rotations |
| μ₀ | Permeability of free space (4π × 10⁻⁷ T·m/A) |
| B_r | Magnetic remanence (T) |
| k | Bond spring constant (N/m) |
| α | Per-hop force attenuation factor |
| τ_hop | Time for one peristalsis handoff |
| τ_comm | Per-hop communication latency |

## Appendix B: Parameter Presets

| Parameter | Proof (50mm) | Tabletop (25mm) | Wearable (12mm) |
|-----------|-------------|-----------------|-----------------|
| L_cb | 50 mm | 25 mm | 12 mm |
| W_cb = H_cb | 5 mm | 3 mm | 2 mm |
| L_st_min | 10 mm | 5 mm | 3 mm |
| L_st_max | 44 mm | 22 mm | 11 mm |
| D_mag | 5 mm | 3 mm | 2 mm |
| Bond force (contact) | ~4 N | ~0.5 N | ~0.1 N |
| Cell mass | ~2 g | ~0.4 g | ~0.08 g |
| Wave speed | ~45 m/s | ~34 m/s | ~25 m/s |
| Solar power (outdoor) | ~8 mW | ~2 mW | ~0.5 mW |

## Appendix C: Comparison to Related Formal Frameworks

| Framework | Seshat | Cellular Automata | Graph Grammars | Sheaf Theory |
|-----------|--------|-------------------|----------------|--------------|
| Entity state | 9D coordinate | Single value from finite set | Node label | Stalk of sheaf |
| Connectivity | ε-graph (dynamic, bounded degree) | Fixed lattice | Graph structure (rewriting) | Open sets |
| Dynamics | Catalog lookup + transitions | Transition function | Rule application | Restriction maps |
| Locality | Axiom A2 (bounded propagation) | Local transition rule | Local rule application | Sheaf condition (local-to-global) |
| Heterogeneity | Full (9 independent dimensions) | None (homogeneous) | Node/edge labels | Heterogeneous stalks |
| Physical grounding | Electromagnetic forces | Abstract | Abstract | Abstract |

The key differentiator of Seshat systems is the combination of **dimensional heterogeneity** (9 orthogonal concerns per entity) with **physical grounding** (electromagnetic forces, real energy budgets) and **practical finiteness** (the catalog is small enough to enumerate and reason about).

---

*This document is a living specification. As the physical prototype is built and tested, the predictions in Section 10 will be refined or corrected. The mathematical framework is designed to be robust to such refinements — the axiom system (Section 9) does not depend on specific parameter values.*

*See also:*
- *[DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md) — Companion document: the Persistence Axiom, Cerebellar Model, Kinesthetic Interface, and operator-fabric coupling theory*
- *[EMERGENT-CAPABILITIES.md](./EMERGENT-CAPABILITIES.md) — 11+ zero-additional-hardware capabilities with scaling analysis from 100 to 65K cells*
- *[BUILD-ROADMAP.md](./BUILD-ROADMAP.md) — Practical build sequence from first cell to deployable platform*
- *[T-PIECE-SPEC.md](./fabrication/T-PIECE-SPEC.md) — Cell geometry, connection zones, electrical contact architecture*
- *[MAGNETIC-MODEL.md](./physics/MAGNETIC-MODEL.md) — Force calculations, EPM specifications, switching physics*
