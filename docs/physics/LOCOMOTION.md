# Locomotion Mechanics

## 1. Fundamental Principle

Locomotion is reconfiguration. The structure moves by building at the leading edge and reclaiming from the trailing edge. Total piece count is constant — the structure flows like a fluid.

```
net_displacement = pieces_added_front × cell_size - pieces_removed_back × cell_size
```

There is no dedicated locomotion mechanism. Movement uses the same primitives as assembly: release, transit, attract-home.

## 2. Contact Mode Spectrum

Speed depends inversely on how much of the body contacts the surface. Less contact = less friction = faster.

### Mode 1: Slug (Full Body Contact)

```
Configuration:
  - Entire bottom surface contacts ground
  - Leading edge: attract-home (extend forward)
  - Trailing edge: release → transit through body → attract-home at front
  - Body: rigid (structural, slides on surface)

Speed: 1-5 mm/s
Power: Tier 2 (many cells transitioning)
Stability: Maximum (entire body supports weight)
Terrain: Any flat surface
```

The entire body moves forward by one cell width per cycle. Every cell on the trailing edge must transit through the body. This is the slowest but most stable mode.

### Mode 2: Centipede (Discrete Contact Points)

```
Configuration:
  - Body lifted on "legs" (small extensions downward)
  - Legs cycle: plant → push → lift → swing forward → plant
  - Each leg is 3-5 cells forming a temporary pillar
  - Body rides on cycling legs (wave gait or tripod gait)

Speed: 10-50 mm/s
Power: Tier 2-3 (leg cycling + body maintenance)
Stability: Good (3+ contact points at all times)
Terrain: Flat to moderate roughness
```

Only the "feet" contact the ground. The body moves smoothly while legs cycle underneath. Fewer cells need to reconfigure per unit of forward motion.

### Mode 3: Continuous Tread

```
Configuration:
  - Bottom surface forms a loop (like a tank tread)
  - Ground-contact cells move backward (relative to body)
  - Top-of-loop cells move forward
  - Body sits on the moving tread, stationary relative to ground
  - Only tread cells cycle; body cells are static

Speed: 50-200 mm/s
Power: Tier 2 (only tread cells active)
Stability: Good (continuous ground contact through tread)
Terrain: Flat surfaces
```

The tread is formed by cells cycling in a loop: bottom surface → rear → over the top → front → bottom surface. The body doesn't reconfigure at all — only the tread cells move.

### Mode 4: Rolling (Cylindrical Cross-Section)

```
Configuration:
  - Structure forms a cylinder or wheel shape
  - Outer ring rolls on ground surface
  - Inner structure can remain stable (gyroscopic) or reconfigure
  - Only outer cells cycle; inner cells are payload

Speed: 200-1000+ mm/s
Power: Tier 2 initially, Tier 1 once rolling (inertia sustains)
Stability: Low (single contact line, no static stability)
Terrain: Flat, hard surfaces only
```

This is the fastest mode but requires the most favorable terrain and has no static stability (must keep moving or restructure).

### Mode Selection

| Terrain | Energy Budget | Recommended Mode |
|---------|--------------|-----------------|
| Rough, irregular | Low | Slug |
| Rough, irregular | High | Centipede |
| Flat, smooth | Low | Tread |
| Flat, smooth | High | Rolling |
| Vertical surface | Any | Climbing (see §4) |
| Incline < 30° | Any | Centipede or Tread |
| Incline > 30° | Any | Slug (maximum adhesion) |

Selection is a χ assignment: the coordinator assigns structural roles (foot, tread-segment, body, reserve) based on terrain assessment and energy budget.

## 3. Speed Analysis

### Limiting Factors

1. **Piece transit time**: How fast can a cell route through the body?
   - From magnetic model: ~12ms per cell hop
   - For 10-cell body: ~120ms per piece cycle

2. **Leading edge construction time**: How fast can cells attract-home?
   - Attract-home takes ~50-100ms (stem adjustment + magnetic locking)

3. **Trailing edge release time**: How fast can cells disengage?
   - Sequential release: ~200ms per connection (graceful)
   - Parallel release: ~50ms (all connections simultaneously, less controlled)

### Speed Calculations

**Slug mode** (6mm cells):
```
Cycle: release (200ms) + transit through 10 cells (120ms) + attract-home (100ms) = 420ms
Displacement per cycle: 6mm
Speed = 6mm / 420ms = 14.3 mm/s = ~1.4 cm/s
```

**Centipede mode** (6mm cells, 6 legs cycling):
```
Leg swing time: 200ms
Stride length: 2 cell widths = 12mm
6 legs in wave gait: always 3 on ground
Body advance per stride: 12mm
Speed = 12mm / 200ms × efficiency(0.7) = 42 mm/s = ~4.2 cm/s
```

**Tread mode** (6mm cells):
```
Tread cell cycle: release + transit + attract = 420ms
But many tread cells operate in pipeline
Effective throughput: 1 cell per 50ms (8 cells in pipeline)
Speed = 6mm / 50ms = 120 mm/s = ~12 cm/s
```

**Rolling mode** (6mm cells, 50mm diameter wheel):
```
Circumference: ~157mm = ~26 cells
One full rotation: 26 cells × routing time
But rolling is inertial — once spinning, minimal energy needed
Peak speed limited by centrifugal force on connections
Max rotation: ω where F_centrifugal < F_magnetic
F_centrifugal = m × ω² × r = 0.5g × ω² × 25mm
F_magnetic ≈ 1 N (3mm magnets at contact)
ω_max = √(F_magnetic / (m × r)) = √(1 / (0.0005 × 0.025)) = 283 rad/s
v_max = ω × r = 283 × 0.025 = 7 m/s

Practical limit (vibration, control): ~1-2 m/s
```

## 4. Climbing

The structure can traverse continuous surfaces: floor → wall → ceiling (within limits).

### Requirements
- Surface must be continuous (no open-air gaps exceeding cantilever limit)
- Surface must be ferromagnetic (steel, iron) OR structure must use friction/suction
- Gravitational load per cell < magnetic connection strength

### Climbing Protocol

```
Phase 1: Approach vertical surface
  - Body in slug/centipede mode on floor
  - Leading edge reaches wall base

Phase 2: Transition (floor → wall)
  - Corner cells form 90° joint (flex mode)
  - Leading edge attaches to wall surface
  - Body weight transfers: floor → corner → wall attachment

Phase 3: Ascend
  - Slug mode on wall (full contact = maximum adhesion)
  - Trailing edge reclaims from floor
  - Body "flows" up the wall

Phase 4: Transition (wall → top surface)
  - Same as Phase 2 in reverse at top edge
```

### Weight Limit for Climbing

On a ferromagnetic surface, magnetic adhesion provides grip:
```
F_adhesion per cell = F_magnetic × contact_factor
```

For 5mm N42 magnets on steel surface: F_adhesion ≈ 2 N per cell

Weight of a 50-cell structure: 50 × 0.5g = 25g = 0.25 N
Adhesion of cells in contact (say 20 of 50): 20 × 2 N = 40 N

**Safety factor**: 40 / 0.25 = **160×** — extremely safe for climbing on ferromagnetic surfaces.

On non-ferromagnetic surfaces (wood, concrete, glass):
- No magnetic adhesion
- Must rely on friction: μ × N = μ × weight component normal to surface
- On vertical surface: friction must overcome full weight
- With silicone or rubber contact pads: μ ≈ 0.8-1.2
- Need at least 30% of cells in contact for adequate friction
- **Marginal on vertical smooth surfaces**. Works on textured surfaces.

### Cantilever Limit

When transitioning between surfaces (e.g., edge of table), the structure must cantilever:

```
Max cantilever length before magnetic connections fail:

Bending moment at base: M = W × L/2 (distributed load)
Magnetic connection resists: F_magnetic × d (moment arm = cell thickness)

L_max = √(2 × F_magnetic × d / (w × g))
```

For 5mm magnets, 3mm cell thickness, 0.5g/cell:
```
L_max = √(2 × 1 × 0.003 / (0.5e-3/0.006 × 9.8)) = ~8.6 cm
```

The structure can cantilever about **8-9 cm** unsupported. This is enough to cross small gaps (table edge overhang, stair steps) but not large openings.

## 5. Deployable Harvesting Organs

The structure can temporarily build purpose-specific extensions:

### Sail / Wind Fin
```
Purpose: Capture wind energy for electromagnetic harvesting
Structure: Thin planar extension (1 cell thick, extended stems)
Area: 20-50 cells = 50-300 cm² (6mm cells)
Orientation: Normal to wind direction
Fragility: Low structural integrity (single-layer lattice)
Retraction: On command, cells release → transit back to body
Power contribution: ~10-50 μW continuous in light breeze
```

### Solar Array
```
Purpose: Maximize solar harvesting
Structure: Flat panel of cells with solar-facing orientation
Area: 20-50 cells
Orientation: Toward sun (can track slowly by restructuring edge)
Power contribution: 20 cells × 120 μW (outdoor) = 2.4 mW
```

### Vibration Antenna
```
Purpose: Amplify ambient vibration for harvesting
Structure: Long thin extension (resonant at target frequency)
Length: Tuned to local vibration frequency (L = v / (2f))
Amplification: 5-20× at resonance
Power contribution: 5-20× base vibration harvesting
```

### Thermal Fin
```
Purpose: Harvest temperature differential (body heat vs. ambient)
Structure: High surface-area extension with Peltier elements (if τ=power cells with TEG)
ΔT: 10-20°C (body vs. outdoor air)
Power: ~1-5 mW per cm² of Peltier surface (at ΔT=15°C)
Practical: Only viable with dedicated thermoelectric cells
```

## 6. Energy Cost of Locomotion

| Mode | Power per Cell | Active Cells | Structure (50 cells) | Endurance (100mF cap) |
|------|---------------|-------------|---------------------|----------------------|
| Slug | 24 mW (Tier 2) | ~20 (transitioning) | 480 mW | ~1 second |
| Centipede | 24 mW | ~12 (legs) | 288 mW | ~1.9 seconds |
| Tread | 24 mW | ~15 (tread loop) | 360 mW | ~1.5 seconds |
| Rolling | 24 mW initial, 5 mW sustain | ~10 (outer ring) | 50-240 mW | ~2-11 seconds |

**Key insight**: Locomotion is expensive. A 50-cell structure with 100mF supercapacitor can sustain movement for only a few seconds. Extended travel requires:
1. Frequent stops to recharge (solar)
2. Deploying harvesting organs during pauses
3. Operating in environments with abundant ambient energy
4. Moving in short bursts with long recharge periods

This matches biological systems: small organisms (ants, insects) operate in burst-and-rest patterns. The fabric would too.
