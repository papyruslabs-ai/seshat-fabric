# Seshat Fabric: Capacitive Deionization for Water Purification

**Turning a Programmable Electromagnetic Lattice into a Self-Powered Desalination System**

Version 0.2 — March 2026

*Companion to [EMERGENT-CAPABILITIES.md](../EMERGENT-CAPABILITIES.md) | Physics: [POWER-BUDGET.md](../physics/POWER-BUDGET.md) | Cell spec: [T-PIECE-SPEC.md](../fabrication/T-PIECE-SPEC.md)*

---

## 0. Summary

The Seshat Fabric's existing architecture — programmable electromagnetic elements, variable porosity, distributed computing, and solar energy harvesting — is one material addition away from functioning as a **capacitive deionization (CDI) water purification system**. Coating the crossbar face connections with activated carbon (~0.1mm thick) turns every inter-polygon bond into an electrode pair. Water flows through the programmable gaps between crossbars. Voltage applied across adjacent cells attracts dissolved salt ions to the electrode surfaces. The distributed computing mesh orchestrates adsorption/desorption cycles in traveling waves for continuous output.

**What's needed beyond existing primitives**: Activated carbon electrode coating on crossbar faces. One material, applied during manufacturing. No new electronics, no new actuators, no new communication.

**What the fabric provides that no existing CDI system has**: A spatially programmable electrode array with integrated sensing, computing, and energy harvesting — the system measures salinity at every cell, optimizes its own cycling in real-time, and powers itself from sunlight.

### The Two Scales

The fabric targets **two cell sizes** with distinct roles:

| | 6mm Cell | 12mm Cell |
|---|---------|-----------|
| **MCU** | Small (ATtiny/RISC-V class) | Larger (ESP32-C3 class) |
| **Max network** | ~65,000 cells | Unlimited (hundreds of millions+) |
| **Role** | Nervous system — fast Layer 3 communication, dense sensing, modest compute | Compute + CDI workhorse — processing, heavy desalination, datacenter at scale |
| **Energy harvest** | 120 uW/cell outdoor solar | 480 uW/cell outdoor solar |
| **Design relationship** | 12mm = exactly 2x the 6mm (tiles naturally) | — |

These two scales **interweave**: 12mm cells form the structural and computational backbone, 6mm cells fill the gaps as a fast-signaling nervous system with denser electrode packing. The 2:1 ratio is intentional — four 6mm cells tile into one 12mm cell footprint.

### Performance at Scale

| Configuration | Salt Removal/Hr | Brackish (2 g/L) | Seawater (35 g/L) | Solar Harvest |
|--------------|----------------|-------------------|-------------------|--------------|
| 6mm, 65K cells (wearable) | 3.5 g | 2.3 L/hr | ~0.1 L/hr (multi-pass) | 7.8 W |
| 12mm, 100K cells (field unit) | 16.2 g | 10.8 L/hr | ~0.5 L/hr | 48 W |
| 12mm, 1M cells (installation) | 162 g | 108 L/hr | 4.7 L/hr | 480 W |
| 12mm, 100M cells (infrastructure) | 16.2 kg | 10,800 L/hr | 470 L/hr | 48 kW |
| 12mm, 1B cells (municipal) | 162 kg | 108,000 L/hr | 4,700 L/hr | 480 kW |

At 12mm and 1 billion cells with MCDI enhancement (Section 8): **270,000 L/hr from brackish sources** — enough to supply a small city. From seawater: **11,750 L/hr**. Self-powered. Self-maintaining. Self-optimizing.

---

## 1. Physical Basis: Capacitive Deionization

### 1.1 How CDI Works

Capacitive deionization removes dissolved ions from water using electrostatic attraction. It is the electrochemical equivalent of the fabric's magnetic attraction — but for ions instead of cells.

```
     Cathode (-)              Anode (+)
    +----------+            +----------+
    | ======== |  Na+ >>    | ======== |
    | activated|  << Cl-    | activated|
    | carbon   |            | carbon   |
    +----------+            +----------+
         ^                       ^
    V- applied              V+ applied
         |                       |
    Feed water flows between electrodes
```

1. **Adsorption phase**: Apply voltage (0.8-1.2V) across electrode pair. Na+ ions migrate to the cathode, Cl- ions migrate to the anode. Both are held on the high-surface-area carbon by electrostatic attraction.
2. **Desorption phase**: Remove voltage (or reverse polarity). Ions release from the electrode surfaces.
3. **Flush phase**: Flow brine (ion-concentrated water) out. Channel is clear for the next adsorption cycle.

### 1.2 Why CDI Fits the Fabric

CDI requires exactly three things the fabric already has, plus one it doesn't:

| Requirement | Fabric Primitive | Status |
|-------------|-----------------|--------|
| Electrode pairs at controlled spacing | F_TOP face connections (parallel crossbars) | Existing |
| Controllable voltage (0.8-1.2V per pair) | V+ power bus + MCU-controlled charge | Existing |
| Flow channels with variable geometry | Stem extension controls gap width | Existing |
| High-surface-area electrode material | — | **Needs activated carbon coating** |

The one addition — activated carbon — is a coating, not a component. It's applied to the crossbar faces during manufacturing, the same way magnets are press-fit into bores. No new PCB traces, no new ICs, no new firmware architecture.

### 1.3 Why Not Reverse Osmosis?

RO requires 55-80 bar pressure. The fabric can't generate that. CDI operates at atmospheric pressure with <2V electrical potential — well within what the fabric already handles. CDI is the natural electrochemical mode for a programmable electromagnetic lattice.

### 1.4 Why Smaller Cells Are Better for CDI

Optimal CDI electrode spacing is 0.5-2.0 mm. At the 6mm and 12mm cell scales, the natural F_TOP gap falls directly into this range — smaller cells produce tighter, more efficient electrode pairs without needing to force the geometry. The 25mm cell's F_TOP gap tends toward the upper end of the useful range; at 6mm, the gap is naturally in the sweet spot.

Additionally, smaller cells pack more electrode pairs per unit area. Four 6mm cells fit in one 12mm cell's footprint, providing ~33% more total electrode surface area with 4x the sensing resolution.

---

## 2. Dual-Scale Architecture

This is the key architectural concept: the two cell sizes serve fundamentally different roles.

### 2.1 The 6mm Nervous System

The 6mm cell is small — limited to a modest MCU, capping at ~65,000 cells in a single coordinated network. What it lacks in individual compute it makes up in density and speed:

- **Fast Layer 3 communication**: More cells per meter means more hops but shorter per-hop latency. The TRIG layer propagates signals across a 6mm lattice in microseconds.
- **Dense electrode packing**: 4x the electrode pairs per unit area vs 12mm.
- **Fine-grained sensing**: Conductivity measured at 6mm intervals — the salinity map resolution approaches millimeter scale.
- **Human energy harvesting**: A 6mm fabric worn around the torso picks up body heat, vibration from breathing and movement. At 65K cells, even a few microwatts per cell from body heat adds up.
- **Wearable form factor**: 65K cells at 6mm spacing → approximately a 1.5m x 1.5m sheet, or a multi-layer vest/belt worn on the body.

The 6mm layer is the peripheral nervous system of the fabric — it senses fast, signals fast, and provides dense coverage.

### 2.2 The 12mm Compute/CDI Workhorse

The 12mm cell fits an ESP32-C3-class MCU with real computing power. No cell-count ceiling. This is where the heavy lifting happens:

- **Compute**: Each ESP32-C3 runs at ~160 MHz with 400 KB SRAM. At 1M cells: 160 THz aggregate compute, 400 GB distributed SRAM. At 1B cells: 160 PHz, 400 TB — supercomputer class.
- **CDI capacity**: 3x the electrode area per cell vs 6mm. These cells do the bulk of salt removal.
- **Coordination**: The 12mm MCUs run the wave-mode CDI algorithm, salinity optimization, and fabric-wide coordination. They are the brain; the 6mm cells are the nerves.
- **Unlimited scaling**: From 10K cells (field unit) to 1B cells (municipal infrastructure). Same architecture, same firmware, same patterns.

### 2.3 Interweaving

The 12mm cell is exactly 2x the 6mm cell. This is not coincidence — it enables natural tiling:

```
Interweaved fabric (top view, one layer):

  [  12mm  ] [6] [6] [  12mm  ] [6] [6]
  [6] [6] [6] [6] [6] [6] [6] [6] [6] [6]
  [  12mm  ] [6] [6] [  12mm  ] [6] [6]
  [6] [6] [6] [6] [6] [6] [6] [6] [6] [6]

12mm cells: structural backbone, compute, CDI heavy-lift
6mm cells:  infill, fast signaling, dense sensing, supplementary CDI
```

Benefits of interweaving:
- **Electrode density**: The 6mm infill adds ~33% more electrode area to a 12mm-only lattice.
- **Signal speed**: 6mm cells relay L3 TRIG signals between 12mm cells faster than the 12mm cells could alone.
- **Sensing resolution**: Conductivity readings at 6mm intervals within a 12mm computational framework.
- **Graceful scaling**: A wearable starts as pure 6mm. A field unit adds 12mm backbone. Infrastructure is mostly 12mm with 6mm nervous system.

### 2.4 Roles Are Not Permanent

Like drone roles in seshat-swarm, cell roles are coordinates (chi values), not hardware properties. A 12mm cell currently doing CDI can switch to pure compute. A 6mm cell currently sensing can switch to CDI electrode duty. The dual-scale architecture assigns roles dynamically based on current needs — the catalog determines what each cell size can do, constraint satisfaction determines what it should do right now.

---

## 3. Electrode Architecture

### 3.1 Exploiting the F_TOP Geometry

When two polygons share an edge, their crossbars are parallel:

```
Polygon A:   --- CB_a ---     F_TOP_a coated with activated carbon
                  ^^^          water flows through this gap
Polygon B:   --- CB_b ---     F_TOP_b coated with activated carbon
```

This is already the CDI cell geometry. The crossbar length provides the electrode length. The crossbar face height provides the electrode width. The gap between them is controlled by the stem extension and the magnetic bond strength.

### 3.2 Electrode Dimensions by Cell Size

**Material**: Activated carbon (AC). Alternatives: carbon aerogel, reduced graphene oxide (rGO), or MXene — all with higher specific capacitance but also higher cost. AC is the pragmatic choice for initial implementation.

| Parameter | 6mm Cell | 12mm Cell |
|-----------|---------|-----------|
| Crossbar length | 6 mm | 12 mm |
| Crossbar face height | ~1.0 mm | ~1.5 mm |
| Geometric area per cell (F_TOP) | 6 mm^2 (0.06 cm^2) | 18 mm^2 (0.18 cm^2) |
| Coating thickness | 0.1 mm | 0.1 mm |
| Coating density | 0.5 g/cm^3 | 0.5 g/cm^3 |
| AC mass per cell | 0.3 mg | 0.9 mg |
| Specific surface area (AC) | 1,000 m^2/g | 1,000 m^2/g |
| Effective surface area per cell | 0.3 m^2 | 0.9 m^2 |
| Salt adsorption capacity | 10-20 mg NaCl/g AC | 10-20 mg NaCl/g AC |
| Salt removed per cell per cycle | ~0.0045 mg | ~0.0135 mg |

**Application method**: Slurry coating. Mix AC powder with PVDF binder (5-10 wt%) in NMP solvent. Doctor-blade coat onto crossbar faces at 0.1mm wet thickness. Dry at 60C. This is standard CDI electrode fabrication — no exotic process.

**Which faces get coated**: Only F_TOP (the inter-polygon face). EP_L, EP_R, and ST_TIP retain their magnetic/electrical contact function unmodified. F_LEFT and F_RIGHT are available for 3D assembly or could be coated for additional electrode area in volumetric configurations.

### 3.3 Electrode Spacing (Gap Control)

CDI performance depends on electrode spacing. Closer = faster ion transport but higher flow resistance. The fabric controls this via stem extension.

**6mm cells** — naturally tight gaps:

| Configuration | Gap | Flow Rate | Ion Transport Time | Use Case |
|--------------|-----|-----------|-------------------|----------|
| Tight bond | 0.1-0.2 mm | Very low | <1 s | High-concentration, slow pass |
| Normal bond | 0.3-0.8 mm | Medium | ~3 s | Brackish water, standard |
| Loose bond | 1.0-2.0 mm | High | ~10 s | Pre-filter, high flow |

**12mm cells** — slightly wider:

| Configuration | Gap | Flow Rate | Ion Transport Time | Use Case |
|--------------|-----|-----------|-------------------|----------|
| Tight bond | 0.2-0.4 mm | Low | ~2 s | High-salinity, slow pass |
| Normal bond | 0.5-1.5 mm | Medium | ~8 s | Brackish water, standard |
| Loose bond | 2.0-3.0 mm | High | ~30 s | Pre-filter, high flow |

**Both cell sizes fall within the optimal CDI range (0.5-2.0 mm) at normal bond spacing.** The 6mm cells' tighter gaps actually provide faster ion transport — ideal for rapid cycling.

The fabric can **dynamically adjust gap width** during operation — tighter gaps in high-salinity zones, wider gaps where water is already clean. No existing CDI system can do this.

---

## 4. System Configuration

### 4.1 Flow-Through Sheet

The simplest configuration: a flat fabric sheet with water flowing across its surface through the inter-polygon gaps.

```
Water input (brackish)
    v v v v v v v v v
+===+===+===+===+===+    Row A: Cathode (-V)
| ^ | ^ | ^ | ^ | ^ |    (triangles = polygons, edges = crossbars)
+===+===+===+===+===+    <- Water flows through F_TOP gaps
| ^ | ^ | ^ | ^ | ^ |    Row B: Anode (+V)
+===+===+===+===+===+    <- Water flows through F_TOP gaps
| ^ | ^ | ^ | ^ | ^ |    Row C: Cathode (-V)
+===+===+===+===+===+
| ^ | ^ | ^ | ^ | ^ |    Row D: Anode (+V)
+===+===+===+===+===+
    v v v v v v v v v
Water output (purified)
```

Alternating rows are charged as cathode and anode. Each inter-row gap is a CDI cell. Water passes through multiple electrode pairs in series, removing more salt with each pass.

In an interweaved sheet, 12mm cells form the primary electrode rows while 6mm cells fill in between — providing supplementary electrode area and fine-grained conductivity readings between the main CDI stages.

### 4.2 Rolled Tube

For higher throughput: roll the flat sheet into a tube. Water flows through the tube interior, passing through concentric electrode rings.

```
Cross-section:

        +--- Outer wall (cathode) ---+
       /                               \
      |  +--- Inner ring (anode) ---+   |
      | |                            |  |
      | |     Water flow (axial)     |  |
      | |         >>>>>>>            |  |
      |  +------- ----------------+    |
       \                               /
        +-----------------------------+
```

The tube configuration provides:
- Gravity-assisted flow (tilt the tube)
- Multiple concentric electrode pairs for multi-stage treatment
- Natural containment (the fabric IS the pipe)
- Self-supporting structure (the fabric's rigidity holds the tube shape)

At 12mm cell scale, a tube with 30cm diameter and 1m length contains ~8,000 cells — enough for a useful field purifier.

### 4.3 Folded Accordion (Maximum Surface Area)

For maximum electrode area in minimum footprint: fold the fabric in an accordion pattern.

```
Side view:

    <---- Water in ---->
    +=====+         +=====+
    | +   | gap(-) | +   |
    |     +========+     |
    | +   | gap(-) | +   |
    |     +========+     |
    | +   | gap(-) | +   |
    +=====+         +=====+
    <-- Water out (clean) -->
```

Each fold doubles the electrode area per unit footprint. A 10-fold accordion with 100K 12mm cells has the electrode area of a 1M-cell flat sheet in 1/10th the floor space.

---

## 5. Performance Analysis

### 5.1 Salt Removal Rate

Using the electrode parameters from Section 3.2 (midpoint estimate: 15 mg NaCl/g AC):

```
Salt removed per cell per cycle = AC_mass x adsorption_capacity

6mm cell:  0.3 mg x 15 mg/g = 0.0045 mg/cycle
12mm cell: 0.9 mg x 15 mg/g = 0.0135 mg/cycle
```

**Cycle time**: Adsorption (2-5 min) + desorption (1-2 min) + flush (0.5-1 min) = **4-8 minutes per cycle**. Using 5 minutes as the working estimate (12 cycles/hour).

### 5.2 6mm Cell Performance (Wearable/Nervous System Scale)

| Cell Count | Salt/Cycle | Salt/Hour | Brackish (2->0.5 g/L) | Daily (8hr) | Solar |
|-----------|-----------|-----------|----------------------|-------------|-------|
| 1,000 | 4.5 mg | 54 mg | 0.04 L/hr | 0.3 L | 0.12 W |
| 10,000 | 45 mg | 540 mg | 0.36 L/hr | 2.9 L | 1.2 W |
| 65,000 (max) | 293 mg | 3,510 mg | 2.3 L/hr | 18.7 L | 7.8 W |

At 65K cells, the 6mm fabric produces **2.3 L/hr from brackish water** — enough to keep one person hydrated in the field. Worn as a torso wrap or carried in a pack, this is a self-powered personal water purifier.

### 5.3 12mm Cell Performance (Workhorse Scale)

| Cell Count | Salt/Cycle | Salt/Hour | Brackish (2->0.5 g/L) | Seawater (35->0.5 g/L) | Solar |
|-----------|-----------|-----------|----------------------|----------------------|-------|
| 10,000 | 135 mg | 1.62 g | 1.1 L/hr | 0.047 L/hr | 4.8 W |
| 100,000 | 1,350 mg | 16.2 g | 10.8 L/hr | 0.47 L/hr | 48 W |
| 1,000,000 | 13.5 g | 162 g | 108 L/hr | 4.7 L/hr | 480 W |
| 10,000,000 | 135 g | 1.62 kg | 1,080 L/hr | 47 L/hr | 4.8 kW |
| 100,000,000 | 1.35 kg | 16.2 kg | 10,800 L/hr | 470 L/hr | 48 kW |
| 1,000,000,000 | 13.5 kg | 162 kg | 108,000 L/hr | 4,700 L/hr | 480 kW |

**Key milestones**:
- **100K cells**: Sustains a village (10.8 L/hr brackish = ~86 L/day = 40+ people)
- **1M cells**: Small community (108 L/hr = 864 L/day from brackish)
- **100M cells**: Small town from brackish (10,800 L/hr = 86,400 L/day), or 470 L/hr from seawater
- **1B cells**: Municipal supply from seawater (4,700 L/hr = ~113,000 L/day, or ~280,000 L/day with MCDI)

### 5.4 Energy Requirements

CDI energy per cell per cycle:

```
C_cell = specific_capacitance x AC_mass
E_cycle = 1/2 x C_cell x V^2 x (1/eta_charge)

6mm:  C = 75 F/g x 0.0003 g = 0.0225 F  ->  E = 0.020 J/cycle
12mm: C = 75 F/g x 0.0009 g = 0.0675 F  ->  E = 0.061 J/cycle
```

**CDI-specific power per cell** (at 12 cycles/hr):

| Cell Size | CDI Energy/Cycle | CDI Power | Solar Harvest (outdoor) | CDI Balance |
|-----------|-----------------|-----------|------------------------|-------------|
| 6mm | 0.020 J | 67 uW | 120 uW | **+53 uW** |
| 12mm | 0.061 J | 200 uW | 480 uW | **+280 uW** |

**CDI is energy-positive at both cell sizes in direct sunlight.** The surplus powers the MCUs, communication, and computing mesh.

CDI operating mode is closer to Tier 1 than Tier 2: the MCU wakes briefly (~200 ms per 5-minute cycle) to set electrode voltage and read conductivity, then returns to deep sleep. The electrode holds charge passively during adsorption. This is why CDI maps so naturally to the fabric's power profile.

**Aggregate power balance at scale**:

| Configuration | CDI Power | Solar Harvest | Surplus |
|--------------|----------|---------------|---------|
| 6mm, 65K | 4.3 W | 7.8 W | +3.5 W |
| 12mm, 100K | 20 W | 48 W | +28 W |
| 12mm, 1M | 200 W | 480 W | +280 W |
| 12mm, 100M | 20 kW | 48 kW | +28 kW |
| 12mm, 1B | 200 kW | 480 kW | +280 kW |

At every scale, the fabric harvests more solar energy than CDI consumes. The surplus runs the computing mesh, communication, and all other fabric capabilities.

### 5.5 Comparison to Existing CDI Systems

| Parameter | Lab CDI Stack | Commercial CDI (Voltea) | Seshat Fabric |
|-----------|-------------|----------------------|--------------|
| Electrode area | Fixed | Fixed | **Programmable** |
| Electrode spacing | Fixed (0.5-1mm) | Fixed | **Dynamic (0.1-3mm)** |
| Flow routing | Fixed channels | Fixed channels | **Adaptive, self-routing** |
| Salinity sensing | External sensor | External sensor | **Every electrode is a sensor** |
| Cycle optimization | Pre-set timers | Pre-set | **Real-time per-cell optimization** |
| Energy source | Grid power | Grid power | **Self-powered (solar)** |
| Portability | Lab bench | Cabinet | **Rolls up, worn on body** |
| Self-cleaning | Manual | Chemical flush | **Reconfigure around fouled zones** |
| Scaling | Fixed | Fixed | **6mm wearable to 1B-cell municipal** |
| Concurrent compute | None | None | **Distributed supercomputer** |

---

## 6. Wave-Mode Operation

### 6.1 The Traveling CDI Wave

The fabric's key advantage over static CDI: cells don't all cycle simultaneously. Instead, adsorption/desorption/flush cycles propagate as **traveling waves** through the fabric, exactly like peristaltic cell transport.

```
Time T:
  Zone A: [ADSORB ======] -> removing salt
  Zone B: [DESORB ......] -> releasing brine
  Zone C: [FLUSH  ------] -> clearing channel
  Zone D: [ADSORB ======] -> removing salt

Time T + dt:
  Zone A: [FLUSH  ------]
  Zone B: [ADSORB ======]
  Zone C: [DESORB ......]
  Zone D: [FLUSH  ------]
```

At any moment:
- ~40% of cells are adsorbing (removing salt from feed water)
- ~30% of cells are desorbing (releasing salt into brine stream)
- ~30% of cells are flushing (clearing brine)

**Result**: Continuous clean water output. No batch cycling, no downtime.

In the dual-scale architecture, the 12mm cells' ESP32-C3 MCUs coordinate the wave pattern. The 6mm cells' conductivity readings provide real-time feedback on wave effectiveness, allowing the 12mm coordinators to adjust wave speed and zone width dynamically.

### 6.2 Brine Separation

The wave-mode naturally separates clean water from brine. Feed water enters at one edge. As it passes through adsorbing zones, salt is removed. When zones switch to desorption, the brine-laden water is routed to a separate output channel by adjusting porosity:

```
Feed water >>> [ADSORB zone: gaps open to feed] >>> Clean water out
                         |
              [DESORB zone: gaps redirect to brine channel]
                         |
                    Brine out (concentrated salt)
```

The fabric reconfigures its gap widths in real-time to route flows. Adsorbing zones open their F_TOP gaps to the feed stream. Desorbing zones close their feed-side gaps and open their brine-side gaps. This is **programmable plumbing** — the same primitive that routes T-pieces through the structure now routes water.

### 6.3 Multi-Pass for Seawater

For high-salinity water (>10 g/L), a single pass isn't enough. The fabric folds into a serpentine path where water passes through multiple adsorbing zones:

```
Feed (35 g/L) >> Pass 1 (->25 g/L) >> Pass 2 (->17 g/L) >> Pass 3 (->10 g/L)
              >> Pass 4 (->5 g/L) >> Pass 5 (->2 g/L) >> Pass 6 (->0.5 g/L)
                                                                    |
                                                              Drinkable water
```

Each pass removes ~30-50% of remaining salt. Six passes reduce 35 g/L to potable levels. The accordion configuration (Section 4.3) naturally provides the serpentine path.

---

## 7. Integrated Sensing

### 7.1 Electrodes as Conductivity Sensors

Every CDI electrode is also a conductivity sensor — for free. Water conductivity is directly proportional to dissolved salt concentration:

```
sigma_water = k x TDS

where:
  sigma = conductivity (uS/cm)
  k ~ 2 uS/cm per mg/L for NaCl
  TDS = total dissolved solids (mg/L)
```

Measurement method: During the brief interval between CDI cycles (or during flush phase), the MCU applies a small AC signal across the electrode pair and measures the impedance.

```
Z_measured = V_excitation / I_response
sigma_water = cell_constant / Re(Z_measured)
```

**Resolution**: At 10-bit ADC, the fabric can distinguish ~1 mg/L TDS differences — far better than the 50 mg/L resolution of consumer TDS meters.

### 7.2 Spatial Salinity Map

With every cell pair measuring conductivity, the fabric builds a **real-time spatial salinity map** of the water passing through it:

```
Salinity map (color = TDS):

Input edge ->  [35] [35] [35] [35] [35]   <- High salinity
               [28] [25] [30] [27] [26]   <- Decreasing
               [18] [15] [20] [17] [16]
               [8]  [5]  [10] [7]  [6]
               [2]  [0.5][3]  [1]  [0.8]  <- Low salinity
                                    |
                             Output edge (clean)
```

The 6mm cells provide this map at ~6mm resolution — effectively a millimeter-scale salinity image of the water flow. The 12mm cells' compute capacity runs the optimization: cells in high-salinity zones get more voltage and tighter gaps. Cells near the output that are already clean reduce their voltage to save energy.

### 7.3 Contamination Detection

Beyond salt, the impedance spectroscopy can detect:
- **Heavy metals** (different impedance signature than NaCl)
- **Organic contamination** (affects capacitive response)
- **Biological growth / biofilm** (changes electrode impedance over time)
- **Electrode degradation** (capacitance decreases with fouling)

The fabric doesn't just purify — it characterizes the water at every point.

---

## 8. Membrane-Enhanced CDI (MCDI)

### 8.1 The Efficiency Leap

Standard CDI wastes energy during desorption: some ions released from the cathode migrate to the anode (and vice versa) rather than being flushed out. **Membrane CDI (MCDI)** adds thin ion-exchange membranes over each electrode:

- **Cation exchange membrane (CEM)** over the cathode: only Na+ can pass through
- **Anion exchange membrane (AEM)** over the anode: only Cl- can pass through

This prevents co-ion expulsion during desorption, improving:
- Salt removal per cycle: **2-3x higher**
- Energy efficiency: **30-50% improvement**
- Charge efficiency: 85-95% (vs. 60-80% for bare CDI)

### 8.2 Integration with Fabric

Ion-exchange membranes are thin films (~50-100 um). They could be applied directly over the activated carbon coating on F_TOP faces:

```
Crossbar body (PETG/nylon)
    |
    +-- F_TOP surface
    |     +-- Activated carbon layer (0.1mm)
    |     +-- Ion-exchange membrane (0.05-0.1mm)
    |
    +-- (other faces unchanged)
```

Total added thickness: 0.15-0.2mm. At 6mm and 12mm cell scales, this is well within the gap tolerance.

**Manufacturing**: Apply AC slurry coating, dry, then laminate IEM film. Commercial IEM films (Fumasep, Neosepta) are available in rolls. Cut to crossbar-face size and adhesive-bond.

**Which membrane where**: In alternating polygon rows (Section 4.1), every cathode row gets CEM, every anode row gets AEM. The fabric's coordinator knows each cell's polarity assignment and can verify correct membrane placement via impedance signature (IEMs have distinct impedance characteristics).

### 8.3 MCDI Performance (2.5x Improvement)

| Configuration | Brackish (MCDI) | Seawater (MCDI, multi-pass) | Daily (8hr, brackish) |
|--------------|-----------------|---------------------------|----------------------|
| **6mm, 65K** | **5.8 L/hr** | 0.25 L/hr | **46 L** |
| 12mm, 100K | 27 L/hr | 1.2 L/hr | 216 L |
| 12mm, 1M | 270 L/hr | 11.8 L/hr | 2,160 L |
| 12mm, 10M | 2,700 L/hr | 118 L/hr | 21,600 L |
| 12mm, 100M | 27,000 L/hr | 1,175 L/hr | 216,000 L |
| **12mm, 1B** | **270,000 L/hr** | **11,750 L/hr** | **2,160,000 L** |

At 65K cells with MCDI: **46 liters/day from brackish water** — enough for 20+ people from a single wearable.

At 1B cells with MCDI: **2.16 million liters/day from brackish** — a municipal water supply. Even from seawater: **282,000 L/day** — enough for tens of thousands of people.

---

## 9. Self-Maintenance

### 9.1 Fouling Response

Electrode fouling (scale buildup, biofilm) is the primary failure mode of CDI systems. Traditional CDI requires chemical cleaning or electrode replacement. The fabric has three defenses:

**Defense 1 — Polarity reversal**: Periodically reverse electrode polarity beyond normal desorption. This electrochemically dissolves mineral scale. Standard CDI practice, but the fabric can target specific fouled cells rather than reversing the entire system.

**Defense 2 — Reconfigure around fouled zones**: The fabric detects fouling via impedance change (Section 7.3). Fouled cells are taken offline. Neighboring cells close their gaps and route water around the fouled zone. The fabric self-heals by exclusion — the same blast radius propagation that handles structural damage now handles electrode degradation.

```
Before fouling:    [A] [A] [A] [A] [A]    (all cells active)

After fouling:     [A] [A] [X] [A] [A]    (cell 3 fouled, detected via impedance)
                         ^  gap  ^
                    Neighbors widen gaps to maintain flow
                    Water routes around fouled cell

After self-repair: [A] [A] [R] [A] [A]    (cell 3 in recovery mode)
                    R = aggressive polarity reversal to clean
```

**Defense 3 — Physical reconfiguration**: In extreme fouling, the fabric physically disassembles the fouled region, routes the T-pieces to a "cleaning station" zone (a section running continuous polarity reversal with clean water), then reassembles them. The fouled electrodes are cleaned in-situ. This is unique to the fabric — no other CDI system can physically relocate its electrodes.

### 9.2 Electrode Lifetime

Activated carbon CDI electrodes typically last 500-2,000 cycles before significant capacity loss. At 12 cycles/hour, 8 hours/day:

```
Cycles per day:    96
Cycles per month:  2,880
Electrode life:    ~6-24 months
```

The fabric's impedance sensing detects capacity degradation long before failure. Degraded cells are gradually excluded from CDI duty and reassigned to structural or sensing roles. The fabric degrades gracefully rather than failing suddenly.

At massive scale (100M+ cells), statistical redundancy makes electrode degradation nearly invisible to overall performance — even if 10% of cells are degraded, the remaining 90% maintain output.

---

## 10. Waterproofing and Corrosion

### 10.1 The Problem

Saltwater is extremely corrosive. The fabric's magnets (NdFeB), electronics, and electrical contacts are all vulnerable. The activated carbon electrodes are naturally resistant, but everything else needs protection.

### 10.2 Selective Waterproofing Strategy

Not all parts of the cell contact water. The CDI architecture separates wet and dry zones:

| Zone | Water Contact? | Protection |
|------|---------------|-----------|
| F_TOP electrode surface | Yes (intentionally) | Activated carbon is water-compatible. Underlying metal needs corrosion-resistant current collector (titanium foil or carbon paper). |
| F_TOP electrical contacts (V+, DATA, TRIG) | Yes | Gold-plated contacts resist saltwater. Alternatively, relocate F_TOP signal contacts to the ends (near EP) where they can be sealed. |
| EP_L, EP_R | No (above waterline or sealed) | Standard contacts, no change needed |
| Crossbar PCB, MCU | No | Conformal coating (Parylene C or silicone) over entire PCB assembly. Standard practice for marine electronics. |
| Magnets (NdFeB) | Partial | Existing Ni-Cu-Ni plating provides ~1 year saltwater resistance. Epoxy overcoat extends to 5+ years. |
| Stem, flex zone | Partial | PETG/nylon body is water-resistant. Flex zone conductors need insulation (already present for EPM coil wires). |

At 6mm cell size, conformal coating is simpler — the entire cell can be dip-coated. At 12mm, selective coating of the PCB area is more practical.

### 10.3 Current Collector

The activated carbon coating needs an electrical connection to the cell's V+ bus. In standard CDI, this is a current collector — a conductive substrate between the carbon and the structural material.

| Material | Thickness | Resistance | Corrosion | Cost/cell (6mm) | Cost/cell (12mm) |
|----------|-----------|-----------|-----------|-----------------|-----------------|
| Carbon paper (Toray TGP-H-060) | 0.2 mm | 80 mOhm.cm | Excellent | ~$0.005 | ~$0.015 |
| Titanium foil | 0.05 mm | 42 uOhm.cm | Excellent | ~$0.01 | ~$0.03 |
| Graphite-loaded epoxy | 0.1 mm | 500 mOhm.cm | Good | ~$0.003 | ~$0.008 |

**Recommendation**: Carbon paper for prototypes (easy to cut and bond). Titanium foil for production (thinner, lower resistance, longer life).

---

## 11. 9D Space Extension

CDI operation maps cleanly to the existing fabric 9D coordinate space. Two new sigma modes are needed:

### 11.1 New Behavioral Modes

| Mode | Description | Power Tier |
|------|-------------|-----------|
| `deionize` | Electrode pair active — adsorbing or desorbing ions, controlled by voltage polarity | 1-2 |
| `deionize-flush` | Electrode pair inactive — gap open, flushing brine | 1 |

These compose with existing modes. A cell in `deionize` mode with kappa = `directed` and chi = `load-bearing` is simultaneously purifying water AND carrying structural load. CDI is not an exclusive mode — it runs in parallel with structural function.

### 11.2 New delta Signals

| Signal | Type | Source |
|--------|------|--------|
| `conductivity` | float (uS/cm) | Impedance measurement across electrode pair |
| `electrode_capacitance` | float (F) | EIS measurement during idle phase (fouling indicator) |
| `water_flow_rate` | float (estimated) | Derived from conductivity change rate |

### 11.3 Catalog Patterns

Estimated CDI catalog additions: ~20-40 patterns, covering combinations of:
- sigma: `deionize`, `deionize-flush` (x existing structural modes)
- kappa: `autonomous` (self-optimizing), `directed` (coordinator-assigned)
- chi: `load-bearing`, `hinge`, `sensor` (CDI-compatible structural roles)
- Polarity: cathode, anode (parameterized in delta, not a new dimension)

The patterns are few because CDI is a simple electrochemical process — the complexity lives in the coordination, not the individual cell behavior.

---

## 12. Deployment Scenarios

### 12.1 Personal Wearable (6mm, 65K cells)

A 6mm fabric worn as a torso wrap, vest, or integrated into a backpack. Total area ~1.5m x 1.5m (folded into multi-layer garment form).

**Capabilities**:
- CDI: 2.3 L/hr brackish (5.8 L/hr MCDI) — personal hydration from any brackish source
- Sensing: Millimeter-resolution conductivity, contamination detection
- Communication: Fast L3 relay, acts as a body-area network
- Energy: Harvests solar (7.8W outdoor) + body heat/motion
- Compute: 65K small MCUs — sufficient for local optimization and sensing

**Use case**: Soldier, field researcher, disaster responder. Walk to a river, dip the edge in, drink clean water continuously. No filters to replace, no batteries to charge, no pumps.

### 12.2 Field Unit (12mm, 100K cells)

A rolled tube or folded accordion, carried in a pack or mounted on a vehicle. Approximately 0.5m x 0.5m when packed.

**Capabilities**:
- CDI: 10.8 L/hr brackish (27 L/hr MCDI) — 216 L/day, sustains 100+ people
- Compute: 100K ESP32-C3s = 16 THz aggregate, 40 GB distributed SRAM
- Solar: 48W harvest, 28W surplus after CDI
- Self-maintaining, self-optimizing

**Use case**: Forward operating base, refugee camp, remote village. Deploy once, produces water indefinitely.

### 12.3 Community Installation (12mm, 1M cells)

Permanent panels installed at a water source — coastal aquifer wellhead, river intake, or brackish lake.

**Capabilities**:
- CDI: 108 L/hr brackish (270 L/hr MCDI) — 2,160 L/day, serves a village
- Seawater: 4.7 L/hr (11.8 MCDI) — survival-grade from ocean
- Compute: 160 THz, 400 GB SRAM — runs local AI, environmental monitoring
- Solar: 480W harvest, 280W surplus

**Use case**: Off-grid community, island, coastal settlement. Replaces diesel-powered RO system with zero-maintenance fabric panels.

### 12.4 Infrastructure Scale (12mm, 100M cells)

Building-scale or field-scale installation. Multiple interconnected fabric panels spanning tens to hundreds of square meters.

**Capabilities**:
- CDI: 10,800 L/hr brackish (27,000 L/hr MCDI) — 216,000 L/day
- Seawater: 470 L/hr (1,175 MCDI) — 28,200 L/day, a small town
- Compute: 16 PHz, 40 TB SRAM — legitimate supercomputer
- Solar: 48 kW harvest, 28 kW surplus — powers adjacent infrastructure
- All 11 emergent capabilities at full expression

**Use case**: Town-scale water infrastructure. Also functions as: communication relay (phased array), environmental sensor network, distributed compute platform. The water plant is also the data center and the communication tower.

### 12.5 Municipal Scale (12mm, 1B cells)

Large-scale installation. This is infrastructure: acres of fabric panels, or fabric integrated into building surfaces, roads, or dedicated water-treatment structures.

**Capabilities**:
- CDI: 108,000 L/hr brackish (270,000 L/hr MCDI) — **2.16 million L/day**
- Seawater: 4,700 L/hr (11,750 MCDI) — **282,000 L/day from ocean**
- Compute: 160 PHz, 400 TB SRAM — top-100 supercomputer equivalent
- Solar: 480 kW harvest, 280 kW surplus
- All emergent capabilities at extreme scale

**Use case**: Municipal water supply for tens of thousands. No moving parts, no membranes to replace, no chemical treatment. The entire system is self-powered, self-monitoring, self-maintaining. A coastal city wraps its seawall in fabric — it desalinates seawater, monitors structural integrity, provides mesh networking, and runs distributed AI. One material, all functions.

### 12.6 Spacecraft / Habitat

In closed-loop life support, water must be continuously recycled. A fabric lining the habitat walls purifies gray water while simultaneously providing structural insulation, environmental sensing, and radiation monitoring (magnetometer). The fabric is the wall, the water purifier, and the sensor network — one system, not three.

---

## 13. Compute at Scale

An emergent property of large-scale CDI deployment: the compute capacity is staggering.

| Scale (12mm) | Aggregate Clock | Distributed SRAM | Rough Equivalent |
|-------------|----------------|-------------------|-----------------|
| 100K | 16 THz | 40 GB | Cluster of workstations |
| 1M | 160 THz | 400 GB | Small HPC cluster |
| 10M | 1.6 PHz | 4 TB | Mid-tier supercomputer |
| 100M | 16 PHz | 40 TB | Major supercomputer |
| 1B | 160 PHz | 400 TB | Top-100 global ranking |

This compute runs the CDI optimization (wave scheduling, per-cell voltage tuning, salinity mapping) but has massive surplus for other tasks: mesh networking, environmental AI, distributed storage, edge computing.

The water purification system is also a data center. The data center is also a water purification system. Neither function degrades the other — CDI uses electrode circuits, compute uses the MCU, and solar powers both.

---

## 14. Scaling Laws

| Parameter | Scaling | 6mm 65K | 12mm 100K | 12mm 1M | 12mm 100M | 12mm 1B |
|-----------|---------|---------|-----------|---------|-----------|---------|
| Salt removal | O(N) | 3.5 g/hr | 16.2 g/hr | 162 g/hr | 16.2 kg/hr | 162 kg/hr |
| Electrode area | O(N) | 390 m^2 | 9,000 m^2 | 90,000 m^2 | 9M m^2 | 90M m^2 |
| Sensing resolution | O(N) | 6mm grid | 12mm grid | 12mm grid | 12mm grid | 12mm grid |
| Energy surplus | O(N) | +3.5 W | +28 W | +280 W | +28 kW | +280 kW |
| Compute | O(N) | Modest | 16 THz | 160 THz | 16 PHz | 160 PHz |
| Fouling resilience | O(N) | Low | Good | Good | Excellent | Excellent |
| Optimization quality | ~O(log N) | Basic | Good | Good | Excellent | Excellent |
| CDI material cost | ~$0.02/cell | $1,300 | $2,000 | $20,000 | $2M | $20M |

**Key insight**: CDI performance scales linearly with cell count. Unlike the emergent capabilities in EMERGENT-CAPABILITIES.md (where capabilities interact super-linearly), CDI is fundamentally an extensive property — twice the cells, twice the water. The fabric's contribution is not making CDI more efficient per cell, but making it **adaptive, self-powered, self-maintaining, spatially intelligent, and dual-purpose** (water + compute).

---

## 15. Limitations and Honest Assessment

### 15.1 What This Is Not

- **Not a replacement for municipal RO plants (at small scale).** A 65K-cell 6mm fabric produces ~2.3 L/hr. A small RO plant produces 10,000+ L/hr. The fabric serves individuals and small groups at this scale. However, at 1B 12mm cells, the fabric approaches municipal RO output from seawater — and surpasses it from brackish sources.

- **Not a seawater silver bullet at small scale.** CDI is energy-intensive at high salinity. A 65K-cell 6mm fabric produces ~0.1 L/hr from seawater — drip-rate. For seawater at wearable scale, CDI is marginal. The sweet spot is **brackish water** (river deltas, coastal aquifers, contaminated wells). At 100M+ cells, seawater becomes viable.

- **Not zero-cost.** The activated carbon coating, current collector, and optional IEM membranes add ~$0.02/cell. For a 65K 6mm fabric, that's ~$1,300 in CDI materials on top of the base fabric cost.

### 15.2 Real Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| AC electrode degradation | ~6-24 month lifespan | Self-monitoring, graceful degradation, eventual recoating |
| Saltwater corrosion | Electronics at risk | Conformal coating, sealed dry zones |
| Heavy metal removal | CDI removes ions by charge, not by chemistry | Pre-treatment stage or AC adsorption (AC naturally adsorbs many heavy metals) |
| Biological contamination | CDI does not kill bacteria/viruses | Post-treatment UV or electrolytic chlorination (see 15.3) |
| Cold weather | Freezing stops operation | Fabric can generate heat via coils (Tier 3 mode) to prevent freezing |
| Nighttime operation | No solar harvest | Operate from supercapacitor reserves. At large scale, surplus daytime energy charges buffer banks. |

### 15.3 Biological Safety Gap

CDI removes dissolved salts. It does **not** remove:
- Bacteria
- Viruses
- Protozoa (Giardia, Cryptosporidium)

For water safety, CDI must be paired with disinfection. Options within the fabric architecture:
- **UV-C LEDs** on tau=`sensor` cells (a few dozen needed per installation)
- **Solar pasteurization** (the fabric in a shallow trough heats water to 65C using focused sunlight + dark surface)
- **Electrolytic chlorination** (the electrodes can generate trace chlorine from the NaCl being removed — this is essentially electrolysis, which happens naturally if voltage exceeds 1.23V during desorption)

The electrolytic chlorination option is particularly elegant: during the desorption phase, briefly exceeding the electrolysis voltage generates hypochlorite (bleach) from the very salt being removed. The brine stream becomes self-disinfecting, and trace chlorine in the output provides residual disinfection. This needs careful voltage control to avoid producing too much chlorine — but the fabric has per-cell voltage control and real-time conductivity sensing.

---

## 16. Open Research Questions

1. **Optimal electrode material for small-cell geometry**: At 6mm, the electrode face is only 6 mm^2. Is activated carbon the best choice at this scale, or would carbon aerogel / MXene / rGO coatings significantly improve capacity per cell? The cost-performance tradeoff shifts when electrodes are tiny.

2. **Flow dynamics in variable-gap CDI**: No CDI system has ever had dynamically adjustable electrode spacing. What is the optimal gap-width control strategy as a function of salinity? Does the distributed computing mesh discover better strategies than static optimization?

3. **Interweave electrode topology**: What is the optimal ratio of 6mm to 12mm cells for CDI? Is it better to maximize 6mm density (more electrode pairs) or 12mm density (more compute for optimization)? Does the answer change with salinity?

4. **Hybrid CDI + electrolysis**: Can the fabric seamlessly transition between CDI mode (below 1.23V, ion removal) and electrolysis mode (above 1.23V, chlorine generation) to simultaneously purify and disinfect? What's the optimal voltage cycling profile?

5. **Biological fouling at small scale**: Do the fabric's mechanical vibration capabilities (stem oscillation, peristaltic waves) help prevent biofilm formation at 6mm and 12mm electrode spacing? Can the echolocation capability detect biofilm thickness?

6. **CDI + metamaterial synergy**: Can the fabric's programmable acoustic impedance (metamaterial property) drive ultrasonic cleaning of fouled electrodes while CDI is operating in adjacent zones?

7. **Scalability of wave-mode CDI**: Does the traveling-wave CDI approach (Section 6) maintain efficiency as fabric size scales to 100M+ cells? Is there an optimal wave speed and zone width at each scale?

8. **Body-heat CDI**: Can a 6mm torso-worn fabric use body heat (not just solar) to run CDI? The temperature gradient between body (37C) and ambient could drive thermoelectric harvesting at the wearable scale.

9. **Concurrent compute + CDI load balancing**: At 100M+ cells, how should the compute mesh balance CDI optimization workloads vs. external compute tasks? Does dedicating more compute to CDI optimization improve water output enough to justify the opportunity cost?

---

*The Seshat Fabric was designed to be programmable matter. Water purification was not a design goal. But the primitives — programmable electrodes, variable porosity, distributed sensing, self-powered operation — are exactly what CDI needs. Adding ~$0.02/cell of activated carbon turns every inter-polygon bond into a desalination cell. At 6mm scale, it's a wearable personal water purifier. At 12mm and a billion cells, it's a municipal water supply and a supercomputer in the same material. The fabric doesn't just purify water — it knows exactly how clean the water is at every point, optimizes its own operation in real-time, maintains itself against fouling, powers the entire process from sunlight, and runs a datacenter with the surplus compute. This is what happens when a spatial computer meets electrochemistry.*

*See also:*
- *[EMERGENT-CAPABILITIES.md](../EMERGENT-CAPABILITIES.md) — The 11 zero-hardware capabilities*
- *[MATHEMATICAL-FOUNDATIONS.md](../MATHEMATICAL-FOUNDATIONS.md) — Physics and axiom system*
- *[POWER-BUDGET.md](../physics/POWER-BUDGET.md) — Energy harvest and storage*
- *[T-PIECE-SPEC.md](../fabrication/T-PIECE-SPEC.md) — Cell geometry and electrical contacts*
