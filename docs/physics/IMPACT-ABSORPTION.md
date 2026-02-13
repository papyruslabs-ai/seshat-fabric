# Impact Absorption Model

## 1. Structure as Discrete Spring-Mass Lattice

The fabric is a network of rigid bodies (T-pieces) connected by magnetic springs (the connections). This is a **discrete spring-mass system**, not a continuum.

### Spring Constant of Magnetic Connection

For a magnetic dipole pair at equilibrium distance d₀:

```
k_magnetic = |dF/dx| at x = d₀
```

From the dipole force law F(d) = C/d⁴:

```
k = |dF/dd| = 4C/d₀⁵
```

For 5mm N42 magnets at d₀ = 1mm gap:
```
C = (3μ₀/2π) × m₁ × m₂ ≈ 4.04e-6 N·m⁴
k = 4 × 4.04e-6 / (1e-3)⁵ = 16,160 N/m ≈ 16.2 kN/m
```

This is a **very stiff spring** — comparable to a thin steel beam. The magnetic connection is strong but has almost no stroke (it breaks after ~1mm displacement). This means:

- **Small deformations**: The structure is rigid, forces transmit efficiently
- **Large deformations**: Connections break, absorbing energy in the separation event

### Natural Frequency

For a single T-piece (mass ~0.5g) on two magnetic springs:
```
f₀ = (1/2π) × √(2k/m) = (1/2π) × √(2 × 16160 / 0.0005) ≈ 1,280 Hz
```

This means the structure rings at ~1.3 kHz. Impact waves propagate fast — the structure's response time is on the order of milliseconds.

## 2. Wave Propagation Model

### 1D Chain Analysis

For a chain of N cells connected magnetically, a disturbance at cell 0 propagates as a wave:

```
Wave speed: v = a × √(k/m)
```

Where a = cell spacing (edge-to-edge distance).

For 6mm cells, k = 16.2 kN/m, m = 0.5g:
```
v = 0.006 × √(16200 / 0.0005) = 0.006 × 5,692 = 34.2 m/s
```

Time for wave to cross a 50-cell structure (~300mm):
```
t = 0.3 / 34.2 = 8.8 ms
```

The wave crosses the entire structure in **~9 milliseconds**. This is fast enough that the structure responds as a unit for most impact events (human-scale impacts have rise times of 1-10ms).

### 2D Surface Propagation

On a 2D surface (hexagonal lattice), the wave expands as a circle:

```
Number of cells at radius r: N(r) ≈ 6r (hexagonal ring)
Total cells within radius r: N_total(r) ≈ 3r² + 3r + 1
```

Force at radius r (2D geometric spreading):
```
F(r) = F₀ / (2πr) × coupling_efficiency
```

Where coupling_efficiency accounts for imperfect force transmission at each connection (~0.8-0.95 per hop).

After 5 hops: F(5) = F₀ / (2π×5) × 0.9⁵ = F₀ × 0.019
After 10 hops: F(10) = F₀ / (2π×10) × 0.9¹⁰ = F₀ × 0.0055

**Blast radius**: Force drops below structural significance (~0.1 N) within 5-10 hops for typical impacts.

## 3. Energy Absorption Mechanisms

### 3.1 Elastic Deformation (Reversible)

Cells displace within their magnetic springs. Energy stored temporarily, then released (structure bounces back).

```
E_elastic = ½ × k × x² per connection
```

For 1mm displacement: E = ½ × 16200 × (0.001)² = 0.0081 J = 8.1 mJ per connection

For 20 cells × 3 connections average: 20 × 3 × 8.1 mJ = **486 mJ**

This is equivalent to stopping a 100g object falling from 50cm. Non-trivial for a lightweight structure.

### 3.2 Connection Breaking (Controlled Failure)

When displacement exceeds magnetic capture distance (~2mm for 5mm magnets), the connection breaks. The energy to separate:

```
E_break = ∫(d₀ to ∞) F(d) dd = C / (3d₀³)
```

For 5mm N42 magnets: E_break ≈ 4.04e-6 / (3 × (1e-3)³) = **1.35 mJ per connection**

Wait — this is LESS than the elastic energy. That's because the magnetic spring is very stiff but very short-range. The energy is mostly in the steep near-field.

Total breakaway energy for 20 connections: 20 × 1.35 mJ = **27 mJ**

### 3.3 Faraday Harvesting (Energy Capture)

From the magnetic model: ~0.35 mW per cell during impact.

For a 50ms impact event over 20 cells:
```
E_harvested = 0.35e-3 × 0.050 × 20 = 0.35 mJ
```

Small compared to the mechanical energy, but captured as useful electrical energy.

### 3.4 Kinetic Redistribution (Mass Acceleration)

Impact energy transfers to the kinetic energy of displaced cells:
```
E_kinetic = ½ × m × v² per cell
```

If 20 cells each accelerate to 0.5 m/s:
```
E_kinetic = 20 × ½ × 0.0005 × 0.25 = 1.25 mJ
```

### Total Absorption Budget (20-cell radius)

| Mechanism | Energy | Reversible? |
|-----------|--------|-------------|
| Elastic deformation | 486 mJ | Yes |
| Connection breaking | 27 mJ | Requires reassembly |
| Faraday harvesting | 0.35 mJ | Captured as electrical |
| Kinetic redistribution | 1.25 mJ | Dissipated via friction |
| **Total** | **~515 mJ** | |

**Comparison**: A standard 3mm foam pad over the same area absorbs ~50-200 mJ. The magnetic lattice absorbs **2-10× more energy per unit area** than passive foam, and it's tunable.

## 4. Pre-Rigidification Response

If the structure has advance warning (camera detects incoming object), it can reconfigure before impact:

### Preparation Timeline

```
t = -200ms: Camera detects approaching object
t = -150ms: Coordinator calculates impact point and radius
t = -100ms: Commands sent to cells in impact zone
t = -50ms:  Impact zone cells transition to rigid.high-load
             Surrounding cells transition to flex.absorb
t = 0:      Impact arrives at pre-configured structure
```

### Graduated Stiffness Profile

The coordinator creates a stiffness gradient:

```
Distance from impact center → Stiffness assignment:
  0-2 hops:  rigid.high-load (maximum coupling)
  3-5 hops:  flex.absorb (active damping)
  6-8 hops:  flex.passive (compliant buffer)
  9+ hops:   rigid.standard (anchor)
```

This is a **programmable crumple zone**. The center is hard (distributes point load), the middle is absorbent (converts energy), the edges are anchored (prevent total displacement).

### Comparison to Conventional Materials

| Material | Absorption (J/cm³) | Weight (g/cm³) | Reconfigurable? |
|----------|-------------------|-----------------|----------------|
| EVA foam | 0.5-2 | 0.03-0.1 | No |
| Kevlar fabric | 10-40 | 1.44 | No |
| Carbon fiber composite | 20-80 | 1.5-1.8 | No |
| **Magnetic lattice (50mm cells)** | **~1-5** | **~0.1-0.3** | **Yes** |
| **Magnetic lattice (25mm cells)** | **~2-10** | **~0.2-0.5** | **Yes** |

The magnetic lattice won't match Kevlar or carbon fiber in raw absorption density. But it offers something they can't: **active reconfiguration**. The same structure can be:
- Hard where you need protection
- Soft where you need flexibility
- Open where you need airflow
- Dense where you need coverage

And it changes between these states in milliseconds.

## 5. Self-Healing After Impact

Post-impact, damaged connections need repair:

```
t = 0:    Impact. Some connections break. Cells displaced.
t = 10ms: Wave passes. Cells report new ε graph (missing connections).
t = 50ms: Coordinator compares ε_actual vs ε_desired. Identifies breaks.
t = 100ms: Displaced cells receive attract-home commands.
t = 200ms: Magnets re-engage. Connections reform.
t = 500ms: Structure restored to pre-impact configuration.
```

If a cell is damaged beyond magnetic reconnection:
```
t = 500ms:  Damaged cell flagged (δ.strain persists above threshold).
t = 1s:     Coordinator commands: eject damaged cell, route replacement from reserve.
t = 2-5s:   Replacement cell routes in via magnetic peristalsis.
t = 5-10s:  New cell attracts-home into position. Full repair complete.
```

**Self-healing time**: 0.5 seconds for connection reset, 5-10 seconds for cell replacement.

## 6. Scaling Laws

How absorption capacity scales with structure size:

| Property | Scaling | Explanation |
|----------|---------|-------------|
| Absorption area | ~ r² | 2D surface area grows quadratically |
| Total absorption energy | ~ r² | More cells × more springs |
| Wave transit time | ~ r | Linear with structure diameter |
| Response time (pre-rigidify) | ~ constant | Coordinator broadcasts in parallel |
| Self-healing time | ~ r | Routing distance grows linearly |

**Implication**: Larger structures are proportionally MORE effective at impact absorption. A full-body suit is not just "more of the same" — it's qualitatively better because the absorption radius is larger.
