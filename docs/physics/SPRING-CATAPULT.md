# Spring Catapult: Mechanical Acceleration via Octagon Barrel

**A superior alternative to electromagnetic coilgun acceleration using the fabric's existing stem springs**

Version 0.1 — February 2026

*Related documents: [EMERGENT-CAPABILITIES.md](../EMERGENT-CAPABILITIES.md) Section 4 (Elastic Energy Storage) and Section 10 (Ballistic Self-Deployment) | [MAGNETIC-MODEL.md](MAGNETIC-MODEL.md) (EPM switching) | [IMPACT-ABSORPTION.md](IMPACT-ABSORPTION.md) (spring constants) | [DYNAMIC-COGNITION.md](../DYNAMIC-COGNITION.md) Section 1 (Dismantling Barrel)*

---

## 0. Motivation: Why Not a Magnetic Coilgun?

The electromagnetic coilgun approach described in [EMERGENT-CAPABILITIES.md](../EMERGENT-CAPABILITIES.md) Section 10 has three fundamental problems:

### Problem 1: Low per-stage energy

Each EPM stage delivers energy via magnetic attraction (work done as projectile traverses the field gradient). For a 3mm EPM:

```
F(d) = C/d⁴    where C = (3μ₀/2π) × m₁ × m₂

Work per stage = ∫ F(d) dd from d_far to d_contact
              = C/3 × (1/d_contact³ - 1/d_far³)
              ≈ 3 mJ per stage (3mm EPM)
              ≈ 11 mJ per stage (5mm EPM)
```

Over 20 stages, total energy delivered is ~60-220 mJ. For a 0.1g projectile this yields ~35 m/s under ideal conditions.

### Problem 2: Suck-back

The classic coilgun failure mode. After the projectile passes the midpoint of a coil stage, the same magnetic field that was pulling it forward now pulls it backward. The coil must switch OFF before the projectile reaches the midpoint.

For EPMs with 5ms switching time, at a cell spacing of 25mm, the projectile must not exceed:

```
v_max = cell_spacing / (2 × t_switch) = 0.025 / (2 × 0.005) = 2.5 m/s
```

Above 2.5 m/s, the EPM can't switch off fast enough — the projectile decelerates. This is a hard materials-physics limit: AlNiCo domain realignment bottoms out at ~1-2ms regardless of driver current.

Fast pulse coils (MOSFET-driven, ~10μs switching) avoid suck-back but store far less field energy per stage at cell-scale coil dimensions.

### Problem 3: The efficiency assumption

The supersonic velocity claim in EMERGENT-CAPABILITIES.md Section 6 (1,044 m/s from 54.5J) assumes 100% conversion of supercapacitor electrical energy to projectile kinetic energy. Real coilgun efficiency is 1-10% for hobbyist builds, 10-30% for optimized multi-stage designs. At 5% efficiency: 54.5J → 2.7J kinetic → 233 m/s. Still impressive, but not supersonic.

### The insight

The fabric already has a far better energy source than electromagnetic fields: **the compliant stems are mechanical springs**, and they store **240× more energy per cell** than magnetic attraction delivers.

---

## 1. The Spring Catapult Principle

### 1.1 Stems as Springs

From [EMERGENT-CAPABILITIES.md](../EMERGENT-CAPABILITIES.md) Section 4 and [T-PIECE-SPEC.md](../fabrication/T-PIECE-SPEC.md) Section 4:

```
k_stem  ≈ 5 N/mm = 5,000 N/m    (typical PETG living hinge)
Δx_max  = 17 mm                   (stem travel: 22mm max - 5mm min)
E_stem  = ½ × k × Δx²
        = ½ × 5000 × (0.017)²
        = 722 mJ per stem
```

Compare to magnetic attraction per stage: ~3 mJ (3mm EPM). The stem stores **240× more energy**.

### 1.2 Contact Force vs. Field Force

The spring catapult has a fundamental physics advantage over any electromagnetic approach:

| Property | Magnetic Coilgun | Spring Catapult |
|----------|-----------------|-----------------|
| Force delivery | Field gradient (1/d⁴ falloff) | Direct contact (no falloff) |
| Suck-back | Yes (field is symmetric) | No (spring extends, done) |
| Eddy current losses | 10-30% in projectile/housing | None |
| Switching speed needed | < transit time per stage | Before projectile arrives |
| Energy per stage | ~3 mJ (3mm EPM) | 722 mJ (stem spring) |

The spring pushes the projectile by direct mechanical contact. There is no air gap, no field gradient to fall off, and no suck-back. Once the stem extends, it imparts a forward impulse and then the projectile moves on to the next stage.

---

## 2. Octagon Barrel Design

### 2.1 Why Octagons

The [T-PIECE-SPEC.md](../fabrication/T-PIECE-SPEC.md) Section 5 documents the octagon+square tiling as a natural fabric configuration. By arranging 8 T-pieces in an octagon with all stems pointing inward, the stems form a radial array converging on a central bore — a natural barrel cross-section.

```
Cross-section (looking down the barrel axis):

        7    0    1
         \   |   /
          \  |  /
     6 ────(●)──── 2        (●) = projectile bore
          /  |  \
         /   |   \
        5    4    3

    8 stems, 4 opposing pairs:
    Pair A: 0-4 (vertical)
    Pair B: 1-5 (diagonal)
    Pair C: 2-6 (horizontal)
    Pair D: 3-7 (diagonal)
```

Each position along the barrel consists of one octagon ring (8 cells, 8 inward-facing stems). The stems compress against the projectile as it enters, then release sequentially to accelerate it.

### 2.2 Bore Geometry

For 25mm crossbar cells forming an octagon, the bore diameter depends on stem extension:

```
Octagon inscribed radius: r_oct = L_cb × (1 + √2) / 2 ≈ 30.2 mm (center to flat edge)

But stems point inward from the crossbar midpoint, not from the octagon edge.
Stem attachment is at the crossbar center, approximately at the inscribed radius.

Bore diameter = 2 × (r_attach - L_stem_extended)
```

With stems at various extensions:
- **Fully retracted** (stems at 5mm): bore ≈ 50mm — wide open, projectile enters freely
- **Half extension** (stems at 13mm): bore ≈ 34mm — projectile guided
- **Fully extended** (stems at 22mm): bore ≈ 16mm — stems converge near center

**Practical bore**: ~15-20mm diameter for a projectile that the stems can grip and push. The projectile should be sized so that stems at half-extension make contact.

### 2.3 Staging Geometry

The barrel is a series of octagon rings along the launch axis. Each ring is one "stage" of the catapult:

```
Side view (barrel cross-section, 5 positions shown):

    Ring 1        Ring 2        Ring 3        Ring 4        Ring 5
   ╔══════╗      ╔══════╗      ╔══════╗      ╔══════╗      ╔══════╗
   ║ ←  → ║      ║ ←  → ║      ║ ←  → ║      ║ ←  → ║      ║ ←  → ║
   ║  (P)→ ║ →→→ ║  (P)→ ║ →→→ ║      ║      ║      ║      ║      ║
   ║ ←  → ║      ║ ←  → ║      ║ ←  → ║      ║ ←  → ║      ║ ←  → ║
   ╚══════╝      ╚══════╝      ╚══════╝      ╚══════╝      ╚══════╝

   ← → = compressed stems (loaded)
   (P) = projectile moving right →
```

Each ring is connected to its neighbors via F_TOP (inter-polygon) bonding between adjacent octagon rings. The squares in the octagon+square tiling fill the gaps between rings and provide structural support.

Ring-to-ring spacing along the barrel axis: approximately L_cb = 25mm per ring (50mm for larger cells).

---

## 3. Operating Sequence

### 3.1 Loading Phase

1. **Assembly**: Cells route into octagon barrel configuration via standard magnetic peristalsis. 8 cells per ring, N rings total.

2. **Compression**: Each cell's stem is compressed to minimum length (5mm). Compression is achieved during assembly — as each cell routes into its octagon position, the neighboring stem tip pushes it inward. Alternatively, the coordinator commands stem retraction before assembly.

3. **Latching**: EPMs at each ST_TIP switch to ON state, locking the compressed stem in position. Each EPM holds the stem tip magnetically against the central bore wall (or against the projectile, once loaded).

4. **Projectile insertion**: The projectile is placed (or peristaltically routed) into the bore at the breech end. Compressed stems grip it radially from all 8 directions.

**Loading time**: Limited by peristaltic routing speed. At 80 pieces/second (from [MAGNETIC-MODEL.md](MAGNETIC-MODEL.md) Section 3), loading 400 cells (50-position barrel) takes ~5 seconds.

### 3.2 Firing Sequence

The firing sequence uses all three communication layers:

**Layer 1 (BLE, ms)**: Coordinator broadcasts to all barrel cells:
```
"Barrel cells 1-400: catapult mode. Fire sequence: ring-by-ring,
breech to muzzle. Estimated projectile velocity at each ring: [v₁...v₅₀].
Compute local delay from velocity estimate."
```

**Layer 2 (UART, μs)**: Distributes per-ring timing delays:
```
Ring 1: delay = 0 μs
Ring 2: delay = computed from v₁ and ring spacing
Ring 3: delay = computed from v₂ and ring spacing
...
Ring N: delay = Σ(spacing / v_i) for i = 1..N-1
```

**Layer 3 (TRIG, ns)**: The "fire" pulse. Propagates to all rings in ~200ns (effectively simultaneous). Each ring's 8 cells fire their EPM release after their pre-loaded local delay.

**The critical timing insight**: Unlike a magnetic coilgun, the spring catapult's timing is **forgiving**. A stem that releases slightly early simply pushes the projectile from slightly farther back — the energy delivery is spread over a longer contact distance, not lost. A stem that releases slightly late misses a fraction of its stroke — reduced energy, but no suck-back. Timing errors degrade performance gracefully rather than catastrophically.

### 3.3 EPM Release Mechanics

When the EPM switches from ON to OFF (5ms pulse), the stem is released. But the stem doesn't wait for the full 5ms switch time:

```
EPM ON force (3mm): ~1 N
Stem spring restoring force: k × Δx = 5 N/mm × 17mm = 85 N

Force ratio: 85:1 in favor of the spring
```

The stem begins moving the instant the EPM field drops below F_spring/μ_static (the static friction threshold). This happens well before the EPM fully switches:

```
EPM field drops to ~1% of ON value: stem releases
Estimated effective release time: < 1 ms (not the full 5ms switching time)
```

The 85:1 force advantage means the EPM doesn't need to fully switch — it just needs to weaken enough for the spring to overpower it.

### 3.4 After Firing

**Dismantling barrel** (from [DYNAMIC-COGNITION.md](../DYNAMIC-COGNITION.md) Theorem 1.1): Each octagon ring disconnects from the barrel structure immediately after the projectile passes. Recoil impulse is distributed as p/(N×8) per cell — with 8 cells per ring sharing the load, individual cell recoil is negligible.

**Cell recovery**: Disconnected cells are free-floating and rejoin the main fabric via standard assembly protocol. Stems re-compress during the next loading cycle.

---

## 4. Performance Analysis

### 4.1 Energy Per Ring

Each ring has 8 stems, each storing 722 mJ:

```
E_ring = 8 × 722 mJ = 5,776 mJ ≈ 5.8 J per ring
```

### 4.2 Energy Transfer Efficiency

Not all spring energy converts to projectile kinetic energy. Loss sources:

| Source | Estimated Loss | Rationale |
|--------|---------------|-----------|
| Friction (stem tip on projectile) | 5-10% | Sliding contact, short duration |
| Timing imperfection | 5-15% | Some stems fire early/late, partial stroke |
| Stem mechanical hysteresis | 5-10% | Living hinge material losses |
| Radial-to-axial conversion | 10-20% | Stems push radially; only the axial component accelerates. Angled stem tips or rifling geometry mitigate this. |
| Air resistance in bore | 1-3% | Short barrel, low speeds initially |
| **Total estimated loss** | **25-50%** | |

**Realistic efficiency range: 50-75%** for a well-designed barrel. Conservatively, we use 30% for initial analysis and 50% as an achievable target.

Note: the radial-to-axial conversion loss deserves attention. If stems push purely radially (perpendicular to barrel axis), they compress the projectile but don't accelerate it forward. The acceleration comes from:

1. **Angled stems**: If the stem tips are angled slightly forward (5-15° from radial), each push has a forward component. At 10° angle: axial fraction = sin(10°) ≈ 17%. This seems low but is applied at very high force (85N per stem × 8 stems = 680N total × 17% = 116N axial).

2. **Projectile geometry**: A tapered or ogive projectile converts radial compression into forward motion (like squeezing a watermelon seed). A 30° taper converts ~50% of radial force to axial.

3. **Sequential release**: If stems on the trailing side of the ring fire slightly before the leading side, the asymmetric radial force has a net forward component.

The combination of projectile taper + angled stems could achieve 40-60% radial-to-axial conversion, bringing total efficiency to 50-70%.

### 4.3 Velocity Calculations

For a 0.1g projectile (10 cells' worth of mass, small transit packet):

```
v = √(2 × η × E_total / m)

where:
  η = efficiency (0.30 conservative, 0.50 achievable)
  E_total = N_rings × E_ring
  m = 0.0001 kg
```

| Barrel Length | Rings | Cells | Total Energy | v (η=0.30) | v (η=0.50) | Mach |
|--------------|-------|-------|-------------|------------|------------|------|
| 10 rings | 10 | 80 | 57.8 J | 588 m/s | 760 m/s | 1.7 - 2.2 |
| 25 rings | 25 | 200 | 144 J | 930 m/s | 1,200 m/s | 2.7 - 3.5 |
| 50 rings | 50 | 400 | 289 J | 1,316 m/s | 1,700 m/s | 3.8 - 4.9 |
| 100 rings | 100 | 800 | 578 J | 1,860 m/s | 2,404 m/s | 5.4 - 7.0 |

**Key result**: A 25-ring barrel (200 cells, ~0.3% of a 65K fabric) achieves supersonic velocities even at 30% efficiency. A 50-ring barrel at 50% efficiency approaches Mach 5.

### 4.4 For Heavier Projectiles

Ballistic self-deployment packets (5-50 cells, 2-25g) are more realistic payloads:

| Projectile | Mass | Barrel (50 rings) | v (η=0.30) | v (η=0.50) | Range (45°, vacuum) |
|-----------|------|-------------------|------------|------------|---------------------|
| 5-cell packet | 2.5g | 400 cells | 83 m/s | 108 m/s | 350 - 590 m |
| 10-cell packet | 5g | 400 cells | 59 m/s | 76 m/s | 175 - 295 m |
| 20-cell packet | 10g | 400 cells | 42 m/s | 54 m/s | 88 - 149 m |
| 50-cell packet | 25g | 400 cells | 26 m/s | 34 m/s | 35 - 59 m |

Even a 50-cell self-deploying sub-fabric achieves 26-34 m/s (major league pitcher speed) from a 400-cell barrel. With air resistance, practical range for a 10-cell packet: ~100-200m. This is genuine ballistic self-deployment range.

### 4.5 Comparison to Pure Magnetic Coilgun

| Metric | Magnetic Coilgun (20 stages) | Spring Catapult (20 rings) | Ratio |
|--------|------------------------------|---------------------------|-------|
| Energy per stage | 3-11 mJ | 5,776 mJ | 500-1900× |
| Total energy (20 stages) | 60-220 mJ | 115.5 J | 500-1900× |
| Suck-back risk | Critical above 2.5 m/s | None | — |
| Switching precision needed | < 50 μs | < 1 ms | 20× more forgiving |
| Efficiency ceiling | 5-10% (small coils) | 50-70% (mechanical) | 5-14× |
| v for 0.1g projectile | ~35 m/s (ideal) | ~830-1,075 m/s | 24-31× |

The spring catapult is not an incremental improvement. It is a **qualitatively different regime** — mechanical energy storage at cell scale vastly exceeds electromagnetic energy storage.

---

## 5. Octagon Symmetry Capabilities

### 5.1 Opposing Pair Control

The 8 stems in each ring form 4 opposing pairs (0-4, 1-5, 2-6, 3-7). Each pair can be independently timed via Layer 3 trigger delays:

**Centering**: All 4 pairs fire simultaneously. The projectile receives perfectly symmetric radial force — no lateral deflection.

**Trajectory correction**: Slight timing asymmetry between opposing pairs creates a net lateral force. If pair A fires 100μs before pair C, the projectile receives a small rightward impulse. Over multiple rings, this provides mid-barrel steering.

### 5.2 Software-Defined Rifling

By introducing a consistent angular offset in the firing sequence around each ring, the projectile receives a tangential impulse — spin.

```
Ring N firing order (instead of simultaneous):
  Stem 0: fires at delay + 0 μs
  Stem 1: fires at delay + 20 μs
  Stem 2: fires at delay + 40 μs
  Stem 3: fires at delay + 60 μs
  Stem 4: fires at delay + 80 μs
  Stem 5: fires at delay + 100 μs
  Stem 6: fires at delay + 120 μs
  Stem 7: fires at delay + 140 μs
```

Each ring imparts a small clockwise (or counterclockwise) angular impulse. Over N rings, the projectile accumulates spin angular momentum. This provides gyroscopic stabilization without physical rifling grooves.

**Spin rate control**: Adjusting the per-stem delay offset controls the spin rate. The same barrel can launch non-spinning (simultaneous release) or spinning (sequential release) projectiles via software configuration alone.

### 5.3 Variable Power

Not all 8 stems need to fire at every ring:

| Configuration | Stems per ring | Energy/ring | Use case |
|--------------|---------------|-------------|----------|
| Full power | 8 | 5.8 J | Maximum velocity launch |
| Half power | 4 (alternating) | 2.9 J | Moderate velocity, less cell wear |
| Guidance only | 2 (one pair) | 1.4 J | Low-speed positioning, no-fire abort |
| Brake | 8 (compressed, not released) | 0 J | Projectile stops against compressed stems |

The barrel can also implement a **velocity profile**: full power for the first 50% of rings (maximum acceleration), then reduced power for the final 50% (fine velocity control at the muzzle).

---

## 6. Energy Budget and Reload

### 6.1 Total Energy

A 50-ring barrel stores:

```
E_total = 50 × 5,776 mJ = 288.8 J ≈ 289 J
```

This is entirely mechanical (spring potential energy). No electrical energy from supercapacitors is consumed for the acceleration itself. The only electrical cost is the EPM release pulse:

```
E_electrical = 400 cells × 14 mJ per EPM switch = 5.6 J
```

The electrical cost is **2%** of the mechanical energy. The supercapacitor budget (545 mJ per cell × 400 cells = 218 J available) easily covers this.

### 6.2 Reload Cycle

Reloading requires re-compressing all stems and re-latching them:

1. **Cell recovery** (~2s): Disconnected barrel cells rejoin the fabric via peristalsis (80 cells/s throughput).

2. **Stem compression** (~3s): Cells route back into octagon positions. Stem compression happens during assembly as cells interlock. The coordinator sequences assembly so that each cell's stem compresses against the bore fixture (or a sacrificial slug).

3. **EPM latching** (~0.5s): All EPMs pulse to ON. Parallel operation, Layer 3 synchronized. Energy cost: 5.6 J (from supercaps).

4. **Projectile loading** (~0.5s): Transit packet routes into the bore from the breech end.

**Total reload time: ~5-6 seconds**.

**Reload energy**: The 289J of spring energy must come from somewhere. During reload, the cells' own spring constants resist compression — this energy comes from the peristaltic routing forces (magnetic attraction between assembling cells). Each magnetic connection at contact provides ~1-4N of force over ~1mm displacement = ~1-4 mJ per connection. With 6 connections per cell × 400 cells = 2,400 connections × ~2 mJ = 4.8 J from magnetic assembly.

This is far less than 289J. The deficit means **external mechanical work** is required during reload — either from the fabric's own locomotion (pressing the barrel against a surface), from operator action (compressing the barrel), or from dedicated compression cells (cells with high-force actuators).

**Revised reload approach**: The stem spring constant of 5 N/mm over 17mm travel requires 85N force at full compression. No individual magnetic connection provides this. Practical options:

- **Sequential compression**: Compress one ring at a time using a heavy compression slug routed through the barrel. The slug's mass provides inertial resistance.
- **Operator-assisted**: Operator physically compresses a reload mechanism. Appropriate for the authorization tier (Visual-authorized for weaponized launch).
- **Gravity-assisted**: Orient barrel vertically, drop a mass through it. A 1kg mass dropped from 30cm provides 2.9J per ring — enough for partial compression.
- **Reduced spring constant**: Use a softer stem material (k = 1-2 N/mm) for dedicated catapult cells. This reduces per-stem energy to 145-289 mJ but makes compression feasible with magnetic forces alone.

This reload energy question is an **open engineering problem**. The energy is there in principle — 289J from a 65K fabric's solar harvest takes ~15 seconds to accumulate. Converting it to mechanical spring compression is the challenge.

### 6.3 Duty Cycle

| Phase | Duration | Power Draw |
|-------|----------|------------|
| Loading | ~5s | Tier 2 (24 mW × 400 cells = 9.6W) |
| Armed (holding) | Indefinite | Zero (EPMs are bistable) |
| Firing | ~50ms | Tier 3 burst (EPM pulses: 5.6J total) |
| Recovery | ~2s | Tier 2 (peristaltic routing) |
| **Cycle total** | ~7-8s | ~50J electrical |

---

## 7. Dismantling Barrel Recoil Analysis

From [DYNAMIC-COGNITION.md](../DYNAMIC-COGNITION.md) Theorem 1.1, the dismantling barrel principle applies directly:

### 7.1 Recoil Per Cell

For a 0.1g projectile at 1,000 m/s (50-ring barrel, ~50% efficiency):

```
Total impulse: p = m × v = 0.0001 × 1000 = 0.1 N·s
Per-ring impulse: p_ring = 0.1 / 50 = 0.002 N·s
Per-cell impulse: p_cell = 0.002 / 8 = 0.00025 N·s

Cell mass: 0.5g
Per-cell recoil velocity: v_recoil = p_cell / m_cell = 0.00025 / 0.0005 = 0.5 m/s
Per-cell recoil energy: E_recoil = ½ × m × v² = ½ × 0.0005 × 0.25 = 62.5 μJ
```

**0.5 m/s recoil** per cell — a gentle push. Each cell absorbs this trivially on magnetic reconnection with the main fabric (bond energy ~1.35 mJ per connection, from [IMPACT-ABSORPTION.md](IMPACT-ABSORPTION.md) Section 3.2, which is 21× the recoil energy).

### 7.2 For Heavier Projectiles

| Projectile | v_exit | Total impulse | Per-cell recoil v | Per-cell recoil E |
|-----------|--------|---------------|-------------------|-------------------|
| 0.1g @ 1,000 m/s | 1,000 m/s | 0.1 N·s | 0.5 m/s | 62.5 μJ |
| 5g @ 80 m/s | 80 m/s | 0.4 N·s | 1.0 m/s | 250 μJ |
| 25g @ 30 m/s | 30 m/s | 0.75 N·s | 1.9 m/s | 890 μJ |

Even the heaviest practical projectile (25g sub-fabric at 30 m/s) produces only 1.9 m/s per-cell recoil — comparable to a brisk walk. The dismantling barrel absorbs this without structural concern.

---

## 8. Comparison to the Magnetic Coilgun Claim

The EMERGENT-CAPABILITIES.md Section 6 calculates:

```
54.5 J available → v = √(2 × 54.5 / 0.0001) = 1,044 m/s (Mach 3)
```

This assumes 100% conversion of electrical energy to kinetic energy. At realistic coilgun efficiency (5-10%), the actual velocity would be:

```
v_realistic = 1044 × √(0.05 to 0.10) = 233 to 330 m/s
```

The spring catapult achieves the same velocity range with just **10-25 rings** (80-200 cells) at 30% efficiency — using no electrical energy for acceleration. The magnetic coilgun requires 200 cells' worth of supercapacitor energy AND suffers from suck-back, eddy current losses, and poor small-coil efficiency.

**Recommendation**: EMERGENT-CAPABILITIES.md Section 10 should note that the spring catapult is the preferred acceleration mechanism, with magnetic coils serving as guidance (centering and steering the projectile) rather than as the primary force source.

---

## 9. Open Questions

### 9.1 Radial-to-Axial Conversion

The single most important engineering question. Pure radial compression doesn't accelerate the projectile forward. Solutions to investigate:

- **Projectile taper geometry**: What cone angle maximizes forward force conversion? (Likely 20-40°, but needs FEA or empirical testing.)
- **Angled stem tips**: Can the stem tip be printed at 10-15° from radial? Does this affect flex zone fatigue?
- **Helical stem arrangement**: If stems in consecutive rings are rotationally offset, the projectile follows a helical path — converting rotational energy to linear via a rifling-like groove on the projectile.

### 9.2 Reload Energy Source

289J of spring compression energy per 50-ring barrel cannot come from magnetic assembly forces alone (which provide ~5J total). Practical reload mechanisms need investigation:

- Operator-assisted compression (appropriate for visual-authorized tier)
- Dedicated high-force cells with SMA or piezo actuators
- Gravity-assisted (vertical barrel, drop mass)
- Reduced spring constant for catapult-dedicated cells

### 9.3 Projectile Survivability

At 1,000+ m/s, the projectile (a packet of T-piece cells) experiences extreme acceleration:

```
Average acceleration (50 rings × 25mm spacing = 1.25m barrel):
a = v² / (2 × L) = 1,000,000 / 2.5 = 400,000 m/s² ≈ 40,000 g
```

No T-piece electronics survive 40,000g. For self-deploying sub-fabrics, velocity must be limited to levels where cells survive impact and re-assemble. At 50 m/s over 1.25m barrel:

```
a = 2500 / 2.5 = 1,000 m/s² ≈ 100g
```

100g is survivable for ruggedized electronics (military-grade accelerometers handle 10,000g+). The practical operating range for self-deploying packets is **30-80 m/s**, where cells survive and reassemble on landing.

Higher velocities (supersonic) are achievable but the projectile would be inert mass, not self-deploying cells.

### 9.4 Barrel Straightness

50 octagon rings must maintain axial alignment to ±1mm over the full barrel length (~1.25m). At 25mm ring spacing, this requires:

```
Angular tolerance per ring: arctan(1/1250) ≈ 0.05°
```

The fabric's magnetic self-alignment (F_TOP face bonds) provides ~0.2mm centering per bond. Over 50 bonds: random walk alignment error ≈ 0.2 × √50 ≈ 1.4mm. This is marginal.

**Mitigation**: A stiff spine (3-4 cells bonded face-to-face along the barrel length) provides structural straightness that individual ring alignment cannot.

### 9.5 Hybrid Spring-Magnetic Approach

The optimal design may combine both mechanisms:

- **Springs** (stems): Primary force source. 722 mJ per stem, contact delivery, no suck-back.
- **EPMs**: Dual role — (1) latch springs in compressed state, (2) provide magnetic guidance/centering in the bore between stem contact zones.
- **Layer 3 trigger**: Synchronized release timing for both spring and magnetic stages.
- **Magnetic coils at muzzle**: Final velocity trim. After the last spring ring, 5-10 magnetic-only stages provide fine velocity control without the energy demands of the main acceleration.

---

## 10. Summary

The spring catapult exploits an energy source (stem springs) that stores 240× more energy per cell than magnetic field attraction, delivers force by direct contact (no 1/d⁴ falloff), suffers no suck-back, and switches with 20× more timing tolerance. The octagon barrel configuration — a natural fabric tiling — places 8 springs per barrel position, multiplying the energy density further.

| Parameter | Value |
|-----------|-------|
| Energy per ring (8 stems) | 5.8 J |
| Barrel size for Mach 1 (0.1g projectile, 30% eff) | ~10 rings, 80 cells |
| Barrel size for Mach 3 (0.1g projectile, 50% eff) | ~25 rings, 200 cells |
| Self-deploy range (10-cell packet, 50 rings) | 100-200 m |
| Reload time | ~5-6 seconds |
| Electrical cost per shot | ~5.6 J (EPM releases only) |
| Recoil per cell (dismantling barrel) | 0.5-1.9 m/s |
| Fraction of 65K fabric used | 0.3-1.2% |

The spring catapult is the recommended acceleration mechanism for Seshat Fabric ballistic capabilities. Electromagnetic coils should serve as guidance and fine-control elements, not as the primary energy source.

---

*See also:*
- *[EMERGENT-CAPABILITIES.md](../EMERGENT-CAPABILITIES.md) — Full emergent capability catalog*
- *[DYNAMIC-COGNITION.md](../DYNAMIC-COGNITION.md) — Dismantling barrel theorem and flow analysis*
- *[MAGNETIC-MODEL.md](MAGNETIC-MODEL.md) — EPM specifications and switching times*
- *[IMPACT-ABSORPTION.md](IMPACT-ABSORPTION.md) — Spring constants and energy absorption*
- *[T-PIECE-SPEC.md](../fabrication/T-PIECE-SPEC.md) — Stem geometry and octagon+square tiling*
