# Seshat Fabric: Emergent Capabilities

**Zero-Additional-Hardware Properties of a Programmable Electromagnetic Lattice**

Version 0.1 — February 2026

*Companion document to [MATHEMATICAL-FOUNDATIONS.md](./MATHEMATICAL-FOUNDATIONS.md) | Dynamic theory: [DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md) | Build sequence: [BUILD-ROADMAP.md](./BUILD-ROADMAP.md)*

---

## 0. Premise

The Seshat Fabric was designed to be a reconfigurable programmable material — cells that connect, disconnect, change shape, and move through the structure. In the course of formalizing this (see *Mathematical Foundations*), we identified **11 capabilities that emerge from the existing primitives with zero additional hardware**. None of these were design goals. All of them are direct physical consequences of the cell architecture.

This document catalogs each capability, derives its performance bounds, analyzes how it scales with cell count, and then examines what happens when multiple capabilities operate simultaneously in a single fabric.

**Important**: The capabilities below are analyzed for *static configurations* of the fabric. The companion document [DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md) shows that several capabilities previously assessed as infeasible (e.g., load-bearing, high-recoil coilgun) become feasible when analyzed as continuous *flows* between configurations rather than static snapshots. See DYNAMIC-COGNITION Sections 1 and 7 for the revised capability analysis.

### The Primitives (What Each Cell Already Has)

| Component | Originally designed for | Also happens to be |
|-----------|------------------------|-------------------|
| Permanent magnet + coil (×6 zones) | Bonding, switching, communication | Antenna element, speaker, magnetometer |
| Hall effect sensor (×6 zones) | Neighbor detection | Distributed field mapper |
| Strain sensor (stem) | Flex measurement | Pressure/weight sensor |
| Microcontroller (ESP32-C3, 160 MHz) | Coordination, policy network | Compute node in mesh |
| Compliant stem (spring) | Variable geometry | Elastic energy storage |
| Supercapacitor | Burst power | Collective energy reserve |
| UUID + 9D coordinate | Identity, behavior | Cryptographic fingerprint |

---

## 1. Phased Array Antenna / Software-Defined Radar

### Physical Basis

Each cell's coil, driven by its microcontroller, is an antenna element. An array of N coils at regular spacing d, each driven with independently controlled phase and amplitude, forms a **phased array antenna**.

### Key Physics

**Array factor** for N elements at spacing d:

```
AF(θ) = Σ_{n=0}^{N-1} w_n · exp(j·n·k·d·sin(θ))
```

where w_n is the complex weight (amplitude + phase) applied to element n, k = 2π/λ is the wavenumber, and θ is the observation angle.

**Resonant frequency** for element spacing d:

```
f_resonant = c / (2d)
```

For d = 25mm: f = 6 GHz (WiFi 6E / 5G NR band).

**Beam width** (half-power):

```
Δθ ≈ 0.886 · λ / (N · d)
```

**Directivity / gain**:

```
D ≈ π · N    (for a linear array)
D ≈ π · N_x · N_y    (for a planar array)
```

### Scaling

| Cells (N) | Array size | Beam width | Gain | Equivalent |
|-----------|-----------|------------|------|------------|
| 100 | 10×10 | ~5° | ~30 dBi | Small satellite dish |
| 1,000 | 32×32 | ~1.6° | ~40 dBi | Large radar installation |
| 10,000 | 100×100 | ~0.5° | ~50 dBi | Radio telescope segment |
| 65,000 | 255×255 | ~0.2° | ~58 dBi | Beyond most military arrays |

A 10,000-cell fabric operating as a phased array at 6 GHz has the directivity of a radio telescope segment. It can:

- **Beam-form communications**: point a tight beam at a satellite, phone, or another fabric
- **Radar imaging**: emit pulses, receive reflections, build a 3D map of surroundings
- **Electronic warfare**: jam specific directions while maintaining communication in others
- **Radio astronomy**: if pointed at the sky, detect faint radio sources with exceptional angular resolution

### Operational Notes

- Requires synchronized timing across cells (achievable via the ε-graph clock distribution)
- Power draw: each element at ~1 mW transmit = N mW total. At 10K cells: 10W (requires Tier 3 burst mode from collective energy reserve)
- Can operate in **receive-only mode** (passive radar / signals intelligence) at near-zero power cost — just digitize the coil voltage at each cell

---

## 2. Acoustic Transducer / Echolocation

### Physical Basis

A coil in a magnetic field, driven with an alternating current, vibrates (Lorentz force). This is how every loudspeaker works. Each cell's magnet-coil pair is a tiny speaker. Conversely, vibration of the coil in the magnetic field induces voltage (Faraday's law) — each cell is also a microphone.

### Key Physics

**Sound pressure level** from a single cell element:

```
SPL ≈ 20 · log₁₀(B · L · I / (2π · r · ρ_air · c)) dB
```

where B = magnetic field, L = coil wire length, I = drive current, r = distance.

A single cell produces ~40–50 dB SPL at 1m (quiet conversation level). But N cells coherently driven produce:

```
SPL_array = SPL_single + 20 · log₁₀(N)
```

**Acoustic beam-forming** follows the same phased array physics as Section 1, but at acoustic frequencies (20 Hz – 100 kHz) with acoustic wavelengths:

```
λ_acoustic = v_sound / f = 343 m/s / f
```

At 40 kHz (ultrasonic): λ = 8.6 mm. Cell spacing of 25mm gives ~3λ spacing — this works for beam-forming but produces grating lobes. At lower ultrasonic frequencies (10–15 kHz), the spacing is closer to λ, which is ideal.

### Echolocation Performance

```
Range = (P_transmit · G² · λ² · σ_target) / ((4π)³ · P_min)
```

For 1000-cell fabric at 40 kHz:
- Transmit power: ~100 mW acoustic
- Array gain: ~30 dB
- Minimum detectable signal: ~-60 dBm (limited by ambient noise)
- Detection range for human-sized target: **~30 meters**
- Angular resolution: ~2° (at 40 kHz with 25mm spacing)

### Scaling

| Cells | SPL at 1m | Echolocation range | Angular resolution |
|-------|-----------|-------------------|-------------------|
| 100 | ~90 dB | ~10 m | ~6° |
| 1,000 | ~110 dB | ~30 m | ~2° |
| 10,000 | ~130 dB | ~100 m | ~0.6° |
| 65,000 | ~140+ dB | ~300 m | ~0.2° |

At 10K cells, the fabric's acoustic output (130 dB) is comparable to a jet engine at close range. This could be used for:

- **Long-range echolocation**: map rooms, terrain, obstacles without cameras
- **Directional audio**: project sound at a specific person without others hearing
- **Active noise cancellation**: sense incoming sound, emit anti-phase from the nearest surface cells
- **Non-lethal acoustic deterrent**: extremely loud focused sound in a narrow beam
- **Underwater sonar**: acoustic propagation is far superior to RF underwater; the fabric becomes a sonar array

---

## 3. Programmable Metamaterial

### Physical Basis

A metamaterial is a material whose bulk properties emerge from its microstructure rather than its chemical composition. The fabric's cells ARE the microstructure, and their properties are programmable.

### Achievable Properties

**Variable stiffness (Young's modulus):**

```
E_effective = f_rigid · E_rigid + f_flex · E_flex
```

where f_rigid is the fraction of cells in rigid mode. The fabric can vary its effective stiffness from E_flex (~0.1× base material) to E_rigid (~1× base material) continuously, and can set different stiffness in different regions simultaneously.

**Programmable Poisson's ratio:**

Normal materials: ν ∈ (0, 0.5). When stretched, they get thinner.

By coordinating stem extensions across the fabric, cells can be programmed to extend their stems perpendicular to an applied tension. This creates **auxetic behavior** (ν < 0): the material gets THICKER when stretched.

```
ν_effective = -Δε_transverse / Δε_longitudinal
```

Achievable range: approximately ν ∈ (-0.5, 0.5), programmable in real-time.

Auxetic materials are extremely useful for:
- Impact absorption (material flows INTO the impact site rather than away from it)
- Fasteners (auxetic plug expands when pulled, locks tighter)
- Armor (gets thicker at the point of impact)

**Tunable acoustic impedance:**

```
Z_acoustic = ρ_effective · c_effective
```

By varying cell density and stiffness zonally, the fabric controls how sound propagates through it. It can create:
- Acoustic lenses (focus sound to a point)
- Acoustic cloaks (redirect sound around a region)
- Frequency-selective filters (pass some frequencies, reflect others)

**Negative effective stiffness:**

By timing cell responses to be slightly out-of-phase with applied force (pre-configured timing, same technique as the coilgun):

```
F_response(t) = -k_eff · x(t - τ_delay)
```

With appropriate τ_delay, the response force can be in-phase with velocity rather than displacement, creating an effective negative stiffness. The material pushes WITH you when you push it. This requires active power (Tier 2) and precise timing, but it's physically realizable.

### Scaling

These properties improve with cell count because finer microstructure = more precise control over bulk properties. At 10K+ cells, the fabric approaches a **continuous programmable material** rather than a discrete lattice.

---

## 4. Elastic Energy Storage / Catapult

### Physical Basis

Each compliant stem is a spring with spring constant k_stem. When compressed or extended from rest, it stores elastic energy:

```
E_stem = ½ · k_stem · Δx²
```

### Energy Storage

For a 25mm cell with stem range 5–22mm (17mm travel):

```
k_stem ≈ 5 N/mm (typical for PETG living hinge)
Δx_max = 17mm
E_stem_max = ½ · 5 · (17)² = 722 mJ per cell
```

This is MORE than the supercapacitor (545 mJ). The stems store **more energy than the electronics**.

| Cells | Total elastic storage | Equivalent |
|-------|----------------------|------------|
| 100 | 72 J | Small firecracker |
| 1,000 | 722 J | Baseball pitch kinetic energy |
| 10,000 | 7,220 J | .22 caliber bullet kinetic energy |
| 65,000 | 47,000 J | Dropping a bowling ball from 300m |

At 10K cells with fully compressed stems: 7.2 kJ of stored mechanical energy, released in milliseconds.

### Applications

**Jumping**: A flat fabric sheet compresses all bottom-surface stems, then releases simultaneously.

```
Height = E_total / (m_total · g)
```

For 1000 cells (400g total, 722J stored): h = 722 / (0.4 · 9.81) = **184 meters**.

This is obviously unrealistic (air resistance, not all energy converts to vertical motion, structural limits), but it shows the energy density is extreme. A realistic 10% efficiency still gives **18 meters** — the fabric could jump over a building.

**Shape snapping**: The fabric stores a target shape as compressed stems, then snaps into it faster than motorized reconfiguration — mechanical rather than electrical.

**Combined with coilgun**: Pre-compressed stems along a runway release in sequence, adding spring force to magnetic force. This approximately doubles the projectile exit velocity.

---

## 5. Distributed Magnetometer Array

### Physical Basis

Each cell has 6 Hall effect sensors measuring the local magnetic field vector. These are already present for neighbor detection. Combined across the fabric, they form a **distributed vector magnetometer**.

### Resolution

**Spatial resolution**: one measurement per cell spacing = 25mm.

**Field sensitivity**: typical Hall sensor: ~10 μT resolution. With averaging across multiple readings: ~1 μT.

**Anomaly detection range**: a ferromagnetic object of mass m at distance r produces a field anomaly:

```
ΔB ≈ μ₀ · M · V / (4π · r³)
```

where M is the magnetization and V is the object volume. For a 1cm steel ball at distance r:

```
ΔB(r=10cm) ≈ 50 μT    (easily detectable)
ΔB(r=1m) ≈ 0.05 μT    (at noise floor, but detectable with averaging)
```

### Scaling

| Cells | Sensor points | Spatial coverage | Detection depth |
|-------|--------------|-----------------|-----------------|
| 100 | 600 | 25cm × 25cm | ~20 cm |
| 1,000 | 6,000 | 80cm × 80cm | ~50 cm |
| 10,000 | 60,000 | 2.5m × 2.5m | ~1.5 m |
| 65,000 | 390,000 | 6.4m × 6.4m | ~3 m |

At 10K cells, the fabric is a **ground-penetrating magnetometer** that can detect buried metal objects (pipes, mines, cables) at 1.5 meter depth while crawling over terrain.

The sensor density also enables **magnetic field tomography**: reconstructing the 3D distribution of magnetic sources from the 2D surface measurements (an inverse problem, solvable with the distributed computing mesh).

---

## 6. Smart Energy Micro-Grid

### Physical Basis

Each cell harvests energy (solar, vibration, impact) and stores it in a supercapacitor. Inductive coupling between bonded cells allows energy transfer. The ε-graph IS the power distribution network.

### Transfer Rate

Inductive coupling efficiency between adjacent cells:

```
η_transfer ≈ k² · Q₁ · Q₂ / (1 + k² · Q₁ · Q₂)
```

where k is the coupling coefficient (~0.3 for adjacent coils) and Q is the quality factor (~10 for small coils). This gives η ≈ 50% per hop.

**Effective transfer rate**: ~50 mW per bond at ~50% efficiency = 25 mW delivered per hop.

### Collective Energy

| Cells | Total stored energy | Total harvest (outdoor) | Equivalent battery |
|-------|--------------------|-----------------------|-------------------|
| 100 | 54.5 J | 200 mW | AA battery (⅓) |
| 1,000 | 545 J | 2 W | AA battery (×3) |
| 10,000 | 5,450 J | 20 W | Phone battery |
| 65,000 | 35,400 J | 130 W | Laptop battery |

A 65,000-cell fabric harvests **130 watts** in direct sunlight — enough to charge a laptop. The fabric is a solar panel that can also walk, think, and reshape itself.

### Energy Concentration

The fabric can route energy from many cells to a few cells. For a 10K-cell fabric focusing energy into a 20-cell runway for a coilgun shot:

```
Available energy: up to 5,450 J (if fully charged)
Transfer losses over average 50 hops at 50%/hop: 0.5^50 ≈ 0 (too many hops)
```

This reveals a real constraint: energy can't efficiently traverse more than ~5-10 hops. But cells within 5 hops of the runway (perhaps 100-200 cells) can contribute:

```
Usable energy for runway: 200 cells × 545 mJ × 50% = 54.5 J
```

This is a LOT. A 0.1g projectile with 54.5 J of kinetic energy:

```
v = √(2E/m) = √(2 × 54.5 / 0.0001) = √1,090,000 ≈ 1,044 m/s
```

That's **supersonic** (Mach 3). Now, practical efficiency losses and air resistance inside the channel would reduce this dramatically — but it shows the energy budget supports velocities far beyond what we initially calculated.

---

## 7. Distributed Computing Mesh

### Physical Basis

Each ESP32-C3 runs at 160 MHz with 400 KB SRAM. The ε-graph provides nearest-neighbor communication at ~1 kbps (inductive) or potentially faster via direct electrical contact through face connections.

### Aggregate Performance

| Cells | Clock cycles/sec | Total SRAM | Equivalent |
|-------|-----------------|-----------|-----------|
| 100 | 16 GHz | 40 MB | Old smartphone |
| 1,000 | 160 GHz | 400 MB | Modern laptop core |
| 10,000 | 1.6 THz | 4 GB | Workstation |
| 65,000 | 10.4 THz | 26 GB | Small server |

**Model parallelism for neural networks**: If each cell hosts a 44KB policy network (Section 9 of the Foundations doc), the collective fabric runs:

```
Total parameters: N × 44,544 ≈ N × 45K parameters
```

| Cells | Distributed model size | Comparable to |
|-------|----------------------|---------------|
| 1,000 | 45M parameters | GPT-2 small |
| 10,000 | 450M parameters | GPT-2 XL / LLaMA-small |
| 65,000 | 2.9B parameters | LLaMA-3B |

A 65K-cell fabric could theoretically run a **3-billion parameter model** distributed across its mesh — IF the inter-cell communication bandwidth is sufficient for inference. The bottleneck is the ~1 kbps inductive link; face connections with direct electrical contact could potentially achieve 1+ Mbps, making distributed inference of medium-sized models genuinely feasible.

This means the fabric might not need an external LLM at scale. A 65K-cell fabric could potentially host its own language-capable model, achieving the "every cell is intelligent" vision through collective computation rather than per-cell capability.

### Communication Topology

The ε-graph's bounded degree (≤6) means the mesh has the topology of a 3D lattice with ~6 neighbors per node. This is well-suited for:
- Stencil computations (physics simulation, image processing)
- Gossip protocols (distributed consensus)
- Gradient-based optimization (each cell computes local gradient, communicates with neighbors)

---

## 8. Physical Unclonable Function (PUF) / Cryptographic Identity

### Physical Basis

Each cell has a unique UUID. The exact configuration (which UUID at which position, connected to whom, in what mode) is a high-entropy state.

### Entropy

```
State space per cell: UUID (16 bit) × position (continuous) × σ (10 modes) × ε (variable)
```

For a conservative discrete approximation:

```
Bits per cell ≈ 16 (UUID) + 4 (σ mode) + 6 (which zones connected) = 26 bits
Total entropy: N × 26 bits
```

| Cells | Configuration entropy | Equivalent security |
|-------|----------------------|-------------------|
| 100 | 2,600 bits | > RSA-2048 |
| 1,000 | 26,000 bits | Astronomically beyond any brute force |
| 10,000 | 260,000 bits | — |

The fabric's physical configuration is a **cryptographic key** that can't be cloned without physically replicating the exact arrangement of cells. Authentication protocol:

1. Challenger sends a random stimulus (e.g., "report the σ modes of cells at these 50 random UUIDs")
2. Fabric responds with the current state
3. Challenger verifies against the expected configuration

This is unforgeable without possessing the actual fabric.

---

## 9. Programmable Airflow / Filtration

### Physical Basis

Cells in flex mode with extended stems create gaps between crossbars. Cells in rigid mode with retracted stems close gaps. The fabric is a **surface with programmable porosity**.

### Gap Control

Gap size between adjacent crossbars:

```
gap = L_cell - L_cb - (2 × stem_extension × (L_st_max - L_st_min))
```

For 25mm cells: gap ranges from ~0mm (fully closed) to ~15mm (fully open).

### Airflow

Airflow through a porous surface:

```
Q = (ΔP · A_open) / (ρ · v_air)    (simplified)
```

The fabric can control:
- **Which zones are open vs closed**: directional ventilation
- **Gap size per cell**: graduated porosity
- **Dynamic opening/closing**: pulsed airflow, like breathing

### Applications at Scale

| Cells | Surface area | Application |
|-------|-------------|-------------|
| 100 | ~60 cm² | Wearable ventilation patch |
| 1,000 | ~600 cm² | Jacket panel with adaptive breathability |
| 10,000 | ~6,000 cm² | Tent wall with climate control |
| 65,000 | ~40,000 cm² | Building facade with dynamic ventilation |

---

## 10. Ballistic Self-Deployment / Fabric Mitosis

### Physical Basis

Magnetic peristalsis with pre-configured timing becomes a coilgun (see *Mathematical Foundations*, Section 6.2). Combined with the fabric's self-assembly capability, this enables the fabric to eject packets of cells that reassemble at the landing site.

### Performance (Pre-Configured Runway)

With pre-computed firing times, the speed limit is magnet switching time, not sense-decide-act latency:

| Mechanism | Switch time | Max projectile speed (25mm cells) |
|-----------|-----------|----------------------------------|
| SMA | ~100 ms | ~0.25 m/s (too slow for ballistic) |
| Electromagnet | ~1 ms | ~25 m/s |
| MOSFET coil | ~10 μs | ~2,500 m/s (theoretical, other limits dominate) |
| Hybrid + spring assist | ~1 ms | ~35 m/s (EM + elastic) |

### Ballistic Range

For a 10-cell packet (4g) launched at 20 m/s at 45° elevation:

```
Range_vacuum = v² · sin(2θ) / g = 400 / 9.81 ≈ 41 m
```

With air resistance (drag coefficient ~0.5, cross-section ~4 cm²):

```
Range_actual ≈ 15–25 m
```

### Self-Assembly After Landing

Timeline:
1. **T+0**: Packet impacts surface, cells scatter within ~50cm radius
2. **T+0.1s**: Each cell activates, senses magnetic field (passive — other cells' permanent magnets)
3. **T+0.5s**: Nearest pairs attract and bond (passive magnetic attraction, zero power)
4. **T+2s**: Small clusters form (3-6 cells), policy networks activate
5. **T+5s**: Clusters merge into a functional mini-fabric
6. **T+10s**: Mini-fabric establishes communication with main fabric (via comm cell in the packet or via phased array)
7. **T+30s**: Mini-fabric begins autonomous operations (locomotion toward target, anchoring)

### Scaling

| Runway length | Packet size | Range | Landing fabric | Time to reassemble |
|--------------|-------------|-------|---------------|-------------------|
| 20 cells | 5 cells | ~5 m | Triangle patch | ~5 s |
| 50 cells | 20 cells | ~15 m | 3 hexagons | ~10 s |
| 100 cells | 50 cells | ~25 m | Small sheet | ~20 s |

---

## 11. Combined Capabilities: The Multiplicative Explosion

The truly extraordinary property of Seshat Fabric is not any single capability — it is that **all capabilities coexist in the same material simultaneously** and can be combined freely.

### Pairwise Combinations

| Capability A | + Capability B | = Combined Effect |
|-------------|---------------|-------------------|
| Echolocation | + Coilgun | Acoustically-guided projectile launch — "see" target, shoot at it |
| Phased array | + Locomotion | Mobile radar platform — the fabric crawls to a vantage point and scans |
| Metamaterial | + Acoustic | Programmable acoustic cloak — redirect sound around a protected zone |
| Energy grid | + Catapult | Collective spring loading — concentrate stored elastic energy for a massive jump |
| Magnetometer | + Locomotion | Autonomous mine detection — fabric crawls across terrain, maps metal objects |
| Mitosis | + Computing mesh | Self-replicating computing network — eject sub-fabrics that each carry compute capability |
| Phased array | + Mitosis | Deploy relay nodes — eject cells to positions that extend communication range |
| Echolocation | + Metamaterial | Active acoustic camouflage — sense incoming sound, reshape to absorb/redirect |
| Catapult | + Mitosis | Jump + split — fabric leaps into the air and splits into multiple independent fabrics mid-flight |
| Magnetometer | + Coilgun | Magnetic target acquisition — detect ferromagnetic object, launch projectile at it |

### Triple Combinations

| A | + B | + C | = Effect |
|---|-----|-----|----------|
| Camera | + Phased array | + Computing mesh | Distributed sensor fusion: optical + radar + computation = comprehensive situational awareness |
| Echolocation | + Metamaterial | + Energy grid | Active sonar cloak: detect incoming sonar ping, compute required response, reshape to cancel reflection, powered by collective energy |
| Mitosis | + Computing mesh | + Policy network | Von Neumann self-replicating machines: eject sub-fabrics that carry sufficient compute to plan their own actions and further replicate |
| Locomotion | + Catapult | + Magnetometer | Terrain-adaptive explorer: crawl normally, jump over obstacles, detect buried objects, map as it goes |

### The Scaling Inflection

Below ~1,000 cells, most capabilities are individually modest. The fabric is a useful reconfigurable material with some sensing and actuation.

Above ~10,000 cells, capabilities begin to reinforce each other:

**10,000 cells — "Smart Material":**
- Phased array with radio-telescope-class gain
- Echolocation range of 100m
- 1.6 THz aggregate computing
- 7.2 kJ elastic energy storage
- 450M-parameter distributed neural network
- 20W continuous solar harvesting
- Ground-penetrating magnetometer
- Supersonic coilgun capability (energy-limited, not hardware-limited)
- 25m ballistic self-deployment range

**65,000 cells — "Autonomous Entity":**
- Phased array exceeding military-grade installations
- Acoustic output rivaling industrial equipment
- 10 THz computing (hosts its own LLM)
- 47 kJ elastic storage (building-jump energy)
- 130W solar harvest (laptop-class power)
- 3B-parameter distributed model (language-capable)
- Could potentially host its own intelligence without external compute

The transition from "smart material" to "autonomous entity" happens somewhere between 10K and 65K cells. This is not a designed threshold — it emerges from the scaling laws of the individual capabilities converging.

---

## 12. Constraints and Failure Modes

These emergent capabilities are real, but they have limits:

### Communication Bandwidth

The ε-graph communication link (~1 kbps inductive) is the primary bottleneck for:
- Distributed computing (data movement between cells is slow)
- Phased array calibration (requires precise phase synchronization)
- Collective coordination at large scale

**Mitigation**: Face connections with direct electrical contact could achieve 1+ Mbps. Dedicated comm cells with BLE/WiFi provide out-of-band coordination.

### Thermal Management

High-power modes (coilgun, acoustic output, phased array transmit) generate heat. Cells have no active cooling. For sustained high-power operation:

```
T_rise = P_dissipated / (h · A_surface)
```

At 10 mW per cell with natural convection: ΔT ≈ 5°C (manageable). At 100 mW per cell (burst mode): ΔT ≈ 50°C (approaching N42 magnet derating at 80°C). Thermal duty cycling is required.

### Structural Limits Under Recoil

The coilgun exerts reaction forces on the runway cells. For a 0.1g projectile at 100 m/s:

```
Impulse = m · v = 0.01 N·s
```

Distributed across 50 runway cells over 10ms: F_per_cell = 0.02 N (negligible compared to ~4N bond strength).

But at higher velocities or heavier projectiles, recoil becomes a real constraint *for a static barrel*. Launching a 10g projectile at 100 m/s requires 1 N·s impulse — potentially enough to disrupt the runway structure.

**Dynamic resolution (Dismantling Principle)**: The [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) framework (Theorem 1.1) shows that if the barrel dismantles from the rear — each cell breaking its bonds immediately after the projectile passes — the recoil impulse is distributed as p/N per cell, with each cell absorbing its share independently rather than transmitting it through bonds. A 20-cell barrel launching a 0.1g projectile at 40 m/s gives each cell a recoil velocity of only ~2.5 m/s (walking speed), with per-cell energy of ~0.25 μJ — trivially recaptured on magnetic reconnection. The recoil constraint evaporates for dismantling barrels.

### Energy Recovery Time

After a burst operation (coilgun shot, jump, high-power sensing), the fabric must recharge. At 20W harvest (10K cells, outdoor):

```
Recharge time = E_expended / P_harvest
```

Depleting 50% of stored energy (2,725 J) requires ~136 seconds (~2.3 minutes) to recover. The fabric operates in a burst-recover-burst cycle for high-energy operations.

### Coordination Latency

At 50ms per hop for BLE (Layer 1) propagation, a 100-hop-diameter fabric has 5-second awareness latency from edge to edge. However, the three-layer communication architecture (see [T-PIECE-SPEC Section 6](./fabrication/T-PIECE-SPEC.md)) changes this picture:

- **Layer 1 (BLE, ~ms/hop)**: 5s across 100 hops. Used for configuration and logistics, not real-time control.
- **Layer 2 (Wired UART, ~μs/hop)**: 10ms across 100 hops. Adequate for sensor streaming, distributed compute, and cerebellar inference.
- **Layer 3 (Trigger, ~ns/hop)**: ~1μs across 100 hops. Provides the synchronized "fire" signal for time-critical operations (coilgun, sound synthesis, impact response).

The real-time bottleneck is Layer 2, not Layer 1. Hierarchical coordination (local clusters act autonomously via cell reflex policies, cluster coordinators at 100 Hz, SBC strategist at 10 Hz — see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) Section 3.4) further reduces the effective coordination latency.

---

## 13. Open Research Directions

Each emergent capability opens research questions that could sustain dedicated investigation:

1. **Phased array optimization**: What is the optimal coil geometry for dual-use (bonding + antenna)? Can the array calibrate itself using the ε-graph for phase reference distribution?

2. **Acoustic metamaterial design**: What cell configurations achieve acoustic cloaking? Can the fabric compute the required configuration in real-time as sound sources move?

3. **Distributed inference**: What neural network architectures partition efficiently across a bounded-degree mesh with low-bandwidth links? Can attention mechanisms be approximated with local message passing?

4. **Energy routing optimization**: What algorithms minimize loss when concentrating energy from many cells to few? Is there a maximum useful concentration distance?

5. **Ballistic self-assembly**: What packet configurations survive impact best? Should cells be launched as a bonded cluster or as individual cells with staggered timing?

6. **Combined capability scheduling**: When multiple capabilities compete for the same hardware (coils, MCU cycles, energy), how should the fabric allocate resources? This is a real-time multi-objective optimization problem running on the distributed computing mesh.

7. **Scaling transitions**: Is the "smart material → autonomous entity" transition at 10K–65K cells sharp or gradual? Are there intermediate phase transitions?

---

*Each capability in this document deserves deeper investigation. The mathematical foundations (bond forces, wave propagation, energy budgets, coordinate space) are established in the companion document. The dynamic cognition framework shows that capabilities previously constrained by static analysis become feasible under flow-based analysis. This document maps the territory of what the foundations imply. The territory is large.*

*See also:*
- *[MATHEMATICAL-FOUNDATIONS.md](./MATHEMATICAL-FOUNDATIONS.md) — Physics and axiom system*
- *[DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md) — Persistence Axiom, Cerebellar Model, operator-fabric coupling, revised capability analysis*
- *[BUILD-ROADMAP.md](./BUILD-ROADMAP.md) — Practical build sequence from first cell to deployable platform*
- *[T-PIECE-SPEC.md](./fabrication/T-PIECE-SPEC.md) — Cell geometry, connection zones, electrical contact architecture*
- *[MAGNETIC-MODEL.md](./physics/MAGNETIC-MODEL.md) — Force calculations and switching options*
