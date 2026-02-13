# Magnetic Model

## 1. Fundamental Forces

### Dipole-Dipole Interaction

Two magnetic dipoles with moments m₁ and m₂, separated by distance d along the axis:

```
F_axial(d) = (3μ₀ / 2π) × (m₁ × m₂) / d⁴
```

Where:
- μ₀ = 4π × 10⁻⁷ T·m/A (permeability of free space)
- m = B_r × V / μ₀ (magnetic moment from remanence × volume)
- d = center-to-center distance between magnets

### Neodymium Magnet Properties

| Grade | B_r (Remanence) | Typical Use | Max Temp |
|-------|-----------------|-------------|----------|
| N35 | 1.17-1.21 T | General purpose | 80°C |
| N42 | 1.28-1.32 T | Strong permanent | 80°C |
| N52 | 1.43-1.48 T | Maximum strength | 60°C |

### Force vs. Distance for Cylindrical Magnets

For a cylindrical magnet of diameter D and thickness h:
- Volume V = π(D/2)²h
- Moment m = B_r × V / μ₀

**Reference calculations** (N42 grade, B_r = 1.3 T):

| Magnet (D×h) | Volume | Moment | Force @ 1mm | Force @ 3mm | Force @ 5mm |
|--------------|--------|--------|-------------|-------------|-------------|
| 2mm × 1mm | 3.14 mm³ | 3.25 mA·m² | 0.32 N | 0.004 N | 0.0005 N |
| 3mm × 1.5mm | 10.6 mm³ | 10.97 mA·m² | 1.09 N | 0.013 N | 0.002 N |
| 5mm × 2mm | 39.3 mm³ | 40.7 mA·m² | 4.04 N | 0.050 N | 0.006 N |
| 5mm × 3mm | 58.9 mm³ | 61.0 mA·m² | 6.05 N | 0.075 N | 0.009 N |
| 10mm × 3mm | 235.6 mm³ | 244 mA·m² | 24.2 N | 0.30 N | 0.038 N |

**Key observation**: Force drops as 1/d⁴. At contact (d ≈ 0.5mm gap), forces are substantial. At 5mm separation, forces are negligible for small magnets. This confirms the **local interaction** property: cells only interact with direct neighbors.

### Critical Distance: When Dipoles Merge

Individual dipoles merge into a continuous field when:
```
inter-magnet spacing < 3 × magnet diameter
```

For 2mm magnets: continuous field when spacing < 6mm (cell size < ~8mm edge-to-edge)
For 5mm magnets: continuous field when spacing < 15mm (cell size < ~20mm edge-to-edge)

**At arm-scale cells (6mm crossbar)**: With 2mm magnets at ~4mm spacing, we are in the **transition zone** — individual dipoles overlap but don't fully merge. This creates a partially continuous field with local peaks at magnet positions.

## 2. Switchable Magnet Options

### Option A: Electromagnet Coil

Small solenoid coil wound around ferrite core.

| Parameter | Value |
|-----------|-------|
| Coil diameter | 2-3mm |
| Turns | 20-50 |
| Wire gauge | 38-42 AWG (0.1-0.08mm) |
| Current | 10-50 mA |
| Power | 5-25 mW per coil active |
| Switching speed | < 1ms |
| Force (at contact) | 0.01-0.1 N (much weaker than permanent) |

**Verdict**: Fast switching but weak. Best for signaling, not structural force.

### Option B: Permanent Magnet + Mechanical Release

Permanent magnets provide structural force. A small actuator (piezo, shape-memory alloy, or micro servo) physically separates or rotates the magnet to break connection.

| Parameter | Value |
|-----------|-------|
| Structural force | Full permanent magnet force (see table above) |
| Release mechanism | Piezo push (0.1mm displacement sufficient) or SMA wire (contracts when heated) |
| Release power | 10-50 mW pulse for < 100ms |
| Re-engage | Passive (magnets attract naturally) |
| Switching speed | 10-100ms |

**Verdict**: Strong structural force, moderate switching speed. Best for assembly/disassembly.

### Option C: Hybrid

- **Permanent magnets** at crossbar-crossbar connections (structural, rarely released)
- **Electromagnets** at stem tip (frequent switching during routing)
- **SMA release** for permanent magnets when disassembly needed

**Verdict**: Best of both worlds. Structural connections are strong and passive. Routing connections are weak but fast.

## 3. Magnetic Peristalsis Model

### Routing a Piece Through Structure

A piece in `transit` mode moves through the structure by sequential magnetic activation:

```
Time 0: Cell A has transit piece. Cell B is relay-receive.
Time 1: Cell A magnets OFF on B-facing connection (release). Cell B magnets ON (attract).
Time 2: Piece slides from A to B. Cell B detects arrival (field strength δ).
Time 3: Cell B becomes relay-pass. Cell C becomes relay-receive.
Time 4: Cell B magnets OFF on C-facing connection. Cell C magnets ON.
... repeat ...
```

### Transit Speed

The transit piece moves under magnetic attraction:
```
F = F_attract(d) - F_friction(μ, N)
a = F / m_piece
```

For a 5mm magnet attracting a transit piece (mass ~0.5g) over 6mm:
- F_attract ≈ 0.05N at 3mm
- Friction (sliding on plastic) ≈ 0.005N
- Net acceleration ≈ 90 m/s²
- Time to traverse 6mm ≈ 12ms

**Throughput**: ~80 pieces/second through a relay corridor. For a 100-cell structure, complete reconfiguration in ~1-2 seconds.

### Energy per Transit

Energy to switch one magnet connection:
```
E_switch = P_switch × t_switch
```

For SMA release: E = 50mW × 50ms = 2.5 μJ per connection
For electromagnet: E = 25mW × 5ms = 0.125 μJ per connection

A full piece transit (2 releases, 2 engages): ~5-10 μJ
Routing through 10 cells: ~50-100 μJ

## 4. Connection Strength Analysis

### Structural Requirements

For a wearable arm covering (~50 T-pieces):
- Must support own weight: ~50 × 0.5g = 25g → 0.25 N total
- Must resist moderate impact: ~10 N distributed over structure
- Per-connection force needed: ~0.5 N (with safety factor)

### Magnet Sizing for Structural Adequacy

From the force table:
- **2mm × 1mm N42** at contact: 0.32 N → Marginal for structural
- **3mm × 1.5mm N42** at contact: 1.09 N → Adequate with safety factor
- **5mm × 2mm N42** at contact: 4.04 N → Comfortable margin

**Recommendation**: 3mm magnets for minimum viable cells, 5mm for demonstration pieces.

### Cumulative Field Effect

In a dense lattice (spacing < 3× magnet diameter), neighboring magnets reinforce each other. For a hexagonal arrangement of 6 cells:
- Central connection sees contributions from 6 magnets instead of 2
- Approximate reinforcement factor: 1.3-1.8× (geometry dependent)
- This partially compensates for the rapid 1/d⁴ falloff

## 5. Impact Wave Propagation

When an external force hits the structure at cell C₀:

```
t=0:  C₀ receives impact F₀. Enters flex.absorb.
t=1:  C₀'s displacement changes δ for all ε-neighbors.
      Each neighbor detects force via strain/acceleration.
      1-hop neighbors enter flex.passive.
t=2:  Wave propagates to 2-hop neighbors.
      Force attenuates as 1/r² (area distribution) × coupling_loss.
t=3:  3-hop neighbors see force below flex threshold.
      Remain in rigid (brace against wave).
```

### Absorption Efficiency

Each cell absorbs energy proportional to its displacement:
```
E_absorbed_per_cell = ∫ F(x) dx over cell displacement
```

For magnetic spring: F(x) ≈ k × x for small displacement, where k ≈ dF/dx at operating point.

Energy absorbed by N cells over radius r:
```
E_total = Σ(i=1 to N) ½ k × x_i²
```

With N ∝ r² (2D surface), the structure's absorption capacity scales quadratically with the radius of cells involved.

### Faraday Harvesting During Impact

Each displaced cell's magnet moves relative to its neighbor's coil:
```
EMF = -N × dΦ/dt = -N × B × A × (dv/dt) / v
```

Simplified for small displacement oscillations:
```
P_harvest ≈ (BNAω)² / (2R)
```

Where ω = oscillation frequency from impact, R = coil resistance.

For a 5mm magnet displacing 1mm at 100 Hz (typical impact frequency):
- B ≈ 0.3 T (at coil position)
- A ≈ 7mm² (coil cross-section)
- N ≈ 30 turns
- ω ≈ 628 rad/s
- R ≈ 5 Ω

P_harvest ≈ 0.35 mW per cell

Over 20 cells participating in absorption: **~7 mW** during the impact event.
This is enough to power several MCUs for ~100ms — the structure literally gains the energy it needs to process the impact.
